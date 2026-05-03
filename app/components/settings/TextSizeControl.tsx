"use client";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { useTextSize } from "@/app/components/TextSizeProvider";
import type { TextSizeOption } from "@/lib/textSizePreference";

const OPTIONS: readonly {
  id: TextSizeOption;
  labelKey: "settings.textSize.small.label"
    | "settings.textSize.medium.label"
    | "settings.textSize.large.label";
  descKey: "settings.textSize.small.description"
    | "settings.textSize.medium.description"
    | "settings.textSize.large.description";
}[] = [
  { id: "small", labelKey: "settings.textSize.small.label", descKey: "settings.textSize.small.description" },
  { id: "medium", labelKey: "settings.textSize.medium.label", descKey: "settings.textSize.medium.description" },
  { id: "large", labelKey: "settings.textSize.large.label", descKey: "settings.textSize.large.description" },
];

export function TextSizeControl() {
  const { t } = useLanguage();
  const { textSize, setTextSize } = useTextSize();

  return (
    <div className="mt-5 space-y-4">
      <div className="grid grid-cols-1 gap-2.5 min-[390px]:grid-cols-3 sm:gap-3">
        {OPTIONS.map((opt) => {
          const active = textSize === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTextSize(opt.id)}
              aria-pressed={active}
              className={`flex min-h-[72px] w-full touch-manipulation flex-col gap-1 rounded-[14px] border px-3.5 py-3 text-left transition-[border-color,box-shadow,transform,background] motion-reduce:transition-none sm:min-h-[76px] ${
                active
                  ? "border-sky-400/62 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_42px_-10px_rgba(56,189,248,0.22)]"
                  : "border-white/[0.12] bg-slate-950/35 hover:border-sky-400/28 hover:bg-white/[0.05]"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38 motion-safe:active:scale-[0.992]`}
            >
              <span className="text-sm font-bold tracking-tight text-slate-50 sm:text-base">{t(opt.labelKey)}</span>
              <span className="text-xs font-medium leading-snug text-slate-400 sm:text-sm">{t(opt.descKey)}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">{t("settings.textSize.storageNotice")}</p>
    </div>
  );
}
