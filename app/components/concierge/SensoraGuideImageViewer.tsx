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

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        e.stopPropagation();
        return;
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || total === 0) return null;

  const slideAlt = slideTitleKeys?.[safeIndex] ? t(slideTitleKeys[safeIndex]) : "";
  const captionLabel = slideAlt || `${t("landing.showroom.tip.guideWord")} ${safeIndex + 1}`;
  const closeLabel = t("preview.toc.close");

  const thumbSafe = "pb-[max(12px,calc(env(safe-area-inset-bottom,0px)+10px))]";

  return (
    <div
      data-sensora-guide-viewer
      className={[
        "fixed inset-0 flex items-end justify-center bg-black/[0.58] backdrop-blur-xl max-md:pb-[env(safe-area-inset-bottom,0px)] max-md:pt-2 sm:items-center sm:px-4 sm:pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+10px))] sm:pt-[max(0.375rem,calc(env(safe-area-inset-top,0px)+8px))]",
        overlayZClass,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensora-guide-viewer-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default"
        aria-label={t("landing.showroom.tip.closeOverlay")}
        onClick={onClose}
      />
      <div
        className="landing-guide-dialog-animate sensora-guide-viewer-shell sensora-guide-modal-cosmos relative z-[1] flex max-h-[min(calc(100svh-0.85rem-env(safe-area-inset-bottom,0px)-env(safe-area-inset-top,0px)),96svh)] w-full max-w-[min(96vw,min(1320px,100%))] flex-col overflow-hidden rounded-t-[20px] border border-white/[0.14] bg-gradient-to-b from-[#0a1628]/98 to-[#07111f]/97 shadow-[0_40px_100px_-28px_rgba(0,0,0,0.72)] backdrop-blur-2xl max-md:rounded-t-[18px] sm:max-h-[min(94dvh,94vh)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-2.5 pt-[max(8px,calc(env(safe-area-inset-top,0px)+2px))] sm:px-5 sm:py-3.5 sm:pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))]">
          <div className="min-w-0">
            <p id="sensora-guide-viewer-title" className="truncate text-[0.9375rem] font-semibold tracking-tight text-slate-100 sm:text-base">
              {title}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {t("landing.showroom.tip.guideWord")} {safeIndex + 1} / {total}
            </p>
          </div>
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-xl border border-white/[0.14] bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200 transition duration-200 hover:border-sky-400/30 hover:bg-white/[0.11] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
            onClick={onClose}
            aria-label={closeLabel}
          >
            {closeLabel}
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-3 sm:p-5">
            <div className="relative flex min-h-[min(48dvh,300px)] items-center justify-center sm:min-h-[min(52dvh,360px)]">
              <button
                type="button"
                onClick={goPrev}
                className="sensora-guide-nav-fab absolute left-0.5 top-1/2 z-[2] flex size-[2.6875rem] -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.14] bg-[#0c1422]/95 text-sky-50 shadow-lg backdrop-blur-md transition hover:border-sky-400/38 touch-manipulation sm:left-2"
                aria-label={t("landing.showroom.tip.prev")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-95" aria-hidden>
                  <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="sensora-guide-nav-fab absolute right-0.5 top-1/2 z-[2] flex size-[2.6875rem] -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.14] bg-[#0c1422]/95 text-sky-50 shadow-lg backdrop-blur-md transition hover:border-sky-400/38 touch-manipulation sm:right-2"
                aria-label={t("landing.showroom.tip.next")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-95" aria-hidden>
                  <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="relative z-[1] mx-auto flex h-[min(56dvh,420px)] w-full max-w-[min(1400px,calc(100vw-36px))] items-center justify-center px-10 sm:h-[min(60dvh,520px)] sm:px-14">
                {broken[safeIndex] ? (
                  <div className="max-w-sm px-6 text-center">
                    <p className="text-sm font-medium leading-relaxed text-slate-300">{t("landing.showroom.tip.imageMissing")}</p>
                  </div>
                ) : (
                  <Image
                    src={images[safeIndex].src}
                    alt={slideAlt || captionLabel}
                    fill
                    className="object-contain object-center"
                    sizes="(max-width:640px) 92vw,(max-width:1280px) 90vw, min(1320px, 92vw)"
                    quality={100}
                    onError={() => setBroken((m) => ({ ...m, [safeIndex]: true }))}
                  />
                )}
              </div>
            </div>

            <p className="mx-auto mt-3 max-w-[48ch] px-1 text-center text-[11px] font-medium leading-snug text-slate-400 sm:mt-4 sm:text-xs">{captionLabel}</p>
          </div>

          <div className={`hidden shrink-0 border-t border-white/[0.09] bg-[#040c18]/94 md:block ${thumbSafe}`}>
            <div className="sensora-guide-thumb-rail flex max-w-full gap-2 overflow-x-auto overflow-y-hidden px-3 pb-2 pt-2.5 sm:px-5">
              {images.map((item, i) => {
                const activeThumb = i === safeIndex;
                const thumbLabel = slideTitleKeys?.[i] ? t(slideTitleKeys[i]) : `${t("landing.showroom.tip.guideWord")} ${i + 1}`;
                return (
                  <button
                    key={`${item.src}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={[
                      "relative h-[3.375rem] w-[4.125rem] shrink-0 overflow-hidden rounded-lg border shadow-[0_10px_28px_-16px_rgba(0,0,0,0.45)] transition-[border-color,opacity,transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.22,1,0.32,1)] motion-reduce:transition-none touch-manipulation",
                      activeThumb
                        ? "border-sky-400/55 ring-2 ring-sky-500/28 opacity-100 shadow-[0_0_28px_-8px_rgba(56,189,248,0.22)]"
                        : [
                            "border-white/[0.11] opacity-[0.82]",
                            "hover:-translate-y-0.5 hover:border-sky-400/26 hover:opacity-100 hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.5)]",
                            "motion-reduce:hover:translate-y-0 active:translate-y-0 active:scale-[0.98]",
                          ].join(" "),
                    ].join(" ")}
                    aria-current={activeThumb ? "true" : undefined}
                    aria-label={thumbLabel}
                  >
                    {broken[i] ? (
                      <span className="flex h-full w-full items-center justify-center bg-slate-900/80 text-[0.625rem] font-semibold text-slate-500">
                        —
                      </span>
                    ) : (
                      <Image
                        src={item.src}
                        alt=""
                        width={200}
                        height={120}
                        className="h-full w-full object-cover"
                        sizes="132px"
                        quality={100}
                        onError={() => setBroken((m) => ({ ...m, [i]: true }))}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`flex shrink-0 flex-col items-center border-t border-white/[0.08] bg-[#040d18]/93 px-4 pt-3 md:hidden ${thumbSafe}`}>
            <div className="flex flex-wrap justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={`tip-dot-${i}`}
                  type="button"
                  aria-current={i === safeIndex ? "true" : undefined}
                  aria-label={
                    slideTitleKeys?.[i] ? t(slideTitleKeys[i]) : `${t("landing.showroom.tip.guideWord")} ${i + 1}`
                  }
                  onClick={() => setIndex(i)}
                  className={`rounded-full motion-safe:transition ${i === safeIndex ? "h-2.5 w-2.5 bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.55)]" : "size-2 bg-slate-600/72 opacity-75 hover:bg-slate-500"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-600">{safeIndex + 1} / {total}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
