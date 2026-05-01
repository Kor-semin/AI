"use client";

import type { Customer } from "@/app/crm/types";
export type ConsultingNotesSectionProps = {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomerId: (id: string | null) => void;
  memoDraft: string;
  onMemoDraftChange: (v: string) => void;
  onSaveMemo: () => void;
  onGoAi: () => void;
  disabledSave: boolean;
};

export function ConsultingNotesSection({
  customers,
  selectedCustomerId,
  onSelectCustomerId,
  memoDraft,
  onMemoDraftChange,
  onSaveMemo,
  onGoAi,
  disabledSave,
}: ConsultingNotesSectionProps) {
  const sorted = [...customers].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div>
        <h2 className="text-[20px] font-semibold text-[#111827]">상담 메모</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[#6B7280]">
          메모는 사용자가 직접 수정합니다. AI가 자동으로 덮어쓰지 않습니다. 저장 시 CRM 고객 카드에 반영됩니다.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-[13px] font-semibold text-[#374151]">선택 고객</span>
        <select
          value={selectedCustomerId ?? ""}
          onChange={(e) => onSelectCustomerId(e.target.value || null)}
          className="min-h-[44px] w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-[14px] outline-none focus:border-[#94A3B8]"
        >
          <option value="">고객을 선택하세요</option>
          {sorted.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {!selectedCustomerId ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-10 text-center text-[14px] text-[#64748B]">
          고객을 선택하면 상담 메모를 편집할 수 있습니다. 고객을 추가하거나 주소록을 가져와 시작하세요.
        </div>
      ) : (
        <>
          <label className="grid gap-2">
            <span className="text-[13px] font-semibold text-[#374151]">상담 메모</span>
            <textarea
              value={memoDraft}
              onChange={(e) => onMemoDraftChange(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] leading-relaxed text-[#111827] outline-none focus:border-[#94A3B8]"
              placeholder="상담 중 파악한 내용을 그대로 적어 주세요."
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabledSave}
              className="min-h-[44px] rounded-xl bg-[#111827] px-5 py-2.5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation"
              onClick={onSaveMemo}
            >
              메모 저장
            </button>
            <button
              type="button"
              disabled={!memoDraft.trim()}
              className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation"
              onClick={onGoAi}
            >
              AI 비서로 보내기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
