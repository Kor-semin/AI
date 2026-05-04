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
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose, goPrev, goNext]);

  if (!open || total === 0) return null;

  const slideAlt = slideTitleKeys?.[safeIndex] ? t(slideTitleKeys[safeIndex]) : "";
  const captionLabel = slideAlt || `${t("landing.showroom.tip.guideWord")} ${safeIndex + 1}`;
  const closeLabel = t("preview.toc.close");

  const thumbSafe = "pb-[max(12px,calc(env(safe-area-inset-bottom,0px)+10px))]";

  const navFab =
    "pointer-events-auto absolute top-1/2 z-[2] flex size-11 sm:size-12 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/[0.16] bg-[#0c1422]/95 text-sky-50 shadow-lg backdrop-blur-sm transition hover:border-sky-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45";

  return (
    <div
      data-sensora-guide-viewer
      className={["fixed inset-0 flex flex-col bg-black/92 text-slate-100", overlayZClass].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensora-guide-viewer-title"
    >
      <button type="button" className="absolute inset-0 z-0 cursor-default" aria-label={t("landing.showroom.tip.closeOverlay")} onClick={onClose} />

      <div className="pointer-events-none absolute left-3 right-3 top-[max(0.5rem,calc(env(safe-area-inset-top,0px)+4px))] z-[3] flex items-start justify-between gap-3 sm:left-6 sm:right-6 sm:top-[max(0.65rem,calc(env(safe-area-inset-top,0px)+10px))]">
        <div className="pointer-events-auto min-w-0 max-w-[min(70vw,460px)] rounded-xl border border-white/[0.09] bg-[#030712]/55 px-3 py-2 backdrop-blur-sm sm:max-w-[min(58vw,540px)] sm:px-3.5 sm:py-2.5">
          <p id="sensora-guide-viewer-title" className="truncate text-[0.9275rem] font-semibold tracking-tight text-slate-50 sm:text-base">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 sm:text-xs">
            {t("landing.showroom.tip.guideWord")} {safeIndex + 1} / {total}
          </p>
        </div>
        <button
          type="button"
          className="pointer-events-auto min-h-11 shrink-0 rounded-xl border border-white/[0.16] bg-[#030712]/70 px-3.5 py-2 text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:bg-[#090f1f]/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 touch-manipulation sm:min-h-[2.75rem] sm:px-4"
          onClick={onClose}
          aria-label={closeLabel}
        >
          {closeLabel}
        </button>
      </div>

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col justify-center px-3 pb-2 pt-[clamp(5.25rem,18vw,8rem)] sm:px-6 sm:pt-[clamp(5.5rem,min(13vh,10rem))]">
        <div className="relative mx-auto aspect-[16/11] h-auto w-full max-w-[min(1280px,96vw)] max-h-[min(68svh,calc(100svh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-9.5rem))] sm:aspect-auto sm:h-[min(min(62vh,72svh),calc(100svh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-11rem))] sm:max-h-none">
          <button
            type="button"
            onClick={goPrev}
            className={`${navFab} left-0 sm:left-1`}
            aria-label={t("landing.showroom.tip.prev")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-95" aria-hidden>
              <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className={`${navFab} right-0 sm:right-1`}
            aria-label={t("landing.showroom.tip.next")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-95" aria-hidden>
              <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {broken[safeIndex] ? (
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-300">{t("landing.showroom.tip.imageMissing")}</p>
            </div>
          ) : (
            <Image
              src={images[safeIndex].src}
              alt={slideAlt || captionLabel}
              fill
              className="object-contain object-center drop-shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]"
              sizes="(max-width:640px) 96vw,min(1272px,min(92vw,1280px))"
              quality={100}
              onError={() => setBroken((m) => ({ ...m, [safeIndex]: true }))}
            />
          )}
        </div>

        <p className="mx-auto mt-2 max-w-[48ch] px-1 text-center text-[11px] font-medium leading-snug text-slate-500 sm:mt-3 sm:text-xs">{captionLabel}</p>
      </div>

      <div className={`relative z-[2] shrink-0 border-t border-white/[0.08] bg-[#030712]/80 backdrop-blur-sm md:block ${thumbSafe}`}>
        <div className="sensora-guide-thumb-rail mx-auto hidden max-w-[min(1280px,96vw)] gap-2 overflow-x-auto px-4 pb-2 pt-3 md:flex">
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

        <div className="flex flex-wrap justify-center gap-1.5 px-4 pb-3 pt-3 md:hidden">
          {images.map((_, i) => (
            <button
              key={`tip-dot-${i}`}
              type="button"
              aria-current={i === safeIndex ? "true" : undefined}
              aria-label={slideTitleKeys?.[i] ? t(slideTitleKeys[i]) : `${t("landing.showroom.tip.guideWord")} ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`rounded-full motion-safe:transition ${i === safeIndex ? "h-2.5 w-2.5 bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.55)]" : "size-2 bg-slate-600/72 opacity-75 hover:bg-slate-500"}`}
            />
          ))}
        </div>
        <p className="pb-[max(6px,calc(env(safe-area-inset-bottom,0px)+4px))] text-center text-[10px] text-slate-600 md:pb-2">{safeIndex + 1} / {total}</p>
      </div>
    </div>
  );
}
