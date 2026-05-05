"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { SENSORA_GUIDES } from "@/lib/sensoraGuide";

/** 랜딩 보조 이미지 에셋 경로(@/public 기준). README 등에서 참고합니다. */
export const LANDING_SHOWROOM_IMAGE_PATHS = {
  hero: "/images/hero-classic-car.jpg",
  interior: "/images/vintage-car-interior.jpg",
  desk: "/images/concierge-desk.jpg",
  workspace: "/images/sales-dashboard-workspace.jpg",
} as const;

export {
  SENSORA_GUIDE_IMAGES,
  SENSORA_TIP_CARD_INITIAL_INDEX,
  sensoraGuideImageSources,
} from "@/app/components/concierge/sensoraGuideImages";

const JOIN_PATH = "/join" as const;
const SLIDE_COUNT = 4;
const GUIDE03 = "/images/guides/sensora-guide-03.png";

function thumbGuideImage(guideId: "sensora-guide-01" | "sensora-guide-02" | "sensora-guide-04") {
  return SENSORA_GUIDES.find((g) => g.id === guideId)?.image ?? GUIDE03;
}

const entPrimaryBtn =
  "landing-enterprise-btn-primary inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-2.5 text-[0.8625rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9375rem] lg:min-h-[3.125rem] lg:text-[1rem]";

const entGhostBtn =
  "landing-enterprise-btn-secondary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[0.8375rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9625rem] lg:min-h-[3.125rem]";

const tertiaryLink =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-slate-100/93 transition hover:border-white/[0.2] hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation sm:min-h-10 sm:px-4 sm:text-[0.875rem]";

type LandingMenuWorkspaceRow = {
  key: string;
  target: "workspace";
  section: CrmSection;
  thumbGuideId: "sensora-guide-01" | "sensora-guide-02" | "sensora-guide-04";
  titleKey: "landing.showroom.serviceMenu.customersTitle" | "landing.showroom.serviceMenu.aiTitle" | "landing.showroom.serviceMenu.aftercareTitle";
  descKey:
    | "landing.showroom.serviceMenu.customersDesc"
    | "landing.showroom.serviceMenu.aiDesc"
    | "landing.showroom.serviceMenu.aftercareDesc";
};

type LandingMenuDeliveryRow = {
  key: string;
  target: "delivery";
  titleKey: "landing.showroom.serviceMenu.deliveryTitle";
  descKey: "landing.showroom.serviceMenu.deliveryDesc";
};

type LandingMenuRow = LandingMenuWorkspaceRow | LandingMenuDeliveryRow;

const MENU_ITEMS: LandingMenuRow[] = [
  {
    key: "customers",
    target: "workspace",
    section: "customers",
    thumbGuideId: "sensora-guide-01",
    titleKey: "landing.showroom.serviceMenu.customersTitle",
    descKey: "landing.showroom.serviceMenu.customersDesc",
  },
  {
    key: "ai",
    target: "workspace",
    section: "ai",
    thumbGuideId: "sensora-guide-02",
    titleKey: "landing.showroom.serviceMenu.aiTitle",
    descKey: "landing.showroom.serviceMenu.aiDesc",
  },
  {
    key: "followup",
    target: "workspace",
    section: "followup",
    thumbGuideId: "sensora-guide-04",
    titleKey: "landing.showroom.serviceMenu.aftercareTitle",
    descKey: "landing.showroom.serviceMenu.aftercareDesc",
  },
  {
    key: "delivery",
    target: "delivery",
    titleKey: "landing.showroom.serviceMenu.deliveryTitle",
    descKey: "landing.showroom.serviceMenu.deliveryDesc",
  },
];

const PHILOSOPHY_LINE_KEYS = [
  "landing.slides.philosophy.line1",
  "landing.slides.philosophy.line2",
  "landing.slides.philosophy.line3",
  "landing.slides.philosophy.line4",
] as const;

function IconPlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.75 11.08V9.92c0-.6.323-1.15.839-1.424l5.62-3.068a1.583 1.583 0 012.541 1.424v8.088a1.584 1.584 0 01-2.541 1.424l-5.62-3.069a1.583 1.583 0 01-.839-1.423z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.65 14.42 12.41 10 7.65 5.58"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDeliveryThumb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 17h8v3h-2.5M13 17V9h8v8"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 17H3v-7l4-6h6v13zM9 22a1.5 1.5 0 1 0 .001-3.001A1.5 1.5 0 0 0 9 22zm10 0a1.5 1.5 0 1 0 .001-3.001A1.5 1.5 0 0 0 19 22zM6 10h7"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  slideIndex: number;
  onSlideChange: (index: number) => void;
  onOpenAppWorkspace: () => void;
  onEnterWorkspaceSection: (section: CrmSection) => void;
};

export function LandingShowroom({
  slideIndex,
  onSlideChange,
  onOpenAppWorkspace,
  onEnterWorkspaceSection,
}: Props) {
  const { t } = useLanguage();
  const safeSlide = ((slideIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
  const [deliveryPrepOpen, setDeliveryPrepOpen] = useState(false);

  const goSlide = useCallback(
    (i: number) => {
      onSlideChange(((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    },
    [onSlideChange],
  );

  useEffect(() => {
    const el = typeof document !== "undefined" ? document.getElementById("sensora-landing-slide-deck") : null;
    if (!el) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (deliveryPrepOpen) return;
      if (e.key === "ArrowRight" && safeSlide < SLIDE_COUNT - 1) {
        e.preventDefault();
        goSlide(safeSlide + 1);
      }
      if (e.key === "ArrowLeft" && safeSlide > 0) {
        e.preventDefault();
        goSlide(safeSlide - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deliveryPrepOpen, goSlide, safeSlide]);

  useEffect(() => {
    if (!deliveryPrepOpen || typeof document === "undefined") return undefined;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeliveryPrepOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [deliveryPrepOpen]);

  useEffect(() => {
    if (!deliveryPrepOpen || typeof document === "undefined") return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [deliveryPrepOpen]);

  const handleMenuNavigate = useCallback(
    (row: LandingMenuRow) => {
      if (row.target === "delivery") {
        setDeliveryPrepOpen(true);
        return;
      }
      onEnterWorkspaceSection(row.section);
    },
    [onEnterWorkspaceSection],
  );

  const dockSafe = "pb-[max(10px,calc(env(safe-area-inset-bottom,0px)+8px))] pt-2";

  return (
    <div
      id="sensora-landing-slide-deck"
      className="sensora-landing-slide-deck relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#020817]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_82%_52%_at_52%_8%,rgba(56,189,248,0.1),transparent_55%),radial-gradient(ellipse_58%_42%_at_96%_18%,rgba(139,92,246,0.08),transparent_52%),linear-gradient(180deg,#050f1e_0%,#020817_45%,#030b16_100%)]"
      />

      {deliveryPrepOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[282] cursor-default bg-black/[0.55] backdrop-blur-md"
            aria-label={t("landing.slides.deliveryPrep.dismiss")}
            onClick={() => setDeliveryPrepOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-delivery-prep-title"
            className="fixed left-[50%] top-[42%] z-[284] w-[min(calc(100vw-28px),22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.13] bg-gradient-to-b from-[#0a1628]/99 to-[#050f18]/97 p-5 shadow-[0_36px_80px_-28px_rgba(0,0,0,0.75)]"
          >
            <h3 id="landing-delivery-prep-title" className="text-base font-semibold tracking-tight text-slate-50">
              {t("landing.slides.deliveryPrep.title")}
            </h3>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-slate-300/[0.92]">{t("landing.slides.deliveryPrep.body")}</p>
            <button
              type="button"
              onClick={() => setDeliveryPrepOpen(false)}
              className={`${entPrimaryBtn} mt-6 w-full justify-center`}
            >
              {t("landing.slides.deliveryPrep.dismiss")}
            </button>
          </div>
        </>
      ) : null}

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden px-4 pt-2 sm:px-6 sm:pt-3 lg:pt-2 xl:pt-3">
          {/* 0 — 첫 슬라이드 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto overflow-x-hidden pb-2 sm:inset-x-6",
              safeSlide === 0 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 0}
          >
            <div className="landing-slide-hero-app-shell mx-auto flex h-full w-full max-w-[min(100%,400px)] flex-col gap-3 sm:max-w-[420px] lg:max-h-none lg:max-w-[1280px] lg:flex-row lg:items-stretch lg:justify-between lg:gap-8 xl:gap-10">
              <div className="flex w-full shrink-0 flex-col items-center text-center lg:max-w-[min(100%,34rem)] lg:items-start lg:justify-center lg:text-left xl:max-w-[36rem]">
                <div className="landing-hero-start-panel flex w-full flex-col items-center text-center lg:items-start lg:text-left">
                  <h1 className="max-w-[22ch] text-pretty text-[clamp(1.5rem,calc(0.82rem+4.2vw),2.75rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-white [word-break:keep-all] sm:max-w-[24ch] lg:max-w-none lg:text-[clamp(2.2rem,calc(1.18rem+4.7vw),3.25rem)]">
                    {t("product.name")}
                  </h1>
                  <p className="mt-2.5 max-w-[30ch] text-[clamp(0.94rem,calc(0.82rem+0.55vw),1.0625rem)] font-semibold leading-snug text-slate-100/[0.96] sm:mt-3 sm:max-w-[34ch] lg:mt-3 lg:max-w-[40ch] lg:text-[1.125rem]">
                    {t("landing.slides.enterprise.heroDefinition")}
                  </p>
                  <p className="mt-2 max-w-[32ch] text-[0.9rem] font-medium leading-snug text-slate-200/95 sm:text-[0.9375rem] lg:mt-2.5 lg:max-w-[40ch] lg:text-[1rem]">
                    {t("landing.slides.enterprise.heroSub")}
                  </p>
                  <p className="landing-hero-trust-line mt-2 max-w-[34ch] font-medium leading-snug text-violet-200/88 sm:mt-2 sm:text-[13px] lg:text-[0.8125rem] lg:text-violet-200/90">
                    {t("landing.showroom.hero.trustLine")}
                  </p>

                  <div className="landing-hero-app-actions mt-5 flex w-full max-w-[20rem] flex-col items-stretch gap-0 sm:mt-6 sm:max-w-[21rem] lg:mt-0 lg:w-full lg:max-w-none">
                    <div className="landing-slide-cta-cluster landing-hero-app-cta-row flex w-full flex-col items-stretch gap-2 sm:gap-2.5 lg:flex-row lg:flex-wrap lg:gap-2.5">
                      <Link
                        href={JOIN_PATH}
                        prefetch={false}
                        className={`${entPrimaryBtn} landing-hero-app-btn landing-hero-primary-cta min-h-[2.6875rem] w-full rounded-lg sm:min-h-[2.875rem] lg:min-h-[3.25rem] lg:text-[1.0625rem] sm:w-auto sm:min-w-[11.25rem]`}
                      >
                        {t("cta.joinBeta")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAppWorkspace();
                        }}
                        className={`${entGhostBtn} landing-hero-app-btn landing-hero-app-secondary-cta min-h-[2.6875rem] w-full rounded-lg sm:min-h-[2.875rem] lg:min-h-[3.25rem] lg:text-[1.03125rem] sm:w-auto sm:min-w-[10.75rem]`}
                      >
                        <IconPlay className="size-[1.02rem] shrink-0 opacity-95" />
                        {t("cta.tryAppExperience")}
                      </button>
                    </div>
                    <div className="mt-2 flex w-full justify-center lg:mt-2.5 lg:justify-start">
                      <Link href="/register" prefetch={false} className={`${tertiaryLink} landing-hero-app-tertiary`}>
                        {t("auth.salesRegistration")}
                      </Link>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => goSlide(1)}
                    className="mt-8 hidden min-h-10 shrink-0 items-center justify-center self-center rounded-lg border border-white/[0.12] bg-white/[0.035] px-5 py-2 text-[13px] font-semibold text-slate-100/93 transition hover:border-sky-400/28 hover:bg-white/[0.055] touch-manipulation lg:mt-9 lg:inline-flex lg:self-stretch"
                  >
                    {t("landing.slides.home.nextCta")}
                  </button>
                </div>
              </div>

              <div className="landing-hero-mock-column flex w-full flex-col items-center gap-4 lg:flex-1 lg:max-w-[min(58%,680px)] xl:max-w-[720px] lg:justify-center">
                <div className="relative flex w-full max-w-[min(100%,340px)] justify-center lg:max-w-none">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[-5%_-2%_-1%_-2%] rounded-[28px] bg-[radial-gradient(ellipse_72%_64%_at_50%_40%,rgba(56,189,248,0.12),transparent_70%)] opacity-75 blur-[22px] lg:opacity-80"
                  />
                  <div className="landing-hero-mock-frame relative w-full max-w-[340px] overflow-hidden rounded-[14px] border border-white/[0.16] bg-[#050f18]/[0.99] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.06] lg:max-w-none lg:rounded-[18px] xl:rounded-[20px]">
                    <div className="flex items-center gap-1.5 border-b border-white/[0.1] bg-[#051525]/98 px-2 py-1.5 sm:px-2.5 lg:px-3 lg:py-2">
                      <span className="size-2 rounded-full bg-rose-500/45" aria-hidden />
                      <span className="size-2 rounded-full bg-amber-400/45" aria-hidden />
                      <span className="size-2 rounded-full bg-emerald-400/42" aria-hidden />
                      <span className="ml-1 truncate text-[10px] font-semibold text-slate-400 lg:text-[11px]">{t("product.name")}</span>
                      <span className="ml-auto rounded border border-sky-400/28 bg-sky-500/[0.12] px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.08em] text-sky-100/92 sm:text-[10px]">
                        {t("landing.showroom.heroMock.previewBadge")}
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] max-h-[min(38vh,260px)] w-full bg-[#030712] sm:aspect-[5/6] sm:max-h-[min(42vh,300px)] lg:aspect-[5/6] lg:max-h-[min(56vh,520px)] xl:max-h-[min(58vh,560px)]">
                      <Image
                        src={GUIDE03}
                        alt=""
                        fill
                        className="object-cover object-top opacity-100 brightness-[1.02] contrast-[1.02] max-lg:object-contain max-lg:object-top lg:brightness-[1.06] lg:contrast-[1.03]"
                        sizes="(max-width:640px) 88vw,(max-width:1024px) 42vw, 480px"
                        quality={100}
                        priority
                      />
                      <div
                        className="landing-hero-mock-scrim pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/42 via-transparent to-[#030a14]/04 max-lg:from-[#020817]/38 lg:from-[#020817]/28"
                        aria-hidden
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goSlide(1)}
                  className="mt-2 inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.035] px-4 py-2 text-[12px] font-semibold text-slate-100/93 transition hover:border-sky-400/28 hover:bg-white/[0.06] touch-manipulation sm:min-h-10 sm:px-5 sm:text-[13px] lg:hidden"
                >
                  {t("landing.slides.home.nextCta")}
                </button>
              </div>
            </div>
          </div>

          {/* 1 — 핵심 업무 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 1 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 1}
          >
            <div className="mx-auto flex w-full max-w-[720px] flex-col pb-1 lg:max-w-[800px]">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-sky-400/88 sm:text-[11px]">
                {t("landing.slides.menu.kicker")}
              </p>
              <h2 className="mt-2 text-center text-[clamp(1.35rem,calc(0.85rem+2.1vw),1.85rem)] font-semibold tracking-[-0.032em] text-slate-50">
                {t("landing.showroom.serviceMenu.sectionTitle")}
              </h2>
              <p className="mx-auto mt-1.5 max-w-[40ch] text-center text-[0.8125rem] leading-snug text-slate-400/95 sm:mt-2 sm:text-[0.8375rem]">
                {t("landing.slides.menu.enterpriseSub")}
              </p>
              <div className="mt-5 flex w-full flex-col gap-2 sm:mt-6 sm:gap-2.5">
                {MENU_ITEMS.map((row) => (
                  <button
                    key={row.key}
                    type="button"
                    aria-label={
                      row.target === "delivery"
                        ? `${t(row.titleKey)} · ${t("landing.slides.menu.deliveryPrepAria")}`
                        : `${t(row.titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`
                    }
                    onClick={() => handleMenuNavigate(row)}
                    className="landing-slide-menu-row group flex min-h-[4rem] w-full items-center gap-3 rounded-xl border border-white/[0.1] bg-[#050f1a]/88 px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-[border-color,background-color] hover:border-sky-400/28 hover:bg-[#071425]/95 active:scale-[0.996] touch-manipulation sm:min-h-[4.375rem] sm:gap-4 sm:px-4 sm:py-3"
                  >
                    {row.target === "workspace" ? (
                      <div className="relative h-[2.75rem] w-[3.7rem] shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#020617] sm:h-[3rem] sm:w-[4.1rem]">
                        <Image
                          src={thumbGuideImage(row.thumbGuideId)}
                          alt=""
                          fill
                          className="object-cover object-center opacity-[0.9]"
                          sizes="72px"
                          quality={92}
                        />
                      </div>
                    ) : (
                      <div className="flex size-[2.75rem] shrink-0 items-center justify-center rounded-lg border border-dashed border-sky-400/22 bg-[#081422]/92 text-sky-300/82 sm:size-[3rem]">
                        <IconDeliveryThumb className="size-[1.35rem]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[1.03rem] font-semibold leading-tight tracking-[-0.02em] text-slate-50 sm:text-[1.1rem]">
                        {t(row.titleKey)}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[0.765rem] leading-snug text-slate-400/92 sm:text-[0.8rem]">{t(row.descKey)}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-sky-200/88">
                      <span className="max-w-[6.5rem] text-right text-[11px] font-semibold leading-tight text-sky-100/88 sm:max-w-none sm:text-[12px]">
                        {row.target === "delivery" ? t("landing.slides.menu.actionDeliveryStatus") : t("landing.slides.menu.actionGoWorkspace")}
                      </span>
                      <IconChevron className="size-[1.05rem] shrink-0 opacity-88 transition group-hover:translate-x-0.5 sm:size-[1.1rem]" />
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-5">
                <button
                  type="button"
                  onClick={() => goSlide(2)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.04] px-7 py-2.5 text-[13px] font-semibold text-slate-100 transition hover:border-sky-400/28 hover:bg-white/[0.07] touch-manipulation"
                >
                  {t("landing.slides.menu.nextPhilosophy")}
                </button>
                <button
                  type="button"
                  onClick={() => goSlide(0)}
                  className="text-[13px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation"
                >
                  {t("landing.slides.nav.prev")}
                </button>
              </div>
            </div>
          </div>

          {/* 2 — 운영 원칙 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 2 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 2}
          >
            <div className="mx-auto flex w-full max-w-[560px] flex-col items-center sm:max-w-[600px] lg:max-w-[640px]">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78 sm:text-[11px]">{t("landing.slides.philosophy.kicker")}</p>
              <h2 className="mt-4 max-w-[18ch] text-center text-[clamp(1.28rem,calc(0.7rem+2.35vw),1.92rem)] font-semibold leading-[1.12] tracking-[-0.034em] text-slate-50 [word-break:keep-all] sm:max-w-[22ch]">
                {t("landing.slides.philosophy.title")}
              </h2>
              <ul className="mt-8 w-full border-t border-white/[0.08] sm:mt-10">
                {PHILOSOPHY_LINE_KEYS.map((lineKey) => (
                  <li key={lineKey} className="border-b border-white/[0.08] py-[1.05rem] sm:py-[1.2rem]">
                    <p className="border-l-[3px] border-sky-400/45 pl-4 text-left text-[0.9rem] font-medium leading-snug text-slate-200/93 sm:pl-[1.125rem] sm:text-[0.9575rem] sm:leading-[1.42]">
                      {t(lineKey)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <button type="button" onClick={() => goSlide(3)} className={`${entPrimaryBtn} min-h-[3rem] px-8`}>
                  {t("landing.slides.philosophy.nextCta")}
                </button>
                <button
                  type="button"
                  onClick={() => goSlide(1)}
                  className="text-[13px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation"
                >
                  {t("landing.slides.nav.prev")}
                </button>
              </div>
            </div>
          </div>

          {/* 3 — 전환 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 3 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 3}
          >
            <div className="mx-auto flex w-full max-w-[440px] flex-col items-center text-center sm:max-w-[460px]">
              <h2 className="max-w-[24ch] text-[clamp(1.2rem,calc(0.82rem+1.85vw),1.65rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-slate-50 [word-break:keep-all] sm:max-w-[26ch]">
                {t("landing.slides.actions.closingHeadline")}
              </h2>
              <div className="landing-slide-actions-cta-cluster mx-auto mt-9 flex w-full max-w-[22rem] flex-col items-stretch gap-2.5 sm:mt-10 sm:max-w-[24rem]">
                <Link href={JOIN_PATH} prefetch={false} className={`${entPrimaryBtn} w-full justify-center`}>
                  {t("cta.joinBeta")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAppWorkspace();
                  }}
                  className={`${entGhostBtn} w-full justify-center gap-2 border border-white/[0.12]`}
                >
                  <IconPlay className="size-[1.05rem] shrink-0 opacity-95" />
                  {t("landing.slides.actions.browseAppCta")}
                </button>
                <Link href="/register" prefetch={false} className={`${entGhostBtn} w-full justify-center border border-violet-300/[0.2]`}>
                  {t("auth.salesRegistration")}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => goSlide(2)}
                className="mt-8 text-[12px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation sm:text-[13px]"
              >
                {t("landing.slides.actions.backToPhilosophy")}
              </button>
            </div>
          </div>
        </div>

        <nav
          className={`landing-slide-nav-dock relative z-[5] shrink-0 border-t border-white/[0.09] bg-[#020817]/94 backdrop-blur-md ${dockSafe}`}
          aria-label={t("landing.slides.dotNav")}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-3 sm:px-4">
            <button
              type="button"
              disabled={safeSlide <= 0}
              onClick={() => goSlide(safeSlide - 1)}
              className="min-h-10 min-w-[4.25rem] rounded-xl border border-white/[0.1] bg-white/[0.035] px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation sm:text-sm"
            >
              {t("landing.slides.nav.prev")}
            </button>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {Array.from({ length: SLIDE_COUNT }, (_, i) => (
                <button
                  key={`dot-${String(i)}`}
                  type="button"
                  aria-current={safeSlide === i ? "step" : undefined}
                  aria-label={`${String(i + 1)} / ${String(SLIDE_COUNT)}`}
                  onClick={() => goSlide(i)}
                  className={[
                    "size-2.5 shrink-0 rounded-full transition sm:size-3",
                    safeSlide === i ? "scale-[1.06] bg-sky-400 landing-enterprise-slide-dot-active" : "bg-slate-600/82 hover:bg-slate-500",
                  ].join(" ")}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={safeSlide >= SLIDE_COUNT - 1}
              onClick={() => goSlide(safeSlide + 1)}
              className="min-h-10 min-w-[4.25rem] rounded-xl border border-white/[0.1] bg-white/[0.035] px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation sm:text-sm"
            >
              {t("landing.slides.nav.next")}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
