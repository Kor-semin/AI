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

function HeroPreviewTile() {
  const { t } = useLanguage();
  return (
    <div className={`${cardChrome} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-6 py-4">
        <span className="text-[13px] font-semibold tracking-tight text-[#111827]">{t("product.name")}</span>
        <span className="h-2 w-2 rounded-full bg-[#CBD5E1]" aria-hidden />
      </div>
      <div className="space-y-4 p-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            {t("landing.showroom.flow.mock.needsTitle")}
          </p>
          <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#111827]">{t("landing.showroom.heroPreview.needsSnippet")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{t("landing.showroom.flow.mock.smsTitle")}</p>
            <p className="mt-2 text-[13px] leading-snug text-[#4B5563]">{t("landing.showroom.heroPreview.smsSnippet")}</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{t("landing.showroom.flow.mock.followupTitle")}</p>
            <p className="mt-2 text-[13px] font-semibold text-[#111827]">{t("landing.showroom.heroPreview.followupSnippet")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingShowroom() {
  return (
    <>
      <ShowroomHero />
      <ProductFlowSection />
      <SensoraGuideSection />
      <QuietAutomationSection />
      <FinalShowroomCTA />
    </>
  );
}

function ShowroomHero() {
  const { t } = useLanguage();

  return (
    <section className="landing-showroom-hero-shell relative mx-auto w-full max-w-[1200px] px-5 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-28">
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] xl:gap-16">
        <div>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#111827]">
            {t("product.name")}
          </h1>
          <p className="mt-6 max-w-[36ch] text-[clamp(1.25rem,2.8vw,2rem)] font-semibold leading-snug tracking-[-0.02em] text-[#374151]">
            {t("landing.showroom.hero.leadLine1")}
            <br />
            <span className="text-[#111827]">{t("landing.showroom.hero.leadLine2")}</span>
          </p>
          <p className="mt-8 max-w-[46ch] text-[15px] leading-relaxed text-[#4B5563] sm:text-[17px] sm:leading-[1.6]">{t("landing.showroom.hero.desc")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={APP_WORKSPACE_AI} prefetch={false} className={primaryBtn}>
              {t("cta.tryAppExperience")}
            </Link>
            <Link href={JOIN_PATH} prefetch={false} className={ghostBtn}>
              {t("cta.joinBeta")}
            </Link>
          </div>
        </div>
        <div className="min-w-0 lg:justify-self-end">
          <HeroPreviewTile />
        </div>
      </div>
    </section>
  );
}

function ProductFlowSection() {
  const { t } = useLanguage();
  const rows = [
    { titleKey: "landing.showroom.flow.mock.contactTitle", bodyKey: "landing.showroom.flow.mock.contactBody" },
    { titleKey: "landing.showroom.flow.mock.needsTitle", bodyKey: "landing.showroom.flow.mock.needsBody" },
    { titleKey: "landing.showroom.flow.mock.smsTitle", bodyKey: "landing.showroom.flow.mock.smsBody" },
    { titleKey: "landing.showroom.flow.mock.followupTitle", bodyKey: "landing.showroom.flow.mock.followupBody" },
  ] as const;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="text-[clamp(1.5rem,3.2vw,2.125rem)] font-semibold tracking-[-0.025em] text-[#111827]">{t("landing.showroom.flow.title")}</h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[#4B5563] sm:text-[16px]">{t("landing.showroom.flow.desc")}</p>
      </div>
      <div className={`${cardChrome} mx-auto mt-12 max-w-[640px]`}>
        <div className="divide-y divide-[#F3F4F6] px-8 py-6 sm:px-10">
          {rows.map((row) => (
            <div key={row.titleKey} className="py-6 first:pt-0 last:pb-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{t(row.titleKey)}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-[#111827]">{t(row.bodyKey)}</p>
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
    <section className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[720px] text-center">
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
    <section className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:py-20 lg:py-24">
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
    <section className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-10 sm:pb-28">
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
