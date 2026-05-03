"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { hashToCrmSection } from "@/app/crm/crmSectionTypes";

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

function readUrlSignals(): { view: string | null; settingsSection: boolean } {
  if (typeof window === "undefined") return { view: null, settingsSection: false };
  try {
    const u = new URL(window.location.href);
    const view = u.searchParams.get("view");
    const raw = u.hash.replace(/^#/, "").trim().toLowerCase();
    const section = raw ? hashToCrmSection(raw) : null;
    return { view, settingsSection: section === "settings" };
  } catch {
    return { view: null, settingsSection: false };
  }
}

export function PwaInstallHint() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [urlTick, setUrlTick] = useState(0);

  const bumpUrl = useCallback(() => setUrlTick((x) => x + 1), []);

  useEffect(() => {
    const onHash = () => bumpUrl();
    const onPop = () => bumpUrl();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onPop);
    };
  }, [bumpUrl]);

  useEffect(() => {
    if (!pathname) return;

    if (HIDE_PWA_HINT_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
      setShow(false);
      return;
    }

    if (!isLikelyMobile()) {
      setShow(false);
      return;
    }
    if (runsStandalone()) {
      setShow(false);
      return;
    }

    try {
      if (window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1") {
        setShow(false);
        return;
      }
    } catch {
      /* ignore */
    }

    const { view, settingsSection } = readUrlSignals();

    if (pathname === "/" && view !== "app") {
      setShow(false);
      return;
    }
    if (pathname === "/" && view === "app" && settingsSection) {
      setShow(false);
      return;
    }

    setShow(true);
  }, [pathname, urlTick]);

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
      className={`pwa-install-hint-root pointer-events-auto fixed inset-x-0 bottom-0 z-[92] pb-[max(0.35rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pl-[max(0.5rem,calc(env(safe-area-inset-left,0px)+0.5rem))] pr-[max(0.5rem,calc(env(safe-area-inset-right,0px)+0.5rem))] pt-0.5 ${preferReducedMotion() ? "" : "motion-safe:transition-[opacity,transform] motion-safe:duration-200"}`}
    >
      <div className="sensora-pwa-hint-panel mx-auto max-w-lg rounded-2xl border border-white/[0.12] bg-[#0b1220]/96 px-2.5 py-2 text-[12px] leading-snug text-slate-100 shadow-[0_-6px_28px_rgba(0,0,0,0.35)] backdrop-blur-md sm:rounded-[18px] sm:px-3 sm:py-2.5">
        {!expanded ? (
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 flex-1 truncate font-semibold text-slate-100">{t("pwa.install.title")}</p>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="crm-ghost-btn touch-manipulation rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-sky-200/95 ring-1 ring-inset ring-sky-400/22 hover:bg-white/[0.06]"
                onClick={() => setExpanded(true)}
              >
                {t("pwa.install.more")}
              </button>
              <button
                type="button"
                aria-label={t("pwa.install.dismiss")}
                onClick={dismiss}
                className="crm-ghost-btn min-h-9 touch-manipulation rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 ring-1 ring-inset ring-white/15 hover:bg-white/[0.06] hover:text-slate-50"
              >
                {t("pwa.install.dismiss")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-sky-300/85">{t("pwa.install.title")}</p>
                <p className="mt-1.5 font-medium leading-snug text-slate-100">{t("pwa.install.description")}</p>
                {ios ? <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{t("pwa.install.ios")}</p> : null}
                {!ios && android ? <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{t("pwa.install.android")}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  type="button"
                  className="crm-ghost-btn touch-manipulation rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-100"
                  onClick={() => setExpanded(false)}
                >
                  {t("pwa.install.less")}
                </button>
                <button
                  type="button"
                  aria-label={t("pwa.install.dismiss")}
                  onClick={dismiss}
                  className="crm-ghost-btn min-h-9 touch-manipulation rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 ring-1 ring-inset ring-white/18 hover:bg-white/[0.08]"
                >
                  {t("pwa.install.dismiss")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
