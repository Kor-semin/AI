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
        className="fixed inset-0 z-[460] flex flex-col bg-[#020617] text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-preview-guide-gallery-title"
      >
        <h2 id="app-preview-guide-gallery-title" className="sr-only">
          {t("preview.guide.pageTitle")}
        </h2>

        <div className="sensora-app-preview-galaxy absolute inset-0" aria-hidden>
          <div className="sensora-preview-galaxy-stars absolute inset-0 opacity-[0.72]" />
          <div className="sensora-app-preview-galaxy__milky" />
          <div
            className="absolute inset-0 opacity-[0.88]"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 120% 80% at 70% -20%,rgba(56,189,248,0.16),transparent_55%)",
                "radial-gradient(ellipse 90% 60% at 14% 28%,rgba(139,92,246,0.12),transparent_54%)",
                "radial-gradient(ellipse 70% 50% at 104% 88%,rgba(30,58,138,0.16),transparent_48%)",
              ].join(","),
            }}
          />
          <div className="sensora-app-preview-galaxy__vignette" />
        </div>

        <header className="relative z-[1] flex shrink-0 flex-col gap-1 px-4 pt-[max(12px,calc(env(safe-area-inset-top,0px)+10px))] pb-2 text-center sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-400/85">{t("preview.guide.headerKicker")}</p>
          <p className="text-sm leading-snug text-slate-400">{t("preview.guide.headerSub")}</p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className={`${glassInteractive} min-h-11 shrink-0 px-4 py-2 text-sm font-semibold text-slate-100 touch-manipulation`}
              onClick={onClose}
            >
              {t("preview.toc.close")}
            </button>
          </div>
        </header>

        <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-4 pb-2 sm:px-6">
          <main className="mx-auto flex w-full max-w-xl flex-col overflow-y-auto overscroll-contain pb-4 [-webkit-overflow-scrolling:touch] sm:max-w-2xl">
            <SensoraGuideGallery
              guides={SENSORA_GUIDES}
              activeId={activeGuideId}
              onSelectGuide={(id) => setActiveGuideId(id as SensoraGuideId)}
              onExpandImage={() => setGuideViewerOpen(true)}
              tapToExpandLabel={t("preview.guide.tapMainToExpand")}
              getTitle={(g) => t(g.titleKey)}
              getDescription={(g) => t(g.descKey)}
            />

            <div className="mt-8 flex w-full max-w-[24rem] flex-col gap-3 sm:mx-auto">
              <button
                type="button"
                onClick={() => pick("dashboard")}
                className="sensora-premium-primary-workspace min-h-[3.25rem] w-full rounded-2xl py-3.5 text-base font-semibold shadow-[0_0_48px_-12px_rgba(56,189,248,0.22)] touch-manipulation"
              >
                {t("preview.flow.step3.enterWorkspace")}
              </button>
              <button
                type="button"
                onClick={() => pick("ai")}
                className={`${glassInteractive} min-h-[3.125rem] w-full rounded-2xl py-3.5 text-base font-semibold text-white hover:border-violet-400/40 touch-manipulation`}
              >
                {t("preview.flow.step3.enterAi")}
              </button>
              <Link
                href={REGISTER_PATH}
                prefetch={false}
                onClick={onClose}
                className={`${glassInteractive} inline-flex min-h-[3rem] items-center justify-center rounded-2xl py-3 text-sm font-semibold text-slate-100`}
              >
                {t("preview.flow.step1.registerCta")}
              </Link>
              <Link
                href={JOIN_PATH}
                prefetch={false}
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold text-slate-400 underline-offset-4 hover:text-slate-200"
              >
                {t("cta.joinBeta")}
              </Link>
            </div>

            <div className="mx-auto mt-8 max-w-[min(100%,26rem)] space-y-2 text-[11px] leading-relaxed text-slate-500" role="note">
              <p>{t("preview.toc.disclaimer1")}</p>
              <p>{t("preview.toc.disclaimer2")}</p>
            </div>
          </main>
        </div>

        <footer className="relative z-[1] shrink-0 border-t border-white/[0.08] bg-[#020617]/85 px-4 py-[max(12px,calc(env(safe-area-inset-bottom,0px)+12px))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:px-6">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevGuide}
              className="min-h-12 min-w-0 shrink flex-1 rounded-xl border border-white/[0.12] bg-white/[0.045] px-3 py-2.5 text-sm font-semibold text-slate-200 hover:border-sky-400/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation sm:min-w-[5.25rem]"
            >
              {t("preview.flow.footer.prev")}
            </button>

            <div className="flex max-w-[8rem] flex-wrap justify-center gap-1.5" aria-hidden>
              {SENSORA_GUIDES.map((g, i) => (
                <span
                  key={g.id}
                  className={`h-2 w-2 rounded-full ${g.id === activeGuideId ? "scale-125 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.65)]" : "bg-slate-600/75 opacity-70"}`}
                  title={`${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNextGuide}
              className="min-h-12 min-w-0 shrink flex-1 rounded-xl border border-sky-400/35 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-sky-50 hover:border-sky-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation sm:min-w-[5.25rem]"
            >
              {t("preview.flow.footer.next")}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
