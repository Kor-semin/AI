"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import {
  buildSupportMailto,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
} from "./customerSupport";

const QUICK_CONTACT_CARD =
  "customer-support-quick-card sensora-premium-panel sensora-premium-panel-interactive flex h-full flex-col rounded-[22px] border border-sky-400/20 bg-gradient-to-b from-sky-950/25 via-[#07111f]/90 to-[#020817]/92 px-5 py-5 shadow-[0_22px_52px_-28px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:px-6 sm:py-6 motion-reduce:transform-none";

const ERROR_CARD =
  "customer-support-error-card sensora-premium-panel sensora-premium-panel-interactive rounded-[22px] border border-amber-400/15 bg-gradient-to-br from-amber-950/20 via-[#07111f]/92 to-[#020817]/94 px-5 py-5 shadow-[0_22px_52px_-28px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:px-7 sm:py-6 motion-reduce:transform-none";

const SECTION_MUTED =
  "sensora-premium-panel rounded-[22px] border border-white/[0.09] bg-gradient-to-b from-slate-950/55 to-[rgba(7,17,31,0.92)] px-5 py-5 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-7 sm:py-6";

const FAQ_KEYS: ReadonlyArray<{ q: TranslationKey; a: TranslationKey }> = [
  { q: "crm.support.faq1.q", a: "crm.support.faq1.a" },
  { q: "crm.support.faq2.q", a: "crm.support.faq2.a" },
  { q: "crm.support.faq3.q", a: "crm.support.faq3.a" },
  { q: "crm.support.faq4.q", a: "crm.support.faq4.a" },
  { q: "crm.support.faq5.q", a: "crm.support.faq5.a" },
];

const ERROR_CHECKLIST_KEYS: readonly TranslationKey[] = [
  "crm.support.error.item1",
  "crm.support.error.item2",
  "crm.support.error.item3",
  "crm.support.error.item4",
  "crm.support.error.item5",
  "crm.support.error.item6",
];

function ActionLink({ href, children, fullWidth = true }: { href: string; children: ReactNode; fullWidth?: boolean }) {
  return (
    <a
      href={href}
      className={[
        "sensora-premium-primary-workspace inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 py-2.5 text-[14px] font-bold touch-manipulation",
        fullWidth ? "w-full" : "",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

function QuickContactCard({
  title,
  body,
  contactHref,
  contactLabel,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  contactHref: string;
  contactLabel: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <article className={QUICK_CONTACT_CARD}>
      <h3 className="text-[15px] font-bold tracking-tight text-slate-50">{title}</h3>
      <p className="mt-3 break-words text-[15px] font-semibold leading-snug text-sky-100/95">
        <a href={contactHref} className="underline decoration-sky-400/45 underline-offset-2 hover:text-sky-50">
          {contactLabel}
        </a>
      </p>
      <p className="mt-3 flex-1 text-[13px] leading-[1.65] text-slate-400">{body}</p>
      <div className="mt-5 pt-1">
        <ActionLink href={ctaHref}>{ctaLabel}</ActionLink>
      </div>
    </article>
  );
}

export function CustomerSupportPanel() {
  const { t } = useLanguage();

  const inquiryMailto = buildSupportMailto(t("crm.support.mail.subjectInquiry"));
  const errorMailto = buildSupportMailto(t("crm.support.mail.subjectError"), t("crm.support.error.mailBody"));

  return (
    <div className="customer-support-panel mx-auto flex w-full max-w-3xl flex-col gap-7 pb-10">
      <header className="border-b border-white/[0.1] pb-5">
        <h2 className="text-[24px] font-bold tracking-tight text-slate-50">{t("crm.support.title")}</h2>
        <p className="mt-3 max-w-[42rem] whitespace-pre-line text-[15px] leading-[1.7] text-slate-400">{t("crm.support.lead")}</p>
      </header>

      <section aria-labelledby="customer-support-quick-heading">
        <h3
          id="customer-support-quick-heading"
          className="text-[12px] font-bold uppercase tracking-[0.14em] text-sky-200/75"
        >
          {t("crm.support.quick.title")}
        </h3>
        <div className="customer-support-quick-grid mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <QuickContactCard
            title={t("crm.support.email.title")}
            body={t("crm.support.email.body")}
            contactHref={inquiryMailto}
            contactLabel={SUPPORT_EMAIL}
            ctaHref={inquiryMailto}
            ctaLabel={t("crm.support.email.cta")}
          />
          <QuickContactCard
            title={t("crm.support.phone.title")}
            body={t("crm.support.phone.body")}
            contactHref={SUPPORT_PHONE_TEL}
            contactLabel={SUPPORT_PHONE_DISPLAY}
            ctaHref={SUPPORT_PHONE_TEL}
            ctaLabel={t("crm.support.phone.cta")}
          />
        </div>
      </section>

      <section className={ERROR_CARD} aria-labelledby="customer-support-error-heading">
        <h3 id="customer-support-error-heading" className="text-[16px] font-bold tracking-tight text-slate-50">
          {t("crm.support.error.title")}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.65] text-slate-400">{t("crm.support.error.intro")}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ERROR_CHECKLIST_KEYS.map((key) => (
            <li
              key={key}
              className="flex gap-2 rounded-lg border border-white/[0.06] bg-[#020817]/40 px-3 py-2 text-[13px] leading-snug text-slate-300"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300/70" aria-hidden />
              {t(key)}
            </li>
          ))}
        </ul>
        <div className="mt-5 sm:max-w-xs">
          <ActionLink href={errorMailto}>{t("crm.support.error.cta")}</ActionLink>
        </div>
      </section>

      <div className="customer-support-secondary flex flex-col gap-5 border-t border-white/[0.08] pt-2">
        <section className={SECTION_MUTED}>
          <h3 className="text-[15px] font-bold tracking-tight text-slate-200">{t("crm.support.faq.title")}</h3>
          <dl className="mt-4 space-y-3">
            {FAQ_KEYS.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-white/[0.07] bg-[#020817]/30 px-4 py-3.5">
                <dt className="text-[13px] font-bold leading-snug text-slate-100">{t(q)}</dt>
                <dd className="mt-1.5 text-[13px] leading-[1.65] text-slate-500">{t(a)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={SECTION_MUTED}>
          <h3 className="text-[15px] font-bold tracking-tight text-slate-200">{t("crm.support.privacy.title")}</h3>
          <p className="mt-3 whitespace-pre-line text-[13px] leading-[1.7] text-slate-500">{t("crm.support.privacy.body")}</p>
          <p className="mt-3">
            <Link
              href="/privacy"
              className="text-[13px] font-semibold text-sky-300/85 underline decoration-sky-400/30 underline-offset-2 hover:text-sky-200"
            >
              {t("crm.support.privacy.policyLink")}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
