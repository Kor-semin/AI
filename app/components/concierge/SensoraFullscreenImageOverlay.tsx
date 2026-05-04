"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type FullscreenGuideImageSlide = {
  src: string;
  /** 헤더/캡션용 짧은 제목만 (본문 안내 분리) */
  caption?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  closeLabel: string;
  slides: readonly FullscreenGuideImageSlide[];
  /** 열 때 포커스할 슬라이드 인덱스 */
  initialIndex?: number;
  /** 이전·다음으로 슬라이드가 바뀔 때(가이드 모달 등과 순서 동기화) */
  onSlideIndexSynced?: (index: number) => void;
};

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return Math.min(Math.max(0, i), len - 1);
}

export function SensoraFullscreenImageOverlay({
  open,
  onClose,
  closeLabel,
  slides,
  initialIndex = 0,
  onSlideIndexSynced,
}: Props) {
  const total = slides.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setIndex(clampIndex(initialIndex, total));
  }, [open, initialIndex, total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setIndex((i) => {
      const next = clampIndex(i - 1, total);
      onSlideIndexSynced?.(next);
      return next;
    });
  }, [onSlideIndexSynced, total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setIndex((i) => {
      const next = clampIndex(i + 1, total);
      onSlideIndexSynced?.(next);
      return next;
    });
  }, [onSlideIndexSynced, total]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" && total > 1) goPrev();
      if (e.key === "ArrowRight" && total > 1) goNext();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose, goPrev, goNext, total]);

  const active = slides[clampIndex(index, total)] ?? slides[0];
  const headline = active?.caption?.trim() ?? "";

  const showNav = total > 1;

  const navFab =
    "pointer-events-auto absolute top-1/2 z-[2] flex size-11 sm:size-12 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-white/[0.16] bg-[#0c1422]/95 text-sky-50 shadow-lg backdrop-blur-sm transition hover:border-sky-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45";

  if (!open || total === 0 || !active?.src) return null;

  return (
    <div
      data-sensora-fullscreen-guide-image
      className="fixed inset-0 z-[485] flex flex-col bg-black/92 text-slate-100"
      role="dialog"
      aria-modal="true"
      aria-label={headline || closeLabel}
    >
      <button type="button" className="absolute inset-0 z-0 cursor-default opacity-0" aria-label={closeLabel} onClick={onClose} />

      {/* 플로팅 크롬: 이미지가 무대의 중심 */}
      <div className="pointer-events-none absolute left-3 right-3 top-[max(0.5rem,calc(env(safe-area-inset-top,0px)+4px))] z-[3] flex items-start justify-between gap-3 sm:left-5 sm:right-5 sm:top-[max(0.65rem,calc(env(safe-area-inset-top,0px)+10px))]">
        <div className="pointer-events-auto min-w-0 max-w-[min(68vw,420px)] rounded-xl border border-white/[0.09] bg-[#030712]/55 px-3 py-2 backdrop-blur-sm sm:max-w-[min(52vw,520px)] sm:px-3.5 sm:py-2.5">
          {headline ? (
            <p className="truncate text-[13px] font-semibold tracking-tight text-slate-100 sm:text-sm">{headline}</p>
          ) : (
            <p className="text-[12px] font-medium text-slate-500">{closeLabel}</p>
          )}
          {showNav ? (
            <p className="mt-0.5 tabular-nums text-[11px] text-slate-500 sm:text-[12px]">{clampIndex(index, total) + 1} / {total}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="pointer-events-auto min-h-11 shrink-0 rounded-xl border border-white/[0.16] bg-[#030712]/70 px-3.5 py-2 text-sm font-semibold text-slate-100 backdrop-blur-sm hover:bg-[#090f1f]/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 touch-manipulation sm:min-h-[2.75rem] sm:px-4"
          onClick={onClose}
          aria-label={closeLabel}
        >
          {closeLabel}
        </button>
      </div>

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col justify-center px-3 pb-[max(0.85rem,calc(env(safe-area-inset-bottom,0px)+10px))] pt-[clamp(5.25rem,18vw,8rem)] sm:px-6 sm:pb-[max(1rem,calc(env(safe-area-inset-bottom,0px)+14px))] sm:pt-[clamp(5.5rem,min(13vh,10rem))]">
        <div className="relative mx-auto aspect-[16/11] h-auto w-full max-w-[min(1280px,96vw)] max-h-[min(82svh,calc(100svh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-6.75rem)] sm:aspect-auto sm:h-[min(min(74vh,82svh),calc(100svh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-8rem)] sm:max-h-none">
          <Image
            key={active.src}
            src={active.src}
            alt={headline || ""}
            fill
            sizes="(max-width:640px) 96vw,min(1272px,min(92vw,1280px))"
            className="object-contain object-center drop-shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]"
            priority
            quality={100}
          />

          {showNav ? (
            <>
              <button type="button" className={`${navFab} left-0 sm:left-1`} onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="이전 이미지">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className={`${navFab} right-0 sm:right-1`} onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="다음 이미지">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
        {showNav ? (
          <p className="mt-3 text-center text-[11px] text-slate-500 sm:hidden" aria-hidden>
            좌우로 이전·다음 이미지
          </p>
        ) : null}
      </div>
    </div>
  );
}
