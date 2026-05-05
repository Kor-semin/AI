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
    <div className="sensora-dashboard-stat-card sensora-premium-panel-interactive motion-reduce:transform-none motion-reduce:transition-none">
      <div className="text-[11px] font-bold uppercase tracking-[0.11em] text-slate-400">{label}</div>
      <div className="mt-2.5 text-[1.78rem] font-semibold tabular-nums leading-none tracking-tight text-slate-50 sm:text-[1.95rem]">
        {value}
      </div>
      {hint ? <div className="mt-2.5 text-[12px] font-medium leading-snug text-slate-400 sm:text-[13px]">{hint}</div> : null}
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
    "sensora-dashboard-card rounded-[24px] px-[1.35rem] py-6 sm:px-7 motion-reduce:transition-none";

  return (
    <div className="sensora-dashboard-shell flex flex-col gap-6 sm:gap-7">
      <div className="sensora-dashboard-hero">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200/75">Workspace dashboard</p>
          <h2 className="mt-3 text-[clamp(1.65rem,3vw,2.35rem)] font-semibold leading-tight tracking-[-0.045em] text-slate-50">
            오늘의 상담 일정과 사후관리 흐름
          </h2>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-slate-300/90">
            고객 연락, 상담 메모, AI 제안 메시지를 한 화면에서 선명하게 확인합니다.
          </p>
        </div>
        <button
          type="button"
          className="sensora-dark-ghost-btn min-h-[46px] shrink-0 rounded-2xl px-5 py-2.5 text-[13px] font-semibold touch-manipulation"
          onClick={() => onGoSection("customers")}
        >
          고객 화면으로
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="오늘 연락(기한)" value={todayFollowUps} hint="약속된 연락·미팅 기준" />
        <StatCard label="계약 가능성 높은 고객" value={highPotential} hint="가망 A·S·66%+" />
        <StatCard label="예정된 할 일(미완료)" value={followUpOpen} hint="전체 미완료 업무" />
        <StatCard label="최근 상담(7일)" value={recentConsult} hint="기록이 갱신된 고객" />
      </div>

      <div className="sensora-dashboard-main-grid">
        <div className="sensora-dashboard-calendar-card">
          <CrmMiniCalendar
            customers={customers}
            nextActions={nextActions}
            events={events}
            onPickCustomer={(id) => {
              onPickCustomer(id);
              onGoSection("customers");
            }}
          />
        </div>

        <section className={panelQuiet}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-200/70">Follow-up</p>
          <h3 className="mt-2 text-[18px] font-semibold text-slate-50">후속 관리 항목</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-slate-400">오늘 기한인 연락·할 일만 요약했습니다.</p>
          {todayDueLines.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[14px] text-slate-400">오늘 기한인 항목이 없습니다.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-[14px] text-slate-200">
              {todayDueLines.slice(0, 8).map((line, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-white/[0.09] bg-[#020817]/52 px-4 py-3 leading-relaxed backdrop-blur-sm transition-colors duration-200 hover:border-sky-400/24 hover:bg-[#07111f]/68"
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
            사후관리 화면으로 →
          </button>
        </section>

        <section className={panelQuiet}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-200/70">AI suggestion</p>
          <h3 className="mt-2 text-[18px] font-semibold text-slate-50">AI 제안 메시지</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
            상담 메모를 바탕으로 검토용 초안을 정리합니다. 최종 판단과 발송은 영업사원이 직접 합니다.
          </p>
          <div className="mt-5 rounded-[22px] border border-violet-300/[0.16] bg-gradient-to-br from-violet-500/[0.11] via-white/[0.04] to-sky-500/[0.08] px-4 py-4 text-[14px] leading-relaxed text-slate-200">
            “고객의 관심 차량과 예산 조건을 먼저 확인하고, 다음 연락에서는 출고 일정과 비교 모델을 함께 안내해 보세요.”
          </div>
          <button
            type="button"
            className="sensora-premium-primary-workspace mt-4 min-h-[46px] rounded-xl px-5 py-2.5 text-[13px] font-semibold touch-manipulation"
            onClick={() => onGoSection("ai")}
          >
            AI 비서 화면으로 →
          </button>
        </section>

        <section className={panelQuiet}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Recent notes</p>
          <h3 className="mt-2 text-[18px] font-semibold text-slate-50">최근 상담 요약</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-slate-400">최근 수정된 고객의 메모 앞부분입니다. AI가 임의로 바꾸지 않습니다.</p>
          {recentMemoLines.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[14px] text-slate-400">아직 등록된 메모가 없습니다.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentMemoLines.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-white/[0.1] bg-[#020817]/52 px-4 py-3 text-left text-[14px] backdrop-blur-sm transition-[border-color,background-color,transform] duration-200 touch-manipulation hover:border-sky-400/26 hover:bg-[#07111f]/72 active:scale-[0.997]"
                    onClick={() => {
                      onPickCustomer(row.id);
                      onGoSection("customers");
                    }}
                  >
                    <span className="font-semibold text-slate-100">{row.name}</span>
                    <div className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-400">{row.excerpt}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
