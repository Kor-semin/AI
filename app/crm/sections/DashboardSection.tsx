"use client";

import type { CalendarEvent, Customer, NextAction } from "@/app/crm/types";
import { CrmMiniCalendar } from "@/app/crm/CrmMiniCalendar";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[22px] border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="text-[12px] font-semibold tracking-[-0.01em] text-[#4B5563]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[#111827]">{value}</div>
      {hint ? <div className="mt-2 text-[13px] leading-snug text-[#6B7280]">{hint}</div> : null}
    </div>
  );
}

export type DashboardSectionProps = {
  todayFollowUps: number;
  highPotential: number;
  followUpOpen: number;
  recentConsult: number;
  customers: Customer[];
  nextActions: NextAction[];
  events: CalendarEvent[];
  /** 오늘 기한 미완료 할 일 요약 라벨 */
  todayDueLines: string[];
  recentMemoLines: { name: string; excerpt: string; id: string }[];
  onPickCustomer: (id: string) => void;
  onGoSection: (s: CrmSection) => void;
};

export function DashboardSection({
  todayFollowUps,
  highPotential,
  followUpOpen,
  recentConsult,
  customers,
  nextActions,
  events,
  todayDueLines,
  recentMemoLines,
  onPickCustomer,
  onGoSection,
}: DashboardSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight text-[#111827]">오늘의 영업 흐름</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">한눈에 보는 지표와 일정입니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="오늘 연락(기한)" value={todayFollowUps} hint="약속된 연락·미팅 기준" />
        <StatCard label="계약 가능성 높은 고객" value={highPotential} hint="가망 A·S·66%+" />
        <StatCard label="예정된 할 일(미완료)" value={followUpOpen} hint="전체 미완료 업무" />
        <StatCard label="최근 상담(7일)" value={recentConsult} hint="기록이 갱신된 고객" />
      </div>

      <CrmMiniCalendar
        customers={customers}
        nextActions={nextActions}
        events={events}
        onPickCustomer={(id) => {
          onPickCustomer(id);
          onGoSection("customers");
        }}
      />

      <section className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
        <h3 className="text-[16px] font-semibold text-[#111827]">놓치면 안 되는 연락</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">오늘 기한인 연락·할 일만 요약했습니다.</p>
        {todayDueLines.length === 0 ? (
          <p className="mt-4 text-[14px] text-[#94A3B8]">오늘 기한인 항목이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-[14px] text-[#374151]">
            {todayDueLines.slice(0, 8).map((line, i) => (
              <li key={i} className="rounded-lg border border-[#F1F5F9] bg-[#FAFBFC] px-3 py-2">
                {line}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="mt-4 min-h-[44px] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-[13px] font-semibold text-[#374151] touch-manipulation"
          onClick={() => onGoSection("followup")}
        >
          사후관리 화면으로 →
        </button>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-5 shadow-sm sm:px-6">
        <h3 className="text-[16px] font-semibold text-[#111827]">최근 상담 요약</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">최근 수정된 고객의 메모 앞부분입니다. AI가 임의로 바꾸지 않습니다.</p>
        {recentMemoLines.length === 0 ? (
          <p className="mt-4 text-[14px] text-[#94A3B8]">아직 등록된 메모가 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentMemoLines.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] px-3 py-2.5 text-left text-[14px] touch-manipulation hover:bg-[#F1F5F9]"
                  onClick={() => {
                    onPickCustomer(row.id);
                    onGoSection("customers");
                  }}
                >
                  <span className="font-semibold text-[#111827]">{row.name}</span>
                  <div className="mt-1 line-clamp-2 text-[13px] text-[#64748B]">{row.excerpt}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-[44px] rounded-xl bg-[#111827] px-5 py-2.5 text-[14px] font-semibold text-white touch-manipulation"
          onClick={() => onGoSection("ai")}
        >
          Sensora AI 비서 열기
        </button>
        <button
          type="button"
          className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation"
          onClick={() => onGoSection("customers")}
        >
          고객 목록으로
        </button>
      </div>
    </div>
  );
}
