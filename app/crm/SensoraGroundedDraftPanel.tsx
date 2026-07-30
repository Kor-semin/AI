"use client";

import type { GroundedDraft } from "./consultingDraft";

/**
 * 검토용 초안 표시 패널 — 상담 메모 화면과 AI 비서 화면이 공유합니다.
 *
 * 표시 원칙: 모든 항목에 "근거(메모 원문)"를 함께 보여주고,
 * 확인되지 않은 항목은 빈칸으로 두지 않고 "확인 필요"로 드러냅니다.
 */

type Props = {
  draft: GroundedDraft | null;
  memoDirty: boolean;
  onCopySms: () => void;
  onCreateActions: () => void;
  emptyHint: string;
};

export function SensoraGroundedDraftPanel({ draft, memoDirty, onCopySms, onCreateActions, emptyHint }: Props) {
  if (!draft) {
    return (
      <div className="mt-6 grid min-h-[280px] place-items-center rounded-xl border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] px-6 py-10 text-center">
        <p className="whitespace-pre-line text-[0.8125rem] leading-6 text-[var(--s-text-3)]">{emptyHint}</p>
      </div>
    );
  }

  const memoFacts = draft.facts.filter((fact) => fact.source === "memo");
  const cardFacts = draft.facts.filter((fact) => fact.source === "card");

  return (
    <div className="mt-6 space-y-4">
      {memoDirty ? (
        <p className="rounded-lg border border-[var(--s-warn-border)] bg-[var(--s-warn-tint)] px-4 py-3 text-xs leading-5 text-[var(--s-warn-text)]">
          메모가 분석 이후 수정되었습니다. 「다시 분석」을 눌러 주세요. (자동 재분석은 하지 않습니다)
        </p>
      ) : null}

      {draft.thinMemo ? (
        <p className="rounded-lg border border-[var(--s-warn-border)] bg-[var(--s-warn-tint)] px-4 py-3 text-xs leading-5 text-[var(--s-warn-text)]">
          메모가 짧아 확인된 사실이 적습니다. 내용을 더 입력하면 초안 정확도가 올라갑니다.
        </p>
      ) : null}

      {/* 1) 메모에서 확인된 사실 — 근거 표시 */}
      <section className="rounded-xl border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--s-ok-tint)] px-2 py-0.5 text-[0.6875rem] font-bold text-[var(--s-ok-text)]">확인</span>
          <h4 className="text-sm font-semibold text-[var(--s-text)]">메모에서 확인된 내용</h4>
          <span className="text-xs text-[var(--s-text-4)]">{memoFacts.length}건</span>
        </div>
        {memoFacts.length === 0 ? (
          <p className="mt-3 text-[0.8125rem] leading-6 text-[var(--s-text-3)]">메모에서 확인된 항목이 없습니다. 초안에 사실을 만들어 넣지 않았습니다.</p>
        ) : (
          <ul className="mt-3 grid gap-2.5">
            {memoFacts.map((fact) => (
              <li key={fact.id} className="rounded-lg bg-[var(--s-card)] px-3 py-2.5">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-xs font-medium text-[var(--s-text-3)]">{fact.label}</span>
                  <span className="text-[0.8125rem] font-semibold text-[var(--s-text)]">{fact.value}</span>
                </span>
                <span className="mt-1.5 block border-l-2 border-[var(--s-brand-dot)] pl-2 text-xs leading-5 text-[var(--s-text-4)]">
                  근거 “{fact.quote}”
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2) 고객 카드에 저장된 값 — 메모와 구분 */}
      {cardFacts.length > 0 ? (
        <section className="rounded-xl border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[var(--s-border-2)] px-2 py-0.5 text-[0.6875rem] font-bold text-[var(--s-text-3)]">카드</span>
            <h4 className="text-sm font-semibold text-[var(--s-text)]">고객 카드에 저장된 정보</h4>
          </div>
          <ul className="mt-3 grid gap-1.5">
            {cardFacts.map((fact) => (
              <li key={fact.id} className="flex flex-wrap items-baseline gap-x-2 text-[0.8125rem]">
                <span className="text-xs text-[var(--s-text-3)]">{fact.label}</span>
                <span className="font-medium text-[var(--s-text-2)]">{fact.value}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 3) 확인 필요 — 추측하지 않고 남긴 항목 */}
      {draft.missing.length > 0 ? (
        <section className="rounded-xl border border-[var(--s-warn-border)] bg-[var(--s-warn-tint)] p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--s-card)] px-2 py-0.5 text-[0.6875rem] font-bold text-[var(--s-warn-text)]">확인 필요</span>
            <h4 className="text-sm font-semibold text-[var(--s-warn-text-strong)]">메모에서 확인되지 않은 항목</h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--s-warn-text-soft)]">추측해서 채우지 않았습니다. 다음 통화에서 확인하세요.</p>
          <ul className="mt-3 grid gap-1.5">
            {draft.missing.map((field) => (
              <li key={field.id} className="text-[0.8125rem] leading-6 text-[var(--s-warn-text-strong)]">
                · {field.label} <span className="text-xs text-[var(--s-warn-text-soft)]">— {field.why}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 4) 다음 행동 — 짧은 실행 문장 */}
      <section className="rounded-xl border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-[var(--s-text)]">다음 행동</h4>
          {draft.actions.length > 0 ? (
            <button type="button" onClick={onCreateActions} className="rounded-lg border border-[var(--s-border-2)] px-3 py-1.5 text-xs font-medium text-[var(--s-text-2)] transition-colors hover:text-[var(--s-text)]">
              전체를 다음 연락으로 추가
            </button>
          ) : null}
        </div>
        {draft.actions.length === 0 ? (
          <p className="mt-3 text-[0.8125rem] text-[var(--s-text-3)]">제안할 행동이 없습니다.</p>
        ) : (
          <ol className="mt-3 grid gap-2">
            {draft.actions.map((action, index) => (
              <li key={action.title} className="rounded-lg bg-[var(--s-card)] px-3 py-2.5">
                <span className="flex items-baseline gap-2.5">
                  <span className="text-xs font-semibold text-[var(--s-text-4)]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[0.8125rem] font-semibold text-[var(--s-text)]">{action.title}</span>
                </span>
                <span className="mt-1 block pl-7 text-xs leading-5 text-[var(--s-text-4)]">{action.basis}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 5) 문자 초안 */}
      <section className="rounded-xl border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-[var(--s-text)]">검토용 문자 초안</h4>
          <span className="rounded-full bg-[var(--s-brand-tint)] px-2.5 py-1 text-[0.6875rem] font-semibold text-[var(--s-brand-text)]">발송 전 직접 확인</span>
        </div>
        <p className="mt-3 whitespace-pre-line rounded-lg border border-[var(--s-border)] bg-[var(--s-deep)] px-4 py-3 text-[0.8125rem] leading-7 text-[var(--s-text)]">
          {draft.sms.text}
        </p>
        {draft.sms.placeholders.length > 0 ? (
          <p className="mt-2 text-xs leading-5 text-[var(--s-warn-text)]">
            대괄호 {draft.sms.placeholders.map((p) => `[${p}]`).join(", ")} 는 임의로 만들지 않았습니다. 직접 채운 뒤 보내세요.
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-5 text-[var(--s-text-4)]">
          이 초안은 메모에서 확인된 내용만 사용했습니다. 금액·일정·금융 조건을 자동으로 생성하지 않습니다.
        </p>
        <button type="button" onClick={onCopySms} className="mt-3 rounded-lg bg-[var(--s-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]">
          문자 초안 복사
        </button>
      </section>
    </div>
  );
}
