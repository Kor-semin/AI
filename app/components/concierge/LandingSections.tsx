"use client";

import Image from "next/image";
import Link from "next/link";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

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

const PHILOSOPHY_LINE_KEYS = [
  "landing.slides.philosophy.line1",
  "landing.slides.philosophy.line2",
  "landing.slides.philosophy.line3",
  "landing.slides.philosophy.line4",
] as const;

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
};

export function LandingShowroom({
  onOpenAppWorkspace,
  onMobileOpenWorkspace,
  mobileLandingBrowseOpen,
  onMobileLandingBrowseOpen,
  onMobileStartCustomerCare,
}: Props) {
  const { t } = useLanguage();

  const sectionShell = "relative z-[1] w-full px-4 sm:px-6";
  const innerMax = "mx-auto w-full max-w-[1440px]";

  const featureCards = MOBILE_WORK_CARDS;

  return (
    <div
      id="sensora-landing-scroll"
      className={[
        "sensora-landing-scroll relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#020817]",
        mobileLandingBrowseOpen ? "max-lg:scroll-pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]" : "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_82%_52%_at_52%_8%,rgba(56,189,248,0.1),transparent_55%),radial-gradient(ellipse_58%_42%_at_96%_18%,rgba(139,92,246,0.08),transparent_52%),linear-gradient(180deg,#050f1e_0%,#020817_45%,#030b16_100%)]"
      />

      {/* 모바일: 시작 화면(로그인·둘러보기)과 업무 메뉴(둘러보기 진입 후) 분리 */}
      <div id="sensora-landing-mobile-root" className="relative z-[1] lg:hidden">
        {!mobileLandingBrowseOpen ? (
          <div className={`${sectionShell} pb-3 pt-3`}>
            <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <SensoraAnimatedMark
                    size={36}
                    animated={false}
                    className="pointer-events-none shrink-0 drop-shadow-[0_0_16px_-4px_rgba(56,189,248,0.35)]"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="text-balance text-[0.94rem] font-semibold leading-tight tracking-[-0.02em] text-white">{t("product.name")}</div>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-slate-400 [word-break:keep-all]">{t("landing.mobileStart.topTagline")}</p>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 [&_select]:h-7 [&_select]:max-w-[5.5rem] [&_select]:px-1.5 [&_select]:py-1 [&_select]:text-[10px]">
                  <LanguageSelect dense />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.1] bg-[#050f1a]/75 px-3.5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
                <div className="flex flex-col items-center text-center">
                  <SensoraAnimatedMark size={40} animated={false} className="shrink-0 drop-shadow-[0_0_16px_-4px_rgba(56,189,248,0.35)]" aria-hidden />
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">{t("landing.mobileHome.mainTitle")}</p>
                  <p className="mt-1.5 text-[0.8125rem] font-semibold leading-snug tracking-tight text-slate-50 [word-break:keep-all]">{t("landing.mobileHome.subline")}</p>
                  <p className="mt-2 max-w-[28ch] whitespace-pre-line text-[11px] leading-relaxed text-slate-400 [word-break:keep-all]">{t("landing.mobileHome.blurb")}</p>
                </div>
                <div className="mt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onMobileStartCustomerCare}
                    className={`${entPrimaryBtn} w-full justify-center py-3 text-[0.8125rem]`}
                  >
                    {t("cta.startCustomerCare")}
                  </button>
                  <Link
                    href="/login"
                    prefetch={false}
                    className="landing-enterprise-btn-secondary inline-flex w-full min-h-[48px] items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.05] px-4 py-3 text-center text-[0.8125rem] font-semibold text-slate-100 transition hover:border-sky-400/28 hover:bg-white/[0.08] touch-manipulation"
                  >
                    {t("cta.emailLogin")}
                  </Link>
                  <Link
                    href={JOIN_PATH}
                    prefetch={false}
                    className="inline-flex w-full min-h-[48px] items-center justify-center rounded-xl border border-white/[0.1] bg-transparent px-4 py-3 text-center text-[0.8125rem] font-semibold text-slate-300 transition hover:border-white/[0.16] hover:bg-white/[0.04] touch-manipulation"
                  >
                    {t("cta.joinBeta")}
                  </Link>
                  <button
                    type="button"
                    onClick={onMobileLandingBrowseOpen}
                    className="mx-auto mt-0.5 min-h-10 px-2 text-[11px] font-semibold text-sky-300/90 underline decoration-sky-400/35 underline-offset-4 touch-manipulation"
                  >
                    {t("cta.tryAppExperience")}
                  </button>
                </div>
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

      {/* 데스크톱: 기존 히어로 가이드 이미지 */}
      <section id="sensora-landing-hero" className={`${sectionShell} hidden pb-6 pt-2 lg:block sm:pb-8 sm:pt-3 lg:pt-4`}>
        <div className={innerMax}>
          <div className="landing-guide03-hero-shell mx-auto flex w-full flex-col items-center justify-center">
            <div className="landing-guide03-hero-frame relative w-full max-w-[1440px] overflow-hidden">
              <Image
                src="/images/guides/sensora-guide-03.png"
                alt="Sensora Auto CRM 랜딩 첫 화면"
                width={1672}
                height={941}
                priority
                quality={100}
                className="landing-guide03-hero-image block h-auto w-full cursor-default select-none"
                sizes="(max-width: 1440px) 100vw, 1440px"
              />
              <div className="landing-guide03-hero-hotspots">
                <Link
                  href={JOIN_PATH}
                  prefetch={false}
                  aria-label="베타 신청하기"
                  className="landing-guide03-hero-hit absolute left-[5.5%] top-[56%] h-[6.5%] w-[13%]"
                />
                <button
                  type="button"
                  onClick={onOpenAppWorkspace}
                  aria-label="앱 화면 미리보기"
                  className="landing-guide03-hero-hit absolute left-[19.5%] top-[56%] h-[6.5%] w-[15.5%]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sensora-landing-philosophy" className={`${sectionShell} border-t border-white/[0.06] py-8 sm:py-12`}>
        <div className={`${innerMax} max-w-[560px] sm:max-w-[600px] lg:max-w-[640px]`}>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78 sm:text-[11px]">{t("landing.slides.philosophy.kicker")}</p>
          <h2 className="mx-auto mt-3 max-w-[18ch] text-center text-[clamp(1.22rem,calc(0.68rem+2.2vw),1.88rem)] font-semibold leading-[1.12] tracking-[-0.034em] text-slate-50 [word-break:keep-all] sm:mt-4 sm:max-w-[22ch]">
            {t("landing.slides.philosophy.title")}
          </h2>
          <ul className="mt-6 w-full sm:mt-8 max-lg:flex max-lg:flex-col max-lg:gap-2.5 lg:border-t lg:border-white/[0.08]">
            {PHILOSOPHY_LINE_KEYS.map((lineKey) => (
              <li
                key={lineKey}
                className="max-lg:rounded-xl max-lg:border max-lg:border-white/[0.08] max-lg:bg-[#050f1a]/55 max-lg:px-3.5 max-lg:py-3 max-lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:border-b lg:border-white/[0.08] lg:py-[1.1rem]"
              >
                <p className="border-l-[3px] border-sky-400/45 pl-3 text-left text-[0.875rem] font-medium leading-snug text-slate-200/93 max-lg:border-0 max-lg:pl-0 lg:pl-[1.125rem] lg:text-[0.9575rem] lg:leading-[1.42]">
                  {t(lineKey)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="sensora-landing-cta"
        className={[
          `${sectionShell} border-t border-white/[0.06] py-9 sm:py-14 lg:pb-[max(3rem,calc(2.5rem+env(safe-area-inset-bottom,0px)))]`,
          mobileLandingBrowseOpen
            ? "max-lg:scroll-mb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] max-lg:pb-[max(9.5rem,calc(6.25rem+env(safe-area-inset-bottom,0px)))]"
            : "max-lg:pb-12",
        ].join(" ")}
      >
        <div className={`${innerMax} max-w-[440px] sm:max-w-[460px]`}>
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <h2 className="max-w-[28ch] text-[clamp(1.05rem,calc(0.78rem+1.6vw),1.55rem)] font-semibold leading-[1.35] tracking-[-0.028em] text-slate-50 [word-break:keep-all] sm:max-w-[32ch]">
              자동차 영업 업무를 더 정확하게 정리하고 싶다면, 지금 시작하세요.
            </h2>
            <div className="landing-slide-actions-cta-cluster mx-auto mt-7 flex w-full max-w-[22rem] flex-col items-stretch gap-2.5 sm:mt-9 sm:max-w-[24rem]">
              <Link href={JOIN_PATH} prefetch={false} className={`${entPrimaryBtn} w-full justify-center`}>
                베타 신청하기
              </Link>
            </div>
            <a
              href="#sensora-landing-philosophy"
              className="mt-6 text-[12px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation sm:mt-8 sm:text-[13px]"
            >
              {t("landing.slides.actions.backToPhilosophy")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
