"use client";

import Image from "next/image";

import { DEFAULT_GUIDE_ID, type SensoraGuideEntry } from "@/lib/sensoraGuide";

import { SensoraGuideCard } from "@/app/components/concierge/SensoraGuideCard";

type Props = {
  guides: readonly SensoraGuideEntry[];
  activeId: string;
  onSelectGuide: (id: string) => void;
  onExpandImage: () => void;
  tapToExpandLabel: string;
  getTitle: (g: SensoraGuideEntry) => string;
  getDescription: (g: SensoraGuideEntry) => string;
  /** 상단 숨김 헤더(모바일 "Guides" 라벨) 제거 시 true */
  hideThumbnailHeading?: boolean;
};

export function SensoraGuideGallery({
  guides,
  activeId,
  onSelectGuide,
  onExpandImage,
  tapToExpandLabel,
  getTitle,
  getDescription,
  hideThumbnailHeading = false,
}: Props) {
  const active = guides.find((g) => g.id === activeId) ?? guides[0];

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-5 lg:gap-7">
      <span className="sr-only" aria-live="polite" aria-atomic>
        {getTitle(active)}
      </span>
      <button
        type="button"
        onClick={onExpandImage}
        aria-label={`${tapToExpandLabel}: ${getTitle(active)}`}
        className="sensora-guide-hero-panel group relative w-full overflow-hidden rounded-[20px] text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_72px_-28px_rgba(56,189,248,0.12)] ring-1 ring-white/[0.12] transition-[box-shadow,transform] duration-300 hover:shadow-[0_0_64px_-20px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 touch-manipulation active:scale-[0.997] motion-reduce:transition-none motion-reduce:active:scale-100 sm:rounded-[24px] lg:rounded-[26px]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-violet-500/[0.06] opacity-[0.95]" aria-hidden />
        <div className="relative border-b border-white/[0.08] bg-[#030712]/80">
            <div className="sensora-guide-hero-image-shell relative mx-auto w-full max-w-[1080px] px-0.5 pt-0.5 sm:px-2 sm:pt-2">
              <div className="relative mx-auto aspect-[16/11] max-h-[min(15.5rem,calc(100dvh-12.5rem))] w-full overflow-hidden rounded-[15px] ring-2 ring-sky-400/35 ring-offset-2 ring-offset-[#030712] transition-[box-shadow] duration-300 group-hover:ring-sky-400/45 max-sm:ring-offset-1 sm:aspect-[16/10] sm:min-h-[16rem] sm:max-h-[min(58dvh,36rem)] sm:rounded-[20px] sm:ring-offset-2 lg:max-h-[min(52dvh,40rem)] lg:min-h-[20rem]">
                <Image
                  key={`${activeId}-${active.image}`}
                  src={active.image}
                  alt=""
                  fill
                  className="sensora-guide-hero-img object-contain object-top opacity-[0.98] transition-[opacity,filter,transform] duration-300 ease-out group-hover:brightness-[1.02]"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 100vw, min(1120px, 72vw)"
                  quality={100}
                  priority={active.id === DEFAULT_GUIDE_ID}
                />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040a14]/95 via-[#020617]/35 to-transparent" aria-hidden />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_40px_-20px_rgba(56,189,248,0.06)] mix-blend-screen" aria-hidden />
            </div>
          </div>
          <span className="absolute bottom-2 left-1/2 max-w-[min(100%-2rem,26rem)] -translate-x-1/2 text-center text-[9px] font-medium uppercase tracking-[0.11em] text-sky-200/75 sm:bottom-3.5 sm:text-[10.5px] sm:tracking-[0.12em]">
            {tapToExpandLabel}
          </span>
        </div>

        <div className="relative px-2.5 pb-2.5 pt-2.5 sm:px-8 sm:pb-7 sm:pt-5 lg:px-10">
          <p className="text-center text-[clamp(1rem,min(4.2vw+0.6rem),1.35rem)] font-semibold leading-snug tracking-[-0.02em] text-white transition-colors duration-200">
            {getTitle(active)}
          </p>
          <p className="mx-auto mt-2 max-w-[52ch] text-center text-[0.8125rem] leading-[1.5] text-slate-400 sm:mt-[0.875rem] sm:text-[0.9375rem] sm:leading-relaxed lg:max-w-[48ch]">
            {getDescription(active)}
          </p>
        </div>
      </button>

      <div>
        {!hideThumbnailHeading ?
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/75 sm:hidden" aria-hidden>
            Guides
          </p>
        : null}
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2.5 lg:gap-3.5">
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
