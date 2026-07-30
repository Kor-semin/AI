"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  DEFAULT_SENSORA_WORKSPACE_ID,
  getSensoraCustomerPersistenceMessage,
  listSensoraCustomers,
  type SensoraStoredCustomer,
} from "@/lib/sensora";

import type { CrmSection } from "./crmSectionTypes";
import {
  addCustomer,
  consumeCustomerDetailTarget,
  getCrmServerSnapshot,
  getCrmStateSnapshot,
  setConsultingTarget,
  subscribeCrmState,
} from "./crmLocalStore";
import { computeKpi, customerProbability, maskCustomerPhone } from "./salesKpi";
import { SensoraCustomerCard } from "./SensoraCustomerCard";
import { DEALER_PIPELINE_STAGES } from "./constants";

/*
 * 고객 데이터 소스 (혼동 방지):
 * 1) 내 고객   — 이 브라우저(localStorage). 대시보드 KPI·상담 메모와 완전히 동일한 데이터.
 * 2) Firestore — 로그인 후 Lead에서 전환한 고객(별도 표시).
 */

const inputClass =
  "mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "확인 필요";
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function SensoraCustomerView({ onNavigate }: { onNavigate?: (section: CrmSection) => void }) {
  const state = useSyncExternalStore(subscribeCrmState, getCrmStateSnapshot, getCrmServerSnapshot);
  const myCustomers = state.customers;
  const kpi = useMemo(() => computeKpi(state), [state]);

  const [storedCustomers, setStoredCustomers] = useState<SensoraStoredCustomer[]>([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState("");

  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [notice, setNotice] = useState("");

  // 대시보드에서 "고객 카드 열기"로 넘어온 대상
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(() => consumeCustomerDetailTarget());

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const customers = await listSensoraCustomers(DEFAULT_SENSORA_WORKSPACE_ID);
        if (active) setStoredCustomers(customers);
      } catch (error) {
        if (active) setFirestoreError(getSensoraCustomerPersistenceMessage(error));
      } finally {
        if (active) setFirestoreLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myCustomers.filter((customer) => {
      if (stageFilter !== "all" && customer.stage !== stageFilter) return false;
      if (!q) return true;
      return [customer.name, customer.phone, customer.interestedModel, customer.memo]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [myCustomers, query, stageFilter]);

  const openCustomer = openCustomerId ? myCustomers.find((customer) => customer.id === openCustomerId) ?? null : null;

  const handleQuickAdd = () => {
    if (!newName.trim()) {
      setNotice("고객 이름을 입력해 주세요.");
      return;
    }
    const customer = addCustomer({ name: newName, phone: newPhone, interestedModel: newVehicle });
    setNewName("");
    setNewPhone("");
    setNewVehicle("");
    setAddOpen(false);
    setNotice(`${customer.name} 고객이 등록되었습니다.`);
    setOpenCustomerId(customer.id);
  };

  const stageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    myCustomers.forEach((customer) => counts.set(customer.stage, (counts.get(customer.stage) ?? 0) + 1));
    return counts;
  }, [myCustomers]);

  return (
    <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Customer Workspace</p>
          <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.035em] text-[var(--s-text)]">고객관리</h1>
          <p className="mt-1.5 text-[0.8125rem] text-[var(--s-text-3)]">
            대시보드 KPI·상담 메모와 같은 데이터입니다. 카드를 누르면 메모와 영업 정보를 수정할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen((open) => !open)}
          aria-expanded={addOpen}
          className="rounded-lg bg-[var(--s-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]"
        >
          {addOpen ? "추가 닫기" : "+ 고객 추가"}
        </button>
      </header>

      <div aria-live="polite">
        {notice ? (
          <p className="mt-5 rounded-lg border border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] px-4 py-3 text-[0.8125rem] text-[var(--s-ok-text)]" role="status">{notice}</p>
        ) : null}
      </div>

      {addOpen ? (
        <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:grid-cols-3" role="group" aria-label="새 고객 추가">
          <label className="text-xs font-medium text-[var(--s-text-2)]">
            이름 <span className="text-[var(--s-brand-text)]">*</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="예: 박민지" className={inputClass} />
          </label>
          <label className="text-xs font-medium text-[var(--s-text-2)]">
            연락처
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="예: 010-1234-5678" inputMode="tel" className={inputClass} />
          </label>
          <label className="text-xs font-medium text-[var(--s-text-2)]">
            관심 차량
            <input value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} placeholder="예: GV70 2.5T" className={inputClass} />
          </label>
          <div className="sm:col-span-3">
            <button type="button" onClick={handleQuickAdd} className="rounded-lg bg-[var(--s-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]">
              고객 등록
            </button>
          </div>
        </div>
      ) : null}

      {/* 요약 — 대시보드와 동일한 계산 결과 */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="고객관리 요약">
        {[
          ["전체 고객", String(myCustomers.length), "이 브라우저에 저장됨"],
          ["오늘 연락", String(kpi.counts.todayContacts), kpi.details.todayContacts],
          ["계약 가능성 높음", String(kpi.counts.highPotential), kpi.details.highPotential],
          ["지연 follow-up", String(kpi.counts.overdueFollowUps), kpi.details.overdueFollowUps],
        ].map(([label, value, detail]) => (
          <article key={label} className="min-h-[112px] rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-4">
            <p className="text-[0.8125rem] text-[var(--s-text-2)]">{label}</p>
            <p className="mt-3 text-[1.75rem] font-semibold leading-none text-[var(--s-text)]">{value}</p>
            <p className="mt-3 text-xs text-[var(--s-text-3)]">{detail}</p>
          </article>
        ))}
      </section>

      {/* 검색·필터 */}
      <section className="mt-6 rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="my-customer-list-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="my-customer-list-title" className="text-lg font-semibold text-[var(--s-text)]">내 고객</h2>
            <p className="mt-1 text-[0.8125rem] text-[var(--s-text-3)]">{filtered.length}명 표시 중 · 전체 {myCustomers.length}명</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-medium text-[var(--s-text-2)]">
              검색
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름·차량·메모"
                className="mt-2 block w-44 rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              />
            </label>
            <label className="text-xs font-medium text-[var(--s-text-2)]">
              영업 단계
              <select
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value)}
                className="mt-2 block rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2 text-sm text-[var(--s-text)] outline-none focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              >
                <option value="all">전체 ({myCustomers.length})</option>
                {DEALER_PIPELINE_STAGES.filter((stage) => stageCounts.has(stage)).map((stage) => (
                  <option key={stage} value={stage}>{stage} ({stageCounts.get(stage)})</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] px-4 py-8 text-center text-sm text-[var(--s-text-3)]">
            {myCustomers.length === 0 ? "아직 등록된 고객이 없습니다. 「+ 고객 추가」로 시작하세요." : "조건에 맞는 고객이 없습니다."}
          </p>
        ) : (
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {filtered.map((customer) => {
              const probability = customerProbability(customer);
              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => setOpenCustomerId(customer.id)}
                    className="w-full rounded-xl border border-[var(--s-border)] bg-[var(--s-deep)] p-4 text-left transition-colors hover:border-[var(--s-brand-border-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-ring)]"
                  >
                    <span className="flex flex-wrap items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[var(--s-text)]">{customer.name}</span>
                          <span className="rounded-full border border-[var(--s-border)] bg-[var(--s-card)] px-2 py-0.5 text-[0.6875rem] text-[var(--s-text-2)]">{customer.stage}</span>
                        </span>
                        <span className="mt-1.5 block text-sm text-[var(--s-text-2)]">{maskCustomerPhone(customer.phone)}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-semibold text-[var(--s-brand-text)]">{probability}%</span>
                        <span className="mt-0.5 block text-xs text-[var(--s-text-4)]">{formatDateTime(customer.updatedAt)}</span>
                      </span>
                    </span>
                    {customer.interestedModel ? <span className="mt-3 block text-sm font-medium text-[var(--s-text-emph)]">{customer.interestedModel}</span> : null}
                    <span className="mt-2 line-clamp-2 block text-[0.8125rem] leading-6 text-[var(--s-text-3)]">{customer.memo || "상담 메모가 아직 없습니다."}</span>
                    <span className="mt-3 flex items-center gap-3 border-t border-[var(--s-border)] pt-3">
                      <span className="text-xs font-semibold text-[var(--s-brand-text)]">카드 열기 · 수정 →</span>
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          setConsultingTarget(customer.id);
                          onNavigate?.("consulting");
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          event.preventDefault();
                          event.stopPropagation();
                          setConsultingTarget(customer.id);
                          onNavigate?.("consulting");
                        }}
                        className="cursor-pointer rounded text-xs font-medium text-[var(--s-text-3)] underline decoration-dotted transition-colors hover:text-[var(--s-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-ring)]"
                      >
                        AI 비서로 정리
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Firestore 전환 고객 */}
      <section className="mt-6 rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="stored-customer-list-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-ok-text)]">Live data</p>
            <h2 id="stored-customer-list-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">Firestore 전환 고객</h2>
            <p className="mt-1 text-[0.8125rem] text-[var(--s-text-3)]">승인 계정으로 로그인해 Lead에서 전환한 고객입니다.</p>
          </div>
          <span className="rounded-full border border-[var(--s-border)] bg-[var(--s-deep)] px-3 py-1.5 text-xs text-[var(--s-text-2)]">{storedCustomers.length}명</span>
        </div>

        {firestoreLoading ? <p className="mt-5 rounded-lg bg-[var(--s-deep)] px-4 py-5 text-sm text-[var(--s-text-2)]" role="status">Customer를 불러오는 중입니다…</p> : null}
        {!firestoreLoading && firestoreError ? <p className="mt-5 rounded-lg border border-[var(--s-err-border)] bg-[var(--s-err-tint)] px-4 py-4 text-sm text-[var(--s-err-text)]" role="alert">{firestoreError}</p> : null}
        {!firestoreLoading && !firestoreError && storedCustomers.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] px-4 py-8 text-center text-sm text-[var(--s-text-3)]">아직 전환된 Customer가 없습니다</p>
        ) : null}
        {!firestoreLoading && storedCustomers.length > 0 ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {storedCustomers.map((customer) => (
              <article key={customer.id} className="rounded-xl border border-[var(--s-border)] bg-[var(--s-deep)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-semibold text-[var(--s-text)]">{customer.name}</h3>
                  <span className="rounded-full bg-[var(--s-ok-tint)] px-2 py-1 text-xs text-[var(--s-ok-text)]">Firestore</span>
                </div>
                <p className="mt-2 text-sm text-[var(--s-text-2)]">{maskCustomerPhone(customer.phone)}</p>
                <p className="mt-3 text-sm font-medium text-[var(--s-text-emph)]">{customer.interestedVehicle}</p>
                <p className="mt-2 text-[0.8125rem] leading-6 text-[var(--s-text-3)]">{customer.memo || "전환된 Lead의 메모가 없습니다."}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {openCustomer ? (
        <SensoraCustomerCard
          key={openCustomer.id}
          customer={openCustomer}
          nextActions={state.nextActions}
          onClose={() => setOpenCustomerId(null)}
          onOpenConsulting={() => {
            setOpenCustomerId(null);
            onNavigate?.("consulting");
          }}
        />
      ) : null}
    </div>
  );
}
