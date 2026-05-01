"use client";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { CRM_SECTION_LABELS } from "@/app/crm/crmSectionTypes";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

type NavItem = {
  section: CrmSection;
  label: string;
  hint: string;
};

const MENU: NavItem[] = [
  { section: "dashboard", label: "Dashboard", hint: CRM_SECTION_LABELS.dashboard.subtitle },
  { section: "customers", label: "Customers", hint: CRM_SECTION_LABELS.customers.subtitle },
  { section: "consulting", label: "Consulting Notes", hint: CRM_SECTION_LABELS.consulting.subtitle },
  { section: "ai", label: "AI Secretary", hint: CRM_SECTION_LABELS.ai.subtitle },
  { section: "pipeline", label: "Pipeline", hint: CRM_SECTION_LABELS.pipeline.subtitle },
  { section: "vehicle", label: "Vehicle Match", hint: CRM_SECTION_LABELS.vehicle.subtitle },
  { section: "followup", label: "Follow-up", hint: CRM_SECTION_LABELS.followup.subtitle },
  { section: "settings", label: "Settings", hint: CRM_SECTION_LABELS.settings.subtitle },
];

function navButtonClass(active: boolean): string {
  return [
    "group flex min-h-[44px] shrink-0 touch-manipulation items-center justify-between gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold outline-none ring-offset-2 ring-offset-[#111827] focus-visible:ring-2 focus-visible:ring-[#94A3B8]",
    active
      ? "bg-[#1F2937] text-white ring-1 ring-inset ring-[#334155] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:rounded-full before:bg-[#93C5FD] relative pl-4"
      : "text-[#F3F4F6] hover:bg-[#1F2937] hover:text-white",
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

  const renderLinks = (compact: boolean) => (
    <>
      {MENU.map((m) => {
        const active = activeSection === m.section;
        return (
          <button
            key={m.section}
            type="button"
            onClick={() => onNavigate(m.section)}
            className={compact ? navButtonClass(active).replace("pl-4", "pl-3") : navButtonClass(active)}
            aria-current={active ? "page" : undefined}
          >
            <span>{m.label}</span>
            {!compact ? (
              <span
                className={[
                  "text-[12px] font-medium",
                  active ? "text-[#E2E8F0]" : "text-[#CBD5E1]/80 group-hover:text-[#E2E8F0]",
                ].join(" ")}
              >
                {m.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* 모바일 · 태블릿: 가로 스크롤 메뉴 */}
      <nav
        className="lg:hidden -mx-1 mb-4 flex gap-1 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="CRM 주 메뉴"
      >
        {MENU.map((m) => {
          const active = activeSection === m.section;
          return (
            <button
              key={`m-${m.section}`}
              type="button"
              onClick={() => onNavigate(m.section)}
              className={[
                "shrink-0 touch-manipulation rounded-full border px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap",
                active
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-[#E5E7EB] bg-[#FFFFFF] text-[#374151] hover:bg-[#F9FAFB]",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <span className="block">{m.label}</span>
              <span className={`mt-0.5 block text-[10px] font-medium ${active ? "text-[#CBD5E1]" : "text-[#64748B]"}`}>
                {CRM_SECTION_LABELS[m.section].title}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-[260px] shrink-0 lg:block">
        <div className="sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col rounded-[22px] border border-[#374151] bg-[#111827] pb-6 pt-5 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
          <div className="border-b border-[#1F2937] px-5 pb-5">
            <div className="pointer-events-none flex justify-start pb-4">
              <SensoraAnimatedMark size={52} animated={false} />
            </div>
            <div className="text-[12px] font-semibold tracking-[0.08em] text-[#CBD5E1]">{t("header.workspace")}</div>
            <div className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-[#F9FAFB]">
              {t("product.name")}
            </div>
            <div className="mt-1.5 text-[13px] font-medium leading-snug text-[#CBD5E1]/90">
              Sales Concierge AI 스타일 영업 보조 · B2B AI SaaS
            </div>
          </div>

          <nav className="mt-4 flex flex-1 flex-col gap-1 px-3" aria-label="CRM 주 메뉴 (데스크톱)">
            {renderLinks(false)}
          </nav>
        </div>
      </aside>
    </>
  );
}
