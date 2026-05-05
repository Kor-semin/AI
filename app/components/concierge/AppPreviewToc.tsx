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
  onGoLanding: () => void;
  onSelectSection: (section: CrmSection) => void;
};

/**
 * 앱 미리보기 전체 화면 — 본문은 `UnifiedSensoraGuideFlow` 단일 흐름만 노출합니다.
 * (예전 목차형 헤더/중복 안내는 제거해 랜딩·헤더·히어로의 「앱 화면 미리보기」와 동일 경험으로 통일)
 */
export function AppPreviewToc({ open, onClose, onGoLanding, onSelectSection }: Props) {
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

      <button
        type="button"
        data-app-preview-toc-close
        className={`pointer-events-auto fixed right-[max(0.5rem,calc(env(safe-area-inset-right,0px)+0.35rem))] top-[max(0.35rem,calc(env(safe-area-inset-top,0px)+0.25rem))] z-[465] ${glassInteractive} min-h-10 px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-slate-200/95 shadow-md backdrop-blur-md touch-manipulation sm:right-4 sm:top-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.5rem))] sm:min-h-11 sm:px-3.5 sm:py-2 sm:text-sm sm:font-semibold sm:text-slate-100 sm:shadow-lg`}
        onClick={onClose}
        aria-label={t("preview.toc.close")}
      >
        {t("preview.toc.close")}
      </button>

      <button
        type="button"
        className="pointer-events-auto fixed left-[max(0.5rem,calc(env(safe-area-inset-left,0px)+0.35rem))] top-[max(0.35rem,calc(env(safe-area-inset-top,0px)+0.25rem))] z-[465] rounded-xl px-2.5 py-2 text-left text-xs font-semibold tracking-[-0.015em] text-slate-200/95 transition hover:bg-white/[0.05] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38 touch-manipulation sm:left-4 sm:top-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.5rem))] sm:px-3 sm:text-sm"
        onClick={onGoLanding}
        aria-label={t("product.name")}
      >
        {t("product.name")}
      </button>

      <div className="relative z-[2] flex min-h-0 flex-1 flex-col px-3 pt-[max(2.35rem,calc(env(safe-area-inset-top,0px)+1.85rem))] sm:px-5 sm:pt-10 lg:px-8">
        <UnifiedSensoraGuideFlow
          active={open}
          variant="dialog"
          skipIntro
          onClose={onClose}
          onSelectSection={onSelectSection}
          className="min-h-0"
        />
      </div>
    </div>
  );
}
