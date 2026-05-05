"use client";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import {
  CRM_SECTION_LABELS,
  CRM_SECTION_MOBILE_SUBTITLE_KEYS,
  CRM_SECTION_ORDER,
} from "@/app/crm/crmSectionTypes";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

const MENU_PRESENTATION: Record<CrmSection, { label: string; desc: string; icon: string; group: string }> = {
  dashboard: { label: "홈", desc: "오늘의 흐름", icon: "⌂", group: "요약" },
  customers: { label: "고객", desc: "목록·상태", icon: "◎", group: "관리" },
  consulting: { label: "상담", desc: "메모·기록", icon: "✎", group: "관리" },
  followup: { label: "일정/알림", desc: "다음 연락", icon: "◴", group: "실행" },
  ai: { label: "AI 도우미", desc: "초안·니즈", icon: "✦", group: "실행" },
  pipeline: { label: "메시지", desc: "단계·전환", icon: "▣", group: "분석" },
  vehicle: { label: "통계", desc: "조건·모델", icon: "◇", group: "분석" },
  settings: { label: "설정", desc: "내 정보", icon: "⚙", group: "환경" },
};

function navButtonClass(active: boolean): string {
  return [
    "crm-menu-main-item group relative flex min-h-[64px] shrink-0 touch-manipulation items-center gap-3 rounded-2xl px-3.5 py-3 text-left outline-none ring-offset-2 ring-offset-[#020817] focus-visible:ring-2 focus-visible:ring-sky-500/45",
    "motion-safe:transition-[background,box-shadow,transform,color,border-color] motion-safe:duration-[220ms] motion-safe:ease-out",
    active
      ? "crm-menu-main-item--active border border-indigo-300/34 bg-gradient-to-r from-indigo-500/[0.28] via-sky-400/[0.12] to-white/[0.035] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_34px_-20px_rgba(79,70,229,0.72),0_0_42px_-18px_rgba(56,189,248,0.42)]"
      : [
          "border border-white/[0.075] bg-white/[0.025] text-[#D7E0EF]",
          "hover:-translate-y-px hover:border-sky-300/22 hover:bg-white/[0.07] hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_28px_-20px_rgba(56,189,248,0.22)] motion-reduce:hover:translate-y-0 active:translate-y-0",
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
        const { label, desc, icon, group } = MENU_PRESENTATION[section];
        return (
          <button
            key={section}
            type="button"
            onClick={() => onNavigate(section)}
            className={navButtonClass(active)}
            aria-current={active ? "page" : undefined}
            aria-label={`${label}, ${desc}`}
          >
            <span className="crm-menu-main-icon" aria-hidden>
              {icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[15.5px] font-bold tracking-[-0.025em]">{label}</span>
                <span className={["rounded-full px-2 py-0.5 text-[10px] font-bold", active ? "bg-white/[0.13] text-sky-50" : "bg-white/[0.055] text-slate-500"].join(" ")}>
                  {group}
                </span>
              </span>
              <span className={["mt-1 block truncate text-[12px] font-semibold", active ? "text-sky-100/90" : "text-[#8FA0B6] group-hover:text-[#C8D6EA]"].join(" ")}>
                {desc}
              </span>
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
              const { label, desc, icon } = MENU_PRESENTATION[section];
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
                  aria-label={`${label}, ${desc}`}
                >
                  <span className="flex items-center gap-2 text-[0.9375rem] font-bold leading-tight">
                    <span className="grid size-7 place-items-center rounded-lg bg-white/[0.07] text-[0.82rem]" aria-hidden>{icon}</span>
                    {label}
                  </span>
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
      <aside className="hidden w-[292px] shrink-0 lg:block">
        <div className="crm-menu-shell crm-menu-target-sidebar sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col rounded-[28px] border border-white/[0.14] bg-gradient-to-b from-[#0d1525]/98 via-[#080f1d]/97 to-[#030712]/96 pb-5 pt-5 shadow-[0_34px_78px_-28px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.07),0_0_70px_-34px_rgba(99,102,241,0.28)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.045]">
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

          <div className="px-5 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">대표 메뉴</p>
            <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-400">왼쪽 선택에 따라 오른쪽 업무 패널이 바뀝니다.</p>
          </div>
          <nav className="mt-4 flex flex-1 flex-col gap-2 px-3" aria-label="업무 영역 메뉴 (데스크톱)">
            {desktopNavLinks}
          </nav>
        </div>
      </aside>
    </>
  );
}
