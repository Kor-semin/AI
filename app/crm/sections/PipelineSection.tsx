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
        <h2 className="text-[20px] font-semibold text-slate-50">영업 단계</h2>
        <p className="mt-1 text-[14px] text-slate-400">단계별로 고객을 모아 보았습니다. 행을 누르면 고객 화면으로 이동합니다.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {DEALER_PIPELINE_STAGES.map((stage) => {
          const list = byStage(stage);
          return (
            <section
              key={stage}
              className="rounded-2xl border border-white/[0.11] bg-gradient-to-b from-slate-950/52 to-[#07111f]/58 p-4 shadow-[0_22px_48px_-28px_rgba(0,0,0,0.48)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm"
              aria-label={stage}
            >
              <div className="flex items-baseline justify-between gap-2 border-b border-white/[0.08] pb-2">
                <h3 className="text-[14px] font-semibold text-slate-50">{stage}</h3>
                <span className="text-[12px] font-bold tabular-nums text-slate-400">{list.length}</span>
              </div>
              <ul className="mt-3 max-h-[min(320px,45vh)] space-y-2 overflow-y-auto">
                {list.length === 0 ? (
                  <li className="text-[13px] text-slate-500">고객 없음</li>
                ) : (
                  list.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-white/[0.08] bg-[#020817]/45 px-3 py-2 text-left text-[13px] font-medium text-slate-200 transition-colors duration-200 hover:border-sky-400/22 hover:bg-[#07111f]/65 active:scale-[0.997] touch-manipulation"
                        onClick={() => onSelectCustomer(c.id)}
                      >
                        <div className="font-semibold text-slate-50">{c.name}</div>
                        <div className="mt-0.5 line-clamp-1 text-[12px] text-slate-400">
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
