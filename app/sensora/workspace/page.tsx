"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CRMApp } from "@/app/crm/CRMApp";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { SensoraWorkspaceShell } from "@/app/crm/SensoraWorkspaceShell";

export default function SensoraWorkspacePage() {
  const [activeSection, setActiveSection] = useState<CrmSection>("dashboard");
  const router = useRouter();

  return (
    <SensoraWorkspaceShell
      activeSection={activeSection}
      onNavigate={setActiveSection}
      onOpenLanding={() => router.push("/sensora")}
      userName="Sales Preview"
    >
      <CRMApp
        uid={null}
        sellerDisplayName="Sales Preview"
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
        onOpenLandingView={() => router.push("/sensora")}
      />
    </SensoraWorkspaceShell>
  );
}
