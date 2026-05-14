"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { SENSORA_GUIDES } from "@/lib/sensoraGuide";

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

function thumbGuideImage(guideId: "sensora-guide-01" | "sensora-guide-02" | "sensora-guide-04") {
  return SENSORA_GUIDES.find((g) => g.id === guideId)?.image ?? "/images/guides/sensora-guide-01.png";
}

const entPrimaryBtn =
  "landing-enterprise-btn-primary inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-2.5 text-[0.8625rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9375rem] lg:min-h-[3.125rem] lg:text-[1rem]";

const entGhostBtn =
  "landing-enterprise-btn-secondary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[0.8375rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9625rem] lg:min-h-[3.125rem]";

type LandingMenuWorkspaceRow = {
  key: string;
  target: "workspace";
  section: CrmSection;
  thumbGuideId: "sensora-guide-01" | "sensora-guide-02" | "sensora-guide-04";
  titleKey: "landing.showroom.serviceMenu.customersTitle" | "landing.showroom.serviceMenu.aiTitle" | "landing.showroom.serviceMenu.aftercareTitle";
  descKey:
    | "landing.showroom.serviceMenu.customersDesc"
    | "landing.showroom.serviceMenu.aiDesc"
    | "landing.showroom.serviceMenu.aftercareDesc";
};

type LandingMenuDeliveryRow = {
  key: string;
  target: "delivery";
  titleKey: "landing.showroom.serviceMenu.deliveryTitle";
  descKey: "landing.showroom.serviceMenu.deliveryDesc";
};

type LandingMenuRow = LandingMenuWorkspaceRow | LandingMenuDeliveryRow;

const MENU_ITEMS: LandingMenuRow[] = [
  {
    key: "customers",
    target: "workspace",
    section: "customers",
    thumbGuideId: "sensora-guide-01",
    titleKey: "landing.showroom.serviceMenu.customersTitle",
    descKey: "landing.showroom.serviceMenu.customersDesc",
  },
  {
    key: "ai",
    target: "workspace",
    section: "ai",
    thumbGuideId: "sensora-guide-02",
    titleKey: "landing.showroom.serviceMenu.aiTitle",
    descKey: "landing.showroom.serviceMenu.aiDesc",
  },
  {
    key: "followup",
    target: "workspace",
    section: "followup",
    thumbGuideId: "sensora-guide-04",
    titleKey: "landing.showroom.serviceMenu.aftercareTitle",
    descKey: "landing.showroom.serviceMenu.aftercareDesc",
  },
  {
    key: "delivery",
    target: "delivery",
    titleKey: "landing.showroom.serviceMenu.deliveryTitle",
    descKey: "landing.showroom.serviceMenu.deliveryDesc",
  },
];

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

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.65 14.42 12.41 10 7.65 5.58"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDeliveryThumb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 17h8v3h-2.5M13 17V9h8v8"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 17H3v-7l4-6h6v13zM9 22a1.5 1.5 0 1 0 .001-3.001A1.5 1.5 0 0 0 9 22zm10 0a1.5 1.5 0 1 0 .001-3.001A1.5 1.5 0 0 0 19 22zM6 10h7"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  onOpenAppWorkspace: () => void;
  onEnterWorkspaceSection: (section: CrmSection) => void;
};

export function LandingShowroom({ onOpenAppWorkspace, onEnterWorkspaceSection }: Props) {
  const { t } = useLanguage();
  const [deliveryPrepOpen, setDeliveryPrepOpen] = useState(false);

  useEffect(() => {
    if (!deliveryPrepOpen || typeof document === "undefined") return undefined;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeliveryPrepOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [deliveryPrepOpen]);

  useEffect(() => {
    if (!deliveryPrepOpen || typeof document === "undefined") return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [deliveryPrepOpen]);

  const handleMenuNavigate = useCallback(
    (row: LandingMenuRow) => {
      if (row.target === "delivery") {
        setDeliveryPrepOpen(true);
        return;
      }
      onEnterWorkspaceSection(row.section);
    },
    [onEnterWorkspaceSection],
  );

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

      {deliveryPrepOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[282] cursor-default bg-black/[0.55] backdrop-blur-md"
            aria-label={t("landing.slides.deliveryPrep.dismiss")}
            onClick={() => setDeliveryPrepOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-delivery-prep-title"
            className="fixed left-[50%] top-[42%] z-[284] w-[min(calc(100vw-28px),22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.13] bg-gradient-to-b from-[#0a1628]/99 to-[#050f18]/97 p-5 shadow-[0_36px_80px_-28px_rgba(0,0,0,0.75)]"
          >
            <h3 id="landing-delivery-prep-title" className="text-base font-semibold tracking-tight text-slate-50">
              {t("landing.slides.deliveryPrep.title")}
            </h3>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-slate-300/[0.92]">{t("landing.slides.deliveryPrep.body")}</p>
            <button
              type="button"
              onClick={() => setDeliveryPrepOpen(false)}
              className={`${entPrimaryBtn} mt-6 w-full justify-center`}
            >
              {t("landing.slides.deliveryPrep.dismiss")}
            </button>
          </div>
        </>
      ) : null}

      <section id="sensora-landing-hero" className={`${sectionShell} pb-8 pt-2 sm:pb-10 sm:pt-3 lg:pt-4`}>
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

              <button type="button" onClick={() => handleMenuNavigate(MENU_ITEMS[0])} className="landing-guide03-hotspot landing-guide03-hotspot--card-customers" aria-label={`${t(MENU_ITEMS[0].titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`}>
                <span className="sr-only">{t(MENU_ITEMS[0].titleKey)}</span>
              </button>
              <button type="button" onClick={() => handleMenuNavigate(MENU_ITEMS[1])} className="landing-guide03-hotspot landing-guide03-hotspot--card-ai" aria-label={`${t(MENU_ITEMS[1].titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`}>
                <span className="sr-only">{t(MENU_ITEMS[1].titleKey)}</span>
              </button>
              <button type="button" onClick={() => handleMenuNavigate(MENU_ITEMS[2])} className="landing-guide03-hotspot landing-guide03-hotspot--card-followup" aria-label={`${t(MENU_ITEMS[2].titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`}>
                <span className="sr-only">{t(MENU_ITEMS[2].titleKey)}</span>
              </button>
              <button type="button" onClick={() => handleMenuNavigate(MENU_ITEMS[3])} className="landing-guide03-hotspot landing-guide03-hotspot--card-delivery" aria-label={`${t(MENU_ITEMS[3].titleKey)} · ${t("landing.slides.menu.deliveryPrepAria")}`}>
                <span className="sr-only">{t(MENU_ITEMS[3].titleKey)}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="sensora-landing-services" className={`${sectionShell} border-t border-white/[0.06] py-10 sm:py-14`}>
        <div className={`${innerMax} max-w-[720px] lg:max-w-[800px]`}>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-sky-400/88 sm:text-[11px]">{t("landing.slides.menu.kicker")}</p>
          <h2 className="mt-2 text-center text-[clamp(1.35rem,calc(0.85rem+2.1vw),1.85rem)] font-semibold tracking-[-0.032em] text-slate-50">
            {t("landing.showroom.serviceMenu.sectionTitle")}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[40ch] text-center text-[0.8125rem] leading-snug text-slate-400/95 sm:mt-2 sm:text-[0.8375rem]">
            {t("landing.slides.menu.enterpriseSub")}
          </p>
          <div className="mt-5 flex w-full flex-col gap-2 sm:mt-6 sm:gap-2.5">
            {MENU_ITEMS.map((row) => (
              <button
                key={row.key}
                type="button"
                aria-label={
                  row.target === "delivery"
                    ? `${t(row.titleKey)} · ${t("landing.slides.menu.deliveryPrepAria")}`
                    : `${t(row.titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`
                }
                onClick={() => handleMenuNavigate(row)}
                className="landing-slide-menu-row group flex min-h-[4rem] w-full items-center gap-3 rounded-xl border border-white/[0.1] bg-[#050f1a]/88 px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-[border-color,background-color] hover:border-sky-400/28 hover:bg-[#071425]/95 active:scale-[0.996] touch-manipulation sm:min-h-[4.375rem] sm:gap-4 sm:px-4 sm:py-3"
              >
                {row.target === "workspace" ? (
                  <div className="relative h-[2.75rem] w-[3.7rem] shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#020617] sm:h-[3rem] sm:w-[4.1rem]">
                    <Image
                      src={thumbGuideImage(row.thumbGuideId)}
                      alt=""
                      fill
                      className="object-cover object-center opacity-[0.9]"
                      sizes="72px"
                      quality={92}
                    />
                  </div>
                ) : (
                  <div className="flex size-[2.75rem] shrink-0 items-center justify-center rounded-lg border border-dashed border-sky-400/22 bg-[#081422]/92 text-sky-300/82 sm:size-[3rem]">
                    <IconDeliveryThumb className="size-[1.35rem]" />
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[1.03rem] font-semibold leading-tight tracking-[-0.02em] text-slate-50 sm:text-[1.1rem]">{t(row.titleKey)}</p>
                  <p className="mt-0.5 line-clamp-1 text-[0.765rem] leading-snug text-slate-400/92 sm:text-[0.8rem]">{t(row.descKey)}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sky-200/88">
                  <span className="max-w-[6.5rem] text-right text-[11px] font-semibold leading-tight text-sky-100/88 sm:max-w-none sm:text-[12px]">
                    {row.target === "delivery" ? t("landing.slides.menu.actionDeliveryStatus") : t("landing.slides.menu.actionGoWorkspace")}
                  </span>
                  <IconChevron className="size-[1.05rem] shrink-0 opacity-88 transition group-hover:translate-x-0.5 sm:size-[1.1rem]" />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:mt-10">
            <a
              href="#sensora-landing-philosophy"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.04] px-7 py-2.5 text-[13px] font-semibold text-slate-100 transition hover:border-sky-400/28 hover:bg-white/[0.07] touch-manipulation"
            >
              {t("landing.slides.menu.nextPhilosophy")}
            </a>
          </div>
        </div>
      </section>

      <section id="sensora-landing-philosophy" className={`${sectionShell} border-t border-white/[0.06] py-10 sm:py-14`}>
        <div className={`${innerMax} max-w-[560px] sm:max-w-[600px] lg:max-w-[640px]`}>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78 sm:text-[11px]">{t("landing.slides.philosophy.kicker")}</p>
          <h2 className="mt-4 max-w-[18ch] text-center text-[clamp(1.28rem,calc(0.7rem+2.35vw),1.92rem)] font-semibold leading-[1.12] tracking-[-0.034em] text-slate-50 [word-break:keep-all] sm:max-w-[22ch] mx-auto">
            {t("landing.slides.philosophy.title")}
          </h2>
          <ul className="mt-8 w-full border-t border-white/[0.08] sm:mt-10">
            {PHILOSOPHY_LINE_KEYS.map((lineKey) => (
              <li key={lineKey} className="border-b border-white/[0.08] py-[1.05rem] sm:py-[1.2rem]">
                <p className="border-l-[3px] border-sky-400/45 pl-4 text-left text-[0.9rem] font-medium leading-snug text-slate-200/93 sm:pl-[1.125rem] sm:text-[0.9575rem] sm:leading-[1.42]">
                  {t(lineKey)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-center sm:mt-10">
            <a href="#sensora-landing-cta" className={`${entPrimaryBtn} min-h-[3rem] px-8 text-center`}>
              {t("landing.slides.philosophy.nextCta")}
            </a>
          </div>
        </div>
      </section>

      <section id="sensora-landing-cta" className={`${sectionShell} border-t border-white/[0.06] py-12 sm:py-16 pb-[max(3rem,calc(2.5rem+env(safe-area-inset-bottom,0px)))]`}>
        <div className={`${innerMax} max-w-[440px] sm:max-w-[460px]`}>
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <h2 className="max-w-[24ch] text-[clamp(1.2rem,calc(0.82rem+1.85vw),1.65rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-slate-50 [word-break:keep-all] sm:max-w-[26ch]">
              {t("landing.slides.actions.closingHeadline")}
            </h2>
            <div className="landing-slide-actions-cta-cluster mx-auto mt-9 flex w-full max-w-[22rem] flex-col items-stretch gap-2.5 sm:mt-10 sm:max-w-[24rem]">
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
              className="mt-8 text-[12px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation sm:text-[13px]"
            >
              {t("landing.slides.actions.backToPhilosophy")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
