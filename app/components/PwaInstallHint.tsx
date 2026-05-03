"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

const DISMISS_STORAGE_KEY = "sensora:pwa-install-hint-dismissed";

function preferReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function runsStandalone(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return !!nav.standalone;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function isLikelyMobile(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(max-width: 640px)").matches) return true;
  return "ontouchstart" in window;
}

const HIDE_PWA_HINT_ROUTES = ["/join", "/register", "/delivery"] as const;

export function PwaInstallHint() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname && HIDE_PWA_HINT_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
      setShow(false);
      return;
    }
    if (!isLikelyMobile()) return;
    if (runsStandalone()) return;

    try {
      if (window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    setShow(true);
  }, [pathname]);

  if (!pathname || HIDE_PWA_HINT_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) return null;

  if (!show) return null;

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  const ios = isIos();
  const android = isAndroid();

  return (
    <div
      className={`pwa-install-hint-root pointer-events-auto fixed inset-x-0 bottom-0 z-[92] pb-[calc(0.5rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] pt-1 ${preferReducedMotion() ? "" : "motion-safe:transition-[opacity,transform] motion-safe:duration-200"}`}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-2 rounded-[20px] border border-[#E5E7EB]/90 bg-[#111827]/95 px-3 py-3 text-[13px] leading-snug text-[#F9FAFB] shadow-[0_-8px_32px_rgba(15,23,42,0.22)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#CBD5E1]">{t("pwa.install.title")}</p>
            <p className="mt-2 font-medium text-[#E5E7EB]">{t("pwa.install.description")}</p>
            {ios ? <p className="mt-1.5 text-[12px] leading-relaxed text-[#CBD5E1]">{t("pwa.install.ios")}</p> : null}
            {!ios && android ? (
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#CBD5E1]">{t("pwa.install.android")}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={t("pwa.install.dismiss")}
            onClick={dismiss}
            className="crm-ghost-btn min-h-[44px] shrink-0 touch-manipulation rounded-lg px-3 py-2 text-[12px] font-semibold text-[#F9FAFB] ring-1 ring-inset ring-white/20 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#94A3B8]"
          >
            {t("pwa.install.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
