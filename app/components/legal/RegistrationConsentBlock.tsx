"use client";

import Link from "next/link";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

export type RegistrationConsentValue = {
  privacy: boolean;
  terms: boolean;
  marketing: boolean;
};

type Props = {
  value: RegistrationConsentValue;
  onChange: (next: RegistrationConsentValue) => void;
  theme: "dark" | "warm";
  /** 폼 내 `id`·`htmlFor` 충돌 방지 */
  idPrefix: string;
};

export function RegistrationConsentBlock({ value, onChange, theme, idPrefix }: Props) {
  const { t } = useLanguage();
  const patch = (p: Partial<RegistrationConsentValue>) => onChange({ ...value, ...p });

  const noteBox =
    theme === "dark"
      ? "rounded-xl border border-white/[0.12] bg-[#020817]/62 px-4 py-3.5 text-[13px] leading-relaxed text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [word-break:keep-all]"
      : "rounded-xl border border-black/10 bg-[#faf7f3] px-4 py-3.5 text-[12px] leading-relaxed text-[#4c433a] [word-break:keep-all]";

  const rowBox =
    theme === "dark"
      ? "flex min-h-[52px] cursor-pointer gap-3 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-3.5 touch-manipulation sm:px-4"
      : "flex min-h-[52px] cursor-pointer gap-3 rounded-xl border border-black/12 bg-white/90 px-3.5 py-3.5 touch-manipulation sm:px-4";

  const linkClass =
    theme === "dark"
      ? "font-semibold text-sky-300/95 underline decoration-sky-400/35 underline-offset-2 hover:text-sky-200"
      : "font-semibold text-[#1d4ed8] underline decoration-[#93c5fd] underline-offset-2 hover:text-[#1e40af]";

  const badgeReq =
    theme === "dark" ? "mr-1 font-semibold text-amber-200/95" : "mr-1 font-semibold text-amber-800/95";
  const badgeOpt =
    theme === "dark" ? "mr-1 font-semibold text-slate-400" : "mr-1 font-semibold text-[#6b6158]";

  const inputCls =
    theme === "dark"
      ? "mt-1 size-[1.15rem] shrink-0 rounded border-slate-500 bg-slate-950/80 accent-sky-500"
      : "mt-1 size-[1.15rem] shrink-0 rounded border-[#94a3b8] bg-white accent-[#1e3a8a]";

  return (
    <div className="space-y-4">
      <div className={noteBox} role="note">
        <p className={theme === "dark" ? "font-semibold text-slate-50" : "font-semibold text-[#312a24]"}>
          {t("consent.collectPurposeNote")}
        </p>
        <p className="mt-2">{t("trust.customerDbNotCollected")}</p>
        <p className="mt-2">{t("trust.userConfirmsAndSaves")}</p>
        <p className="mt-2">{t("trust.aiDraftOnly")}</p>
      </div>

      <fieldset className="space-y-3 border-0 p-0">
        <legend className="sr-only">{t("consent.fieldsetLegend")}</legend>

        <label htmlFor={`${idPrefix}-privacy`} className={rowBox}>
          <input
            id={`${idPrefix}-privacy`}
            type="checkbox"
            checked={value.privacy}
            onChange={(e) => patch({ privacy: e.target.checked })}
            className={inputCls}
          />
          <span className="min-w-0 flex-1 text-[13px] leading-snug">
            <span className={badgeReq}>{t("consent.badgeRequired")}</span>
            <Link href="/privacy" className={linkClass} target="_blank" rel="noopener noreferrer">
              {t("privacy.title")}
            </Link>
            {t("consent.privacyRequired")}
          </span>
        </label>

        <label htmlFor={`${idPrefix}-terms`} className={rowBox}>
          <input
            id={`${idPrefix}-terms`}
            type="checkbox"
            checked={value.terms}
            onChange={(e) => patch({ terms: e.target.checked })}
            className={inputCls}
          />
          <span className="min-w-0 flex-1 text-[13px] leading-snug">
            <span className={badgeReq}>{t("consent.badgeRequired")}</span>
            <Link href="/terms" className={linkClass} target="_blank" rel="noopener noreferrer">
              {t("terms.title")}
            </Link>
            {t("consent.termsRequired")}
          </span>
        </label>

        <label htmlFor={`${idPrefix}-marketing`} className={rowBox}>
          <input
            id={`${idPrefix}-marketing`}
            type="checkbox"
            checked={value.marketing}
            onChange={(e) => patch({ marketing: e.target.checked })}
            className={inputCls}
          />
          <span className="min-w-0 flex-1 text-[13px] leading-snug">
            <span className={badgeOpt}>{t("consent.badgeOptional")}</span>
            {t("consent.marketingOptional")}
          </span>
        </label>
      </fieldset>
    </div>
  );
}
