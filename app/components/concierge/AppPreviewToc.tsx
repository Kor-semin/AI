"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraFullscreenImageOverlay } from "@/app/components/concierge/SensoraFullscreenImageOverlay";
import { SENSORA_CONCEPT_STORY_SLIDES } from "@/app/components/concierge/sensoraConceptStory";
import {
  PreviewDiagramConsultLadder,
  PreviewDiagramHubField,
  PreviewDiagramSecurityStrip,
  PreviewDiagramWorkspaceStrip,
} from "@/app/components/concierge/SensoraFuturisticFlows";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

const JOIN_PATH = "/join" as const;
const REGISTER_PATH = "/register" as const;
const TOTAL_STEPS = 3 as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectSection: (section: CrmSection) => void;
};

const glassInteractive =
  "sensora-glass-surface rounded-2xl transition-[border-color,box-shadow] duration-200 hover:border-sky-400/38 hover:shadow-[0_0_44px_-16px_rgba(56,189,248,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38";

export function AppPreviewToc({ open, onClose, onSelectSection }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [expand, setExpand] = useState<{ src: string; alt: string } | null>(null);

  const securityLabels = useMemo(
    () =>
      [t("preview.diagram.security.view"), t("preview.diagram.security.review"), t("preview.diagram.security.confirm"), t("preview.diagram.security.save")] as const,
    [t],
  );

  const pathLabels = useMemo(
    () =>
      [
        t("preview.diagram.path.register"),
        t("preview.diagram.path.approve"),
        t("preview.diagram.path.setup"),
        t("preview.diagram.path.workspace"),
      ] as const,
    [t],
  );

  const hubSatellites = useMemo(
    () =>
      [
        t("preview.diagram.hub.customers"),
        t("preview.diagram.hub.ai"),
        t("preview.diagram.hub.messages"),
        t("preview.diagram.hub.schedule"),
        t("preview.diagram.hub.aftercare"),
      ] as const,
    [t],
  );

  const consultLabels = useMemo(
    () =>
      [
        t("preview.diagram.consult.memo"),
        t("preview.diagram.consult.needs"),
        t("preview.diagram.consult.draft"),
        t("preview.diagram.consult.next"),
      ] as const,
    [t],
  );

  const pillarVisuals = useMemo(
    () =>
      [
        {
          src: "/images/guides/sensora-guide-02.png",
          titleKey: "preview.flow.step2.card.customersTitle" as const,
          descKey: "preview.flow.step2.card.customersDesc" as const,
          accent: "text-sky-100",
          tint: "from-sky-500/25 via-transparent to-transparent",
        },
        {
          src: "/images/guides/sensora-guide-01.png",
          titleKey: "preview.flow.step2.card.aiTitle" as const,
          descKey: "preview.flow.step2.card.aiDesc" as const,
          accent: "text-violet-100",
          tint: "from-violet-500/22 via-transparent to-transparent",
        },
        {
          src: "/images/guides/sensora-guide-03.png",
          titleKey: "preview.flow.step2.card.followTitle" as const,
          descKey: "preview.flow.step2.card.followDesc" as const,
          accent: "text-teal-100",
          tint: "from-teal-500/20 via-transparent to-transparent",
        },
      ] as const,
    [],
  );

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setExpand(null);
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
        if (expand) setExpand(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, expand]);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goPrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const pick = useCallback(
    (section: CrmSection) => {
      onSelectSection(section);
    },
    [onSelectSection],
  );

  if (!open) return null;

  const screenReaderTitle =
    step === 0 ? t("product.name") : step === 1 ? t("preview.flow.step2.headline") : t("preview.flow.step3.headline");

  return (
    <>
      <SensoraFullscreenImageOverlay
        open={expand !== null}
        src={expand?.src ?? ""}
        alt={expand?.alt ?? ""}
        onClose={() => setExpand(null)}
        closeLabel={t("preview.toc.close")}
        openOriginalAria={t("landing.showroom.tip.openOriginalAria")}
        openOriginalHint={t("landing.showroom.tip.openOriginal")}
      />

      <div
        data-app-preview-toc
        className="fixed inset-0 z-[460] flex flex-col bg-[#020617] text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-preview-flow-screen-reader-title"
      >
        <p id="app-preview-flow-screen-reader-title" className="sr-only">
          {screenReaderTitle}
        </p>

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

        <header className="relative z-[1] flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(12px,calc(env(safe-area-inset-top,0px)+10px))] pb-3 sm:px-5">
          <div className="min-h-11 min-w-0 flex-1" />
          <button
            type="button"
            className={`${glassInteractive} min-h-11 shrink-0 px-4 py-2 text-sm font-semibold text-slate-100 touch-manipulation`}
            onClick={onClose}
          >
            {t("preview.toc.close")}
          </button>
        </header>

        <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-4 sm:px-6">
          <main className="mx-auto flex w-full max-w-lg flex-col overflow-y-auto overscroll-contain pb-4 [-webkit-overflow-scrolling:touch]">
            {step === 0 ? (
              <div className="flex flex-col items-center pb-2 text-center">
                <SensoraAnimatedMark size={72} animated className="drop-shadow-[0_0_32px_rgba(56,189,248,0.35)]" aria-hidden />
                <h1 className="mt-5 font-semibold tracking-tight text-[clamp(1.35rem,4.2vw,1.85rem)] text-white drop-shadow-[0_0_24px_rgba(56,189,248,0.15)]">
                  {t("product.name")}
                </h1>
                <p className="mx-auto mt-3 max-w-[min(100%,34rem)] text-pretty text-sm leading-relaxed text-slate-400">{t("preview.flow.step1.intro")}</p>

                <div className="sensora-glass-surface mt-7 w-full max-w-[min(100%,26rem)] space-y-4 rounded-[20px] p-4 sm:p-5">
                  <div>
                    <PreviewDiagramSecurityStrip labels={securityLabels} />
                    <p className="mt-2 text-left text-[11px] leading-snug text-slate-500">{t("preview.diagram.caption.security")}</p>
                  </div>
                  <div className="border-t border-white/[0.08] pt-4">
                    <PreviewDiagramWorkspaceStrip labels={pathLabels} />
                    <p className="mt-2 text-left text-[11px] leading-snug text-slate-500">{t("preview.diagram.caption.workspace")}</p>
                  </div>
                </div>

                <p className="mt-8 w-full text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/85">{t("preview.flow.storyRailTitle")}</p>
                <div className="mt-3 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                  {SENSORA_CONCEPT_STORY_SLIDES.map((slide) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setExpand({ src: slide.src, alt: t(slide.titleKey) })}
                      className={`${glassInteractive} group relative w-[min(78vw,280px)] shrink-0 snap-start overflow-hidden text-left shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.06] transition-[transform,box-shadow,border-color] active:scale-[0.992] motion-reduce:transition-none touch-manipulation`}
                    >
                      <div className="relative aspect-[4/3] w-full bg-[#030712]/80">
                        <Image src={slide.src} alt="" fill className="object-cover opacity-95 transition duration-300 group-hover:opacity-100" sizes="280px" />
                        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${slide.id === "onboarding" ? "from-[#020617]/90" : "from-[#020617]/92"} via-transparent to-transparent`} />
                        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${slide.id === "security" ? "from-sky-500/10" : slide.id === "hub" ? "from-violet-500/10" : "from-cyan-500/8"} via-transparent to-transparent opacity-70`} />
                        <span className="absolute bottom-2 left-3 right-3 text-[11px] font-medium text-sky-200/90">{t("landing.showroom.concept.tapToExpand")}</span>
                      </div>
                      <div className="border-t border-white/[0.08] px-3.5 py-3">
                        <p className="text-[0.9375rem] font-semibold text-white">{t(slide.titleKey)}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{t(slide.descKey)}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex w-full max-w-md flex-col gap-3">
                  <button
                    type="button"
                    onClick={goNext}
                    className="sensora-premium-primary-workspace min-h-[3.25rem] w-full rounded-2xl py-3.5 text-base font-semibold shadow-[0_0_48px_-12px_rgba(56,189,248,0.28)] touch-manipulation"
                  >
                    {t("preview.flow.step1.startCta")}
                  </button>
                  <Link
                    href={REGISTER_PATH}
                    prefetch={false}
                    onClick={onClose}
                    className={`${glassInteractive} inline-flex min-h-[3.125rem] w-full items-center justify-center rounded-2xl py-3.5 text-sm font-semibold text-slate-100 hover:border-violet-400/35`}
                  >
                    {t("preview.flow.step1.registerCta")}
                  </Link>
                </div>

                <div className="mt-6 space-y-1.5 text-left text-[11px] leading-relaxed text-slate-500" role="note">
                  <p>{t("preview.toc.disclaimer1")}</p>
                  <p>{t("preview.toc.disclaimer2")}</p>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="pb-4">
                <h2 className="text-center text-[clamp(1.2rem,3.8vw,1.5rem)] font-semibold tracking-tight text-white">
                  {t("preview.flow.step2.headline")}
                </h2>
                <p className="mx-auto mt-2 max-w-[32rem] text-center text-xs text-slate-500">{t("preview.flow.step2.sub")}</p>

                <div className="mt-7">
                  <PreviewDiagramHubField coreLabel={t("preview.diagram.hub.core")} satellites={hubSatellites} />
                  <p className="mx-auto mt-3 max-w-[36ch] text-center text-[11px] leading-snug text-slate-500">{t("preview.diagram.caption.hub")}</p>
                </div>

                <ul className="mt-8 space-y-4" role="list">
                  {pillarVisuals.map((pill) => (
                    <li key={pill.titleKey} className={`${glassInteractive} overflow-hidden !p-0 ring-1 ring-white/[0.06]`}>
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative aspect-[16/11] w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-[44%] sm:min-h-[9.25rem]">
                          <Image src={pill.src} alt="" fill className="object-cover object-center opacity-92 sm:object-cover" sizes="(max-width:640px) 100vw, 200px" />
                          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/88 via-transparent to-transparent sm:bg-gradient-to-r ${pill.tint} sm:from-transparent sm:via-transparent sm:to-[#020617]/82`} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 pb-4 pt-3 sm:px-5 sm:py-5">
                          <p className={["text-[0.95rem] font-semibold sm:text-base", pill.accent].join(" ")}>{t(pill.titleKey)}</p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(pill.descKey)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="pb-6 text-center">
                <div className="sensora-glass-surface mx-auto mb-5 max-w-[17rem] rounded-[18px] p-4 sm:p-5">
                  <PreviewDiagramConsultLadder labels={consultLabels} />
                </div>

                <div className="sensora-glass-surface sensora-glass-surface--cta mx-auto flex max-w-[24rem] justify-center rounded-[20px] px-5 py-4">
                  <p className="max-w-[22rem] text-[clamp(1.06rem,3.6vw,1.35rem)] font-semibold leading-snug tracking-tight text-white">{t("preview.flow.step3.headline")}</p>
                </div>
                <p className="mx-auto mt-3 max-w-[min(100%,28rem)] text-sm leading-relaxed text-slate-400">{t("preview.flow.step3.sub")}</p>

                <div className="mx-auto mt-10 flex w-full max-w-md flex-col gap-3">
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
                    href={JOIN_PATH}
                    prefetch={false}
                    onClick={onClose}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold text-slate-400 underline-offset-4 hover:text-slate-200"
                  >
                    {t("cta.joinBeta")}
                  </Link>
                </div>

                <div className="mx-auto mt-8 max-w-[min(100%,26rem)] space-y-2 text-[11px] leading-relaxed text-slate-500" role="note">
                  <p>{t("preview.toc.disclaimer3")}</p>
                  <p className="font-medium text-slate-400">{t("preview.toc.disclaimer4")}</p>
                </div>
              </div>
            ) : null}
          </main>
        </div>

        <footer className="relative z-[1] shrink-0 border-t border-white/[0.08] bg-[#020617]/85 px-4 py-[max(12px,calc(env(safe-area-inset-bottom,0px)+12px))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:px-6">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3">
            <button
              type="button"
              disabled={step === 0}
              onClick={goPrev}
              className="min-h-12 min-w-[5.5rem] rounded-xl border border-white/[0.12] bg-white/[0.045] px-4 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 hover:border-sky-400/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
            >
              {t("preview.flow.footer.prev")}
            </button>

            <div className="flex items-center gap-2" aria-hidden>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-[transform,opacity] ${i === step ? "scale-125 bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.75)]" : "bg-slate-600/80 opacity-65"}`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={step >= TOTAL_STEPS - 1}
              onClick={goNext}
              className="min-h-12 min-w-[5.5rem] rounded-xl border border-sky-400/35 bg-white/[0.06] px-4 text-sm font-semibold text-sky-50 disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:text-slate-500 hover:border-sky-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
            >
              {t("preview.flow.footer.next")}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
