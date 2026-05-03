"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { ImageSlot } from "@/app/components/concierge/ImageSlot";

const JOIN_PATH = "/join" as const;

/** 랜딩 보조 이미지 — 에셋 교체 시 여기만 수정 */
export const LANDING_SHOWROOM_IMAGE_PATHS = {
  hero: "/images/hero-classic-car.jpg",
  interior: "/images/vintage-car-interior.jpg",
  desk: "/images/concierge-desk.jpg",
  workspace: "/images/sales-dashboard-workspace.jpg",
} as const;

const cardChrome =
  "rounded-[26px] border border-[#E5E7EB] bg-white shadow-[0_16px_48px_rgba(17,24,39,0.06),0_2px_8px_rgba(17,24,39,0.04)]";

const primaryBtn =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#111827] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937]";

const ghostBtn =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]";

const heroPrimaryDark =
  "inline-flex min-h-[48px] min-w-[12rem] w-full shrink-0 items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-[15px] font-semibold tracking-tight text-[#0f172a] shadow-sm transition-colors hover:bg-slate-100 sm:w-auto sm:min-h-[50px] sm:min-w-[12.5rem] sm:py-4 sm:text-[16px] lg:min-h-[52px] lg:px-10 lg:text-[17px]";

const heroGhostDark =
  "inline-flex min-h-[48px] min-w-[12rem] w-full shrink-0 items-center justify-center rounded-2xl border border-white/[0.22] bg-white/[0.06] px-7 py-3.5 text-[15px] font-semibold tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/[0.11] sm:w-auto sm:min-h-[50px] sm:min-w-[12.5rem] sm:py-4 sm:text-[16px] lg:min-h-[52px] lg:px-10 lg:text-[17px]";

const heroPreviewShell =
  "overflow-hidden rounded-[30px] border border-[#E4E7EC] bg-white ring-1 ring-black/[0.035] landing-showroom-preview-card-shadow sm:rounded-[34px] lg:rounded-[36px]";

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
    ? "translate-y-0 opacity-100 duration-[480ms] sm:duration-[780ms]"
    : "opacity-0 max-sm:translate-y-2 sm:translate-y-0";

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

function HeroDashboardPreview() {
  const { t } = useLanguage();

  const rows = [
    { titleKey: "landing.showroom.heroDash.todayTitle" as const, bodyKey: "landing.showroom.heroDash.todaySnippet" as const },
    { titleKey: "landing.showroom.heroDash.priorityTitle" as const, bodyKey: "landing.showroom.heroDash.prioritySnippet" as const },
    { titleKey: "landing.showroom.heroDash.followupTitle" as const, bodyKey: "landing.showroom.heroDash.followupSnippet" as const },
    { titleKey: "landing.showroom.heroDash.aiDraftTitle" as const, bodyKey: "landing.showroom.heroDash.aiDraftSnippet" as const },
    { titleKey: "landing.showroom.heroDash.summaryTitle" as const, bodyKey: "landing.showroom.heroDash.summarySnippet" as const },
  ];

  return (
    <div className={`${heroPreviewShell} relative z-[3] w-full max-w-[640px] shadow-[0_24px_64px_-12px_rgba(15,23,42,0.42)] lg:mx-0 lg:max-w-none`}>
      <div className="flex items-center gap-3 border-b border-[#EDEEF3] bg-gradient-to-b from-[#FAFBFC] to-[#F4F7FA] px-5 py-3.5 sm:px-8 sm:py-4 lg:py-5">
        <div className="flex gap-2" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#D2D8E2]" />
          <span className="size-2.5 rounded-full bg-[#D2D8E2]" />
          <span className="size-2.5 rounded-full bg-[#D2D8E2]" />
        </div>
        <p className="min-w-0 flex-1 truncate text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
          {t("product.name")}
        </p>
      </div>
      <div className="divide-y divide-[#EEF1F6] bg-white px-4 py-1 sm:px-6 sm:py-2">
        {rows.map(({ titleKey, bodyKey }) => (
          <div key={titleKey} className="space-y-1 py-3 sm:py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#475569] sm:text-[11px]">{t(titleKey)}</p>
            <p className="text-[13px] leading-[1.45] text-[#334155] sm:text-[14px] sm:leading-[1.5]">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingShowroom({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  return (
    <div className="overflow-x-hidden bg-[#F4F6F8]">
      <ShowroomHero onOpenAppWorkspace={onOpenAppWorkspace} />
      <RevealSection className="relative mx-auto w-full max-w-[1280px] overflow-x-hidden">
        <ShowroomBridge />
      </RevealSection>
      <RevealSection className="relative mx-auto w-full max-w-[1280px] overflow-x-hidden">
        <ProductFlowSectionInner />
      </RevealSection>
      <RevealSection className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-6 sm:py-14 lg:py-20">
        <SensoraGuideSectionInner />
      </RevealSection>
      <RevealSection className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <SalesFeatureGridInner />
      </RevealSection>
      <RevealSection className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-10 sm:px-6 sm:pb-28">
        <FinalShowroomCTAInner onOpenAppWorkspace={onOpenAppWorkspace} />
      </RevealSection>
    </div>
  );
}

function ShowroomHero({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  const { t } = useLanguage();

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:pb-16 lg:pt-12 landing-showroom-hero-scene">
      <div className="relative isolate overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#0b1222] via-[#101b2f] to-[#0f172a] px-6 py-10 shadow-[0_28px_90px_-20px_rgba(15,23,42,0.55)] sm:rounded-[32px] sm:px-9 sm:py-12 lg:min-h-[min(620px,calc(100svh-6rem))] lg:rounded-[36px] lg:px-12 lg:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_14%_-10%,rgba(255,255,255,0.09),transparent_55%),radial-gradient(ellipse_70%_50%_at_104%_12%,rgba(56,189,248,0.06),transparent_60%)]"
        />

        <div aria-hidden className="pointer-events-none absolute -right-[12%] top-1/2 z-0 hidden h-[72%] w-[52%] max-w-xl -translate-y-1/2 lg:block">
          <div className="relative h-full w-full overflow-hidden rounded-2xl opacity-[0.28] saturate-[0.75]">
            <div className="absolute inset-0 z-[1] bg-gradient-to-l from-transparent via-[#0f172a]/75 to-[#101b2f]" />
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

        <div aria-hidden className="pointer-events-none absolute bottom-[-5%] right-[-14%] z-0 h-40 w-[55%] max-w-[14rem] opacity-[0.12] saturate-[0.72] blur-2xl sm:h-52 sm:w-[48%] lg:hidden">
          <ImageSlot
            src={LANDING_SHOWROOM_IMAGE_PATHS.hero}
            alt=""
            tone="hero"
            className="h-full min-h-[9rem] w-full rounded-xl border-0"
          />
        </div>

        <div className="relative z-[2] mx-auto grid w-full max-w-[1160px] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0 max-w-xl lg:max-w-none">
            <span className="inline-flex rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-semibold tracking-[0.06em] text-slate-200 backdrop-blur-sm sm:text-[12px]">
              {t("landing.showroom.hero.kickerBadge")}
            </span>
            <h1 className="mt-5 text-balance text-[clamp(1.4375rem,4.25vw+0.62rem,2.75rem)] font-semibold leading-[1.14] tracking-[-0.03em] text-white sm:mt-6">
              {t("landing.showroom.hero.headline")}
            </h1>
            <p className="mt-5 max-w-[40rem] text-[14px] leading-[1.65] text-slate-300 sm:mt-6 sm:text-[16px] sm:leading-[1.62]">
              {t("landing.showroom.hero.sub")}
            </p>
            <div className="mt-9 flex max-w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:gap-5">
              <Link href={JOIN_PATH} prefetch={false} className={`relative z-20 justify-center pointer-events-auto ${heroPrimaryDark} touch-manipulation`}>
                {t("cta.joinBeta")}
              </Link>
              <button
                type="button"
                onClick={onOpenAppWorkspace}
                className={`relative z-20 cursor-pointer justify-center pointer-events-auto ${heroGhostDark} touch-manipulation`}
              >
                {t("cta.tryAppExperience")}
              </button>
            </div>
          </div>

          <div className="relative z-[4] mx-auto min-w-0 w-full max-w-[min(100%,560px)] lg:mx-0 lg:max-w-none">
            <HeroDashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowroomBridge() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-[680px] px-5 pb-6 pt-2 text-center sm:px-6 sm:pb-10 sm:pt-8 lg:max-w-[720px] lg:pb-14 lg:pt-14">
      <p className="text-[clamp(1.125rem,2.9vw,1.625rem)] font-semibold leading-[1.4] tracking-[-0.024em] text-[#334155]">
        {t("landing.showroom.bridge.line1")}
        <br />
        <span className="text-[#475569]">{t("landing.showroom.bridge.line2")}</span>
      </p>
      <div
        className="mx-auto mt-7 h-[2px] w-[min(280px,80%)] rounded-full opacity-65 max-sm:mx-auto sm:mt-9"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.45), transparent)",
          filter: "blur(0.8px)",
        }}
        aria-hidden
      />
    </div>
  );
}

const flowCardWrap =
  "mx-auto rounded-[28px] border border-[#E8EAEE] bg-white ring-1 ring-black/[0.025] landing-showroom-flow-card-shadow";

function ProductFlowSectionInner() {
  const { t } = useLanguage();
  const rows = [
    { titleKey: "landing.showroom.flow.mock.contactTitle", bodyKey: "landing.showroom.flow.mock.contactBody" },
    { titleKey: "landing.showroom.flow.mock.needsTitle", bodyKey: "landing.showroom.flow.mock.needsBody" },
    { titleKey: "landing.showroom.flow.mock.smsTitle", bodyKey: "landing.showroom.flow.mock.smsBody" },
    { titleKey: "landing.showroom.flow.mock.followupTitle", bodyKey: "landing.showroom.flow.mock.followupBody" },
  ] as const;

  return (
    <div className="px-5 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-6 lg:pb-24 lg:pt-10">
      <div
        className="pointer-events-none mx-auto mb-8 h-px w-[min(92%,1100px)] max-w-full bg-gradient-to-r from-transparent via-[#CBD5E1]/90 to-transparent sm:mb-10 lg:mb-11"
        aria-hidden
      />

      <div className="mx-auto max-w-[800px] text-center lg:max-w-[860px]">
        <h2 className="text-[clamp(1.6rem,3.4vw,2.375rem)] font-semibold leading-[1.2] tracking-[-0.028em] text-[#111827]">
          {t("landing.showroom.flow.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[54ch] text-[15px] leading-relaxed text-[#4B5563] sm:mt-5 sm:text-[17px] sm:leading-[1.55]">
          {t("landing.showroom.flow.desc")}
        </p>
      </div>

      <div
        className={`${flowCardWrap} relative mx-auto mt-10 max-w-[min(760px,100%)] overflow-hidden sm:mt-12 sm:max-w-[min(800px,100%)] lg:mt-14 lg:max-w-[min(860px,100%)]`}
      >
        <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-11 sm:pt-9">
          {rows.map((row, idx) => (
            <div
              key={row.titleKey}
              className="relative flex gap-5 pb-11 last:pb-0 sm:gap-8"
            >
              <div className="relative mt-1 flex shrink-0 flex-col items-center sm:w-14">
                <span
                  className="relative z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFFFFF] via-[#F4F7FA] to-[#EBEEF3] text-[12px] font-semibold tracking-tight text-[#475569] shadow-[0_6px_16px_-6px_rgba(15,23,42,0.12)] ring-1 ring-[#DCE3EA]/90"
                  aria-hidden
                >
                  {idx + 1}
                </span>
                {idx < rows.length - 1 ? (
                  <span
                    className="mt-5 h-[4rem] w-px shrink-0 bg-gradient-to-b from-[#B8C3CD]/92 via-[#94A3B8]/45 to-transparent motion-reduce:opacity-60 sm:h-[4.5rem]"
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pb-px pt-1">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#475569] sm:text-[13px]">
                  {t(row.titleKey)}
                </p>
                <p className="mt-3 text-[16px] font-medium leading-[1.55] text-[#111827] sm:text-[17px] sm:leading-[1.52]">
                  {t(row.bodyKey)}
                </p>
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
      <div className="mx-auto max-w-[720px] text-center lg:max-w-[800px]">
        <h2 className="text-[clamp(1.5rem,3.2vw,2.125rem)] font-semibold tracking-[-0.025em] text-[#111827]">
          {t("landing.showroom.guide.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-relaxed text-[#4B5563] sm:text-[16px]">
          {t("landing.showroom.guide.desc")}
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-[880px] gap-5 sm:grid-cols-2 sm:gap-6">
        <div className={`${cardChrome} p-8`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{t("landing.showroom.guide.memoLabel")}</p>
          <p className="mt-5 text-[17px] font-medium leading-relaxed text-[#111827]">“{t("landing.showroom.guide.memoQuote")}”</p>
        </div>
        <div className={`${cardChrome} bg-[#FAFAFB] p-8`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">SensoraGuide</p>
          <p className="mt-5 text-[17px] font-medium leading-relaxed text-[#111827]">{t("landing.showroom.guide.guideQuote")}</p>
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
      <h2 className="mx-auto max-w-[680px] text-center text-[clamp(1.5rem,3.2vw,2rem)] font-semibold tracking-[-0.025em] text-[#111827]">
        {t("landing.showroom.features.title")}
      </h2>
      <div className="mx-auto mt-12 grid max-w-[920px] gap-5 sm:grid-cols-2 lg:gap-6">
        {tiles.map(({ titleKey, descKey }) => (
          <article key={titleKey} className={`${cardChrome} px-8 py-7`}>
            <h3 className="text-[17px] font-semibold tracking-tight text-[#111827]">{t(titleKey)}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4B5563]">{t(descKey)}</p>
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
      <p className="text-[clamp(1.25rem,3vw,1.625rem)] font-semibold tracking-[-0.02em] text-[#111827]">{t("brand.slogan")}</p>
      <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-[#4B5563] sm:text-[16px]">{t("landing.showroom.closing.desc")}</p>
      <div className="mt-10 flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
        <Link href={JOIN_PATH} prefetch={false} className={`relative z-20 inline-flex justify-center touch-manipulation pointer-events-auto ${primaryBtn}`}>
          {t("cta.joinBeta")}
        </Link>
        <button type="button" onClick={onOpenAppWorkspace} className={`relative z-20 cursor-pointer touch-manipulation pointer-events-auto ${ghostBtn}`}>
          {t("cta.tryAppExperience")}
        </button>
      </div>
    </div>
  );
}
