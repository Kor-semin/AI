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
  featured = false,
}: {
  label: string;
  body: string;
  hint?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={[
        "landing-hero-demo-result-block",
        featured ? "landing-hero-demo-result-block--featured" : "",
      ].join(" ")}
    >
      <div className="landing-hero-demo-result-block-head">
        <h4 className="landing-hero-demo-result-label">{label}</h4>
        {hint ? <span className="landing-hero-demo-result-badge">{hint}</span> : null}
        {featured ? (
          <span className="landing-hero-demo-copy-chip" aria-hidden>
            복사
          </span>
        ) : null}
      </div>
      <p
        className={[
          "landing-hero-demo-result-body",
          featured ? "landing-hero-demo-result-body--featured whitespace-pre-line max-h-[13.5rem] overflow-y-auto sm:max-h-none sm:overflow-visible" : "",
        ].join(" ")}
      >
        {body}
      </p>
    </article>
  );
}

export function LandingAiAssistantDemo() {
  const { t } = useLanguage();

  return (
    <section
      className="landing-hero-demo"
      aria-labelledby="landing-hero-demo-title"
    >
      <header className="landing-hero-demo-header text-center">
        <p className="landing-hero-demo-kicker">{t("landing.heroDemo.kicker")}</p>
        <h2 id="landing-hero-demo-title" className="landing-hero-demo-title">
          {t("landing.heroDemo.title")}
        </h2>
        <p className="landing-hero-demo-headline">{t("landing.heroDemo.headline")}</p>
        <p className="landing-hero-demo-desc">{t("landing.heroDemo.desc")}</p>
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
            <p className="landing-hero-demo-memo-text">{t("landing.heroDemo.inputSample")}</p>
          </div>
          <button
            type="button"
            disabled
            className="landing-enterprise-btn-primary landing-hero-demo-analyze-btn"
            aria-disabled="true"
          >
            {t("landing.heroDemo.analyzeCta")}
          </button>
        </div>

        <div className="landing-hero-demo-pane landing-hero-demo-pane--result">
          <div className="landing-hero-demo-pane-result-head">
            <SensoraAnimatedMark size={28} animated={false} className="shrink-0 opacity-95" aria-hidden />
            <h3 className="landing-hero-demo-pane-title mb-0">{t("landing.heroDemo.resultTitle")}</h3>
          </div>
          <div className="landing-hero-demo-results">
            <ResultBlock
              label={t("landing.heroDemo.resultNeedsLabel")}
              body={t("landing.heroDemo.resultNeedsBody")}
            />
            <ResultBlock
              label={t("landing.heroDemo.resultSmsLabel")}
              hint={t("landing.heroDemo.resultSmsBadge")}
              body={t("landing.heroDemo.resultSmsBody")}
              featured
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

      <p className="landing-hero-demo-notice">{t("landing.heroDemo.notice")}</p>
    </section>
  );
}
