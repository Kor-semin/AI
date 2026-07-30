export const THEME_STORAGE_KEY = "sensora:theme" as const;

/** 화면 모드 — 기본은 다크(기존 화면), 라이트는 사용자 선택. */
export type SensoraTheme = "dark" | "light";

export function normalizeTheme(raw: string | null | undefined): SensoraTheme {
  return raw === "light" ? "light" : "dark";
}

/** 브라우저에서 호출 전제 (SSR 안전 가드 포함) */
export function readStoredTheme(): SensoraTheme {
  if (typeof window === "undefined") return "dark";
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "dark";
  }
}

export function writeStoredTheme(theme: SensoraTheme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function applyThemeToDocument(theme: SensoraTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
