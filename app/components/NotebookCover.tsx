"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  NOTEBOOK_COVER_THEME_KEY,
  NOTEBOOK_COVER_THEME_LABELS,
  type NotebookCoverTheme,
  parseNotebookCoverTheme,
} from "@/app/components/notebookCoverTheme";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { useAuth } from "@/app/crm/useAuth";
import { sellerCanUseApp, useSellerProfile } from "@/app/crm/useSellerProfile";
import { isFirebaseConfigured } from "@/app/firebase/client";

const STORAGE_KEY = "crm.notebookCoverDismissed";

const WORKSPACE_PATH = "/?view=app" as const;
const WORKSPACE_AI_HASH = "/?view=app#crm-ai-assistant" as const;

const LAST_PAGE = 2;

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function tocCard(raw: string): { title: string; line: string } {
  const parts = splitLines(raw);
  if (parts.length >= 2) {
    const [title, ...rest] = parts;
    return { title, line: rest.join(" ") };
  }
  return { title: raw.trim(), line: "" };
}

const ghostBtn =
  "inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-full border border-white/22 bg-transparent px-5 text-[13px] font-semibold leading-none text-[#E8EDF6] hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBD5E1]/80 disabled:cursor-not-allowed disabled:opacity-35";

const primaryBtn =
  "inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-full border border-white/14 bg-white/[0.13] px-5 text-[13px] font-semibold leading-none text-[#F8FAFC] hover:bg-white/[0.17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CBD5E1]/80";

/** 전체 화면 표지 — 3페이지 온보딩 (Sense + Aura, 실버·그레이 톤) */
export function NotebookCover() {
  const router = useRouter();
  const { t } = useLanguage();
  const { auth } = useAuth();
  const firebaseReady = isFirebaseConfigured();
  const [dismissed, setDismissed] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const [coverTheme, setCoverTheme] = useState<NotebookCoverTheme>("natural");
  const panelRef = useRef<HTMLDivElement>(null);

  const sellerUid = auth.status === "signed-in" ? auth.uid : null;
  const seller = useSellerProfile(sellerUid);
  const sellerSignedIn = firebaseReady && auth.status === "signed-in";
  const sellerLoading = sellerSignedIn && seller.loading;
  const sellerApproved = sellerCanUseApp(seller.profile);
  const showWorkspaceCta = sellerSignedIn && !sellerLoading && !seller.error && sellerApproved;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cover") === "1" || params.get("openCover") === "1") {
        sessionStorage.removeItem(STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- ?cover URL 과 표지 동기화
        setDismissed(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- ?cover URL 과 표지 동기화
        setForceShow(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPageIdx(0);
        params.delete("cover");
        params.delete("openCover");
        const q = params.toString();
        const next = `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`;
        window.history.replaceState(null, "", next);
        return;
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage 초기값
    setDismissed(readDismissed());
  }, []);

  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined" ? window.localStorage.getItem(NOTEBOOK_COVER_THEME_KEY) : null;
      setCoverTheme(parseNotebookCoverTheme(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onShow = () => {
      setForceShow(true);
      setPageIdx(0);
    };
    window.addEventListener("crm-show-notebook-cover", onShow);
    return () => window.removeEventListener("crm-show-notebook-cover", onShow);
  }, []);

  const visible = forceShow || !dismissed;

  const dismissQuiet = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setForceShow(false);
  }, []);

  const dismissAndNavigate = useCallback(
    (href: string) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setDismissed(true);
      setForceShow(false);
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissQuiet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismissQuiet]);

  useEffect(() => {
    if (!visible || !panelRef.current) return;
    panelRef.current.focus({ preventScroll: true });
  }, [visible, pageIdx]);

  if (!visible) return null;

  const themes: NotebookCoverTheme[] = ["natural", "mono"];

  const tocKeys = [
    "cover.onboarding.page2.customer",
    "cover.onboarding.page2.ai",
    "cover.onboarding.page2.followup",
    "cover.onboarding.page2.season",
    "cover.onboarding.page2.delivery",
  ] as const;

  const heading =
    pageIdx === 0
      ? t("cover.onboarding.page1.title")
      : pageIdx === 1
        ? t("cover.onboarding.page2.title")
        : t("cover.onboarding.page3.title");

  return (
    <div
      className={`notebook-cover-sheet notebook-cover-sheet-consultant notebook-cover-sheet--tone-${coverTheme} outline-none [-webkit-tap-highlight-color:transparent]`}
    >
      <div className="notebook-cover-consultant-hero" aria-hidden>
        <div className="notebook-cover-hero-abstract" />
        <div className="notebook-cover-hero-dim" />
        <div className="notebook-cover-tone-scrim" />
      </div>

      <button
        type="button"
        className="absolute inset-0 z-[5] cursor-default border-0 bg-[rgba(15,23,42,0.42)] p-0 motion-safe:transition-colors motion-safe:duration-200"
        aria-label={t("cover.onboarding.close")}
        onClick={dismissQuiet}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notebook-cover-panel-heading"
        tabIndex={-1}
        className="notebook-cover-cover-layer notebook-cover-biz-micro notebook-cover-reveal notebook-cover-editorial-shell relative z-10 mx-auto flex min-h-[100dvh] min-h-[100svh] w-full max-w-[min(760px,calc(100vw-48px))] flex-col overflow-y-auto overscroll-contain pl-[max(22px,calc(env(safe-area-inset-left,0px)+1.25rem))] pr-[max(22px,calc(env(safe-area-inset-right,0px)+1.25rem))] pb-[max(1.5rem,calc(1.35rem+env(safe-area-inset-bottom,0px)))] pt-[max(28px,calc(env(safe-area-inset-top,0px)+1.85rem))] text-center md:pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-end px-1 pb-2">
          <button type="button" className={ghostBtn} onClick={dismissQuiet}>
            {t("cover.onboarding.close")}
          </button>
        </div>

        <div
          className="notebook-cover-onboard-pane flex min-h-0 flex-1 flex-col px-2 sm:px-4"
          key={pageIdx}
        >
          <header className="shrink-0 px-1 pb-4 text-center sm:pb-5">
            <p className="notebook-cover-cover-kicker-upper font-[family-name:var(--font-cover-serif)] text-[clamp(10px,2.55vw,12px)] font-semibold tracking-[0.2em]">
              SENSORA
            </p>
            {pageIdx === 0 ? (
              <div className="mt-3 flex justify-center">
                <span className="crm-free-badge">무료 사용</span>
              </div>
            ) : null}
            <h1
              id="notebook-cover-panel-heading"
              className="mt-4 text-balance text-[clamp(1.35rem,4.5vw,1.85rem)] font-semibold leading-[1.25] tracking-[-0.03em] text-[#F8FAFC] sm:mt-5"
            >
              {heading}
            </h1>
          </header>

          <div className="mx-auto w-full max-w-[min(26rem,94vw)] flex-1 text-left">
            {pageIdx === 0 ? (
              <div className="space-y-4 text-[13px] leading-relaxed text-[#CBD5E1] sm:text-[14px]">
                {splitLines(t("cover.onboarding.page1.description")).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    className={`${primaryBtn} w-full sm:w-auto sm:min-w-[10.5rem]`}
                    onClick={() => dismissAndNavigate(WORKSPACE_AI_HASH)}
                  >
                    {t("cover.onboarding.startApp")}
                  </button>
                  <button
                    type="button"
                    className={`${ghostBtn} w-full sm:w-auto sm:min-w-[10.5rem]`}
                    onClick={() => dismissAndNavigate("/register")}
                  >
                    {t("auth.salesRegistration")}
                  </button>
                  {showWorkspaceCta ? (
                    <button
                      type="button"
                      className={`${ghostBtn} w-full border-white/30 sm:w-auto sm:min-w-[10.5rem]`}
                      onClick={() => dismissAndNavigate(WORKSPACE_PATH)}
                    >
                      {t("cover.onboarding.goWorkspace")}
                    </button>
                  ) : null}
                  {sellerLoading ? (
                    <p className="w-full text-center text-[12px] text-[#94A3B8] sm:text-left">
                      {t("auth.checkingLogin")}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {pageIdx === 1 ? (
              <div className="space-y-3">
                <ul className="grid gap-2.5 sm:gap-3">
                  {tocKeys.map((key) => {
                    const { title, line } = tocCard(t(key));
                    return (
                      <li
                        key={key}
                        className="rounded-[18px] border border-white/12 bg-black/[0.08] px-4 py-3 backdrop-blur-sm sm:px-5 sm:py-3.5"
                      >
                        <p className="text-[13px] font-semibold text-[#F8FAFC]">{title}</p>
                        {line ? <p className="mt-1 text-[12px] leading-snug text-[#94A3B8]">{line}</p> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {pageIdx === 2 ? (
              <div className="space-y-5">
                <div className="space-y-3 text-[13px] leading-relaxed text-[#CBD5E1] sm:text-[14px]">
                  {splitLines(t("cover.onboarding.page3.description")).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    className={`${primaryBtn} w-full justify-center`}
                    onClick={() => dismissAndNavigate(WORKSPACE_PATH)}
                  >
                    {t("cover.onboarding.page3.workspaceCta")}
                  </button>
                  <button
                    type="button"
                    className={`${ghostBtn} w-full justify-center`}
                    onClick={() => dismissAndNavigate(WORKSPACE_AI_HASH)}
                  >
                    {t("cover.onboarding.page3.aiCta")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 shrink-0 px-2">
            <nav className="flex justify-center gap-2.5" aria-label="Onboarding steps">
              {Array.from({ length: LAST_PAGE + 1 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-current={pageIdx === i ? "step" : undefined}
                  aria-label={`${i + 1} / ${LAST_PAGE + 1}`}
                  className={[
                    "h-2.5 min-w-[2.5rem] max-w-[3rem] rounded-full border border-white/12 transition-[opacity,transform] motion-reduce:transition-none",
                    pageIdx === i ? "bg-white/75 opacity-100" : "bg-white/18 opacity-55 hover:opacity-80",
                  ].join(" ")}
                  onClick={() => setPageIdx(i)}
                />
              ))}
            </nav>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className={ghostBtn}
                disabled={pageIdx === 0}
                onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
              >
                {t("cover.onboarding.prev")}
              </button>
              {pageIdx < LAST_PAGE ? (
                <button type="button" className={primaryBtn} onClick={() => setPageIdx((p) => Math.min(LAST_PAGE, p + 1))}>
                  {t("cover.onboarding.next")}
                </button>
              ) : (
                <button type="button" className={primaryBtn} onClick={() => dismissAndNavigate(WORKSPACE_PATH)}>
                  {t("cover.onboarding.start")}
                </button>
              )}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-3 text-center font-[family-name:var(--font-cover-serif)] text-[clamp(11px,2.4vw,12px)] font-semibold tracking-[0.12em] text-[#CBD5E1]">
                {t("cover.onboarding.themeLabel")}
              </p>
              <div
                role="radiogroup"
                aria-label={t("cover.onboarding.themeLabel")}
                className="notebook-cover-theme-bar mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {themes.map((th) => (
                  <button
                    key={th}
                    type="button"
                    role="radio"
                    aria-checked={coverTheme === th}
                    className={`notebook-cover-theme-chip min-h-[44px] ${coverTheme === th ? "notebook-cover-theme-chip--active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverTheme(th);
                      try {
                        window.localStorage.setItem(NOTEBOOK_COVER_THEME_KEY, th);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    {NOTEBOOK_COVER_THEME_LABELS[th]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
