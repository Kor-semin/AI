"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

const JOIN_PATH = "/join" as const;

export type PreviewTocItem = {
  section: CrmSection;
  titleKey:
    | "preview.toc.summaryTitle"
    | "preview.toc.customersTitle"
    | "preview.toc.notesTitle"
    | "preview.toc.aiTitle"
    | "preview.toc.followupTitle";
  descKey:
    | "preview.toc.summaryDesc"
    | "preview.toc.customersDesc"
    | "preview.toc.notesDesc"
    | "preview.toc.aiDesc"
    | "preview.toc.followupDesc";
};

const PREVIEW_ITEMS: readonly PreviewTocItem[] = [
  { section: "dashboard", titleKey: "preview.toc.summaryTitle", descKey: "preview.toc.summaryDesc" },
  { section: "customers", titleKey: "preview.toc.customersTitle", descKey: "preview.toc.customersDesc" },
  { section: "consulting", titleKey: "preview.toc.notesTitle", descKey: "preview.toc.notesDesc" },
  { section: "ai", titleKey: "preview.toc.aiTitle", descKey: "preview.toc.aiDesc" },
  { section: "followup", titleKey: "preview.toc.followupTitle", descKey: "preview.toc.followupDesc" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectSection: (section: CrmSection) => void;
};

export function AppPreviewToc({ open, onClose, onSelectSection }: Props) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pick = useCallback(
    (s: CrmSection) => {
      onSelectSection(s);
    },
    [onSelectSection],
  );

  if (!open) return null;

  return (
    <div
      data-app-preview-toc
      className="fixed inset-0 z-[460] flex items-end justify-center bg-black/[0.55] px-0 pb-0 backdrop-blur-md sm:items-center sm:px-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-preview-toc-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label={t("preview.toc.close")} onClick={onClose} />
      <div
        className="landing-app-preview-toc-panel sensora-premium-modal-shell relative z-[1] flex max-h-[min(92dvh,92vh)] w-full max-w-[min(100%,560px)] flex-col overflow-hidden rounded-t-[22px] bg-gradient-to-b from-[#0a1628]/98 to-[#070f1c]/97 p-0 shadow-[0_44px_100px_-28px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.1] sm:max-h-[min(88dvh,88vh)] sm:rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.09] px-4 pb-4 pt-[max(12px,calc(env(safe-area-inset-top,0px)+10px))] sm:px-5 sm:pt-5">
          <div className="min-w-0">
            <h2 id="app-preview-toc-title" className="text-lg font-semibold leading-snug tracking-tight text-white">
              {t("preview.toc.title")}
            </h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-400">{t("preview.toc.subtitle")}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl border border-white/[0.14] bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
            onClick={onClose}
          >
            {t("preview.toc.close")}
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 pb-3 pt-3 sm:space-y-3 sm:px-5 sm:pb-4 sm:pt-4">
          <ul className="space-y-2.5 sm:space-y-3" role="list">
            {PREVIEW_ITEMS.map((item) => (
              <li key={item.section}>
                <button
                  type="button"
                  onClick={() => pick(item.section)}
                  className="w-full min-h-[4.5rem] rounded-[14px] border border-white/[0.12] bg-white/[0.05] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-sky-400/06 transition-[border-color,box-shadow,transform] hover:border-sky-400/38 hover:bg-white/[0.08] hover:shadow-[0_0_40px_-12px_rgba(56,189,248,0.15)] motion-safe:active:scale-[0.994] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/42 touch-manipulation sm:min-h-[4.65rem]"
                >
                  <span className="block text-[0.9375rem] font-semibold text-slate-50 sm:text-base">{t(item.titleKey)}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-400">{t(item.descKey)}</span>
                </button>
              </li>
            ))}
            <li>
              <Link
                href={JOIN_PATH}
                prefetch={false}
                className="block w-full rounded-[14px] border border-violet-400/28 bg-gradient-to-br from-violet-500/[0.1] to-white/[0.04] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-violet-400/15 transition hover:border-violet-400/42 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/35 touch-manipulation min-[390px]:min-h-[76px]"
                onClick={() => {
                  try {
                    onClose();
                  } catch {
                    /* ignore */
                  }
                }}
              >
                <span className="block text-[0.9375rem] font-semibold text-slate-50 sm:text-base">{t("preview.toc.betaTitle")}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-400">{t("preview.toc.betaDesc")}</span>
              </Link>
            </li>
          </ul>

          <div
            className="rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2.5 text-xs leading-relaxed text-slate-500"
            role="note"
          >
            <p>{t("preview.toc.disclaimer1")}</p>
            <p className="mt-1">{t("preview.toc.disclaimer2")}</p>
            <p className="mt-1">{t("preview.toc.disclaimer3")}</p>
            <p className="mt-1 font-medium text-slate-400">{t("preview.toc.disclaimer4")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-white/[0.09] px-4 py-[max(12px,calc(env(safe-area-inset-bottom,0px)+12px))] sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3 sm:px-5 sm:py-4">
          <button
            type="button"
            className="sensora-premium-primary-workspace inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold tracking-tight sm:min-h-11 sm:w-auto touch-manipulation"
            onClick={() => pick("dashboard")}
          >
            {t("preview.toc.openDashboard")}
          </button>
          <Link
            href={JOIN_PATH}
            prefetch={false}
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-xl border border-white/[0.2] bg-white/[0.08] px-5 py-3 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-white/[0.08] hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 sm:w-auto touch-manipulation"
            onClick={onClose}
          >
            {t("cta.joinBeta")}
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 sm:w-auto touch-manipulation"
            onClick={onClose}
          >
            {t("preview.toc.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
