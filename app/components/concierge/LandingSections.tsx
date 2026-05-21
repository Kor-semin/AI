"use client";

import Link from "next/link";

import { LandingAiAssistantDemo } from "@/app/components/concierge/LandingAiAssistantDemo";
import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { useAuth } from "@/app/crm/useAuth";
import type { TranslationKey } from "@/lib/i18n";

/** 모바일 랜딩에서 워크스페이스로 보낼 대상(CRM 섹션 또는 출고 페이지). */
export type MobileLandingWorkspaceTarget = CrmSection | "delivery";

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

const entPrimaryBtn =
  "landing-enterprise-btn-primary inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-2.5 text-[0.8625rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9375rem] lg:min-h-[3.125rem] lg:text-[1rem]";

const entSecondaryBtn =
  "landing-enterprise-btn-secondary inline-flex shrink-0 items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.05] px-6 py-2.5 text-[0.8625rem] font-semibold text-slate-100/95 backdrop-blur-sm transition hover:border-sky-400/28 hover:bg-white/[0.08] touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9375rem] lg:min-h-[3.125rem] lg:text-[1rem]";

const PROBLEM_KEYS = [
  "landing.problems.item1",
  "landing.problems.item2",
  "landing.problems.item3",
  "landing.problems.item4",
  "landing.problems.item5",
] as const;

const SOLUTION_POINT_KEYS = [
  "landing.solution.point1",
  "landing.solution.point2",
  "landing.solution.point3",
  "landing.solution.point4",
] as const;

const FLOW_STEP_KEYS = [
  "landing.flow.step1",
  "landing.flow.step2",
  "landing.flow.step3",
  "landing.flow.step4",
  "landing.flow.step5",
] as const;

const TRUST_POINT_KEYS = [
  "landing.trust.point1",
  "landing.trust.point2",
  "landing.trust.point3",
  "landing.trust.point4",
  "landing.trust.point5",
] as const;

const LANDING_SECTION_NAV_LINKS: ReadonlyArray<{ id: string; labelKey: TranslationKey }> = [
  { id: "sensora-landing-problem", labelKey: "landing.nav.problem" },
  { id: "sensora-landing-solution", labelKey: "landing.nav.solution" },
  { id: "sensora-landing-features", labelKey: "landing.nav.features" },
  { id: "sensora-landing-flow", labelKey: "landing.nav.flow" },
  { id: "sensora-landing-trust", labelKey: "landing.nav.trust" },
];

const LANDING_FEATURE_DEFS: ReadonlyArray<{
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: MobileWorkCardDef["icon"];
}> = [
  { titleKey: "landing.features.f1.title", descKey: "landing.features.f1.desc", icon: "memo" },
  { titleKey: "landing.features.f2.title", descKey: "landing.features.f2.desc", icon: "ai" },
  { titleKey: "landing.features.f3.title", descKey: "landing.features.f3.desc", icon: "followup" },
  { titleKey: "landing.features.f4.title", descKey: "landing.features.f4.desc", icon: "customers" },
  { titleKey: "landing.features.f5.title", descKey: "landing.features.f5.desc", icon: "customers" },
  { titleKey: "landing.features.f6.title", descKey: "landing.features.f6.desc", icon: "followup" },
  { titleKey: "landing.features.f7.title", descKey: "landing.features.f7.desc", icon: "customers" },
];

function LandingSectionNav({
  t,
  onOpenAppWorkspace,
}: {
  t: (key: TranslationKey) => string;
  onOpenAppWorkspace: () => void;
}) {
  const { auth, signOut } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      id="sensora-landing-nav"
      className="landing-section-nav relative z-[2] hidden w-full lg:block"
      aria-label={t("landing.nav.brandTagline")}
    >
      <div className="landing-section-nav-inner landing-section-container mx-auto flex w-full items-center justify-between gap-4">
        <div className="landing-section-nav-brand min-w-0 shrink-0">
          <p className="text-[0.9375rem] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[1rem]">
            {t("product.name")}
          </p>
          <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-400 [word-break:keep-all] sm:text-[12px]">
            {t("landing.nav.brandTagline")}
          </p>
        </div>

        <ul className="landing-section-nav-menu hidden min-w-0 flex-1 list-none flex-wrap items-center justify-center gap-x-1 gap-y-1 px-2 lg:flex lg:gap-x-1.5">
          {LANDING_SECTION_NAV_LINKS.map(({ id, labelKey }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => scrollToSection(id)}
                className="landing-section-nav-link min-h-[36px] rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100 touch-manipulation sm:px-3 sm:text-[13px]"
              >
                {t(labelKey)}
              </button>
            </li>
          ))}
        </ul>

        <div className="landing-section-nav-actions flex shrink-0 flex-wrap items-center justify-end gap-2">
          <div className="hidden shrink-0 lg:block [&_select]:h-8 [&_select]:max-w-[5.75rem]">
            <LanguageSelect dense />
          </div>
          {auth.status === "signed-in" ? (
            <>
              <Link
                href="/?view=app"
                prefetch={false}
                className="landing-enterprise-btn-secondary hidden min-h-[40px] items-center justify-center rounded-lg px-3 py-2 text-[12px] font-semibold touch-manipulation lg:inline-flex lg:text-[13px]"
              >
                {t("header.workspace")}
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="hidden min-h-[40px] items-center justify-center rounded-lg px-2.5 py-2 text-[12px] font-semibold text-slate-400 transition hover:text-slate-200 touch-manipulation lg:inline-flex"
              >
                {t("auth.signOut")}
              </button>
            </>
          ) : auth.status !== "loading" ? (
            <Link
              href="/login"
              prefetch={false}
              className="hidden min-h-[40px] items-center justify-center rounded-lg px-3 py-2 text-[12px] font-semibold text-slate-300 transition hover:text-white touch-manipulation lg:inline-flex"
            >
              로그인
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onOpenAppWorkspace}
            className="landing-enterprise-btn-secondary inline-flex min-h-[40px] items-center justify-center rounded-lg px-3 py-2 text-[12px] font-semibold touch-manipulation sm:text-[13px]"
          >
            {t("landing.hero.ctaPreview")}
          </button>
          <Link
            href={JOIN_PATH}
            prefetch={false}
            className="landing-enterprise-btn-primary inline-flex min-h-[40px] items-center justify-center rounded-lg px-3.5 py-2 text-[12px] font-semibold touch-manipulation sm:px-4 sm:text-[13px]"
          >
            {t("cta.joinBeta")}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function LandingFirstScreenIntro({
  t,
  onOpenAppWorkspace,
  layout,
}: {
  t: (key: TranslationKey) => string;
  onOpenAppWorkspace: () => void;
  layout: "desktop" | "mobile";
}) {
  const isDesktop = layout === "desktop";
  return (
    <div
      className={[
        "landing-first-screen-copy",
        isDesktop ? "landing-first-screen-copy--desktop" : "landing-first-screen-copy--mobile text-center",
      ].join(" ")}
    >
      <h1
        className={[
          "landing-warm-hero-title font-semibold tracking-[-0.034em] text-slate-50 [word-break:keep-all]",
          isDesktop
            ? "text-[clamp(1.65rem,calc(1rem+2.4vw),2.65rem)] leading-[1.1]"
            : "text-[1.125rem] leading-[1.2] sm:text-[1.2rem]",
        ].join(" ")}
      >
        {isDesktop ? (
          <>
            <span className="block">{t("landing.showroom.hero.headlineLine1")}</span>
            <span className="landing-warm-hero-accent mt-1 block">{t("landing.showroom.hero.headlineLine2")}</span>
          </>
        ) : (
          t("landing.mobileHome.subline")
        )}
      </h1>
      <p
        className={[
          "whitespace-pre-line leading-relaxed text-slate-300/92 [word-break:keep-all]",
          isDesktop ? "mt-4 max-w-[40ch] text-[0.98rem] sm:text-[1.05rem]" : "mt-3 max-w-[28ch] text-[0.8125rem] sm:max-w-[30ch] sm:text-[0.875rem]",
        ].join(" ")}
      >
        {t("landing.showroom.hero.sub")}
      </p>
      <p
        className={[
          "whitespace-pre-line leading-relaxed text-slate-400/95 [word-break:keep-all]",
          isDesktop ? "mt-4 max-w-[48ch] text-[0.9rem] sm:text-[0.9375rem]" : "mt-3 max-w-[30ch] text-[0.8125rem] sm:max-w-[32ch] sm:text-[0.875rem]",
        ].join(" ")}
      >
        {t("landing.firstScreen.body")}
      </p>
      <p
        className={[
          "whitespace-pre-line leading-relaxed text-slate-500 [word-break:keep-all]",
          isDesktop ? "mt-3 max-w-[42ch] text-[0.8125rem] sm:text-[0.875rem]" : "mt-3 max-w-[28ch] text-[12px] sm:max-w-[32ch]",
        ].join(" ")}
      >
        {t("landing.showroom.hero.trustLine")}
      </p>
      <LandingCtaPair
        onOpenAppWorkspace={onOpenAppWorkspace}
        joinLabel={t("cta.joinBeta")}
        previewLabel={t("landing.hero.ctaPreview")}
        className={isDesktop ? "mt-7 justify-center" : "mt-5 w-full flex-col [&_a]:w-full [&_button]:w-full"}
      />
      <p
        className={[
          "whitespace-pre-line leading-relaxed text-slate-500 [word-break:keep-all]",
          isDesktop ? "mx-auto mt-4 max-w-[44ch] text-center text-[0.75rem] sm:text-[0.8125rem]" : "mt-3 text-center text-[11px] leading-relaxed sm:text-[12px]",
        ].join(" ")}
      >
        {t("landing.firstScreen.trustMicro")}
      </p>
    </div>
  );
}

function LandingCtaPair({
  onOpenAppWorkspace,
  joinLabel,
  previewLabel,
  className = "",
}: {
  onOpenAppWorkspace: () => void;
  joinLabel: string;
  previewLabel: string;
  className?: string;
}) {
  return (
    <div className={["landing-cta-pair flex flex-wrap items-center gap-2.5 sm:gap-3", className].join(" ")} role="group">
      <Link href={JOIN_PATH} prefetch={false} className={`${entPrimaryBtn} min-w-[10.5rem] justify-center`}>
        {joinLabel}
      </Link>
      <button type="button" onClick={onOpenAppWorkspace} className={`${entSecondaryBtn} min-w-[10.5rem] justify-center gap-1.5`}>
        <svg className="size-[0.95rem] shrink-0 opacity-88" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M6.75 11.08V9.92c0-.6.323-1.15.839-1.424l5.62-3.068a1.583 1.583 0 012.541 1.424v8.088a1.584 1.584 0 01-2.541 1.424l-5.62-3.069a1.583 1.583 0 01-.839-1.423z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
        {previewLabel}
      </button>
    </div>
  );
}

type MobileWorkCardDef = {
  key: string;
  workspace: MobileLandingWorkspaceTarget;
  title: string;
  desc: string;
  icon: "customers" | "memo" | "followup" | "delivery" | "ai";
};

const MOBILE_WORK_CARDS: MobileWorkCardDef[] = [
  {
    key: "customers",
    workspace: "customers",
    title: "고객관리",
    desc: "고객별 상담 내용과 관심 차량을 정리합니다.",
    icon: "customers",
  },
  {
    key: "consulting",
    workspace: "consulting",
    title: "상담 메모",
    desc: "상담 중 남긴 내용을 다시 확인합니다.",
    icon: "memo",
  },
  {
    key: "followup",
    workspace: "followup",
    title: "사후관리",
    desc: "다음 연락과 출고 전 안내를 놓치지 않게 돕습니다.",
    icon: "followup",
  },
  {
    key: "delivery",
    workspace: "delivery",
    title: "출고 안내",
    desc: "반복되는 안내 문구를 더 정확하게 준비합니다.",
    icon: "delivery",
  },
  {
    key: "ai",
    workspace: "ai",
    title: "AI 비서",
    desc: "상담 내용을 바탕으로 검토용 초안을 제안합니다.",
    icon: "ai",
  },
];

function CardGlyph({ icon }: { icon: MobileWorkCardDef["icon"] }) {
  const common = "size-[18px] shrink-0 text-slate-50/95";
  switch (icon) {
    case "customers":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "memo":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 4h10a2 2 0 012 2v14l-4-3H7a2 2 0 01-2-2V6a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 9h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "followup":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 4h10v4H7V4zm0 6h10v10a2 2 0 01-2 2H9a2 2 0 01-2-2V10z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 14h4M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "delivery":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 16h2l1-5h9v5h2M6 16v2m10-2v2M9 11l2-4h6v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ai":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9.5 4.5 6 12l3.5 2.5L16 20l3.5-7.5L16 10 9.5 4.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M6 12h7M12.5 7.5 16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function cardIconGradient(icon: MobileWorkCardDef["icon"]) {
  switch (icon) {
    case "customers":
      return "from-sky-500/38 to-cyan-600/22";
    case "memo":
      return "from-violet-500/38 to-fuchsia-600/24";
    case "followup":
      return "from-emerald-500/35 to-teal-600/22";
    case "delivery":
      return "from-amber-500/38 to-orange-600/22";
    case "ai":
      return "from-indigo-500/40 to-violet-600/26";
    default:
      return "from-slate-500/35 to-slate-700/22";
  }
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7.65 14.42 12.41 10 7.65 5.58" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  onOpenAppWorkspace: () => void;
  onMobileOpenWorkspace: (target: MobileLandingWorkspaceTarget) => void;
  mobileLandingBrowseOpen: boolean;
  onMobileLandingBrowseOpen: () => void;
  onMobileStartCustomerCare: () => void;
  onMobileStartQuickAi: () => void;
  onMobileViewCustomers: () => void;
};

export function LandingShowroom({
  onOpenAppWorkspace,
  onMobileOpenWorkspace,
  mobileLandingBrowseOpen,
  onMobileLandingBrowseOpen,
  onMobileStartCustomerCare,
  onMobileStartQuickAi,
  onMobileViewCustomers,
}: Props) {
  const { t } = useLanguage();

  const sectionShell = "landing-section-shell relative z-[1] w-full";
  const landingSectionContainer = "landing-section-container mx-auto w-full";

  const featureCards = MOBILE_WORK_CARDS;

  return (
    <div
      id="sensora-landing-scroll"
      className={[
        "landing-page-shell sensora-landing-scroll sensora-landing-warm relative flex min-h-0 w-full max-w-full flex-1 flex-col items-stretch overflow-y-auto overflow-x-hidden bg-[#020817]",
        mobileLandingBrowseOpen ? "max-lg:scroll-pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]" : "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="sensora-landing-warm-backdrop pointer-events-none fixed inset-0"
      />

      <LandingSectionNav t={t} onOpenAppWorkspace={onOpenAppWorkspace} />

      {/* 모바일: 시작 화면(로그인·둘러보기)과 업무 메뉴(둘러보기 진입 후) 분리 */}
      <div id="sensora-landing-mobile-root" className="relative z-[1] lg:hidden">
        {!mobileLandingBrowseOpen ? (
          <div
            className={`${sectionShell} landing-mobile-start pb-8 pt-[max(14px,calc(env(safe-area-inset-top,0px)+12px))]`}
          >
            <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
              <header className="landing-mobile-start-brand flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <SensoraAnimatedMark
                      size={40}
                      animated={false}
                      className="pointer-events-none shrink-0 drop-shadow-[0_0_18px_-4px_rgba(56,189,248,0.38)]"
                      aria-hidden
                    />
                    <div className="min-w-0 pt-0.5">
                      <p className="text-balance text-[1rem] font-semibold leading-tight tracking-[-0.024em] text-white">
                        {t("product.name")}
                      </p>
                      <p className="mt-1.5 text-[12px] font-medium leading-snug text-slate-400 [word-break:keep-all]">
                        {t("landing.mobileStart.topTagline")}
                      </p>
                    </div>
                  </div>
                  <div className="landing-mobile-start-lang shrink-0 [&_select]:h-8 [&_select]:max-w-[5.75rem] [&_select]:px-2 [&_select]:py-1.5 [&_select]:text-[11px]">
                    <LanguageSelect dense />
                  </div>
                </div>
              </header>

              <LandingFirstScreenIntro t={t} onOpenAppWorkspace={onOpenAppWorkspace} layout="mobile" />

              <LandingAiAssistantDemo />

              <div className="landing-mobile-cta-secondary flex flex-wrap items-center justify-center border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={onMobileLandingBrowseOpen}
                  className="min-h-10 px-1 text-[13px] font-semibold text-sky-300/88 underline decoration-sky-400/35 underline-offset-[5px] transition hover:text-sky-200/95 touch-manipulation"
                >
                  {t("cta.tryAppExperience")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${sectionShell} pt-2 pb-1.5`}>
            <div className="mx-auto flex w-full max-w-lg flex-col gap-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">업무로 바로가기</p>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {featureCards.map((c) => {
                    const grad = cardIconGradient(c.icon);
                    const inner = (
                      <>
                        <div className="mb-1.5 flex items-start gap-2">
                          <span
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${grad} text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/[0.12]`}
                            aria-hidden
                          >
                            <CardGlyph icon={c.icon} />
                          </span>
                          <span className="min-w-0 flex-1 pt-0.5 text-[0.8125rem] font-semibold leading-snug text-slate-50 [word-break:keep-all]">{c.title}</span>
                        </div>
                        <p className="line-clamp-3 text-[11px] leading-snug text-slate-500 [word-break:keep-all]">{c.desc}</p>
                        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-200/90">
                          바로 가기
                          <IconChevronRight className="size-3 opacity-90" />
                        </span>
                      </>
                    );
                    const cardClass =
                      "flex flex-col rounded-2xl border border-white/[0.1] bg-[#050f1a]/78 p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition active:scale-[0.99] touch-manipulation min-h-[7.75rem]";
                    return (
                      <button key={c.key} type="button" className={cardClass} onClick={() => onMobileOpenWorkspace(c.workspace)}>
                        {inner}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div id="sensora-landing-quick" className="rounded-2xl border border-white/[0.08] bg-[#030b14]/85 p-3.5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">빠른 확인</p>
                <p className="mt-1 text-[10px] text-slate-600">항목을 누르면 해당 업무 화면으로 바로 이동합니다.</p>
                <ul className="mt-3 divide-y divide-white/[0.06]">
                  {[
                    {
                      k: "today",
                      label: "오늘 할 일",
                      sub: "연락과 일정을 한눈에 확인합니다.",
                      on: () => onMobileOpenWorkspace("followup"),
                    },
                    {
                      k: "next",
                      label: "다음 연락 예정",
                      sub: "놓치기 쉬운 고객 연락을 정리합니다.",
                      on: () => onMobileOpenWorkspace("followup"),
                    },
                    {
                      k: "memo",
                      label: "최근 상담 메모",
                      sub: "최근 남긴 상담 내용을 다시 확인합니다.",
                      on: () => onMobileOpenWorkspace("consulting"),
                    },
                    {
                      k: "del",
                      label: "출고 안내 준비",
                      sub: "반복되는 안내 문구를 미리 준비합니다.",
                      on: () => onMobileOpenWorkspace("delivery"),
                    },
                  ].map((row) => (
                    <li key={row.k}>
                      <button
                        type="button"
                        onClick={row.on}
                        className="flex w-full items-center justify-between gap-2 py-2.5 text-left transition hover:bg-white/[0.04] active:bg-white/[0.06] touch-manipulation"
                      >
                        <span className="min-w-0">
                          <span className="block text-[12px] font-semibold text-slate-200">{row.label}</span>
                          <span className="mt-0.5 block text-[10px] leading-snug text-slate-500 [word-break:keep-all]">{row.sub}</span>
                        </span>
                        <IconChevronRight className="size-4 shrink-0 text-slate-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 데스크톱 Hero — 핵심 가치·CTA 후 AI 비서 사용 예시 데모 */}
      <section
        id="sensora-landing-hero"
        className={`landing-hero-section landing-hero-section--showcase ${sectionShell} hidden pb-8 pt-6 lg:block lg:pb-14 lg:pt-12`}
      >
        <div className={landingSectionContainer}>
          <LandingFirstScreenIntro t={t} onOpenAppWorkspace={onOpenAppWorkspace} layout="desktop" />
          <LandingAiAssistantDemo />
        </div>
      </section>

      <div id="sensora-landing-mobile-more" className="max-lg:border-t max-lg:border-white/[0.08] lg:contents">
      <section
        id="sensora-landing-problem"
        className={`landing-story-anchor ${sectionShell} border-t border-white/[0.06] py-10 sm:py-14 max-lg:border-t-0`}
      >
        <div className={`${landingSectionContainer} landing-story-section`}>
          <h2 className="landing-story-title mx-auto max-w-[22ch] text-center [word-break:keep-all]">{t("landing.problems.title")}</h2>
          <ul className="landing-story-card-grid mt-8 sm:mt-10">
            {PROBLEM_KEYS.map((key, index) => (
              <li key={key} className="landing-story-card landing-story-card--problem">
                <span className="landing-story-card-index" aria-hidden>
                  {index + 1}
                </span>
                <p className="text-[0.875rem] font-medium leading-relaxed text-slate-200/92 [word-break:keep-all] sm:text-[0.9375rem]">
                  {t(key)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="sensora-landing-solution"
        className={`landing-story-anchor ${sectionShell} border-t border-white/[0.06] py-10 sm:py-14`}
      >
        <div className={`${landingSectionContainer} landing-section-container--mid landing-story-section`}>
          <h2 className="landing-story-title mx-auto max-w-[20ch] text-center [word-break:keep-all]">{t("landing.solution.title")}</h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-center text-[0.9rem] leading-relaxed text-slate-300/90 sm:text-[0.98rem] [word-break:keep-all]">
            {t("landing.solution.body")}
          </p>
          <ul className="mt-8 flex flex-col gap-3 sm:mt-9">
            {SOLUTION_POINT_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#050f1a]/55 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-200" aria-hidden>
                  ✓
                </span>
                <p className="text-[0.875rem] font-medium leading-relaxed text-slate-100/92 [word-break:keep-all] sm:text-[0.9375rem]">{t(key)}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-[40ch] whitespace-pre-line text-center text-[0.8125rem] leading-relaxed text-slate-400 [word-break:keep-all] sm:text-[0.875rem]">
            {t("landing.solution.aux")}
          </p>
        </div>
      </section>

      <section
        id="sensora-landing-features"
        className={`landing-story-anchor ${sectionShell} border-t border-white/[0.06] py-10 sm:py-14`}
      >
        <div className={`${landingSectionContainer} landing-story-section`}>
          <h2 className="landing-story-title mx-auto max-w-[18ch] text-center [word-break:keep-all]">{t("landing.features.title")}</h2>
          <ul className="landing-story-card-grid landing-story-card-grid--features mt-8 sm:mt-10">
            {LANDING_FEATURE_DEFS.map((feature) => {
              const grad = cardIconGradient(feature.icon);
              return (
                <li key={feature.titleKey} className="landing-story-card landing-story-card--feature">
                  <span
                    className={`mb-3 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${grad} ring-1 ring-white/[0.12]`}
                    aria-hidden
                  >
                    <CardGlyph icon={feature.icon} />
                  </span>
                  <h3 className="text-[0.9375rem] font-semibold text-slate-50 [word-break:keep-all]">{t(feature.titleKey)}</h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-slate-400 [word-break:keep-all] sm:text-[0.875rem]">
                    {t(feature.descKey)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="sensora-landing-flow"
        className={`landing-story-anchor ${sectionShell} border-t border-white/[0.06] py-10 sm:py-14`}
      >
        <div className={`${landingSectionContainer} landing-section-container--wide landing-story-section`}>
          <h2 className="landing-story-title mx-auto max-w-[20ch] text-center [word-break:keep-all]">{t("landing.flow.title")}</h2>
          <ol className="landing-flow-steps mt-8 sm:mt-10">
            {FLOW_STEP_KEYS.map((key, index) => (
              <li key={key} className="landing-flow-step">
                <span className="landing-flow-step-num" aria-hidden>
                  {index + 1}
                </span>
                <p className="text-[0.875rem] font-medium leading-relaxed text-slate-100/92 [word-break:keep-all] sm:text-[0.9375rem]">{t(key)}</p>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-8 max-w-[42ch] text-center text-[0.8125rem] leading-relaxed text-slate-400 [word-break:keep-all] sm:text-[0.875rem]">
            {t("landing.flow.footnote")}
          </p>
        </div>
      </section>

      <section
        id="sensora-landing-trust"
        className={`landing-story-anchor ${sectionShell} border-t border-white/[0.06] py-10 sm:py-14`}
      >
        <div className={`${landingSectionContainer} landing-section-container--narrow landing-story-section`}>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78 sm:text-[11px]">
            {t("landing.slides.philosophy.kicker")}
          </p>
          <h2 className="landing-story-title mx-auto mt-3 max-w-[20ch] text-center [word-break:keep-all]">{t("landing.trust.title")}</h2>
          <p className="mx-auto mt-5 text-center text-[0.9rem] leading-relaxed text-slate-300/90 sm:text-[0.98rem] [word-break:keep-all]">
            {t("landing.trust.body")}
          </p>
          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {TRUST_POINT_KEYS.map((key) => (
              <li
                key={key}
                className="rounded-xl border border-white/[0.08] bg-[#050f1a]/55 px-3.5 py-3 text-[0.8125rem] font-medium leading-snug text-slate-200/90 [word-break:keep-all] sm:text-[0.875rem]"
              >
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="sensora-landing-cta"
        className={[
          `landing-story-anchor ${sectionShell} border-t border-white/[0.06] py-9 sm:py-14 lg:pb-[max(3rem,calc(2.5rem+env(safe-area-inset-bottom,0px)))]`,
          mobileLandingBrowseOpen
            ? "max-lg:scroll-mb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] max-lg:pb-[max(9.5rem,calc(6.25rem+env(safe-area-inset-bottom,0px)))]"
            : "max-lg:pb-12",
        ].join(" ")}
      >
        <div className={`${landingSectionContainer} landing-section-container--cta`}>
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <h2 className="max-w-[28ch] text-[clamp(1.05rem,calc(0.78rem+1.6vw),1.55rem)] font-semibold leading-[1.35] tracking-[-0.028em] text-slate-50 [word-break:keep-all] sm:max-w-[32ch]">
              {t("landing.cta.title")}
            </h2>
            <LandingCtaPair
              onOpenAppWorkspace={onOpenAppWorkspace}
              joinLabel={t("cta.joinBeta")}
              previewLabel={t("landing.hero.ctaPreview")}
              className="mx-auto mt-7 justify-center sm:mt-9"
            />
            <a
              href="#sensora-landing-trust"
              className="mt-6 text-[12px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation sm:mt-8 sm:text-[13px]"
            >
              {t("landing.slides.actions.backToPhilosophy")}
            </a>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
