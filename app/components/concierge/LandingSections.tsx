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

const primaryBtn =
  "sensora-premium-primary-workspace inline-flex min-h-[3.125rem] w-full max-w-[min(100%,22rem)] shrink-0 items-center justify-center rounded-2xl px-8 py-3.5 text-[0.96875rem] font-semibold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_48px_-12px_rgba(56,189,248,0.28)] touch-manipulation sm:min-h-[3.375rem] sm:max-w-none sm:flex-1 sm:text-[1.0625rem]";

const ghostBtn =
  "inline-flex min-h-[3.125rem] w-full max-w-[min(100%,22rem)] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/[0.28] bg-white/[0.08] px-7 py-3.5 text-[0.9375rem] font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_0_36px_-10px_rgba(56,189,248,0.14)] ring-1 ring-inset ring-sky-400/18 backdrop-blur-md transition hover:border-sky-400/35 hover:bg-white/[0.11] touch-manipulation sm:min-h-[3.375rem] sm:max-w-none sm:flex-1 sm:px-8 sm:text-[1rem]";

const tertiaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.04] px-5 py-2.5 text-[0.9rem] font-semibold text-slate-100/95 backdrop-blur-md transition hover:border-sky-400/28 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation";

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

export function LandingShowroom({ slideIndex, onSlideChange, onOpenAppWorkspace, onEnterWorkspaceSection }: Props) {
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

  const openGuide = useCallback(
    (id: SensoraGuideId) => {
      setActiveGuideId(id);
      setGuideModalOpen(true);
      goSlide(2);
    },
    [goSlide],
  );

  const handleGoToRelated = useCallback(
    (section: CrmSection) => {
      setGuideModalOpen(false);
      onEnterWorkspaceSection(section);
    },
    [onEnterWorkspaceSection],
  );

  /** 가이드 슬라이드(3번째): 키보드로 다음/이전 화면과 겹치지 않게 에스케이프만 모달 닫기는 모달 쪽 처리 */
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
        {/* 슬라이드 패널 — 전환만으로 이동(페이지 세로 롤링 대신 한 뷰포트 안) */}
        <div className="relative min-h-0 flex-1 overflow-hidden px-4 pt-3 sm:px-6 sm:pt-4">
          {/* 0 — 홈 (guide-03 톤 · 앱 첫 화면 인상) */}
          <div
            className={[
              "sensora-landing-slide-panel absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto overflow-x-hidden pb-2 sm:inset-x-6",
              safeSlide === 0 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 0}
          >
            <div className="mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/85">{t("landing.showroom.hero.kickerBadge")}</p>
              <h1 className="mt-2 max-w-[22ch] text-pretty text-[clamp(1.35rem,calc(0.55rem+3.2vw),2.05rem)] font-semibold leading-[1.18] tracking-[-0.03em] text-white [word-break:keep-all]">
                {t("product.name")}
              </h1>
              <p className="mt-2 max-w-[28ch] text-[0.91rem] font-semibold leading-snug text-slate-200/95 sm:text-[0.98rem]">
                {t("landing.showroom.hero.headlineLine1")}
                <span className="mt-0.5 block text-sky-100/95">{t("landing.showroom.hero.headlineLine2")}</span>
              </p>
              <p className="mt-3 max-w-[36ch] text-[0.875rem] font-medium leading-[1.55] text-slate-300/95 sm:mt-4 sm:text-[0.915rem]">
                {t("landing.showroom.hero.sub")}
              </p>
              <p className="mt-2 max-w-[36ch] text-[0.8125rem] font-medium leading-[1.5] text-sky-200/88 sm:text-[0.8625rem]">{t("landing.showroom.hero.trustLine")}</p>

              <div className="mt-5 flex w-full max-w-md flex-col items-center justify-center gap-2 sm:mt-6 sm:max-w-lg sm:flex-row sm:flex-wrap sm:gap-3">
                <Link href={JOIN_PATH} prefetch={false} className={`${primaryBtn} sm:min-w-[10.5rem]`}>
                  {t("cta.joinBeta")}
                </Link>
                <button type="button" onClick={() => goSlide(2)} className={`${ghostBtn} sm:min-w-[10.5rem]`}>
                  <IconPlay className="size-[1.1rem] shrink-0 opacity-95" />
                  {t("cta.tryAppExperience")}
                </button>
              </div>
              <div className="mt-2.5 flex w-full justify-center sm:mt-3">
                <Link href="/register" prefetch={false} className={tertiaryLink}>
                  {t("auth.salesRegistration")}
                </Link>
              </div>

              <div className="relative mt-5 w-full max-w-[min(100%,380px)] sm:mt-6 sm:max-w-[420px]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-3 rounded-[28px] bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,rgba(56,189,248,0.16),transparent_62%)] opacity-90 blur-2xl"
                />
                <div className="relative overflow-hidden rounded-[18px] border border-white/[0.18] bg-[#030a14]/95 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-sky-400/15 sm:rounded-[22px]">
                  <div className="flex items-center gap-2 border-b border-white/[0.1] bg-[#050f1c]/95 px-3 py-2">
                    <span className="size-2 rounded-full bg-rose-400/55" aria-hidden />
                    <span className="size-2 rounded-full bg-amber-400/45" aria-hidden />
                    <span className="size-2 rounded-full bg-emerald-400/45" aria-hidden />
                    <span className="ml-2 truncate text-[11px] font-semibold text-slate-400">{t("product.name")}</span>
                    <span className="ml-auto rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-100/92">
                      {t("landing.showroom.heroMock.previewBadge")}
                    </span>
                  </div>
                  <div className="relative aspect-[4/5] w-full bg-[#020617]">
                    <Image src={GUIDE03} alt="" fill className="object-cover object-top opacity-[0.98]" sizes="(max-width:640px) 92vw, 420px" quality={100} priority />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/72 via-transparent to-transparent" aria-hidden />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => goSlide(1)}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:border-sky-400/34 hover:bg-white/[0.1] touch-manipulation sm:mt-5"
              >
                {t("landing.slides.home.nextCta")}
              </button>
            </div>
          </div>

          {/* 1 — 업무 메뉴 */}
          <div
            className={[
              "sensora-landing-slide-panel absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 1 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 1}
          >
            <div className="mx-auto flex w-full max-w-[640px] flex-col">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/85">{t("landing.slides.menu.kicker")}</p>
              <h2 className="mt-2 text-center text-[clamp(1.15rem,calc(0.85rem+1.8vw),1.55rem)] font-semibold tracking-[-0.028em] text-slate-50">{t("landing.showroom.serviceMenu.sectionTitle")}</h2>
              <p className="mx-auto mt-2 max-w-[40ch] text-center text-[0.8375rem] leading-relaxed text-slate-400">{t("landing.showroom.serviceMenu.sectionSub")}</p>
              <div className="mt-5 grid gap-3 sm:mt-6">
                {MENU_ROW.map((row) => (
                  <button
                    key={row.guideId}
                    type="button"
                    onClick={() => openGuide(row.guideId)}
                    className="landing-slide-menu-row group flex min-h-[4.75rem] w-full items-center gap-3 rounded-[17px] border border-white/[0.14] bg-gradient-to-r from-[#0a1728]/92 to-[#030a14]/95 px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_40px_-22px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-sky-400/12 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-sky-400/38 active:translate-y-0 touch-manipulation sm:gap-4 sm:px-4 sm:py-4"
                  >
                    <div className="relative h-[3.375rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-white/[0.1] bg-[#030712] sm:h-16 sm:w-24">
                      <Image src={SENSORA_GUIDES.find((g) => g.id === row.guideId)?.image ?? GUIDE03} alt="" fill className="object-cover object-center opacity-93" sizes="96px" quality={92} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[1.02rem] font-semibold text-slate-50 sm:text-[1.06rem]">{t(row.titleKey)}</p>
                      <p className="mt-0.5 line-clamp-2 text-[0.8rem] leading-relaxed text-slate-400 sm:text-[0.8375rem]">{t(row.descKey)}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-sky-100/92 sm:text-[11px]">{t("landing.showroom.serviceMenu.tapHint")}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button type="button" onClick={() => goSlide(2)} className="min-h-11 rounded-full border border-white/[0.14] bg-white/[0.05] px-7 py-2.5 text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:border-sky-400/28 hover:bg-white/[0.09] touch-manipulation">
                  {t("landing.slides.menu.nextCta")}
                </button>
                <button type="button" onClick={() => goSlide(0)} className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline">
                  {t("landing.slides.nav.prev")}
                </button>
              </div>
            </div>
          </div>

          {/* 2 — 화면 안내 / 가이드 */}
          <div
            className={[
              "sensora-landing-slide-panel absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 2 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 2}
          >
            <div className="mx-auto flex w-full max-w-[760px] flex-col pb-4">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/85">{t("landing.slides.guide.kicker")}</p>
              <h2 className="mt-2 text-center text-[clamp(1.1rem,calc(0.82rem+1.7vw),1.45rem)] font-semibold tracking-[-0.024em] text-slate-50">{t("landing.slides.guide.title")}</h2>
              <p className="mx-auto mt-2 max-w-[44ch] text-center text-[0.8375rem] leading-relaxed text-slate-400">{t("landing.slides.guide.lead")}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                {SENSORA_GUIDES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveGuideId(g.id);
                      setGuideModalOpen(true);
                    }}
                    className="group flex flex-col overflow-hidden rounded-[14px] border border-white/[0.15] bg-[#07111f]/92 ring-1 ring-inset ring-sky-400/10 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-sky-400/35 touch-manipulation"
                  >
                    <div className="relative aspect-[5/6] w-full bg-[#020617]">
                      <Image src={g.image} alt="" fill className="object-cover object-top opacity-[0.92] transition group-hover:opacity-100" sizes="(max-width:640px) 44vw, 140px" quality={94} />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/80 to-transparent" aria-hidden />
                    </div>
                    <div className="px-2 py-2 text-left">
                      <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-100 sm:text-[12px]">{t(g.titleKey)}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-sky-400/82">{t("landing.slides.guide.thumbHint")}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mx-auto mt-4 max-w-[44ch] text-center text-[11px] leading-relaxed text-slate-600">{t("preview.toc.disclaimer1")}</p>
              <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={() => goSlide(3)} className="sensora-premium-primary-workspace rounded-xl px-6 py-3 text-sm font-semibold touch-manipulation">
                  {t("landing.slides.nav.next")}
                </button>
                <button type="button" onClick={() => goSlide(1)} className="text-sm font-semibold text-slate-500 hover:text-slate-300">
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
            <div className="mx-auto flex w-full max-w-[520px] flex-col items-center text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-400/85">{t("landing.slides.actions.kicker")}</p>
              <h2 className="mt-3 max-w-[20ch] text-[clamp(1.12rem,calc(0.92rem+1.6vw),1.6rem)] font-semibold leading-snug tracking-[-0.024em] text-slate-50">{t("landing.showroom.closing.title")}</h2>
              <p className="mt-3 max-w-[40ch] text-[0.85rem] leading-relaxed text-slate-400">{t("landing.showroom.closing.desc")}</p>
              <div className="mt-7 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                <Link href={JOIN_PATH} prefetch={false} className={`${primaryBtn} sm:max-w-[14rem]`}>
                  {t("cta.joinBeta")}
                </Link>
                <Link href="/register" prefetch={false} className={`${ghostBtn} border-violet-300/28 sm:max-w-[14rem]`}>
                  {t("auth.salesRegistration")}
                </Link>
              </div>
              <div className="mt-6 flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
                <button type="button" onClick={() => goSlide(2)} className="text-sm font-semibold text-sky-300/95 underline-offset-4 hover:underline">
                  {t("landing.slides.actions.backToGuide")}
                </button>
                <button type="button" onClick={onOpenAppWorkspace} className="text-sm font-semibold text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline">
                  {t("landing.slides.actions.openWorkspace")}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 하단 독: 점 + 이전/다음 */}
        <nav
          className={`landing-slide-nav-dock relative z-[5] shrink-0 border-t border-white/[0.09] bg-[#020817]/94 backdrop-blur-md ${dockSafe}`}
          aria-label={t("landing.slides.dotNav")}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-3 sm:px-4">
            <button
              type="button"
              disabled={safeSlide <= 0}
              onClick={() => goSlide(safeSlide - 1)}
              className="min-h-10 min-w-[4.25rem] rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation sm:text-sm"
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
                    safeSlide === i ? "scale-110 bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.55)]" : "bg-slate-600/75 hover:bg-slate-500",
                  ].join(" ")}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={safeSlide >= SLIDE_COUNT - 1}
              onClick={() => goSlide(safeSlide + 1)}
              className="min-h-10 min-w-[4.25rem] rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation sm:text-sm"
            >
              {t("landing.slides.nav.next")}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
