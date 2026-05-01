"use client";

import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export function LanguageSelect({ dense = false }: { dense?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="inline-flex shrink-0 items-center gap-2">
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className={[
          "rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 font-semibold text-[#111827] shadow-[inset_0_1px_2px_rgba(17,19,24,0.03)] outline-none transition hover:bg-[#F9FAFB] focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]/65",
          dense
            ? "h-8 max-w-[6.25rem] text-[11px] sm:max-w-[7.5rem] sm:text-[12px]"
            : "h-9 max-w-[46vw] text-[12px] sm:max-w-none",
        ].join(" ")}
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

