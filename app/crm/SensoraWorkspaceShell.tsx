"use client";

import { useState } from "react";

import { sensoraB2BSeedData } from "@/lib/sensora";

import type { CrmSection } from "./crmSectionTypes";
import { SensoraInventoryView } from "./SensoraInventoryView";
import { SensoraLeadQueueView } from "./SensoraLeadQueueView";
import { SensoraSalesDashboard } from "./SensoraSalesDashboard";
import { SensoraTeamView } from "./SensoraTeamView";

type WorkspaceMenuItem = {
  section: CrmSection;
  label: string;
  shortLabel: string;
};

const WORKSPACE_MENU: WorkspaceMenuItem[] = [
  { section: "dashboard", label: "대시보드", shortLabel: "DB" },
  { section: "customers", label: "고객관리", shortLabel: "CU" },
  { section: "consulting", label: "상담 메모", shortLabel: "ME" },
  { section: "ai", label: "AI 비서", shortLabel: "AI" },
  { section: "leadQueue", label: "Lead 접수", shortLabel: "LD" },
  { section: "inventory", label: "재고 관리", shortLabel: "IN" },
  { section: "team", label: "팀 현황", shortLabel: "TM" },
  { section: "followup", label: "사후관리", shortLabel: "AF" },
  { section: "settings", label: "설정", shortLabel: "ST" },
];

const PLACEHOLDER_COPY: Partial<Record<CrmSection, { eyebrow: string; title: string; description: string }>> = {
  customers: {
    eyebrow: "Customer Workspace",
    title: "고객관리",
    description: "고객 목록과 상담 진행 상태를 확인하는 Figma-first 전용 화면을 준비하고 있습니다.",
  },
  consulting: {
    eyebrow: "Consultation Notes",
    title: "상담 메모",
    description: "상담 기록과 고객 요구사항을 정돈된 읽기 전용 구조로 확인할 수 있습니다.",
  },
  ai: {
    eyebrow: "AI Assistant",
    title: "AI 비서",
    description: "상담 요약, 다음 행동 제안과 문자 초안을 검토합니다. 자동 저장이나 자동 발송은 하지 않습니다.",
  },
  followup: {
    eyebrow: "After Sales",
    title: "사후관리",
    description: "출고 이후 고객 연락과 후속 관리 구조를 확인하는 전용 화면을 준비하고 있습니다.",
  },
  settings: {
    eyebrow: "Workspace Settings",
    title: "설정",
    description: "Sales Workspace의 사용자 환경과 조직 범위를 확인하는 읽기 전용 화면입니다.",
  },
};

type SensoraWorkspaceShellProps = {
  initialSection?: CrmSection;
  onOpenLanding?: () => void;
  onSignOut?: () => void;
  userName?: string;
};

function WorkspacePlaceholder({ section }: { section: CrmSection }) {
  const copy = PLACEHOLDER_COPY[section] ?? PLACEHOLDER_COPY.customers!;

  return (
    <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-6 sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A263A]">{copy.eyebrow}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#F4F6F8]">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B7BDC6]">{copy.description}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {["업무 구조 확인", "베타 미리보기", "실제 처리 기능 미연결"].map((label) => (
            <div key={label} className="rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-4 text-xs text-[#7F8792]">{label}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SensoraWorkspaceShell({
  initialSection = "dashboard",
  onOpenLanding,
  onSignOut,
  userName,
}: SensoraWorkspaceShellProps) {
  const [activeSection, setActiveSection] = useState<CrmSection>(initialSection);
  const displayName = userName?.trim() || "Sales Consultant";
  const todayContacts = sensoraB2BSeedData.leads.length + sensoraB2BSeedData.followUps.length;
  const highPotential = sensoraB2BSeedData.customers.filter((customer) => (customer.probability ?? 0) >= 40).length;
  const overdueFollowUps = sensoraB2BSeedData.followUps.filter((followUp) => followUp.status === "overdue").length;
  const recentConsultations = sensoraB2BSeedData.consultations.length;

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

    if (activeSection === "leadQueue") {
      return <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8"><SensoraLeadQueueView /></div>;
    }

    if (activeSection === "inventory") {
      return <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8"><SensoraInventoryView /></div>;
    }

    if (activeSection === "team") {
      return <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8"><SensoraTeamView /></div>;
    }

    return <WorkspacePlaceholder section={activeSection} />;
  })();

  return (
    <div className="grid min-h-screen w-full bg-[#0A0B0D] text-[#F4F6F8] lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-[#2B3037] bg-[#0D0F12] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-4 py-5 lg:sticky lg:top-0 lg:min-h-screen lg:px-5 lg:py-6">
          <button
            type="button"
            onClick={onOpenLanding}
            className="flex items-center gap-3 rounded-lg px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A263A]"
          >
            <span className="grid size-9 place-items-center rounded-lg border border-[#7A263A]/70 bg-[#2A151B] text-sm font-semibold">S</span>
            <span>
              <span className="block text-[15px] font-semibold tracking-[0.02em]">SENSORA</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-[#7F8792]">Auto CRM</span>
            </span>
          </button>

          <div className="mt-5 rounded-lg border border-[#2B3037] bg-[#14171B] px-3 py-2.5 lg:mt-8">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7F8792]">Workspace</p>
            <p className="mt-1 text-xs font-medium">Sales Workspace</p>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-6 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Sales Workspace 메뉴">
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
                  <span className="grid size-[18px] place-items-center rounded border border-current/30 text-[7px] font-bold tracking-tight" aria-hidden>{item.shortLabel}</span>
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
                <span className="block text-[10px] text-[#7F8792]">영업 담당자</span>
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
