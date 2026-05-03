"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

/** 가이드 이미지 에셋 — 파일이 없어도 뷰어는 폴백으로 동작합니다. */
export const SENSORA_GUIDE_IMAGE_PATHS = [
  "/images/guides/sensora-guide-01.png",
  "/images/guides/sensora-guide-02.png",
  "/images/guides/sensora-guide-03.png",
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
};

export function SensoraGuideImageViewer({ open, onClose, title }: Props) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  const total = SENSORA_GUIDE_IMAGE_PATHS.length;
  const safeIndex = ((index % total) + total) % total;

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setBroken({});
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 px-0 pb-0 pt-8 backdrop-blur-md sm:items-center sm:px-4 sm:pb-6 sm:pt-6"
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
        className="relative z-[1] flex max-h-[min(92dvh,92vh)] w-full max-w-[min(100%,920px)] flex-col overflow-hidden rounded-t-[22px] border border-white/[0.12] bg-[#07111f]/95 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.65)] sm:max-h-[min(88dvh,88vh)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-5 sm:py-4">
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
            className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-[12px] font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            onClick={onClose}
          >
            {t("landing.showroom.tip.close")}
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:flex-row sm:gap-4 sm:p-5">
          <div className="relative flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#020817]/90 sm:min-h-[min(52dvh,420px)]">
            {broken[safeIndex] ? (
              <div className="max-w-sm px-6 text-center">
                <p className="text-[14px] font-medium leading-relaxed text-slate-300">
                  {t("landing.showroom.tip.imageMissing")}
                </p>
              </div>
            ) : (
              <Image
                src={SENSORA_GUIDE_IMAGE_PATHS[safeIndex]}
                alt=""
                width={1600}
                height={1200}
                className="h-auto max-h-[min(52dvh,420px)] w-full object-contain sm:max-h-[min(56dvh,480px)]"
                sizes="(max-width: 640px) 100vw, 880px"
                priority={safeIndex === 0}
                onError={() => setBroken((m) => ({ ...m, [safeIndex]: true }))}
              />
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020817]/80 to-transparent" />

            <div className="absolute inset-y-0 left-1 flex items-center sm:left-2">
              <button
                type="button"
                onClick={goPrev}
                className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#0f172a]/90 text-slate-100 shadow-lg backdrop-blur-sm transition hover:border-sky-400/35 hover:bg-[#0f172a]"
                aria-label={t("landing.showroom.tip.prev")}
              >
                <span className="text-lg leading-none" aria-hidden>
                  ‹
                </span>
              </button>
            </div>
            <div className="absolute inset-y-0 right-1 flex items-center sm:right-2">
              <button
                type="button"
                onClick={goNext}
                className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#0f172a]/90 text-slate-100 shadow-lg backdrop-blur-sm transition hover:border-sky-400/35 hover:bg-[#0f172a]"
                aria-label={t("landing.showroom.tip.next")}
              >
                <span className="text-lg leading-none" aria-hidden>
                  ›
                </span>
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-row gap-2 overflow-x-auto pb-1 sm:w-[5.5rem] sm:flex-col sm:overflow-y-auto sm:pb-0">
            {SENSORA_GUIDE_IMAGE_PATHS.map((src, i) => {
              const active = i === safeIndex;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={[
                    "relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border transition sm:h-16 sm:w-full",
                    active
                      ? "border-sky-400/45 ring-2 ring-sky-500/25"
                      : "border-white/10 opacity-80 hover:border-white/20 hover:opacity-100",
                  ].join(" ")}
                  aria-current={active ? "true" : undefined}
                  aria-label={`${t("landing.showroom.tip.guideWord")} ${i + 1}`}
                >
                  {broken[i] ? (
                    <span className="flex h-full w-full items-center justify-center bg-slate-900/80 text-[10px] font-semibold text-slate-500">
                      —
                    </span>
                  ) : (
                    <Image
                      src={src}
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
