"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { useAuth } from "@/app/crm/useAuth";
import { isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";

function safePostLoginPath(raw: string | null): string | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return null;
  if (!s.startsWith("/internal/")) return null;
  if (s.includes("..")) return null;
  return s;
}

function LoginPageInner() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => safePostLoginPath(searchParams.get("next")), [searchParams]);

  const { auth, authError, signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const firebaseReady = isFirebaseConfigured();
  const googleAuthEnabled = isGoogleAuthEnabled();

  useEffect(() => {
    if (auth.status === "signed-in") {
      router.replace(nextPath ?? "/?view=app");
    }
  }, [auth.status, router, nextPath]);

  const onGoogleClick = async () => {
    setLocalError(null);

    if (!googleAuthEnabled) {
      setLocalError(t("register.errorGoogleDisabled"));
      return;
    }

    if (!firebaseReady) {
      setLocalError(t("auth.loginFirebaseEnvHint"));
      return;
    }

    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const displayError = localError ?? authError;

  return (
    <div className="relative flex min-h-[100dvh] min-h-[100svh] flex-col overflow-x-hidden text-slate-100">
      <InspirationalBackdrop />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[0] bg-[radial-gradient(780px_440px_at_10%_-4%,rgba(56,189,248,0.095),transparent_56%),radial-gradient(680px_420px_at_100%_4%,rgba(139,92,246,0.078),transparent_54%),radial-gradient(520px_360px_at_50%_96%,rgba(30,27,75,0.06),transparent_58%)] opacity-[0.97]"
      />

      <header className="relative z-10 border-b border-white/[0.09] bg-[#050a14]/94 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/?view=landing"
            className="inline-flex touch-manipulation items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-slate-300 transition hover:border-sky-400/28 hover:bg-white/[0.08] hover:text-slate-100"
          >
            <span aria-hidden>←</span> 홈
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-[max(1rem,calc(env(safe-area-inset-left,1rem)))] pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom,0px)))] pr-[max(1rem,calc(env(safe-area-inset-right,1rem)))] pt-8 sm:pt-12">
        <div className="mx-auto w-full max-w-[min(36rem,calc(100vw-28px))]">
          <div className="mb-6 flex flex-col items-center text-center">
            <SensoraAnimatedMark size={52} animated={false} className="shrink-0 drop-shadow-[0_0_24px_-4px_rgba(56,189,248,0.35)]" aria-hidden />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Sensora · Auto CRM</p>
            <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-[1.75rem]">{t("auth.loginTitle")}</h1>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">{t("auth.loginSubtitle")}</p>
          </div>

          <div className="sensora-premium-card relative rounded-[24px] border border-white/[0.1] bg-[#050f1a]/75 px-6 py-8 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-10 sm:py-10">
            {auth.status === "loading" && !busy ? (
              <p className="text-center text-sm text-slate-400">{t("auth.checkingLogin")}</p>
            ) : (
              <>
                <button
                  type="button"
                  disabled={busy || auth.status === "signed-in"}
                  onClick={() => void onGoogleClick()}
                  className="sensora-premium-primary-workspace flex w-full min-h-[52px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition enabled:touch-manipulation enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "연결 중…" : t("cta.emailLogin")}
                </button>

                <p className="mt-6 text-center text-sm leading-relaxed text-slate-400">{t("auth.loginPostButtonNote")}</p>
                <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">{t("auth.loginBetaPrompt")}</p>

                {displayError ? (
                  <p className="mt-4 rounded-lg border border-red-500/25 bg-red-950/40 px-3 py-2 text-center text-xs leading-relaxed text-red-200" role="alert">
                    {displayError}
                  </p>
                ) : null}

                <div className="mt-8 border-t border-white/[0.08] pt-6 text-center">
                  <p className="text-sm text-slate-500">아직 베타 신청 전이라면?</p>
                  <Link href="/join" prefetch={false} className="mt-3 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-sky-300 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-200">
                    {t("register.access.goJoin")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[#050a14] px-4 text-slate-400">
          <p className="text-sm">{t("auth.checkingLogin")}</p>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
