"use client";

import { useEffect, useRef } from "react";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import {
  CRM_SECTION_LABELS,
  CRM_SECTION_MOBILE_SUBTITLE_KEYS,
  CRM_SECTION_ORDER,
  type CrmSection,
} from "@/app/crm/crmSectionTypes";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

const CRM_NAV_FOOTER_SECTIONS: CrmSection[] = ["settings", "support"];
const CRM_NAV_MAIN_SECTIONS = CRM_SECTION_ORDER.filter((s) => !CRM_NAV_FOOTER_SECTIONS.includes(s));

function navButtonClass(active: boolean): string {
  return [
    "crm-desktop-nav-item group relative flex w-full shrink-0 flex-col items-start justify-center gap-0.5 rounded-xl py-2 pl-3 pr-2.5 min-h-[46px] text-left touch-manipulation outline-none ring-offset-2 ring-offset-[#020817] focus-visible:ring-2 focus-visible:ring-sky-500/40",
    "motion-safe:transition-[background,box-shadow,transform,color,border-color] motion-safe:duration-[220ms] motion-safe:ease-out",
    active
      ? "border border-sky-400/22 bg-gradient-to-r from-sky-500/[0.14] via-white/[0.04] to-transparent pl-[calc(10px+0.375rem)] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_40px_-12px_rgba(56,189,248,0.14),0_0_48px_-18px_rgba(139,92,246,0.06)] before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-sky-300/95 before:to-indigo-400/75"
      : [
          "border border-transparent text-[#E5E7EB]",
          "hover:-translate-y-px hover:border-white/[0.1] hover:bg-white/[0.08] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_32px_-12px_rgba(56,189,248,0.08)] motion-reduce:hover:translate-y-0 active:translate-y-0",
        ].join(" "),
  ].join(" ");
}

export function ConciergeSidebar({
  activeSection,
  onNavigate,
  onOpenLanding,
}: {
  activeSection: CrmSection;
  onNavigate: (s: CrmSection) => void;
  onOpenLanding: () => void;
}) {
  const { t } = useLanguage();
  const mobileRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = mobileRailRef.current;
    if (!rail) return;
    const activeBtn = rail.querySelector<HTMLButtonElement>('button[aria-current="page"]');
    if (!activeBtn) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeBtn.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [activeSection]);

  const renderNavButton = (section: CrmSection) => {
    const active = activeSection === section;
    const { title, subtitle } = CRM_SECTION_LABELS[section];
    return (
      <button
        key={section}
        type="button"
        onClick={() => onNavigate(section)}
        className={navButtonClass(active)}
        aria-current={active ? "page" : undefined}
        aria-label={`${title}, ${subtitle}`}
      >
        <span className="crm-desktop-nav-item__title w-full min-w-0 truncate">{title}</span>
        <span className="crm-desktop-nav-item__subtitle w-full min-w-0 truncate">{subtitle}</span>
      </button>
    );
  };

  const desktopNavLinks = (
    <>
      {CRM_NAV_MAIN_SECTIONS.map(renderNavButton)}
      <div className="my-2 border-t border-white/[0.08] pt-2" role="presentation" aria-hidden />
      {CRM_NAV_FOOTER_SECTIONS.map(renderNavButton)}
    </>
  );

  return (
    <>
      {/* 모바일 · 태블릿: 가로 스크롤 메뉴 */}
      <nav
        className="landing-mobile-nav-shell relative lg:hidden -mx-1 mb-4 max-[1023px]:mb-5"
        aria-label="업무 영역 메뉴"
      >
        <div className="rounded-[22px] border border-white/[0.13] bg-gradient-to-b from-slate-950/65 to-[#07111f]/78 px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_44px_-22px_rgba(0,0,0,0.48),0_0_48px_-22px_rgba(56,189,248,0.06)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.035]">
          <p className="sr-only">가로로 스크롤하여 메뉴를 선택합니다.</p>
          <div ref={mobileRailRef} className="crm-mobile-section-rail py-1" role="presentation">
            {CRM_SECTION_ORDER.map((section) => {
              const active = activeSection === section;
              const { title, subtitle } = CRM_SECTION_LABELS[section];
              const caption = t(CRM_SECTION_MOBILE_SUBTITLE_KEYS[section]);
              return (
                <button
                  key={`m-${section}`}
                  type="button"
                  onClick={() => onNavigate(section)}
                  className="crm-mobile-section-rail__card"
                  aria-current={active ? "page" : undefined}
                  aria-label={`${title}, ${subtitle}`}
                >
                  <span className="crm-mobile-section-rail__title">{title}</span>
                  <span className="crm-mobile-section-rail__caption">{caption}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 데스크톱 사이드바 */}
      <aside className="crm-desktop-sidebar hidden w-[288px] shrink-0 lg:block">
        <div className="sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col rounded-[22px] border border-white/[0.13] bg-gradient-to-b from-[#0a1524]/96 via-[#07111f]/95 to-[#020817]/94 pb-6 pt-5 shadow-[0_32px_72px_-26px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.055),0_0_64px_-28px_rgba(56,189,248,0.07)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.04]">
          <button
            type="button"
            className="w-full border-b border-white/[0.08] px-5 pb-5 text-left transition duration-200 hover:bg-white/[0.04] hover:shadow-[inset_0_-1px_0_rgba(56,189,248,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35"
            onClick={onOpenLanding}
            aria-label={`${t("header.workspace")} · ${t("product.name")} — 랜딩으로 이동`}
          >
            <div className="flex justify-start pb-3.5 cursor-default pointer-events-none" aria-hidden>
              <SensoraAnimatedMark size={52} animated={false} />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-sky-200/75">{t("header.workspace")}</div>
            <div className="mt-2.5 text-base font-bold leading-snug tracking-tight text-[#F9FAFB]">
              {t("product.name")}
            </div>
            <div className="mt-1.5 text-sm font-semibold leading-snug text-[#94A3B8]">{t("brand.subline")}</div>
          </button>

          <nav className="crm-desktop-nav mt-4 flex flex-1 flex-col gap-1 px-3" aria-label="업무 영역 메뉴 (데스크톱)">
            {desktopNavLinks}
          </nav>
        </div>
      </aside>
    </>
  );
}
