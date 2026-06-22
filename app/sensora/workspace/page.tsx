"use client";

import { useRouter } from "next/navigation";

import { SensoraWorkspaceShell } from "@/app/crm/SensoraWorkspaceShell";

export default function SensoraWorkspacePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-[#0A0B0D] text-[#F4F6F8]">
      <SensoraWorkspaceShell
        onOpenLanding={() => router.push("/sensora")}
        userName="김도윤"
      />
    </main>
  );
}
