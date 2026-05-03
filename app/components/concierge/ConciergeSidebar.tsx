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
    "group relative flex min-h-[50px] shrink-0 touch-manipulation items-center justify-between gap-3 rounded-xl py-2.5 text-[16px] font-bold outline-none ring-offset-2 ring-offset-[#020817] focus-visible:ring-2 focus-visible:ring-sky-500/40",
    "transition-[background,box-shadow,transform,color,border-color] duration-[220ms] ease-out",
    active
      ? "bg-sky-500/14 pl-[calc(12px+0.375rem)] pr-3 text-[#F8FAFC] ring-2 ring-inset ring-sky-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_36px_-12px_rgba(56,189,248,0.12)] before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-sky-400/85"
      : [
          "px-3.5 text-[#E5E7EB]",
          "hover:-translate-y-px hover:bg-white/[0.07] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_28px_-10px_rgba(56,189,248,0.06)] active:translate-y-0",
        ].join(" "),
  ].join(" ");
}

export function ConciergeSidebar({
  activeSection,
  onNavigate,
}: {
  activeSection: CrmSection;
  onNavigate: (s: CrmSection) => void;
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
                "text-[14px] font-semibold tracking-[-0.01em]",
                active ? "text-[#E2E8F0]" : "text-[#94A3B8] group-hover:text-[#E2E8F0]",
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
        className="landing-mobile-nav-shell relative lg:hidden -mx-1 mb-4 max-[1023px]:mb-5"
        aria-label="업무 영역 메뉴"
      >
        <div className="rounded-2xl border border-white/[0.12] bg-gradient-to-b from-slate-950/60 to-[#07111f]/72 px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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
                  <span className="block text-[15px] font-bold leading-tight">{title}</span>
                  <span
                    className={[
                      "block hyphens-none text-balance text-[11px] font-semibold leading-[1.3]",
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
      <aside className="hidden w-[274px] shrink-0 lg:block">
        <div className="sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col rounded-[20px] border border-white/[0.12] bg-gradient-to-b from-[#07111f]/98 to-[#020817]/95 pb-6 pt-5 shadow-[0_28px_64px_-24px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl">
          <button
            type="button"
            className="w-full border-b border-[#1E293B] px-5 pb-5 text-left transition duration-200 hover:bg-[#1e293b]/55 hover:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35"
            onClick={() => onNavigate("dashboard")}
            aria-label={`${t("header.workspace")} · ${t("product.name")} — 요약으로 이동`}
          >
            <div className="flex justify-start pb-4 cursor-default pointer-events-none" aria-hidden>
              <SensoraAnimatedMark size={52} animated={false} />
            </div>
            <div className="text-[12px] font-bold tracking-[0.08em] text-[#CBD5E1]">{t("header.workspace")}</div>
            <div className="mt-3 text-[16px] font-bold leading-snug tracking-tight text-[#F9FAFB]">
              {t("product.name")}
            </div>
            <div className="mt-1.5 text-[13px] font-semibold leading-snug text-[#94A3B8]">{t("brand.subline")}</div>
          </button>

          <nav className="mt-4 flex flex-1 flex-col gap-1.5 px-3" aria-label="업무 영역 메뉴 (데스크톱)">
            {desktopNavLinks}
          </nav>
        </div>
      </aside>
    </>
  );
}
