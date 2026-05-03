"use client";

import Image from "next/image";

type Props = {
  title: string;
  description: string;
  image: string;
  selected: boolean;
  onSelect: () => void;
};

const glassInteractive =
  "sensora-glass-surface rounded-2xl text-left ring-1 transition-[border-color,box-shadow,transform] duration-200 hover:border-sky-400/32 hover:shadow-[0_0_32px_-12px_rgba(56,189,248,0.18)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38";

export function SensoraGuideCard({ title, description, image, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        glassInteractive,
        "flex w-[min(11.5rem,72vw)] shrink-0 snap-start touch-manipulation flex-col overflow-hidden pb-3.5 pt-0",
        selected ? "sensora-glass-surface--cta ring-sky-400/45" : "ring-white/[0.07]",
      ].join(" ")}
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-t-xl border-b border-white/[0.08] bg-[#030712]/90">
        <Image src={image} alt="" fill className="object-cover object-center opacity-[0.94]" sizes="184px" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-transparent" aria-hidden />
      </div>
      <div className="min-h-0 flex-1 px-3 pt-2.5">
        <p className="text-[0.8125rem] font-semibold leading-snug text-slate-50 sm:text-sm">{title}</p>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-slate-400 sm:text-xs">{description}</p>
      </div>
    </button>
  );
}
