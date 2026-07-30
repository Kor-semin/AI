"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import type { CrmSection } from "./crmSectionTypes";
import {
  getCrmServerSnapshot,
  getCrmStateSnapshot,
  setCustomerDetailTarget,
  subscribeCrmState,
} from "./crmLocalStore";
import { computeKpi, type DashboardKpiId, type KpiRow, maskCustomerPhone } from "./salesKpi";
import { SensoraCustomerCard } from "./SensoraCustomerCard";
import { SensoraInventoryView } from "./SensoraInventoryView";
import { SensoraLeadQueueView } from "./SensoraLeadQueueView";
import { SensoraTeamView } from "./SensoraTeamView";

type SensoraSalesDashboardProps = {
  sellerName?: string;
  onNavigate: (section: CrmSection) => void;
};

const KPI_META: { id: DashboardKpiId; label: string; tone: string }[] = [
  { id: "todayContacts", label: "오늘 연락할 고객", tone: "text-[var(--s-text)]" },
  { id: "highPotential", label: "계약 가능성이 높은 고객", tone: "text-[var(--s-brand-text)]" },
  { id: "overdueFollowUps", label: "지연된 follow-up", tone: "text-[var(--s-warn-text)]" },
  { id: "recentConsultations", label: "최근 상담 요약", tone: "text-[var(--s-text)]" },
];

const KPI_TITLES: Record<DashboardKpiId, string> = {
  todayContacts: "오늘 연락할 고객",
  highPotential: "계약 가능성이 높은 고객",
  overdueFollowUps: "지연된 follow-up",
  recentConsultations: "최근 상담 요약",
};

const TONE_CLASS: Record<KpiRow["tone"], string> = {
  warn: "text-[var(--s-warn-text)]",
  ok: "text-[var(--s-ok-text)]",
  brand: "text-[var(--s-brand-text)]",
  muted: "text-[var(--s-text-2)]",
};

export function SensoraSalesDashboard({ onNavigate }: SensoraSalesDashboardProps) {
  const state = useSyncExternalStore(subscribeCrmState, getCrmStateSnapshot, getCrmServerSnapshot);
  const kpi = useMemo(() => computeKpi(state), [state]);

  const [selectedKpi, setSelectedKpi] = useState<DashboardKpiId | null>(null);
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);

  const selectedRows = selectedKpi ? kpi.rows[selectedKpi] : [];
  const openCustomer = openCustomerId ? state.customers.find((customer) => customer.id === openCustomerId) ?? null : null;

  return (
    <div id="crm-section-dashboard" className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8">
      <header className="flex min-h-[76px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[var(--s-text)] sm:text-[1.75rem]">Sales Workspace</h1>
          <p className="mt-1.5 text-[0.8125rem] text-[var(--s-text-3)]">
            등록된 고객 {state.customers.length}명 기준으로 계산됩니다. 숫자를 누르면 해당 고객 목록이 열립니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("customers")}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 text-xs font-medium text-[var(--s-text-2)] transition-colors hover:border-[var(--s-brand-border-soft)] hover:text-[var(--s-text)]"
          >
            고객관리
          </button>
          <button
            type="button"
            onClick={() => onNavigate("leadQueue")}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--s-border)] bg-[var(--s-text)] px-4 text-xs font-semibold text-[var(--s-bg)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-ring)]"
          >
            Lead 접수
          </button>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="영업 KPI 요약">
        {KPI_META.map((item) => {
          const active = selectedKpi === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedKpi(active ? null : item.id)}
              aria-expanded={active}
              aria-controls="kpi-detail-panel"
              className={[
                "min-h-[144px] rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "border-[var(--s-brand-border)] bg-[var(--s-brand-tint)]"
                  : "border-[var(--s-border)] bg-[var(--s-card)] hover:border-[var(--s-brand-border-soft)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-ring)]",
              ].join(" ")}
            >
              <p className="flex items-center justify-between gap-2 text-[0.8125rem] font-medium leading-5 text-[var(--s-text-2)]">
                {item.label}
                <svg viewBox="0 0 24 24" className={`size-3.5 shrink-0 text-[var(--s-text-3)] transition-transform ${active ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </p>
              <p className={`mt-3 text-[2rem] font-semibold leading-none tracking-[-0.04em] ${item.tone}`}>{kpi.counts[item.id]}</p>
              <p className="mt-3 text-xs text-[var(--s-text-3)]">{kpi.details[item.id]}</p>
              <p className="mt-2 text-xs font-medium text-[var(--s-brand-text)]">{active ? "목록 닫기" : "고객 보기"}</p>
            </button>
          );
        })}
      </section>

      {/* KPI 드릴다운 — 이름을 누르면 고객 카드가 열립니다 */}
      <div id="kpi-detail-panel" aria-live="polite">
        {selectedKpi ? (
          <section className="mt-4 rounded-2xl border border-[var(--s-brand-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-label={`${KPI_TITLES[selectedKpi]} 상세 목록`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--s-text)]">
                  {KPI_TITLES[selectedKpi]}
                  <span className="ml-2 text-[var(--s-brand-text)]">{selectedRows.length}명</span>
                </h2>
                <p className="mt-1 text-xs text-[var(--s-text-3)]">고객 이름을 누르면 상담 메모와 영업 정보를 바로 수정할 수 있습니다.</p>
              </div>
              <button type="button" onClick={() => setSelectedKpi(null)} className="rounded-lg border border-[var(--s-border)] px-3 py-2 text-xs font-medium text-[var(--s-text-3)] transition-colors hover:text-[var(--s-text)]">
                닫기
              </button>
            </div>

            {selectedRows.length === 0 ? (
              <p className="mt-5 rounded-lg border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] px-4 py-8 text-center text-sm text-[var(--s-text-3)]">
                해당하는 고객이 없습니다.
              </p>
            ) : (
              <ul className="mt-5 grid gap-2.5">
                {selectedRows.map(({ customer, reason, tone, probability }) => (
                  <li key={customer.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerDetailTarget(customer.id);
                        setOpenCustomerId(customer.id);
                      }}
                      className="grid w-full gap-2 rounded-xl border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-left transition-colors hover:border-[var(--s-brand-border-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-ring)] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.4fr)] sm:items-center sm:gap-4"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--s-brand-tint)] text-xs font-semibold text-[var(--s-brand-text)]">{customer.name.slice(0, 1)}</span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--s-text)]">{customer.name}</span>
                            <span className="shrink-0 rounded-full border border-[var(--s-border)] bg-[var(--s-card)] px-2 py-0.5 text-[0.6875rem] text-[var(--s-text-2)]">{customer.stage}</span>
                          </span>
                          <span className="mt-0.5 block text-xs text-[var(--s-text-3)]">{maskCustomerPhone(customer.phone)}</span>
                        </span>
                      </span>
                      <span className="truncate text-[0.8125rem] text-[var(--s-text-2)]">{customer.interestedModel || "관심 차량 미입력"}</span>
                      {probability !== undefined ? (
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--s-border)]" aria-hidden>
                            <span className="block h-full rounded-full bg-[var(--s-brand-hover)]" style={{ width: `${probability}%` }} />
                          </span>
                          <span className="text-xs font-semibold text-[var(--s-brand-text)]">{probability}%</span>
                        </span>
                      ) : (
                        <span className={`text-xs font-medium leading-5 ${TONE_CLASS[tone]}`}>{reason}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[1.2fr_.85fr]">
        <section className="min-h-[380px] rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="ai-assistant-preview-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">AI Assistant</p>
              <h2 id="ai-assistant-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[var(--s-text)]">오늘의 상담 인사이트</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("consulting")}
              className="rounded-lg bg-[var(--s-brand-tint)] px-4 py-2 text-xs font-medium text-[var(--s-brand-text)] transition-colors hover:bg-[var(--s-brand)] hover:text-white"
            >
              상담 메모 열기 →
            </button>
          </div>

          {kpi.rows.recentConsultations.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] px-4 py-10 text-center text-sm text-[var(--s-text-3)]">
              아직 상담 메모가 없습니다. 상담 메모 메뉴에서 첫 메모를 작성해 보세요.
            </p>
          ) : (
            <ul className="mt-6 grid gap-3">
              {kpi.rows.recentConsultations.slice(0, 4).map(({ customer, reason }) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => setOpenCustomerId(customer.id)}
                    className="w-full rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4 text-left transition-colors hover:border-[var(--s-brand-border-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-ring)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--s-text)]">{customer.name}</span>
                      <span className="text-xs text-[var(--s-text-3)]">{customer.interestedModel || "관심 차량 미입력"}</span>
                    </span>
                    <span className="mt-2 block text-[0.8125rem] leading-6 text-[var(--s-text-2)]">{reason}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 rounded-lg bg-[var(--s-inner)] px-4 py-2 text-xs leading-5 text-[var(--s-text-4)]">AI는 자동 저장하거나 자동 발송하지 않습니다. 요약과 초안은 검토용입니다.</p>
        </section>

        <SensoraLeadQueueView compact />
      </div>

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[1.2fr_.85fr]">
        <SensoraInventoryView compact />
        <SensoraTeamView compact />
      </div>

      {openCustomer ? (
        <SensoraCustomerCard
          key={openCustomer.id}
          customer={openCustomer}
          nextActions={state.nextActions}
          onClose={() => setOpenCustomerId(null)}
          onOpenConsulting={() => {
            setOpenCustomerId(null);
            onNavigate("consulting");
          }}
        />
      ) : null}
    </div>
  );
}
