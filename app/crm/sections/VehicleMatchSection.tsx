"use client";

import type { Customer } from "@/app/crm/types";
import { generateGroundedConsultingResponse as generateDemoConsultingResponse } from "@/app/crm/consultingDraft";
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
    <div className="sensora-premium-panel flex max-w-3xl flex-col gap-5 rounded-[22px] border-white/[0.11] px-5 py-6 backdrop-blur-xl sm:px-7">
      <div>
        <h2 className="text-[20px] font-semibold text-slate-50">차량·조건 매칭</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
          적합(fit) 보이는 모델과, 메모에 드러난 조건·예산 간격(gap)을 함께 짚는 방향으로 보면 설명이 더 단순해집니다. 관심 모델은
          존중하되 가족·좌석·예산·금융 방식 같은 실무 조건을 나란히 두고 비교합니다. 아래는 저장된 메모를{" "}
          <strong className="font-semibold text-slate-100">바꾸지 않고</strong> 데모 규칙으로 정리한 참고 요약입니다.
        </p>
      </div>

      {!customer ? (
        <div className="rounded-2xl border border-dashed border-white/[0.14] bg-[#020817]/45 px-5 py-10 text-center backdrop-blur-sm">
          <p className="text-[15px] font-medium text-slate-300">고객을 먼저 선택해 주세요.</p>
          <button
            type="button"
            className="sensora-premium-primary-workspace mt-4 min-h-[44px] rounded-xl px-5 py-2.5 text-[14px] font-semibold touch-manipulation"
            onClick={onOpenCustomers}
          >
            고객 목록으로 이동
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/[0.11] bg-gradient-to-b from-slate-950/5 to-transparent p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
            <h3 className="text-[14px] font-semibold text-slate-50">{customer.name}</h3>
            <dl className="mt-4 grid gap-3 text-[14px]">
              <div>
                <dt className="text-[12px] font-semibold uppercase text-slate-500">관심 차량</dt>
                <dd className="mt-1 text-slate-200">
                  {[customer.vehicleBrand, customer.interestedModel].filter(Boolean).join(" ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-slate-500">예산</dt>
                <dd className="mt-1 text-slate-200">{customer.budget?.trim() || "—"}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-slate-500">금융 방식</dt>
                <dd className="mt-1 text-slate-200">{customer.paymentType?.trim() || "—"}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase text-slate-500">상담 메모(발췌)</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-white/[0.08] bg-[#020817]/5 p-3 text-[13px] text-slate-400">
                  {(customer.memo ?? "").trim() ? clamp(customer.memo!, 520) : "메모 없음"}
                </dd>
              </div>
            </dl>
          </div>

          {insight ? (
            <div className="space-y-3 rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-950/25 to-[#07111f]/55 p-5 ring-1 ring-inset ring-white/[0.05] backdrop-blur-sm">
              <h3 className="text-[14px] font-semibold text-slate-50">메모 기준 참고 요약(AI 규칙)</h3>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-200">{insight.summary}</p>
              <div className="rounded-xl border border-dashed border-white/[0.12] bg-slate-950/35 px-3 py-2 text-[12px] text-slate-400">
                다음 액션(참고): {insight.nextAction.slice(0, 280)}
                {insight.nextAction.length > 280 ? "…" : ""}
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/[0.12] px-4 py-3 text-[13px] text-slate-500">
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
