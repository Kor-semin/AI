"use client";

import React from "react";

export function SensoraGuide({
  status,
  coachSubtitle,
  children,
}: {
  status: string;
  /** 배려 포인트 감지 등 짧은 데모 힌트(선택) */
  coachSubtitle?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#CBD5E1]/70 bg-[radial-gradient(900px_560px_at_30%_0%,rgba(148,163,184,0.22),transparent_58%),radial-gradient(820px_520px_at_100%_30%,rgba(59,130,246,0.18),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.85),rgba(248,250,252,0.75))] p-6 shadow-[0_26px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 opacity-[0.85] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_35%,black_55%,transparent_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(148,163,184,0.18),transparent_45%,rgba(59,130,246,0.14))]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_32%_22%,rgba(226,232,240,0.8),transparent_55%)]" />
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-start gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1]/70 bg-white/70 px-3 py-1 text-[12px] font-semibold text-[#334155] shadow-[0_1px_10px_rgba(15,23,42,0.06)]">
            <span className="relative inline-flex size-2">
              <span className="absolute inset-0 rounded-full bg-[#60A5FA] opacity-40 motion-reduce:animate-none [animation:sensora-pulse-ring_1.9s_ease-out_infinite]" />
              <span className="relative inline-block size-2 rounded-full bg-[#2563EB]" />
            </span>
            {status}
          </div>
          {coachSubtitle ? (
            <div className="max-w-[min(100%,38rem)] rounded-full border border-[#94a3b8]/40 bg-white/55 px-3 py-1 text-[11px] font-semibold leading-snug text-[#475569]">
              {coachSubtitle}
            </div>
          ) : null}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

