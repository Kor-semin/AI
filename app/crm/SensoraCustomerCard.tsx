"use client";

import { useEffect, useMemo, useRef, useState } from "react";


import { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import { addNextAction, completeNextAction, setConsultingTarget, updateCustomer } from "./crmLocalStore";
import { customerProbability, maskCustomerPhone } from "./salesKpi";
import type { Customer, NextAction } from "./types";

/**
 * 고객 카드 — 대시보드 KPI 목록·고객관리에서 이름을 누르면 열리는 상세 패널.
 * 상담 메모와 영업 정보를 이 자리에서 직접 수정하고 저장할 수 있습니다.
 * 저장은 「저장」 버튼을 누를 때만 실행됩니다(자동 저장 없음).
 */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

type Props = {
  customer: Customer;
  nextActions: NextAction[];
  onClose: () => void;
  onOpenConsulting?: () => void;
};

const fieldClass =
  "mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]";
const labelClass = "text-xs font-medium text-[var(--s-text-2)]";

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function SensoraCustomerCard({ customer, nextActions, onClose, onOpenConsulting }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(customer);
  const [notice, setNotice] = useState("");
  const [newAction, setNewAction] = useState("");

  // 다른 고객으로 전환될 때는 부모가 key={customer.id}로 새로 마운트하므로
  // 여기서 draft를 동기화할 필요가 없습니다.
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(customer), [draft, customer]);
  const probability = customerProbability(customer);
  const customerActions = nextActions.filter((action) => action.customerId === customer.id);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Esc 닫기 + Tab 포커스 트랩
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const update = <K extends keyof Customer>(field: K, value: Customer[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (notice) setNotice("");
  };

  const handleSave = () => {
    if (!draft.name.trim()) {
      setNotice("고객 이름은 비워 둘 수 없습니다.");
      return;
    }
    updateCustomer(customer.id, {
      name: draft.name.trim(),
      phone: draft.phone?.trim() || undefined,
      email: draft.email?.trim() || undefined,
      stage: draft.stage,
      leadSource: draft.leadSource,
      interestedModel: draft.interestedModel?.trim() || undefined,
      compareVehicles: draft.compareVehicles?.trim() || undefined,
      budget: draft.budget?.trim() || undefined,
      purchaseTiming: draft.purchaseTiming?.trim() || undefined,
      memo: draft.memo,
      personalityMemo: draft.personalityMemo?.trim() || undefined,
    });
    setNotice("고객 카드가 저장되었습니다.");
  };

  const handleAddAction = () => {
    if (!newAction.trim()) return;
    addNextAction(customer.id, newAction);
    setNewAction("");
    setNotice("다음 연락이 추가되었습니다.");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-card-title"
        tabIndex={-1}
        className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-[var(--s-card)] shadow-[-24px_0_60px_-30px_rgba(0,0,0,0.7)] outline-none"
      >
        {/* 헤더 */}
        <header className="sticky top-0 z-10 border-b border-[var(--s-border)] bg-[var(--s-card)] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Customer card</p>
              <h2 id="customer-card-title" className="mt-1 truncate text-xl font-semibold text-[var(--s-text)]">{customer.name}</h2>
              <p className="mt-1 text-xs text-[var(--s-text-3)]">
                {customer.stage} · 계약 가능성 {probability}% · 최근 수정 {formatDateTime(customer.updatedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--s-border)] text-[var(--s-text-3)] transition-colors hover:text-[var(--s-text)]"
              aria-label="고객 카드 닫기"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          {customer.phone ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`} className="rounded-lg bg-[var(--s-brand)] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]">
                전화 걸기
              </a>
              <a href={`sms:${customer.phone.replace(/[^\d+]/g, "")}`} className="rounded-lg border border-[var(--s-border-2)] px-3 py-2 text-xs font-medium text-[var(--s-text-2)] transition-colors hover:text-[var(--s-text)]">
                문자 보내기
              </a>
              {onOpenConsulting ? (
                <button
                  type="button"
                  onClick={() => {
                    setConsultingTarget(customer.id);
                    onOpenConsulting();
                  }}
                  className="rounded-lg border border-[var(--s-brand-border)] bg-[var(--s-brand-tint)] px-3 py-2 text-xs font-semibold text-[var(--s-brand-text)] transition-colors hover:bg-[var(--s-brand)] hover:text-white"
                >
                  AI 비서로 정리 →
                </button>
              ) : null}
              <span className="rounded-lg border border-[var(--s-border)] px-3 py-2 text-xs text-[var(--s-text-3)]">{maskCustomerPhone(customer.phone)}</span>
            </div>
          ) : null}
        </header>

        <div className="flex-1 px-5 py-5 sm:px-6">
          <div aria-live="polite">
            {notice ? (
              <p className="mb-4 rounded-lg border border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] px-4 py-3 text-[0.8125rem] text-[var(--s-ok-text)]" role="status">{notice}</p>
            ) : null}
          </div>

          {/* 상담 메모 — 가장 위에 크게 */}
          <section aria-labelledby="card-memo-title">
            <h3 id="card-memo-title" className="text-sm font-semibold text-[var(--s-text)]">상담 메모</h3>
            <p className="mt-1 text-xs text-[var(--s-text-3)]">직접 수정할 수 있습니다. AI가 자동으로 덮어쓰지 않습니다.</p>
            <textarea
              value={draft.memo ?? ""}
              onChange={(event) => update("memo", event.target.value)}
              placeholder="상담 내용을 입력하세요."
              className="mt-2 min-h-[160px] w-full resize-y rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-3 text-sm leading-7 text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
            />
            <label className={`mt-4 block ${labelClass}`}>
              고객 성향 · 주의사항
              <textarea
                value={draft.personalityMemo ?? ""}
                onChange={(event) => update("personalityMemo", event.target.value)}
                placeholder="예: 배우자와 상의 후 결정하는 편. 재촉 금지."
                className="mt-2 min-h-[72px] w-full resize-y rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm leading-6 text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              />
            </label>
          </section>

          {/* 영업 정보 */}
          <section className="mt-7" aria-labelledby="card-sales-title">
            <h3 id="card-sales-title" className="text-sm font-semibold text-[var(--s-text)]">영업 정보</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                이름
                <input value={draft.name} onChange={(e) => update("name", e.target.value)} className={fieldClass} />
              </label>
              <label className={labelClass}>
                연락처
                <input value={draft.phone ?? ""} onChange={(e) => update("phone", e.target.value)} inputMode="tel" placeholder="010-0000-0000" className={fieldClass} />
              </label>
              <label className={labelClass}>
                영업 단계
                <select value={draft.stage} onChange={(e) => update("stage", e.target.value as Customer["stage"])} className={fieldClass}>
                  {DEALER_PIPELINE_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                </select>
              </label>
              <label className={labelClass}>
                유입 경로
                <select value={draft.leadSource} onChange={(e) => update("leadSource", e.target.value as Customer["leadSource"])} className={fieldClass}>
                  {DEALER_LEAD_SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
              </label>
              <label className={labelClass}>
                관심 차량
                <input value={draft.interestedModel ?? ""} onChange={(e) => update("interestedModel", e.target.value)} placeholder="예: GV70 2.5T AWD" className={fieldClass} />
              </label>
              <label className={labelClass}>
                비교 중인 차량
                <input value={draft.compareVehicles ?? ""} onChange={(e) => update("compareVehicles", e.target.value)} placeholder="예: BMW X3, XC60" className={fieldClass} />
              </label>
              <label className={labelClass}>
                예산 · 월 납입
                <input value={draft.budget ?? ""} onChange={(e) => update("budget", e.target.value)} placeholder="예: 5,200만 원 내외" className={fieldClass} />
              </label>
              <label className={labelClass}>
                구매 예정 시기
                <input value={draft.purchaseTiming ?? ""} onChange={(e) => update("purchaseTiming", e.target.value)} placeholder="예: 12월 전 출고" className={fieldClass} />
              </label>
            </div>
          </section>

          {/* 다음 연락 */}
          <section className="mt-7" aria-labelledby="card-actions-title">
            <h3 id="card-actions-title" className="text-sm font-semibold text-[var(--s-text)]">다음 연락 · 할 일</h3>
            {customerActions.length === 0 ? (
              <p className="mt-2 rounded-lg border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] px-4 py-4 text-center text-xs text-[var(--s-text-3)]">등록된 다음 연락이 없습니다.</p>
            ) : (
              <ul className="mt-2 grid gap-2">
                {customerActions.map((action) => (
                  <li key={action.id} className="flex items-start justify-between gap-3 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3">
                    <span className="min-w-0">
                      <span className={`block text-[0.8125rem] leading-6 ${action.doneAt ? "text-[var(--s-text-4)] line-through" : "text-[var(--s-text-2)]"}`}>{action.title}</span>
                      <span className="mt-0.5 block text-xs text-[var(--s-text-4)]">
                        {action.doneAt ? `완료 ${formatDateTime(action.doneAt)}` : `등록 ${formatDateTime(action.createdAt)}`}
                      </span>
                    </span>
                    {!action.doneAt ? (
                      <button type="button" onClick={() => completeNextAction(action.id)} className="shrink-0 rounded-lg border border-[var(--s-border-2)] px-3 py-1.5 text-xs font-medium text-[var(--s-text-2)] transition-colors hover:text-[var(--s-text)]">
                        완료
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <input
                value={newAction}
                onChange={(event) => setNewAction(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleAddAction(); } }}
                placeholder="예: 견적 조건 재확인 통화"
                className="min-w-0 flex-1 rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              />
              <button type="button" onClick={handleAddAction} className="shrink-0 rounded-lg border border-[var(--s-border-2)] px-4 py-2.5 text-sm font-medium text-[var(--s-text-2)] transition-colors hover:text-[var(--s-text)]">
                추가
              </button>
            </div>
          </section>

          <p className="mt-6 text-xs leading-5 text-[var(--s-text-4)]">
            등록 {formatDateTime(customer.createdAt)} · 이 브라우저에 저장됩니다. 자동 발송·자동 저장은 없습니다.
          </p>
        </div>

        {/* 저장 바 */}
        <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[var(--s-border)] bg-[var(--s-card)] px-5 py-4 sm:px-6">
          <span className="text-xs text-[var(--s-text-3)]">{dirty ? "저장하지 않은 변경이 있습니다" : "변경 사항 없음"}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-[var(--s-border-2)] px-4 py-2.5 text-sm font-medium text-[var(--s-text-2)] transition-colors hover:text-[var(--s-text)]">
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="rounded-lg bg-[var(--s-brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)] disabled:cursor-not-allowed disabled:bg-[var(--s-border-2)] disabled:text-[var(--s-text-2)]"
            >
              저장
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
