"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { DEFAULT_GUIDE_ID, SENSORA_GUIDES, type SensoraGuideId } from "@/lib/sensoraGuide";

import type { CrmSection } from "@/app/crm/crmSectionTypes";

type Props = {
  open: boolean;
  onClose: () => void;
  activeGuideId: SensoraGuideId;
  onActiveGuideChange: (id: SensoraGuideId) => void;
  onGoToRelated: (section: CrmSection) => void;
  overlayZClass?: string;
};

export function SensoraGuideDetailModal({
  open,
  onClose,
  activeGuideId,
  onActiveGuideChange,
  onGoToRelated,
  overlayZClass = "z-[470]",
}: Props) {
  const { t } = useLanguage();
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  const idx = SENSORA_GUIDES.findIndex((g) => g.id === activeGuideId);
  const safeIdx = idx < 0 ? sensoraGuideIndexSafe(activeGuideId) : idx;

  useEffect(() => {
    if (open) setBroken({});
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const total = SENSORA_GUIDES.length;
  const active = SENSORA_GUIDES[safeIdx] ?? SENSORA_GUIDES[0];

  const goPrev = useCallback(() => {
    if (total <= 0) return;
    const next = (safeIdx - 1 + total) % total;
    onActiveGuideChange(SENSORA_GUIDES[next]?.id ?? DEFAULT_GUIDE_ID);
  }, [safeIdx, total, onActiveGuideChange]);

  const goNext = useCallback(() => {
    if (total <= 0) return;
    const next = (safeIdx + 1) % total;
    onActiveGuideChange(SENSORA_GUIDES[next]?.id ?? DEFAULT_GUIDE_ID);
  }, [safeIdx, total, onActiveGuideChange]);

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

  const closeLabel = t("preview.toc.close");

  if (!open) return null;

  const slideBroken = !!broken[safeIdx];
  const title = t(active.titleKey);
  const subtitle = t(active.descKey);

  const handleRelated = () => {
    onClose();
    onGoToRelated(active.relatedSection);
  };

  return (
    <div
      data-sensora-guide-detail-modal
      className={[
        "fixed inset-0 flex items-end justify-center bg-black/[0.58] px-0 pb-0 pt-[max(1rem,env(safe-area-inset-top,8px))] backdrop-blur-xl sm:items-center sm:px-4 sm:pb-6 sm:pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+12px))]",
        overlayZClass,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensora-guide-detail-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t("landing.showroom.tip.closeOverlay")} onClick={onClose} />

      <div
        className="landing-guide-dialog-animate relative z-[1] flex max-h-[min(92dvh,92vh)] w-full max-w-[min(96vw,min(960px,100%))] flex-col overflow-hidden rounded-t-[20px] border border-white/[0.14] bg-gradient-to-b from-[#0a1628]/99 to-[#051018]/97 pb-[max(10px,env(safe-area-inset-bottom,0px))] shadow-[0_40px_100px_-28px_rgba(0,0,0,0.72)] backdrop-blur-2xl sm:max-h-[min(88dvh,88vh)] sm:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 pt-[max(10px,calc(env(safe-area-inset-top,0px)+4px))] sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/75">{t("preview.guide.viewerTitle")}</p>
            <p id="sensora-guide-detail-title" className="mt-0.5 line-clamp-2 text-[0.96875rem] font-semibold leading-snug tracking-tight text-slate-100 sm:text-base">
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="min-h-11 shrink-0 rounded-xl border border-white/[0.14] bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
          >
            {closeLabel}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <div className="relative mx-auto px-4 py-3 sm:px-6 sm:pb-6 sm:pt-4">
            <div className="relative mx-auto mb-5 flex min-h-[min(200px,38dvh)] max-h-[min(42vh,420px)] w-full max-w-[min(860px,calc(100vw-28px))] items-center justify-center rounded-[14px] border border-white/[0.1] bg-[#020817]/90 px-10 sm:min-h-[min(240px,44vh)] sm:max-h-[min(52vh,480px)] sm:rounded-[17px] sm:px-14">
              <button
                type="button"
                onClick={goPrev}
                className="sensora-guide-nav-fab absolute left-1 z-[2] flex size-11 items-center justify-center rounded-full border border-white/[0.14] bg-[#0c1422]/95 text-sky-50 shadow-lg backdrop-blur-md transition hover:border-sky-400/38 sm:left-2"
                aria-label={t("landing.showroom.tip.prev")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="sensora-guide-nav-fab absolute right-1 z-[2] flex size-11 items-center justify-center rounded-full border border-white/[0.14] bg-[#0c1422]/95 text-sky-50 shadow-lg backdrop-blur-md transition hover:border-sky-400/38 sm:right-2"
                aria-label={t("landing.showroom.tip.next")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {!slideBroken ? (
                <div className="relative h-[min(38dvh,400px)] w-full max-h-full sm:h-[min(44dvh,440px)]">
                  <Image
                    src={active.image}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes="(max-width:640px) 92vw, min(840px, 88vw)"
                    quality={100}
                    onError={() => setBroken((m) => ({ ...m, [safeIdx]: true }))}
                  />
                </div>
              ) : (
                <p className="max-w-xs text-center text-sm text-slate-400">{t("landing.showroom.tip.imageMissing")}</p>
              )}
            </div>

            <p className="text-center text-[0.9375rem] font-semibold text-sky-50/98">{subtitle}</p>
            <div className="mx-auto mt-4 max-w-[52ch] text-[0.875rem] leading-[1.65] text-slate-300 [&>p+p]:mt-3">
              {splitParagraphs(t(active.detailBodyKey)).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            {active.bulletKeys.length > 0 ? (
              <>
                <p className="mx-auto mb-3 mt-6 max-w-[52ch] text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-400/82">{t("preview.guide.detailModal.pointsHeading")}</p>
                <ul className="mx-auto max-w-[52ch] list-disc space-y-2 ps-5 text-[0.8125rem] leading-relaxed text-slate-400 sm:text-[0.875rem]">
                  {active.bulletKeys.map((key) => (
                    <li key={String(key)}>{t(key)}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="mx-auto mt-8 flex max-w-[52ch] flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={handleRelated}
                className="sensora-premium-primary-workspace order-2 min-h-12 w-full shrink-0 rounded-xl py-3 text-[0.9rem] font-semibold tracking-tight sm:order-1 sm:max-w-none sm:flex-1"
              >
                {t("preview.guide.detailModal.relatedCta")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`order-1 min-h-12 w-full shrink-0 rounded-xl border border-white/[0.16] bg-white/[0.05] px-4 py-3 text-[0.9rem] font-semibold text-slate-100 backdrop-blur-sm transition hover:border-sky-400/32 hover:bg-white/[0.08] sm:order-2 sm:w-auto sm:min-w-[8.5rem]`}
              >
                {closeLabel}
              </button>
            </div>
          </div>

          <div className="border-t border-white/[0.08] px-4 py-3 sm:px-5">
            <div className="sensora-guide-thumb-rail mx-auto flex max-w-[min(860px,calc(100vw-36px))] gap-2 overflow-x-auto pb-1">
              {SENSORA_GUIDES.map((g, i) => {
                const sel = i === safeIdx;
                const label = t(g.titleKey);
                const thBroken = !!broken[i];
                return (
                  <button
                    key={g.id}
                    type="button"
                    aria-current={sel ? "true" : undefined}
                    aria-label={label}
                    onClick={() => onActiveGuideChange(g.id)}
                    className={[
                      "relative h-14 w-[4.6rem] shrink-0 overflow-hidden rounded-lg border transition touch-manipulation",
                      sel ?
                        "border-sky-400/55 shadow-[0_0_26px_-8px_rgba(56,189,248,0.28)] ring-2 ring-sky-500/25"
                      : "border-white/[0.1] opacity-84 hover:border-sky-400/28 hover:opacity-100",
                    ].join(" ")}
                  >
                    {thBroken ? (
                      <span className="flex h-full items-center justify-center bg-slate-900/85 text-[10px] text-slate-500">—</span>
                    ) : (
                      <Image
                        src={g.image}
                        alt=""
                        width={176}
                        height={112}
                        className="h-full w-full object-cover"
                        quality={95}
                        onError={() => setBroken((m) => ({ ...m, [i]: true }))}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mx-auto mt-2 max-w-[42ch] text-center text-[10px] leading-relaxed text-slate-600 sm:text-[11px]" aria-hidden={false}>
              {safeIdx + 1} / {total}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function sensoraGuideIndexSafe(id: SensoraGuideId): number {
  const i = SENSORA_GUIDES.findIndex((g) => g.id === id);
  return i < 0 ? 0 : i;
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
}
