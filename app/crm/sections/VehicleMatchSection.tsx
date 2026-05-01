"use client";

import type { Customer } from "@/app/crm/types";
import { generateDemoConsultingResponse } from "@/app/components/concierge/aiDemoResponse";
import { useMemo } from "react";

export type VehicleMatchSectionProps = {
  customer: Customer | null;
  memoForAnalysis: string;
  onOpenCustomers: () => void;
};

/** aiDemoResponse 로직은 수정하지 않고, 메모 기준 참고 문구만 표시합니다. */
export function VehicleMatchSection({ customer, memoForAnalysis, onOpenCustomers }: VehicleMatchSectionProps) {
  const insight = useMemo(() => {
    const raw = memoForAnalysis.trim();
    if (!raw) return null;
    try {
      return generateDemoConsultingResponse(raw);
    } catch {
      return null;
    }
  }, [memoForAnalysis]);

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div>
        <h2 className="text-[20px] font-semibold text-[#111827]">차량·조건 매칭</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
          적합(fit) 보이는 모델과, 메모에 드러난 조건·예산 간격(gap)을 함께 짚는 방향으로 보면 설명이 더 단순해집니다. 관심 모델은
          존중하되 가족·좌석·예산·금융 방식 같은 실무 조건을 나란히 두고 비교합니다. 아래는 저장된 메모를{" "}
          <strong>바꾸지 않고</strong> 데모 규칙으로 정리한 참고 요약입니다.
        </p>
      </div>

      {!customer ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-10 text-center">
          <p className="text-[15px] font-medium text-[#475569]">고객을 먼저 선택해 주세요.</p>
          <button
            type="button"
            className="mt-4 min-h-[44px] rounded-xl bg-[#111827] px-5 py-2.5 text-[14px] font-semibold text-white touch-manipulation"
            onClick={onOpenCustomers}
          >
            고객 목록으로 이동
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[#111827]">{customer.name}</h3>
            <dl className="mt-4 grid gap-3 text-[14px]">
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#94A3B8]">관심 차량</dt>
                <dd className="mt-1 text-[#374151]">
                  {[customer.vehicleBrand, customer.interestedModel].filter(Boolean).join(" ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#94A3B8]">예산</dt>
                <dd className="mt-1 text-[#374151]">{customer.budget?.trim() || "—"}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#94A3B8]">금융 방식</dt>
                <dd className="mt-1 text-[#374151]">{customer.paymentType?.trim() || "—"}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-[#94A3B8]">상담 메모(발췌)</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-[#FAFBFC] p-3 text-[13px] text-[#475569]">
                  {(customer.memo ?? "").trim() ? clamp(customer.memo!, 520) : "메모 없음"}
                </dd>
              </div>
            </dl>
          </div>

          {insight ? (
            <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">메모 기준 참고 요약(AI 규칙)</h3>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-[#374151]">{insight.summary}</p>
              <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-[12px] text-[#64748B]">
                다음 액션(참고): {insight.nextAction.slice(0, 280)}
                {insight.nextAction.length > 280 ? "…" : ""}
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#E5E7EB] px-4 py-3 text-[13px] text-[#64748B]">
              비교할 메모가 비어 있습니다. 상담 메모에 용도·예산 등을 적어 두면 참고 카드가 나타납니다.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function clamp(s: string, n: number) {
  const t = s.trim();
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}
