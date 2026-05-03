"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { SensoraGuideDetailModal } from "@/app/components/concierge/SensoraGuideDetailModal";
import {
  SENSORA_CONCEPT_STORY_SLIDES,
  SENSORA_CONCEPT_TIP_SHORT_KEYS,
  sensoraGuideIdFromConceptSlideId,
} from "@/app/components/concierge/sensoraConceptStory";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { DEFAULT_GUIDE_ID, type SensoraGuideId } from "@/lib/sensoraGuide";
import { crmSectionToHash, type CrmSection } from "@/app/crm/crmSectionTypes";

const JOIN_PATH = "/join" as const;

const mockShell =
  "landing-showcase-mock-frame relative overflow-hidden rounded-[18px] border border-white/[0.17] bg-gradient-to-b from-[#081222]/98 to-[#030b14]/99 shadow-[0_38px_96px_-32px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.095),0_0_0_1px_rgba(56,189,248,0.07)_inset,0_0_80px_-24px_rgba(56,189,248,0.14),0_0_96px_-36px_rgba(139,92,246,0.1)] ring-1 ring-inset ring-white/[0.07] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/22 before:to-transparent sm:rounded-[22px] lg:rounded-[24px]";

const ctaPrimaryShowcase =
  "landing-showcase-cta-primary landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-14 max-sm:min-h-[3.125rem] w-full min-w-0 shrink-0 items-center justify-center rounded-2xl px-9 py-4 text-base font-semibold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_48px_-12px_rgba(56,189,248,0.3),0_0_48px_-10px_rgba(139,92,246,0.08)] max-sm:px-7 max-sm:py-3 max-sm:text-[0.9375rem] sm:min-h-[3.625rem] sm:px-10 sm:py-4 sm:text-lg touch-manipulation";

const ctaGhostShowcase =
  "landing-showcase-cta-ghost landing-showroom-cta-preview inline-flex min-h-14 max-sm:min-h-[3.125rem] w-full min-w-0 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/[0.34] bg-white/[0.1] px-8 py-4 text-[0.9375rem] font-semibold tracking-tight text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(56,189,248,0.06)_inset,0_0_40px_-10px_rgba(56,189,248,0.14)] ring-1 ring-inset ring-sky-400/22 backdrop-blur-md max-sm:gap-1.5 max-sm:px-6 max-sm:py-3 max-sm:text-[0.875rem] sm:min-h-[3.625rem] sm:px-9 sm:py-4 sm:text-base touch-manipulation";

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
    <div className={`${mockShell} flex flex-col mx-auto w-full max-w-[calc(100vw-28px)] sm:max-w-[min(100%,36rem)] lg:mx-0 lg:max-w-none`}>
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

      <div className="flex min-h-0 flex-1 flex-col max-lg:min-h-[min(228px,40dvh)] sm:min-h-[300px] sm:flex-row md:min-h-[320px] lg:min-h-[348px]">
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
                  "flex min-w-[4.35rem] shrink-0 items-center gap-1.5 border-white/[0.06] px-2 py-[0.4375rem] sm:min-w-0 sm:gap-2 sm:border-b sm:border-l-[3px] sm:px-2.5 sm:py-2",
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

          <div className="flex min-h-0 flex-1 flex-col gap-2 px-[0.65rem] py-2 max-lg:pb-2 sm:gap-3 sm:px-3.5 sm:py-3">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5" aria-hidden>
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
  const router = useRouter();
  const [landingDetailOpen, setLandingDetailOpen] = useState(false);
  const [landingGuideId, setLandingGuideId] = useState<SensoraGuideId>(DEFAULT_GUIDE_ID);

  const openLandingGuideDetail = (id: SensoraGuideId) => {
    setLandingGuideId(id);
    setLandingDetailOpen(true);
  };

  const goWorkspaceFromLandingDetail = (section: CrmSection) => {
    setLandingDetailOpen(false);
    router.push(`/?view=app#${crmSectionToHash(section)}`);
  };

  /** 상담 흐름 섹션 — 컨셉 가이드·워크스페이스 캡처 */
  const FLOW_STEP_ART = [
    "/images/guides/sensora-guide-03.png",
    "/images/guides/sensora-guide-02.png",
    "/images/guides/sensora-guide-04.png",
    "/images/guides/sensora-guide-05.png",
  ] as const;

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
      <SensoraGuideDetailModal
        open={landingDetailOpen}
        onClose={() => setLandingDetailOpen(false)}
        activeGuideId={landingGuideId}
        onActiveGuideChange={setLandingGuideId}
        onGoToRelated={goWorkspaceFromLandingDetail}
        overlayZClass="z-[220]"
      />

      <section className="landing-showcase-hero landing-showcase-hero--dock landing-showcase-hero--unified relative mx-auto w-full max-w-[min(100%,1580px)] max-lg:min-h-0 px-[max(0.875rem,calc(env(safe-area-inset-left,0px)+10px))] pb-[max(1.75rem,calc(env(safe-area-inset-bottom,0px)+1rem))] pr-[max(0.875rem,calc(env(safe-area-inset-right,0px)+10px))] pt-4 max-lg:pb-[max(2.25rem,calc(env(safe-area-inset-bottom,0px)+1.25rem))] max-lg:pt-5 sm:px-5 sm:pb-10 sm:pt-2.5 md:px-7 md:pt-2 lg:px-10 lg:pb-11 lg:pt-1.5 xl:px-12 xl:pt-2">
        <div className="sensora-nebula-shell landing-hero-canvas landing-hero-canvas--first relative max-lg:min-h-0 max-lg:!overflow-visible max-lg:shadow-[0_28px_80px_-36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.07)] lg:overflow-hidden rounded-[22px] border border-white/[0.14] px-3.5 py-3 max-sm:rounded-[20px] max-lg:border-white/[0.12] max-lg:bg-[linear-gradient(165deg,rgba(6,16,28,0.92)_0%,rgba(4,10,20,0.88)_48%,rgba(3,8,16,0.94)_100%)] max-lg:py-4 sm:rounded-[28px] sm:px-6 sm:py-5 lg:rounded-[30px] lg:border-white/[0.15] lg:bg-transparent lg:px-9 lg:py-7 lg:shadow-[0_42px_108px_-44px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.084),0_0_80px_-40px_rgba(56,189,248,0.06)] xl:px-11 xl:py-8">
          <div
            aria-hidden
            className="sensora-nebula-layer-absolute pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_62%_at_58%_-4%,rgba(139,92,246,0.185),transparent_53%),radial-gradient(ellipse_88%_64%_at_8%_96%,rgba(56,189,248,0.14),transparent_57%),radial-gradient(ellipse_62%_50%_at_92%_42%,rgba(99,102,241,0.105),transparent_55%),linear-gradient(165deg,rgba(5,14,26,0.96) 0%,rgba(8,24,46,0.55) 48%,rgba(4,11,22,0.94) 100%)]"
          />
          <div
            aria-hidden
            className="sensora-nebula-layer-absolute pointer-events-none absolute -left-[28%] top-[22%] h-[72%] w-[72%] max-w-[560px] rounded-full bg-[radial-gradient(circle_at_62%_44%,rgba(56,189,248,0.14),transparent_58%),radial-gradient(circle_at_28%_58%,rgba(139,92,246,0.09),transparent_56%)] opacity-[0.95] blur-3xl sm:-left-[20%]"
          />
          <div
            aria-hidden
            className="sensora-nebula-layer-absolute pointer-events-none absolute -right-[14%] top-[14%] h-[78%] w-[78%] max-w-[720px] rounded-full bg-[radial-gradient(circle_at_40%_36%,rgba(56,189,248,0.2),transparent_57%),radial-gradient(circle_at_70%_56%,rgba(139,92,246,0.14),transparent_55%)] opacity-[0.98] blur-3xl lg:-right-[4%]"
          />

          <div className="relative z-[1] flex max-lg:min-h-0 max-lg:flex-col max-lg:gap-5 items-start gap-3 sm:gap-6 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1.14fr)] lg:gap-x-10 lg:gap-y-6 lg:pb-0 lg:pr-0 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.12fr)] xl:gap-x-11 xl:gap-y-7 2xl:gap-x-14">
            <div className="landing-showcase-copy-col landing-hero-copy-stack order-1 min-w-0 w-full max-lg:rounded-2xl max-lg:border max-lg:border-white/[0.08] max-lg:bg-white/[0.03] max-lg:px-3.5 max-lg:py-4 max-lg:ring-1 max-lg:ring-inset max-lg:ring-white/[0.04] lg:max-w-[min(100%,38rem)] lg:border-0 lg:bg-transparent lg:p-0 xl:max-w-[min(100%,44rem)] 2xl:max-w-[min(100%,48rem)]">
              <span className="inline-flex w-fit rounded-full border border-white/[0.2] bg-white/[0.07] px-3 py-1 text-[11px] font-semibold tracking-[0.06em] text-slate-100/95 backdrop-blur-sm max-sm:py-[0.3125rem] sm:px-3.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.08em]">
                {t("landing.showroom.hero.kickerBadge")}
              </span>
              <h1 className="landing-showcase-hero-headline mt-2.5 max-w-[min(100%,44rem)] text-pretty font-semibold leading-[1.18] tracking-[-0.034em] text-white [word-break:keep-all] text-[clamp(1.45rem,calc(0.32rem+4.2vw),3.28rem)] max-sm:mt-2 max-sm:leading-[1.2] sm:mt-4 sm:max-w-[min(100%,40rem)] lg:leading-[1.2] xl:max-w-[min(100%,46rem)] 2xl:text-[clamp(1.85rem,2.75vw,3.35rem)]">
                <span className="landing-showcase-hero-headline-line block">{t("landing.showroom.hero.headlineLine1")}</span>
                <span className="landing-showcase-hero-headline-line mt-[0.06em] block text-white">{t("landing.showroom.hero.headlineLine2")}</span>
              </h1>
              <p className="mt-3 max-w-[min(100%,40rem)] whitespace-pre-line text-sm leading-[1.55] text-slate-200/95 max-sm:mt-2.5 max-sm:text-[0.8125rem] max-sm:leading-snug sm:mt-5 sm:text-[1.065rem] sm:leading-[1.68] lg:max-w-[min(100%,42ch)] xl:max-w-[48ch]">
                {t("landing.showroom.hero.sub")}
              </p>
              <div className="mt-4 grid w-full max-w-xl grid-cols-1 gap-2 max-sm:gap-2 sm:mt-7 sm:gap-3 md:max-w-none md:grid-cols-2 md:gap-4 lg:mt-8">
                <Link href={JOIN_PATH} prefetch={false} className={`${ctaPrimaryShowcase} justify-center whitespace-nowrap`}>
                  {t("cta.joinBeta")}
                </Link>
                <button type="button" onClick={onOpenAppWorkspace} className={`${ctaGhostShowcase} justify-center whitespace-nowrap`}>
                  <IconAppWindowPlay className="size-[1.2rem] shrink-0 opacity-95" />
                  {t("cta.tryAppExperience")}
                </button>
              </div>
            </div>

            <div className="landing-showcase-mock-col landing-hero-mock-stack motion-safe:transition-transform order-2 relative mx-auto w-full max-w-[min(100%,25rem)] min-h-0 min-[410px]:max-w-[min(100%,36rem)] max-lg:mt-1 max-lg:max-w-full lg:mx-0 lg:mt-0 lg:max-w-none lg:justify-self-stretch lg:origin-top lg:self-start lg:[transform:scale(1.028)] xl:max-w-[min(100%,52rem)] xl:[transform:scale(1.045)] motion-reduce:lg:transform-none">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(ellipse_90%_75%_at_52%_50%,rgba(56,189,248,0.22),transparent_60%),radial-gradient(ellipse_70%_60%_at_85%_25%,rgba(139,92,246,0.14),transparent_56%)] opacity-90 blur-2xl max-lg:opacity-80 lg:-inset-4 lg:rounded-[40px] lg:opacity-100 xl:-inset-6"
              />
              <div data-sensora-landing-showcase-preview className="max-lg:mx-auto max-lg:max-w-[min(100%,24rem)] sm:max-lg:max-w-[min(100%,26.5rem)]">
                <HeroDashboardPreview />
              </div>
            </div>
          </div>

          <div className="landing-hero-bridge landing-hero-bridge--slogan relative z-[1] mt-[max(0.75rem,env(safe-area-inset-bottom,0px)+0.25rem)] px-2 max-lg:mt-4 sm:-mx-1 sm:mt-6 sm:px-3 lg:-mx-2 lg:mt-5 xl:mt-6">
            <div className="landing-hero-bridge-panel mx-auto max-w-[min(100%,36rem)] rounded-[16px] border border-white/[0.1] bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-[#040a12]/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_12px_40px_-24px_rgba(56,189,248,0.08)] ring-1 ring-inset ring-white/[0.04] max-sm:px-3.5 max-sm:py-3 sm:max-w-[min(100%,38rem)] sm:rounded-[20px] sm:px-6 sm:py-5">
              <div className="flex w-full items-center gap-3 opacity-[0.9] sm:gap-4" aria-hidden>
                <span className="h-px min-w-[1.5rem] flex-1 bg-gradient-to-r from-transparent via-sky-400/38 to-transparent" />
                <span className="size-1.5 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-violet-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.52)] ring-2 ring-sky-400/22" />
                <span className="h-px min-w-[1.5rem] flex-1 bg-gradient-to-l from-transparent via-violet-400/34 to-transparent" />
              </div>
              <p className="mt-3 text-center text-[clamp(1.02rem,2.05vw,1.38rem)] font-semibold leading-snug tracking-[-0.021em] text-slate-100 sm:mt-4">
                {t("landing.showroom.bridge.line1")}
              </p>
              <p className="-mt-0.5 pt-2 text-center text-[clamp(1rem,2vw,1.34rem)] font-semibold leading-snug tracking-[-0.021em] text-slate-200/95">
                {t("landing.showroom.bridge.line2")}
              </p>
            </div>
          </div>
        </div>

        <div className="sensora-nebula-shell landing-showcase-lower landing-showcase-lower-canvas landing-showroom-lower-rhythm relative z-[1] mt-6 flex flex-col gap-5 rounded-[22px] border border-white/[0.12] bg-gradient-to-b from-white/[0.055] via-[#040a14]/72 to-[#020810]/94 px-3.5 py-5 shadow-[0_34px_92px_-38px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.065),0_0_72px_-34px_rgba(56,189,248,0.078)] ring-1 ring-inset ring-white/[0.055] backdrop-blur-md max-lg:rounded-[20px] sm:mt-8 sm:gap-7 sm:rounded-[26px] sm:px-6 sm:py-8 lg:mt-9 lg:gap-8 lg:px-8 xl:px-10">
          <div className="relative min-w-0 overflow-hidden rounded-[22px]">
            <div className="sensora-preview-galaxy-stars pointer-events-none absolute inset-0 opacity-[0.5]" aria-hidden />
            <div className="relative z-[1]">
              <div className="flex flex-col gap-2 border-b border-white/[0.09] pb-3 sm:flex-row sm:items-end sm:justify-between sm:pb-3.5">
                <div className="min-w-0">
                  <h2 className="text-[clamp(1.12rem,2.35vw,1.52rem)] font-semibold tracking-[-0.028em] text-slate-50">{t("landing.showroom.concept.sectionTitle")}</h2>
                </div>
                <p className="max-w-[52ch] text-[11px] leading-snug text-slate-400 sm:max-w-[40ch] sm:text-right sm:text-xs sm:leading-relaxed lg:text-[0.8125rem]">
                  {t("landing.showroom.concept.sectionSub")}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 md:gap-4 lg:grid-cols-4">
                {SENSORA_CONCEPT_STORY_SLIDES.map((slide, slideIdx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => {
                      const gid = sensoraGuideIdFromConceptSlideId(slide.id);
                      if (gid) openLandingGuideDetail(gid);
                    }}
                    className="landing-tip-feature-card sensora-concept-tip-card group relative flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-[14px] border border-white/[0.18] bg-gradient-to-b from-slate-900/85 to-[#050d14]/94 text-left shadow-[0_16px_48px_-20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08),0_0_40px_-12px_rgba(56,189,248,0.12)] ring-1 ring-inset ring-sky-400/12 backdrop-blur-md transition-[transform,border-color,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:border-sky-400/48 hover:ring-sky-400/26 hover:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.5),0_0_52px_-10px_rgba(56,189,248,0.22)] active:translate-y-[0.5px] active:brightness-[1.025] motion-reduce:transition-none motion-reduce:hover:translate-y-0 touch-manipulation sm:min-h-[13rem] sm:rounded-[17px]"
                  >
                    <div className="relative h-[7.25rem] w-full shrink-0 overflow-hidden bg-[#020617] sm:h-auto sm:aspect-[5/4]">
                      <span className="absolute left-2 top-2 z-[2] rounded-md border border-white/[0.14] bg-[#030a14]/88 px-1.5 py-0.5 text-[10px] font-bold tabular-nums tracking-tight text-sky-100/95 shadow-sm backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2 sm:py-0.5 sm:text-[11px]">
                        {String(slideIdx + 1).padStart(2, "0")}
                      </span>
                      <Image
                        src={slide.src}
                        alt=""
                        fill
                        className="object-cover object-center opacity-[0.9] saturate-[0.92] brightness-[1.03] contrast-[1.02] transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:saturate-100 sm:brightness-[1.04]"
                        sizes="(max-width:640px) 42vw,(max-width:1024px) 22vw, 240px"
                        quality={92}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/94 via-[#020617]/42 to-[#0a1624]/55" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_76%_-8%,rgba(56,189,248,0.11),transparent_55%),radial-gradient(ellipse_70%_55%_at_14%_88%,rgba(139,92,246,0.09),transparent_54%)]" />
                      <span className="absolute bottom-1.5 left-2 right-2 inline-flex items-center gap-1 text-[9px] font-medium tracking-[0.08em] text-sky-200/88 sm:bottom-2 sm:left-2.5 sm:text-[10px]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-90" aria-hidden>
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t("preview.guide.tapDetail")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2 max-lg:min-h-0 sm:px-3.5 sm:pb-3.5 sm:pt-3">
                      <span className="line-clamp-2 text-[0.8rem] font-semibold leading-snug text-slate-50 sm:text-[0.92rem]">
                        {t(SENSORA_CONCEPT_TIP_SHORT_KEYS[slideIdx])}
                      </span>
                      <span className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-400 sm:mt-1.5 sm:line-clamp-3 sm:text-[11px] sm:leading-relaxed sm:text-xs">
                        {t(slide.descKey)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-slate-500">
                <button
                  type="button"
                  className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 font-semibold text-slate-300 transition hover:border-sky-400/35 hover:text-slate-50"
                  onClick={() => openLandingGuideDetail(DEFAULT_GUIDE_ID)}
                >
                  {t("crm.guideTip.openViewer")}
                </button>
                <span className="text-slate-600">·</span>
                <span>{t("preview.toc.disclaimer1")}</span>
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-end justify-between gap-3 border-b border-white/[0.09] pb-2 sm:pb-3">
              <div>
                <h2 className="text-[clamp(1.06rem,min(4vw+0.5rem,1.58rem),1.58rem)] font-semibold tracking-[-0.028em] text-slate-50">{t("landing.showroom.flow.title")}</h2>
                <p className="mt-1 max-w-[52ch] text-xs leading-relaxed text-slate-500 max-lg:line-clamp-2 sm:mt-1.5 sm:text-sm sm:leading-relaxed sm:text-[0.875rem] lg:line-clamp-none">{t("landing.showroom.flow.desc")}</p>
              </div>
            </div>
            <div className="landing-flow-process relative mt-4 sm:mt-6">
              <div className="relative z-[1] mt-1 grid grid-cols-2 gap-2 sm:gap-2.5 lg:hidden">
                {flowSteps.map((step, idx) => (
                  <div
                    key={`flow-m-${step.titleKey}`}
                    className="landing-flow-strip-card landing-showcase-flow-step group relative flex min-h-0 flex-col overflow-hidden rounded-[13px] border border-white/[0.17] bg-gradient-to-br from-white/[0.07] via-[#050d18]/96 to-[#020617]/94 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_36px_-14px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-sky-400/10"
                  >
                    <div className="relative h-[6.5rem] w-full shrink-0 overflow-hidden border-b border-white/[0.08]">
                      <Image
                        src={FLOW_STEP_ART[idx]}
                        alt=""
                        fill
                        className="object-cover object-center opacity-[0.9] saturate-[0.9] brightness-[1.03]"
                        sizes="(max-width:1024px) 46vw, 200px"
                        quality={92}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/92 via-transparent to-transparent" aria-hidden />
                      <span className="absolute left-2 top-2 flex size-8 items-center justify-center rounded-md border border-sky-400/35 bg-[#07111f]/82 text-sky-50 shadow-sm backdrop-blur-sm">
                        <step.Icon className="size-[16px]" />
                      </span>
                      <span className="absolute right-2 top-2 rounded border border-white/[0.12] bg-[#030a14]/85 px-1 py-0.5 text-[9px] font-bold tabular-nums text-slate-300">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2.5 pt-2">
                      <p className="text-[12px] font-semibold leading-snug text-slate-50">{t(step.titleKey)}</p>
                      <p className="mt-1 line-clamp-3 text-[10px] leading-[1.42] text-slate-400">{t(step.bodyKey)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="pointer-events-none absolute left-[5%] right-[5%] top-[41px] z-0 hidden h-px bg-gradient-to-r from-transparent via-sky-400/52 to-transparent shadow-[0_0_26px_-2px_rgba(56,189,248,0.42),0_0_48px_-4px_rgba(129,140,248,0.14)] lg:block"
                aria-hidden
              />
              <ol className="m-0 hidden list-none flex-col gap-2 p-0 sm:gap-4 lg:flex lg:flex-row lg:items-stretch lg:gap-0">
                {flowSteps.map((step, idx) => (
                  <Fragment key={step.titleKey}>
                    {idx > 0 ? (
                      <>
                        <li className="relative hidden w-6 shrink-0 items-center justify-center lg:flex" aria-hidden>
                          <span className="absolute left-1/2 top-[40px] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-sky-400/35 bg-[radial-gradient(circle,rgba(56,189,248,0.45),rgba(139,92,246,0.12))] shadow-[0_0_16px_-1px_rgba(56,189,248,0.62)] ring-2 ring-sky-400/15" />
                          <span className="mt-[2.125rem] h-[2px] w-full min-w-[0.5rem] rounded-full bg-gradient-to-r from-sky-400/42 via-indigo-400/32 to-violet-400/38 shadow-[0_0_22px_-2px_rgba(56,189,248,0.28)]" />
                        </li>
                      </>
                    ) : null}
                    <li className="relative z-[1] min-w-0 flex-1">
                      <div className="landing-flow-strip-card landing-showcase-flow-step group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-white/[0.19] bg-gradient-to-br from-white/[0.08] via-[#050d18]/96 to-[#020617]/94 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_16px_44px_-18px_rgba(0,0,0,0.52),0_0_48px_-22px_rgba(56,189,248,0.1)] ring-1 ring-inset ring-sky-400/12 backdrop-blur-sm motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-[220ms] hover:-translate-y-1 hover:border-sky-400/42 hover:shadow-[0_24px_56px_-18px_rgba(0,0,0,0.56),0_0_54px_-12px_rgba(56,189,248,0.18)] sm:min-h-[12rem] sm:rounded-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                        <div className="relative h-[7.75rem] w-full shrink-0 overflow-hidden border-b border-white/[0.08] sm:h-[7.75rem]">
                          <Image
                            src={FLOW_STEP_ART[idx]}
                            alt=""
                            fill
                            className="object-cover object-center opacity-[0.9] saturate-[0.9] brightness-[1.03] transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:saturate-100"
                            sizes="(max-width:1024px) 46vw, 200px"
                            quality={92}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/94 via-transparent to-transparent" aria-hidden />
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_82%_0%,rgba(56,189,248,0.14),transparent_60%),radial-gradient(ellipse_70%_55%_at_12%_96%,rgba(139,92,246,0.1),transparent_55%),radial-gradient(ellipse_90%_50%_at_50%_-10%,rgba(56,189,248,0.06),transparent_50%)]" aria-hidden />
                          <span className="absolute left-2.5 top-2.5 flex size-9 items-center justify-center rounded-lg border border-sky-400/38 bg-[#07111f]/78 text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_26px_-6px_rgba(56,189,248,0.25)] backdrop-blur-md ring-1 ring-white/[0.1] sm:left-3.5 sm:top-3.5 sm:size-11 sm:rounded-xl">
                            <step.Icon className="size-[18px] sm:size-[22px]" />
                          </span>
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-[1.18rem] sm:pb-[1.15rem] sm:pt-3.5">
                          <p className="text-[13px] font-semibold leading-snug text-slate-50 sm:text-[15px]">{t(step.titleKey)}</p>
                          <p className="mt-1.5 line-clamp-3 text-[10.5px] leading-[1.45] text-slate-400 sm:mt-2 sm:line-clamp-4 sm:text-[12.65px] sm:leading-[1.52]">{t(step.bodyKey)}</p>
                        </div>
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
