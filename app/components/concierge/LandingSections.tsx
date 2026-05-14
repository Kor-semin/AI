"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

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

type Props = {
  onOpenAppWorkspace: () => void;
};

export function LandingShowroom({ onOpenAppWorkspace }: Props) {
  const { t } = useLanguage();

  const sectionShell = "relative z-[1] w-full px-4 sm:px-6";
  const innerMax = "mx-auto w-full max-w-[1440px]";

  return (
    <div
      id="sensora-landing-scroll"
      className="sensora-landing-scroll relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#020817]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_82%_52%_at_52%_8%,rgba(56,189,248,0.1),transparent_55%),radial-gradient(ellipse_58%_42%_at_96%_18%,rgba(139,92,246,0.08),transparent_52%),linear-gradient(180deg,#050f1e_0%,#020817_45%,#030b16_100%)]"
      />

      <section id="sensora-landing-hero" className={`${sectionShell} pb-6 pt-2 sm:pb-8 sm:pt-3 lg:pt-4`}>
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

      <section id="sensora-landing-philosophy" className={`${sectionShell} border-t border-white/[0.06] py-9 sm:py-12`}>
        <div className={`${innerMax} max-w-[560px] sm:max-w-[600px] lg:max-w-[640px]`}>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78 sm:text-[11px]">{t("landing.slides.philosophy.kicker")}</p>
          <h2 className="mx-auto mt-4 max-w-[18ch] text-center text-[clamp(1.28rem,calc(0.7rem+2.35vw),1.92rem)] font-semibold leading-[1.12] tracking-[-0.034em] text-slate-50 [word-break:keep-all] sm:max-w-[22ch]">
            {t("landing.slides.philosophy.title")}
          </h2>
          <ul className="mt-7 w-full border-t border-white/[0.08] sm:mt-9">
            {PHILOSOPHY_LINE_KEYS.map((lineKey) => (
              <li key={lineKey} className="border-b border-white/[0.08] py-[1.05rem] sm:py-[1.2rem]">
                <p className="border-l-[3px] border-sky-400/45 pl-4 text-left text-[0.9rem] font-medium leading-snug text-slate-200/93 sm:pl-[1.125rem] sm:text-[0.9575rem] sm:leading-[1.42]">
                  {t(lineKey)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex justify-center sm:mt-9">
            <a href="#sensora-landing-cta" className={`${entPrimaryBtn} min-h-[3rem] px-8 text-center`}>
              {t("landing.slides.philosophy.nextCta")}
            </a>
          </div>
        </div>
      </section>

      <section
        id="sensora-landing-cta"
        className={`${sectionShell} border-t border-white/[0.06] py-10 sm:py-14 pb-[max(2.75rem,calc(2.25rem+env(safe-area-inset-bottom,0px)))] sm:pb-[max(3rem,calc(2.5rem+env(safe-area-inset-bottom,0px)))]`}
      >
        <div className={`${innerMax} max-w-[440px] sm:max-w-[460px]`}>
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <h2 className="max-w-[24ch] text-[clamp(1.2rem,calc(0.82rem+1.85vw),1.65rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-slate-50 [word-break:keep-all] sm:max-w-[26ch]">
              {t("landing.slides.actions.closingHeadline")}
            </h2>
            <div className="landing-slide-actions-cta-cluster mx-auto mt-8 flex w-full max-w-[22rem] flex-col items-stretch gap-2.5 sm:mt-9 sm:max-w-[24rem]">
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
              className="mt-7 text-[12px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation sm:mt-8 sm:text-[13px]"
            >
              {t("landing.slides.actions.backToPhilosophy")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
