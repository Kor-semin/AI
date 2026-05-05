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
const LANDING_FIRST_SCREEN_REFERENCE = "/images/Sensora1.png";

function thumbGuideImage(guideId: "sensora-guide-01" | "sensora-guide-02" | "sensora-guide-04") {
  return SENSORA_GUIDES.find((g) => g.id === guideId)?.image ?? "/images/guides/sensora-guide-01.png";
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

const LANDING_FIRST_SCREEN_CARDS = [
  {
    key: "customers",
    title: "고객관리",
    desc: "상담 메모와 관심 차량을 고객별로 정리합니다.",
    tone: "customers",
  },
  {
    key: "ai",
    title: "AI 비서",
    desc: "검토용 초안과 고객 니즈를 함께 확인합니다.",
    tone: "ai",
  },
  {
    key: "followup",
    title: "사후관리",
    desc: "다음 연락과 해야 할 일을 놓치지 않게 정리합니다.",
    tone: "followup",
  },
  {
    key: "delivery",
    title: "출고 안내",
    desc: "반복되는 안내 문구를 준비 중입니다.",
    tone: "delivery",
  },
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

function LandingFeatureIcon({ tone, className }: { tone: "customers" | "ai" | "followup" | "delivery"; className?: string }) {
  const toneClass = {
    customers: "from-sky-100 to-blue-50 text-sky-600 ring-sky-100",
    ai: "from-violet-100 to-indigo-50 text-violet-600 ring-violet-100",
    followup: "from-emerald-100 to-teal-50 text-emerald-600 ring-emerald-100",
    delivery: "from-slate-100 to-slate-50 text-slate-600 ring-slate-200",
  }[tone];

  if (tone === "delivery") {
    return (
      <span className={`${className ?? ""} inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass} ring-1`.trim()}>
        <IconDeliveryThumb className="size-5" />
      </span>
    );
  }

  return (
    <span className={`${className ?? ""} inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass} ring-1`.trim()}>
      <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
        {tone === "customers" ? (
          <>
            <path d="M7.5 11a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5Z" stroke="currentColor" strokeWidth="1.65" />
            <path d="M3.25 19.25c.55-3.05 2.08-4.55 4.25-4.55s3.7 1.5 4.25 4.55" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
            <path d="M14 6.2h6M14 11.2h5M14 16.2h4" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
          </>
        ) : tone === "ai" ? (
          <>
            <path d="M12 3.75l1.3 4.05 4.2 1.2-4.2 1.28L12 14.25l-1.3-3.97L6.5 9l4.2-1.2L12 3.75Z" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
            <path d="M18.25 14.5l.62 1.86 1.88.64-1.88.62-.62 1.88-.64-1.88-1.86-.62 1.86-.64.64-1.86Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
            <path d="M5.8 14.1h5.4M5.8 17.5h7.1" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M7 4.75v3.5M17 4.75v3.5M5.75 7.25h12.5a2 2 0 0 1 2 2v8.25a2 2 0 0 1-2 2H5.75a2 2 0 0 1-2-2V9.25a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
            <path d="M8 12.25h2.4M8 15.5h5.4" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
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
            <div className="landing-slide-hero-app-shell mx-auto grid h-full w-full max-w-[min(100%,420px)] content-start gap-4 sm:max-w-[460px] lg:block lg:max-w-[1320px]">
              <div className="landing-first-screen-reference-canvas relative hidden w-full overflow-hidden rounded-[32px] border border-white/[0.12] bg-[#020817] shadow-[0_42px_120px_-58px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] lg:block">
                <Image
                  src={LANDING_FIRST_SCREEN_REFERENCE}
                  alt="Sensora 랜딩 첫 화면 시안"
                  fill
                  className="object-cover object-center"
                  sizes="1320px"
                  quality={100}
                  priority
                />
                <Link href={JOIN_PATH} prefetch={false} className="landing-first-screen-hotspot landing-first-screen-hotspot--join" aria-label={t("cta.joinBeta")}>
                  <span className="sr-only">{t("cta.joinBeta")}</span>
                </Link>
                <button
                  type="button"
                  onClick={onOpenAppWorkspace}
                  className="landing-first-screen-hotspot landing-first-screen-hotspot--preview"
                  aria-label={t("cta.tryAppExperience")}
                >
                  <span className="sr-only">{t("cta.tryAppExperience")}</span>
                </button>
                <Link href="/register" prefetch={false} className="landing-first-screen-hotspot landing-first-screen-hotspot--register" aria-label={t("auth.salesRegistration")}>
                  <span className="sr-only">{t("auth.salesRegistration")}</span>
                </Link>
                {MENU_ITEMS.map((row, index) => (
                  <button
                    key={`reference-${row.key}`}
                    type="button"
                    onClick={() => handleMenuNavigate(row)}
                    className={`landing-first-screen-hotspot landing-first-screen-hotspot--feature landing-first-screen-hotspot--feature-${index + 1}`}
                    aria-label={row.target === "delivery" ? `${t(row.titleKey)} · ${t("landing.slides.menu.deliveryPrepAria")}` : `${t(row.titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`}
                  >
                    <span className="sr-only">{t(row.titleKey)}</span>
                  </button>
                ))}
              </div>

              <div className="landing-hero-start-panel landing-first-screen-live-panel flex min-w-0 flex-col rounded-[28px] border border-white/[0.11] bg-white/[0.055] p-3 text-left shadow-[0_30px_82px_-46px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl sm:p-4 lg:hidden lg:rounded-[32px] lg:p-5">
                <div className="rounded-[24px] bg-[linear-gradient(145deg,#0a1b32_0%,#071221_52%,#050a13_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_22px_60px_-34px_rgba(56,189,248,0.35)] sm:p-6 lg:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-sky-100/72">{t("product.name")}</p>
                  <h1 className="mt-4 max-w-[13ch] text-balance text-[clamp(2rem,calc(1.25rem+4vw),3.75rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-white [word-break:keep-all] lg:max-w-[12ch]">
                    {t("landing.slides.enterprise.heroDefinition")}
                  </h1>
                  <p className="mt-4 max-w-[28ch] text-[0.93rem] font-medium leading-relaxed text-slate-200/90 sm:text-[1rem] lg:text-[1.05rem]">
                    {t("landing.slides.enterprise.heroSub")}
                  </p>
                  <p className="landing-hero-trust-line mt-3 max-w-[31ch] text-[0.78rem] font-medium leading-relaxed text-slate-400 sm:text-[0.84rem]">
                    {t("landing.showroom.hero.trustLine")}
                  </p>
                  <div className="landing-hero-app-actions mt-6 grid gap-2.5 sm:mt-7">
                    <Link
                      href={JOIN_PATH}
                      prefetch={false}
                      className={`${entPrimaryBtn} landing-hero-app-btn landing-hero-primary-cta landing-first-screen-primary-cta min-h-[3.25rem] w-full rounded-2xl px-6 text-[1.02rem] sm:min-h-[3.4rem]`}
                    >
                      {t("cta.joinBeta")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAppWorkspace();
                      }}
                      className={`${entGhostBtn} landing-hero-app-btn landing-hero-app-secondary-cta min-h-[3.12rem] w-full rounded-2xl px-6 text-[0.98rem]`}
                    >
                      <IconPlay className="size-[1rem] shrink-0 opacity-95" />
                      {t("cta.tryAppExperience")}
                    </button>
                    <Link
                      href="/register"
                      prefetch={false}
                      className={`${entGhostBtn} landing-hero-app-btn landing-hero-app-tertiary-cta min-h-[3.12rem] w-full justify-center rounded-2xl border border-white/[0.14] bg-white/[0.03] px-6 text-[0.97rem] text-slate-100/90`}
                    >
                      {t("auth.salesRegistration")}
                    </Link>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
                  {MENU_ITEMS.map((row) => (
                    <button
                      key={`hero-${row.key}`}
                      type="button"
                      onClick={() => handleMenuNavigate(row)}
                      className="landing-first-screen-feature-card group min-h-[7.35rem] rounded-[22px] border border-slate-200/85 bg-white px-3.5 py-3 text-left text-slate-950 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,0.95)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_44px_-26px_rgba(14,165,233,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[8rem] sm:px-4 sm:py-3.5"
                      aria-label={row.target === "delivery" ? `${t(row.titleKey)} · ${t("landing.slides.menu.deliveryPrepAria")}` : `${t(row.titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`}
                    >
                      <span
                        className={[
                          "flex size-9 items-center justify-center rounded-2xl text-white shadow-[0_10px_24px_-14px_rgba(15,23,42,0.5)]",
                          row.key === "customers" ? "bg-sky-500" : row.key === "ai" ? "bg-violet-500" : row.key === "followup" ? "bg-emerald-500" : "bg-slate-500",
                        ].join(" ")}
                        aria-hidden
                      >
                        {row.target === "delivery" ? <IconDeliveryThumb className="size-[1.08rem]" /> : <IconChevron className="size-[1rem]" />}
                      </span>
                      <span className="mt-3 block text-[0.93rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[1.02rem]">{t(row.titleKey)}</span>
                      <span className="mt-1.5 block line-clamp-2 text-[0.72rem] font-medium leading-snug text-slate-500 sm:text-[0.78rem]">{t(row.descKey)}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goSlide(1)}
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.035] px-5 py-2 text-[13px] font-semibold text-slate-100/93 transition hover:border-sky-400/28 hover:bg-white/[0.055] touch-manipulation"
                >
                  {t("landing.slides.home.nextCta")}
                </button>
              </div>

              <div className="landing-hero-mock-column relative hidden min-w-0 justify-center lg:hidden">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[8%_-6%_3%_-6%] rounded-[48px] bg-[radial-gradient(ellipse_72%_64%_at_50%_40%,rgba(56,189,248,0.14),transparent_70%)] opacity-80 blur-[28px]"
                />
                <div className="landing-hero-mock-frame relative w-full max-w-[640px] overflow-hidden rounded-[32px] border border-white/[0.14] bg-[#07111f]/95 p-3 shadow-[0_34px_110px_-54px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-white/[0.05]">
                  <div className="relative overflow-hidden rounded-[24px] bg-slate-50 text-slate-950">
                    <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4">
                      <span className="text-lg font-semibold tracking-[-0.035em]">{t("product.name")}</span>
                      <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-400" aria-hidden>
                        <IconDeliveryThumb className="size-[1.05rem]" />
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="rounded-[28px] bg-[linear-gradient(145deg,#0c2340,#071323_55%,#050a13)] p-7 text-white shadow-[0_24px_58px_-34px_rgba(2,8,23,0.65)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/70">{t("landing.showroom.heroMock.previewBadge")}</p>
                        <p className="mt-4 max-w-[12ch] text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.055em]">{t("landing.slides.enterprise.heroDefinition")}</p>
                        <p className="mt-4 max-w-[27ch] text-[0.9rem] leading-relaxed text-slate-200/88">{t("landing.slides.enterprise.heroSub")}</p>
                        <button type="button" onClick={onOpenAppWorkspace} className="mt-6 min-h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950">
                          {t("cta.tryAppExperience")}
                        </button>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {MENU_ITEMS.map((row) => (
                          <button
                            key={`desktop-${row.key}`}
                            type="button"
                            onClick={() => handleMenuNavigate(row)}
                            className="min-h-[8.25rem] rounded-[22px] border border-slate-200 bg-white p-4 text-left shadow-[0_14px_36px_-28px_rgba(15,23,42,0.42)] transition hover:border-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35"
                          >
                            <span className="text-[0.98rem] font-semibold tracking-[-0.03em] text-slate-950">{t(row.titleKey)}</span>
                            <span className="mt-2 block line-clamp-2 text-[0.78rem] leading-snug text-slate-500">{t(row.descKey)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -right-7 top-8 hidden h-64 w-36 overflow-hidden rounded-[22px] border border-white/[0.18] bg-slate-950/50 opacity-35 shadow-2xl xl:block" aria-hidden>
                    <Image src={LANDING_FIRST_SCREEN_REFERENCE} alt="" fill className="object-cover object-top" sizes="144px" quality={90} priority />
                  </div>
                </div>
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
