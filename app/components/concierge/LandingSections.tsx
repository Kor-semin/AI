"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CRM_SECTION_MOBILE_SUBTITLE_KEYS, type CrmSection } from "@/app/crm/crmSectionTypes";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { ImageSlot } from "@/app/components/concierge/ImageSlot";
import { SensoraGuideImageViewer } from "@/app/components/concierge/SensoraGuideImageViewer";
import {
  SENSORA_GUIDE_IMAGES,
  SENSORA_TIP_CARD_INITIAL_INDEX,
} from "@/app/components/concierge/sensoraGuideImages";

export {
  SENSORA_GUIDE_IMAGES,
  SENSORA_TIP_CARD_INITIAL_INDEX,
  sensoraGuideImageSources,
} from "@/app/components/concierge/sensoraGuideImages";

const JOIN_PATH = "/join" as const;

/** 랜딩 보조 이미지 — 에셋 교체 시 여기만 수정 */
export const LANDING_SHOWROOM_IMAGE_PATHS = {
  hero: "/images/hero-classic-car.jpg",
  interior: "/images/vintage-car-interior.jpg",
  desk: "/images/concierge-desk.jpg",
  workspace: "/images/sales-dashboard-workspace.jpg",
} as const;

const cardChrome =
  "rounded-[26px] border border-white/[0.11] bg-slate-900/47 shadow-[0_22px_58px_-28px_rgba(0,0,0,0.58),0_2px_12px_rgba(15,23,42,0.38)] backdrop-blur-md ring-1 ring-inset ring-white/[0.04] transition-[border-color,box-shadow,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] hover:-translate-y-[1px] hover:border-white/[0.16] hover:shadow-[0_28px_64px_-26px_rgba(0,0,0,0.6),0_0_48px_-14px_rgba(56,189,248,0.075)] motion-reduce:transform-none motion-reduce:transition-none active:translate-y-0 active:scale-[0.997]";

const primaryBtn =
  "landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-[46px] items-center justify-center rounded-xl px-8 py-[0.7rem] text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_-10px_rgba(56,189,248,0.2)] touch-manipulation";

const ghostBtn =
  "landing-showroom-cta-preview inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/[0.22] bg-white/[0.075] px-7 py-[0.7rem] text-sm font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] hover:border-sky-300/42 hover:bg-white/[0.11] hover:shadow-[0_0_36px_-10px_rgba(56,189,248,0.16)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/42 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020817] touch-manipulation motion-reduce:transition-none";

/** 베타 신청 — 프리미엄 primary(luminous blue·은은한 바이올렛 는 전역 클래스에서) */
const heroJoinPrimary =
  "landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-[50px] min-w-[12.25rem] w-full shrink-0 items-center justify-center rounded-2xl px-8 py-3.5 text-[15px] font-semibold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_40px_-12px_rgba(56,189,248,0.22),0_8px_28px_-14px_rgba(139,92,246,0.08)] sm:w-auto sm:min-h-[52px] sm:min-w-[13rem] sm:py-[1.125rem] sm:text-[16px] lg:min-h-[54px] lg:px-11 lg:text-[17px]";

const heroGhostDark =
  "landing-showroom-cta-preview inline-flex min-h-[50px] min-w-[12.25rem] w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/[0.22] bg-white/[0.08] px-7 py-3.5 text-[15px] font-semibold tracking-tight text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-inset ring-white/[0.11] backdrop-blur-md transition-[border-color,background-color,box-shadow,color,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] hover:border-sky-300/46 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_38px_-8px_rgba(56,189,248,0.18),0_0_52px_-16px_rgba(139,92,246,0.09)] active:translate-y-0 active:scale-[0.986] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/48 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1628] sm:w-auto sm:min-h-[52px] sm:min-w-[12.75rem] sm:py-[1.125rem] sm:text-[16px] lg:min-h-[54px] lg:px-11 lg:text-[17px] motion-reduce:transition-none";

const heroPreviewShell =
  "landing-showroom-mock-frame relative overflow-hidden rounded-[30px] border border-white/[0.17] bg-gradient-to-b from-slate-950/88 to-[#030b14]/96 shadow-[0_36px_96px_-32px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.055)_inset,0_0_80px_-28px_rgba(56,189,248,0.078),0_0_96px_-40px_rgba(139,92,246,0.055)] ring-1 ring-inset ring-white/[0.08] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/22 before:to-transparent sm:rounded-[34px] lg:rounded-[36px]";

const tipCardBase =
  "landing-tip-card-shell group relative flex min-h-[256px] w-full cursor-pointer touch-manipulation flex-col rounded-[22px] border border-white/[0.19] bg-gradient-to-b from-slate-900/72 to-[#07111f]/88 p-5 text-left shadow-[0_8px_40px_-14px_rgba(0,0,0,0.55),0_0_0_1px_rgba(56,189,248,0.035)_inset] ring-1 ring-inset ring-white/[0.065] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-[260ms] ease-[cubic-bezier(0.22,1,0.32,1)] motion-reduce:transition-none hover:-translate-y-[3px] hover:border-sky-400/46 hover:border-violet-400/22 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.065),0_0_56px_-10px_rgba(56,189,248,0.125),0_0_64px_-22px_rgba(139,92,246,0.09),0_28px_64px_-26px_rgba(0,0,0,0.6)] active:scale-[0.987] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020817] sm:min-h-[296px] sm:p-6 motion-reduce:hover:translate-y-0";

/** 스크롤 진입 리빌 — reduced-motion에서는 즉시 표시 · 모바일은 짧은 이동량 */
function useShowroomReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealed(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setRevealed(true);
          io.disconnect();
          break;
        }
      },
      { threshold: 0.065, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, revealed };
}

function RevealSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, revealed } = useShowroomReveal();
  const interact = revealed ? "pointer-events-auto" : "pointer-events-none";
  const innerStyles = revealed
    ? "translate-y-0 opacity-100 transition-[opacity,transform] duration-[520ms] sm:duration-[800ms]"
    : "opacity-0 max-sm:translate-y-3 sm:translate-y-[10px] transition-[opacity,transform] duration-[520ms] sm:duration-[800ms]";

  return (
    <section id={id} ref={ref} className={className}>
      <div
        className={[
          "ease-[cubic-bezier(0.22,1,0.32,1)] will-change-[opacity,transform] motion-reduce:pointer-events-auto motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
          interact,
          innerStyles,
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}

const HERO_MOCK_SIDEBAR: readonly CrmSection[] = ["dashboard", "customers", "ai", "followup"];

function IconAppWindowPlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.75 11.08V9.92c0-.6.323-1.15.839-1.424l5.62-3.068a1.583 1.583 0 012.541 1.424v8.088a1.584 1.584 0 01-2.541 1.424l-5.62-3.069a1.583 1.583 0 01-.839-1.423z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M13.917 17.25H6.083A3.083 3.083 0 013 14.167V7.917C3 6.266 4.516 5 6.083 5h7.834C15.734 5 17 6.516 17 8.083v6c0 1.734-1.516 3.167-3.083 3.167z"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
}

function HeroDashboardPreview() {
  const { t } = useLanguage();

  const rows = [
    { titleKey: "landing.showroom.heroDash.todayTitle" as const, bodyKey: "landing.showroom.heroDash.todaySnippet" as const },
    { titleKey: "landing.showroom.heroDash.priorityTitle" as const, bodyKey: "landing.showroom.heroDash.prioritySnippet" as const },
    { titleKey: "landing.showroom.heroDash.followupTitle" as const, bodyKey: "landing.showroom.heroDash.followupSnippet" as const },
    {
      titleKey: "landing.showroom.heroDash.aiDraftTitle" as const,
      bodyKey: "landing.showroom.heroDash.aiDraftSnippet" as const,
      highlight: true as const,
    },
    { titleKey: "landing.showroom.heroDash.summaryTitle" as const, bodyKey: "landing.showroom.heroDash.summarySnippet" as const },
  ];

  const metricSnippet = rows.slice(0, 2);
  const feedRows = rows.slice(2);

  return (
    <div className={`${heroPreviewShell} z-[3] w-full max-w-[680px] lg:mx-0 lg:max-w-none`}>
      <div className="relative flex items-center gap-3 border-b border-white/[0.14] bg-gradient-to-b from-[#070f1e]/96 to-[#050c18]/94 px-4 py-3 sm:px-6 sm:py-3.5 lg:py-4">
        <div className="flex gap-1.5 sm:gap-2" aria-hidden>
          <span className="size-2 rounded-full bg-rose-400/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
          <span className="size-2 rounded-full bg-amber-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]" />
          <span className="size-2 rounded-full bg-emerald-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="size-[7px] shrink-0 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)] ring-2 ring-emerald-400/20 motion-reduce:animate-none"
            aria-hidden
          />
          <p className="min-w-0 flex-1 truncate text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300 sm:text-[11px]">
            {t("product.name")}
          </p>
        </div>
        <span
          className="hidden shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:inline"
          aria-hidden
        >
          preview
        </span>
      </div>

      <div className="flex min-h-0 flex-col sm:min-h-[300px] sm:flex-row lg:min-h-[320px]">
        {/* Mini sidebar */}
        <div
          className="flex shrink-0 flex-row gap-0 overflow-x-auto overflow-y-hidden border-b border-white/[0.1] bg-[#030910]/95 [scrollbar-width:none] sm:w-[8.75rem] sm:flex-col sm:overflow-x-visible sm:overflow-y-visible sm:border-b-0 sm:border-r sm:border-white/[0.1] [&::-webkit-scrollbar]:hidden"
          aria-hidden
        >
          {HERO_MOCK_SIDEBAR.map((section) => {
            const active = section === "dashboard";
            const key = CRM_SECTION_MOBILE_SUBTITLE_KEYS[section];
            return (
              <div
                key={section}
                className={[
                  "flex min-w-[5.5rem] shrink-0 items-center gap-2 border-white/[0.06] px-3 py-2 sm:min-w-0 sm:border-b sm:border-l-2 sm:py-2.5",
                  active
                    ? "border-b-2 border-b-sky-400/80 bg-gradient-to-t from-sky-500/[0.12] to-transparent sm:border-b-0 sm:border-l-sky-400/85 sm:bg-gradient-to-r"
                    : "border-b-2 border-b-transparent sm:border-l-transparent sm:hover:bg-white/[0.035]",
                ].join(" ")}
              >
                <span
                  className={[
                    "size-2 shrink-0 rounded-full ring-2 ring-black/35",
                    active ? "bg-sky-400 shadow-[0_0_14px_-1px_rgba(56,189,248,0.55)]" : "bg-white/18",
                  ].join(" ")}
                />
                <span className="truncate text-[10px] font-bold leading-tight text-slate-200 sm:text-[11px]">{t(key)}</span>
              </div>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-[#020817]/95 via-[#040d18]/95 to-[#051018]/93">
          {/* App toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] px-3 py-2.5 sm:px-4" aria-hidden>
            <div className="relative min-h-[32px] min-w-[8rem] flex-1 rounded-[10px] border border-white/[0.1] bg-black/25 px-3 py-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-sm">
              <span className="text-[10px] text-slate-500">{t("common.search")}</span>
              <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 sm:inline">
                ⌘K
              </span>
            </div>
            <span className="rounded-[10px] border border-violet-400/25 bg-violet-500/[0.1] px-2.5 py-1.5 text-[10px] font-semibold text-violet-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              Sensora <span className="text-[9px] font-bold tracking-wide text-violet-200/80">TIP</span>
            </span>
            <span className="rounded-[10px] border border-sky-400/32 bg-gradient-to-b from-[#27364b] to-[#0f172a] px-2.5 py-1.5 text-[10px] font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-sky-400/28">
              + {t("crm.addCustomer")}
            </span>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-2 gap-2 px-3 pt-2.5 sm:gap-2.5 sm:px-4 sm:pt-3" aria-hidden>
            {metricSnippet.map(({ titleKey, bodyKey }) => (
              <div
                key={titleKey}
                className="rounded-xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] to-transparent px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm sm:rounded-[13px] sm:px-3 sm:py-2.5"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">{t(titleKey)}</p>
                <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-snug text-slate-50 sm:text-[12px]">{t(bodyKey)}</p>
              </div>
            ))}
          </div>

          {/* Feed rows */}
          <div className="flex-1 space-y-0.5 overflow-hidden px-2 pb-2 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2">
            {feedRows.map(({ titleKey, bodyKey, ...rest }) => (
              <div
                key={titleKey}
                className={[
                  "motion-safe:transition-[background-color,border-color,transform] rounded-xl border px-2 py-2 duration-[220ms] ease-out motion-reduce:transition-none sm:px-2.5 sm:py-2.5 border-transparent hover:border-white/[0.07] hover:bg-white/[0.03]",
                  "highlight" in rest && rest.highlight
                    ? "border-sky-400/28 bg-gradient-to-r from-sky-500/[0.12] via-violet-500/[0.05] to-transparent shadow-[inset_0_0_0_1px_rgba(56,189,248,0.08),0_14px_40px_-26px_rgba(0,0,0,0.45)] hover:border-sky-400/35 hover:-translate-y-px hover:bg-white/[0.035] motion-reduce:hover:translate-y-0 sm:rounded-[13px]"
                    : "",
                ].join(" ")}
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.09em] text-slate-500 sm:text-[10px]">{t(titleKey)}</p>
                <p className="mt-1 text-[12px] font-medium leading-[1.5] text-slate-50 sm:text-[13px] sm:leading-[1.53]">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconTipStart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3L4 8v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V8l-8-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconTipGrid({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h7V4H4v3zm0 6h7v-3H4v3zm0 6h7v-3H4v3zm9-12h7V4h-7v3zm0 6h7v-3h-7v3zm0 6h7v-3h-7v3z" fill="currentColor" opacity=".9" />
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
      <path
        d="M7 18h10M9 14h6M7 6h10v6H7V6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="9" r=".9" fill="currentColor" />
    </svg>
  );
}

const GUIDE_VIEWER_IMAGES = SENSORA_GUIDE_IMAGES.map((s) => ({ src: s.src }));

const GUIDE_SLIDE_TITLE_KEYS = SENSORA_GUIDE_IMAGES.map((s) => s.titleKey);

function SensoraTipSectionInner() {
  const { t } = useLanguage();
  const [viewer, setViewer] = useState<{
    open: boolean;
    title: string;
    initialSlideIndex: number;
  }>(() => ({
    open: false,
    title: "",
    initialSlideIndex: 0,
  }));

  const cards = [
    {
      n: 1 as const,
      titleKey: "landing.showroom.tip.card1.title" as const,
      descKey: "landing.showroom.tip.card1.desc" as const,
      Icon: IconTipStart,
    },
    {
      n: 2 as const,
      titleKey: "landing.showroom.tip.card2.title" as const,
      descKey: "landing.showroom.tip.card2.desc" as const,
      Icon: IconTipGrid,
    },
    {
      n: 3 as const,
      titleKey: "landing.showroom.tip.card3.title" as const,
      descKey: "landing.showroom.tip.card3.desc" as const,
      Icon: IconTipFlow,
    },
    {
      n: 4 as const,
      titleKey: "landing.showroom.tip.card4.title" as const,
      descKey: "landing.showroom.tip.card4.desc" as const,
      Icon: IconTipBeta,
    },
  ] as const;

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
      <div className="landing-showroom-premium-rule mx-auto mb-8 max-sm:mb-6 sm:mb-10 pointer-events-none" aria-hidden />
      <div className="relative mx-auto max-w-[1080px] px-5 pb-6 pt-2 sm:px-6 sm:pb-14 sm:pt-6">
        <div className="pointer-events-none absolute inset-x-[-24%] top-[-44%] h-[82%] bg-[radial-gradient(ellipse_72%_52%_at_48%_-2%,rgba(99,102,241,0.14),transparent_70%),radial-gradient(ellipse_58%_44%_at_82%_18%,rgba(56,189,248,0.09),transparent_58%),radial-gradient(ellipse_48%_36%_at_18%_28%,rgba(56,189,248,0.055),transparent_55%)] opacity-[0.98]" />

        <div className="relative mx-auto max-w-[720px] text-center lg:max-w-[800px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/85 sm:text-[12px]">TIP</p>
          <h2 className="mt-3 text-[clamp(1.5rem,3.2vw,2.125rem)] font-semibold tracking-[-0.028em] text-slate-50">
            {t("landing.showroom.tip.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-relaxed text-slate-400 sm:text-[16px]">
            {t("landing.showroom.tip.subtitle")}
          </p>
        </div>

        <div className="relative mx-auto mt-10 grid max-w-[1080px] grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 lg:gap-x-11 lg:gap-y-9">
          {cards.map(({ n, titleKey, descKey, Icon }) => (
            <button
              key={titleKey}
              type="button"
              className={tipCardBase}
              onClick={() =>
                setViewer({
                  open: true,
                  title: t(titleKey),
                  initialSlideIndex: SENSORA_TIP_CARD_INITIAL_INDEX[n],
                })
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className="relative flex size-[3.25rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.22] bg-gradient-to-br from-sky-400/26 via-[#1e293b]/55 to-violet-500/22 text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_32px_-12px_rgba(56,189,248,0.28),0_10px_28px_-14px_rgba(139,92,246,0.12)] ring-1 ring-inset ring-white/[0.12] transition-[box-shadow,border-color,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(90%_80%_at_30%_0%,rgba(255,255,255,0.16),transparent_62%)] before:opacity-90 group-hover:-translate-y-px group-hover:border-sky-300/42 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_44px_-6px_rgba(56,189,248,0.35),0_12px_40px_-14px_rgba(139,92,246,0.16)] motion-reduce:group-hover:translate-y-0"
                  aria-hidden
                >
                  <Icon className="relative z-[1] size-[23px] opacity-[0.98]" />
                </span>
                <span className="inline-flex size-[2.375rem] shrink-0 items-center justify-center rounded-full border border-white/[0.18] bg-gradient-to-br from-[#111c2f] to-[#050b14] text-[12px] font-bold tabular-nums tracking-tight text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_22px_-10px_rgba(0,0,0,0.45)] ring-2 ring-sky-400/12 ring-offset-2 ring-offset-[#020817]/0 transition-[border-color,box-shadow,color,transform] duration-[240ms] group-hover:-translate-y-px group-hover:border-sky-400/42 group-hover:text-sky-50 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_36px_-8px_rgba(56,189,248,0.35)] motion-reduce:group-hover:translate-y-0">
                  {n}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-semibold leading-snug tracking-tight text-slate-50 sm:text-[18px]">{t(titleKey)}</h3>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-400 sm:text-[15px] sm:leading-[1.56]">{t(descKey)}</p>
              <div className="mt-auto flex justify-end pt-5 sm:pt-6">
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-sky-400/38 bg-gradient-to-r from-sky-500/[0.16] via-sky-500/[0.1] to-violet-500/[0.13] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_-12px_rgba(56,189,248,0.35),0_8px_24px_-14px_rgba(139,92,246,0.12)] ring-1 ring-inset ring-white/[0.1] transition-[border-color,background-color,box-shadow,color,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] group-hover:-translate-y-[3px] group-hover:border-sky-300/55 group-hover:from-sky-400/[0.22] group-hover:via-sky-500/[0.15] group-hover:to-violet-500/[0.18] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_40px_-8px_rgba(56,189,248,0.42),0_12px_36px_-10px_rgba(139,92,246,0.2)] active:translate-y-0 active:scale-[0.97] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                  aria-hidden
                >
                  {t("landing.showroom.tip.guideWord")}
                  <span
                    className="inline-flex translate-x-0 rounded-full bg-white/[0.12] px-1.5 py-0.5 text-[13px] font-bold leading-none text-sky-50 transition-[transform,background-color] duration-[240ms] ease-out group-hover:translate-x-1 group-hover:bg-white/[0.2]"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function LandingShowroom({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  return (
    <div className="relative overflow-x-hidden bg-[#020817]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(78vh,720px)] bg-[radial-gradient(ellipse_92%_64%_at_46%-10%,rgba(56,189,248,0.125),transparent_56%),radial-gradient(ellipse_74%_52%_at_102%_16%,rgba(139,92,246,0.095),transparent_52%),radial-gradient(ellipse_58%_44%_at_2%_32%,rgba(30,58,138,0.075),transparent_50%),radial-gradient(ellipse_48%_36%_at_58%_42%,rgba(99,102,241,0.055),transparent_55%)]"
      />
      <div className="relative z-[1]">
        <ShowroomHero onOpenAppWorkspace={onOpenAppWorkspace} />
        <RevealSection className="relative mx-auto w-full max-w-[1280px] overflow-x-hidden">
          <ShowroomBridge />
        </RevealSection>
        <RevealSection className="relative mx-auto w-full max-w-[1280px] overflow-x-hidden">
          <SensoraTipSectionInner />
        </RevealSection>
        <RevealSection className="relative mx-auto w-full max-w-[1280px] overflow-x-hidden">
          <ProductFlowSectionInner />
        </RevealSection>
        <RevealSection className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-6 sm:py-[4rem] lg:py-[5rem]">
          <SensoraGuideSectionInner />
        </RevealSection>
        <RevealSection className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-6 sm:py-[4.75rem] lg:py-28">
          <SalesFeatureGridInner />
        </RevealSection>
        <RevealSection className="mx-auto w-full max-w-[1200px] px-5 pb-[5.25rem] pt-8 sm:px-6 sm:pb-32 sm:pt-11">
          <FinalShowroomCTAInner onOpenAppWorkspace={onOpenAppWorkspace} />
        </RevealSection>
      </div>
    </div>
  );
}

function ShowroomHero({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  const { t } = useLanguage();

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 landing-showroom-hero-scene">
      <div className="relative isolate overflow-hidden rounded-[26px] border border-white/[0.13] bg-gradient-to-br from-[#050814] via-[#0d1628] to-[#101b33] px-6 py-10 shadow-[0_44px_120px_-36px_rgba(0,0,0,0.78),0_0_0_1px_rgba(255,255,255,0.045)_inset,0_0_100px_-40px_rgba(56,189,248,0.065)] ring-1 ring-white/[0.05] motion-reduce:shadow-[0_36px_90px_-32px_rgba(0,0,0,0.72)] sm:rounded-[32px] sm:px-9 sm:py-12 lg:min-h-[min(620px,calc(100svh-6rem))] lg:rounded-[36px] lg:px-12 lg:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_14%-8%,rgba(255,255,255,0.085),transparent_55%),radial-gradient(ellipse_72%_50%_at_96%_8%,rgba(56,189,248,0.13),transparent_58%),radial-gradient(ellipse_58%_44%_at_68%_102%,rgba(139,92,246,0.09),transparent_60%),radial-gradient(ellipse_58%_48%_at_78%_88%,rgba(56,189,248,0.07),transparent_62%),radial-gradient(ellipse_50%_42%_at_40%_50%,rgba(99,102,241,0.04),transparent_58%)]"
        />

        <div aria-hidden className="pointer-events-none absolute -right-[12%] top-1/2 z-0 hidden h-[72%] w-[52%] max-w-xl -translate-y-1/2 lg:block">
          <div className="relative h-full w-full overflow-hidden rounded-2xl opacity-[0.22] saturate-[0.72]">
            <div className="absolute inset-0 z-[1] bg-gradient-to-l from-transparent via-[#020817]/88 to-[#07111f]" />
            <div className="absolute inset-y-[-8%] right-[-14%] w-[92%] scale-[1.08] blur-md">
              <ImageSlot
                src={LANDING_SHOWROOM_IMAGE_PATHS.hero}
                alt=""
                tone="hero"
                className="relative h-[min(400px,70vh)] w-full rounded-2xl border-0 lg:h-full lg:min-h-[320px]"
              />
            </div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute bottom-[-5%] right-[-14%] z-0 h-40 w-[55%] max-w-[14rem] opacity-[0.1] saturate-[0.7] blur-2xl sm:h-52 sm:w-[48%] lg:hidden">
          <ImageSlot
            src={LANDING_SHOWROOM_IMAGE_PATHS.hero}
            alt=""
            tone="hero"
            className="h-full min-h-[9rem] w-full rounded-xl border-0"
          />
        </div>

        <div className="relative z-[2] mx-auto grid w-full max-w-[1160px] items-start gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)] lg:items-center lg:gap-14 xl:gap-[4.25rem]">
          <div className="min-w-0 max-w-xl lg:max-w-none">
            <span className="inline-flex rounded-full border border-white/[0.15] bg-white/[0.06] px-3 py-1 text-[11px] font-semibold tracking-[0.06em] text-slate-200 backdrop-blur-sm sm:text-[12px]">
              {t("landing.showroom.hero.kickerBadge")}
            </span>
            <h1 className="mt-5 text-balance text-[clamp(1.4375rem,4.25vw+0.62rem,2.75rem)] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:mt-6">
              {t("landing.showroom.hero.headline")}
            </h1>
            <p className="mt-5 max-w-[40rem] whitespace-pre-line text-[14px] leading-[1.65] text-slate-300 sm:mt-6 sm:text-[16px] sm:leading-[1.62]">
              {t("landing.showroom.hero.sub")}
            </p>
            <div className="mt-9 flex max-w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:gap-5">
              <Link href={JOIN_PATH} prefetch={false} className={`relative z-20 justify-center pointer-events-auto ${heroJoinPrimary} touch-manipulation`}>
                {t("cta.joinBeta")}
              </Link>
              <button
                type="button"
                onClick={onOpenAppWorkspace}
                className={`relative z-20 cursor-pointer justify-center pointer-events-auto ${heroGhostDark} touch-manipulation`}
              >
                <IconAppWindowPlay className="size-[1.125rem] shrink-0 opacity-95 sm:size-5" />
                {t("cta.tryAppExperience")}
              </button>
            </div>
          </div>

          <div className="relative z-[4] mx-auto min-w-0 w-full max-w-[min(100%,560px)] lg:mx-0 lg:max-w-none">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-[16px] rounded-[42px] bg-[radial-gradient(ellipse_90%_76%_at_52%_48%,rgba(56,189,248,0.15),transparent_66%),radial-gradient(ellipse_78%_68%_at_74%_32%,rgba(139,92,246,0.11),transparent_62%),radial-gradient(ellipse_55%_50%_at_30%_70%,rgba(99,102,241,0.06),transparent_58%)] opacity-[0.99] blur-2xl sm:-inset-5 lg:-inset-[26px]"
            />
            <div className="relative">
              <HeroDashboardPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowroomBridge() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-[680px] px-5 pb-8 pt-4 text-center sm:px-6 sm:pb-12 sm:pt-10 lg:max-w-[720px] lg:pb-14 lg:pt-14">
      <p className="text-[clamp(1.125rem,2.9vw,1.625rem)] font-semibold leading-[1.4] tracking-[-0.024em] text-slate-200">
        {t("landing.showroom.bridge.line1")}
        <br />
        <span className="text-slate-400">{t("landing.showroom.bridge.line2")}</span>
      </p>
      <div className="landing-showroom-premium-rule landing-showroom-premium-rule--narrow mx-auto mt-7 opacity-95 sm:mt-9" aria-hidden />
    </div>
  );
}

const flowCardWrap =
  "group/flowdeck landing-showroom-flow-deck mx-auto rounded-[28px] border border-white/[0.14] bg-gradient-to-b from-slate-950/52 to-[#07111f]/62 shadow-[0_42px_100px_-42px_rgba(0,0,0,0.78),0_0_0_1px_rgba(56,189,248,0.04)_inset] ring-1 ring-inset ring-white/[0.052] backdrop-blur-xl landing-showroom-flow-card-shadow transition-[border-color,box-shadow,transform] duration-[260ms] ease-[cubic-bezier(0.22,1,0.32,1)] motion-reduce:transition-none hover:-translate-y-[2px] hover:border-sky-400/32 hover:shadow-[0_48px_104px_-40px_rgba(0,0,0,0.8),0_0_64px_-26px_rgba(56,189,248,0.1),0_0_72px_-32px_rgba(139,92,246,0.06)] motion-reduce:hover:translate-y-0";

function ProductFlowSectionInner() {
  const { t } = useLanguage();
  const rows = [
    { titleKey: "landing.showroom.flow.mock.contactTitle", bodyKey: "landing.showroom.flow.mock.contactBody" },
    { titleKey: "landing.showroom.flow.mock.needsTitle", bodyKey: "landing.showroom.flow.mock.needsBody" },
    { titleKey: "landing.showroom.flow.mock.smsTitle", bodyKey: "landing.showroom.flow.mock.smsBody" },
    { titleKey: "landing.showroom.flow.mock.followupTitle", bodyKey: "landing.showroom.flow.mock.followupBody" },
  ] as const;

  return (
    <div className="relative px-5 pb-16 pt-8 sm:px-6 sm:pb-[4.75rem] sm:pt-8 lg:pb-28 lg:pt-11">
      <div className="pointer-events-none absolute inset-x-[8%] top-[18%] h-[45%] bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(56,189,248,0.04),transparent_68%)] opacity-90" aria-hidden />
      <div className="landing-showroom-premium-rule mx-auto mb-9 sm:mb-11 lg:mb-12 pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-[800px] text-center lg:max-w-[860px]">
        <h2 className="text-[clamp(1.6rem,3.4vw,2.375rem)] font-semibold leading-[1.2] tracking-[-0.028em] text-slate-50">
          {t("landing.showroom.flow.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[54ch] text-[15px] leading-relaxed text-slate-400 sm:mt-5 sm:text-[17px] sm:leading-[1.55]">
          {t("landing.showroom.flow.desc")}
        </p>
      </div>

      <div
        className={`${flowCardWrap} relative mx-auto mt-10 max-w-[min(760px,100%)] overflow-hidden sm:mt-12 sm:max-w-[min(800px,100%)] lg:mt-14 lg:max-w-[min(880px,100%)]`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent sm:inset-x-10"
        />
        <div className="relative space-y-0 px-5 pb-9 pt-7 sm:px-9 sm:pb-11 sm:pt-10">
          {rows.map((row, idx) => (
            <div key={row.titleKey} className="relative flex gap-4 pb-10 last:pb-0 sm:gap-7">
              <div className="relative flex w-[2.875rem] shrink-0 flex-col items-center pt-1 sm:w-14">
                <span
                  className="relative z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.15] bg-gradient-to-br from-slate-800 to-[#0b1424] text-[12px] font-semibold tracking-tight text-slate-100 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.09)] ring-2 ring-sky-400/15 transition duration-[220ms] ease-out group-hover/flowdeck:border-sky-400/42 group-hover/flowdeck:shadow-[0_14px_36px_-8px_rgba(56,189,248,0.14)]"
                  aria-hidden
                >
                  {idx + 1}
                </span>
                {idx < rows.length - 1 ? (
                  <div className="mt-4 flex flex-1 flex-col items-center pb-1 pt-0.5" aria-hidden>
                    <div className="relative min-h-[3rem] w-[10px] sm:min-h-[3.65rem]">
                      <span className="absolute left-1/2 top-0 h-[42%] w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-400/72 to-sky-400/35 shadow-[0_0_22px_-1px_rgba(56,189,248,0.52)] motion-reduce:shadow-none" />
                      <span className="absolute left-1/2 top-[38%] size-2.5 -translate-x-1/2 rounded-full border border-sky-200/55 bg-[#07111f] shadow-[0_0_14px_-1px_rgba(56,189,248,0.72)] ring-4 ring-[#07111f]/95" />
                      <span className="absolute left-1/2 top-[45%] bottom-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-400/35 via-violet-400/26 to-transparent shadow-[0_0_22px_-1px_rgba(139,92,246,0.22)] motion-reduce:shadow-none sm:bottom-[-1px]" />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="group/step min-w-0 flex-1">
                <div className="relative overflow-hidden rounded-[20px] border border-white/[0.11] bg-gradient-to-br from-white/[0.065] via-[#07111f]/32 to-transparent pl-[1.125rem] pr-5 py-4 shadow-[0_14px_44px_-28px_rgba(0,0,0,0.58)] backdrop-blur-sm transition-[border-color,box-shadow,transform,background-color] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] before:pointer-events-none before:absolute before:inset-y-3 before:left-3 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-sky-400/75 before:via-indigo-400/45 before:to-violet-500/35 before:shadow-[0_0_18px_-2px_rgba(56,189,248,0.45)] motion-reduce:transition-none hover:border-sky-400/32 hover:bg-white/[0.055] hover:shadow-[0_24px_56px_-26px_rgba(0,0,0,0.64),0_0_48px_-16px_rgba(56,189,248,0.09)] hover:-translate-y-[2px] motion-reduce:hover:translate-y-0 active:translate-y-0 active:scale-[0.996]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">{t(row.titleKey)}</p>
                  <p className="mt-2.5 text-[15px] font-semibold leading-[1.5] tracking-[-0.015em] text-slate-100 sm:text-[16px] sm:leading-[1.53]">
                    {t(row.bodyKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SensoraGuideSectionInner() {
  const { t } = useLanguage();
  return (
    <>
      <div className="landing-showroom-premium-rule mx-auto mb-10 sm:mb-12 lg:mb-14 pointer-events-none" aria-hidden />
      <div className="mx-auto max-w-[720px] text-center lg:max-w-[800px]">
        <h2 className="text-[clamp(1.5rem,3.2vw,2.125rem)] font-semibold tracking-[-0.025em] text-slate-50">
          {t("landing.showroom.guide.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-relaxed text-slate-400 sm:text-[16px]">
          {t("landing.showroom.guide.desc")}
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-[880px] gap-5 sm:grid-cols-2 sm:gap-6">
        <div className={`${cardChrome} p-8`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("landing.showroom.guide.memoLabel")}</p>
          <p className="mt-5 text-[17px] font-medium leading-relaxed text-slate-100">“{t("landing.showroom.guide.memoQuote")}”</p>
        </div>
        <div className={`${cardChrome} border-violet-400/15 bg-slate-900/55 p-8`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200/75">SensoraGuide</p>
          <p className="mt-5 text-[17px] font-medium leading-relaxed text-slate-100">{t("landing.showroom.guide.guideQuote")}</p>
        </div>
      </div>
    </>
  );
}

function SalesFeatureGridInner() {
  const { t } = useLanguage();
  const tiles = (
    [
      ["landing.feature.profile.title", "landing.feature.profile.desc"],
      ["landing.feature.memory.title", "landing.feature.memory.desc"],
      ["landing.feature.followup.title", "landing.feature.followup.desc"],
      ["landing.feature.delivery.title", "landing.feature.delivery.desc"],
    ] as const
  ).map(([titleKey, descKey]) => ({
    titleKey,
    descKey,
  }));

  return (
    <>
      <div className="landing-showroom-premium-rule mx-auto mb-10 sm:mb-12 pointer-events-none" aria-hidden />
      <h2 className="mx-auto max-w-[680px] text-center text-[clamp(1.5rem,3.2vw,2rem)] font-semibold tracking-[-0.025em] text-slate-50">
        {t("landing.showroom.features.title")}
      </h2>
      <div className="mx-auto mt-12 grid max-w-[920px] gap-5 sm:grid-cols-2 lg:gap-6">
        {tiles.map(({ titleKey, descKey }) => (
          <article key={titleKey} className={`${cardChrome} px-8 py-7`}>
            <h3 className="text-[17px] font-semibold tracking-tight text-slate-50">{t(titleKey)}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{t(descKey)}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function FinalShowroomCTAInner({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  const { t } = useLanguage();

  return (
    <div className={`${cardChrome} mx-auto flex max-w-[720px] flex-col items-center px-8 py-14 text-center sm:px-12`}>
      <p className="text-[clamp(1.25rem,3vw,1.625rem)] font-semibold tracking-[-0.02em] text-slate-50">{t("brand.slogan")}</p>
      <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-slate-400 sm:text-[16px]">{t("landing.showroom.closing.desc")}</p>
      <div className="mt-10 flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
        <Link href={JOIN_PATH} prefetch={false} className={`relative z-20 inline-flex justify-center touch-manipulation pointer-events-auto ${primaryBtn}`}>
          {t("cta.joinBeta")}
        </Link>
        <button type="button" onClick={onOpenAppWorkspace} className={`relative z-20 cursor-pointer touch-manipulation pointer-events-auto ${ghostBtn}`}>
          <IconAppWindowPlay className="size-[1.05rem] shrink-0 opacity-95 sm:size-[1.15rem]" />
          {t("cta.tryAppExperience")}
        </button>
      </div>
    </div>
  );
}
