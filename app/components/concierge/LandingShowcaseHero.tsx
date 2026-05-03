"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraGuideImageViewer } from "@/app/components/concierge/SensoraGuideImageViewer";
import { SENSORA_GUIDE_IMAGES, SENSORA_TIP_CARD_INITIAL_INDEX } from "@/app/components/concierge/sensoraGuideImages";

const JOIN_PATH = "/join" as const;

const mockShell =
  "landing-showcase-mock-frame relative overflow-hidden rounded-[18px] border border-white/[0.17] bg-gradient-to-b from-[#081222]/98 to-[#030b14]/99 shadow-[0_38px_96px_-32px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.095),0_0_0_1px_rgba(56,189,248,0.07)_inset,0_0_80px_-24px_rgba(56,189,248,0.14),0_0_96px_-36px_rgba(139,92,246,0.1)] ring-1 ring-inset ring-white/[0.07] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/22 before:to-transparent sm:rounded-[22px] lg:rounded-[24px]";

const ctaPrimaryShowcase =
  "landing-showcase-cta-primary landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-14 w-full min-w-0 shrink-0 items-center justify-center rounded-2xl px-9 py-4 text-base font-semibold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_48px_-12px_rgba(56,189,248,0.3),0_0_48px_-10px_rgba(139,92,246,0.08)] sm:w-auto sm:min-h-[3.625rem] sm:px-11 sm:text-lg touch-manipulation";

const ctaGhostShowcase =
  "landing-showcase-cta-ghost landing-showroom-cta-preview inline-flex min-h-14 w-full min-w-0 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/[0.34] bg-white/[0.1] px-8 py-4 text-[0.9375rem] font-semibold tracking-tight text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(56,189,248,0.06)_inset,0_0_40px_-10px_rgba(56,189,248,0.14)] ring-1 ring-inset ring-sky-400/22 backdrop-blur-md sm:w-auto sm:min-h-[3.625rem] sm:px-10 sm:text-base touch-manipulation";

const HERO_MOCK_NAV_KEYS = [
  "landing.showroom.heroMock.nav.home",
  "landing.showroom.heroMock.nav.customers",
  "landing.showroom.heroMock.nav.consult",
  "landing.showroom.heroMock.nav.schedule",
  "landing.showroom.heroMock.nav.messages",
  "landing.showroom.heroMock.nav.aiAssistant",
  "landing.showroom.heroMock.nav.stats",
  "landing.showroom.heroMock.nav.settings",
] as const;

function IconBellSoft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a5.5 5.5 0 015.5 5.5V11l1.2 2.4a1 1 0 01-.89 1.43H6.19a1 1 0 01-.89-1.43L6.5 11V8.5A5.5 5.5 0 0112 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9.2 18h5.6a1.6 1.6 0 01-3.2 0z" fill="currentColor" opacity=".35" />
    </svg>
  );
}

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

function IconFlowRecord({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 4h10a1 1 0 011 1v14a1 1 0 01-1 1H8M6 4H5a1 1 0 00-1 1v14a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconFlowNeeds({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20.5a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 8l2-1M18 10l1 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconFlowSms({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3v-3H5a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconFlowNext({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 15l1.2 1.2L15 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const GUIDE_VIEWER_IMAGES = SENSORA_GUIDE_IMAGES.map((s) => ({ src: s.src }));
const GUIDE_SLIDE_TITLE_KEYS = SENSORA_GUIDE_IMAGES.map((s) => s.titleKey);

function HeroDashboardPreview() {
  const { t, language } = useLanguage();
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    const loc = language === "ko" ? "ko-KR" : "en-US";
    const format = () =>
      new Date().toLocaleString(loc, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    setDateLabel(format());
    const id = window.setInterval(() => setDateLabel(format()), 60_000);
    return () => window.clearInterval(id);
  }, [language]);

  const cards = useMemo(
    () => ({
      today: { titleKey: "landing.showroom.heroDash.todayTitle" as const, bodyKey: "landing.showroom.heroDash.todaySnippet" as const },
      followup: { titleKey: "landing.showroom.heroDash.followupTitle" as const, bodyKey: "landing.showroom.heroDash.followupSnippet" as const },
      ai: { titleKey: "landing.showroom.heroDash.aiDraftTitle" as const, bodyKey: "landing.showroom.heroDash.aiDraftSnippet" as const },
      summary: { titleKey: "landing.showroom.heroDash.summaryTitle" as const, bodyKey: "landing.showroom.heroDash.summarySnippet" as const },
    }),
    [],
  );

  return (
    <div className={`${mockShell} mx-auto w-full max-w-[calc(100vw-28px)] sm:max-w-[min(100%,36rem)] lg:mx-0 lg:max-w-none`}>
      <div className="relative border-b border-white/[0.11] bg-gradient-to-b from-[#0a1524]/98 to-[#060d18]/96 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-rose-400/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]" />
            <span className="size-2 rounded-full bg-amber-400/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]" />
            <span className="size-2 rounded-full bg-emerald-400/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-emerald-400/90 ring-2 ring-emerald-400/25 shadow-[0_0_12px_-2px_rgba(52,211,153,0.45)]" aria-hidden />
            <p className="truncate text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-200 sm:text-[12px]">{t("product.name")}</p>
          </div>
          <span className="shrink-0 rounded-lg border border-sky-400/22 bg-sky-500/[0.08] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-100/95 sm:text-[10px]">
            {t("landing.showroom.heroMock.previewBadge")}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-col sm:min-h-[312px] sm:flex-row md:min-h-[328px] lg:min-h-[352px]">
        <nav
          className="flex shrink-0 flex-row gap-0 overflow-x-auto overflow-y-hidden border-b border-white/[0.12] bg-[#030d18]/99 [scrollbar-width:none] sm:w-[9.5rem] sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:border-white/[0.12] sm:py-1.5 [&::-webkit-scrollbar]:hidden"
          aria-hidden
        >
          {HERO_MOCK_NAV_KEYS.map((key, i) => {
            const active = i === 0;
            return (
              <div
                key={key}
                className={[
                  "flex min-w-[4.6rem] shrink-0 items-center gap-2 border-white/[0.06] px-2.5 py-2 sm:min-w-0 sm:flex-initial sm:border-b sm:border-l-[3px] sm:px-2.5 sm:py-2",
                  active
                    ? "border-b-2 border-b-sky-400/85 bg-gradient-to-t from-sky-500/[0.14] to-transparent sm:border-b-0 sm:border-l-sky-400 sm:bg-gradient-to-r sm:from-sky-500/[0.12] sm:to-transparent"
                    : "border-b-2 border-b-transparent sm:border-l-transparent sm:opacity-[0.88]",
                ].join(" ")}
              >
                <span
                  className={[
                    "size-1.5 shrink-0 rounded-full sm:size-2",
                    active ? "bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.55)]" : "bg-white/22",
                  ].join(" ")}
                />
                <p className="truncate text-[9.5px] font-semibold text-slate-100 sm:text-[10.5px]">{t(key)}</p>
              </div>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-[#020817]/98 via-[#051018]/96 to-[#040a14]/95">
          <div
            className="flex flex-col gap-2.5 border-b border-white/[0.08] px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-3.5 sm:py-3"
            aria-hidden
          >
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold leading-snug text-slate-50 sm:text-[13px]">{t("landing.showroom.heroMock.greeting")}</p>
              <p className="mt-1 text-[10.5px] font-medium text-slate-500 sm:text-[11px]">{t("landing.showroom.heroDash.windowSubline")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <time className="rounded-[10px] border border-white/[0.16] bg-white/[0.065] px-2.5 py-1.5 text-[10px] font-semibold tabular-nums text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_28px_-10px_rgba(56,189,248,0.12)] sm:text-[11px]">
                {dateLabel}
              </time>
              <span
                className="inline-flex size-9 items-center justify-center rounded-[10px] border border-white/[0.16] bg-white/[0.065] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_26px_-10px_rgba(56,189,248,0.1)]"
                aria-hidden
              >
                <IconBellSoft className="size-[18px] opacity-90" />
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5" aria-hidden>
              {[cards.today, cards.followup].map(({ titleKey, bodyKey }) => (
                <div
                  key={titleKey}
                  className="rounded-[12px] border border-white/[0.15] bg-gradient-to-br from-white/[0.095] to-transparent px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_32px_-14px_rgba(56,189,248,0.12)] sm:rounded-[13px] sm:px-3 sm:py-2.5"
                >
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-300 sm:text-[10px]">{t(titleKey)}</p>
                  <p className="mt-1 line-clamp-2 text-[11.5px] font-semibold leading-snug text-slate-50 sm:text-[12.5px]">{t(bodyKey)}</p>
                </div>
              ))}
            </div>

            <div
              className="rounded-[13px] border border-sky-400/45 bg-gradient-to-br from-sky-500/[0.2] via-violet-500/[0.1] to-[#050d16]/93 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_52px_-10px_rgba(56,189,248,0.22),0_18px_48px_-22px_rgba(0,0,0,0.55)] ring-1 ring-sky-400/38 sm:rounded-[14px] sm:px-3.5 sm:py-3"
              aria-hidden
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-sky-100/95 sm:text-[10.5px]">{t(cards.ai.titleKey)}</p>
                <span className="rounded-md border border-white/[0.14] bg-white/[0.07] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-slate-200 sm:text-[10px]">
                  {t("landing.showroom.heroMock.draftLabel")}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] font-medium leading-[1.52] text-slate-50 sm:text-[13.5px]">{t(cards.ai.bodyKey)}</p>
            </div>

            <div className="rounded-[12px] border border-white/[0.14] bg-white/[0.048] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_26px_-16px_rgba(56,189,248,0.06)] sm:rounded-[13px] sm:px-3 sm:py-2.5" aria-hidden>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[10px]">{t(cards.summary.titleKey)}</p>
              <p className="mt-1 line-clamp-3 text-[11.5px] font-medium leading-snug text-slate-100 sm:text-[12.5px] sm:leading-[1.52]">{t(cards.summary.bodyKey)}</p>
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
        {
          titleKey: "landing.showroom.flow.mock.contactTitle" as const,
          bodyKey: "landing.showroom.flow.mock.contactBody" as const,
          Icon: IconFlowRecord,
        },
        {
          titleKey: "landing.showroom.flow.mock.needsTitle" as const,
          bodyKey: "landing.showroom.flow.mock.needsBody" as const,
          Icon: IconFlowNeeds,
        },
        {
          titleKey: "landing.showroom.flow.mock.smsTitle" as const,
          bodyKey: "landing.showroom.flow.mock.smsBody" as const,
          Icon: IconFlowSms,
        },
        {
          titleKey: "landing.showroom.flow.mock.followupTitle" as const,
          bodyKey: "landing.showroom.flow.mock.followupBody" as const,
          Icon: IconFlowNext,
        },
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

      <section className="landing-showcase-hero relative mx-auto w-full max-w-[1480px] px-[max(1rem,calc(env(safe-area-inset-left,0px)+12px))] pb-8 pr-[max(1rem,calc(env(safe-area-inset-right,0px)+12px))] pt-1 sm:px-5 sm:pb-10 sm:pt-2 md:px-7 lg:px-9 lg:pb-11 lg:pt-5 xl:px-11 xl:pt-6">
        <div className="landing-hero-canvas relative overflow-hidden rounded-[26px] border border-white/[0.15] px-5 py-6 shadow-[0_42px_108px_-44px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.084),0_0_80px_-40px_rgba(56,189,248,0.06)] ring-1 ring-inset ring-white/[0.065] sm:rounded-[28px] sm:px-6 sm:py-8 lg:rounded-[30px] lg:px-8 lg:py-9 xl:px-11 xl:py-11">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_62%_at_58%_-4%,rgba(139,92,246,0.185),transparent_53%),radial-gradient(ellipse_88%_64%_at_8%_96%,rgba(56,189,248,0.14),transparent_57%),radial-gradient(ellipse_62%_50%_at_92%_42%,rgba(99,102,241,0.105),transparent_55%),linear-gradient(165deg,rgba(5,14,26,0.96) 0%,rgba(8,24,46,0.55) 48%,rgba(4,11,22,0.94) 100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-[28%] top-[22%] h-[72%] w-[72%] max-w-[560px] rounded-full bg-[radial-gradient(circle_at_62%_44%,rgba(56,189,248,0.14),transparent_58%),radial-gradient(circle_at_28%_58%,rgba(139,92,246,0.09),transparent_56%)] opacity-[0.95] blur-3xl sm:-left-[20%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[14%] top-[14%] h-[78%] w-[78%] max-w-[720px] rounded-full bg-[radial-gradient(circle_at_40%_36%,rgba(56,189,248,0.2),transparent_57%),radial-gradient(circle_at_70%_56%,rgba(139,92,246,0.14),transparent_55%)] opacity-[0.98] blur-3xl lg:-right-[4%]"
          />

          <div className="relative z-[1] grid items-start gap-8 sm:gap-9 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.3fr)] lg:gap-x-12 lg:pb-3 lg:pr-2 xl:gap-x-[3.5rem] xl:pr-5">
            <div className="landing-showcase-copy-col order-1 min-w-0">
              <span className="inline-flex rounded-full border border-white/[0.18] bg-white/[0.082] px-3.5 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-100 backdrop-blur-sm">
                {t("landing.showroom.hero.kickerBadge")}
              </span>
              <h1 className="mt-5 max-w-[min(100%,48rem)] whitespace-pre-line text-balance text-[clamp(1.92rem,5.15vw,3.62rem)] font-semibold leading-[1.065] tracking-[-0.041em] text-white sm:mt-6 lg:max-w-[min(100%,52rem)]">
                {t("landing.showroom.hero.headline")}
              </h1>
              <p className="mt-6 max-w-[min(100%,42rem)] whitespace-pre-line text-base leading-[1.72] text-slate-200/96 sm:text-lg sm:leading-[1.66] lg:max-w-[min(100%,44rem)]">
                {t("landing.showroom.hero.sub")}
              </p>
              <div className="mt-9 flex w-full flex-col gap-3.5 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href={JOIN_PATH} prefetch={false} className={`${ctaPrimaryShowcase} justify-center sm:min-w-[14rem]`}>
                  {t("cta.joinBeta")}
                </Link>
                <button type="button" onClick={onOpenAppWorkspace} className={`${ctaGhostShowcase} justify-center sm:min-w-[14rem]`}>
                  <IconAppWindowPlay className="size-[1.2rem] shrink-0 opacity-95" />
                  {t("cta.tryAppExperience")}
                </button>
              </div>
            </div>

            <div className="landing-showcase-mock-col motion-safe:transition-transform order-2 relative mx-auto w-full max-w-[min(100%,25rem)] min-[410px]:max-w-[min(100%,36rem)] lg:mx-0 lg:max-w-none lg:justify-self-stretch lg:origin-top lg:[transform:scale(1.085)] xl:[transform:scale(1.12)] motion-reduce:lg:transform-none">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[40px] bg-[radial-gradient(ellipse_90%_75%_at_52%_50%,rgba(56,189,248,0.26),transparent_60%),radial-gradient(ellipse_70%_60%_at_85%_25%,rgba(139,92,246,0.18),transparent_56%)] opacity-100 blur-2xl sm:-inset-6"
              />
              <div data-sensora-landing-showcase-preview>
                <HeroDashboardPreview />
              </div>
            </div>
          </div>

          <div className="landing-hero-bridge relative z-[1] mt-10 px-2 sm:mt-12 sm:px-4">
            <div className="mx-auto flex max-w-[44rem] flex-col items-center gap-5 py-8 sm:gap-6 sm:py-10">
              <div className="flex w-full max-w-lg items-center gap-3 sm:gap-4" aria-hidden>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-400/38 to-transparent" />
                <span className="size-1.5 shrink-0 rounded-full bg-sky-400/65 shadow-[0_0_16px_-1px_rgba(56,189,248,0.52)]" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-violet-400/30 to-transparent" />
              </div>
              <p className="text-center text-[clamp(1.05rem,2.35vw,1.48rem)] font-semibold leading-snug tracking-[-0.022em] text-slate-100">
                {t("landing.showroom.bridge.line1")}
              </p>
              <p className="max-w-[38rem] text-center text-sm font-medium leading-relaxed text-slate-400 sm:text-[0.9375rem] sm:leading-[1.58]">
                {t("landing.showroom.bridge.line2")}
              </p>
            </div>
          </div>
        </div>

        <div className="landing-showcase-lower landing-showcase-lower-canvas relative z-[1] mt-8 flex flex-col gap-7 rounded-[26px] border border-white/[0.13] bg-gradient-to-b from-white/[0.062] via-[#040a14]/65 to-[#020810]/92 px-4 py-7 shadow-[0_34px_92px_-38px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.065),0_0_72px_-34px_rgba(56,189,248,0.078)] ring-1 ring-inset ring-white/[0.06] backdrop-blur-md sm:mt-10 sm:gap-8 sm:px-6 sm:py-9 lg:mt-11 lg:gap-9 lg:px-8 xl:px-10">
          <div className="min-w-0">
            <div className="flex items-end justify-between gap-3 border-b border-white/[0.09] pb-3">
              <h2 className="text-[clamp(1.18rem,2.4vw,1.58rem)] font-semibold tracking-[-0.028em] text-slate-50">{t("landing.showroom.tip.title")}</h2>
              <span className="hidden shrink-0 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-slate-500 sm:inline">TIP</span>
            </div>
            <div className="landing-tip-grid mt-5 grid grid-cols-2 gap-3 max-[479px]:gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-4">
              {tipCards.map(({ n, titleKey, descKey, Icon }) => (
                <button
                  key={titleKey}
                  type="button"
                  className="landing-tip-card-shell landing-tip-feature-card group relative flex min-h-[14rem] cursor-pointer flex-col rounded-[18px] border border-white/[0.24] bg-gradient-to-b from-slate-900/82 to-[#061018]/92 p-4 text-left shadow-[0_18px_56px_-22px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.085),0_0_44px_-16px_rgba(56,189,248,0.12)] ring-1 ring-inset ring-sky-400/18 backdrop-blur-md motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-[220ms] motion-safe:ease-[cubic-bezier(0.22,1,0.32,1)] hover:-translate-y-1.5 hover:border-sky-400/55 hover:shadow-[0_28px_72px_-20px_rgba(0,0,0,0.64),0_0_64px_-10px_rgba(56,189,248,0.28),inset_0_1px_0_rgba(255,255,255,0.11)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[14.25rem] sm:rounded-[19px] sm:p-[1.12rem]"
                  onClick={() =>
                    setViewer({ open: true, title: t(titleKey), initialSlideIndex: SENSORA_TIP_CARD_INITIAL_INDEX[n] })
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/52 bg-gradient-to-br from-sky-500/[0.34] to-violet-600/[0.21] text-sm font-bold tabular-nums text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_24px_-6px_rgba(56,189,248,0.25)]">
                      {n}
                    </span>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/28 bg-white/[0.1] text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_32px_-6px_rgba(56,189,248,0.2)] ring-1 ring-inset ring-white/[0.1] transition-[transform,box-shadow,border-color] duration-[220ms] group-hover:-translate-y-0.5 group-hover:border-sky-400/42 group-hover:text-white">
                      <Icon className="size-[22px] opacity-[0.98] sm:size-6" />
                    </span>
                  </div>
                  <span className="mt-4 line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-slate-50 sm:text-base">{t(titleKey)}</span>
                  <span className="mt-2 flex-1 line-clamp-3 text-sm leading-relaxed text-slate-400 sm:text-[0.8125rem] sm:leading-[1.52]">
                    {t(descKey)}
                  </span>
                  <span className="mt-auto flex justify-end pt-4 sm:pt-5">
                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-sky-400/42 bg-gradient-to-br from-white/[0.17] to-white/[0.05] text-[0.9375rem] font-bold text-sky-50 shadow-[0_12px_32px_-8px_rgba(56,189,248,0.38)] transition-[transform,border-color,box-shadow] duration-[220ms] group-hover:translate-x-1 group-hover:border-sky-400/65 group-hover:shadow-[0_16px_40px_-6px_rgba(56,189,248,0.48)] group-hover:text-white motion-reduce:group-hover:translate-x-0">
                      →
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-end justify-between gap-3 border-b border-white/[0.09] pb-3">
              <div>
                <h2 className="text-[clamp(1.18rem,2.4vw,1.58rem)] font-semibold tracking-[-0.028em] text-slate-50">{t("landing.showroom.flow.title")}</h2>
                <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-slate-500 sm:text-[0.875rem]">{t("landing.showroom.flow.desc")}</p>
              </div>
            </div>
            <div className="landing-flow-process relative mt-6">
              <div
                className="pointer-events-none absolute left-[5%] right-[5%] top-[41px] z-0 hidden h-px bg-gradient-to-r from-transparent via-sky-400/52 to-transparent shadow-[0_0_26px_-2px_rgba(56,189,248,0.42),0_0_48px_-4px_rgba(129,140,248,0.14)] lg:block"
                aria-hidden
              />
              <ol className="m-0 flex list-none flex-col gap-3 p-0 sm:gap-4 lg:flex-row lg:items-stretch lg:gap-0">
                {flowSteps.map((step, idx) => (
                  <Fragment key={step.titleKey}>
                    {idx > 0 ? (
                      <>
                        <li className="mx-auto flex h-[2px] w-[min(100%,13rem)] shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-400/48 to-transparent shadow-[0_0_22px_-2px_rgba(56,189,248,0.35)] lg:hidden" aria-hidden />
                        <li className="relative hidden w-6 shrink-0 items-center justify-center lg:flex" aria-hidden>
                          <span className="absolute left-1/2 top-[40px] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-sky-400/35 bg-[radial-gradient(circle,rgba(56,189,248,0.45),rgba(139,92,246,0.12))] shadow-[0_0_16px_-1px_rgba(56,189,248,0.62)] ring-2 ring-sky-400/15" />
                          <span className="mt-[2.125rem] h-[2px] w-full min-w-[0.5rem] rounded-full bg-gradient-to-r from-sky-400/42 via-indigo-400/32 to-violet-400/38 shadow-[0_0_22px_-2px_rgba(56,189,248,0.28)]" />
                        </li>
                      </>
                    ) : null}
                    <li className="relative z-[1] min-w-0 flex-1">
                      <div
                        className={[
                          "landing-flow-strip-card landing-showcase-flow-step group relative flex h-full min-h-[10.5rem] min-w-[calc(48%-6px)] flex-col rounded-[16px] border border-white/[0.19] bg-gradient-to-br from-white/[0.1] via-[#050d18]/95 to-transparent px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.086),0_16px_44px_-18px_rgba(0,0,0,0.52),0_0_48px_-22px_rgba(56,189,248,0.1)] ring-1 ring-inset ring-sky-400/12 backdrop-blur-sm motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-[220ms] hover:-translate-y-1 hover:border-sky-400/42 hover:shadow-[0_24px_56px_-18px_rgba(0,0,0,0.56),0_0_54px_-12px_rgba(56,189,248,0.18)] sm:min-h-[10.75rem] sm:min-w-0 sm:rounded-2xl sm:px-[1.18rem] sm:py-[1.25rem]",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/[0.18] bg-slate-950/92 text-[12.5px] font-bold tabular-nums text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-2 ring-sky-400/28">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/32 bg-sky-500/[0.14] text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_28px_-8px_rgba(56,189,248,0.15)] ring-1 ring-inset ring-white/[0.08]">
                            <step.Icon className="size-[22px]" />
                          </span>
                        </div>
                        <p className="mt-3.5 text-[14.5px] font-semibold leading-snug text-slate-50 sm:text-[15.25px] sm:leading-[1.2]">{t(step.titleKey)}</p>
                        <p className="mt-2.5 line-clamp-3 text-[11.75px] leading-relaxed text-slate-300 sm:text-[12.75px] sm:leading-[1.54]">{t(step.bodyKey)}</p>
                      </div>
                    </li>
                  </Fragment>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
