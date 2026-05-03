"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraGuideImageViewer } from "@/app/components/concierge/SensoraGuideImageViewer";
import { SensoraGuideGallery } from "@/app/components/concierge/SensoraGuideGallery";
import {
  DEFAULT_GUIDE_ID,
  SENSORA_GUIDES,
  sensoraGuideIndex,
  type SensoraGuideId,
} from "@/lib/sensoraGuide";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

const JOIN_PATH = "/join" as const;
const REGISTER_PATH = "/register" as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectSection: (section: CrmSection) => void;
};

const glassInteractive =
  "sensora-glass-surface rounded-2xl transition-[border-color,box-shadow] duration-200 hover:border-sky-400/38 hover:shadow-[0_0_44px_-16px_rgba(56,189,248,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38";

export function AppPreviewToc({ open, onClose, onSelectSection }: Props) {
  const { t } = useLanguage();
  const [activeGuideId, setActiveGuideId] = useState<SensoraGuideId>(DEFAULT_GUIDE_ID);
  const [guideViewerOpen, setGuideViewerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveGuideId(DEFAULT_GUIDE_ID);
    setGuideViewerOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (guideViewerOpen) return;
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, guideViewerOpen, onClose]);

  const guideImages = useMemo(() => SENSORA_GUIDES.map((g) => ({ src: g.image })), []);

  const slideTitleKeys = useMemo(() => SENSORA_GUIDES.map((g) => g.titleKey), []);

  const goPrevGuide = useCallback(() => {
    const idx = SENSORA_GUIDES.findIndex((g) => g.id === activeGuideId);
    const prev = (idx - 1 + SENSORA_GUIDES.length) % SENSORA_GUIDES.length;
    setActiveGuideId(SENSORA_GUIDES[prev]?.id ?? DEFAULT_GUIDE_ID);
  }, [activeGuideId]);

  const goNextGuide = useCallback(() => {
    const idx = SENSORA_GUIDES.findIndex((g) => g.id === activeGuideId);
    const next = (idx + 1) % SENSORA_GUIDES.length;
    setActiveGuideId(SENSORA_GUIDES[next]?.id ?? DEFAULT_GUIDE_ID);
  }, [activeGuideId]);

  const pick = useCallback(
    (section: CrmSection) => {
      onSelectSection(section);
    },
    [onSelectSection],
  );

  if (!open) return null;

  return (
    <>
      <SensoraGuideImageViewer
        open={guideViewerOpen}
        onClose={() => setGuideViewerOpen(false)}
        images={guideImages}
        initialSlideIndex={sensoraGuideIndex(activeGuideId)}
        title={t("preview.guide.viewerTitle")}
        slideTitleKeys={slideTitleKeys}
        overlayZClass="z-[470]"
      />

      <div
        data-app-preview-toc
        className="fixed inset-0 z-[460] flex flex-col overflow-hidden bg-[#020617] text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-preview-guide-gallery-title"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="sensora-app-preview-nebula-core" aria-hidden />
          <div className="sensora-preview-galaxy-stars absolute inset-0 opacity-[0.72]" aria-hidden />
          <div className="sensora-app-preview-galaxy__milky" aria-hidden />
          <div
            className="absolute inset-0 opacity-[0.88]"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 120% 80% at 70% -20%,rgba(56,189,248,0.16),transparent_55%)",
                "radial-gradient(ellipse 90% 60% at 14% 28%,rgba(139,92,246,0.12),transparent_54%)",
                "radial-gradient(ellipse 70% 50% at 104% 88%,rgba(30,58,138,0.16),transparent_48%)",
              ].join(","),
            }}
            aria-hidden
          />
          <div className="sensora-app-preview-galaxy__vignette" aria-hidden />
        </div>

        <h2 id="app-preview-guide-gallery-title" className="sr-only">
          {t("preview.guide.pageTitle")}
        </h2>

        <header className="relative z-[2] mx-auto flex w-full max-w-[min(1200px,100%-1.5rem)] shrink-0 flex-col gap-0.5 px-1 pb-0 pt-[max(10px,calc(env(safe-area-inset-top,0px)+8px))] text-center sm:gap-1 sm:px-2 sm:pb-1 sm:pt-[max(12px,calc(env(safe-area-inset-top,0px)+10px))]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/85 sm:text-[11px] sm:tracking-[0.16em]">{t("preview.guide.headerKicker")}</p>
          <p className="mx-auto max-w-[40rem] text-xs leading-snug text-slate-400 sm:text-sm">{t("preview.guide.headerSub")}</p>
          <div className="mt-1 flex justify-end pb-1 sm:mt-2 sm:pb-2">
            <button
              type="button"
              className={`${glassInteractive} min-h-11 shrink-0 px-4 py-2 text-sm font-semibold text-slate-100 touch-manipulation`}
              onClick={onClose}
            >
              {t("preview.toc.close")}
            </button>
          </div>
        </header>

        <div className="relative z-[2] flex min-h-0 flex-1 flex-col px-3 sm:px-5 lg:px-8">
          <div className="sensora-guide-preview-hide-scroll sensora-guide-toc-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pb-2 lg:pb-3">
            <main className="app-preview-guide-main-inner mx-auto flex w-full max-w-[min(1200px,100%-12px)] flex-col pb-2 sm:pb-4 lg:pb-2">
              <SensoraGuideGallery
                guides={SENSORA_GUIDES}
                activeId={activeGuideId}
                onSelectGuide={(id) => setActiveGuideId(id as SensoraGuideId)}
                onExpandImage={() => setGuideViewerOpen(true)}
                tapToExpandLabel={t("preview.guide.tapMainToExpand")}
                getTitle={(g) => t(g.titleKey)}
                getDescription={(g) => t(g.descKey)}
              />

              <div className="mt-5 w-full lg:mt-10">
                <div className="mx-auto grid w-full max-w-[36rem] grid-cols-1 gap-2 sm:mx-0 sm:max-w-none sm:grid-cols-2 sm:gap-3 lg:max-w-[640px]">
                  <button
                    type="button"
                    onClick={() => pick("dashboard")}
                    className="sensora-premium-primary-workspace min-h-[3.125rem] w-full rounded-2xl py-3.5 text-[0.9375rem] font-semibold shadow-[0_0_48px_-12px_rgba(56,189,248,0.22)] touch-manipulation lg:py-4"
                  >
                    {t("preview.flow.step3.enterWorkspace")}
                  </button>
                  <button
                    type="button"
                    onClick={() => pick("ai")}
                    className={`${glassInteractive} min-h-[3.125rem] w-full rounded-2xl py-3.5 text-[0.9375rem] font-semibold text-white hover:border-violet-400/40 touch-manipulation lg:py-4`}
                  >
                    {t("preview.flow.step3.enterAi")}
                  </button>
                </div>

                <div className="mx-auto mt-4 flex flex-col items-center gap-2 border-t border-white/[0.07] pt-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-1 sm:gap-3 sm:pt-6">
                  <Link
                    href={REGISTER_PATH}
                    prefetch={false}
                    onClick={onClose}
                    className="text-center text-[0.8125rem] font-semibold tracking-tight text-slate-400 underline decoration-white/15 underline-offset-4 transition hover:text-slate-100"
                  >
                    {t("preview.flow.step1.registerCta")}
                  </Link>
                  <Link
                    href={JOIN_PATH}
                    prefetch={false}
                    onClick={onClose}
                    className="text-center text-[0.8125rem] font-semibold tracking-tight text-slate-400 underline decoration-white/15 underline-offset-4 transition hover:text-slate-100"
                  >
                    {t("cta.joinBeta")}
                  </Link>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-[min(100%,52rem)] space-y-1.5 text-[10px] leading-relaxed text-slate-500 sm:mt-10 sm:space-y-2 sm:text-[11px]" role="note">
                <p>{t("preview.toc.disclaimer1")}</p>
                <p>{t("preview.toc.disclaimer2")}</p>
              </div>
            </main>
          </div>

          <footer className="app-preview-guide-footer sensora-guide-toc-footer shrink-0 border-t border-white/[0.1] bg-[#020817]/94 px-3 py-[max(10px,calc(env(safe-area-inset-bottom,0px)+12px))] shadow-[0_-10px_32px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-5 lg:mx-auto lg:mt-0 lg:max-w-[min(680px,calc(100%-32px))] lg:rounded-2xl lg:border lg:border-white/[0.1] lg:bg-[linear-gradient(180deg,rgba(56,189,248,0.035)_0%,rgba(15,26,43,0.42)_52%,rgba(8,17,31,0.62)_100%)] lg:px-5 lg:py-3 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] lg:backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-[min(720px,100%-8px)] items-center justify-between gap-2 sm:max-w-[min(720px,100%)] sm:gap-3">
              <button
                type="button"
                onClick={goPrevGuide}
                className="app-preview-guide-nav-btn sensora-guide-toc-prev min-h-11 min-w-0 flex-1 rounded-xl border border-white/[0.12] bg-white/[0.052] px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-sky-400/32 hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation lg:min-h-10 lg:flex-none lg:border-white/[0.1] lg:px-4 lg:bg-white/[0.04]"
              >
                {t("preview.flow.footer.prev")}
              </button>

              <div className="flex shrink-0 flex-wrap justify-center gap-1 px-0.5 opacity-95 sm:gap-2 lg:px-3" aria-hidden>
                {SENSORA_GUIDES.map((g) => (
                  <span
                    key={g.id}
                    className={`h-1.5 w-1.5 rounded-full transition-[transform,opacity,box-shadow] sm:h-2 sm:w-2 lg:h-[7px] lg:w-[7px] ${g.id === activeGuideId ? "scale-125 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.65)]" : "bg-slate-600/75 opacity-70"}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goNextGuide}
                className="app-preview-guide-nav-btn sensora-guide-toc-next min-h-11 min-w-0 flex-1 rounded-xl border border-sky-400/42 bg-white/[0.065] px-3 py-2.5 text-sm font-semibold text-sky-50 transition hover:border-sky-400/55 hover:bg-white/[0.085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation lg:min-h-10 lg:flex-none lg:border-white/[0.12] lg:px-4 lg:bg-white/[0.055] lg:text-slate-100"
              >
                {t("preview.flow.footer.next")}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
