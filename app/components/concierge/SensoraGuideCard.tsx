"use client";

import Image from "next/image";

type Props = {
  title: string;
  description: string;
  image: string;
  selected: boolean;
  onSelect: () => void;
};

export function SensoraGuideCard({ title, description, image, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "sensora-guide-pick-card group relative flex w-full touch-manipulation flex-col overflow-hidden rounded-[14px] text-left sm:rounded-[18px]",
        "border border-white/[0.1] bg-gradient-to-br from-slate-950/88 via-[#070f1c]/76 to-slate-950/45",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.065),0_12px_36px_-22px_rgba(0,0,0,0.55)] backdrop-blur-xl",
        "ring-1 ring-inset ring-white/[0.05]",
        "transition-[transform,border-color,box-shadow,background] duration-[220ms] ease-out",
        "hover:-translate-y-0.5 hover:border-sky-400/28 hover:shadow-[0_20px_46px_-18px_rgba(0,0,0,0.5),0_0_40px_-14px_rgba(56,189,248,0.14)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45",
        selected ?
          "sensora-guide-pick-card--active border-cyan-400/75 z-[1] -translate-y-0.5 ring-[3px] ring-cyan-400/55 ring-offset-2 ring-offset-[#020617] shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_0_0_1px_rgba(34,211,238,0.22),0_0_56px_-10px_rgba(34,211,238,0.28),0_0_88px_-28px_rgba(56,189,248,0.2)] motion-reduce:translate-y-0 motion-reduce:ring-2 motion-reduce:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(34,211,238,0.18)]"
        : "active:scale-[0.992]",
      ].join(" ")}
    >
      <div className="relative h-32 max-h-40 w-full shrink-0 overflow-hidden border-b border-white/[0.07] bg-[#030712]/95 sm:h-auto sm:max-h-none sm:aspect-[16/11]">
        {selected ? (
          <span
            className="pointer-events-none absolute right-3 top-3 z-[2] flex size-2.5 items-center justify-center rounded-full bg-sky-400 shadow-[0_0_16px_-1px_rgba(56,189,248,0.85)] ring-2 ring-sky-300/45"
            aria-hidden
          />
        ) : null}
        <Image
          src={image}
          alt=""
          fill
          className="object-cover object-center opacity-[0.94] transition duration-300 group-hover:opacity-[0.99] data-[selected=1]:opacity-[0.99]"
          data-selected={selected ? 1 : 0}
          sizes="(max-width:640px) 92vw, (max-width:1024px) 44vw, 360px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/92 via-[#020617]/25 to-transparent" aria-hidden />
        <div
          className={[
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            selected ? "opacity-100" : "",
          ].join(" ")}
          aria-hidden
          style={{
            background:
              "linear-gradient(135deg, rgba(34,211,238,0.16) 0%, transparent 44%, rgba(56,189,248,0.09) 58%, rgba(139,92,246,0.09) 100%)",
          }}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-[0.6875rem] pb-3 pt-[0.625rem] sm:px-[0.95rem] sm:pb-4 sm:pt-3.5">
        <p className="line-clamp-2 text-[0.765625rem] font-semibold leading-snug tracking-tight text-slate-50 sm:line-clamp-none sm:text-sm">{title}</p>
        <p className="mt-1 line-clamp-2 text-[10.25px] leading-[1.45] text-slate-400 sm:mt-1.5 sm:line-clamp-3 sm:text-[12px] sm:leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
