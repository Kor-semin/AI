"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  NOTEBOOK_COVER_THEME_KEY,
  NOTEBOOK_COVER_THEME_LABELS,
  type NotebookCoverTheme,
  parseNotebookCoverTheme,
} from "@/app/components/notebookCoverTheme";
import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { useAuth } from "@/app/crm/useAuth";
import { useSellerProfile } from "@/app/crm/useSellerProfile";
import { isFirebaseConfigured } from "@/app/firebase/client";

const STORAGE_KEY = "crm.notebookCoverDismissed";

/** 브라우저 탭(일반 웹)에서는 표지를 자동으로 띄우지 않고, PWA/홈 화면 추가 등 standalone 에서만 노출합니다. */
function isPwaStandaloneWindow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
  } catch {
    /* ignore */
  }
  const nav = navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

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

/** 상단 닫기·보조 선택 — 과하지 않게 */
const onboardCloseBtn =
  "inline-flex touch-manipulation items-center justify-center rounded-lg border border-transparent px-2.5 py-1.5 text-[11px] font-medium tracking-[-0.01em] text-[#94A3B8] transition motion-reduce:transition-none hover:bg-white/[0.06] hover:text-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8]/65";

/** 주 CTA — 워크스페이스 primary와 같은 프리미엄 그라데이션 */
const onboardPrimaryBtn =
  "sensora-premium-primary-workspace inline-flex min-h-[50px] w-full max-w-[min(300px,90vw)] touch-manipulation items-center justify-center self-center rounded-2xl px-7 text-[14px] font-semibold leading-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40";

/** 보조 — 글래스 고스트 */
const onboardGhostBtn =
  "inline-flex min-h-[46px] w-full max-w-[min(300px,90vw)] touch-manipulation items-center justify-center self-center rounded-2xl border border-white/[0.22] bg-white/[0.07] px-7 text-[13px] font-semibold leading-none text-[#EEF2FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-sm transition-[background,border-color,transform,box-shadow] duration-[220ms] motion-reduce:transition-none hover:border-sky-300/38 hover:bg-white/[0.12] hover:shadow-[0_0_32px_-10px_rgba(56,189,248,0.12)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-35";

const onboardNavMutedBtn =
  "inline-flex min-h-[46px] min-w-[5.25rem] flex-1 touch-manipulation items-center justify-center rounded-2xl border border-white/[0.2] px-4 text-[13px] font-semibold leading-none text-[#CBD5E1] transition-[background,color,border-color,transform] duration-[220ms] motion-reduce:transition-none hover:border-white/[0.28] hover:bg-white/[0.08] hover:text-[#F1F5F9] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 disabled:cursor-not-allowed disabled:opacity-[0.38] motion-reduce:hover:bg-transparent";

const onboardNavPrimaryBtn =
  "inline-flex min-h-[46px] min-w-[5.25rem] flex-1 touch-manipulation items-center justify-center rounded-2xl border border-sky-400/35 bg-white/[0.14] px-4 text-[13px] font-semibold leading-none text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[background,border-color,transform,box-shadow] duration-[220ms] motion-reduce:transition-none hover:border-sky-400/48 hover:bg-white/[0.22] hover:shadow-[0_0_28px_-8px_rgba(56,189,248,0.15)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 motion-reduce:hover:bg-white/[0.14]";

/** 전체 화면 표지 — 3페이지 온보딩 (Sense + Aura, 실버·그레이 톤) */
export function NotebookCover() {
  const router = useRouter();
  const { t } = useLanguage();
  const { auth } = useAuth();
  const firebaseReady = isFirebaseConfigured();
  const [coverHydrated, setCoverHydrated] = useState(false);
  /** 웹 브라우저 탭에서는 닫은 상태 유지 · PWA는 session 또는 표지 버튼에 따름 */
  const [dismissed, setDismissed] = useState(true);
  const [forceShow, setForceShow] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const [coverTheme, setCoverTheme] = useState<NotebookCoverTheme>("natural");
  const panelRef = useRef<HTMLDivElement>(null);

  const sellerUid = auth.status === "signed-in" ? auth.uid : null;
  const seller = useSellerProfile(sellerUid);
  const sellerSignedIn = firebaseReady && auth.status === "signed-in";
  const sellerLoading = sellerSignedIn && seller.loading;

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
        setCoverHydrated(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setDismissed(isPwaStandaloneWindow() ? readDismissed() : true);
    setCoverHydrated(true);
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
      setDismissed(false);
      setForceShow(true);
      setPageIdx(0);
    };
    window.addEventListener("crm-show-notebook-cover", onShow);
    return () => window.removeEventListener("crm-show-notebook-cover", onShow);
  }, []);

  const visible = coverHydrated && (forceShow || !dismissed);

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
        className="absolute inset-0 z-[5] cursor-default border-0 bg-[rgba(2,8,23,0.58)] p-0 motion-safe:transition-colors motion-safe:duration-200 hover:bg-[rgba(2,8,23,0.64)]"
        aria-label={t("cover.onboarding.close")}
        onClick={dismissQuiet}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notebook-cover-panel-heading"
        tabIndex={-1}
        className={[
          "notebook-cover-cover-layer notebook-cover-biz-micro notebook-cover-reveal notebook-cover-editorial-shell relative z-10 mx-auto flex min-h-[100dvh] min-h-[100svh] w-full max-w-[min(720px,calc(100vw-48px))] flex-col overflow-y-auto overscroll-contain pl-[max(22px,calc(env(safe-area-inset-left,0px)+1.25rem))] pr-[max(22px,calc(env(safe-area-inset-right,0px)+1.25rem))] pb-[max(1rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-[max(12px,calc(env(safe-area-inset-top,0px)+0.75rem))] text-center",
          "max-[480px]:[scrollbar-width:none] max-[480px]:[-ms-overflow-style:none] max-[480px]:[&::-webkit-scrollbar]:hidden",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-end pb-1 max-[480px]:pb-0 sm:pb-2">
          <button type="button" className={onboardCloseBtn} onClick={dismissQuiet} aria-label={t("cover.onboarding.close")}>
            {t("cover.onboarding.close")}
          </button>
        </div>

        <div
          className={[
            "notebook-cover-inner-stage flex flex-1 flex-col px-1 sm:px-5",
            pageIdx === 0 ?
              "justify-center py-8 max-[480px]:py-5 sm:py-10"
            : pageIdx === 1 ?
              "min-h-0 justify-center py-5 max-[480px]:py-2 max-[480px]:pb-1 sm:py-10"
            : `justify-center py-8 max-[480px]:py-5 max-[480px]:pb-3 sm:py-10 max-lg:justify-start max-lg:pt-6`,
          ].join(" ")}
          key={pageIdx}
          data-notebook-cover-tone={coverTheme}
        >
          <div className="notebook-cover-inner-stack mx-auto flex w-full max-w-[min(460px,94vw)] flex-col items-center gap-0">
            <div
              className={[
                "notebook-cover-logo-wrap pointer-events-none flex shrink-0 justify-center",
                pageIdx === 0 ? "mb-7 max-[480px]:mb-5 sm:mb-9"
                : pageIdx === 1 ? "mb-3 max-[480px]:mb-1.5 sm:mb-9"
                : "mb-7 max-[480px]:mb-4 sm:mb-9",
              ].join(" ")}
            >
              <SensoraAnimatedMark
                size={pageIdx === 0 ? 104 : pageIdx === 1 ? 68 : 76}
                animated={pageIdx === 0}
                className={pageIdx === 0 ? "max-[380px]:scale-[0.98] motion-reduce:opacity-[0.96]" : ""}
                label={pageIdx === 0 ? t("product.name") : undefined}
              />
            </div>
            <p className="notebook-cover-cover-kicker-upper shrink-0 font-[family-name:var(--font-cover-serif)] text-[clamp(10px,2.4vw,12px)] font-semibold tracking-[0.22em]">
              SENSORA
            </p>
            <h1
              id="notebook-cover-panel-heading"
              className={[
                "max-w-[22ch] text-balance text-[clamp(1.32rem,4.35vw,1.82rem)] font-semibold leading-[1.22] tracking-[-0.03em] text-[#F8FAFC]",
                pageIdx === 0 ? "mt-4 max-[480px]:mt-3 sm:mt-5"
                : pageIdx === 1 ? "mt-2 max-[480px]:mt-1 sm:mt-5"
                : "mt-4 max-[480px]:mt-3 sm:mt-5",
              ].join(" ")}
            >
              {heading}
            </h1>

            <div
              className={[
                "notebook-cover-body-block w-full shrink-0 text-left",
                pageIdx === 0 ? "mt-7 max-[480px]:mt-5 sm:mt-8"
                : pageIdx === 1 ? "mt-4 max-[480px]:mt-2 sm:mt-8"
                : "mt-7 max-[480px]:mt-5 sm:mt-8",
              ].join(" ")}
            >
              {pageIdx === 0 ? (
                <div className="mx-auto flex w-full max-w-[280px] flex-col items-center">
                  <div className="w-full space-y-3 text-center text-[13px] leading-relaxed text-[#CBD5E1] max-[480px]:space-y-2 sm:text-[14px]">
                    {splitLines(t("cover.onboarding.page1.description")).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="mt-7 flex w-full max-[480px]:mt-5 flex-col items-center gap-3 max-[480px]:gap-2.5">
                    <button
                      type="button"
                      className={onboardPrimaryBtn}
                      onClick={() => dismissAndNavigate(WORKSPACE_PATH)}
                    >
                      {t("cover.onboarding.startApp")}
                    </button>
                    <button type="button" className={onboardGhostBtn} onClick={() => dismissAndNavigate("/register")}>
                      {t("auth.salesRegistration")}
                    </button>
                    {sellerLoading ? (
                      <p className="text-center text-[12px] text-[#94A3B8]">{t("auth.checkingLogin")}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {pageIdx === 1 ? (
                <div className="mx-auto w-full max-w-[min(26rem,94vw)]">
                  <ul className="grid gap-2 max-[480px]:gap-1.5 sm:gap-3">
                    {tocKeys.map((key) => {
                      const { title, line } = tocCard(t(key));
                      return (
                        <li
                          key={key}
                          className="notebook-cover-toc-pane rounded-[14px] border border-white/12 bg-black/[0.08] px-3 py-2 backdrop-blur-sm max-[480px]:rounded-xl max-[480px]:py-1.5 sm:rounded-[18px] sm:px-5 sm:py-3.5"
                        >
                          <p className="text-[13px] font-semibold leading-tight text-[#F8FAFC]">{title}</p>
                          {line ?
                            <p className="mt-0.5 text-[12px] leading-snug text-[#B4C4D6] max-[480px]:text-[11.5px] sm:mt-1">
                              {line}
                            </p>
                          : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {pageIdx === 2 ? (
                <div className="mx-auto flex w-full max-w-[min(26rem,94vw)] flex-col items-center gap-5 max-[480px]:gap-4 sm:gap-6">
                  <div className="w-full space-y-3 text-center text-[13px] leading-relaxed text-[#CBD5E1] max-[480px]:space-y-2 sm:text-[14px]">
                    {splitLines(t("cover.onboarding.page3.description")).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <details className="notebook-cover-theme-panel w-full rounded-[16px] border border-white/12 bg-black/[0.08] px-4 py-3.5 text-left shadow-[0_8px_28px_rgba(0,0,0,0.2)] backdrop-blur-sm max-[480px]:px-3 max-[480px]:py-2.5 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="cursor-pointer list-none text-center text-[12px] font-semibold tracking-[0.08em] text-[#E2E8F0] hover:text-[#F8FAFC] motion-reduce:transition-none">
                      {t("cover.onboarding.themeLabel")}
                    </summary>
                    <p className="mt-3 text-center text-[11px] leading-relaxed text-[#94A3B8]">
                      {t("cover.onboarding.themeHint")}
                    </p>
                    <div
                      role="radiogroup"
                      aria-label={t("cover.onboarding.themeLabel")}
                      className="notebook-cover-theme-bar mt-3.5 flex w-full flex-wrap items-center justify-center gap-2 border-t border-white/8 pt-3.5"
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
                  </details>

                  <div className="flex w-full max-w-[280px] flex-col items-center gap-3">
                    <button type="button" className={onboardPrimaryBtn} onClick={() => dismissAndNavigate(WORKSPACE_PATH)}>
                      {t("cover.onboarding.page3.workspaceCta")}
                    </button>
                    <button type="button" className={onboardGhostBtn} onClick={() => dismissAndNavigate(WORKSPACE_AI_HASH)}>
                      {t("cover.onboarding.page3.aiCta")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <footer
          className={[
            "mx-auto flex w-full max-w-[420px] shrink-0 flex-col px-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-4",
            "mt-6 gap-5 sm:mt-8 sm:gap-6",
            "max-[480px]:mt-3 max-[480px]:gap-3 max-[480px]:pt-2 max-[480px]:pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]",
          ].join(" ")}
        >
          <nav className="flex justify-center gap-2 motion-reduce:gap-2" aria-label="온보딩 단계">
            {Array.from({ length: LAST_PAGE + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-current={pageIdx === i ? "step" : undefined}
                aria-label={`${i + 1} / ${LAST_PAGE + 1}`}
                className={[
                  "h-2 min-w-[2.25rem] max-w-[2.75rem] rounded-full border border-white/14 transition-[opacity,transform] motion-reduce:transition-none",
                  pageIdx === i ? "scale-100 bg-white/80 opacity-100" : "bg-white/20 opacity-50 hover:opacity-75 motion-reduce:transform-none",
                ].join(" ")}
                onClick={() => setPageIdx(i)}
              />
            ))}
          </nav>

          <div className="flex flex-row gap-3">
            <button
              type="button"
              className={onboardNavMutedBtn}
              disabled={pageIdx === 0}
              onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
            >
              {t("cover.onboarding.prev")}
            </button>
            {pageIdx < LAST_PAGE ? (
              <button
                type="button"
                className={onboardNavPrimaryBtn}
                onClick={() => setPageIdx((p) => Math.min(LAST_PAGE, p + 1))}
              >
                {t("cover.onboarding.next")}
              </button>
            ) : (
              <button type="button" className={onboardNavPrimaryBtn} onClick={() => dismissAndNavigate(WORKSPACE_PATH)}>
                {t("cover.onboarding.start")}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
