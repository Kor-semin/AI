"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CRM_SECTION_MOBILE_SUBTITLE_KEYS, type CrmSection } from "@/app/crm/crmSectionTypes";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraGuideImageViewer } from "@/app/components/concierge/SensoraGuideImageViewer";
import { SENSORA_GUIDE_IMAGES, SENSORA_TIP_CARD_INITIAL_INDEX } from "@/app/components/concierge/sensoraGuideImages";

const JOIN_PATH = "/join" as const;

const HERO_MOCK_SIDEBAR: readonly CrmSection[] = ["dashboard", "customers", "ai", "followup"];

const heroPreviewShell =
  "landing-showcase-mock-frame relative overflow-hidden rounded-[22px] border border-white/[0.15] bg-gradient-to-b from-slate-950/92 to-[#030b14]/96 shadow-[0_32px_88px_-30px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.055)_inset,0_0_72px_-28px_rgba(56,189,248,0.07),0_0_88px_-40px_rgba(139,92,246,0.05)] ring-1 ring-inset ring-white/[0.08] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent sm:rounded-[26px] lg:rounded-[28px]";

const heroJoinPrimary =
  "landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-[50px] w-full min-w-0 shrink-0 items-center justify-center rounded-2xl px-7 py-3.5 text-[15px] font-semibold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_14px_40px_-12px_rgba(56,189,248,0.2)] transition-[transform,filter] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b14] sm:w-auto sm:min-h-[52px] sm:px-8 touch-manipulation motion-reduce:active:scale-100";

const heroGhostDark =
  "landing-showroom-cta-preview inline-flex min-h-[50px] w-full min-w-0 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/[0.22] bg-white/[0.08] px-6 py-3.5 text-[15px] font-semibold tracking-tight text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-inset ring-white/[0.1] backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-200 hover:border-sky-300/44 hover:bg-white/[0.12] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/42 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b14] sm:w-auto sm:min-h-[52px] touch-manipulation motion-reduce:active:scale-100";

const tipCompactCard =
  "landing-showcase-tip-card group flex min-h-[6.75rem] w-full cursor-pointer touch-manipulation flex-col rounded-[15px] border border-white/[0.14] bg-gradient-to-b from-slate-900/65 to-[#07111f]/78 p-3 text-left shadow-[0_10px_36px_-14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-inset ring-white/[0.05] backdrop-blur-md transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-sky-400/35 hover:shadow-[0_16px_44px_-16px_rgba(0,0,0,0.58),0_0_40px_-12px_rgba(56,189,248,0.1)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020817] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[7.25rem] sm:rounded-[17px] sm:p-3.5 lg:min-h-[7.4rem]";

const flowStepCard =
  "landing-showcase-flow-step flex min-h-[5.5rem] flex-1 flex-col rounded-[14px] border border-white/[0.11] bg-gradient-to-br from-white/[0.06] to-transparent px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-[border-color,transform,box-shadow] duration-200 hover:border-sky-400/28 hover:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.5)] sm:min-h-[6rem] sm:rounded-2xl sm:px-4 sm:py-3.5";

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

  const rows = useMemo(
    () =>
      [
        { titleKey: "landing.showroom.heroDash.todayTitle" as const, bodyKey: "landing.showroom.heroDash.todaySnippet" as const },
        { titleKey: "landing.showroom.heroDash.priorityTitle" as const, bodyKey: "landing.showroom.heroDash.prioritySnippet" as const },
        { titleKey: "landing.showroom.heroDash.followupTitle" as const, bodyKey: "landing.showroom.heroDash.followupSnippet" as const },
        {
          titleKey: "landing.showroom.heroDash.aiDraftTitle" as const,
          bodyKey: "landing.showroom.heroDash.aiDraftSnippet" as const,
          highlight: true as const,
        },
        { titleKey: "landing.showroom.heroDash.summaryTitle" as const, bodyKey: "landing.showroom.heroDash.summarySnippet" as const },
      ] as const,
    [],
  );

  const metricSnippet = rows.slice(0, 2);
  const feedRows = rows.slice(2);

  return (
    <div
      className={`${heroPreviewShell} mx-auto w-full max-w-[calc(100vw-28px)] sm:max-w-[min(100%,32rem)] lg:mx-0 lg:max-w-none`}
    >
      <div className="relative flex items-center gap-2.5 border-b border-white/[0.12] bg-gradient-to-b from-[#070f1e]/96 to-[#050c18]/94 px-3 py-2.5 sm:gap-3 sm:px-[1.125rem] sm:py-[0.7rem]">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-[7px] rounded-full bg-rose-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] sm:size-2" />
          <span className="size-[7px] rounded-full bg-amber-400/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:size-2" />
          <span className="size-[7px] rounded-full bg-emerald-400/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] sm:size-2" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="size-[6px] shrink-0 rounded-full bg-emerald-400/80 ring-2 ring-emerald-400/20 shadow-[0_0_10px_-2px_rgba(52,211,153,0.35)]" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-left text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-300 sm:text-[11px]">
            {t("product.name")}
          </p>
        </div>
        <span className="hidden shrink-0 rounded-md border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:inline">
          preview
        </span>
      </div>

      <div className="flex min-h-0 flex-col sm:min-h-[268px] sm:flex-row md:min-h-[288px] lg:min-h-[308px]">
        <div
          className="flex shrink-0 flex-row gap-0 overflow-x-auto overflow-y-hidden border-b border-white/[0.1] bg-[#030910]/96 [scrollbar-width:none] sm:w-[9rem] sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:border-white/[0.1] [&::-webkit-scrollbar]:hidden"
          aria-hidden
        >
          {HERO_MOCK_SIDEBAR.map((section) => {
            const active = section === "dashboard";
            const key = CRM_SECTION_MOBILE_SUBTITLE_KEYS[section];
            return (
              <div
                key={section}
                className={[
                  "flex min-w-[5.25rem] shrink-0 items-center gap-2 border-white/[0.06] px-2.5 py-2 sm:min-w-0 sm:flex-initial sm:border-b sm:border-l-2 sm:px-2.5 sm:py-2",
                  active ?
                    "border-b-2 border-b-sky-400/75 bg-gradient-to-t from-sky-500/[0.12] to-transparent sm:border-b-0 sm:border-l-sky-400/80 sm:bg-gradient-to-r"
                  : "border-b-2 border-b-transparent opacity-95 sm:border-l-transparent",
                ].join(" ")}
              >
                <span className={[ "size-[6px] shrink-0 rounded-full sm:size-1.5", active ? "bg-sky-400 shadow-[0_0_10px_-1px_rgba(56,189,248,0.45)]" : "bg-white/20" ].join(" ")} />
                <span className="truncate text-[10px] font-bold leading-tight text-slate-200 sm:text-[11px]">{t(key)}</span>
              </div>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-[#020817]/96 via-[#040d18]/95 to-[#051018]/92">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.08] px-2.5 py-2 sm:gap-2 sm:px-3 sm:py-2.5" aria-hidden>
            <div className="relative min-h-[32px] min-w-0 flex-1 rounded-[10px] border border-white/[0.1] bg-black/28 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <span className="text-[10px] text-slate-500">{t("common.search")}</span>
              <span className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/[0.1] px-1 py-px text-[9px] text-slate-500 sm:inline">
                ⌘K
              </span>
            </div>
            <span className="rounded-[10px] border border-violet-400/22 bg-violet-500/[0.09] px-2 py-1.5 text-[9px] font-semibold uppercase text-violet-100/92 sm:text-[10px]">
              Tip
            </span>
            <span className="rounded-[10px] border border-sky-400/28 bg-gradient-to-b from-[#27364b] to-[#0f172a] px-2 py-1.5 text-[10px] font-semibold text-slate-50 ring-1 ring-sky-400/25">
              + {t("crm.addCustomer")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 px-2.5 pt-2 sm:gap-2.5 sm:px-3 sm:pt-2.5" aria-hidden>
            {metricSnippet.map(({ titleKey, bodyKey }) => (
              <div
                key={titleKey}
                className="rounded-[11px] border border-white/[0.1] bg-gradient-to-br from-white/[0.05] to-transparent px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-xl sm:px-2.5 sm:py-2"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[10px]">{t(titleKey)}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-slate-50 sm:text-[12px]">{t(bodyKey)}</p>
              </div>
            ))}
          </div>

          <div className="min-h-[6rem] flex-1 space-y-0.5 overflow-hidden px-2 pb-2 pt-1.5 max-[389px]:min-h-[5.5rem] sm:min-h-[7rem] sm:space-y-1 sm:px-2.5 sm:pb-3 sm:pt-2">
            {feedRows.map(({ titleKey, bodyKey, ...rest }) => (
              <div
                key={titleKey}
                className={[
                  "rounded-[11px] border px-2 py-1.5 transition-[border-color,background-color] duration-200 sm:rounded-xl sm:px-2.5 sm:py-2 border-transparent hover:border-white/[0.07] hover:bg-white/[0.03]",
                  "highlight" in rest && rest.highlight ?
                    "border-sky-400/25 bg-gradient-to-r from-sky-500/[0.1] via-violet-500/[0.04] to-transparent"
                  : "",
                ].join(" ")}
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.09em] text-slate-500 sm:text-[10px]">{t(titleKey)}</p>
                <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-snug text-slate-50 sm:text-[13px] sm:leading-[1.52]">{t(bodyKey)}</p>
              </div>
            ))}
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
        { titleKey: "landing.showroom.flow.mock.contactTitle" as const },
        { titleKey: "landing.showroom.flow.mock.needsTitle" as const },
        { titleKey: "landing.showroom.flow.mock.smsTitle" as const },
        { titleKey: "landing.showroom.flow.mock.followupTitle" as const },
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

      <section className="landing-showcase-hero relative mx-auto w-full max-w-[1380px] px-[max(1rem,calc(env(safe-area-inset-left,0px)+12px))] pb-7 pr-[max(1rem,calc(env(safe-area-inset-right,0px)+12px))] pt-1 sm:px-5 sm:pb-9 sm:pt-3 md:px-6 lg:px-8 lg:pb-10 lg:pt-6 xl:pt-7">
        {/* 글로우: 상단 빈 공간이 아니라 카피·목업 주변에만 은은히 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[clamp(3rem,14vw,5.75rem)] h-[min(56vh,500px)] w-[min(104%,1180px)] max-w-none -translate-x-1/2 rounded-[48px] bg-[radial-gradient(ellipse_68%_52%_at_42%_44%,rgba(56,189,248,0.07),transparent_62%),radial-gradient(ellipse_52%_44%_at_78%_40%,rgba(139,92,246,0.052),transparent_58%)] opacity-[0.92] lg:h-[min(50vh,520px)]"
        />

        <div className="relative z-[1] flex flex-col gap-5 sm:gap-6 lg:gap-7">
          <div className="grid items-start gap-6 sm:gap-7 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.06fr)] lg:items-start lg:gap-x-10 lg:gap-y-8 xl:gap-x-12">
            <div className="landing-showcase-copy-col order-1 min-w-0 max-w-xl lg:max-w-none">
              <span className="inline-flex rounded-full border border-white/[0.14] bg-white/[0.06] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-200 backdrop-blur-sm sm:text-[12px]">
                {t("landing.showroom.hero.kickerBadge")}
              </span>
              <h1 className="mt-3 whitespace-pre-line text-balance text-[clamp(1.45rem,3.95vw,2.75rem)] font-semibold leading-[1.13] tracking-[-0.032em] text-white sm:mt-4 lg:mt-3 xl:text-[clamp(1.6rem,3.25vw,2.85rem)]">
                {t("landing.showroom.hero.headline")}
              </h1>
              <p className="mt-3 max-w-[42rem] whitespace-pre-line text-[15px] leading-[1.6] text-slate-300 sm:mt-4 sm:text-[16px] sm:leading-[1.58]">
                {t("landing.showroom.hero.sub")}
              </p>
              <div className="mt-7 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link href={JOIN_PATH} prefetch={false} className={`${heroJoinPrimary} justify-center sm:min-w-[12.5rem]`}>
                  {t("cta.joinBeta")}
                </Link>
                <button type="button" onClick={onOpenAppWorkspace} className={`${heroGhostDark} justify-center sm:min-w-[12rem]`}>
                  <IconAppWindowPlay className="size-[1.125rem] shrink-0 opacity-95" />
                  {t("cta.tryAppExperience")}
                </button>
              </div>
            </div>

            <div className="landing-showcase-mock-col order-2 relative mx-auto w-full max-w-[min(100%,24rem)] min-[400px]:max-w-[min(100%,30rem)] lg:mx-0 lg:max-w-none">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-3 rounded-[34px] bg-[radial-gradient(ellipse_90%_72%_at_52%_48%,rgba(56,189,248,0.13),transparent_64%),radial-gradient(ellipse_68%_56%_at_82%_30%,rgba(139,92,246,0.09),transparent_58%)] opacity-[0.98] blur-2xl sm:-inset-5 lg:-inset-6"
              />
              <HeroDashboardPreview />
            </div>
          </div>

          <div className="landing-showcase-lower relative z-[1] flex flex-col gap-5 border-t border-white/[0.08] pt-5 sm:gap-6 sm:pt-6 lg:gap-7 lg:pt-7">
            <div className="min-w-0">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <h2 className="text-[clamp(1.15rem,2.5vw,1.55rem)] font-semibold tracking-[-0.025em] text-slate-50">{t("landing.showroom.tip.title")}</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4 lg:gap-3">
                {tipCards.map(({ n, titleKey, descKey, Icon }) => (
                  <button
                    key={titleKey}
                    type="button"
                    className={tipCompactCard}
                    onClick={() =>
                      setViewer({ open: true, title: t(titleKey), initialSlideIndex: SENSORA_TIP_CARD_INITIAL_INDEX[n] })
                    }
                  >
                    <span className="flex size-[2.375rem] items-center justify-center rounded-xl border border-white/[0.15] bg-gradient-to-br from-sky-400/22 to-violet-500/15 text-sky-50 shadow-inner sm:size-10">
                      <Icon className="size-[18px] opacity-95" />
                    </span>
                    <span className="mt-3 text-[11px] font-bold tabular-nums text-sky-400/85">0{n}</span>
                    <span className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-slate-50 sm:text-[14px]">{t(titleKey)}</span>
                    <span className="mt-2 line-clamp-2 flex-1 text-[11px] leading-relaxed text-slate-500 sm:text-[12px]">{t(descKey)}</span>
                    <span className="mt-auto pt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sky-400/75 group-hover:text-sky-300/95">
                      {t("landing.showroom.tip.guideWord")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <h2 className="text-[clamp(1.15rem,2.5vw,1.55rem)] font-semibold tracking-[-0.025em] text-slate-50">{t("landing.showroom.flow.title")}</h2>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 lg:gap-2.5 [&::-webkit-scrollbar]:h-1">
                {flowSteps.map((step, idx) => (
                  <div key={step.titleKey} className={`${flowStepCard} min-w-[calc(46%-8px)] shrink-0 sm:min-w-0`}>
                    <span className="inline-flex size-7 items-center justify-center rounded-full border border-white/[0.12] bg-slate-950/70 text-[11px] font-bold text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-2 ring-sky-400/12">
                      {idx + 1}
                    </span>
                    <p className="mt-2 text-[13px] font-semibold leading-snug text-slate-100 sm:text-[14px]">{t(step.titleKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
