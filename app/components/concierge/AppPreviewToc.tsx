"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraFullscreenImageOverlay } from "@/app/components/concierge/SensoraFullscreenImageOverlay";
import { SENSORA_CONCEPT_STORY_SLIDES } from "@/app/components/concierge/sensoraConceptStory";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

const JOIN_PATH = "/join" as const;
const REGISTER_PATH = "/register" as const;
const TOTAL_STEPS = 3 as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectSection: (section: CrmSection) => void;
};

const glassPanel =
  "rounded-[18px] border border-white/[0.14] bg-gradient-to-br from-slate-950/75 via-[#070f1c]/65 to-slate-950/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_40px_-14px_rgba(56,189,248,0.12)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.05]";

export function AppPreviewToc({ open, onClose, onSelectSection }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [expand, setExpand] = useState<{ src: string; alt: string } | null>(null);

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
        {/* 은하·성운 레이어 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.82]"
            style={{
              backgroundImage: [
                "radial-gradient(1.3px 1.3px at 11% 19%, rgba(255,255,255,0.36), transparent)",
                "radial-gradient(1px 1px at 49% 83%, rgba(255,255,255,0.24), transparent)",
                "radial-gradient(1.2px 1.2px at 73% 31%, rgba(186,230,253,0.34), transparent)",
                "radial-gradient(1px 1px at 36% 66%, rgba(255,255,255,0.2), transparent)",
              ].join(", "),
              backgroundSize: "200px 200px, 180px 190px, 220px 220px, 160px 175px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_70%_-20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(ellipse_90%_60%_at_15%_25%,rgba(139,92,246,0.18),transparent_52%),radial-gradient(ellipse_70%_50%_at_102%_88%,rgba(30,58,138,0.22),transparent_48%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.2)_0%,rgba(15,23,42,0.55)_42%,rgba(2,6,23,0.92)_100%)]" />
        </div>

        <header className="relative z-[1] flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(12px,calc(env(safe-area-inset-top,0px)+10px))] pb-3 sm:px-5">
          <div className="min-h-11 min-w-0 flex-1" />
          <button
            type="button"
            className={`${glassPanel} min-h-11 shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-400/35 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38 touch-manipulation`}
            onClick={onClose}
          >
            {t("preview.toc.close")}
          </button>
        </header>

        <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-4 sm:px-6">
          <main className="mx-auto flex w-full max-w-lg flex-col overflow-y-auto overscroll-contain pb-4 [-webkit-overflow-scrolling:touch]">
            {/* 스텝 1 */}
            {step === 0 ? (
              <div className="flex flex-col items-center pb-2 text-center">
                <SensoraAnimatedMark size={72} animated className="drop-shadow-[0_0_32px_rgba(56,189,248,0.35)]" aria-hidden />
                <h1 className="mt-5 font-semibold tracking-tight text-[clamp(1.35rem,4.2vw,1.85rem)] text-white drop-shadow-[0_0_24px_rgba(56,189,248,0.15)]">
                  {t("product.name")}
                </h1>
                <p className="mx-auto mt-3 max-w-[min(100%,34rem)] text-pretty text-sm leading-relaxed text-slate-400">{t("preview.flow.step1.intro")}</p>

                <p className="mt-8 w-full text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-300/85">{t("preview.flow.storyRailTitle")}</p>
                <div className="mt-3 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                  {SENSORA_CONCEPT_STORY_SLIDES.map((slide) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setExpand({ src: slide.src, alt: t(slide.titleKey) })}
                      className={`${glassPanel} group relative w-[min(78vw,280px)] shrink-0 snap-start overflow-hidden text-left shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)] transition-[transform,box-shadow] active:scale-[0.992] motion-reduce:transition-none touch-manipulation`}
                    >
                      <div className="relative aspect-[4/3] w-full bg-[#030712]/80">
                        <Image src={slide.src} alt="" fill className="object-cover opacity-95 transition duration-300 group-hover:opacity-100" sizes="280px" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/92 via-transparent to-transparent" />
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
                    className="sensora-premium-primary-workspace min-h-[3.25rem] w-full rounded-2xl py-3.5 text-base font-semibold shadow-[0_0_48px_-12px_rgba(56,189,248,0.35)] touch-manipulation"
                  >
                    {t("preview.flow.step1.startCta")}
                  </button>
                  <Link
                    href={REGISTER_PATH}
                    prefetch={false}
                    onClick={onClose}
                    className={`${glassPanel} inline-flex min-h-[3.125rem] w-full items-center justify-center rounded-2xl py-3.5 text-sm font-semibold text-slate-100 hover:border-violet-400/35`}
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

            {/* 스텝 2 */}
            {step === 1 ? (
              <div className="pb-4">
                <h2 className="text-center text-[clamp(1.2rem,3.8vw,1.5rem)] font-semibold tracking-tight text-white">
                  {t("preview.flow.step2.headline")}
                </h2>
                <p className="mx-auto mt-2 max-w-[32rem] text-center text-xs text-slate-500">{t("preview.flow.step2.sub")}</p>

                <ul className="mt-8 space-y-4" role="list">
                  <li className={`${glassPanel} p-5`}>
                    <p className="text-base font-semibold text-sky-100">{t("preview.flow.step2.card.customersTitle")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("preview.flow.step2.card.customersDesc")}</p>
                  </li>
                  <li className={`${glassPanel} p-5`}>
                    <p className="text-base font-semibold text-violet-100">{t("preview.flow.step2.card.aiTitle")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("preview.flow.step2.card.aiDesc")}</p>
                  </li>
                  <li className={`${glassPanel} p-5`}>
                    <p className="text-base font-semibold text-teal-100">{t("preview.flow.step2.card.followTitle")}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("preview.flow.step2.card.followDesc")}</p>
                  </li>
                </ul>
              </div>
            ) : null}

            {/* 스텝 3 */}
            {step === 2 ? (
              <div className="pb-6 text-center">
                <div className="mx-auto mb-5 flex justify-center rounded-2xl border border-sky-400/25 bg-sky-500/[0.08] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_40px_-12px_rgba(56,189,248,0.2)]">
                  <p className="max-w-[22rem] text-[clamp(1.06rem,3.6vw,1.35rem)] font-semibold leading-snug tracking-tight text-white">{t("preview.flow.step3.headline")}</p>
                </div>
                <p className="mx-auto mt-3 max-w-[min(100%,28rem)] text-sm leading-relaxed text-slate-400">{t("preview.flow.step3.sub")}</p>

                <div className="mx-auto mt-10 flex w-full max-w-md flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => pick("dashboard")}
                    className="sensora-premium-primary-workspace min-h-[3.25rem] w-full rounded-2xl py-3.5 text-base font-semibold touch-manipulation"
                  >
                    {t("preview.flow.step3.enterWorkspace")}
                  </button>
                  <button
                    type="button"
                    onClick={() => pick("ai")}
                    className={`${glassPanel} min-h-[3.125rem] w-full rounded-2xl py-3.5 text-base font-semibold text-white hover:border-violet-400/40 touch-manipulation`}
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

        <footer className="relative z-[1] shrink-0 border-t border-white/[0.08] bg-[#020617]/80 px-4 py-[max(12px,calc(env(safe-area-inset-bottom,0px)+12px))] backdrop-blur-md sm:px-6">
          <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3">
            <button
              type="button"
              disabled={step === 0}
              onClick={goPrev}
              className="min-h-12 min-w-[5.5rem] rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 hover:border-sky-400/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
            >
              {t("preview.flow.footer.prev")}
            </button>

            <div className="flex items-center gap-2" aria-hidden>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-[transform,opacity] ${i === step ? "scale-125 bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.8)]" : "bg-slate-600/80 opacity-65"}`}
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
