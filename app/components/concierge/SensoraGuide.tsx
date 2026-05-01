"use client";

import React from "react";

export function SensoraGuide({
  status,
  coachSubtitle,
  statusBusy = false,
  children,
  className,
}: {
  status: string;
  /** 배려 포인트 감지 등 짧은 데모 힌트(선택) */
  coachSubtitle?: string | null;
  /** 상태 칩 좌측 인디케이터(분석 중 등) */
  statusBusy?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-[linear-gradient(180deg,#fafbfc_0%,#f3f4f6_50%,#eef1f5_100%)] p-5 shadow-[0_14px_44px_-26px_rgba(15,23,42,0.18)] sm:p-6",
        className ?? "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(720px_420px_at_28%_-10%,rgba(226,232,240,0.65),transparent_55%)]" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-[#334155] shadow-[0_1px_10px_rgba(15,23,42,0.05)]">
            <span className="relative inline-flex size-2">
              <span
                className={[
                  "absolute inset-0 rounded-full opacity-35 motion-reduce:animate-none",
                  statusBusy
                    ? "bg-[#64748B] [animation:sensora-pulse-ring_1.9s_ease-out_infinite]"
                    : "opacity-0",
                ].join(" ")}
              />
              <span
                className={[
                  "relative inline-block size-2 rounded-full",
                  statusBusy ? "bg-[#64748B]" : "bg-[#475569]",
                ].join(" ")}
              />
            </span>
            {status}
          </div>
          {coachSubtitle ? (
            <div className="max-w-[min(100%,38rem)] rounded-full border border-[#E5E7EB] bg-white/85 px-3 py-1.5 text-[11px] font-semibold leading-snug text-[#4B5563]">
              {coachSubtitle}
            </div>
          ) : null}
        </div>

        <div className="relative mt-4 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
