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

  const fieldCls =
    "min-h-[44px] w-full max-w-md rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-3 text-[14px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/45";

  return (
    <div className="sensora-premium-panel flex max-w-3xl flex-col gap-5 rounded-[22px] border-white/[0.11] px-5 py-6 shadow-[0_22px_50px_-28px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-7">
      <div>
        <h2 className="text-[20px] font-semibold text-slate-50">상담 메모</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-slate-400">
          메모는 사용자가 직접 수정합니다. AI가 자동으로 덮어쓰지 않습니다. 저장 시 CRM 고객 카드에 반영됩니다.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-[13px] font-semibold text-slate-300">선택 고객</span>
        <select value={selectedCustomerId ?? ""} onChange={(e) => onSelectCustomerId(e.target.value || null)} className={`${fieldCls} cursor-pointer`}>
          <option value="">고객 선택</option>
          {sorted.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {customers.length === 0 ? (
          <p className="text-[13px] text-slate-500">
            등록된 고객이 없습니다. 상단 「고객 추가」 또는 고객관리에서 「주소록 가져오기」를 이용해 주세요.
          </p>
        ) : null}
      </label>

      {!selectedCustomerId ? (
        <div className="rounded-2xl border border-dashed border-white/[0.14] bg-[#020817]/45 px-5 py-10 text-center text-[14px] text-slate-400 backdrop-blur-sm">
          고객을 선택하면 상담 메모를 편집할 수 있습니다. 고객을 추가하거나 주소록을 가져와 시작하세요.
        </div>
      ) : (
        <>
          <label className="grid gap-2">
            <span className="text-[13px] font-semibold text-slate-300">상담 메모</span>
            <textarea
              value={memoDraft}
              onChange={(e) => onMemoDraftChange(e.target.value)}
              rows={12}
              spellCheck={false}
              className={`${fieldCls} w-full resize-y leading-relaxed`}
              placeholder="상담 중 파악한 내용을 그대로 적어 주세요."
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabledSave}
              className="sensora-premium-primary-workspace min-h-[44px] rounded-xl px-5 py-2.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation"
              onClick={onSaveMemo}
            >
              메모 저장
            </button>
            <button
              type="button"
              disabled={!memoDraft.trim()}
              className="sensora-dark-ghost-btn min-h-[44px] rounded-xl px-5 py-2.5 text-[14px] font-semibold touch-manipulation disabled:opacity-40"
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
