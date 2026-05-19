"use client";

import type { TranslationKey } from "@/lib/i18n";
import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import type { QuickConsultationResult } from "@/app/crm/customerContextDraft";

export type QuickAiAssistantEntryProps = {
  t: (key: TranslationKey) => string;
  consultationDraft: string;
  onConsultationDraftChange: (v: string) => void;
  onAnalyze: () => void;
  busy: boolean;
  result: QuickConsultationResult | null;
  onCopySms: () => void;
  onSaveCustomer: () => void;
  saveConfirmOpen: boolean;
  onSaveConfirm: () => void;
  onSaveCancel: () => void;
  onGoCustomers: () => void;
  onGoConsulting: () => void;
  onOpenAdvancedAi?: () => void;
};

const NEED_LABEL_KEYS: { key: keyof QuickConsultationResult["needs"]; labelKey: TranslationKey }[] = [
  { key: "vehicle", labelKey: "crm.quickAi.needs.vehicle" },
  { key: "budget", labelKey: "crm.quickAi.needs.budget" },
  { key: "timing", labelKey: "crm.quickAi.needs.timing" },
  { key: "priorities", labelKey: "crm.quickAi.needs.priorities" },
  { key: "concerns", labelKey: "crm.quickAi.needs.concerns" },
];

export function QuickAiAssistantEntry({
  t,
  consultationDraft,
  onConsultationDraftChange,
  onAnalyze,
  busy,
  result,
  onCopySms,
  onSaveCustomer,
  saveConfirmOpen,
  onSaveConfirm,
  onSaveCancel,
  onGoCustomers,
  onGoConsulting,
  onOpenAdvancedAi,
}: QuickAiAssistantEntryProps) {
  const textareaCls =
    "sensora-premium-input min-h-[168px] w-full resize-y rounded-[16px] px-4 py-3.5 text-[15px] leading-relaxed";

  return (
    <section id="crm-quick-ai-entry" className="quick-ai-entry scroll-mt-24" aria-labelledby="crm-quick-ai-entry-title">
      <div className="quick-ai-entry-hero">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78">{t("crm.quickAi.kicker")}</p>
        <h1
          id="crm-quick-ai-entry-title"
          className="mt-2 text-[clamp(1.35rem,2.4vw,1.75rem)] font-semibold leading-[1.12] tracking-[-0.034em] text-slate-50 [word-break:keep-all]"
        >
          {t("crm.quickAi.title")}
        </h1>
        <p className="mt-3 max-w-[40ch] whitespace-pre-line text-[0.9375rem] leading-relaxed text-slate-300/92 [word-break:keep-all]">
          {t("crm.quickAi.sub")}
        </p>
        <p className="mt-2 max-w-[42ch] text-[0.8125rem] leading-relaxed text-slate-500 [word-break:keep-all]">
          {t("crm.quickAi.trust")}
        </p>
      </div>

      <div className="quick-ai-entry-input-card sensora-premium-card mt-6 rounded-[20px] p-4 sm:p-5">
        <label htmlFor="crm-quick-ai-memo" className="text-[13px] font-semibold text-slate-200">
          {t("crm.quickAi.inputLabel")}
        </label>
        <p className="mt-1.5 whitespace-pre-line text-[12px] leading-relaxed text-slate-500 [word-break:keep-all] sm:text-[0.8125rem]">
          {t("crm.quickAi.inputHint")}
        </p>
        <textarea
          id="crm-quick-ai-memo"
          value={consultationDraft}
          onChange={(e) => onConsultationDraftChange(e.target.value)}
          placeholder={t("crm.quickAi.inputPlaceholder")}
          className={`${textareaCls} mt-3`}
          rows={7}
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={busy || !consultationDraft.trim()}
            className="quick-ai-entry-analyze-btn landing-enterprise-btn-primary inline-flex min-h-[50px] w-full items-center justify-center rounded-xl px-5 py-3 text-[0.9375rem] font-semibold touch-manipulation sm:min-w-[12rem] sm:w-auto"
          >
            {busy ? t("crm.quickAi.analyzing") : t("crm.quickAi.analyzeCta")}
          </button>
        </div>
      </div>

      {result ? (
        <div className="quick-ai-entry-results mt-6 flex flex-col gap-4">
          <div className="quick-ai-entry-result-card sensora-premium-card rounded-[18px] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <SensoraAnimatedMark size={28} animated={false} className="shrink-0 opacity-90" aria-hidden />
              <h2 className="text-[15px] font-semibold text-slate-50">{t("crm.quickAi.needsTitle")}</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {NEED_LABEL_KEYS.map(({ key, labelKey }) => {
                const value = result.needs[key] ?? t("crm.quickAi.needsUnset");
                return (
                  <li
                    key={key}
                    className="rounded-xl border border-white/[0.08] bg-[#050f1a]/55 px-3 py-2.5 text-[0.8125rem] leading-snug sm:text-[0.875rem]"
                  >
                    <span className="font-semibold text-slate-300">{t(labelKey)}</span>
                    <span className="mt-1 block text-slate-100/92 [word-break:keep-all]">{value}</span>
                  </li>
                );
              })}
              {!result.needs.vehicle && !result.needs.budget && !result.needs.timing ? (
                <li className="rounded-xl border border-white/[0.08] bg-[#050f1a]/55 px-3 py-2.5 text-[0.8125rem] leading-relaxed text-slate-200/90 [word-break:keep-all]">
                  {result.summary}
                </li>
              ) : null}
            </ul>
          </div>

          <div className="quick-ai-entry-result-card sensora-premium-card rounded-[18px] p-4 sm:p-5">
            <h2 className="text-[15px] font-semibold text-slate-50">{t("crm.quickAi.smsTitle")}</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{t("crm.quickAi.smsDisclaimer")}</p>
            <p className="mt-3 whitespace-pre-line rounded-xl border border-white/[0.08] bg-[#030b14]/80 px-3.5 py-3 text-[0.875rem] leading-relaxed text-slate-100/92 [word-break:keep-all]">
              {result.message}
            </p>
            <button
              type="button"
              onClick={onCopySms}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/12 px-4 py-2.5 text-[0.875rem] font-semibold text-sky-100 touch-manipulation sm:w-auto"
            >
              {t("crm.quickAi.copySms")}
            </button>
          </div>

          <div className="quick-ai-entry-result-card sensora-premium-card rounded-[18px] p-4 sm:p-5">
            <h2 className="text-[15px] font-semibold text-slate-50">{t("crm.quickAi.nextActionsTitle")}</h2>
            <ul className="mt-3 list-none space-y-2">
              {result.nextActions.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 rounded-xl border border-white/[0.08] bg-[#050f1a]/55 px-3 py-2.5 text-[0.8125rem] leading-snug text-slate-200/92 sm:text-[0.875rem]"
                >
                  <span className="mt-0.5 text-sky-300/90" aria-hidden>
                    ·
                  </span>
                  <span className="[word-break:keep-all]">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="quick-ai-entry-save sensora-premium-card rounded-[18px] p-4 sm:p-5">
            {saveConfirmOpen ? (
              <div className="flex flex-col gap-3">
                <p className="text-[0.9375rem] font-semibold text-slate-50">{t("crm.quickAi.saveConfirmTitle")}</p>
                <p className="text-[0.8125rem] leading-relaxed text-slate-400 [word-break:keep-all]">
                  {t("crm.quickAi.saveConfirmBody")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSaveConfirm}
                    className="landing-enterprise-btn-primary inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-[0.875rem] font-semibold touch-manipulation sm:flex-none"
                  >
                    {t("crm.quickAi.saveConfirmYes")}
                  </button>
                  <button
                    type="button"
                    onClick={onSaveCancel}
                    className="landing-enterprise-btn-secondary inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-[0.875rem] font-semibold touch-manipulation sm:flex-none"
                  >
                    {t("crm.quickAi.saveConfirmNo")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSaveCustomer}
                className="landing-enterprise-btn-primary inline-flex min-h-[50px] w-full items-center justify-center rounded-xl px-5 py-3 text-[0.9375rem] font-semibold touch-manipulation"
              >
                {t("crm.quickAi.saveCustomer")}
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="quick-ai-entry-secondary-nav mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-5">
        <button
          type="button"
          onClick={onGoCustomers}
          className="min-h-9 px-1 text-[12px] font-semibold text-slate-500 underline decoration-white/12 underline-offset-4 transition hover:text-slate-300 touch-manipulation"
        >
          {t("crm.quickAi.goCustomers")}
        </button>
        <button
          type="button"
          onClick={onGoConsulting}
          className="min-h-9 px-1 text-[12px] font-semibold text-slate-500 underline decoration-white/12 underline-offset-4 transition hover:text-slate-300 touch-manipulation"
        >
          {t("crm.quickAi.goConsulting")}
        </button>
        {onOpenAdvancedAi ? (
          <button
            type="button"
            onClick={onOpenAdvancedAi}
            className="min-h-9 px-1 text-[12px] font-semibold text-slate-500 underline decoration-white/12 underline-offset-4 transition hover:text-slate-300 touch-manipulation"
          >
            {t("crm.quickAi.openAdvanced")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
