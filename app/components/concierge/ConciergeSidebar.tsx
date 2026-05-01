"use client";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { CRM_SECTION_LABELS, CRM_SECTION_ORDER } from "@/app/crm/crmSectionTypes";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

function navButtonClass(active: boolean): string {
  return [
    "group relative flex min-h-[50px] shrink-0 touch-manipulation items-center justify-between gap-3 rounded-xl py-2.5 text-[16px] font-bold outline-none ring-offset-2 ring-offset-[#111827] focus-visible:ring-2 focus-visible:ring-[#64748B]",
    active
      ? "bg-[#0F172A] pl-[calc(12px+0.375rem)] pr-3 text-[#F8FAFC] ring-2 ring-inset ring-[#334155]/90 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-[#E2E8F0]"
      : "px-3.5 text-[#E5E7EB] hover:bg-[#1e293b] hover:text-white",
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
        className="landing-mobile-nav-shell relative lg:hidden -mx-1 mb-4"
        aria-label="업무 영역 메뉴"
      >
        <div className="rounded-2xl border-2 border-[#94A3B8] bg-[#E2E8F0] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          <p className="sr-only">가로로 스크롤하여 메뉴를 선택합니다.</p>
          <div
            className="crm-mobile-section-rail flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden px-0.5 pb-1 pt-0.5 [scrollbar-width:thin]"
            role="presentation"
            style={{
              scrollbarColor: "#64748B transparent",
            }}
          >
            {CRM_SECTION_ORDER.map((section) => {
              const active = activeSection === section;
              const { title, subtitle } = CRM_SECTION_LABELS[section];
              return (
                <button
                  key={`m-${section}`}
                  type="button"
                  onClick={() => onNavigate(section)}
                  className={[
                    "min-w-[8.25rem] max-w-[48vw] shrink-0 snap-start touch-manipulation rounded-xl border-2 px-3.5 py-3 text-left shadow-md transition",
                    active
                      ? "border-[#0F172A] bg-[#0F172A] text-[#F8FAFC] ring-2 ring-[#CBD5E1]/90"
                      : "border-[#64748B] bg-[#FFFFFF] text-[#0F172A] hover:border-[#0F172A] hover:bg-[#F8FAFC]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${title}, ${subtitle}`}
                >
                  <span className="block text-[15px] font-bold leading-snug">{title}</span>
                  <span className={`mt-1 block text-[12px] font-semibold leading-snug ${active ? "text-[#94A3B8]" : "text-[#475569]"}`}>
                    {subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-[274px] shrink-0 lg:block">
        <div className="sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col rounded-[18px] border border-[#334155] bg-[#0f172a] pb-6 pt-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            className="w-full border-b border-[#1E293B] px-5 pb-5 text-left transition hover:bg-[#1e293b]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#475569]"
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
