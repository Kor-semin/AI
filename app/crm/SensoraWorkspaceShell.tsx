"use client";

import { useState } from "react";

import type { CrmSection } from "./crmSectionTypes";
import { SensoraAIAssistantView } from "./SensoraAIAssistantView";
import { SensoraConsultationView } from "./SensoraConsultationView";
import { SensoraCustomerView } from "./SensoraCustomerView";
import { SensoraFollowUpView } from "./SensoraFollowUpView";
import { SensoraInventoryView } from "./SensoraInventoryView";
import { SensoraLeadQueueView } from "./SensoraLeadQueueView";
import { SensoraSalesDashboard } from "./SensoraSalesDashboard";
import { SensoraSettingsView } from "./SensoraSettingsView";
import { SensoraTeamView } from "./SensoraTeamView";

type WorkspaceMenuItem = {
  section: CrmSection;
  label: string;
  shortLabel: string;
};

const WORKSPACE_MENU: WorkspaceMenuItem[] = [
  { section: "dashboard", label: "대시보드", shortLabel: "◆" },
  { section: "customers", label: "고객관리", shortLabel: "○" },
  { section: "consulting", label: "상담 메모", shortLabel: "⌁" },
  { section: "ai", label: "AI 비서", shortLabel: "✦" },
  { section: "leadQueue", label: "Lead 접수", shortLabel: "+" },
  { section: "inventory", label: "재고 관리", shortLabel: "▣" },
  { section: "team", label: "팀 현황", shortLabel: "◎" },
  { section: "followup", label: "사후관리", shortLabel: "◔" },
  { section: "settings", label: "설정", shortLabel: "⚙" },
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
  const [activeSection, setActiveSection] = useState<CrmSection>(initialSection);
  const displayName = userName?.trim() || "김도윤";
  const todayContacts = 12;
  const highPotential = 7;
  const overdueFollowUps = 4;
  const recentConsultations = 9;

  const workspaceView = (() => {
    if (activeSection === "dashboard") {
      return (
        <SensoraSalesDashboard
          todayContacts={todayContacts}
          highPotential={highPotential}
          overdueFollowUps={overdueFollowUps}
          recentConsultations={recentConsultations}
          sellerName={displayName}
          onNavigate={setActiveSection}
        />
      );
    }

    if (activeSection === "customers") {
      return <SensoraCustomerView />;
    }

    if (activeSection === "consulting") {
      return <SensoraConsultationView />;
    }

    if (activeSection === "ai") {
      return <SensoraAIAssistantView />;
    }

    if (activeSection === "leadQueue") {
      return <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8"><SensoraLeadQueueView /></div>;
    }

    if (activeSection === "inventory") {
      return <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8"><SensoraInventoryView /></div>;
    }

    if (activeSection === "team") {
      return <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8"><SensoraTeamView /></div>;
    }

    if (activeSection === "followup") {
      return <SensoraFollowUpView />;
    }

    return <SensoraSettingsView />;
  })();

  return (
    <div className="grid min-h-screen w-full bg-[#0A0B0D] text-[#F4F6F8] lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-[#2B3037] bg-[#0D0F12] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-4 py-5 lg:sticky lg:top-0 lg:min-h-screen lg:px-6 lg:py-6">
          <button
            type="button"
            onClick={onOpenLanding}
            className="flex items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A263A]"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-[#7A263A] text-base font-semibold">S</span>
            <span>
              <span className="block text-[15px] font-semibold tracking-[0.02em]">SENSORA</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-[#7F8792]">Auto CRM</span>
            </span>
          </button>

          <div className="mt-6 w-fit rounded-full bg-[#1A1E23] px-3 py-2 text-[9px] font-medium uppercase tracking-[0.04em] text-[#B7BDC6]">Seoul · Sales</div>
          <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7F8792]">Workspace</p>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Sales Workspace 메뉴">
            {WORKSPACE_MENU.map((item) => {
              const active = activeSection === item.section;
              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => setActiveSection(item.section)}
                  className={[
                    "flex min-h-10 shrink-0 items-center gap-3 rounded-lg border px-3 text-left text-[13px] font-medium transition-colors lg:w-full",
                    active
                      ? "border-[#7A263A]/70 bg-[#2A151B] text-[#F4F6F8]"
                      : "border-transparent text-[#B7BDC6] hover:border-[#2B3037] hover:bg-[#14171B] hover:text-[#F4F6F8]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="grid size-[18px] place-items-center text-[12px] leading-none text-current" aria-hidden>{item.shortLabel}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {active ? <span className="ml-auto hidden size-1.5 rounded-full bg-[#7A263A] lg:block" /> : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 hidden border-t border-[#2B3037] pt-4 lg:block">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <span className="grid size-8 place-items-center rounded-full bg-[#1A1E23] text-xs font-semibold text-[#B7BDC6]">{displayName.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">{displayName}</span>
                <span className="block text-[10px] text-[#7F8792]">Sales Manager · 읽기 전용</span>
              </span>
            </div>
            {onSignOut ? (
              <button type="button" onClick={onSignOut} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-[11px] text-[#7F8792] hover:bg-[#14171B] hover:text-[#B7BDC6]">로그아웃</button>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="min-w-0 w-full bg-[#0A0B0D]">{workspaceView}</main>
    </div>
  );
}
