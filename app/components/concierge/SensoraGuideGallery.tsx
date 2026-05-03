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
    <div className="flex w-full min-w-0 flex-col gap-7 lg:gap-8">
      <button
        type="button"
        onClick={onExpandImage}
        className="sensora-guide-hero-panel group relative w-full overflow-hidden rounded-[24px] text-left ring-1 ring-white/[0.12] transition-[border-color,box-shadow,transform] duration-300 hover:shadow-[0_0_64px_-20px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 touch-manipulation active:scale-[0.997] motion-reduce:transition-none motion-reduce:active:scale-100 lg:rounded-[26px]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-violet-500/[0.06] opacity-[0.95]" aria-hidden />
        <div className="relative border-b border-white/[0.08] bg-[#030712]/80">
          <div className="relative mx-auto w-full max-w-[1080px]">
            <div className="relative aspect-[4/3] w-full min-h-[14rem] max-h-[min(58dvh,36rem)] sm:aspect-[16/10] sm:min-h-[18rem] lg:max-h-[min(52dvh,40rem)] lg:min-h-[20rem]">
              <Image
                key={active.image}
                src={active.image}
                alt=""
                fill
                className="object-contain object-top opacity-[0.98] transition duration-300 group-hover:brightness-[1.02]"
                sizes="(max-width:1024px) 100vw, min(1120px, 72vw)"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040a14]/95 via-[#020617]/35 to-transparent" aria-hidden />
            </div>
          </div>
          <span className="absolute bottom-3 left-1/2 max-w-[min(100%-2.5rem,28rem)] -translate-x-1/2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-sky-200/75 sm:bottom-3.5 sm:text-[10.5px]">
            {tapToExpandLabel}
          </span>
        </div>

        <div className="relative px-4 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-6 lg:px-10">
          <p className="text-center text-[clamp(1.05rem,2.4vw,1.35rem)] font-semibold leading-snug tracking-[-0.02em] text-white">
            {getTitle(active)}
          </p>
          <p className="mx-auto mt-3 max-w-[52ch] text-center text-[0.875rem] leading-relaxed text-slate-400 sm:mt-[0.875rem] sm:text-[0.9375rem] lg:max-w-[48ch]">
            {getDescription(active)}
          </p>
        </div>
      </button>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/75 sm:hidden" aria-hidden>
          Guides
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 lg:gap-4">
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
  );
}
