"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { useAuth } from "@/app/crm/useAuth";
import { isEmailPasswordAuthEnabled, isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";

function safePostLoginPath(raw: string | null): string | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return null;
  if (!s.startsWith("/internal/")) return null;
  if (s.includes("..")) return null;
  return s;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPageInner() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => safePostLoginPath(searchParams.get("next")), [searchParams]);

  const { auth, authError, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, requestPasswordReset } =
    useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const firebaseReady = isFirebaseConfigured();
  const googleAuthEnabled = isGoogleAuthEnabled();
  const emailPasswordEnabled = isEmailPasswordAuthEnabled();

  useEffect(() => {
    if (auth.status === "signed-in") {
      router.replace(nextPath ?? "/?view=app");
    }
  }, [auth.status, router, nextPath]);

  useEffect(() => {
    setLocalError(null);
    setInfoMessage(null);
  }, [mode]);

  const onGoogleClick = async () => {
    setLocalError(null);
    setInfoMessage(null);

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
      await signInWithGoogle();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setInfoMessage(null);

    if (!firebaseReady) {
      setLocalError(t("auth.loginFirebaseEnvHint"));
      return;
    }
    if (!emailPasswordEnabled) {
      setLocalError(t("auth.loginEmailPasswordDisabled"));
      return;
    }

    const em = email.trim();
    if (!EMAIL_RE.test(em)) {
      setLocalError(t("join.invalidEmail"));
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setLocalError(t("auth.passwordTooShort"));
        return;
      }
      if (password !== password2) {
        setLocalError(t("auth.loginPasswordMismatch"));
        return;
      }
    } else if (password.length < 1) {
      setLocalError(t("auth.passwordRequired"));
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmailPassword(em, password);
      } else {
        await signUpWithEmailPassword(em, password);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const onForgotPassword = async () => {
    setLocalError(null);
    setInfoMessage(null);
    const em = email.trim();
    if (!em) {
      setLocalError(t("auth.loginEnterEmailFirst"));
      return;
    }
    if (!EMAIL_RE.test(em)) {
      setLocalError(t("join.invalidEmail"));
      return;
    }
    if (!firebaseReady) {
      setLocalError(t("auth.loginFirebaseEnvHint"));
      return;
    }
    if (!emailPasswordEnabled) {
      setLocalError(t("auth.loginEmailPasswordDisabled"));
      return;
    }
    setBusy(true);
    try {
      await requestPasswordReset(em);
      setInfoMessage(t("auth.loginResetSent"));
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const displayError = localError ?? authError;

  const inputClass =
    "sensora-premium-input mt-2 w-full min-h-[48px] rounded-xl border border-white/[0.12] bg-[#030b14]/80 px-3 py-3 text-[15px] text-slate-100 outline-none placeholder:text-slate-600";

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
                <div className="flex rounded-xl border border-white/[0.1] bg-[#030b14]/60 p-1">
                  <button
                    type="button"
                    className={`min-h-10 flex-1 rounded-lg text-sm font-semibold transition touch-manipulation ${mode === "signin" ? "bg-white/[0.1] text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                    onClick={() => setMode("signin")}
                  >
                    {t("auth.loginModeSignIn")}
                  </button>
                  <button
                    type="button"
                    className={`min-h-10 flex-1 rounded-lg text-sm font-semibold transition touch-manipulation ${mode === "signup" ? "bg-white/[0.1] text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                    onClick={() => setMode("signup")}
                  >
                    {t("auth.loginModeSignUp")}
                  </button>
                </div>

                {mode === "signup" ? (
                  <p className="mt-4 text-center text-[13px] leading-relaxed text-slate-400">{t("auth.loginCreateLead")}</p>
                ) : null}
                {mode === "signup" ? (
                  <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">{t("auth.loginCreateNote")}</p>
                ) : null}

                <form className="mt-6 space-y-4" onSubmit={(ev) => void onEmailSubmit(ev)} noValidate>
                  <div>
                    <label htmlFor="login-email" className="text-sm font-semibold text-slate-200">
                      {t("form.email")}
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="name@company.com"
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="text-sm font-semibold text-slate-200">
                      {t("auth.password")}
                    </label>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      disabled={busy}
                    />
                  </div>
                  {mode === "signup" ? (
                    <div>
                      <label htmlFor="login-password2" className="text-sm font-semibold text-slate-200">
                        {t("auth.passwordConfirm")}
                      </label>
                      <input
                        id="login-password2"
                        name="password2"
                        type="password"
                        autoComplete="new-password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        className={inputClass}
                        disabled={busy}
                      />
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={busy || auth.status === "signed-in"}
                    className="sensora-premium-primary-workspace mt-2 flex w-full min-h-[52px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition enabled:touch-manipulation enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? t("join.submitting") : mode === "signin" ? t("auth.loginEmailSubmit") : t("auth.loginCreateSubmit")}
                  </button>
                </form>

                {mode === "signin" ? (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onForgotPassword()}
                      className="text-[13px] font-semibold text-sky-300/95 underline decoration-sky-400/35 underline-offset-4 hover:text-sky-200 disabled:opacity-50 touch-manipulation"
                    >
                      {t("auth.loginForgotPassword")}
                    </button>
                  </div>
                ) : null}

                <p className="mt-6 text-center text-sm leading-relaxed text-slate-400">{t("auth.loginPostButtonNote")}</p>

                {infoMessage ? (
                  <p className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-950/35 px-3 py-2 text-center text-xs leading-relaxed text-emerald-100" role="status">
                    {infoMessage}
                  </p>
                ) : null}

                {displayError ? (
                  <p className="mt-4 rounded-lg border border-red-500/25 bg-red-950/40 px-3 py-2 text-center text-xs leading-relaxed text-red-200" role="alert">
                    {displayError}
                  </p>
                ) : null}

                <div className="mt-8 border-t border-white/[0.08] pt-6 text-center">
                  <p className="text-sm text-slate-500">{t("auth.loginBetaPrompt")}</p>
                  <Link
                    href="/join"
                    prefetch={false}
                    className="mt-3 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-sky-300 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-200"
                  >
                    {t("register.access.goJoin")}
                  </Link>
                </div>

                {googleAuthEnabled ? (
                  <div className="mt-8 border-t border-white/[0.06] pt-6">
                    <button
                      type="button"
                      disabled={busy || auth.status === "signed-in"}
                      onClick={() => void onGoogleClick()}
                      className="flex w-full min-h-11 items-center justify-center rounded-xl border border-white/[0.1] bg-transparent px-4 text-[13px] font-medium text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-slate-300 disabled:opacity-50 touch-manipulation"
                    >
                      {t("auth.loginGoogleSecondary")}
                    </button>
                  </div>
                ) : null}
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
