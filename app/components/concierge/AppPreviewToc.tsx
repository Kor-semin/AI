"use client";

import { useEffect } from "react";

import { UnifiedSensoraGuideFlow } from "@/app/components/concierge/UnifiedSensoraGuideFlow";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

const glassInteractive =
  "sensora-glass-surface rounded-2xl transition-[border-color,box-shadow] duration-200 hover:border-sky-400/38 hover:shadow-[0_0_44px_-16px_rgba(56,189,248,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38";

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

  /** 다이얼로그 닫기(이미지 뷰어는 자체 레이어에서 Escape 처리 가능) */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (typeof document !== "undefined" && document.querySelector("[data-sensora-guide-detail-modal]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-app-preview-toc
      className="fixed inset-0 z-[460] flex flex-col overflow-hidden bg-[#020617] text-slate-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-guide-sr-page-title"
    >
      <h2 id="unified-guide-sr-page-title" className="sr-only">
        {t("guide.unified.pageTitle")}
      </h2>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="sensora-app-preview-nebula-core" aria-hidden />
        <div className="sensora-preview-galaxy-stars absolute inset-0 opacity-[0.72]" aria-hidden />
        <div className="sensora-app-preview-galaxy__milky" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.88]"
          style={{
            backgroundImage: [
              "radial-gradient(ellipse 120% 80% at 70% -20%,rgba(56,189,248,0.16),transparent_55%)",
              "radial-gradient(ellipse 90% 60% at 14% 28%,rgba(139,92,246,0.12),transparent_54%)",
              "radial-gradient(ellipse 70% 50% at 104% 88%,rgba(30,58,138,0.16),transparent_48%)",
            ].join(","),
          }}
          aria-hidden
        />
        <div className="sensora-app-preview-galaxy__vignette" aria-hidden />
      </div>

      <header className="relative z-[2] mx-auto flex w-full max-w-[min(1200px,100%-1.5rem)] shrink-0 flex-col gap-0.5 px-2 pb-0 pt-[max(10px,calc(env(safe-area-inset-top,0px)+8px))] text-center sm:px-3 sm:pb-1 sm:pt-[max(12px,calc(env(safe-area-inset-top,0px)+10px))]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/85 sm:text-[11px]">{t("guide.unified.header.kicker")}</p>
        <p className="mx-auto max-w-[42ch] text-xs leading-snug text-slate-400 sm:text-sm">{t("guide.unified.header.sub")}</p>
        <div className="mt-1 flex justify-end pb-1 sm:mt-2 sm:pb-2">
          <button type="button" className={`${glassInteractive} min-h-11 shrink-0 px-4 py-2 text-sm font-semibold text-slate-100 touch-manipulation`} onClick={onClose}>
            {t("preview.toc.close")}
          </button>
        </div>
      </header>

      <div className="relative z-[2] flex min-h-0 flex-1 flex-col px-3 sm:px-5 lg:px-8">
        <UnifiedSensoraGuideFlow active={open} variant="dialog" onClose={onClose} onSelectSection={onSelectSection} className="min-h-0" />
      </div>
    </div>
  );
}
