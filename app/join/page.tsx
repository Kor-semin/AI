"use client";

import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { BetaSignupPayload } from "@/lib/betaSignupSubmit";
import { submitBetaSignup } from "@/lib/betaSignupSubmit";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

function BetaJoinForm() {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const returnToPreview = searchParams.get("returnTo") === "preview";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /** 비동기 이후에는 e.currentTarget이 null일 수 있으므로 ref(또는 동기 스냅샷)만 사용 */
    const form = formRef.current ?? e.currentTarget;
    if (!form) return;
    const fd = new FormData(form);

    const payload: BetaSignupPayload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      contact: String(fd.get("contact") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      dealership: String(fd.get("dealership") ?? "").trim(),
      currentCrmApproach: String(fd.get("currentCrmApproach") ?? "").trim(),
      motivation: String(fd.get("motivation") ?? "").trim(),
    };

    if (
      !payload.fullName ||
      !payload.contact ||
      !payload.email ||
      !payload.dealership ||
      !payload.currentCrmApproach ||
      !payload.motivation
    ) {
      window.alert(t("join.fillAllFields"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      window.alert(t("join.invalidEmail"));
      return;
    }

    setPending(true);
    try {
      const res = await submitBetaSignup(payload);
      if (!res.ok) {
        window.alert(t("join.alert.betaSaveFailed"));
        return;
      }
      if (returnToPreview && res.savedToBackend) {
        window.alert(t("join.alert.betaReceivedRemote"));
        window.location.assign("/?view=app");
        return;
      }
      window.alert(res.savedToBackend ? t("join.alert.betaReceivedRemote") : t("join.alert.betaNotPersisted"));
      const mounted = formRef.current;
      if (mounted?.isConnected) {
        mounted.reset();
      }
    } finally {
      setPending(false);
    }
  }

  const fieldClass = "sensora-premium-input mt-2 w-full rounded-xl leading-snug";

  const textareaFieldClass =
    "sensora-premium-input mt-2 w-full rounded-xl resize-y leading-relaxed py-4 min-h-[7.75rem] sm:min-h-[7.75rem]";

  return (
    <main className="crm-bg crm-app-stage join-premium-surface relative min-h-[100dvh] min-h-[100svh] overflow-x-hidden px-[max(1rem,calc(env(safe-area-inset-left,1rem)))] pb-[max(2rem,calc(7.5rem+env(safe-area-inset-bottom,0px)))] max-sm:pb-[max(2rem,calc(8rem+env(safe-area-inset-bottom,0px)))] pr-[max(1rem,calc(env(safe-area-inset-right,1rem)))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(780px_440px_at_10%_-4%,rgba(56,189,248,0.095),transparent_56%),radial-gradient(680px_420px_at_100%_4%,rgba(139,92,246,0.078),transparent_54%),radial-gradient(520px_360px_at_50%_96%,rgba(30,27,75,0.06),transparent_58%)] opacity-[0.97]" />

      <div className="relative z-[1] mx-auto w-full max-w-xl min-[390px]:max-w-[min(36rem,calc(100vw-28px))]">
        <div className="mb-6 max-[389px]:mb-5">
          <Link
            href="/"
            className="inline-flex touch-manipulation items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-sky-400/28 hover:bg-white/[0.08] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35"
          >
            <span aria-hidden>←</span> {t("join.backHome")}
          </Link>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-slate-950/65 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_-16px_rgba(56,189,248,0.09)] backdrop-blur-md">
            SENSORA · AUTO CRM
          </div>
          <h1 className="mt-4 text-balance text-[1.625rem] font-semibold tracking-tight text-slate-50 sm:text-[2rem]">
            {t("join.title")}
          </h1>
          <p className="mt-3 max-w-[min(100%,38rem)] text-pretty whitespace-pre-line text-base leading-relaxed text-slate-400 max-sm:text-[0.9375rem]">
            {t("join.intro")}
          </p>
        </div>

        <div className="sensora-premium-card relative rounded-[24px] px-6 py-7 max-[389px]:p-6 sm:p-10">
          <form ref={formRef} className="relative" onSubmit={(ev) => void handleSubmit(ev)} noValidate>
            <fieldset className="space-y-6 border-0 p-0 [&_legend]:sr-only">
              <legend>{t("join.formLegend")}</legend>

              <div>
                <label htmlFor="fullName" className="text-sm font-semibold text-slate-100">
                  {t("form.name")}
                </label>
                <input id="fullName" name="fullName" type="text" autoComplete="name" required className={fieldClass} placeholder="홍길동" />
              </div>

              <div>
                <label htmlFor="contact" className="text-sm font-semibold text-slate-100">
                  {t("form.contact")}
                </label>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={fieldClass}
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-semibold text-slate-100">
                  {t("form.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={fieldClass}
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="dealership" className="text-sm font-semibold text-slate-100">
                  {t("form.dealership")}
                </label>
                <input
                  id="dealership"
                  name="dealership"
                  type="text"
                  required
                  className={fieldClass}
                  placeholder="예: OO 모터스 · 강남 전시장"
                />
              </div>

              <div>
                <label htmlFor="currentCrmApproach" className="text-sm font-semibold text-slate-100">
                  {t("form.currentCrm")}
                </label>
                <textarea
                  id="currentCrmApproach"
                  name="currentCrmApproach"
                  rows={3}
                  required
                  className={textareaFieldClass}
                  placeholder="엑셀, 메모, 타사 CRM, 단체 프로그램 등 현재 어떻게 관리하고 있는지 적어 주세요."
                />
              </div>

              <div>
                <label htmlFor="motivation" className="text-sm font-semibold text-slate-100">
                  {t("form.motivation")}
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  rows={3}
                  required
                  className={textareaFieldClass}
                  placeholder="기대 기능, 업무 상 불편, 도입 타이밍 등을 적어 주세요."
                />
              </div>
            </fieldset>

            <div className="mt-8 flex flex-col gap-5 border-t border-white/[0.1] pt-8">
              <div
                className="space-y-2.5 rounded-xl border border-white/[0.12] bg-[#020817]/62 px-4 py-[1.125rem] text-left text-sm leading-[1.65] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md max-[389px]:px-3.5 max-[389px]:py-3.5 max-[389px]:text-[0.8125rem]"
                role="note"
              >
                <p className="font-semibold text-slate-100">{t("join.trustNoticeLine1")}</p>
                <p>{t("join.trustNoticeLine2")}</p>
                <p>{t("join.trustNoticeLine3")}</p>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="sensora-premium-primary-workspace min-h-[3.25rem] w-full rounded-2xl py-3.5 text-base font-semibold touch-manipulation disabled:cursor-not-allowed disabled:opacity-55"
              >
                {pending ? t("join.submitting") : t("join.submit")}
              </button>
              <p className="text-center text-sm leading-relaxed text-slate-500 max-[389px]:px-1 max-[389px]:text-[0.78rem] max-[389px]:leading-[1.55]">
                이미 명함 접수 후 승인을 기다리는 경우{" "}
                <Link href="/register" className="font-semibold text-sky-400/95 underline-offset-4 hover:text-sky-300 hover:underline">
                  영업 계정 등록
                </Link>
                에서 상태를 확인하세요.
              </p>
            </div>
          </form>
        </div>

        {process.env.NODE_ENV !== "production" ? (
          <p
            className="mt-8 rounded-xl border border-dashed border-white/[0.18] bg-slate-950/50 px-4 py-3 text-left text-xs leading-relaxed text-slate-500"
            role="status"
          >
            {t("join.devBetaEndpointHint")}
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default function BetaJoinPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <main className="crm-bg relative flex min-h-[100dvh] items-center justify-center px-4 pb-12 pt-8">
          <p className="text-center text-sm text-slate-400">{t("join.loading")}</p>
        </main>
      }
    >
      <BetaJoinForm />
    </Suspense>
  );
}
