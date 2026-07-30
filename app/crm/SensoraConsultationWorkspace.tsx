"use client";

import { useState, useSyncExternalStore } from "react";

import { engineLabel, requestConsultingDraft } from "./aiDraftClient";
import type { DraftTone, GroundedDraft } from "./consultingDraft";
import { SensoraGroundedDraftPanel } from "./SensoraGroundedDraftPanel";

import {
  addCustomer,
  addNextAction,
  consumeConsultingTarget,
  getCrmServerSnapshot,
  getCrmStateSnapshot,
  saveCustomerMemo,
  subscribeCrmState,
} from "./crmLocalStore";

const SALES_STYLES: readonly { id: DraftTone; label: string }[] = [
  { id: "polite", label: "정중한 톤" },
  { id: "simple", label: "간결한 톤" },
  { id: "friendly", label: "친근한 톤" },
];

type Notice = { tone: "success" | "info" | "error"; message: string } | null;

/** 클립보드 폴백 포함 복사 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 폴백 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * 상담 메모 워크스페이스 — 기존 CRM의 핵심 흐름(고객 선택/추가 → 메모 입력 → AI 검토용 초안)을
 * 워크스페이스 안에서 실제로 동작하게 옮긴 화면입니다.
 *
 * 원칙: AI 결과는 검토용 초안입니다. 저장·복사·다음 연락 생성은 전부 사용자가 버튼으로 실행하며,
 * 자동 저장·자동 발송은 없습니다. 데이터는 이 브라우저(localStorage)에 저장되고 기존 CRM과 공유됩니다.
 */
export function SensoraConsultationWorkspace({ sellerName }: { sellerName?: string }) {
  const crmState = useSyncExternalStore(subscribeCrmState, getCrmStateSnapshot, getCrmServerSnapshot);
  const customers = crmState.customers;

  // 고객관리에서 "상담 메모 작성"으로 넘어온 경우 해당 고객으로 시작합니다.
  // (이 화면은 사용자가 메뉴를 눌렀을 때만 클라이언트에서 마운트되므로 SSR 불일치가 없습니다)
  const [initialTarget] = useState(() => {
    const id = consumeConsultingTarget();
    if (!id) return { id: "", memo: "" };
    const customer = getCrmStateSnapshot().customers.find((c) => c.id === id);
    return customer ? { id, memo: customer.memo ?? "" } : { id: "", memo: "" };
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialTarget.id);
  const [memoDraft, setMemoDraft] = useState(initialTarget.memo);
  const [salesStyle, setSalesStyle] = useState<DraftTone>("polite");
  const [insights, setInsights] = useState<GroundedDraft | null>(null);
  const [insightsEngine, setInsightsEngine] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedMemo, setAnalyzedMemo] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newVehicle, setNewVehicle] = useState("");

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  const memoDirtySinceAnalysis = insights !== null && memoDraft.trim() !== analyzedMemo.trim();

  const say = (tone: NonNullable<Notice>["tone"], message: string) => setNotice({ tone, message });

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setInsights(null);
    setNotice(null);
    const customer = customers.find((c) => c.id === id);
    setMemoDraft(customer?.memo ?? "");
  };

  const handleAddCustomer = () => {
    if (!newName.trim()) {
      say("error", "고객 이름을 입력해 주세요.");
      return;
    }
    const customer = addCustomer({ name: newName, phone: newPhone, interestedModel: newVehicle });
    setSelectedCustomerId(customer.id);
    setMemoDraft("");
    setInsights(null);
    setNewName("");
    setNewPhone("");
    setNewVehicle("");
    setAddOpen(false);
    say("success", `${customer.name} 고객이 등록되었습니다. 이 브라우저에 저장됩니다.`);
  };

  const handleAnalyze = async () => {
    if (!memoDraft.trim()) {
      say("error", "상담 메모를 먼저 입력해 주세요.");
      return;
    }
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const result = await requestConsultingDraft(memoDraft, selectedCustomer, { tone: salesStyle, sellerName });
      setInsights(result.draft);
      setInsightsEngine(engineLabel(result));
      setAnalyzedMemo(memoDraft);
      say("info", `검토용 초안이 준비되었습니다 · ${engineLabel(result)}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMemo = () => {
    if (!selectedCustomer) {
      say("error", "메모를 저장할 고객을 먼저 선택해 주세요.");
      return;
    }
    const ok = saveCustomerMemo(selectedCustomer.id, memoDraft);
    say(ok ? "success" : "error", ok ? `${selectedCustomer.name} 고객 카드에 메모가 저장되었습니다.` : "저장에 실패했습니다. 고객을 다시 선택해 주세요.");
  };

  const handleCopySms = async () => {
    if (!insights) return;
    const ok = await copyText(insights.sms.text);
    say(ok ? "success" : "error", ok ? "문자 초안이 복사되었습니다. 발송 전 내용을 직접 확인하세요." : "복사에 실패했습니다. 초안을 직접 선택해 복사해 주세요.");
  };

  const handleCreateNextAction = () => {
    if (!insights) return;
    if (!selectedCustomer) {
      say("error", "다음 연락을 만들 고객을 먼저 선택해 주세요.");
      return;
    }
    if (insights.actions.length === 0) {
      say("info", "추가할 다음 행동이 없습니다.");
      return;
    }
    insights.actions.forEach((action) => addNextAction(selectedCustomer.id, action.title));
    say("success", `다음 연락 ${insights.actions.length}건이 추가되었습니다.`);
  };

  const noticeTone =
    notice?.tone === "success"
      ? "border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] text-[var(--s-ok-text)]"
      : notice?.tone === "error"
        ? "border-[var(--s-err-border)] bg-[var(--s-err-tint)] text-[var(--s-err-text)]"
        : "border-[var(--s-border)] bg-[var(--s-inner)] text-[var(--s-text-2)]";

  return (
    <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Consultation Notes</p>
          <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.035em] text-[var(--s-text)]">상담 메모</h1>
          <p className="mt-1.5 text-[0.8125rem] text-[var(--s-text-3)]">고객을 선택하고 메모를 입력하면 검토용 요약·문자 초안을 제안합니다.</p>
        </div>
        <span className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-2 text-xs text-[var(--s-text-2)]">이 브라우저에 저장 · 자동 발송 없음</span>
      </header>

      <div aria-live="polite">
        {notice ? (
          <p className={`mt-5 rounded-lg border px-4 py-3 text-[0.8125rem] ${noticeTone}`} role={notice.tone === "error" ? "alert" : "status"}>
            {notice.message}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* 왼쪽: 고객 선택 + 메모 입력 */}
        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="memo-input-title">
          <h2 id="memo-input-title" className="text-lg font-semibold text-[var(--s-text)]">고객과 상담 메모</h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
              고객 선택
              <select
                value={selectedCustomerId}
                onChange={(event) => handleSelectCustomer(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              >
                <option value="">{customers.length === 0 ? "등록된 고객이 없습니다" : "고객을 선택하세요"}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                    {customer.interestedModel ? ` · ${customer.interestedModel}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setAddOpen((open) => !open)}
              aria-expanded={addOpen}
              className="self-end rounded-lg border border-[var(--s-brand-border)] bg-[var(--s-brand-tint)] px-4 py-2.5 text-sm font-semibold text-[var(--s-brand-text)] transition-colors hover:bg-[var(--s-brand)] hover:text-white"
            >
              {addOpen ? "추가 닫기" : "+ 고객 추가"}
            </button>
          </div>

          {addOpen ? (
            <div className="mt-4 grid gap-3 rounded-xl border border-[var(--s-border)] bg-[var(--s-inner)] p-4 sm:grid-cols-3" role="group" aria-label="새 고객 추가">
              <label className="text-xs font-medium text-[var(--s-text-2)] sm:col-span-1">
                이름 <span className="text-[var(--s-brand-text)]">*</span>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="예: 박민지"
                  className="mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]" />
              </label>
              <label className="text-xs font-medium text-[var(--s-text-2)]">
                연락처
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="예: 010-1234-5678" inputMode="tel"
                  className="mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]" />
              </label>
              <label className="text-xs font-medium text-[var(--s-text-2)]">
                관심 차량
                <input value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} placeholder="예: GV70 2.5T"
                  className="mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]" />
              </label>
              <div className="sm:col-span-3">
                <button type="button" onClick={handleAddCustomer}
                  className="rounded-lg bg-[var(--s-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]">
                  고객 등록
                </button>
              </div>
            </div>
          ) : null}

          <label className="mt-5 block text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            상담 메모
            <textarea
              value={memoDraft}
              onChange={(event) => setMemoDraft(event.target.value)}
              placeholder={"평소 쓰던 대로 적으면 됩니다.\n예: 예산 5,200만 · 아내가 승차감 중요 · 12월 전 출고 희망 · 주 2회 장거리 출장"}
              className="mt-2 min-h-[220px] w-full resize-y rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-3 text-sm leading-7 text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-[var(--s-text-4)]">메모는 사용자가 직접 수정합니다. AI가 자동으로 덮어쓰지 않으며, 저장 버튼을 눌러야 고객 카드에 반영됩니다.</p>
          <p className="mt-1 text-xs leading-5 text-[var(--s-text-4)]">분석 버튼을 누르면 메모가 OpenAI 서버(해외)로 전송되어 분석됩니다. AI 키가 없으면 기기 내 규칙 분석만 사용합니다.</p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-[var(--s-text-2)]">
              문구 톤
              <select
                value={salesStyle}
                onChange={(event) => setSalesStyle(event.target.value as DraftTone)}
                className="mt-2 block rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              >
                {SALES_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>{style.label}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleAnalyze}
              className="rounded-lg bg-[var(--s-brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]"
            >
              {analyzing ? "분석 중…" : insights ? "다시 분석" : "AI 비서로 정리하기"}
            </button>
            <button
              type="button"
              onClick={handleSaveMemo}
              className="rounded-lg border border-[var(--s-border-2)] px-5 py-2.5 text-sm font-medium text-[var(--s-text-2)] transition-colors hover:border-[var(--s-brand-border-soft)] hover:text-[var(--s-text)]"
            >
              메모를 고객 카드에 저장
            </button>
          </div>
        </section>

        {/* 오른쪽: AI 검토용 초안 */}
        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="ai-draft-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">AI Assistant</p>
              <h2 id="ai-draft-title" className="mt-1 text-lg font-semibold text-[var(--s-text)]">검토용 초안</h2>
            </div>
            <span className="rounded-lg bg-[var(--s-brand-tint)] px-3 py-2 text-xs font-medium text-[var(--s-brand-text)]">
              {insightsEngine || "자동 저장·발송 없음"}
            </span>
          </div>

          <SensoraGroundedDraftPanel
            draft={insights}
            memoDirty={memoDirtySinceAnalysis}
            onCopySms={handleCopySms}
            onCreateActions={handleCreateNextAction}
            emptyHint={"왼쪽에서 상담 메모를 입력하고 「AI 비서로 정리하기」를 누르면\n확인된 사실 · 확인 필요 항목 · 다음 행동 · 문자 초안이 표시됩니다."}
          />
        </section>
      </div>
    </div>
  );
}
