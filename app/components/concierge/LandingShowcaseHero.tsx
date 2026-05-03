"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";

import { CRM_SECTION_LABELS, CRM_SECTION_MOBILE_SUBTITLE_KEYS, type CrmSection } from "@/app/crm/crmSectionTypes";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraGuideImageViewer } from "@/app/components/concierge/SensoraGuideImageViewer";
import { SENSORA_GUIDE_IMAGES, SENSORA_TIP_CARD_INITIAL_INDEX } from "@/app/components/concierge/sensoraGuideImages";

const JOIN_PATH = "/join" as const;

const HERO_MOCK_SIDEBAR: readonly CrmSection[] = ["dashboard", "customers", "ai", "followup"];

const mockShell =
  "landing-showcase-mock-frame relative overflow-hidden rounded-[20px] border border-white/[0.16] bg-gradient-to-b from-[#060f1c]/96 to-[#020b14]/98 shadow-[0_40px_100px_-32px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(56,189,248,0.04)_inset,0_0_80px_-28px_rgba(56,189,248,0.09),0_0_96px_-40px_rgba(139,92,246,0.06)] ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/22 before:to-transparent sm:rounded-[24px] lg:rounded-[26px]";

const ctaPrimaryShowcase =
  "landing-showcase-cta-primary landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-[52px] w-full min-w-0 shrink-0 items-center justify-center rounded-2xl px-8 py-3.5 text-[15px] font-semibold tracking-tight sm:w-auto sm:min-h-[54px] sm:px-9 sm:text-[16px] touch-manipulation";

const ctaGhostShowcase =
  "landing-showcase-cta-ghost landing-showroom-cta-preview inline-flex min-h-[52px] w-full min-w-0 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/[0.26] bg-white/[0.06] px-7 py-3.5 text-[15px] font-semibold tracking-tight text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-inset ring-white/[0.08] backdrop-blur-md sm:w-auto sm:min-h-[54px] sm:px-8 touch-manipulation";

function IconAppWindowPlay({ className }: { className?: string }) {
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

function IconTipStart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3L4 8v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V8l-8-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconTipGrid({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h7V4H4v3zm0 6h7v-3H4v3zm0 6h7v-3H4v3zm9-12h7V4h-7v3zm0 6h7v-3h-7v3zm0 6h7v-3h-7v3z"
        fill="currentColor"
        opacity=".9"
      />
    </svg>
  );
}

function IconTipFlow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 17h7M5 17l2.5 2M5 17l2.5-2M17 12h5M22 12l-2 2m2-2l-2-2M12 6h11M23 6l-2-2m2 2l-2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTipBeta({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 18h10M9 14h6M7 6h10v6H7V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8" cy="9" r=".9" fill="currentColor" />
    </svg>
  );
}

const GUIDE_VIEWER_IMAGES = SENSORA_GUIDE_IMAGES.map((s) => ({ src: s.src }));
const GUIDE_SLIDE_TITLE_KEYS = SENSORA_GUIDE_IMAGES.map((s) => s.titleKey);

function HeroDashboardPreview() {
  const { t } = useLanguage();

  const pair = useMemo(
    () => ({
      today: { titleKey: "landing.showroom.heroDash.todayTitle" as const, bodyKey: "landing.showroom.heroDash.todaySnippet" as const },
      priority: { titleKey: "landing.showroom.heroDash.priorityTitle" as const, bodyKey: "landing.showroom.heroDash.prioritySnippet" as const },
      followup: { titleKey: "landing.showroom.heroDash.followupTitle" as const, bodyKey: "landing.showroom.heroDash.followupSnippet" as const },
      ai: { titleKey: "landing.showroom.heroDash.aiDraftTitle" as const, bodyKey: "landing.showroom.heroDash.aiDraftSnippet" as const },
      summary: { titleKey: "landing.showroom.heroDash.summaryTitle" as const, bodyKey: "landing.showroom.heroDash.summarySnippet" as const },
    }),
    [],
  );

  return (
    <div className={`${mockShell} mx-auto w-full max-w-[calc(100vw-28px)] sm:max-w-[min(100%,34rem)] lg:mx-0 lg:max-w-none`}>
      {/* Window chrome */}
      <div className="relative border-b border-white/[0.12] bg-gradient-to-b from-[#0a1524]/98 to-[#060d18]/95 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-rose-400/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]" />
            <span className="size-2 rounded-full bg-amber-400/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]" />
            <span className="size-2 rounded-full bg-emerald-400/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-emerald-400/90 ring-2 ring-emerald-400/25 shadow-[0_0_12px_-2px_rgba(52,211,153,0.45)]" aria-hidden />
              <p className="truncate text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-200 sm:text-[12px]">
                {t("product.name")}
              </p>
            </div>
            <p className="truncate text-[10px] font-medium text-slate-500 sm:text-[12px]" title={t("landing.showroom.heroDash.windowSubline")}>
              {t("landing.showroom.heroDash.windowSubline")}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border border-white/[0.12] bg-white/[0.05] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
            preview
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-col sm:min-h-[300px] sm:flex-row md:min-h-[320px] lg:min-h-[340px]">
        {/* Nav rail */}
        <nav
          className="flex shrink-0 flex-row gap-0 overflow-x-auto overflow-y-hidden border-b border-white/[0.1] bg-[#020910]/98 [scrollbar-width:none] sm:w-[10.25rem] sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:border-white/[0.1] sm:py-1 sm:pl-0 sm:pr-0 [&::-webkit-scrollbar]:hidden"
          aria-label="워크스페이스 미리보기"
          aria-hidden
        >
          {HERO_MOCK_SIDEBAR.map((section) => {
            const active = section === "dashboard";
            const short = t(CRM_SECTION_MOBILE_SUBTITLE_KEYS[section]);
            const long = CRM_SECTION_LABELS[section].title;
            return (
              <div
                key={section}
                className={[
                  "flex min-w-[5.75rem] shrink-0 items-center gap-2.5 border-white/[0.06] px-3 py-2.5 sm:min-w-0 sm:flex-initial sm:border-b sm:border-l-[3px] sm:px-3 sm:py-2.5",
                  active
                    ? "border-b-2 border-b-sky-400/85 bg-gradient-to-t from-sky-500/[0.14] to-transparent sm:border-b-0 sm:border-l-sky-400 sm:bg-gradient-to-r sm:from-sky-500/[0.12] sm:to-transparent"
                    : "border-b-2 border-b-transparent sm:border-l-transparent sm:opacity-90",
                ].join(" ")}
              >
                <span
                  className={[
                    "size-1.5 shrink-0 rounded-full sm:size-2",
                    active ? "bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.55)]" : "bg-white/25",
                  ].join(" ")}
                />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[10px] font-bold text-slate-100 sm:text-[11px]">{long}</p>
                  <p className="mt-0.5 hidden truncate text-[9px] font-semibold text-slate-500 sm:block sm:text-[10px]">{short}</p>
                </div>
              </div>
            );
          })}
        </nav>

            <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-[#020817]/98 via-[#051018]/96 to-[#040a14]/95">
          {/* 인사 · 오늘 할 일 */}
          <div
            className="flex flex-col gap-3 border-b border-white/[0.08] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3"
            aria-hidden
          >
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-snug text-slate-100 sm:text-[13px]">{t("landing.showroom.heroDash.greetingLine")}</p>
              <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-slate-500 sm:text-[11.5px]">
                {t("landing.showroom.heroDash.greetingSub")}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-1.5 sm:gap-2">
              <span className="inline-flex min-h-[30px] items-center justify-center rounded-[10px] border border-white/[0.14] bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-sky-400/14 sm:text-[11px]">
                {t("landing.showroom.heroDash.detailCta")}
              </span>
              <span className="inline-flex min-h-[30px] items-center justify-center rounded-[10px] border border-white/[0.14] bg-gradient-to-b from-[#243044] to-[#101924] px-2.5 py-1 text-[10px] font-bold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] ring-1 ring-sky-400/22 sm:text-[11px]">
                {t("landing.showroom.heroDash.messageCta")}
              </span>
            </div>
          </div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.09] px-3 py-2.5 sm:gap-2.5 sm:px-4" aria-hidden>
            <div className="relative min-h-[36px] min-w-0 flex-1 rounded-[11px] border border-white/[0.12] bg-black/35 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span className="text-[11px] text-slate-400">{t("common.search")}</span>
              <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.12] bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline">
                ⌘K
              </span>
            </div>
            <span className="rounded-[11px] border border-violet-400/28 bg-violet-500/[0.12] px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-violet-100 sm:text-[11px]">
              Tip
            </span>
            <span className="rounded-[11px] border border-sky-400/34 bg-gradient-to-b from-[#2d4159] to-[#101b2f] px-2.5 py-2 text-[11px] font-bold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-sky-400/3">
              + {t("crm.addCustomer")}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3" aria-hidden>
              {[pair.today, pair.priority].map(({ titleKey, bodyKey }) => (
                <div
                  key={titleKey}
                  className="rounded-[13px] border border-white/[0.11] bg-gradient-to-br from-white/[0.08] to-transparent px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-[14px] sm:px-3.5 sm:py-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-slate-400 sm:text-[11px]">{t(titleKey)}</p>
                  <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug text-slate-50 sm:text-[13px]">{t(bodyKey)}</p>
                </div>
              ))}
            </div>

            {/* AI 제안 — 강조 패널 */}
            <div
              className="rounded-[13px] border border-sky-400/35 bg-gradient-to-br from-sky-500/[0.14] via-violet-500/[0.07] to-[#051018]/90 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_40px_-22px_rgba(0,0,0,0.55)] sm:rounded-[14px] sm:px-3.5 sm:py-3"
              aria-hidden
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-200/95 sm:text-[11px]">{t(pair.ai.titleKey)}</p>
                <span className="rounded-md border border-white/[0.12] bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300 sm:text-[10px]">
                  draft
                </span>
              </div>
              <p className="mt-1.5 text-[13px] font-medium leading-[1.5] text-slate-50 sm:text-[14px] sm:leading-[1.53]">{t(pair.ai.bodyKey)}</p>
            </div>

            {/* 하단 2열 — 후속 / 요약 */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3" aria-hidden>
              <div className="rounded-[12px] border border-white/[0.09] bg-white/[0.04] px-3 py-2 sm:rounded-[13px] sm:py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[11px]">{t(pair.followup.titleKey)}</p>
                <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-snug text-slate-100 sm:text-[13px]">{t(pair.followup.bodyKey)}</p>
              </div>
              <div className="rounded-[12px] border border-white/[0.09] bg-white/[0.04] px-3 py-2 sm:rounded-[13px] sm:py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[11px]">{t(pair.summary.titleKey)}</p>
                <p className="mt-1 line-clamp-3 text-[12px] font-medium leading-snug text-slate-100 sm:text-[13px] sm:leading-[1.52]">{t(pair.summary.bodyKey)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingShowcaseHero({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  const { t } = useLanguage();
  const [viewer, setViewer] = useState<{
    open: boolean;
    title: string;
    initialSlideIndex: number;
  }>(() => ({ open: false, title: "", initialSlideIndex: 0 }));

  const tipCards = useMemo(
    () =>
      [
        { n: 1 as const, titleKey: "landing.showroom.tip.card1.title" as const, descKey: "landing.showroom.tip.card1.desc" as const, Icon: IconTipStart },
        { n: 2 as const, titleKey: "landing.showroom.tip.card2.title" as const, descKey: "landing.showroom.tip.card2.desc" as const, Icon: IconTipGrid },
        { n: 3 as const, titleKey: "landing.showroom.tip.card3.title" as const, descKey: "landing.showroom.tip.card3.desc" as const, Icon: IconTipFlow },
        { n: 4 as const, titleKey: "landing.showroom.tip.card4.title" as const, descKey: "landing.showroom.tip.card4.desc" as const, Icon: IconTipBeta },
      ] as const,
    [],
  );

  const flowSteps = useMemo(
    () =>
      [
        { titleKey: "landing.showroom.flow.mock.contactTitle" as const, bodyKey: "landing.showroom.flow.mock.contactBody" as const },
        { titleKey: "landing.showroom.flow.mock.needsTitle" as const, bodyKey: "landing.showroom.flow.mock.needsBody" as const },
        { titleKey: "landing.showroom.flow.mock.smsTitle" as const, bodyKey: "landing.showroom.flow.mock.smsBody" as const },
        { titleKey: "landing.showroom.flow.mock.followupTitle" as const, bodyKey: "landing.showroom.flow.mock.followupBody" as const },
      ] as const,
    [],
  );

  return (
    <>
      <SensoraGuideImageViewer
        open={viewer.open}
        title={viewer.title}
        images={GUIDE_VIEWER_IMAGES}
        initialSlideIndex={viewer.initialSlideIndex}
        slideTitleKeys={GUIDE_SLIDE_TITLE_KEYS}
        overlayZClass="z-[200]"
        onClose={() => setViewer({ open: false, title: "", initialSlideIndex: 0 })}
      />

      <section className="landing-showcase-hero relative mx-auto w-full max-w-[1390px] px-[max(1rem,calc(env(safe-area-inset-left,0px)+12px))] pb-8 pr-[max(1rem,calc(env(safe-area-inset-right,0px)+12px))] pt-1 sm:px-5 sm:pb-10 sm:pt-2 md:px-7 lg:px-9 lg:pb-11 lg:pt-5 xl:pt-6">
        <div className="landing-hero-canvas relative overflow-hidden rounded-[26px] border border-white/[0.13] px-5 py-6 shadow-[0_36px_90px_-40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-inset ring-white/[0.04] sm:rounded-[28px] sm:px-6 sm:py-8 lg:rounded-[30px] lg:px-8 lg:py-9 xl:px-10 xl:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_88%_70%_at_72%_-8%,rgba(139,92,246,0.11),transparent_55%),radial-gradient(ellipse_92%_64%_at_8%_100%,rgba(56,189,248,0.08),transparent_58%),linear-gradient(165deg,rgba(5,14,26,0.96) 0%,rgba(8,22,42,0.55) 45%,rgba(4,11,22,0.92) 100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[20%] top-[22%] h-[68%] w-[72%] max-w-[640px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(56,189,248,0.12),transparent_62%),radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.09),transparent_58%)] opacity-95 blur-3xl lg:-right-[8%]"
          />

          <div className="relative z-[1] grid items-start gap-7 sm:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.08fr)] lg:gap-x-12 xl:gap-x-14">
            <div className="landing-showcase-copy-col order-1 min-w-0">
              <span className="inline-flex rounded-full border border-white/[0.16] bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-100 backdrop-blur-sm sm:text-[12px]">
                {t("landing.showroom.hero.kickerBadge")}
              </span>
              <h1 className="mt-4 whitespace-pre-line text-balance text-[clamp(1.5rem,3.85vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-white sm:mt-5">
                {t("landing.showroom.hero.headline")}
              </h1>
              <p className="mt-4 max-w-[41rem] whitespace-pre-line text-[15px] leading-[1.62] text-slate-300 sm:text-[17px] sm:leading-[1.58]">
                {t("landing.showroom.hero.sub")}
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-3.5">
                <Link href={JOIN_PATH} prefetch={false} className={`${ctaPrimaryShowcase} justify-center sm:min-w-[13rem]`}>
                  {t("cta.joinBeta")}
                </Link>
                <button type="button" onClick={onOpenAppWorkspace} className={`${ctaGhostShowcase} justify-center sm:min-w-[13rem]`}>
                  <IconAppWindowPlay className="size-[1.2rem] shrink-0 opacity-95" />
                  {t("cta.tryAppExperience")}
                </button>
              </div>
            </div>

            <div className="landing-showcase-mock-col order-2 relative mx-auto w-full max-w-[min(100%,25rem)] min-[410px]:max-w-[min(100%,34rem)] lg:mx-0 lg:max-w-none">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[40px] bg-[radial-gradient(ellipse_90%_75%_at_52%_50%,rgba(56,189,248,0.16),transparent_64%),radial-gradient(ellipse_70%_60%_at_85%_25%,rgba(139,92,246,0.11),transparent_58%)] opacity-100 blur-2xl sm:-inset-6"
              />
              <div data-sensora-landing-showcase-preview>
                <HeroDashboardPreview />
              </div>
            </div>
          </div>

          {/* Hero 하단 앵커 문구 */}
          <div className="landing-hero-bridge relative z-[1] mt-7 border-t border-white/[0.1] pt-6 text-center sm:mt-8 sm:pt-7">
            <p className="text-[clamp(1rem,2.2vw,1.35rem)] font-semibold leading-snug tracking-[-0.02em] text-slate-200">
              {t("landing.showroom.bridge.line1")}
            </p>
            <p className="mx-auto mt-2 max-w-[36rem] text-[14px] font-medium leading-relaxed text-slate-500 sm:text-[15px]">{t("landing.showroom.bridge.line2")}</p>
          </div>
        </div>

        <div className="landing-showcase-lower landing-showcase-lower-canvas relative z-[1] mt-8 flex flex-col gap-7 rounded-[26px] border border-white/[0.1] bg-gradient-to-b from-white/[0.045] via-[#040a14]/55 to-transparent px-4 py-7 shadow-[0_28px_80px_-42px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-inset ring-white/[0.04] backdrop-blur-sm sm:mt-10 sm:gap-8 sm:px-6 sm:py-9 lg:mt-11 lg:gap-9 lg:px-8 xl:px-10">
          <div className="min-w-0">
            <div className="flex items-end justify-between gap-3 border-b border-white/[0.08] pb-3">
              <h2 className="text-[clamp(1.18rem,2.4vw,1.58rem)] font-semibold tracking-[-0.028em] text-slate-50">{t("landing.showroom.tip.title")}</h2>
              <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:inline">TIP</span>
            </div>
            <div className="landing-tip-grid mt-5 grid grid-cols-2 gap-3 max-[479px]:gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-4">
              {tipCards.map(({ n, titleKey, descKey, Icon }) => (
                <button
                  key={titleKey}
                  type="button"
                  className="landing-tip-feature-card group relative flex flex-col rounded-[17px] border border-white/[0.14] bg-gradient-to-b from-slate-900/72 to-[#061018]/85 p-[14px] text-left shadow-[0_14px_48px_-20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-white/[0.05] backdrop-blur-md motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 hover:-translate-y-1 hover:border-sky-400/38 hover:shadow-[0_22px_56px_-18px_rgba(0,0,0,0.58),0_0_48px_-12px_rgba(56,189,248,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:rounded-[18px] sm:p-4"
                  onClick={() =>
                    setViewer({ open: true, title: t(titleKey), initialSlideIndex: SENSORA_TIP_CARD_INITIAL_INDEX[n] })
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-sky-400/28 bg-gradient-to-br from-sky-500/[0.2] to-violet-600/[0.12] text-[11px] font-bold tabular-nums text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:size-8 sm:rounded-xl sm:text-[12px]">
                      {n}
                    </span>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-sky-50 sm:size-10">
                      <Icon className="size-[19px] opacity-95 sm:size-[21px]" />
                    </span>
                  </div>
                  <span className="mt-4 line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-slate-50 sm:text-[15px]">{t(titleKey)}</span>
                  <span className="mt-2 line-clamp-3 flex-1 text-[12px] leading-relaxed text-slate-500 sm:text-[13px] sm:leading-[1.5]">
                    {t(descKey)}
                  </span>
                  <span className="mt-5 flex justify-end pt-1 sm:mt-6">
                    <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/[0.16] bg-gradient-to-br from-white/[0.1] to-white/[0.03] text-sm font-semibold text-sky-100 shadow-[0_10px_24px_-8px_rgba(56,189,248,0.25)] transition-[transform,border-color,box-shadow] duration-200 group-hover:translate-x-0.5 group-hover:border-sky-400/40 group-hover:text-white">
                      →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-end justify-between gap-3 border-b border-white/[0.08] pb-3">
              <h2 className="text-[clamp(1.18rem,2.4vw,1.58rem)] font-semibold tracking-[-0.028em] text-slate-50">{t("landing.showroom.flow.title")}</h2>
            </div>
            <div className="landing-flow-strip mt-5 flex overflow-x-auto pb-2 [scrollbar-width:thin] sm:pb-0 lg:gap-0 lg:overflow-visible [&::-webkit-scrollbar]:h-1">
              {flowSteps.map((step, idx) => (
                <Fragment key={step.titleKey}>
                  {idx > 0 ? (
                    <>
                      <div
                        className="landing-flow-mobile-connector mx-0.5 flex w-px min-w-[1px] shrink-0 self-stretch bg-gradient-to-b from-transparent via-sky-400/28 to-transparent lg:hidden"
                        aria-hidden
                      />
                      <div className="landing-flow-connector hidden w-px shrink-0 lg:flex lg:flex-col lg:justify-center lg:px-1" aria-hidden>
                        <div className="h-px w-full min-w-[1.75rem] bg-gradient-to-r from-sky-400/35 via-indigo-400/25 to-violet-400/35" />
                      </div>
                    </>
                  ) : null}
                  <div
                    className={[
                      "landing-flow-strip-card landing-showcase-flow-step group relative min-h-[6.75rem] min-w-[calc(48%-6px)] flex-1 rounded-[14px] border border-white/[0.12] bg-gradient-to-br from-white/[0.07] via-[#050d18]/92 to-transparent px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_32px_-16px_rgba(0,0,0,0.45)] backdrop-blur-sm motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 hover:-translate-y-0.5 hover:border-sky-400/32 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)] sm:min-h-[7rem] sm:min-w-0 sm:rounded-2xl sm:px-4 sm:py-4",
                      idx === 0 ? "" : "",
                      idx === flowSteps.length - 1 ? "" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-slate-950/80 text-[12px] font-bold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-2 ring-sky-400/20 sm:size-10 sm:text-[13px]">
                        {idx + 1}
                      </span>
                      <span className="hidden h-full w-[2px] rounded-full bg-gradient-to-b from-sky-400/45 to-violet-500/35 sm:block lg:hidden" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent sm:hidden" aria-hidden />
                      </div>
                    </div>
                    <p className="mt-3 text-[13px] font-semibold leading-snug text-slate-100 sm:mt-3.5 sm:text-[14px] sm:leading-tight">{t(step.titleKey)}</p>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500 sm:line-clamp-3 sm:text-[12px] sm:leading-[1.5]">{t(step.bodyKey)}</p>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
