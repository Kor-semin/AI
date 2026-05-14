"use client";

import Image from "next/image";
import Link from "next/link";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { CRM_SECTION_LABELS, type CrmSection } from "@/app/crm/crmSectionTypes";
import type { TranslationKey } from "@/lib/i18n";

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

const entGhostBtn =
  "landing-enterprise-btn-secondary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[0.8375rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9625rem] lg:min-h-[3.125rem]";

const PHILOSOPHY_LINE_KEYS = [
  "landing.slides.philosophy.line1",
  "landing.slides.philosophy.line2",
  "landing.slides.philosophy.line3",
  "landing.slides.philosophy.line4",
] as const;

type MobileFeatureCard = {
  key: string;
  section?: CrmSection;
  href?: string;
  accent: string;
  title: string;
  desc: string;
};

function mobileFeatureCards(t: (k: TranslationKey) => string): MobileFeatureCard[] {
  return [
    {
      key: "customers",
      section: "customers",
      title: CRM_SECTION_LABELS.customers.title,
      desc: CRM_SECTION_LABELS.customers.subtitle,
      accent: "from-sky-500/25 to-cyan-500/10",
    },
    {
      key: "consulting",
      section: "consulting",
      title: CRM_SECTION_LABELS.consulting.title,
      desc: CRM_SECTION_LABELS.consulting.subtitle,
      accent: "from-violet-500/22 to-fuchsia-500/10",
    },
    {
      key: "followup",
      section: "followup",
      title: CRM_SECTION_LABELS.followup.title,
      desc: CRM_SECTION_LABELS.followup.subtitle,
      accent: "from-emerald-500/20 to-teal-500/10",
    },
    {
      key: "delivery",
      href: "/delivery",
      title: t("landing.showroom.serviceMenu.deliveryTitle"),
      desc: t("landing.showroom.serviceMenu.deliveryDesc"),
      accent: "from-amber-500/22 to-orange-500/10",
    },
    {
      key: "ai",
      section: "ai",
      title: CRM_SECTION_LABELS.ai.title,
      desc: CRM_SECTION_LABELS.ai.subtitle,
      accent: "from-indigo-500/25 to-violet-500/12",
    },
  ];
}

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

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7.65 14.42 12.41 10 7.65 5.58" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  onOpenAppWorkspace: () => void;
  onEnterWorkspaceSection: (section: CrmSection) => void;
};

export function LandingShowroom({ onOpenAppWorkspace, onEnterWorkspaceSection }: Props) {
  const { t } = useLanguage();

  const sectionShell = "relative z-[1] w-full px-4 sm:px-6";
  const innerMax = "mx-auto w-full max-w-[1440px]";

  const scrollToId = (id: string) => {
    if (typeof document === "undefined") return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const featureCards = mobileFeatureCards(t);

  return (
    <div
      id="sensora-landing-scroll"
      className="sensora-landing-scroll relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#020817]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_82%_52%_at_52%_8%,rgba(56,189,248,0.1),transparent_55%),radial-gradient(ellipse_58%_42%_at_96%_18%,rgba(139,92,246,0.08),transparent_52%),linear-gradient(180deg,#050f1e_0%,#020817_45%,#030b16_100%)]"
      />

      {/* 모바일: 앱형 홈(헤더 · 진입 카드 · 빠른 실행) */}
      <div id="sensora-landing-mobile-root" className="relative z-[1] lg:hidden">
        <div className={`${sectionShell} pt-3 pb-2`}>
          <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.1] bg-[#050f1a]/75 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
              <SensoraAnimatedMark size={40} animated={false} className="shrink-0 drop-shadow-[0_0_18px_-4px_rgba(56,189,248,0.35)]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-400/85">Sensora Auto CRM</p>
                <h2 className="mt-0.5 text-base font-semibold leading-snug tracking-tight text-slate-50">{t("product.name")}</h2>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-400 [word-break:keep-all]">
                  자동차 영업사원 전용 AI 고객관리 워크스페이스
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">업무로 바로가기</p>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                {featureCards.map((c) => {
                  const inner = (
                    <>
                      <div
                        className={`relative mb-2.5 h-10 w-full overflow-hidden rounded-lg bg-gradient-to-br ${c.accent} ring-1 ring-white/[0.08]`}
                        aria-hidden
                      />
                      <p className="line-clamp-2 text-[0.8125rem] font-semibold leading-tight text-slate-50">{c.title}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-500">{c.desc}</p>
                      <span className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-200/90">
                        열기
                        <IconChevronRight className="size-3 opacity-90" />
                      </span>
                    </>
                  );
                  const cardClass =
                    "flex flex-col rounded-2xl border border-white/[0.1] bg-[#050f1a]/78 p-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition active:scale-[0.99] touch-manipulation min-h-[7.5rem]";
                  if (c.href) {
                    return (
                      <Link key={c.key} href={c.href} prefetch={false} className={cardClass}>
                        {inner}
                      </Link>
                    );
                  }
                  if (c.section) {
                    return (
                      <button key={c.key} type="button" className={cardClass} onClick={() => onEnterWorkspaceSection(c.section!)}>
                        {inner}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            <div id="sensora-landing-quick" className="rounded-2xl border border-white/[0.08] bg-[#030b14]/85 p-3.5 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">빠른 확인</p>
              <p className="mt-1 text-[10px] text-slate-600">예시 화면 · 실제 일정은 워크스페이스에서 확인합니다</p>
              <ul className="mt-3 divide-y divide-white/[0.06]">
                {[
                  { k: "today", label: "오늘 할 일", sub: "연락·일정 한눈에", on: () => scrollToId("sensora-landing-cta") },
                  { k: "next", label: "다음 연락 예정", sub: "워크스페이스 캘린더", on: () => onEnterWorkspaceSection("customers") },
                  { k: "memo", label: "최근 상담 메모", sub: "상담 메모 화면", on: () => onEnterWorkspaceSection("consulting") },
                  { k: "ai", label: "AI 초안 보기", sub: "AI 비서", on: () => onEnterWorkspaceSection("ai") },
                  { k: "del", label: "출고 안내 준비", sub: "출고 체크리스트", on: () => scrollToId("sensora-landing-cta") },
                ].map((row) => (
                  <li key={row.k}>
                    <button
                      type="button"
                      onClick={row.on}
                      className="flex w-full items-center justify-between gap-2 py-2.5 text-left transition hover:bg-white/[0.04] active:bg-white/[0.06] touch-manipulation"
                    >
                      <span className="min-w-0">
                        <span className="block text-[12px] font-semibold text-slate-200">{row.label}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-500">{row.sub}</span>
                      </span>
                      <IconChevronRight className="size-4 shrink-0 text-slate-600" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크톱: 기존 히어로 가이드 이미지 */}
      <section id="sensora-landing-hero" className={`${sectionShell} hidden pb-6 pt-2 lg:block sm:pb-8 sm:pt-3 lg:pt-4`}>
        <div className={innerMax}>
          <div className="landing-guide03-hero-shell mx-auto flex w-full items-center justify-center">
            <div className="landing-guide03-hero-frame relative w-full max-w-[1440px] overflow-hidden">
              <Image
                src="/images/guides/sensora-guide-03.png"
                alt="Sensora Auto CRM 랜딩 첫 화면"
                width={1672}
                height={941}
                priority
                quality={100}
                className="landing-guide03-hero-image block h-auto w-full select-none"
                sizes="(max-width: 1440px) 100vw, 1440px"
              />

              <Link href="/?view=landing" prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--brand" aria-label="Sensora Auto CRM 랜딩으로 이동">
                <span className="sr-only">Sensora Auto CRM</span>
              </Link>
              <Link href={JOIN_PATH} prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--nav-join" aria-label={t("cta.joinBeta")}>
                <span className="sr-only">{t("cta.joinBeta")}</span>
              </Link>
              <button type="button" onClick={onOpenAppWorkspace} className="landing-guide03-hotspot landing-guide03-hotspot--nav-preview" aria-label={t("cta.tryAppExperience")}>
                <span className="sr-only">{t("cta.tryAppExperience")}</span>
              </button>
              <Link href="/register" prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--nav-register" aria-label={t("auth.salesRegistration")}>
                <span className="sr-only">{t("auth.salesRegistration")}</span>
              </Link>

              <Link href={JOIN_PATH} prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--hero-join" aria-label={t("cta.joinBeta")}>
                <span className="sr-only">{t("cta.joinBeta")}</span>
              </Link>
              <button type="button" onClick={onOpenAppWorkspace} className="landing-guide03-hotspot landing-guide03-hotspot--hero-preview" aria-label={t("cta.tryAppExperience")}>
                <span className="sr-only">{t("cta.tryAppExperience")}</span>
              </button>
              <Link href="/register" prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--hero-register" aria-label={t("auth.salesRegistration")}>
                <span className="sr-only">{t("auth.salesRegistration")}</span>
              </Link>
              <button type="button" onClick={onOpenAppWorkspace} className="landing-guide03-hotspot landing-guide03-hotspot--preview-panel" aria-label={t("cta.tryAppExperience")}>
                <span className="sr-only">{t("cta.tryAppExperience")}</span>
              </button>
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
          <div className="mt-6 flex justify-center sm:mt-8">
            <a href="#sensora-landing-cta" className={`${entPrimaryBtn} min-h-[2.875rem] px-7 text-center text-[0.8125rem] sm:min-h-[3rem] sm:px-8`}>
              {t("landing.slides.philosophy.nextCta")}
            </a>
          </div>
        </div>
      </section>

      <section
        id="sensora-landing-cta"
        className={`${sectionShell} border-t border-white/[0.06] py-9 sm:py-14 max-lg:pb-[max(5.5rem,calc(3.5rem+env(safe-area-inset-bottom,0px)))] sm:max-lg:pb-[max(6rem,calc(4rem+env(safe-area-inset-bottom,0px)))] lg:pb-[max(3rem,calc(2.5rem+env(safe-area-inset-bottom,0px)))]`}
      >
        <div className={`${innerMax} max-w-[440px] sm:max-w-[460px]`}>
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <h2 className="max-w-[24ch] text-[clamp(1.15rem,calc(0.8rem+1.75vw),1.6rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-slate-50 [word-break:keep-all] sm:max-w-[26ch]">
              {t("landing.slides.actions.closingHeadline")}
            </h2>
            <div className="landing-slide-actions-cta-cluster mx-auto mt-7 flex w-full max-w-[22rem] flex-col items-stretch gap-2.5 sm:mt-9 sm:max-w-[24rem]">
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
