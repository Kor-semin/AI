"use client";

import Link from "next/link";
import { useState } from "react";

import type { BetaSignupPayload } from "@/lib/betaSignupSubmit";
import { submitBetaSignup } from "@/lib/betaSignupSubmit";

export default function BetaJoinPage() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

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
      window.alert("모든 항목을 입력해 주세요.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      window.alert("이메일 형식을 확인해 주세요.");
      return;
    }

    setPending(true);
    try {
      const res = await submitBetaSignup(payload);
      if (res.ok) e.currentTarget.reset();
    } finally {
      setPending(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-[#d7dce2] bg-[#fafbfc] px-4 py-3 text-sm text-[#1e2329] shadow-[inset_0_1px_2px_rgba(17,19,24,0.03)] placeholder:text-[#8a929e] focus:border-[#a8b0ba] focus:outline-none focus:ring-[3px] focus:ring-[rgba(168,176,186,0.22)]";

  return (
    <main className="crm-bg relative min-h-[100dvh] min-h-[100svh] overflow-x-hidden px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_480px_at_10%_-4%,rgba(148,163,184,0.18),transparent_58%),radial-gradient(640px_400px_at_100%_0%,rgba(255,255,255,0.9),transparent_55%)]"
      />

      <div className="relative z-[1] mx-auto w-full max-w-xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#64748b] transition hover:text-[#1e2329]"
          >
            <span aria-hidden>←</span> 홈으로 돌아가기
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d7dce2] bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#5f6675] backdrop-blur-sm">
            SENSORA · AUTO CRM
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
            베타 신청
          </h1>
          <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-[color:var(--ink-2)]">
            Sensora Auto CRM 초기 접수입니다. 정보는 검토 후 연락드립니다. (제품 경험 레이어: Sales Concierge AI)
          </p>
        </div>

        <form className="crm-card rounded-[1.35rem] p-6 sm:p-9" onSubmit={(ev) => void handleSubmit(ev)} noValidate>
          <fieldset className="space-y-5 border-0 p-0 [&_legend]:sr-only">
            <legend>Sensora Auto CRM 베타 신청 폼</legend>

            <div>
              <label htmlFor="fullName" className="text-[12px] font-semibold text-[color:var(--foreground)]">
                이름
              </label>
              <input id="fullName" name="fullName" type="text" autoComplete="name" required className={fieldClass} placeholder="홍길동" />
            </div>

            <div>
              <label htmlFor="contact" className="text-[12px] font-semibold text-[color:var(--foreground)]">
                연락처
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
              <label htmlFor="email" className="text-[12px] font-semibold text-[color:var(--foreground)]">
                이메일
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
              <label htmlFor="dealership" className="text-[12px] font-semibold text-[color:var(--foreground)]">
                소속 브랜드 / 전시장
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
              <label htmlFor="currentCrmApproach" className="text-[12px] font-semibold text-[color:var(--foreground)]">
                현재 고객관리 방식
              </label>
              <textarea
                id="currentCrmApproach"
                name="currentCrmApproach"
                rows={4}
                required
                className={`${fieldClass} min-h-[5.5rem] resize-y leading-relaxed`}
                placeholder="엑셀, 메모, 타사 CRM, 단체 프로그램 등 현재 어떻게 관리하고 있는지 적어 주세요."
              />
            </div>

            <div>
              <label htmlFor="motivation" className="text-[12px] font-semibold text-[color:var(--foreground)]">
                사용해 보고 싶은 이유
              </label>
              <textarea
                id="motivation"
                name="motivation"
                rows={4}
                required
                className={`${fieldClass} min-h-[5.5rem] resize-y leading-relaxed`}
                placeholder="기대 기능, 업무 상 불편, 도입 타이밍 등을 적어 주세요."
              />
            </div>
          </fieldset>

          <div className="mt-8 flex flex-col gap-3 border-t border-[#d7dce2] pt-8">
            <button
              type="submit"
              disabled={pending}
              className="crm-ink-btn w-full rounded-xl py-3.5 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-55"
            >
              {pending ? "제출 중…" : "베타 신청 제출"}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-[color:var(--ink-2)]">
              이미 명함 접수 후 승인을 기다리는 경우{" "}
              <Link href="/register" className="font-semibold text-[#5c6370] underline-offset-4 hover:text-[#1e2329] hover:underline">
                영업 계정 등록
              </Link>
              에서 상태를 확인하세요.
            </p>
          </div>
        </form>

        <p className="mt-10 text-center text-[11px] leading-relaxed text-[color:var(--ink-2)]">
          운영 환경에서 <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT</code>{" "}
          를 설정하면 제출 내용이 Google Sheet(웹훅)로 저장됩니다. 미설정 시에는 데모 안내만 표시됩니다.
        </p>
      </div>
    </main>
  );
}
