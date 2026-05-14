"use client";

import type { CalendarEvent, Customer, NextAction } from "@/app/crm/types";
import { CrmMiniCalendar } from "@/app/crm/CrmMiniCalendar";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="sensora-premium-card sensora-premium-panel-interactive rounded-[20px] px-6 py-[1.125rem] motion-reduce:transform-none motion-reduce:transition-none">
      <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-slate-500">{label}</div>
      <div className="mt-2.5 text-[1.65rem] font-semibold tabular-nums leading-none tracking-tight text-slate-50 sm:text-[1.75rem]">
        {value}
      </div>
      {hint ? <div className="mt-2.5 text-[12px] font-medium leading-snug text-slate-500 sm:text-[13px]">{hint}</div> : null}
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
  const panelQuiet =
    "sensora-premium-card rounded-[22px] px-[1.35rem] py-6 sm:px-7 motion-reduce:transition-none";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-[23px] font-semibold tracking-tight text-slate-50">오늘의 영업 흐름</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-400">한눈에 보는 지표와 일정입니다.</p>
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

      <section className={panelQuiet}>
        <h3 className="text-[17px] font-semibold text-slate-50">놓치면 안 되는 연락</h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-slate-500">오늘 기한인 연락·할 일만 요약했습니다.</p>
        {todayDueLines.length === 0 ? (
          <p className="mt-4 text-[14px] text-slate-500">오늘 기한인 항목이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-[14px] text-slate-200">
            {todayDueLines.slice(0, 8).map((line, i) => (
              <li
                key={i}
                className="rounded-xl border border-white/[0.08] bg-[#020817]/45 px-3 py-2.5 backdrop-blur-sm transition-colors duration-200 hover:border-sky-400/22 hover:bg-[#07111f]/55"
              >
                {line}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="sensora-dark-ghost-btn mt-4 min-h-[46px] rounded-xl px-5 py-2.5 text-[13px] font-semibold touch-manipulation"
          onClick={() => onGoSection("followup")}
        >
          사후관리에서 확인
        </button>
      </section>

      <section className={panelQuiet}>
        <h3 className="text-[17px] font-semibold text-slate-50">최근 상담 요약</h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-slate-500">최근 수정된 고객의 메모 앞부분입니다. AI가 임의로 바꾸지 않습니다.</p>
        {recentMemoLines.length === 0 ? (
          <p className="mt-4 text-[14px] text-slate-500">아직 등록된 메모가 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentMemoLines.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#020817]/42 px-3 py-2.5 text-left text-[14px] backdrop-blur-sm transition-[border-color,background-color,transform] duration-200 touch-manipulation hover:border-sky-400/26 hover:bg-[#07111f]/65 active:scale-[0.997]"
                  onClick={() => {
                    onPickCustomer(row.id);
                    onGoSection("customers");
                  }}
                >
                  <span className="font-semibold text-slate-100">{row.name}</span>
                  <div className="mt-1 line-clamp-2 text-[13px] text-slate-400">{row.excerpt}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="sensora-premium-primary-workspace min-h-[48px] rounded-xl px-6 py-2.5 text-[14px] font-semibold touch-manipulation"
          onClick={() => onGoSection("ai")}
        >
          Sensora AI 비서 열기
        </button>
        <button
          type="button"
          className="sensora-dark-ghost-btn min-h-[48px] rounded-xl px-6 py-2.5 text-[14px] font-semibold touch-manipulation"
          onClick={() => onGoSection("customers")}
        >
          고객 목록으로
        </button>
      </div>
    </div>
  );
}
