"use client";

import type { Customer } from "@/app/crm/types";
import { DEALER_PIPELINE_STAGES } from "@/app/crm/constants";

export type PipelineSectionProps = {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
};

export function PipelineSection({ customers, onSelectCustomer }: PipelineSectionProps) {
  const byStage = (stage: string) => customers.filter((c) => c.stage === stage);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[20px] font-semibold text-[#111827]">영업 파이프라인</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">단계별로 고객을 모아 보았습니다. 행을 누르면 고객 화면으로 이동합니다.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {DEALER_PIPELINE_STAGES.map((stage) => {
          const list = byStage(stage);
          return (
            <section
              key={stage}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
              aria-label={stage}
            >
              <div className="flex items-baseline justify-between gap-2 border-b border-[#F1F5F9] pb-2">
                <h3 className="text-[14px] font-semibold text-[#111827]">{stage}</h3>
                <span className="text-[12px] font-bold tabular-nums text-[#64748B]">{list.length}</span>
              </div>
              <ul className="mt-3 max-h-[min(320px,45vh)] space-y-2 overflow-y-auto">
                {list.length === 0 ? (
                  <li className="text-[13px] text-[#94A3B8]">고객 없음</li>
                ) : (
                  list.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-[#F1F5F9] bg-[#FAFBFC] px-3 py-2 text-left text-[13px] font-medium text-[#374151] hover:bg-[#F1F5F9] touch-manipulation"
                        onClick={() => onSelectCustomer(c.id)}
                      >
                        <div className="font-semibold text-[#111827]">{c.name}</div>
                        <div className="mt-0.5 line-clamp-1 text-[12px] text-[#64748B]">
                          {[c.vehicleBrand, c.interestedModel].filter(Boolean).join(" ") || "차량 미입력"}
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
