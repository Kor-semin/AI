export const THEME_STORAGE_KEY = "sensora:theme" as const;

export type ThemeMode = "dark" | "light";

const VALID: readonly ThemeMode[] = ["dark", "light"];

export function normalizeThemeMode(raw: string | null | undefined): ThemeMode | null {
  if (raw === "dark" || raw === "light") return raw;
  return null;
}

export function readSystemThemePreference(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** localStorage → system → dark */
export function resolveInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
  if (stored) return stored;
  return readSystemThemePreference();
}

export function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    return normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY)) ?? readSystemThemePreference();
  } catch {
    return "dark";
  }
}

export function writeStoredTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
}
