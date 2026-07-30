import type { Metadata } from "next";
import Link from "next/link";

import { SensoraSymbol } from "@/app/crm/SensoraSymbol";

export const metadata: Metadata = {
  title: "Sensora",
  description: "자동차 영업조직을 위한 B2B AI CRM Sales Workspace",
};

export default function SensoraEntryPage() {
  return (
    <main className="min-h-screen bg-[var(--s-bg)] px-5 py-12 text-[var(--s-text)] sm:px-8 lg:grid lg:place-items-center">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[#F5EEE4]">
                <SensoraSymbol className="size-6" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.04em]">SENSORA</p>
                <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--s-text-3)]">Auto CRM</p>
              </div>
            </div>

            <p className="mt-12 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--s-brand-text)]">B2B AI CRM SaaS</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
              자동차 영업팀의 고객 흐름을 한곳에서 정리합니다.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--s-text-2)]">
              상담 맥락, 다음 연락, Lead 접수, 차량 재고와 팀 follow-up을 연결해 영업사원과 팀장이 같은 업무 기준을 공유할 수 있도록 돕습니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/sensora/workspace"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--s-brand)] bg-[var(--s-brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-text)]"
              >
                Sales Workspace 열기
              </Link>
              <Link
                href="/sensora/legacy"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-5 text-sm font-medium text-[var(--s-text-2)] transition-colors hover:border-[var(--s-border-2)] hover:text-[var(--s-text)]"
              >
                기존 CRM 확인
              </Link>
            </div>
          </div>

          <div className="border-t border-[var(--s-border)] bg-[var(--s-panel)] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-text-3)]">Sales Workspace</p>
            <div className="mt-6 space-y-3">
              {["오늘 연락할 고객", "계약 가능성이 높은 고객", "AI 상담 요약과 다음 행동", "Lead · 재고 · 팀 현황"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-[var(--s-border)] bg-[var(--s-card)] px-4 py-3.5">
                  <span className="grid size-6 place-items-center rounded-full bg-[var(--s-brand-tint)] text-xs font-semibold text-[var(--s-brand-text)]">{index + 1}</span>
                  <span className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[0.8125rem] leading-6 text-[var(--s-text-3)]">AI 제안은 담당자가 검토하며 자동 저장하거나 자동 발송하지 않습니다.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
