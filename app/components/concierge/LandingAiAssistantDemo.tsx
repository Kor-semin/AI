"use client";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

const FLOW_STEP_KEYS: readonly TranslationKey[] = [
  "landing.heroDemo.flow.input",
  "landing.heroDemo.flow.ai",
  "landing.heroDemo.flow.sms",
  "landing.heroDemo.flow.next",
  "landing.heroDemo.flow.save",
];

function ResultBlock({
  label,
  body,
  hint,
}: {
  label: string;
  body: string;
  hint?: string;
}) {
  return (
    <article className="landing-hero-demo-result-block">
      <div className="landing-hero-demo-result-block-head">
        <h4 className="landing-hero-demo-result-label">{label}</h4>
        {hint ? <span className="landing-hero-demo-result-badge">{hint}</span> : null}
      </div>
      <p className="landing-hero-demo-result-body">{body}</p>
    </article>
  );
}

export function LandingAiAssistantDemo() {
  const { t } = useLanguage();

  return (
    <section
      className="landing-hero-demo mx-auto mt-6 w-full max-w-[min(100%,56rem)] sm:mt-8 lg:mt-9"
      aria-labelledby="landing-hero-demo-title"
    >
      <header className="landing-hero-demo-header text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78">
          {t("landing.heroDemo.kicker")}
        </p>
        <h2
          id="landing-hero-demo-title"
          className="mt-2 text-[1.0625rem] font-semibold leading-snug tracking-[-0.024em] text-slate-50 [word-break:keep-all] sm:text-[1.1875rem]"
        >
          {t("landing.heroDemo.title")}
        </h2>
        <p className="mx-auto mt-2.5 max-w-[36ch] text-[0.9375rem] font-medium leading-snug text-slate-200/95 [word-break:keep-all] sm:text-[1rem]">
          {t("landing.heroDemo.headline")}
        </p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[0.8125rem] leading-relaxed text-slate-500 [word-break:keep-all] sm:text-[0.875rem]">
          {t("landing.heroDemo.desc")}
        </p>
      </header>

      <div className="landing-hero-demo-flow-bar" aria-hidden>
        {FLOW_STEP_KEYS.map((key, index) => (
          <span key={key} className="landing-hero-demo-flow-bar-item">
            {index > 0 ? (
              <span className="landing-hero-demo-flow-bar-arrow" aria-hidden>
                →
              </span>
            ) : null}
            <span className="landing-hero-demo-flow-bar-pill">{t(key)}</span>
          </span>
        ))}
      </div>

      <div className="landing-hero-demo-split">
        <div className="landing-hero-demo-pane landing-hero-demo-pane--input">
          <h3 className="landing-hero-demo-pane-title">{t("landing.heroDemo.inputTitle")}</h3>
          <div
            className="landing-hero-demo-memo"
            role="group"
            aria-label={t("landing.heroDemo.inputTitle")}
          >
            <p className="whitespace-pre-line text-[0.8125rem] leading-relaxed text-slate-200/92 [word-break:keep-all] sm:text-[0.875rem]">
              {t("landing.heroDemo.inputSample")}
            </p>
          </div>
          <button
            type="button"
            disabled
            className="landing-enterprise-btn-primary landing-hero-demo-analyze-btn mt-4 inline-flex min-h-[46px] w-full cursor-default items-center justify-center rounded-xl px-4 py-2.5 text-[0.875rem] font-semibold touch-manipulation"
            aria-disabled="true"
          >
            {t("landing.heroDemo.analyzeCta")}
          </button>
        </div>

        <div className="landing-hero-demo-pane landing-hero-demo-pane--result">
          <div className="mb-3 flex items-center gap-2">
            <SensoraAnimatedMark size={24} animated={false} className="shrink-0 opacity-90" aria-hidden />
            <h3 className="landing-hero-demo-pane-title mb-0">{t("landing.heroDemo.resultTitle")}</h3>
          </div>
          <div className="landing-hero-demo-results flex flex-col gap-3">
            <ResultBlock
              label={t("landing.heroDemo.resultNeedsLabel")}
              body={t("landing.heroDemo.resultNeedsBody")}
            />
            <ResultBlock
              label={t("landing.heroDemo.resultSmsLabel")}
              hint={t("landing.heroDemo.resultSmsBadge")}
              body={t("landing.heroDemo.resultSmsBody")}
            />
            <ResultBlock
              label={t("landing.heroDemo.resultNextLabel")}
              body={t("landing.heroDemo.resultNextBody")}
            />
            <ResultBlock
              label={t("landing.heroDemo.resultSaveLabel")}
              body={t("landing.heroDemo.resultSaveBody")}
            />
          </div>
        </div>
      </div>

      <p className="landing-hero-demo-notice mt-4 text-center text-[11px] leading-relaxed text-slate-600 [word-break:keep-all]">
        {t("landing.heroDemo.notice")}
      </p>
    </section>
  );
}
