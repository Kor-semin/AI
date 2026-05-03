"use client";

import { Fragment } from "react";

/** 보안·검토 흐름 — 4노드 가로 스트립 */
export function PreviewDiagramSecurityStrip({ labels }: { labels: readonly [string, string, string, string] }) {
  return (
    <div className="sensora-diagram-strip-wrap w-full" role="img" aria-label={[...labels].join(" → ")}>
      <div className="flex min-w-0 flex-wrap items-stretch justify-center gap-y-3 sm:flex-nowrap sm:items-center sm:justify-between sm:gap-y-0">
        {labels.map((label, i) => (
          <Fragment key={`${label}-${i}`}>
            {i > 0 ? (
              <div
                className="sensora-diagram-edge hidden h-px min-w-[1.25rem] flex-[1_1_0] self-center sm:block sm:max-w-[3.5rem]"
                aria-hidden
              />
            ) : null}
            <div className="sensora-diagram-node w-[calc(50%-6px)] min-w-[6.75rem] max-w-[8.75rem] flex-1 sm:w-auto sm:min-w-[5.25rem] sm:max-w-[6.5rem]">
              <span className="sensora-diagram-node__pulse" aria-hidden />
              <span className="relative z-[1] text-[10px] font-semibold leading-snug tracking-tight text-slate-100 sm:text-[11px]">
                {label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** 가입 → 승인 → 설정 → 업무 */
export function PreviewDiagramWorkspaceStrip({ labels }: { labels: readonly [string, string, string, string] }) {
  return (
    <div className="sensora-diagram-strip-wrap w-full" role="img" aria-label={[...labels].join(" → ")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-1">
        {labels.map((label, i) => (
          <Fragment key={`${label}-${i}`}>
            {i > 0 ?
              <div className="sensora-diagram-edge-muted mx-auto h-6 w-px shrink-0 sm:mx-0 sm:h-px sm:w-4 sm:self-center md:w-10" aria-hidden />
            : null}
            <div className="sensora-diagram-node sensora-diagram-node--wide mx-auto max-w-[11rem] min-w-0 flex-1 sm:mx-0 sm:max-w-none">
              <span className="sensora-diagram-node__pulse sensora-diagram-node__pulse--violet" aria-hidden />
              <span className="relative z-[1] text-center text-[10px] font-semibold leading-snug text-slate-100 sm:text-[11px]">{label}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** 허브 + 5 스포크 (반응형: 모바일 2열 + 중앙) */
export function PreviewDiagramHubField({
  coreLabel,
  satellites,
}: {
  coreLabel: string;
  satellites: readonly [string, string, string, string, string];
}) {
  const [a, b, c, d, e] = satellites;
  return (
    <div className="sensora-diagram-hub relative w-full overflow-hidden rounded-[20px] border border-white/[0.1] bg-gradient-to-br from-[#050f1e]/92 via-[#030b14]/88 to-[#020617]/94 px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_48px_-20px_rgba(56,189,248,0.14)] backdrop-blur-md sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 sensora-diagram-engineering-lines opacity-[0.45]" aria-hidden />
      <svg className="pointer-events-none absolute left-1/2 top-[42%] h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]" aria-hidden>
        <defs>
          <linearGradient id="preview-hub-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.5)" />
            <stop offset="50%" stopColor="rgba(129,140,248,0.35)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.45)" />
          </linearGradient>
        </defs>
        <circle cx="50%" cy="50%" r="38%" fill="none" stroke="url(#preview-hub-glow)" strokeWidth="1" opacity="0.9" />
        <circle cx="50%" cy="50%" r="28%" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="0.5" />
      </svg>

      <div className="relative z-[1] mx-auto mb-4 flex max-w-[12rem] justify-center">
        <div className="sensora-diagram-hub-core px-6 py-2.5 text-center">
          <span className="text-[11px] font-semibold tracking-tight text-sky-50 sm:text-xs">{coreLabel}</span>
        </div>
      </div>

      <div className="relative z-[1] grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
        {[a, b, c, d, e].map((label, idx) => (
          <div key={`${idx}-${label}`} className="sensora-diagram-satellite text-center">
            <span className="mx-auto mb-1 flex size-2 rounded-full bg-gradient-to-br from-sky-400/55 to-violet-400/35 shadow-[0_0_12px_-2px_rgba(56,189,248,0.45)]" aria-hidden />
            <span className="text-[10px] font-semibold leading-snug text-slate-200 sm:text-[11px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 상담 메모 흐름 — 세로 */
export function PreviewDiagramConsultLadder({ labels }: { labels: readonly [string, string, string, string] }) {
  return (
    <div className="sensora-diagram-ladder mx-auto w-full max-w-[16rem]" role="img" aria-label={[...labels].join(" → ")}>
      {labels.map((label, i) => (
        <Fragment key={`${label}-${i}`}>
          <div className="sensora-diagram-ladder__row relative flex items-center gap-3">
            <span className="sensora-diagram-ladder__dot shrink-0" aria-hidden />
            <div className="sensora-diagram-ladder__panel min-w-0 flex-1 py-2.5 pl-1">
              <p className="text-[11px] font-semibold leading-snug text-slate-100 sm:text-[12px]">{label}</p>
            </div>
          </div>
          {i < labels.length - 1 ?
            <div className="sensora-diagram-ladder__connector ml-[7px]" aria-hidden />
          : null}
        </Fragment>
      ))}
    </div>
  );
}
