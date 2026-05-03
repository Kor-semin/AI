"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

export type SensoraGuideImageItem = {
  src: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** 동일 순서가 뷰어 슬라이드 1·2·… */
  images: readonly SensoraGuideImageItem[];
  /** 열 때 보여 줄 슬라이드 인덱스 */
  initialSlideIndex?: number;
  /** 헤더 제목 */
  title: string;
  /** 썸네일 `Image` 대체 접근 이름 (슬라이드 titleKey 번역 가능 시) */
  slideTitleKeys?: readonly TranslationKey[];
  /** 루트 오버레이 z-index (CRM 내부 다른 모달과 겹침 조절) */
  overlayZClass?: string;
};

export function SensoraGuideImageViewer({
  open,
  onClose,
  images,
  initialSlideIndex = 0,
  title,
  slideTitleKeys,
  overlayZClass = "z-[440]",
}: Props) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  const total = images.length;
  const safeIndex = total > 0 ? ((index % total) + total) % total : 0;

  useEffect(() => {
    if (!open || total === 0) return;
    const next = Math.min(Math.max(0, initialSlideIndex), total - 1);
    setIndex(next);
    setBroken({});
  }, [open, initialSlideIndex, total]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goPrev = useCallback(() => {
    if (total <= 0) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total <= 0) return;
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const openOriginalInNewTab = useCallback(() => {
    if (broken[safeIndex] || total === 0) return;
    const src = images[safeIndex]?.src;
    if (!src || typeof window === "undefined") return;
    try {
      const abs =
        src.startsWith("http://") || src.startsWith("https://")
          ? src
          : `${window.location.origin}${src.startsWith("/") ? src : `/${src}`}`;
      window.open(abs, "_blank", "noopener,noreferrer");
    } catch {
      /* ignore */
    }
  }, [broken, images, safeIndex, total]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || total === 0) return null;

  const slideAlt = slideTitleKeys?.[safeIndex] ? t(slideTitleKeys[safeIndex]) : "";

  return (
    <div
      data-sensora-guide-viewer
      className={[
        "fixed inset-0 flex items-end justify-center bg-black/[0.58] px-0 pb-0 pt-8 backdrop-blur-xl motion-safe:transition-[background-color] motion-safe:duration-300 sm:items-center sm:px-4 sm:pb-6 sm:pt-6",
        overlayZClass,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensora-guide-viewer-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t("landing.showroom.tip.closeOverlay")}
        onClick={onClose}
      />
      <div
        className="landing-guide-dialog-animate relative z-[1] flex max-h-[min(94dvh,94vh)] w-full max-w-[min(100%,920px)] flex-col overflow-hidden rounded-t-[22px] border border-white/[0.14] bg-gradient-to-b from-[#0a1628]/98 to-[#07111f]/97 pb-[max(4px,env(safe-area-inset-bottom,0px))] shadow-[0_40px_100px_-28px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.045)_inset,0_0_60px_-24px_rgba(56,189,248,0.065)] backdrop-blur-2xl sm:max-h-[min(90dvh,90vh)] sm:rounded-2xl sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] sm:px-5 sm:py-4 sm:pt-4">
          <div className="min-w-0">
            <p
              id="sensora-guide-viewer-title"
              className="truncate text-[15px] font-semibold tracking-tight text-slate-100 sm:text-base"
            >
              {title}
            </p>
            <p className="mt-1 text-[12px] font-medium text-slate-400">
              {t("landing.showroom.tip.guideWord")} {safeIndex + 1} / {total}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl border border-white/[0.14] bg-white/[0.06] px-3 py-2 text-[12px] font-semibold text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-200 hover:border-sky-400/30 hover:bg-white/[0.11] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
            onClick={onClose}
          >
            {t("landing.showroom.tip.close")}
          </button>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:flex-row sm:gap-4 sm:p-5">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 sm:gap-3">
            <div className="relative flex min-h-[min(240px,50dvh)] flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/[0.1] bg-[#020817]/90 sm:min-h-[min(300px,56dvh)] sm:flex-none">
              {broken[safeIndex] ? (
                <div className="max-w-sm px-6 text-center">
                  <p className="text-[14px] font-medium leading-relaxed text-slate-300">
                    {t("landing.showroom.tip.imageMissing")}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openOriginalInNewTab}
                  className="group relative flex h-full w-full max-h-[min(58dvh,560px)] min-h-[min(220px,45dvh)] cursor-zoom-in flex-col items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020817] sm:max-h-[min(62dvh,520px)] sm:min-h-[min(280px,48dvh)]"
                  aria-label={t("landing.showroom.tip.openOriginalAria")}
                >
                  <Image
                    src={images[safeIndex].src}
                    alt={slideAlt}
                    width={1600}
                    height={1200}
                    className="h-auto max-h-[min(58dvh,560px)] w-full max-w-full object-contain transition-[filter] duration-200 group-hover:brightness-[1.03] sm:max-h-[min(62dvh,520px)]"
                    sizes="(max-width: 640px) 100vw, 880px"
                    priority={safeIndex === 0}
                    onError={() => setBroken((m) => ({ ...m, [safeIndex]: true }))}
                  />
                </button>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020817]/75 to-transparent" />

              <div className="absolute inset-y-0 left-1 flex items-center sm:left-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-white/[0.18] bg-[#0f172a]/92 text-slate-100 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md transition duration-[220ms] ease-out hover:-translate-y-px hover:border-sky-400/42 hover:bg-[#141f33] hover:shadow-[0_12px_28px_-8px_rgba(56,189,248,0.12)] active:translate-y-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0 touch-manipulation"
                  aria-label={t("landing.showroom.tip.prev")}
                >
                  <span className="text-xl leading-none" aria-hidden>
                    ‹
                  </span>
                </button>
              </div>
              <div className="absolute inset-y-0 right-1 flex items-center sm:right-2">
                <button
                  type="button"
                  onClick={goNext}
                  className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-white/[0.18] bg-[#0f172a]/92 text-slate-100 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md transition duration-[220ms] ease-out hover:-translate-y-px hover:border-sky-400/42 hover:bg-[#141f33] hover:shadow-[0_12px_28px_-8px_rgba(56,189,248,0.12)] active:translate-y-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0 touch-manipulation"
                  aria-label={t("landing.showroom.tip.next")}
                >
                  <span className="text-xl leading-none" aria-hidden>
                    ›
                  </span>
                </button>
              </div>
            </div>

            {!broken[safeIndex] ? (
              <>
                <p className="px-0.5 text-[11px] font-medium leading-relaxed text-slate-500 sm:text-[12px]">
                  {t("landing.showroom.tip.openOriginalHint")}
                </p>
                <button
                  type="button"
                  onClick={openOriginalInNewTab}
                  className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center rounded-xl border border-sky-400/32 bg-sky-500/[0.12] px-4 py-3 text-[14px] font-semibold text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_32px_-10px_rgba(56,189,248,0.2)] transition hover:border-sky-400/45 hover:bg-sky-500/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/42 active:scale-[0.99] touch-manipulation sm:min-h-[46px]"
                  aria-label={t("landing.showroom.tip.openOriginalAria")}
                >
                  {t("landing.showroom.tip.openOriginal")}
                </button>
              </>
            ) : null}
          </div>

          <div className="flex max-w-full shrink-0 flex-row gap-2 overflow-x-auto overflow-y-hidden pb-[max(6px,env(safe-area-inset-bottom,0px))] [scrollbar-width:thin] sm:w-[5.5rem] sm:max-w-none sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden sm:pb-0 [&::-webkit-scrollbar]:h-1.5 sm:[&::-webkit-scrollbar]:h-auto">
            {images.map((item, i) => {
              const active = i === safeIndex;
              const thumbLabel = slideTitleKeys?.[i]
                ? t(slideTitleKeys[i])
                : `${t("landing.showroom.tip.guideWord")} ${i + 1}`;
              return (
                <button
                  key={`${item.src}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={[
                    "relative h-16 w-[4.85rem] shrink-0 overflow-hidden rounded-lg border shadow-[0_10px_28px_-16px_rgba(0,0,0,0.45)] transition-[border-color,opacity,transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.22,1,0.32,1)] sm:h-[4.35rem] sm:w-full motion-reduce:transition-none touch-manipulation",
                    active
                      ? "border-sky-400/52 ring-2 ring-sky-500/28 opacity-100 shadow-[0_0_28px_-8px_rgba(56,189,248,0.22)]"
                      : [
                          "border-white/[0.11] opacity-[0.82]",
                          "hover:-translate-y-0.5 hover:border-sky-400/26 hover:opacity-100 hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.5)]",
                          "motion-reduce:hover:translate-y-0 active:translate-y-0 active:scale-[0.98]",
                        ].join(" "),
                  ].join(" ")}
                  aria-current={active ? "true" : undefined}
                  aria-label={thumbLabel}
                >
                  {broken[i] ? (
                    <span className="flex h-full w-full items-center justify-center bg-slate-900/80 text-[10px] font-semibold text-slate-500">
                      —
                    </span>
                  ) : (
                    <Image
                      src={item.src}
                      alt=""
                      width={200}
                      height={120}
                      className="h-full w-full object-cover"
                      onError={() => setBroken((m) => ({ ...m, [i]: true }))}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
