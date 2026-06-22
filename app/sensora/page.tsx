import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sensora",
  description: "자동차 영업조직을 위한 B2B AI CRM Sales Workspace",
};

export default function SensoraEntryPage() {
  return (
    <main className="min-h-screen bg-[#0A0B0D] px-5 py-12 text-[#F4F6F8] sm:px-8 lg:grid lg:place-items-center">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-[#2B3037] bg-[#14171B]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg border border-[#7A263A]/70 bg-[#2A151B] text-sm font-semibold">S</span>
              <div>
                <p className="text-sm font-semibold tracking-[0.04em]">SENSORA</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#7F8792]">Auto CRM</p>
              </div>
            </div>

            <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A263A]">B2B AI CRM SaaS</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
              자동차 영업팀의 고객 흐름을 한곳에서 정리합니다.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#B7BDC6]">
              상담 맥락, 다음 연락, Lead 접수, 차량 재고와 팀 follow-up을 연결해 영업사원과 팀장이 같은 업무 기준을 공유할 수 있도록 돕습니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/sensora/workspace"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#7A263A] bg-[#7A263A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8C3046] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98293]"
              >
                Sales Workspace 열기
              </Link>
              <Link
                href="/sensora/legacy"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2B3037] bg-[#1A1E23] px-5 text-sm font-medium text-[#B7BDC6] transition-colors hover:border-[#3A4048] hover:text-[#F4F6F8]"
              >
                기존 CRM 확인
              </Link>
            </div>
          </div>

          <div className="border-t border-[#2B3037] bg-[#0D0F12] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7F8792]">Sales Workspace</p>
            <div className="mt-6 space-y-3">
              {["오늘 연락할 고객", "계약 가능성이 높은 고객", "AI 상담 요약과 다음 행동", "Lead · 재고 · 팀 현황"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-[#2B3037] bg-[#14171B] px-4 py-3.5">
                  <span className="grid size-6 place-items-center rounded-full bg-[#2A151B] text-[10px] font-semibold text-[#C98293]">{index + 1}</span>
                  <span className="text-xs font-medium text-[#B7BDC6]">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] leading-5 text-[#7F8792]">AI 제안은 담당자가 검토하며 자동 저장하거나 자동 발송하지 않습니다.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
