"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { engineLabel, requestConsultingDraft } from "./aiDraftClient";
import type { DraftTone, GroundedDraft } from "./consultingDraft";
import {
  addNextAction,
  consumeConsultingTarget,
  getCrmServerSnapshot,
  getCrmStateSnapshot,
  subscribeCrmState,
} from "./crmLocalStore";
import { maskCustomerPhone } from "./salesKpi";
import { SensoraGroundedDraftPanel } from "./SensoraGroundedDraftPanel";

const TONES: readonly { id: DraftTone; label: string }[] = [
  { id: "polite", label: "정중한 톤" },
  { id: "simple", label: "간결한 톤" },
  { id: "friendly", label: "친근한 톤" },
];

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
 * AI 비서 — 저장된 고객의 상담 메모를 근거로 검토용 초안을 만듭니다.
 * 상담 메모 화면이 "입력", 이 화면이 "정리"를 담당합니다.
 * 초안은 메모에서 확인된 내용만 사용합니다(consultingDraft.ts 원칙).
 */
export function SensoraAIAssistantView({ sellerName }: { sellerName?: string }) {
  const state = useSyncExternalStore(subscribeCrmState, getCrmStateSnapshot, getCrmServerSnapshot);
  const customers = state.customers;

  const [selectedId, setSelectedId] = useState<string>(() => consumeConsultingTarget() ?? "");
  const [tone, setTone] = useState<DraftTone>("polite");
  const [draft, setDraft] = useState<GroundedDraft | null>(null);
  const [draftEngine, setDraftEngine] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedFor, setAnalyzedFor] = useState<string>("");
  const [notice, setNotice] = useState("");

  const selected = customers.find((customer) => customer.id === selectedId) ?? null;
  const memo = selected?.memo?.trim() ?? "";

  // 메모가 있는 고객을 위로 정렬해 고를 수 있게 합니다.
  const sorted = useMemo(
    () => [...customers].sort((a, b) => Number(Boolean(b.memo?.trim())) - Number(Boolean(a.memo?.trim()))),
    [customers],
  );

  const analyze = async () => {
    if (!selected) {
      setNotice("먼저 고객을 선택해 주세요.");
      return;
    }
    if (!memo) {
      setNotice("이 고객은 저장된 상담 메모가 없습니다. 상담 메모 메뉴에서 먼저 작성해 주세요.");
      setDraft(null);
      return;
    }
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const result = await requestConsultingDraft(memo, selected, { tone, sellerName });
      setDraft(result.draft);
      setDraftEngine(engineLabel(result));
      setAnalyzedFor(`${selected.id}|${memo}|${tone}`);
      setNotice("");
    } finally {
      setAnalyzing(false);
    }
  };

  const staleDraft = draft !== null && selected !== null && analyzedFor !== `${selected.id}|${memo}|${tone}`;

  const handleCopy = async () => {
    if (!draft) return;
    const ok = await copyText(draft.sms.text);
    setNotice(ok ? "문자 초안을 복사했습니다. 대괄호 부분을 채운 뒤 직접 보내세요." : "복사에 실패했습니다. 초안을 직접 선택해 복사해 주세요.");
  };

  const handleCreateActions = () => {
    if (!draft || !selected) return;
    draft.actions.forEach((action) => addNextAction(selected.id, action.title));
    setNotice(`다음 연락 ${draft.actions.length}건을 ${selected.name} 고객에게 추가했습니다.`);
  };

  return (
    <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">AI Assistant</p>
          <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.035em] text-[var(--s-text)]">AI 비서</h1>
          <p className="mt-1.5 text-[0.8125rem] text-[var(--s-text-3)]">저장된 상담 메모에서 확인된 내용만으로 요약·다음 행동·문자 초안을 만듭니다.</p>
        </div>
        <span className="rounded-lg bg-[var(--s-brand-tint)] px-4 py-2 text-xs font-medium text-[var(--s-brand-text)]">근거 없는 내용은 생성하지 않음</span>
      </header>

      <div aria-live="polite">
        {notice ? (
          <p className="mt-5 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-[0.8125rem] text-[var(--s-text-2)]" role="status">{notice}</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* 고객 선택 + 메모 확인 */}
        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="ai-select-title">
          <h2 id="ai-select-title" className="text-lg font-semibold text-[var(--s-text)]">고객 선택</h2>
          <p className="mt-1 text-[0.8125rem] text-[var(--s-text-3)]">메모가 저장된 고객이 위에 표시됩니다.</p>

          <label className="mt-4 block text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            고객
            <select
              value={selectedId}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setDraft(null);
                setNotice("");
              }}
              className="mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
            >
              <option value="">{customers.length === 0 ? "등록된 고객이 없습니다" : "고객을 선택하세요"}</option>
              {sorted.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.memo?.trim() ? "● " : "○ "}
                  {customer.name}
                  {customer.interestedModel ? ` · ${customer.interestedModel}` : ""}
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <div className="mt-4 rounded-xl border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[var(--s-text)]">{selected.name}</span>
                <span className="rounded-full border border-[var(--s-border)] bg-[var(--s-card)] px-2 py-0.5 text-[0.6875rem] text-[var(--s-text-2)]">{selected.stage}</span>
                <span className="text-xs text-[var(--s-text-3)]">{maskCustomerPhone(selected.phone)}</span>
              </div>
              <p className="mt-3 text-xs font-medium text-[var(--s-text-3)]">저장된 상담 메모</p>
              <p className="mt-1.5 whitespace-pre-line rounded-lg bg-[var(--s-deep)] px-3 py-2.5 text-[0.8125rem] leading-7 text-[var(--s-text-2)]">
                {memo || "저장된 메모가 없습니다. 상담 메모 메뉴에서 작성해 주세요."}
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-[var(--s-text-2)]">
              문구 톤
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value as DraftTone)}
                className="mt-2 block rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              >
                {TONES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <button
              type="button"
              onClick={analyze}
              className="rounded-lg bg-[var(--s-brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]"
            >
              {analyzing ? "분석 중…" : draft ? "다시 분석" : "메모로 초안 만들기"}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--s-text-4)]">
            톤은 인사·맺음말 표현만 바꿉니다. 상담 내용 자체는 바뀌지 않습니다.
            분석 시 메모가 OpenAI 서버(해외)로 전송되며, AI 키가 없으면 기기 내 규칙 분석만 사용합니다.
          </p>
        </section>

        {/* 초안 */}
        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="ai-draft-title">
          <div className="flex items-start justify-between gap-4">
            <h2 id="ai-draft-title" className="text-lg font-semibold text-[var(--s-text)]">검토용 초안</h2>
            <span className="rounded-lg border border-[var(--s-border)] px-3 py-1.5 text-xs text-[var(--s-text-3)]">{draftEngine || "자동 저장·발송 없음"}</span>
          </div>
          <SensoraGroundedDraftPanel
            draft={draft}
            memoDirty={staleDraft}
            onCopySms={handleCopy}
            onCreateActions={handleCreateActions}
            emptyHint={"왼쪽에서 고객을 선택하고 「메모로 초안 만들기」를 누르면\n확인된 사실 · 확인 필요 항목 · 다음 행동 · 문자 초안이 표시됩니다."}
          />
        </section>
      </div>
    </div>
  );
}
