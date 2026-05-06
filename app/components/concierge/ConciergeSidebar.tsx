"use client";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import {
  CRM_SECTION_LABELS,
  CRM_SECTION_MOBILE_SUBTITLE_KEYS,
  CRM_SECTION_ORDER,
} from "@/app/crm/crmSectionTypes";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

function navButtonClass(active: boolean): string {
  return [
    "group relative flex min-h-[52px] shrink-0 touch-manipulation items-center justify-between gap-3 rounded-xl py-3 text-[16.5px] font-bold outline-none ring-offset-2 ring-offset-[#020817] focus-visible:ring-2 focus-visible:ring-sky-500/40",
    "motion-safe:transition-[background,box-shadow,transform,color,border-color] motion-safe:duration-[220ms] motion-safe:ease-out",
    active
      ? "border border-sky-400/22 bg-gradient-to-r from-sky-500/[0.14] via-white/[0.04] to-transparent pl-[calc(12px+0.375rem)] pr-3 text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_40px_-12px_rgba(56,189,248,0.14),0_0_48px_-18px_rgba(139,92,246,0.06)] before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-sky-300/95 before:to-indigo-400/75"
      : [
          "border border-transparent px-3.5 text-[#E5E7EB]",
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

  const desktopNavLinks = (
    <>
      {CRM_SECTION_ORDER.map((section) => {
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
            <span>{title}</span>
            <span
              className={[
                "text-[14.5px] font-semibold tracking-[-0.01em]",
                active ? "text-[#EDF4FC]" : "text-[#ADB7C9] group-hover:text-[#E9F0FA]",
              ].join(" ")}
            >
              {subtitle}
            </span>
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* 모바일 · 태블릿: 가로 스크롤 메뉴 */}
      <nav
        className="landing-mobile-nav-shell relative xl:hidden -mx-1 mb-4 max-[1279px]:mb-5"
        aria-label="업무 영역 메뉴"
      >
        <div className="rounded-[22px] border border-white/[0.13] bg-gradient-to-b from-slate-950/65 to-[#07111f]/78 px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_44px_-22px_rgba(0,0,0,0.48),0_0_48px_-22px_rgba(56,189,248,0.06)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.035]">
          <p className="sr-only">가로로 스크롤하여 메뉴를 선택합니다.</p>
          <div
            className="crm-mobile-section-rail flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 py-1 pr-10 [scrollbar-width:thin] max-[390px]:gap-2.5"
            role="presentation"
            style={{
              scrollbarColor: "#94A3B8 transparent",
            }}
          >
            {CRM_SECTION_ORDER.map((section) => {
              const active = activeSection === section;
              const { title, subtitle } = CRM_SECTION_LABELS[section];
              const caption = t(CRM_SECTION_MOBILE_SUBTITLE_KEYS[section]);
              return (
                <button
                  key={`m-${section}`}
                  type="button"
                  onClick={() => onNavigate(section)}
                  className={[
                    "flex min-h-[72px] w-[clamp(9.75rem,calc((100vw-4.25rem)/2.12),11.25rem)] max-[390px]:min-h-[70px] shrink-0 snap-start touch-manipulation flex-col justify-center gap-1 rounded-xl border px-3 py-2.5 text-left shadow-sm outline-none ring-offset-2 ring-offset-[#020817] transition focus-visible:ring-2 focus-visible:ring-sky-500/40",
                    active
                      ? "border-sky-400/40 bg-sky-500/15 text-[#F8FAFC] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] ring-2 ring-sky-400/25"
                      : [
                          "border-white/[0.11] bg-slate-950/38 text-slate-100 backdrop-blur-sm",
                          "transition-[border-color,background-color,box-shadow,transform] duration-200",
                          "hover:-translate-y-px hover:border-sky-400/22 hover:bg-slate-900/72 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)] motion-reduce:transform-none",
                        ].join(" "),
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${title}, ${subtitle}`}
                >
                  <span className="block text-[0.9375rem] font-bold leading-tight">{title}</span>
                  <span
                    className={[
                      "block hyphens-none text-balance text-[0.6875rem] font-semibold leading-[1.3]",
                      active ? "text-sky-100/85" : "text-slate-400",
                    ].join(" ")}
                  >
                    {caption}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-[258px] shrink-0 xl:block 2xl:w-[274px]">
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

          <nav className="mt-4 flex flex-1 flex-col gap-1.5 px-3" aria-label="업무 영역 메뉴 (데스크톱)">
            {desktopNavLinks}
          </nav>
        </div>
      </aside>
    </>
  );
}
