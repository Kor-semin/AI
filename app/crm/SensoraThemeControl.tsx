"use client";

import { useSyncExternalStore } from "react";

import {
  applyThemeToDocument,
  readStoredTheme,
  type SensoraTheme,
  writeStoredTheme,
} from "@/lib/themePreference";

const OPTIONS: readonly { id: SensoraTheme; label: string; description: string }[] = [
  { id: "dark", label: "다크", description: "어두운 배경 · 기본" },
  { id: "light", label: "라이트", description: "밝은 배경" },
];

/* 같은 탭에서의 변경을 구독하기 위한 초소형 스토어 (localStorage storage 이벤트는 타 탭 전용) */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function selectTheme(next: SensoraTheme): void {
  applyThemeToDocument(next);
  writeStoredTheme(next);
  listeners.forEach((listener) => listener());
}

/** 워크스페이스 설정용 화면 모드 컨트롤 — 선택값은 브라우저에 저장되어 전체 화면에 적용됩니다. */
export function SensoraThemeControl() {
  // SSR 스냅샷은 "dark"(부트 스크립트 기본값과 동일) → hydration 안전
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => "dark" as SensoraTheme);

  return (
    <div className="mt-5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => selectTheme(opt.id)}
              aria-pressed={active}
              className={[
                "flex min-h-[68px] flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors",
                active
                  ? "border-[var(--s-brand-border)] bg-[var(--s-brand-tint)] text-[var(--s-text)]"
                  : "border-[var(--s-border)] bg-[var(--s-inner)] text-[var(--s-text-2)] hover:border-[var(--s-brand-border-soft)] hover:text-[var(--s-text)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-ring)]",
              ].join(" ")}
            >
              <span className={`text-sm font-bold ${active ? "text-[var(--s-brand-text)]" : ""}`}>{opt.label}</span>
              <span className="text-xs text-[var(--s-text-3)]">{opt.description}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--s-text-3)]">화면 모드는 이 브라우저에 저장됩니다.</p>
    </div>
  );
}
