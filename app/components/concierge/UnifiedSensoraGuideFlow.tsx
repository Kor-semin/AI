"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
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

const WIZARD_LAST = 3;

const glassInteractive =
  "sensora-glass-surface rounded-2xl transition-[border-color,box-shadow] duration-200 hover:border-sky-400/38 hover:shadow-[0_0_44px_-16px_rgba(56,189,248,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38";

export type UnifiedSensoraGuideVariant = "dialog" | "notebook";

type Props = {
  /** 열릴 때 wizard·가이드 상태 초기화 */
  active: boolean;
  variant: UnifiedSensoraGuideVariant;
  onClose: () => void;
  onSelectSection: (section: CrmSection) => void;
  sellerLoading?: boolean;
  className?: string;
};

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function UnifiedSensoraGuideFlow({
  active,
  variant,
  onClose,
  onSelectSection,
  sellerLoading = false,
  className = "",
}: Props) {
  const { t } = useLanguage();
  const [wizardStep, setWizardStep] = useState(0);
  const [activeGuideId, setActiveGuideId] = useState<SensoraGuideId>(DEFAULT_GUIDE_ID);
  const [guideViewerOpen, setGuideViewerOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    setWizardStep(0);
    setActiveGuideId(DEFAULT_GUIDE_ID);
    setGuideViewerOpen(false);
  }, [active]);

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

  const pillarTiles = useMemo(
    () =>
      (
        [
          { titleKey: "preview.flow.step2.card.customersTitle" as const, descKey: "preview.flow.step2.card.customersDesc" as const, src: "/images/guides/sensora-guide-01.png" },
          { titleKey: "preview.flow.step2.card.aiTitle" as const, descKey: "preview.flow.step2.card.aiDesc" as const, src: "/images/guides/sensora-guide-02.png" },
          { titleKey: "preview.flow.step2.card.followTitle" as const, descKey: "preview.flow.step2.card.followDesc" as const, src: "/images/guides/sensora-guide-03.png" },
        ] as const
      ).map((row) => ({
        title: t(row.titleKey),
        desc: t(row.descKey),
        src: row.src,
      })),
    [t],
  );

  const kickerClass =
    variant === "notebook"
      ? "notebook-cover-cover-kicker-upper shrink-0 font-[family-name:var(--font-cover-serif)] text-[clamp(10px,2.4vw,12px)] font-semibold tracking-[0.22em]"
      : "text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/85 sm:text-[11px]";

  const titleClass =
    variant === "notebook"
      ? "text-balance font-semibold leading-[1.2] tracking-[-0.03em] text-[#F8FAFC]"
      : "text-balance font-semibold leading-[1.22] tracking-[-0.03em] text-slate-50";

  const bodyClass =
    variant === "notebook"
      ? "text-left text-[0.90625rem] leading-relaxed text-slate-200 sm:text-[0.9375rem] sm:leading-[1.62]"
      : "text-left text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]";

  const wizardPrev = () => setWizardStep((s) => Math.max(0, s - 1));
  const wizardNext = () => setWizardStep((s) => Math.min(WIZARD_LAST, s + 1));

  const footerSecondaryLabel =
    wizardStep === WIZARD_LAST ? t("preview.toc.close") : t("preview.flow.footer.next");

  const onFooterPrimaryClick = () => {
    if (wizardStep < WIZARD_LAST) {
      wizardNext();
      return;
    }
    onClose();
  };

  if (!active) return null;

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

      <div className={`flex min-h-0 flex-1 flex-col ${className}`.trim()}>
        <div className="sensora-guide-preview-hide-scroll sensora-guide-toc-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pb-2">
          <div className="mx-auto flex w-full max-w-[min(640px,100%)] flex-col px-1 sm:max-w-[min(720px,100%)]">
            {wizardStep === 0 ? (
              <div className={`flex flex-col ${variant === "notebook" ? "items-center text-center pt-1" : "items-center text-center pt-1 sm:pt-2"}`}>
                <div className="mb-4 flex shrink-0 justify-center sm:mb-5">
                  <SensoraAnimatedMark size={variant === "notebook" ? 104 : 92} animated label={t("product.name")} className="motion-reduce:opacity-[0.96]" />
                </div>
                <p className={kickerClass}>SENSORA</p>
                <h2 className={`${titleClass} mt-2 max-w-[26ch] text-[clamp(1.35rem,min(5vw+0.5rem,1.95rem),1.95rem)]`}>
                  {t("guide.unified.intro.title")}
                </h2>
                <div className={`mx-auto mt-5 w-full max-w-[min(28rem,94vw)] space-y-2.5 ${bodyClass}`}>
                  {splitLines(t("guide.unified.intro.body")).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ) : null}

            {wizardStep === 1 ? (
              <div className="pt-2 text-center sm:pt-3">
                <p className={`${kickerClass} ${variant === "dialog" ? "text-sky-400/85" : ""}`}>SENSORA</p>
                <h2 className={`${titleClass} mx-auto mt-2 max-w-[22ch] text-[clamp(1.25rem,min(4.5vw+0.55rem,1.85rem),1.85rem)]`}>{t("preview.flow.step2.headline")}</h2>
                <p className={`mx-auto mt-2 max-w-[40ch] text-xs leading-snug text-slate-400 sm:text-sm ${variant === "notebook" ? "text-slate-400" : ""}`}>
                  {t("preview.flow.step2.sub")}
                </p>
                <ul className="mx-auto mt-5 grid w-full max-w-[28rem] gap-2 text-left sm:mt-7 sm:gap-2.5">
                  {pillarTiles.map((row, idx) => (
                    <li
                      key={`${row.title}-${idx}`}
                      className="notebook-cover-toc-pane sensora-notebook-toc-pane--visual rounded-[14px] border border-white/[0.12] bg-white/[0.03] px-3 py-2.5 backdrop-blur-sm sm:rounded-[17px] sm:px-4 sm:py-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.1] bg-[#030712]/90 sm:size-16">
                          <Image src={row.src} alt="" fill className="object-cover object-center opacity-[0.95]" sizes="64px" />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/45 to-transparent" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[0.9375rem] font-semibold leading-snug ${variant === "notebook" ? "text-[#F8FAFC]" : "text-slate-50"}`}>{row.title}</p>
                          <p className={`mt-0.5 text-[11px] leading-snug ${variant === "notebook" ? "text-slate-400" : "text-slate-400"} sm:mt-1 sm:text-[0.8125rem]`}>{row.desc}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {wizardStep === 2 ? (
              <div className="flex flex-col gap-3 pt-1 sm:pt-2">
                <div className="text-center">
                  <p className={`${kickerClass} ${variant === "dialog" ? "text-sky-400/85" : ""}`}>{t("guide.unified.flow.kicker")}</p>
                  <h2 className={`${titleClass} mx-auto mt-1 max-w-[30ch] text-[clamp(1.12rem,min(4vw+0.5rem,1.55rem),1.55rem)]`}>{t("guide.unified.flow.title")}</h2>
                  <p className="mx-auto mt-2 max-w-[44ch] text-xs leading-snug text-slate-400 sm:text-sm">{t("guide.unified.flow.lead")}</p>
                  <p className="mx-auto mt-2 max-w-[min(36rem,100%)] text-[11px] font-medium leading-snug text-sky-200/85 sm:text-xs" aria-hidden={false}>
                    {t("guide.unified.flow.rail")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.1] bg-white/[0.035] px-2 py-1.5 sm:px-3">
                  <button
                    type="button"
                    onClick={goPrevGuide}
                    className={`${glassInteractive} min-h-10 shrink-0 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-100 touch-manipulation sm:px-3 sm:text-sm`}
                  >
                    {t("guide.unified.guideNav.prev")}
                  </button>
                  <div className="flex flex-1 flex-wrap justify-center gap-1 px-0.5" aria-hidden>
                    {SENSORA_GUIDES.map((g) => (
                      <span
                        key={g.id}
                        className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${g.id === activeGuideId ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.55)]" : "bg-slate-600/70 opacity-65"}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNextGuide}
                    className={`sensora-premium-primary-workspace min-h-10 shrink-0 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-50 touch-manipulation sm:px-3 sm:text-sm`}
                  >
                    {t("guide.unified.guideNav.next")}
                  </button>
                </div>

                <SensoraGuideGallery
                  guides={SENSORA_GUIDES}
                  activeId={activeGuideId}
                  onSelectGuide={(id) => setActiveGuideId(id as SensoraGuideId)}
                  onExpandImage={() => setGuideViewerOpen(true)}
                  tapToExpandLabel={t("preview.guide.tapMainToExpand")}
                  getTitle={(g) => t(g.titleKey)}
                  getDescription={(g) => t(g.descKey)}
                  hideThumbnailHeading
                />
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div className="flex flex-col gap-4 pt-1 sm:pt-2">
                <div className="text-center">
                  <p className={`${kickerClass} ${variant === "dialog" ? "text-sky-400/85" : ""}`}>{t("guide.unified.flow.kicker")}</p>
                  <h2 className={`${titleClass} mx-auto mt-2 max-w-[24ch] text-[clamp(1.2rem,min(4.2vw+0.55rem),1.75rem)]`}>{t("guide.unified.start.title")}</h2>
                  <p className={`mx-auto mt-2 max-w-[42ch] text-xs leading-relaxed ${variant === "notebook" ? "text-slate-400" : "text-slate-400"} sm:text-sm`}>
                    {t("guide.unified.start.lead")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectSection("dashboard")}
                    className="sensora-premium-primary-workspace min-h-[3.125rem] w-full rounded-2xl py-3.5 text-[0.9375rem] font-semibold shadow-[0_0_48px_-12px_rgba(56,189,248,0.22)] touch-manipulation lg:py-4"
                  >
                    {t("preview.flow.step3.enterWorkspace")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSection("ai")}
                    className={`${glassInteractive} min-h-[3.125rem] w-full rounded-2xl py-3.5 text-[0.9375rem] font-semibold text-white hover:border-violet-400/40 touch-manipulation lg:py-4`}
                  >
                    {t("preview.flow.step3.enterAi")}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2 border-t border-white/[0.08] pt-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
                  <Link
                    href={REGISTER_PATH}
                    prefetch={false}
                    onClick={() => {
                      onClose();
                    }}
                    className="text-center text-[0.8125rem] font-semibold tracking-tight text-slate-400 underline decoration-white/15 underline-offset-4 transition hover:text-slate-100"
                  >
                    {t("preview.flow.step1.registerCta")}
                  </Link>
                  <Link
                    href={JOIN_PATH}
                    prefetch={false}
                    onClick={() => {
                      onClose();
                    }}
                    className="text-center text-[0.8125rem] font-semibold tracking-tight text-slate-400 underline decoration-white/15 underline-offset-4 transition hover:text-slate-100"
                  >
                    {t("cta.joinBeta")}
                  </Link>
                </div>

                {sellerLoading ? <p className="text-center text-xs text-[#94A3B8]">{t("auth.checkingLogin")}</p> : null}

                <p className="text-center text-[10px] leading-relaxed text-slate-500 sm:text-[11px]" role="note">
                  {t("guide.unified.disclaimer")}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="sensora-guide-toc-footer shrink-0 border-t border-white/[0.1] bg-[#020817]/94 px-2 py-[max(10px,calc(env(safe-area-inset-bottom,0px)+12px))] shadow-[0_-10px_32px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-4 lg:rounded-2xl lg:border lg:border-white/[0.1] lg:bg-[linear-gradient(180deg,rgba(56,189,248,0.035)_0%,rgba(15,26,43,0.42)_52%,rgba(8,17,31,0.62)_100%)] lg:px-5 lg:py-3 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <div className="mx-auto flex w-full max-w-[min(720px,calc(100%-4px))] items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (wizardStep === 0) return;
                wizardPrev();
              }}
              disabled={wizardStep === 0}
              className="app-preview-guide-nav-btn min-h-11 min-w-0 flex-1 rounded-xl border border-white/[0.12] bg-white/[0.052] px-2 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-sky-400/32 hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 disabled:pointer-events-none disabled:opacity-[0.38] touch-manipulation sm:px-3"
            >
              {t("preview.flow.footer.prev")}
            </button>

            <div className="flex shrink-0 flex-wrap justify-center gap-1 px-0.5" aria-hidden>
              {Array.from({ length: WIZARD_LAST + 1 }, (_, i) => (
                <span
                  key={`wizard-dot-${i}`}
                  className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${wizardStep === i ? "scale-110 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.55)]" : "bg-slate-600/70 opacity-65"}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onFooterPrimaryClick}
              className={`app-preview-guide-nav-btn min-h-11 min-w-0 flex-1 rounded-xl border px-2 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation sm:px-3 ${wizardStep === WIZARD_LAST ? "border-white/[0.14] bg-white/[0.06] text-slate-100 hover:bg-white/[0.09]" : "border-sky-400/42 bg-white/[0.065] text-sky-50 hover:border-sky-400/55 hover:bg-white/[0.085]"}`}
              aria-label={footerSecondaryLabel}
            >
              {footerSecondaryLabel}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
