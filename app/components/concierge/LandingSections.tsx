"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { LandingShowcaseHero } from "@/app/components/concierge/LandingShowcaseHero";
import { PreviewDiagramSecurityStrip } from "@/app/components/concierge/SensoraFuturisticFlows";
import { SENSORA_GUIDE_IMAGES } from "@/app/components/concierge/sensoraGuideImages";

/** 랜딩 보조 이미지 에셋 경로(@/public 기준). Hero 쇼케이스에서는 미사용이나 교체 참고용으로 유지합니다. */
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

const cardChrome =
  "landing-showcase-surface-card rounded-[22px] border border-white/[0.16] bg-gradient-to-b from-white/[0.09] via-slate-900/58 to-[#050d14]/94 shadow-[0_30px_76px_-24px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.072),0_0_56px_-24px_rgba(56,189,248,0.084)] backdrop-blur-md ring-1 ring-inset ring-white/[0.065] transition-[border-color,box-shadow,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] hover:-translate-y-1 hover:border-sky-400/36 hover:shadow-[0_36px_84px_-20px_rgba(0,0,0,0.64),0_0_60px_-16px_rgba(56,189,248,0.13)] motion-reduce:transform-none motion-reduce:transition-none active:translate-y-0 active:scale-[0.996]";

const primaryBtn =
  "landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-14 min-w-[min(100%,13rem)] items-center justify-center rounded-2xl px-9 py-4 text-[0.9375rem] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_16px_48px_-10px_rgba(56,189,248,0.26),0_0_40px_-8px_rgba(139,92,246,0.06)] touch-manipulation sm:text-base";

const ghostBtn =
  "landing-showroom-cta-preview inline-flex min-h-14 min-w-[min(100%,13rem)] items-center justify-center gap-2 rounded-2xl border border-white/[0.32] bg-white/[0.1] px-8 py-4 text-[0.9375rem] font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_0_0_1px_rgba(56,189,248,0.055)_inset,0_0_36px_-8px_rgba(56,189,248,0.12)] ring-1 ring-inset ring-sky-400/22 backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-[240ms] hover:border-sky-300/52 hover:bg-white/[0.14] active:scale-[0.987] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/42 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020817] touch-manipulation motion-reduce:transition-none sm:text-base";

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
      { threshold: 0.06, rootMargin: "0px 0px -5% 0px" },
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
    ? "translate-y-0 opacity-100 transition-[opacity,transform] duration-[520ms] sm:duration-[720ms]"
    : "opacity-0 max-sm:translate-y-3 sm:translate-y-2 transition-[opacity,transform] duration-[520ms] sm:duration-[720ms]";

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

export function LandingShowroom({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  return (
    <div className="sensora-nebula-shell sensora-nebula-shell--drift relative overflow-x-hidden bg-[#020817]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(66vh,620px)] bg-[radial-gradient(ellipse_82%_52%_at_52%_6%,rgba(56,189,248,0.092),transparent_55%),radial-gradient(ellipse_58%_42%_at_96%_16%,rgba(139,92,246,0.078),transparent_52%),radial-gradient(ellipse_44%_38%_at_8%_40%,rgba(30,58,138,0.065),transparent_50%)]"
      />
      <div className="relative z-[1]">
        <LandingShowcaseHero onOpenAppWorkspace={onOpenAppWorkspace} />

        <RevealSection className="relative mx-auto w-full max-w-[1200px] overflow-x-hidden px-5 pb-9 pt-3 sm:px-6 sm:pb-11 sm:pt-6">
          <SensoraGuideSectionInner />
        </RevealSection>

        <RevealSection className="relative mx-auto w-full max-w-[1200px] overflow-x-hidden px-5 pb-10 sm:px-6 sm:pb-[3.75rem]">
          <SalesFeatureGridInner />
        </RevealSection>

        <RevealSection className="mx-auto w-full max-w-[1180px] px-5 pb-[4.75rem] pt-6 sm:px-6 sm:pb-28 sm:pt-4">
          <FinalShowroomCTAInner onOpenAppWorkspace={onOpenAppWorkspace} />
        </RevealSection>
      </div>
    </div>
  );
}

function SensoraGuideSectionInner() {
  const { t } = useLanguage();

  const securityLabels = useMemo(
    () =>
      [t("preview.diagram.security.view"), t("preview.diagram.security.review"), t("preview.diagram.security.confirm"), t("preview.diagram.security.save")] as const,
    [t],
  );

  return (
    <>
      <div className="landing-showroom-premium-rule mx-auto mb-6 sm:mb-8 pointer-events-none opacity-95" aria-hidden />
      <div className="mx-auto max-w-[800px] text-center lg:max-w-[820px]">
        <h2 className="text-[clamp(1.5rem,3.1vw,2.1rem)] font-semibold tracking-[-0.03em] text-slate-50">
          {t("landing.showroom.guide.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[56ch] text-[0.9375rem] leading-[1.62] text-slate-400 sm:mt-5 sm:text-[1.03rem] sm:leading-[1.6]">
          {t("landing.showroom.guide.desc")}
        </p>
      </div>
      <div className="mx-auto mt-11 grid max-w-[880px] gap-5 sm:grid-cols-2 sm:items-stretch sm:gap-6">
        <article
          className={`${cardChrome} flex min-h-[240px] flex-col overflow-hidden !p-0 sm:min-h-[260px]`}
        >
          <div className="relative aspect-[21/11] w-full shrink-0 border-b border-white/[0.1] bg-[#030712]/90 sm:aspect-[21/10]">
            <Image
              src={SENSORA_GUIDE_IMAGES[2]?.src ?? "/images/guides/sensora-guide-01.png"}
              alt=""
              fill
              className="object-cover object-top opacity-95 transition duration-[240ms] group-hover:opacity-100"
              sizes="(max-width: 640px) 100vw, 420px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d14]/95 via-transparent to-transparent" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.08),transparent_55%)]" aria-hidden />
          </div>
          <div className="relative flex flex-1 flex-col px-8 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("landing.showroom.guide.memoLabel")}</p>
            <p className="mt-4 flex-1 text-[1.03rem] font-medium leading-[1.68] text-slate-50 sm:mt-5 sm:text-[1.09rem]">&ldquo;{t("landing.showroom.guide.memoQuote")}&rdquo;</p>
          </div>
        </article>
        <article
          className={`${cardChrome} flex min-h-[240px] flex-col overflow-hidden !p-0 border-violet-400/22 bg-gradient-to-b from-violet-950/[0.18] via-slate-900/55 to-[#050d14]/92 shadow-[0_28px_72px_-26px_rgba(0,0,0,0.6),0_0_56px_-28px_rgba(139,92,246,0.09),inset_0_1px_0_rgba(255,255,255,0.06)] ring-violet-400/12 sm:min-h-[260px]`}
        >
          <div className="relative aspect-[21/11] w-full shrink-0 border-b border-white/[0.09] bg-[#030712]/90 sm:aspect-[21/10]">
            <Image
              src={SENSORA_GUIDE_IMAGES[0]?.src ?? "/images/guides/sensora-guide-03.png"}
              alt=""
              fill
              className="object-cover object-[center_20%] opacity-95"
              sizes="(max-width: 640px) 100vw, 420px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d14]/95 via-transparent to-transparent" aria-hidden />
          </div>
          <div className="relative flex flex-1 flex-col px-8 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/88">SensoraGuide</p>
            <div className="relative mt-5">
              <PreviewDiagramSecurityStrip labels={securityLabels} />
            </div>
            <p className="mt-3 text-[11px] leading-snug text-slate-500">{t("preview.diagram.caption.security")}</p>
            <p className="mt-4 flex-1 text-[1.03rem] font-medium leading-[1.68] text-slate-50 sm:mt-5 sm:text-[1.09rem]">{t("landing.showroom.guide.guideQuote")}</p>
          </div>
        </article>
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
  ).map(([titleKey, descKey]) => ({ titleKey, descKey }));

  return (
    <>
      <div className="landing-showroom-premium-rule mx-auto mb-8 sm:mb-10 pointer-events-none" aria-hidden />
      <h2 className="mx-auto max-w-[680px] text-center text-[clamp(1.5rem,3.05vw,2.05rem)] font-semibold tracking-[-0.03em] text-slate-50">
        {t("landing.showroom.features.title")}
      </h2>
      <div className="mx-auto mt-10 grid max-w-[920px] gap-5 sm:grid-cols-2 sm:items-stretch lg:gap-6">
        {tiles.map(({ titleKey, descKey }) => (
          <article key={titleKey} className={`${cardChrome} flex min-h-[188px] flex-col px-8 py-8 sm:min-h-[196px] sm:px-10 sm:py-9`}>
            <h3 className="text-[1.09rem] font-semibold tracking-[-0.02em] text-slate-50 sm:text-[1.16rem]">{t(titleKey)}</h3>
            <p className="mt-3.5 flex-1 text-[0.9375rem] leading-[1.58] text-slate-400 sm:text-[0.97rem] sm:leading-[1.6]">{t(descKey)}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function FinalShowroomCTAInner({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  const { t } = useLanguage();

  return (
    <div
      className={`${cardChrome} landing-footer-cta-shell mx-auto flex max-w-[720px] flex-col items-center border-white/[0.17] px-8 py-12 text-center shadow-[0_38px_92px_-26px_rgba(0,0,0,0.64),inset_0_1px_0_rgba(255,255,255,0.075),0_0_80px_-28px_rgba(56,189,248,0.14),0_0_64px_-36px_rgba(139,92,246,0.06)] sm:px-12 sm:py-[4.25rem]`}
    >
      <p className="text-[clamp(1.28rem,2.95vw,1.68rem)] font-semibold tracking-[-0.024em] text-slate-50">{t("brand.slogan")}</p>
      <p className="mx-auto mt-5 max-w-[48ch] text-[0.9375rem] leading-relaxed text-slate-400 sm:mt-6 sm:text-[1.03rem] sm:leading-[1.58]">{t("landing.showroom.closing.desc")}</p>
      <div className="mt-10 flex w-full max-w-lg flex-col flex-wrap justify-center gap-4 sm:flex-row sm:justify-center">
        <Link href={JOIN_PATH} prefetch={false} className={`relative z-20 inline-flex w-full justify-center touch-manipulation pointer-events-auto sm:w-auto sm:flex-initial ${primaryBtn}`}>
          {t("cta.joinBeta")}
        </Link>
        <button
          type="button"
          onClick={onOpenAppWorkspace}
          className={`relative z-20 inline-flex w-full cursor-pointer justify-center touch-manipulation pointer-events-auto sm:w-auto sm:flex-initial ${ghostBtn}`}
        >
          <IconAppWindowPlay className="size-[1.08rem] shrink-0 opacity-95 sm:size-[1.14rem]" />
          {t("cta.tryAppExperience")}
        </button>
      </div>
    </div>
  );
}
