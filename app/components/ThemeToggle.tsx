"use client";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { useTheme } from "@/app/components/ThemeProvider";
import type { ThemeMode } from "@/lib/themePreference";

export function ThemeToggle({ dense = false }: { dense?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const btnBase = [
    "inline-flex min-h-[36px] items-center justify-center rounded-lg border text-xs font-semibold touch-manipulation transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    dense ? "min-h-[32px] px-2.5 py-1" : "min-h-[36px] px-3 py-1.5",
  ].join(" ");

  const pick = (mode: ThemeMode) =>
    [
      btnBase,
      theme === mode
        ? "sensora-theme-toggle-btn sensora-theme-toggle-btn--active border-sky-400/35 bg-sky-500/15 text-slate-50"
        : "sensora-theme-toggle-btn border-white/[0.12] bg-white/[0.04] text-slate-400 hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-slate-200",
    ].join(" ");

  return (
    <div
      className="sensora-theme-toggle inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-white/[0.1] bg-black/20 p-0.5 backdrop-blur-sm"
      role="group"
      aria-label={t("theme.toggleLabel")}
    >
      <button type="button" className={pick("dark")} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
        {t("theme.dark")}
      </button>
      <button type="button" className={pick("light")} aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
        {t("theme.light")}
      </button>
    </div>
  );
}
