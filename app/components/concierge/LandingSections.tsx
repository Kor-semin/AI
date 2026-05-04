"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { SensoraGuideDetailModal } from "@/app/components/concierge/SensoraGuideDetailModal";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { DEFAULT_GUIDE_ID, SENSORA_GUIDES, type SensoraGuideId } from "@/lib/sensoraGuide";

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

const entPrimaryBtn =
  "landing-enterprise-btn-primary inline-flex min-h-[3rem] shrink-0 items-center justify-center rounded-xl px-7 py-3 text-[0.9375rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3.125rem] sm:text-[1rem]";

const entGhostBtn =
  "landing-enterprise-btn-secondary inline-flex min-h-[3rem] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-[0.9rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3.125rem] sm:px-7 sm:text-[0.9625rem]";

const tertiaryLink =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-[0.875rem] font-semibold text-slate-100/93 transition hover:border-white/[0.2] hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation";

const MENU_ROW = [
  {
    guideId: "sensora-guide-01" as const,
    titleKey: "landing.showroom.serviceMenu.customersTitle" as const,
    descKey: "landing.showroom.serviceMenu.customersDesc" as const,
  },
  {
    guideId: "sensora-guide-02" as const,
    titleKey: "landing.showroom.serviceMenu.aiTitle" as const,
    descKey: "landing.showroom.serviceMenu.aiDesc" as const,
  },
  {
    guideId: "sensora-guide-04" as const,
    titleKey: "landing.showroom.serviceMenu.aftercareTitle" as const,
    descKey: "landing.showroom.serviceMenu.aftercareDesc" as const,
  },
  {
    guideId: "sensora-guide-03" as const,
    titleKey: "landing.showroom.serviceMenu.deliveryTitle" as const,
    descKey: "landing.showroom.serviceMenu.deliveryDesc" as const,
  },
] as const;

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
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState<SensoraGuideId>(DEFAULT_GUIDE_ID);

  const goSlide = useCallback(
    (i: number) => {
      onSlideChange(((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    },
    [onSlideChange],
  );

  const openGuide = useCallback((id: SensoraGuideId) => {
    setActiveGuideId(id);
    setGuideModalOpen(true);
  }, []);

  const openSampleGuideModal = useCallback(() => {
    setActiveGuideId(DEFAULT_GUIDE_ID);
    setGuideModalOpen(true);
  }, []);

  const handleGoToRelated = useCallback(
    (section: CrmSection) => {
      setGuideModalOpen(false);
      onEnterWorkspaceSection(section);
    },
    [onEnterWorkspaceSection],
  );

  /** 키보드 화살표: 모달 오픈 시에는 슬라이드 이동 비활성 */
  useEffect(() => {
    const el = typeof document !== "undefined" ? document.getElementById("sensora-landing-slide-deck") : null;
    if (!el) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (guideModalOpen) return;
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
  }, [goSlide, guideModalOpen, safeSlide]);

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

      <SensoraGuideDetailModal
        open={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        activeGuideId={activeGuideId}
        onActiveGuideChange={setActiveGuideId}
        onGoToRelated={handleGoToRelated}
        overlayZClass="z-[280]"
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden px-4 pt-2 sm:px-6 sm:pt-3 lg:pt-4">
          {/* 0 — 제품 발표형 히어로 */}
          <div
            className={[
              "sensora-landing-slide-panel absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto overflow-x-hidden pb-2 sm:inset-x-6",
              safeSlide === 0 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 0}
          >
            <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col lg:min-h-0 lg:flex-row lg:items-center lg:justify-between lg:gap-8 xl:gap-12">
              <div className="flex shrink-0 flex-col items-center text-center lg:max-w-[min(100%,28rem)] lg:items-start lg:text-left xl:max-w-[30rem]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-400/88 sm:text-[11px]">
                  {t("landing.slides.enterprise.productKicker")}
                </p>
                <h1 className="mt-3 text-pretty text-[clamp(1.5rem,calc(0.65rem+3.8vw),2.35rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-white [word-break:keep-all] lg:mt-3.5">
                  {t("product.name")}
                </h1>
                <p className="mt-2 max-w-[32ch] text-[0.95rem] font-medium leading-snug text-slate-200/94 sm:text-[1.015rem] lg:max-w-none">
                  {t("landing.slides.enterprise.heroDefinition")}
                </p>
                <p className="mt-2 max-w-[34ch] text-[0.8125rem] font-medium leading-snug text-sky-200/82 sm:text-[0.8375rem] lg:max-w-none">
                  {t("landing.slides.enterprise.heroTrust")}
                </p>

                <div className="landing-slide-cta-cluster mt-7 flex w-full max-w-[22rem] flex-col items-stretch gap-2.5 sm:max-w-[26rem] sm:flex-row sm:flex-wrap sm:justify-center lg:mt-8 lg:max-w-none lg:justify-start">
                  <Link
                    href={JOIN_PATH}
                    prefetch={false}
                    className={`${entPrimaryBtn} w-full sm:w-auto sm:min-w-[10.75rem]`}
                  >
                    {t("cta.joinBeta")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAppWorkspace();
                    }}
                    className={`${entGhostBtn} w-full sm:w-auto sm:min-w-[10.75rem]`}
                  >
                    <IconPlay className="size-[1.05rem] shrink-0 opacity-95" />
                    {t("cta.tryAppExperience")}
                  </button>
                </div>
                <div className="mt-2 flex w-full max-w-[22rem] justify-center sm:max-w-[26rem] lg:justify-start">
                  <Link href="/register" prefetch={false} className={`${tertiaryLink}`}>
                    {t("auth.salesRegistration")}
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => goSlide(1)}
                  className="mt-8 inline-flex min-h-10 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.04] px-5 py-2 text-[13px] font-semibold text-slate-100/93 transition hover:border-sky-400/32 hover:bg-white/[0.07] touch-manipulation lg:mt-10"
                >
                  {t("landing.slides.home.nextCta")}
                </button>
              </div>

              <div className="relative mt-7 flex min-h-[min(52vh,420px)] flex-1 items-center justify-center lg:mt-0 lg:min-h-0 lg:max-w-[min(52%,520px)] xl:max-w-[540px]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[-8%_-4%_-4%_-4%] rounded-[36px] bg-[radial-gradient(ellipse_70%_62%_at_50%_42%,rgba(56,189,248,0.11),transparent_68%)] opacity-90 blur-[40px]"
                />
                <div className="relative w-full max-w-[min(100%,460px)] lg:max-w-none">
                  <div className="overflow-hidden rounded-[16px] border border-white/[0.16] bg-[#020a14]/98 shadow-[0_36px_90px_-32px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.088)] ring-1 ring-white/[0.04] sm:rounded-[18px] lg:rounded-[20px]">
                    <div className="flex items-center gap-1.5 border-b border-white/[0.085] bg-[#040f1d]/96 px-2.5 py-1.5 sm:px-3 sm:py-2">
                      <span className="size-2 rounded-full bg-rose-500/45" aria-hidden />
                      <span className="size-2 rounded-full bg-amber-400/45" aria-hidden />
                      <span className="size-2 rounded-full bg-emerald-400/42" aria-hidden />
                      <span className="ml-1 truncate text-[10px] font-semibold text-slate-500 sm:text-[11px]">
                        {t("product.name")}
                      </span>
                      <span className="ml-auto rounded border border-sky-400/22 bg-sky-500/[0.08] px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.08em] text-sky-100/88 sm:px-2 sm:text-[10px]">
                        {t("landing.showroom.heroMock.previewBadge")}
                      </span>
                    </div>
                    <div className="relative aspect-[4/5] w-full bg-[#020617] lg:aspect-[10/13] xl:aspect-[42/53]">
                      <Image
                        src={GUIDE03}
                        alt=""
                        fill
                        className="object-cover object-top opacity-[0.97]"
                        sizes="(max-width:1024px) 92vw, 460px"
                        quality={100}
                        priority
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/75 via-transparent to-[#030a14]/12"
                        aria-hidden
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1 — 핵심 업무 4 */}
          <div
            className={[
              "sensora-landing-slide-panel absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 1 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 1}
          >
            <div className="mx-auto flex w-full max-w-[900px] flex-col pb-1">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-400/85 sm:text-[11px]">
                {t("landing.slides.menu.kicker")}
              </p>
              <h2 className="mt-2 text-center text-[clamp(1.2rem,calc(0.8rem+1.9vw),1.62rem)] font-semibold tracking-[-0.03em] text-slate-50">
                {t("landing.showroom.serviceMenu.sectionTitle")}
              </h2>
              <p className="mx-auto mt-1.5 max-w-[42ch] text-center text-[0.815rem] leading-snug text-slate-400 sm:mt-2 sm:text-[0.84rem]">
                {t("landing.slides.menu.enterpriseSub")}
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4">
                {MENU_ROW.map((row) => (
                  <button
                    key={row.guideId}
                    type="button"
                    onClick={() => openGuide(row.guideId)}
                    className="landing-slide-menu-row group flex min-h-[4.625rem] w-full items-center gap-3 rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#081424]/95 to-[#030910]/98 px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ring-1 ring-inset ring-white/[0.04] transition-[transform,border-color] hover:border-sky-400/32 active:scale-[0.995] touch-manipulation sm:min-h-[5.125rem] sm:gap-3.5 sm:px-4 sm:py-3.5"
                  >
                    <div className="relative h-[3.125rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#020617] sm:h-[3.5rem] sm:w-[5rem]">
                      <Image
                        src={SENSORA_GUIDES.find((g) => g.id === row.guideId)?.image ?? GUIDE03}
                        alt=""
                        fill
                        className="object-cover object-center opacity-94"
                        sizes="80px"
                        quality={92}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[1rem] font-semibold text-slate-50 sm:text-[1.05rem]">{t(row.titleKey)}</p>
                      <p className="mt-0.5 line-clamp-2 text-[0.785rem] leading-relaxed text-slate-400 sm:text-[0.8125rem]">
                        {t(row.descKey)}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-sky-400/72">
                        {t("landing.showroom.serviceMenu.tapHint")}
                      </p>
                    </div>
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

          {/* 2 — 운영 원칙 / 신뢰 */}
          <div
            className={[
              "sensora-landing-slide-panel absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 2 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 2}
          >
            <div className="mx-auto flex w-full max-w-[640px] flex-col items-center xl:max-w-[720px]">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78 sm:text-[11px]">
                {t("landing.slides.philosophy.kicker")}
              </p>
              <h2 className="mt-3 max-w-[24ch] text-center text-[clamp(1.12rem,calc(0.75rem+1.85vw),1.52rem)] font-semibold leading-tight tracking-[-0.028em] text-slate-50">
                {t("landing.slides.philosophy.title")}
              </h2>
              <ul className="mt-6 w-full space-y-0 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.1] bg-[#040d18]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.048)] backdrop-blur-sm sm:mt-8">
                {PHILOSOPHY_LINE_KEYS.map((lineKey, idx) => (
                  <li
                    key={lineKey}
                    className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-[1.125rem]"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-[1.6rem] w-9 shrink-0 items-center justify-center rounded-md border border-sky-400/22 bg-gradient-to-br from-sky-500/12 to-violet-500/8 text-[11px] font-bold tabular-nums text-sky-200/92 sm:h-[1.75rem] sm:w-10 sm:text-[12px]"
                    >
                      {idx + 1}
                    </span>
                    <p className="min-w-0 flex-1 text-left text-[0.875rem] font-medium leading-snug text-slate-200/93 sm:text-[0.9275rem] sm:leading-[1.45]">
                      {t(lineKey)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <button
                  type="button"
                  onClick={() => goSlide(3)}
                  className={`${entPrimaryBtn} min-w-[10.5rem] px-8`}
                >
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

          {/* 3 — 시작 액션 */}
          <div
            className={[
              "sensora-landing-slide-panel absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 3 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 3}
          >
            <div className="mx-auto flex w-full max-w-[480px] flex-col items-center text-center sm:max-w-[520px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-400/85 sm:text-[11px]">
                {t("landing.slides.actions.kicker")}
              </p>
              <h2 className="mt-4 max-w-[22ch] text-[clamp(1.1rem,calc(0.88rem+1.5vw),1.55rem)] font-semibold leading-snug tracking-[-0.028em] text-slate-50">
                {t("landing.showroom.closing.title")}
              </h2>
              <div className="landing-slide-actions-cta-cluster mt-8 flex w-full max-w-md flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
                <Link href={JOIN_PATH} prefetch={false} className={`${entPrimaryBtn} w-full sm:w-auto sm:min-w-[11rem]`}>
                  {t("cta.joinBeta")}
                </Link>
                <Link
                  href="/register"
                  prefetch={false}
                  className={`${entGhostBtn} w-full border border-violet-300/22 sm:w-auto sm:min-w-[11rem]`}
                >
                  {t("auth.salesRegistration")}
                </Link>
              </div>
              <div className="mt-6 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
                <button
                  type="button"
                  onClick={() => goSlide(2)}
                  className="text-[13px] font-semibold text-slate-400 underline-offset-[3px] hover:text-slate-200 hover:underline touch-manipulation"
                >
                  {t("landing.slides.actions.backToPhilosophy")}
                </button>
                <button
                  type="button"
                  onClick={openSampleGuideModal}
                  className="text-[13px] font-semibold text-sky-300/88 underline-offset-[3px] hover:text-sky-200 hover:underline touch-manipulation"
                >
                  {t("landing.slides.actions.openSampleScreens")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAppWorkspace();
                  }}
                  className="text-[13px] font-semibold text-slate-400 underline-offset-[3px] hover:text-slate-200 hover:underline touch-manipulation"
                >
                  {t("landing.slides.actions.openWorkspace")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 독 */}
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
                    safeSlide === i
                      ? "scale-[1.06] bg-sky-400 landing-enterprise-slide-dot-active"
                      : "bg-slate-600/82 hover:bg-slate-500",
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
