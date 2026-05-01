"use client";

import Link from "next/link";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

const APP_WORKSPACE_AI = "/?view=app#crm-ai-assistant" as const;
const JOIN_PATH = "/join" as const;

const cardChrome =
  "rounded-[26px] border border-[#E5E7EB] bg-white shadow-[0_16px_48px_rgba(17,24,39,0.06),0_2px_8px_rgba(17,24,39,0.04)]";

const primaryBtn =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#111827] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937]";

const ghostBtn =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]";

const heroPrimaryBtn =
  "inline-flex min-h-[48px] min-w-[12rem] shrink-0 items-center justify-center rounded-2xl bg-[#111827] px-9 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-[#1f2937] sm:min-h-[50px] sm:min-w-[12.5rem] lg:min-h-[52px] lg:px-10 lg:text-[17px]";

const heroGhostBtn =
  "inline-flex min-h-[48px] min-w-[12rem] shrink-0 items-center justify-center rounded-2xl border border-[#E2E5EA] bg-white px-9 py-4 text-[16px] font-semibold text-[#111827] transition-colors hover:bg-[#FAFBFC] sm:min-h-[50px] sm:min-w-[12.5rem] lg:min-h-[52px] lg:px-10 lg:text-[17px]";

const heroPreviewShell =
  "overflow-hidden rounded-[30px] border border-[#E4E7EC] bg-white ring-1 ring-black/[0.035] landing-showroom-preview-card-shadow sm:rounded-[34px] lg:rounded-[36px]";

function HeroPreviewTile() {
  const { t } = useLanguage();
  return (
    <div className={`${heroPreviewShell} w-full max-w-[640px] lg:mx-0 lg:max-w-none`}>
      <div className="flex items-center gap-3 border-b border-[#EDEEF3] bg-gradient-to-b from-[#FAFBFC] to-[#F5F7F9] px-7 py-[1.125rem] sm:px-10 sm:py-5 lg:py-6">
        <div className="flex gap-2.5" aria-hidden>
          <span className="size-3 rounded-full bg-[#D2D8E2]" />
          <span className="size-3 rounded-full bg-[#D2D8E2]" />
          <span className="size-3 rounded-full bg-[#D2D8E2]" />
        </div>
        <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-[#DDE2EA] via-[#E8ECF2] to-transparent" aria-hidden />
      </div>
      <div className="space-y-6 p-7 sm:space-y-7 sm:p-9 lg:p-10 lg:pb-11">
        <div className="rounded-[1.15rem] border border-[#E8EBF1] bg-gradient-to-br from-[#FAFBFC] to-[#F2F5F9] px-6 py-[1.125rem] sm:rounded-[1.4rem] sm:px-7 sm:py-6 lg:px-8 lg:py-[1.35rem]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#455468] lg:text-[14px]">
            {t("landing.showroom.flow.mock.needsTitle")}
          </p>
          <p className="mt-3 text-[17px] font-medium leading-[1.52] text-[#111827] sm:mt-[0.875rem] sm:text-[18px] sm:leading-[1.48] lg:text-[19px] lg:leading-[1.46]">
            {t("landing.showroom.heroPreview.needsSnippet")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          <div className="rounded-[1.15rem] border border-[#E8EBF1] bg-white px-6 py-[1.125rem] sm:rounded-[1.25rem] sm:py-5 lg:px-7 lg:py-6">
            <p className="text-[13px] font-semibold uppercase tracking-[0.09em] text-[#455468] lg:text-[14px]">{t("landing.showroom.flow.mock.smsTitle")}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-[#374151] lg:mt-[0.875rem] lg:text-[16px] lg:leading-[1.5]">{t("landing.showroom.heroPreview.smsSnippet")}</p>
          </div>
          <div className="rounded-[1.15rem] border border-[#E8EBF1] bg-white px-6 py-[1.125rem] sm:rounded-[1.25rem] sm:py-5 lg:px-7 lg:py-6">
            <p className="text-[13px] font-semibold uppercase tracking-[0.09em] text-[#455468] lg:text-[14px]">{t("landing.showroom.flow.mock.followupTitle")}</p>
            <p className="mt-3 text-[15px] font-semibold leading-snug text-[#111827] lg:mt-[0.875rem] lg:text-[16px]">{t("landing.showroom.heroPreview.followupSnippet")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingShowroom() {
  return (
    <div className="overflow-x-hidden">
      <ShowroomHero />
      <ProductFlowSection />
      <SensoraGuideSection />
      <QuietAutomationSection />
      <FinalShowroomCTA />
    </div>
  );
}

function ShowroomHero() {
  const { t } = useLanguage();

  return (
    <section className="landing-showroom-hero-shell relative mx-auto w-full max-w-[1280px] overflow-x-hidden px-5 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-11 lg:flex lg:min-h-[max(760px,min(84vh,980px))] lg:items-center lg:justify-center lg:py-9 xl:min-h-[max(800px,min(85vh,1020px))] xl:py-11">
      <div className="mx-auto grid w-full max-w-[1260px] items-center gap-11 sm:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-x-12 lg:gap-y-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.42fr)] xl:gap-x-16 2xl:gap-x-[4.75rem]">
        <div className="min-w-0 lg:max-w-[34rem] xl:max-w-[36rem] 2xl:max-w-none">
          <h1 className="text-[clamp(2.25rem,6.2vw,5.25rem)] font-semibold leading-[1.04] tracking-[-0.036em] text-[#111827]">
            {t("product.name")}
          </h1>
          <p className="mt-7 max-w-[42ch] text-[clamp(1.4rem,3.05vw,2.875rem)] font-semibold leading-[1.2] tracking-[-0.028em] text-[#374151] sm:mt-8 sm:max-w-[40ch] sm:leading-[1.16] lg:mt-9 lg:text-[clamp(1.45rem,2.75vw,2.875rem)] lg:leading-[1.17] xl:leading-[1.14]">
            <span className="block sm:inline">{t("landing.showroom.hero.leadLine1")}</span>{" "}
            <span className="text-[#111827]">{t("landing.showroom.hero.leadLine2")}</span>
          </p>
          <p className="mt-8 max-w-[50ch] text-[15px] leading-[1.68] text-[#4B5563] sm:mt-10 sm:text-[17px] sm:leading-[1.64] lg:mt-11 lg:max-w-[48ch]">
            {t("landing.showroom.hero.desc")}
          </p>
          <div className="mt-10 flex max-w-full flex-col gap-3.5 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3 lg:gap-x-6">
            <Link href={APP_WORKSPACE_AI} prefetch={false} className={heroPrimaryBtn}>
              {t("cta.tryAppExperience")}
            </Link>
            <Link href={JOIN_PATH} prefetch={false} className={heroGhostBtn}>
              {t("cta.joinBeta")}
            </Link>
          </div>
        </div>
        <div className="relative min-w-0 lg:flex lg:items-center lg:justify-end">
          <div className="mx-auto w-full max-w-[min(640px,100%)] lg:mx-0 lg:max-w-none">
            <HeroPreviewTile />
          </div>
        </div>
      </div>
    </section>
  );
}

const flowCardWrap =
  "mx-auto rounded-[28px] border border-[#E8EAEE] bg-white ring-1 ring-black/[0.025] landing-showroom-flow-card-shadow";

function ProductFlowSection() {
  const { t } = useLanguage();
  const rows = [
    { titleKey: "landing.showroom.flow.mock.contactTitle", bodyKey: "landing.showroom.flow.mock.contactBody" },
    { titleKey: "landing.showroom.flow.mock.needsTitle", bodyKey: "landing.showroom.flow.mock.needsBody" },
    { titleKey: "landing.showroom.flow.mock.smsTitle", bodyKey: "landing.showroom.flow.mock.smsBody" },
    { titleKey: "landing.showroom.flow.mock.followupTitle", bodyKey: "landing.showroom.flow.mock.followupBody" },
  ] as const;

  return (
    <section className="relative mx-auto w-full max-w-[1280px] overflow-x-hidden px-5 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-14">
      <div
        className="pointer-events-none mx-auto mb-8 h-px w-[min(92%,1100px)] max-w-full bg-gradient-to-r from-transparent via-[#CBD5E1]/90 to-transparent sm:mb-10 lg:mb-12"
        aria-hidden
      />

      <div className="mx-auto max-w-[800px] text-center lg:max-w-[860px]">
        <h2 className="text-[clamp(1.6rem,3.4vw,2.375rem)] font-semibold leading-[1.2] tracking-[-0.028em] text-[#111827]">{t("landing.showroom.flow.title")}</h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[#4B5563] sm:mt-5 sm:text-[17px] sm:leading-[1.55]">{t("landing.showroom.flow.desc")}</p>
      </div>

      <div
        className={`${flowCardWrap} mx-auto mt-10 max-w-[min(760px,100%)] sm:mt-12 sm:max-w-[min(800px,100%)] lg:mt-14 lg:max-w-[min(860px,100%)]`}
      >
        <div className="divide-y divide-[#EDEEF2] px-7 py-2 sm:px-10 sm:py-4">
          {rows.map((row) => (
            <div key={row.titleKey} className="py-6 sm:py-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#475569] sm:text-[13px]">{t(row.titleKey)}</p>
              <p className="mt-3 text-[16px] font-medium leading-[1.55] text-[#111827] sm:text-[17px] sm:leading-[1.52]">{t(row.bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

function SensoraGuideSection() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-6 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-[720px] text-center lg:max-w-[800px]">
        <h2 className="text-[clamp(1.5rem,3.2vw,2.125rem)] font-semibold tracking-[-0.025em] text-[#111827]">{t("landing.showroom.guide.title")}</h2>
        <p className="mx-auto mt-4 max-w-[58ch] text-[15px] leading-relaxed text-[#4B5563] sm:text-[16px]">{t("landing.showroom.guide.desc")}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-[880px] gap-5 sm:grid-cols-2 sm:gap-6">
        <div className={`${cardChrome} p-8`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{t("landing.showroom.guide.memoLabel")}</p>
          <p className="mt-5 text-[17px] font-medium leading-relaxed text-[#111827]">“{t("landing.showroom.guide.memoQuote")}”</p>
        </div>
        <div className={`${cardChrome} bg-[#FAFAFB] p-8`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#475569]">SensoraGuide</p>
          <p className="mt-5 text-[17px] font-medium leading-relaxed text-[#111827]">{t("landing.showroom.guide.guideQuote")}</p>
        </div>
      </div>
    </section>
  );
}

function QuietAutomationSection() {
  const { t } = useLanguage();
  const tiles = (
    [
      ["landing.feature.profile.title", "landing.feature.profile.desc"],
      ["landing.feature.memory.title", "landing.feature.memory.desc"],
      ["landing.feature.followup.title", "landing.feature.followup.desc"],
      ["landing.feature.delivery.title", "landing.feature.delivery.desc"],
    ] as const
  ).map(([titleKey, descKey]) => ({
    titleKey,
    descKey,
  }));

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
      <h2 className="mx-auto max-w-[680px] text-center text-[clamp(1.5rem,3.2vw,2rem)] font-semibold tracking-[-0.025em] text-[#111827]">
        {t("landing.showroom.features.title")}
      </h2>
      <div className="mx-auto mt-12 grid max-w-[920px] gap-5 sm:grid-cols-2 lg:gap-6">
        {tiles.map(({ titleKey, descKey }) => (
          <article key={titleKey} className={`${cardChrome} px-8 py-7`}>
            <h3 className="text-[17px] font-semibold tracking-tight text-[#111827]">{t(titleKey)}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4B5563]">{t(descKey)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalShowroomCTA() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-10 sm:px-6 sm:pb-28">
      <div className={`${cardChrome} mx-auto flex max-w-[720px] flex-col items-center px-8 py-14 text-center sm:px-12`}>
        <p className="text-[clamp(1.25rem,3vw,1.625rem)] font-semibold tracking-[-0.02em] text-[#111827]">{t("brand.slogan")}</p>
        <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-[#4B5563] sm:text-[16px]">{t("landing.showroom.closing.desc")}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={APP_WORKSPACE_AI} prefetch={false} className={primaryBtn}>
            {t("cta.openAppWorkspace")}
          </Link>
          <Link href={JOIN_PATH} prefetch={false} className={ghostBtn}>
            {t("cta.joinBeta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
