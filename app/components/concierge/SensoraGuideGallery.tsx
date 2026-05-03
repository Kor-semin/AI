"use client";

import Image from "next/image";

import type { SensoraGuideEntry } from "@/lib/sensoraGuide";

import { SensoraGuideCard } from "@/app/components/concierge/SensoraGuideCard";

type Props = {
  guides: readonly SensoraGuideEntry[];
  activeId: string;
  onSelectGuide: (id: string) => void;
  onExpandImage: () => void;
  tapToExpandLabel: string;
  /** 제목·설명 텍스트는 부모에서 t()로 넘김 */
  getTitle: (g: SensoraGuideEntry) => string;
  getDescription: (g: SensoraGuideEntry) => string;
};

export function SensoraGuideGallery({
  guides,
  activeId,
  onSelectGuide,
  onExpandImage,
  tapToExpandLabel,
  getTitle,
  getDescription,
}: Props) {
  const active = guides.find((g) => g.id === activeId) ?? guides[0];

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <button
        type="button"
        onClick={onExpandImage}
        className="sensora-glass-surface group relative mx-auto w-full max-w-xl overflow-hidden rounded-[22px] text-left ring-1 ring-white/[0.1] transition-[border-color,box-shadow,transform] duration-200 hover:border-sky-400/32 hover:shadow-[0_0_48px_-16px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 touch-manipulation active:scale-[0.993] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <div className="relative aspect-[4/3] w-full max-h-[min(52dvh,28rem)] min-h-[12.5rem] bg-[#030712]/95 sm:aspect-[16/11]">
          <Image
            key={active.image}
            src={active.image}
            alt=""
            fill
            className="object-contain object-top opacity-[0.97] transition duration-300 group-hover:brightness-[1.025]"
            sizes="(max-width:640px) 100vw, 36rem"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/88 via-transparent to-transparent" aria-hidden />
          <span className="absolute bottom-3 left-1/2 max-w-[min(100%-2rem,24rem)] -translate-x-1/2 text-center text-[11px] font-medium text-sky-200/90">
            {tapToExpandLabel}
          </span>
        </div>
        <div className="sensora-diagram-strip-wrap mx-4 mb-4 mt-1 border-none bg-transparent px-4 py-4 shadow-none ring-0 sm:mx-5 sm:py-5">
          <p className="text-center text-[clamp(1rem,4vw,1.2rem)] font-semibold leading-snug tracking-tight text-white">{getTitle(active)}</p>
          <p className="mx-auto mt-3 max-w-[40ch] text-center text-[0.875rem] leading-relaxed text-slate-400 sm:text-[0.9375rem]">{getDescription(active)}</p>
        </div>
      </button>

      <div className="-mx-1 px-1">
        <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:justify-center sm:overflow-visible sm:pb-0">
          <div className="flex min-w-max snap-x gap-2.5 sm:min-w-0 sm:flex-wrap sm:justify-center sm:gap-3">
            {guides.map((g) => (
              <SensoraGuideCard
                key={g.id}
                title={getTitle(g)}
                description={getDescription(g)}
                image={g.image}
                selected={g.id === activeId}
                onSelect={() => onSelectGuide(g.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
