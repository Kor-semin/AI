"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { LandingShowcaseHero } from "@/app/components/concierge/LandingShowcaseHero";

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
  "landing-showcase-surface-card rounded-[22px] border border-white/[0.13] bg-gradient-to-b from-white/[0.07] via-slate-900/52 to-[#050d14]/88 shadow-[0_26px_64px_-28px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md ring-1 ring-inset ring-white/[0.045] transition-[border-color,box-shadow,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.32,1)] hover:-translate-y-[1px] hover:border-sky-400/26 hover:shadow-[0_30px_70px_-24px_rgba(0,0,0,0.62),0_0_40px_-20px_rgba(56,189,248,0.08)] motion-reduce:transform-none motion-reduce:transition-none active:translate-y-0 active:scale-[0.997]";

const primaryBtn =
  "landing-showroom-cta-join sensora-premium-primary-workspace inline-flex min-h-[46px] items-center justify-center rounded-xl px-8 py-[0.7rem] text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] touch-manipulation";

const ghostBtn =
  "landing-showroom-cta-preview inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/[0.22] bg-white/[0.075] px-7 py-[0.7rem] text-sm font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-240 hover:border-sky-300/42 hover:bg-white/[0.11] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/42 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020817] touch-manipulation motion-reduce:transition-none";

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
    <div className="relative overflow-x-hidden bg-[#020817]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(64vh,600px)] bg-[radial-gradient(ellipse_88%_58%_at_52%_8%,rgba(56,189,248,0.065),transparent_58%),radial-gradient(ellipse_62%_48%_at_96%_18%,rgba(139,92,246,0.055),transparent_54%),radial-gradient(ellipse_48%_40%_at_8%_42%,rgba(30,58,138,0.045),transparent_52%)]"
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
  return (
    <>
      <div className="landing-showroom-premium-rule mx-auto mb-6 sm:mb-8 pointer-events-none opacity-95" aria-hidden />
      <div className="mx-auto max-w-[720px] text-center lg:max-w-[760px]">
        <h2 className="text-[clamp(1.35rem,2.85vw,1.875rem)] font-semibold tracking-[-0.025em] text-slate-50">
          {t("landing.showroom.guide.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] line-clamp-4 text-[14px] leading-relaxed text-slate-400 sm:mt-4 sm:text-[15px] sm:leading-[1.56]">
          {t("landing.showroom.guide.desc")}
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-[860px] gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        <div className={`${cardChrome} p-7 sm:p-8`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t("landing.showroom.guide.memoLabel")}</p>
          <p className="mt-4 text-[16px] font-medium leading-relaxed text-slate-100 sm:text-[17px]">&ldquo;{t("landing.showroom.guide.memoQuote")}&rdquo;</p>
        </div>
        <div className={`${cardChrome} border-violet-400/12 bg-slate-900/52 p-7 sm:p-8`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200/75">SensoraGuide</p>
          <p className="mt-4 text-[16px] font-medium leading-relaxed text-slate-100 sm:text-[17px]">{t("landing.showroom.guide.guideQuote")}</p>
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
  ).map(([titleKey, descKey]) => ({ titleKey, descKey }));

  return (
    <>
      <div className="landing-showroom-premium-rule mx-auto mb-8 sm:mb-10 pointer-events-none" aria-hidden />
      <h2 className="mx-auto max-w-[640px] text-center text-[clamp(1.35rem,2.85vw,1.95rem)] font-semibold tracking-[-0.025em] text-slate-50">
        {t("landing.showroom.features.title")}
      </h2>
      <div className="mx-auto mt-9 grid max-w-[900px] gap-4 sm:grid-cols-2 lg:gap-5">
        {tiles.map(({ titleKey, descKey }) => (
          <article key={titleKey} className={`${cardChrome} px-7 py-6 sm:px-8 sm:py-7`}>
            <h3 className="text-[16px] font-semibold tracking-tight text-slate-50 sm:text-[17px]">{t(titleKey)}</h3>
            <p className="mt-2.5 line-clamp-4 text-[14px] leading-relaxed text-slate-400 sm:text-[15px]">{t(descKey)}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function FinalShowroomCTAInner({ onOpenAppWorkspace }: { onOpenAppWorkspace: () => void }) {
  const { t } = useLanguage();

  return (
    <div className={`${cardChrome} mx-auto flex max-w-[680px] flex-col items-center px-7 py-12 text-center sm:px-10 sm:py-14`}>
      <p className="text-[clamp(1.15rem,2.75vw,1.5rem)] font-semibold tracking-[-0.02em] text-slate-50">{t("brand.slogan")}</p>
      <p className="mt-4 max-w-[46ch] text-[14px] leading-relaxed text-slate-400 sm:mt-5 sm:text-[15px]">{t("landing.showroom.closing.desc")}</p>
      <div className="mt-9 flex w-full max-w-md flex-col flex-wrap justify-center gap-2.5 sm:flex-row sm:gap-3">
        <Link href={JOIN_PATH} prefetch={false} className={`relative z-20 inline-flex flex-1 justify-center touch-manipulation pointer-events-auto sm:flex-none ${primaryBtn}`}>
          {t("cta.joinBeta")}
        </Link>
        <button type="button" onClick={onOpenAppWorkspace} className={`relative z-20 inline-flex flex-1 cursor-pointer justify-center touch-manipulation pointer-events-auto sm:flex-none ${ghostBtn}`}>
          <IconAppWindowPlay className="size-[1.05rem] shrink-0 opacity-95 sm:size-[1.12rem]" />
          {t("cta.tryAppExperience")}
        </button>
      </div>
    </div>
  );
}
