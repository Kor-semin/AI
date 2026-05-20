"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import { buildSupportMailto, SUPPORT_EMAIL } from "./customerSupport";

const SECTION_CARD =
  "sensora-premium-panel sensora-premium-panel-interactive rounded-[22px] border-white/[0.11] px-6 py-6 shadow-[0_22px_52px_-28px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-7 motion-reduce:transform-none";
const SECTION_MUTED =
  "sensora-premium-panel rounded-[22px] border border-white/[0.09] bg-gradient-to-b from-slate-950/55 to-[rgba(7,17,31,0.92)] px-6 py-6 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-7";

const FAQ_KEYS: ReadonlyArray<{ q: TranslationKey; a: TranslationKey }> = [
  { q: "crm.support.faq1.q", a: "crm.support.faq1.a" },
  { q: "crm.support.faq2.q", a: "crm.support.faq2.a" },
  { q: "crm.support.faq3.q", a: "crm.support.faq3.a" },
  { q: "crm.support.faq4.q", a: "crm.support.faq4.a" },
];

const ERROR_CHECKLIST_KEYS: readonly TranslationKey[] = [
  "crm.support.error.item1",
  "crm.support.error.item2",
  "crm.support.error.item3",
  "crm.support.error.item4",
  "crm.support.error.item5",
  "crm.support.error.item6",
];

function ActionLink({
  href,
  children,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span
        className="inline-flex min-h-[46px] cursor-not-allowed items-center justify-center rounded-xl border border-white/[0.08] bg-slate-950/40 px-6 py-2.5 text-[14px] font-semibold text-slate-500"
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      className="sensora-premium-primary-workspace inline-flex min-h-[46px] items-center justify-center rounded-xl px-6 py-2.5 text-[14px] font-bold touch-manipulation"
    >
      {children}
    </a>
  );
}

export function CustomerSupportPanel() {
  const { t } = useLanguage();

  const inquiryMailto = buildSupportMailto(t("crm.support.mail.subjectInquiry"));
  const errorMailto = buildSupportMailto(t("crm.support.mail.subjectError"), t("crm.support.error.mailBody"));

  return (
    <div className="customer-support-panel mx-auto flex w-full max-w-2xl flex-col gap-8 pb-10">
      <div className="border-b border-white/[0.1] pb-6">
        <h2 className="text-[24px] font-bold tracking-tight text-slate-50">{t("crm.support.title")}</h2>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-slate-400">{t("crm.support.lead")}</p>
      </div>

      <div className="flex flex-col gap-5">
        <section className={SECTION_CARD}>
          <h3 className="text-[16px] font-bold tracking-tight text-slate-50">{t("crm.support.email.title")}</h3>
          <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">{t("crm.support.email.body")}</p>
          <p className="mt-4 text-[15px] font-semibold text-sky-100/90">
            <a href={inquiryMailto} className="underline decoration-sky-400/40 underline-offset-2 hover:text-sky-50">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-[12px] leading-[1.65] text-slate-500">{t("crm.support.email.betaNote")}</p>
          <div className="mt-5">
            <ActionLink href={inquiryMailto}>{t("crm.support.email.cta")}</ActionLink>
          </div>
        </section>

        <section className={SECTION_CARD}>
          <h3 className="text-[16px] font-bold tracking-tight text-slate-50">{t("crm.support.phone.title")}</h3>
          <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">{t("crm.support.phone.body")}</p>
          <p className="mt-4 text-[15px] font-semibold text-slate-200">{t("crm.support.phone.status")}</p>
          <p className="mt-2 text-[12px] leading-[1.65] text-slate-500">{t("crm.support.phone.betaNote")}</p>
          <div className="mt-5">
            <ActionLink disabled>{t("crm.support.phone.cta")}</ActionLink>
          </div>
        </section>

        <section className={SECTION_CARD}>
          <h3 className="text-[16px] font-bold tracking-tight text-slate-50">{t("crm.support.error.title")}</h3>
          <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">{t("crm.support.error.intro")}</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px] leading-[1.65] text-slate-300">
            {ERROR_CHECKLIST_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
          <div className="mt-5">
            <ActionLink href={errorMailto}>{t("crm.support.error.cta")}</ActionLink>
          </div>
        </section>
      </div>

      <section className={SECTION_MUTED}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">{t("crm.support.faq.title")}</h3>
        <dl className="mt-5 space-y-5">
          {FAQ_KEYS.map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-white/[0.08] bg-[#020817]/35 px-4 py-4">
              <dt className="text-[14px] font-bold text-slate-100">{t(q)}</dt>
              <dd className="mt-2 text-[14px] leading-[1.7] text-slate-400">{t(a)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={SECTION_MUTED}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">{t("crm.support.privacy.title")}</h3>
        <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.7] text-slate-400">{t("crm.support.privacy.body")}</p>
        <p className="mt-4">
          <Link
            href="/privacy"
            className="text-[14px] font-semibold text-sky-300/90 underline decoration-sky-400/35 underline-offset-2 hover:text-sky-200"
          >
            {t("crm.support.privacy.policyLink")}
          </Link>
        </p>
      </section>
    </div>
  );
}
