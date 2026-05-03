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

  const fieldClass =
    "mt-2 w-full min-h-[48px] rounded-xl border border-white/[0.12] bg-[#020817]/82 px-4 py-3 text-[15px] leading-snug text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-slate-500 outline-none transition-[border-color,box-shadow] focus:border-sky-400/45 focus:ring-[3px] focus:ring-sky-500/15";

  const textareaFieldClass =
    `${fieldClass} resize-y py-3.5 leading-relaxed min-h-[100px] sm:min-h-[7.125rem]`;

  return (
    <main className="crm-bg crm-app-stage relative min-h-[100dvh] min-h-[100svh] overflow-x-hidden px-[max(1rem,calc(env(safe-area-inset-left,1rem)))] pb-[max(2rem,calc(8rem+env(safe-area-inset-bottom,0px)))] max-sm:pb-[max(2rem,calc(8.5rem+env(safe-area-inset-bottom,0px)))] pr-[max(1rem,calc(env(safe-area-inset-right,1rem)))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(720px 420px at 12% -2%, rgba(56,189,248,0.09), transparent 56%), radial-gradient(640px 400px at 102% 0%, rgba(139,92,246,0.07), transparent 52%)",
        }}
      />

      <div className="relative z-[1] mx-auto w-full max-w-xl min-[390px]:max-w-[min(36rem,calc(100vw-28px))]">
        <div className="mb-6 max-[389px]:mb-5">
          <Link
            href="/"
            className="sensora-dark-ghost-btn inline-flex touch-manipulation items-center gap-2 rounded-xl border-transparent px-0 py-1.5 text-[13px] font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100"
          >
            <span aria-hidden>←</span> {t("join.backHome")}
          </Link>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-slate-950/65 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_-16px_rgba(56,189,248,0.09)] backdrop-blur-md">
            SENSORA · AUTO CRM
          </div>
          <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            {t("join.title")}
          </h1>
          <p className="mt-3 max-w-[min(100%,38rem)] text-pretty whitespace-pre-line text-[15px] leading-relaxed text-slate-400 max-sm:text-[14px]">
            {t("join.intro")}
          </p>
        </div>

        <div className="relative rounded-[22px] border border-white/[0.12] bg-slate-950/72 p-6 shadow-[0_28px_64px_-28px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06),0_0_72px_-36px_rgba(56,189,248,0.075)] backdrop-blur-xl max-[389px]:p-5 sm:p-9">
          <form ref={formRef} className="relative" onSubmit={(ev) => void handleSubmit(ev)} noValidate>
            <fieldset className="space-y-5 border-0 p-0 [&_legend]:sr-only">
              <legend>{t("join.formLegend")}</legend>

              <div>
                <label htmlFor="fullName" className="text-[13px] font-semibold text-slate-200">
                  {t("form.name")}
                </label>
                <input id="fullName" name="fullName" type="text" autoComplete="name" required className={fieldClass} placeholder="홍길동" />
              </div>

              <div>
                <label htmlFor="contact" className="text-[13px] font-semibold text-slate-200">
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
                <label htmlFor="email" className="text-[13px] font-semibold text-slate-200">
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
                <label htmlFor="dealership" className="text-[13px] font-semibold text-slate-200">
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
                <label htmlFor="currentCrmApproach" className="text-[13px] font-semibold text-slate-200">
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
                <label htmlFor="motivation" className="text-[13px] font-semibold text-slate-200">
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
                className="space-y-2.5 rounded-xl border border-white/[0.1] bg-[#020817]/55 px-4 py-4 text-left text-[13px] leading-[1.65] text-slate-400 backdrop-blur-sm max-[389px]:px-3.5 max-[389px]:py-3.5 max-[389px]:text-[12px]"
                role="note"
              >
                <p className="font-semibold text-slate-100">{t("join.trustNoticeLine1")}</p>
                <p>{t("join.trustNoticeLine2")}</p>
                <p>{t("join.trustNoticeLine3")}</p>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="sensora-premium-primary-workspace min-h-[50px] w-full rounded-2xl py-3.5 text-[15px] font-semibold touch-manipulation disabled:cursor-not-allowed disabled:opacity-55"
              >
                {pending ? t("join.submitting") : t("join.submit")}
              </button>
              <p className="text-center text-[13px] leading-relaxed text-slate-500 max-[389px]:px-1 max-[389px]:text-[12px] max-[389px]:leading-[1.55]">
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
            className="mt-8 rounded-xl border border-dashed border-white/[0.18] bg-slate-950/50 px-4 py-3 text-left text-[11px] leading-relaxed text-slate-500"
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
