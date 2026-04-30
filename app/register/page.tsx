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

const JOIN_REDIRECT_PENDING = "customer-manager.join.redirectPending";

type JoinStep = "intro" | "card" | "done";

export default function JoinPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState<JoinStep>("intro");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const googleAuthEnabled = isGoogleAuthEnabled();
  const { t } = useLanguage();

  const seller = useSellerProfile(uid);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
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
          await ensureSellerNeedsCard(res.user.uid, res.user.email);
          setStep("card");
          setError(null);
        } else if (pending) {
          await new Promise((r) => window.setTimeout(r, 800));
          const u = auth.currentUser;
          if (!cancelled && u) {
            await ensureSellerNeedsCard(u.uid, u.email);
            setStep("card");
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!uid) return;
    void ensureSellerNeedsCard(uid).then(() => {
      setStep((s) => {
        if (s === "done") return "done";
        return s === "intro" ? "card" : s;
      });
    });
  }, [uid]);

  useEffect(() => {
    if (!uid || seller.loading) return;
    if (seller.profile && sellerCanUseApp(seller.profile)) router.replace("/");
  }, [uid, seller.loading, seller.profile, router]);

  const signInWithGoogle = async () => {
    setError(null);
    if (!googleAuthEnabled) {
      setError("현재 Google 로그인은 잠시 꺼져 있습니다(준비중).");
      return;
    }
    if (!isFirebaseConfigured()) {
      setError("Firebase 미설정: .env.local 확인.");
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
    if (!file) {
      setError("명함 이미지를 선택해 주세요.");
      return;
    }
    if (!isFirebaseConfigured()) {
      setError("Firebase 미설정.");
      return;
    }
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) {
      setError("먼저 Google 계정으로 로그인해 주세요.");
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
          console.warn("[join] business-card-notify:", res.status, await res.text());
        }
      } catch (notifyErr) {
        console.warn("[join] business-card-notify:", notifyErr);
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패.");
    } finally {
      setBusy(false);
    }
  };

  const profile = seller.profile;
  const awaitingReview = profile?.approvalStatus === "pending";
  const wasRejected = profile?.approvalStatus === "rejected";

  const showGoogleIntro = step === "intro" && !uid && !awaitingReview;

  const showUpload =
    !!uid &&
    !seller.loading &&
    !seller.error &&
    !awaitingReview &&
    step !== "done" &&
    (profile == null || profile.approvalStatus === "needs_card" || wasRejected);

  return (
    <main className="relative flex min-h-[100dvh] min-h-[100svh] flex-col overflow-x-hidden bg-[#ebe5dc] px-[max(1.15rem,env(safe-area-inset-left))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1.15rem,env(safe-area-inset-right))] pt-[max(1.1rem,env(safe-area-inset-top))] text-[#2a251f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_92%_at_48%_-6%,rgba(255,252,246,0.96),transparent_54%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_82%_50%_at_103%_-2%,rgba(255,218,178,0.18),transparent_58%)]" />

      <div className="relative z-[1] mx-auto w-full max-w-md">
        <header className="mb-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#584d42]">
            SENSORA AUTO CRM · SELLER ONBOARDING
          </p>
          <h1 className="mt-2 font-semibold tracking-tight text-xl text-[#231d18] sm:text-[1.35rem]">
            {t("register.title")}(명함 접수)
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#4c433a]">
            {googleAuthEnabled ? (
              <>
                <span className="font-semibold">Google로 로그인</span>한 뒤 영업 명함 이미지를 올려 주세요. 운영이 확인 후{" "}
                <span className="font-semibold">승인</span>하면 CRM이 열립니다. SMS 발신 요금 없음.
              </>
            ) : (
              <>
                현재 <span className="font-semibold">Google 로그인/등록 기능은 잠시 준비중</span>입니다. 바로 사용해 보시려면 메인 화면에서{" "}
                <span className="font-semibold">로컬 저장(MVP)</span> 모드로 먼저 사용해 주세요.
              </>
            )}
          </p>
        </header>

        <div className="rounded-2xl border border-black/10 bg-white/92 p-6 shadow-[0_20px_50px_-18px_rgba(60,50,42,0.28)] backdrop-blur-sm">
          {!isFirebaseConfigured() ? (
            <p className="text-sm text-red-800">
              로컬에 <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_FIREBASE_*</code> 를 넣어 주세요.
            </p>
          ) : null}

          {seller.loading && uid ? (
            <p className="py-10 text-center text-sm text-[#584d42]">가입 상태를 불러오는 중…</p>
          ) : null}

          {seller.error ? (
            <div className="mb-5 rounded-xl border border-amber-800/35 bg-amber-500/12 px-3 py-2.5 text-[13px] text-amber-950">
              {seller.error}
            </div>
          ) : null}

          {awaitingReview && step !== "done" ? (
            <div className="space-y-4 text-left text-[#39322c]">
              <p className="font-semibold">명함 접수되어 검토 중입니다.</p>
              <p className="text-sm leading-relaxed text-[#4a433b]">
                승인이 완료되면 메인 페이지에서 바로 이용할 수 있어요.
              </p>
              <Link
                href="/"
                className="inline-flex w-full justify-center rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] hover:opacity-95"
              >
                메인으로
              </Link>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="space-y-4 text-left text-[#3b342d]">
              <p className="font-semibold leading-relaxed">접수했습니다.</p>
              <p className="text-sm leading-relaxed text-[#4a433b]">
                승인 전까지 같은 Google 계정으로 로그인해 두면, 승인 직후 수첩이 열립니다.
              </p>
              <Link
                href="/"
                className="inline-flex w-full justify-center rounded-xl border border-black/14 bg-transparent px-4 py-3 text-sm font-semibold hover:bg-black/5"
              >
                시작 화면으로
              </Link>
            </div>
          ) : null}

          {showGoogleIntro && googleAuthEnabled ? (
            <div className="space-y-5 text-left text-sm leading-relaxed text-[#39322c]">
              <ul className="list-inside list-decimal gap-3 space-y-2.5 pl-1">
                <li>문자(SMS) 없이 Google 계정으로 본인 식별.</li>
                <li>영업 명함 이미지(앞면) 업로드.</li>
                <li>Spark 무료 한도 내에서 Firestore·Storage 사용을 권장합니다.</li>
              </ul>
              {error ? <p className="text-[13px] text-red-800">{error}</p> : null}
              <button
                type="button"
                disabled={busy}
                className="w-full rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] hover:opacity-95 disabled:opacity-55"
                onClick={() => void signInWithGoogle()}
              >
                {busy ? "이동 중…" : t("register.continueWithGoogle")}
              </button>
            </div>
          ) : null}

          {showUpload ? (
            <div className="space-y-5 text-left">
              <p className="text-[13px] leading-relaxed text-[#3b342d]">
                {wasRejected
                  ? "다시 접수합니다. 업로드를 완료해 주세요."
                  : "명함 한 장 분량이 잘 나오도록 촬영한 이미지를 올려 주세요."}
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
                className="w-full rounded-xl bg-[#2f2720] px-4 py-3 text-sm font-semibold text-[#fcf9f3] disabled:opacity-55"
                onClick={() => void uploadCard()}
              >
                {busy ? "업로드 중…" : "명함 제출 후 검토 요청"}
              </button>
            </div>
          ) : null}
        </div>

        <footer className="mt-10 text-center text-[11px] leading-relaxed text-[#766b5f]">
          Sensora · Sensora Auto CRM. SMS 비용 없음. Firebase Spark(무료) 한도는 사용량에 따릅니다.
        </footer>
      </div>
    </main>
  );
}
