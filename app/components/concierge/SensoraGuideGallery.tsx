"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { SensoraGuideEntry } from "@/lib/sensoraGuide";

import { SensoraGuideCard } from "@/app/components/concierge/SensoraGuideCard";
import { SensoraFullscreenImageOverlay } from "@/app/components/concierge/SensoraFullscreenImageOverlay";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

type Props = {
  guides: readonly SensoraGuideEntry[];
  activeId: string;
  onSelectGuide: (id: string) => void;
  /** 레거시: 예전에는 상세 모달 진입 트리거로 쓰였습니다. 현재는 히어로 이미지를 앱 내 라이트박스로만 확대합니다. */
  onExpandImage?: () => void;
  tapToExpandLabel: string;
  getTitle: (g: SensoraGuideEntry) => string;
  getDescription: (g: SensoraGuideEntry) => string;
  hideThumbnailHeading?: boolean;
};

export function SensoraGuideGallery({
  guides,
  activeId,
  onSelectGuide,
  onExpandImage: _onExpandImage,
  tapToExpandLabel,
  getTitle,
  getDescription,
  hideThumbnailHeading = false,
}: Props) {
  const { t } = useLanguage();
  const active = guides.find((g) => g.id === activeId) ?? guides[0];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const slides = useMemo(
    () => guides.map((g) => ({ src: g.image, caption: getTitle(g) })),
    [guides, getTitle],
  );

  const initialLightboxIndex = useMemo(() => {
    const i = guides.findIndex((g) => g.id === activeId);
    return i >= 0 ? i : 0;
  }, [guides, activeId]);

  const closeGuideLightboxLabel = t("preview.toc.close");

  if (!active) {
    return (
      <div className="rounded-[20px] border border-white/[0.12] bg-slate-950/70 px-5 py-8 text-center">
        <p className="text-base font-semibold text-slate-50">{t("preview.guide.pageTitle")}</p>
        <p className="mx-auto mt-2 max-w-[32ch] text-sm leading-relaxed text-slate-400">
          {t("landing.showroom.tip.imageMissing")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-5 lg:gap-7">
      <SensoraFullscreenImageOverlay
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        closeLabel={closeGuideLightboxLabel}
        slides={slides}
        initialIndex={initialLightboxIndex}
      />

      <span className="sr-only" aria-live="polite" aria-atomic>
        {getTitle(active)}
      </span>

      <div className="sensora-guide-hero-panel group relative w-full overflow-hidden rounded-[20px] text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_72px_-28px_rgba(56,189,248,0.12)] ring-1 ring-white/[0.12] transition-[box-shadow] duration-300 hover:shadow-[0_0_64px_-20px_rgba(56,189,248,0.22)] sm:rounded-[24px] lg:rounded-[26px]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-violet-500/[0.06] opacity-[0.95]" aria-hidden />
        <div className="relative border-b border-white/[0.08] bg-[#030712]/80">
          <div className="sensora-guide-hero-image-shell relative mx-auto w-full max-w-[1080px] px-0.5 pt-0.5 sm:px-2 sm:pt-2">
            <div className="relative mx-auto aspect-[16/11] max-h-[min(15.5rem,calc(100dvh-12.5rem))] w-full overflow-hidden rounded-[15px] ring-2 ring-sky-400/35 ring-offset-2 ring-offset-[#030712] transition-[box-shadow] duration-300 group-hover:ring-sky-400/45 max-sm:ring-offset-1 sm:aspect-[16/10] sm:min-h-[16rem] sm:max-h-[min(58dvh,36rem)] sm:rounded-[20px] sm:ring-offset-2 lg:max-h-[min(52dvh,40rem)] lg:min-h-[20rem]">
              {/* 이미지 한 장만 확대 — 카드 텍스트·레이아웃 영역 분리 */}
              <button
                type="button"
                aria-label={`${tapToExpandLabel}: ${getTitle(active)}`}
                className="absolute inset-0 z-[3] rounded-[inherit] cursor-zoom-in touch-manipulation outline-none ring-inset focus-visible:ring-2 focus-visible:ring-sky-400/48"
                onClick={() => setLightboxOpen(true)}
              />
              {brokenImages[active.id] || !active.image ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                  <p className="text-sm font-semibold text-slate-100">{getTitle(active)}</p>
                  <p className="mt-2 max-w-[34ch] text-xs leading-relaxed text-slate-400">
                    {getDescription(active) || t("landing.showroom.tip.imageMissing")}
                  </p>
                </div>
              ) : (
                <Image
                  key={`${activeId}-${active.image}`}
                  src={active.image}
                  alt=""
                  fill
                  className="pointer-events-none sensora-guide-hero-img object-contain object-top opacity-[0.98] transition-[opacity,filter] duration-300 ease-out group-hover:brightness-[1.02]"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 100vw, min(1120px, 72vw)"
                  quality={100}
                  onError={() => setBrokenImages((prev) => ({ ...prev, [active.id]: true }))}
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040a14]/95 via-[#020617]/35 to-transparent" aria-hidden />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_40px_-20px_rgba(56,189,248,0.06)] mix-blend-screen" aria-hidden />
            </div>
          </div>
          <span className="pointer-events-none absolute bottom-2 left-1/2 max-w-[min(100%-2rem,26rem)] -translate-x-1/2 text-center text-[9px] font-medium uppercase tracking-[0.11em] text-sky-200/75 sm:bottom-3.5 sm:text-[10.5px] sm:tracking-[0.12em]">
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
      </div>

      <div>
        {!hideThumbnailHeading ?
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/75 sm:hidden" aria-hidden>
            가이드
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
