"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConciergeSidebar } from "@/app/components/concierge/ConciergeSidebar";
import { CRMApp } from "@/app/crm/CRMApp";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

export default function SensoraLegacyPage() {
  const [activeSection, setActiveSection] = useState<CrmSection>("customers");
  const router = useRouter();

  return (
    <main className="crm-bg crm-app-stage min-h-screen px-4 py-6 text-slate-100 sm:px-6">
      <div className="mx-auto mb-5 flex w-full max-w-[1520px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-slate-950/55 px-5 py-4 backdrop-blur-xl">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Sensora Legacy</p>
          <h1 className="mt-1 text-base font-semibold text-slate-100">기존 CRM 확인 화면</h1>
        </div>
        <Link href="/sensora/workspace" className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.1]">
          Figma-first Workspace로 이동
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-2 xl:flex-row xl:gap-6 2xl:gap-8">
        <ConciergeSidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          onOpenLanding={() => router.push("/sensora")}
        />
        <div className="relative min-h-[60vh] min-w-0 flex-1 rounded-2xl">
          <CRMApp
            uid={null}
            sellerDisplayName="Legacy Preview"
            activeSection={activeSection}
            onActiveSectionChange={setActiveSection}
            onOpenLandingView={() => router.push("/sensora")}
          />
        </div>
      </div>
    </main>
  );
}
