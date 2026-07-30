"use client";

import { useRouter } from "next/navigation";

import { SensoraWorkspaceShell } from "@/app/crm/SensoraWorkspaceShell";

export default function SensoraWorkspacePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full bg-[var(--s-bg)] text-[var(--s-text)]">
      <SensoraWorkspaceShell
        onOpenLanding={() => router.push("/sensora")}
        userName="김도윤"
      />
    </main>
  );
}
