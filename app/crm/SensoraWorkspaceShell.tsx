"use client";

import { useState } from "react";

import type { CrmSection } from "./crmSectionTypes";
import { SensoraAIAssistantView } from "./SensoraAIAssistantView";
import { SensoraCatalogStudio } from "./SensoraCatalogStudio";
import { SensoraConsultationWorkspace } from "./SensoraConsultationWorkspace";
import { SensoraCustomerView } from "./SensoraCustomerView";
import { SensoraFollowUpView } from "./SensoraFollowUpView";
import { SensoraInventoryView } from "./SensoraInventoryView";
import { SensoraLeadQueueView } from "./SensoraLeadQueueView";
import { SensoraSalesDashboard } from "./SensoraSalesDashboard";
import { SensoraSettingsView } from "./SensoraSettingsView";
import { SensoraSymbol } from "./SensoraSymbol";
import { SensoraTeamView } from "./SensoraTeamView";

/** 사이드바 메뉴 아이콘 — 텍스트 기호(◆○⌁ 등)는 OS·폰트에 따라 깨져서 SVG로 교체 */
/** 워크스페이스 전용 섹션 — 공유 CrmSection에 없는 화면은 여기서만 확장합니다. */
type WorkspaceSection = CrmSection | "catalog";

function MenuIcon({ section }: { section: WorkspaceSection }) {
  // 워크스페이스 메뉴에 노출되는 섹션만 아이콘을 정의합니다. (pipeline·vehicle 등은 메뉴 밖)
  const paths: Partial<Record<WorkspaceSection, React.ReactNode>> = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    customers: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    consulting: (
      <>
        <path d="M6 3.5h8.5L18 7v13.5H6z" />
        <path d="M9.5 11h5M9.5 15h3" />
      </>
    ),
    ai: <path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z" />,
    leadQueue: (
      <>
        <path d="M6.5 5.5h11L20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5z" />
        <path d="M4 13h5a3 3 0 0 0 6 0h5" />
      </>
    ),
    inventory: (
      <>
        <path d="M4 8l8-4 8 4-8 4z" />
        <path d="M4 8v8l8 4 8-4V8" />
        <path d="M12 12v8" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="9" r="3" />
        <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
        <path d="M15.5 6.5a3 3 0 1 1 0 5" />
        <path d="M16.5 14a5.5 5.5 0 0 1 4 5.5" />
      </>
    ),
    followup: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.8 1.8" />
      </>
    ),
    catalog: (
      <>
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <circle cx="9" cy="11" r="2" />
        <path d="M6 16.5a3.2 3.2 0 0 1 6 0M14.5 9.5H18M14.5 13H17" />
      </>
    ),
    settings: (
      <>
        <path d="M5 7h14M5 12h14M5 17h14" />
        <circle cx="9.5" cy="7" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="8" cy="17" r="1.8" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {paths[section] ?? <circle cx="12" cy="12" r="3.5" />}
    </svg>
  );
}

type WorkspaceMenuItem = {
  section: WorkspaceSection;
  label: string;
};

const WORKSPACE_MENU: WorkspaceMenuItem[] = [
  { section: "dashboard", label: "대시보드" },
  { section: "customers", label: "고객관리" },
  { section: "consulting", label: "상담 메모" },
  { section: "ai", label: "AI 비서" },
  { section: "leadQueue", label: "Lead 접수" },
  { section: "inventory", label: "재고 관리" },
  { section: "team", label: "팀 현황" },
  { section: "followup", label: "사후관리" },
  { section: "catalog", label: "내 카탈로그" },
  { section: "settings", label: "설정" },
];

type SensoraWorkspaceShellProps = {
  initialSection?: CrmSection;
  onOpenLanding?: () => void;
  onSignOut?: () => void;
  userName?: string;
};

export function SensoraWorkspaceShell({
  initialSection = "dashboard",
  onOpenLanding,
  onSignOut,
  userName,
}: SensoraWorkspaceShellProps) {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>(initialSection);
  const displayName = userName?.trim() || "김도윤";

  const workspaceView = (() => {
    if (activeSection === "dashboard") {
      return <SensoraSalesDashboard sellerName={displayName} onNavigate={setActiveSection} />;
    }

    if (activeSection === "customers") {
      return <SensoraCustomerView onNavigate={setActiveSection} />;
    }

    if (activeSection === "consulting") {
      return <SensoraConsultationWorkspace sellerName={displayName} />;
    }

    if (activeSection === "catalog") {
      return <SensoraCatalogStudio sellerName={displayName} />;
    }

    if (activeSection === "ai") {
      return <SensoraAIAssistantView sellerName={displayName} />;
    }

    if (activeSection === "leadQueue") {
      return <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8"><SensoraLeadQueueView /></div>;
    }

    if (activeSection === "inventory") {
      return <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8"><SensoraInventoryView /></div>;
    }

    if (activeSection === "team") {
      return <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8"><SensoraTeamView /></div>;
    }

    if (activeSection === "followup") {
      return <SensoraFollowUpView />;
    }

    return <SensoraSettingsView />;
  })();

  return (
    <div className="grid min-h-screen min-w-0 w-full max-w-full grid-cols-[minmax(0,1fr)] bg-[var(--s-bg)] text-[var(--s-text)] lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="min-w-0 max-w-full overflow-hidden border-b border-[var(--s-border)] bg-[var(--s-panel)] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full min-w-0 max-w-full flex-col px-4 py-5 lg:sticky lg:top-0 lg:min-h-screen lg:px-6 lg:py-6">
          <button
            type="button"
            onClick={onOpenLanding}
            className="flex items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-hover)]"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-[#F5EEE4]">
              <SensoraSymbol className="size-6" />
            </span>
            <span>
              <span className="block text-[0.9375rem] font-semibold tracking-[0.02em]">SENSORA</span>
              <span className="mt-0.5 block text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--s-text-3)]">Auto CRM</span>
            </span>
          </button>

          <div className="mt-6 w-fit rounded-full bg-[var(--s-inner)] px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.04em] text-[var(--s-text-2)]">Seoul · Sales</div>
          <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--s-text-3)]">Workspace</p>

          <nav className="mt-5 flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Sales Workspace 메뉴">
            {WORKSPACE_MENU.map((item) => {
              const active = activeSection === item.section;
              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => setActiveSection(item.section)}
                  className={[
                    "flex min-h-10 shrink-0 items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium transition-colors lg:w-full",
                    active
                      ? "border-[var(--s-brand-border)] bg-[var(--s-brand-tint)] text-[var(--s-text)]"
                      : "border-transparent text-[var(--s-text-2)] hover:border-[var(--s-border)] hover:bg-[var(--s-card)] hover:text-[var(--s-text)]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={active ? "text-[var(--s-brand-text)]" : "text-current"}>
                    <MenuIcon section={item.section} />
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {active ? <span className="ml-auto hidden size-1.5 rounded-full bg-[var(--s-brand-text)] lg:block" /> : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 hidden border-t border-[var(--s-border)] pt-4 lg:block">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <span className="grid size-8 place-items-center rounded-full bg-[var(--s-inner)] text-xs font-semibold text-[var(--s-text-2)]">{displayName.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">{displayName}</span>
                <span className="block text-[0.6875rem] text-[var(--s-text-3)]">Sales Manager · 읽기 전용</span>
              </span>
            </div>
            {onSignOut ? (
              <button type="button" onClick={onSignOut} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-[var(--s-text-3)] hover:bg-[var(--s-card)] hover:text-[var(--s-text-2)]">로그아웃</button>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="min-w-0 w-full max-w-full bg-[var(--s-bg)]">{workspaceView}</main>
    </div>
  );
}
