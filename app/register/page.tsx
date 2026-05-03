"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithRedirect,
} from "firebase/auth";
import { useEffect, useState } from "react";

import {
  ensureSellerNeedsCard,
  submitBusinessCardPending,
} from "@/app/crm/sellerProfile";
import { sellerCanUseApp, useSellerProfile } from "@/app/crm/useSellerProfile";
import { getFirebaseAuth, getFirebaseStorageBucket, isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { normalizeEmailForBetaAccess, postBetaAccessCheck } from "@/lib/betaAccess";

type BetaGate = "idle" | "checking" | "approved" | "pending" | "rejected" | "not_found" | "error";

const JOIN_REDIRECT_PENDING = "customer-manager.join.redirectPending";

type JoinStep = "intro" | "card" | "done";

export default function RegisterPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [betaGate, setBetaGate] = useState<BetaGate>("idle");
  const [step, setStep] = useState<JoinStep>("intro");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const googleAuthEnabled = isGoogleAuthEnabled();
  const { t } = useLanguage();

  const seller = useSellerProfile(uid);
  const firebaseConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseConfigured) return;
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
      setUserEmail(u?.email ?? null);
    });
    return () => unsub();
  }, [firebaseConfigured]);

  useEffect(() => {
    if (!firebaseConfigured) return;
    let cancelled = false;
    const auth = getFirebaseAuth();
    void (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const res = await getRedirectResult(auth);
        const pending =
          typeof window !== "undefined" && window.sessionStorage.getItem(JOIN_REDIRECT_PENDING);
        if (typeof window !== "undefined") window.sessionStorage.removeItem(JOIN_REDIRECT_PENDING);

        if (cancelled) return;
        if (res?.user) {
          setError(null);
        } else if (pending) {
          await new Promise((r) => window.setTimeout(r, 800));
          const u = auth.currentUser;
          if (!cancelled && !u) {
            setError(
              "로그인 후 계정 확인에 실패했습니다. 브라우저 저장소 차단 여부를 확인한 뒤 다시 시도해 주세요.",
            );
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firebaseConfigured]);

  useEffect(() => {
    if (!firebaseConfigured) {
      return;
    }
    if (!uid) {
      setBetaGate("idle");
      return;
    }

    const emailNorm = normalizeEmailForBetaAccess(userEmail ?? "");
    if (!emailNorm) {
      setBetaGate("not_found");
      return;
    }

    let cancelled = false;
    setBetaGate("checking");

    void (async () => {
      const access = await postBetaAccessCheck(emailNorm);
      if (cancelled) return;

      if (!access.ok) {
        if (!cancelled) setBetaGate("error");
        return;
      }

      if (access.status !== "approved") {
        if (!cancelled) setBetaGate(access.status);
        return;
      }

      try {
        await ensureSellerNeedsCard(uid, userEmail);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setBetaGate("error");
        }
        return;
      }

      if (cancelled) return;
      setBetaGate("approved");
      setStep((s) => {
        if (s === "done") return "done";
        return s === "intro" ? "card" : s;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [firebaseConfigured, uid, userEmail]);

  useEffect(() => {
    if (!uid || seller.loading || betaGate !== "approved") return;
    if (seller.profile && sellerCanUseApp(seller.profile)) router.replace("/");
  }, [uid, seller.loading, seller.profile, router, betaGate]);

  const signInWithGoogle = async () => {
    setError(null);
    if (!googleAuthEnabled) {
      setError(t("register.errorGoogleDisabled"));
      return;
    }
    if (!firebaseConfigured) {
      setError(t("register.errorFirebaseEnv"));
      return;
    }
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      await setPersistence(auth, browserLocalPersistence);
      if (typeof window !== "undefined") window.sessionStorage.setItem(JOIN_REDIRECT_PENDING, "1");
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const uploadCard = async () => {
    setError(null);
    if (betaGate !== "approved") {
      setError(t("register.access.errorTitle"));
      return;
    }
    if (!file) {
      setError(t("register.errorPickCard"));
      return;
    }
    if (!firebaseConfigured) {
      setError(t("register.errorFirebaseEnv"));
      return;
    }
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) {
      setError(t("register.errorLoginFirst"));
      return;
    }
    setBusy(true);
    try {
      const { ref, uploadBytes } = await import("firebase/storage");
      const storage = getFirebaseStorageBucket();
      const ext = /\.(jpg|jpeg|png|webp)$/i.exec(file.name)?.[1]?.toLowerCase() ?? "jpg";
      const path = `seller-cards/${u.uid}/card_${Date.now()}.${ext}`;
      const r = ref(storage, path);
      await uploadBytes(r, file);
      await submitBusinessCardPending(u.uid, path);
      try {
        const idToken = await u.getIdToken();
        const res = await fetch("/api/business-card-notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ storagePath: path }),
        });
        if (!res.ok && res.status !== 503) {
          await res.text().catch(() => "");
          console.warn("[register] business-card-notify failed", res.status);
        }
      } catch {
        console.warn("[register] business-card-notify request failed");
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("register.errorUploadFailed"));
    } finally {
      setBusy(false);
    }
  };

  const profile = seller.profile;
  const awaitingReview = betaGate === "approved" && profile?.approvalStatus === "pending";
  const wasRejected = betaGate === "approved" && profile?.approvalStatus === "rejected";

  const showGoogleIntro =
    step === "intro" && !uid && !awaitingReview && betaGate !== "checking";

  const showUpload =
    betaGate === "approved" &&
    !!uid &&
    !seller.loading &&
    !seller.error &&
    !awaitingReview &&
    step !== "done" &&
    (profile == null || profile.approvalStatus === "needs_card" || wasRejected);

  const betaDenyTitle =
    betaGate === "pending"
      ? t("register.access.pendingTitle")
      : betaGate === "not_found"
        ? t("register.access.notFoundTitle")
        : betaGate === "rejected"
          ? t("register.access.rejectedTitle")
          : betaGate === "error"
            ? t("register.access.errorTitle")
            : "";
  const betaDenyBody =
    betaGate === "pending"
      ? t("register.access.pendingBody")
      : betaGate === "not_found"
        ? t("register.access.notFoundBody")
        : betaGate === "rejected"
          ? t("register.access.rejectedBody")
          : betaGate === "error"
            ? t("register.access.errorBody")
            : "";

  const trustBlock = (
    <div
      className="space-y-2 rounded-xl border border-black/10 bg-[#faf7f3] px-4 py-3.5 text-left text-[12px] leading-[1.65] text-[#4c433a] max-sm:py-3"
      role="note"
    >
      <p className="font-medium text-[#312a24]">{t("register.trustNoticeLine1")}</p>
      <p>{t("register.trustNoticeLine2")}</p>
    </div>
  );

  if (!firebaseConfigured) {
    return (
      <main className="relative flex min-h-[100dvh] min-h-[100svh] flex-col overflow-x-hidden bg-[#ebe5dc] px-[max(1rem,env(safe-area-inset-left))] pb-[max(1.75rem,calc(8rem+env(safe-area-inset-bottom,0px)))] max-sm:pb-[max(1.75rem,calc(8.5rem+env(safe-area-inset-bottom,0px)))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.25rem,env(safe-area-inset-top))] text-[#2a251f]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_92%_at_48%_-6%,rgba(255,252,246,0.96),transparent_54%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_82%_50%_at_103%_-2%,rgba(255,218,178,0.18),transparent_58%)]" />

        <div className="relative z-[1] mx-auto w-full max-w-md">
          <div className="mb-6 max-sm:mb-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#584d42] transition hover:text-[#231d18]"
            >
              <span aria-hidden>←</span> {t("join.backHome")}
            </Link>
            <p className="mt-6 text-[11px] font-semibold tracking-[0.14em] text-[#584d42]">SENSORA · AUTO CRM</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#231d18] sm:text-[1.35rem]">
              {t("register.fallbackUnavailableTitle")}
            </h1>
            <p className="mt-3 max-w-[min(100%,40rem)] text-pretty text-sm leading-relaxed text-[#4c433a] whitespace-pre-line max-sm:max-w-none">
              {t("register.fallbackUnavailableBody")}
            </p>
          </div>

          <div className="mb-5 max-sm:mb-4">{trustBlock}</div>

          <div className="rounded-[1.35rem] border border-black/10 bg-white/92 p-6 shadow-[0_20px_50px_-18px_rgba(60,50,42,0.28)] backdrop-blur-sm sm:p-8">
            <Link
              href="/join"
              className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] hover:opacity-95"
            >
              {t("register.linkBetaSignup")}
            </Link>
            {process.env.NODE_ENV !== "production" ? (
              <p
                className="mt-4 rounded-xl border border-dashed border-amber-800/35 bg-amber-500/10 px-3 py-2.5 text-left text-[11px] leading-relaxed text-amber-950"
                role="status"
              >
                {t("register.firebaseDevHint")}
              </p>
            ) : null}
          </div>

          <footer className="mt-8 text-center text-[11px] leading-relaxed text-[#766b5f] max-sm:mt-7 max-sm:px-0.5 max-sm:leading-[1.55]">
            {t("register.footerNote")}
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[100dvh] min-h-[100svh] flex-col overflow-x-hidden bg-[#ebe5dc] px-[max(1rem,env(safe-area-inset-left))] pb-[max(1.75rem,calc(8rem+env(safe-area-inset-bottom,0px)))] max-sm:pb-[max(1.75rem,calc(8.5rem+env(safe-area-inset-bottom,0px)))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.25rem,env(safe-area-inset-top))] text-[#2a251f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_92%_at_48%_-6%,rgba(255,252,246,0.96),transparent_54%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_82%_50%_at_103%_-2%,rgba(255,218,178,0.18),transparent_58%)]" />

      <div className="relative z-[1] mx-auto w-full max-w-md">
        <div className="mb-6 max-sm:mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#584d42] transition hover:text-[#231d18]"
          >
            <span aria-hidden>←</span> {t("join.backHome")}
          </Link>
          <p className="mt-6 text-[11px] font-semibold tracking-[0.14em] text-[#584d42]">SENSORA · AUTO CRM</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#231d18] sm:text-[1.35rem]">
            {t("register.title")}
          </h1>
          <p className="mt-3 max-w-[min(100%,40rem)] text-pretty text-sm leading-relaxed text-[#4c433a] whitespace-pre-line max-sm:max-w-none">
            {t("register.intro")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#4c433a]">{t(googleAuthEnabled ? "register.flowLeadGoogleOn" : "register.flowLeadGoogleOff")}</p>
        </div>

        <div className="mb-5 max-sm:mb-4">{trustBlock}</div>

        <div className="rounded-[1.35rem] border border-black/10 bg-white/92 p-6 shadow-[0_20px_50px_-18px_rgba(60,50,42,0.28)] backdrop-blur-sm sm:p-8">
          {seller.loading && uid && betaGate === "approved" ? (
            <p className="py-10 text-center text-sm text-[#584d42]">{t("register.loadingProfile")}</p>
          ) : null}

          {betaGate === "checking" && uid ? (
            <p className="py-10 text-center text-sm text-[#584d42]" role="status">
              {t("register.access.checking")}
            </p>
          ) : null}

          {uid &&
          (betaGate === "pending" || betaGate === "not_found" || betaGate === "rejected" || betaGate === "error") ? (
            <div className="space-y-4 text-left text-[#39322c]">
              <p className="font-semibold">{betaDenyTitle}</p>
              <p className="text-sm leading-relaxed text-[#4a433b] whitespace-pre-line">{betaDenyBody}</p>
              <Link
                href="/join"
                className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] hover:opacity-95"
              >
                {t("register.access.goJoin")}
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl border border-black/14 bg-transparent px-4 py-3 text-sm font-semibold hover:bg-black/5"
              >
                {t("register.access.goHome")}
              </Link>
            </div>
          ) : null}

          {seller.error ? (
            <div className="mb-5 rounded-xl border border-amber-800/35 bg-amber-500/12 px-3 py-2.5 text-[13px] text-amber-950">
              {seller.error}
            </div>
          ) : null}

          {awaitingReview && step !== "done" ? (
            <div className="space-y-4 text-left text-[#39322c]">
              <p className="font-semibold">{t("register.pendingTitle")}</p>
              <p className="text-sm leading-relaxed text-[#4a433b]">{t("register.pendingBody")}</p>
              <Link
                href="/"
                className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] hover:opacity-95"
              >
                {t("register.linkMain")}
              </Link>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="space-y-4 text-left text-[#3b342d]">
              <p className="font-semibold leading-relaxed">{t("register.doneTitle")}</p>
              <p className="text-sm leading-relaxed text-[#4a433b]">{t("register.doneBody")}</p>
              <Link
                href="/"
                className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl border border-black/14 bg-transparent px-4 py-3 text-sm font-semibold hover:bg-black/5"
              >
                {t("register.linkWorkspace")}
              </Link>
            </div>
          ) : null}

          {showGoogleIntro && googleAuthEnabled ? (
            <div className="space-y-5 text-left text-sm leading-relaxed text-[#39322c]">
              <ul className="list-inside list-decimal space-y-2.5 pl-1 marker:font-semibold">
                <li>{t("register.stepIdentify")}</li>
                <li>{t("register.stepCard")}</li>
                <li>{t("register.stepInfrastructure")}</li>
              </ul>
              {error ? <p className="text-[13px] text-red-800">{error}</p> : null}
              <button
                type="button"
                disabled={busy}
                className="min-h-[48px] w-full touch-manipulation rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] hover:opacity-95 disabled:opacity-55"
                onClick={() => void signInWithGoogle()}
              >
                {busy ? t("register.busyRedirecting") : t("register.continueWithGoogle")}
              </button>
            </div>
          ) : null}

          {showGoogleIntro && !googleAuthEnabled ? (
            <div className="space-y-4 text-left text-sm leading-relaxed text-[#39322c]">
              <Link
                href="/"
                className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl border border-black/14 bg-transparent px-4 py-3 text-sm font-semibold hover:bg-black/5"
              >
                {t("register.linkMain")}
              </Link>
            </div>
          ) : null}

          {showUpload ? (
            <div className="space-y-5 text-left">
              <p className="text-[13px] leading-relaxed text-[#3b342d]">
                {wasRejected ? t("register.uploadLeadRetry") : t("register.uploadLead")}
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="w-full rounded-xl border border-dashed border-black/25 bg-[#faf7f4] px-3 py-3 text-sm file:rounded-lg file:border-0 file:bg-[#2f2720]/10 file:px-2 file:py-1.5 file:text-xs file:font-medium"
                onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
              />
              {error ? <p className="text-[13px] text-red-800">{error}</p> : null}
              <button
                type="button"
                disabled={busy}
                className="min-h-[48px] w-full touch-manipulation rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] disabled:opacity-55"
                onClick={() => void uploadCard()}
              >
                {busy ? t("register.busyUploading") : t("register.buttonSubmitCard")}
              </button>
            </div>
          ) : null}
        </div>

        <footer className="mt-8 text-center text-[11px] leading-relaxed text-[#766b5f] max-sm:mt-7 max-sm:px-0.5 max-sm:leading-[1.55]">
          {t("register.footerNote")}
        </footer>
      </div>
    </main>
  );
}
