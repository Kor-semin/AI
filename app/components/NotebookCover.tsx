"use client";

import Image from "next/image";
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
  "inline-flex touch-manipulation items-center justify-center rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium tracking-[-0.01em] text-[#94A3B8] transition motion-reduce:transition-none hover:bg-white/[0.06] hover:text-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8]/65";

/** 주 CTA — 워크스페이스 primary와 같은 프리미엄 그라데이션 */
const onboardPrimaryBtn =
  "sensora-premium-primary-workspace inline-flex min-h-[3.25rem] w-full max-w-[min(360px,min(94vw,calc(100vw-32px)))] touch-manipulation items-center justify-center self-center rounded-2xl px-6 py-3.5 text-[0.9375rem] font-semibold leading-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-[min(320px,90vw)] sm:px-7 sm:text-base";

/** 보조 — 글래스 고스트 */
const onboardGhostBtn =
  "inline-flex min-h-[3.125rem] w-full max-w-[min(360px,min(94vw,calc(100vw-32px)))] touch-manipulation items-center justify-center self-center rounded-2xl border border-white/[0.24] bg-white/[0.08] px-6 py-3.5 text-sm font-semibold leading-tight text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-sm transition-[background,border-color,transform,box-shadow] duration-[220ms] motion-reduce:transition-none hover:border-sky-300/42 hover:bg-white/[0.13] hover:shadow-[0_0_36px_-10px_rgba(56,189,248,0.12)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-35 sm:max-w-[min(320px,90vw)]";

const onboardNavMutedBtn =
  "sensora-dark-ghost-btn inline-flex min-h-[3.25rem] min-w-0 flex-1 touch-manipulation items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold leading-tight text-slate-200 transition-[border-color,background,color,transform] duration-[220ms] motion-reduce:transition-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-sky-400/35 disabled:cursor-not-allowed disabled:opacity-[0.38] sm:min-w-[6rem]";

const onboardNavPrimaryBtn =
  "inline-flex min-h-[3.25rem] min-w-0 flex-1 touch-manipulation items-center justify-center rounded-2xl border border-sky-400/42 bg-white/[0.12] px-5 py-3.5 text-sm font-semibold leading-tight text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[background,border-color,transform,box-shadow] duration-[220ms] motion-reduce:transition-none hover:border-sky-400/52 hover:bg-white/[0.18] hover:shadow-[0_0_34px_-8px_rgba(56,189,248,0.18)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45 motion-reduce:hover:bg-white/[0.12] sm:min-w-[6rem]";

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

  const tocVisuals = [
    "/images/guides/sensora-guide-02.png",
    "/images/guides/sensora-guide-01.png",
    "/images/guides/sensora-guide-03.png",
  ] as const;

  const heading =
    pageIdx === 0
      ? t("cover.onboarding.page1.title")
      : pageIdx === 1
        ? t("cover.onboarding.page2.title")
        : t("cover.onboarding.page3.title");

  return (
    <div
      className={`notebook-cover-sheet sensora-notebook-sheet-galaxy notebook-cover-sheet-consultant notebook-cover-sheet--tone-${coverTheme} outline-none [-webkit-tap-highlight-color:transparent]`}
    >
        <div className="notebook-cover-consultant-hero sensora-notebook-nebula-accent" aria-hidden>
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
          "notebook-cover-cover-layer notebook-cover-biz-micro notebook-cover-reveal notebook-cover-editorial-shell relative z-10 mx-auto flex min-h-[100dvh] min-h-[100svh] w-full max-w-[min(780px,calc(100vw-28px))] flex-col overflow-y-auto overscroll-contain pl-[max(18px,calc(env(safe-area-inset-left,0px)+1rem))] pr-[max(18px,calc(env(safe-area-inset-right,0px)+1rem))] pb-[max(0.875rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] pt-[max(10px,calc(env(safe-area-inset-top,0px)+0.5rem))] text-center",
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
              "justify-center py-7 max-[480px]:py-3 max-[480px]:pt-5 sm:py-10"
            : pageIdx === 1 ?
              "min-h-0 justify-center py-6 max-[480px]:py-2.5 max-[480px]:pb-2 sm:py-10"
            : `justify-center py-7 max-[480px]:py-3.5 max-[480px]:pb-2.5 sm:py-10 max-lg:justify-start max-lg:pt-5`,
          ].join(" ")}
          key={pageIdx}
          data-notebook-cover-tone={coverTheme}
        >
          <div className="notebook-cover-inner-stack mx-auto flex w-full max-w-[min(548px,min(96vw,calc(100vw-28px)))] flex-col items-center gap-0">
            <div
              className={[
                "notebook-cover-logo-wrap pointer-events-none flex shrink-0 justify-center",
                pageIdx === 0 ? "mb-5 max-[480px]:mb-3 sm:mb-8"
                : pageIdx === 1 ? "mb-2.5 max-[480px]:mb-1.5 sm:mb-8"
                : "mb-5 max-[480px]:mb-2.5 sm:mb-8",
              ].join(" ")}
            >
              <SensoraAnimatedMark
                size={pageIdx === 0 ? 112 : pageIdx === 1 ? 76 : 84}
                animated={pageIdx === 0}
                className={pageIdx === 0 ? "max-[380px]:scale-[1.02] motion-reduce:opacity-[0.96]" : "max-[480px]:scale-[1.02]"}
                label={pageIdx === 0 ? t("product.name") : undefined}
              />
            </div>
            <p className="notebook-cover-cover-kicker-upper shrink-0 font-[family-name:var(--font-cover-serif)] text-[clamp(10px,2.4vw,12px)] font-semibold tracking-[0.22em]">
              SENSORA
            </p>
            <h1
              id="notebook-cover-panel-heading"
              className={[
                "max-w-[26ch] text-balance font-semibold leading-[1.2] tracking-[-0.03em] text-[#F8FAFC]",
                pageIdx === 0 ?
                  "mt-2.5 text-[clamp(1.48rem,5.1vw,1.95rem)] max-[480px]:mt-2 sm:mt-5"
                : pageIdx === 1 ?
                  "mt-1.5 text-[clamp(1.4rem,4.85vw,1.88rem)] max-[480px]:mt-1 sm:mt-5"
                : "mt-2.5 text-[clamp(1.44rem,4.95vw,1.9rem)] max-[480px]:mt-2 sm:mt-5",
              ].join(" ")}
            >
              {heading}
            </h1>

            <div
              className={[
                "notebook-cover-body-block w-full shrink-0 text-left",
                pageIdx === 0 ? "mt-6 max-[480px]:mt-4 sm:mt-8"
                : pageIdx === 1 ? "mt-3 max-[480px]:mt-2.5 sm:mt-8"
                : "mt-6 max-[480px]:mt-4 sm:mt-8",
              ].join(" ")}
            >
              {pageIdx === 0 ? (
                <div className="mx-auto flex w-full max-w-[min(360px,92vw)] flex-col items-center max-[389px]:max-w-[calc(100vw-32px)]">
                  <div className="w-full space-y-2.5 text-center text-[0.9375rem] leading-relaxed text-slate-200 max-[480px]:space-y-2 max-[480px]:text-[0.90625rem] sm:text-base sm:leading-[1.62]">
                    {splitLines(t("cover.onboarding.page1.description")).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="mt-7 flex w-full max-[480px]:mt-6 flex-col items-center gap-3 max-[480px]:gap-2.5">
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
                      <p className="text-center text-xs text-[#94A3B8]">{t("auth.checkingLogin")}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {pageIdx === 1 ? (
                <div className="mx-auto w-full max-w-[min(32rem,min(96vw,calc(100vw-28px)))]">
                  <ul className="grid gap-2.5 max-[480px]:gap-2 sm:gap-3.5">
                    {tocKeys.map((key, idx) => {
                      const { title, line } = tocCard(t(key));
                      const src = tocVisuals[idx] ?? tocVisuals[0];
                      return (
                        <li
                          key={key}
                          className="notebook-cover-toc-pane sensora-notebook-toc-pane--visual min-h-[4.85rem] cursor-default rounded-2xl border px-4 py-3.5 backdrop-blur-sm max-[480px]:min-h-[4.45rem] max-[480px]:rounded-[16px] max-[480px]:px-3.5 max-[480px]:py-3.5 motion-reduce:active:scale-100 sm:rounded-[18px] sm:px-5 sm:py-4"
                        >
                          <div className="flex items-start gap-3.5 sm:gap-4">
                            <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-xl border border-white/[0.12] bg-[#030712]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_-10px_rgba(56,189,248,0.12)] sm:size-[4.5rem]">
                              <Image src={src} alt="" fill className="object-cover object-center opacity-92" sizes="72px" />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/55 to-transparent" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.9375rem] font-semibold leading-snug text-[#F8FAFC] sm:text-base">{title}</p>
                              {line ?
                                <p className="mt-1 text-[0.8125rem] leading-snug text-slate-400 max-[480px]:text-[0.78rem] sm:mt-1.5 sm:text-sm">
                                  {line}
                                </p>
                              : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {pageIdx === 2 ? (
                <div className="mx-auto flex w-full max-w-[min(32rem,min(96vw,calc(100vw-28px)))] flex-col items-center gap-4 max-[480px]:gap-3 sm:gap-6">
                  <div className="w-full space-y-2.5 text-center text-[0.9375rem] leading-relaxed text-slate-200 max-[480px]:space-y-2 max-[480px]:text-[0.90625rem] sm:text-base sm:leading-[1.62]">
                    {splitLines(t("cover.onboarding.page3.description")).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <details className="notebook-cover-theme-panel w-full rounded-[17px] border border-white/[0.14] bg-black/[0.12] px-4 py-4 text-left shadow-[0_12px_32px_-8px_rgba(0,0,0,0.38)] backdrop-blur-sm max-[480px]:px-3.5 max-[480px]:py-3 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="cursor-pointer list-none py-0.5 text-center text-[0.78rem] font-semibold tracking-[0.08em] text-slate-200 hover:text-[#F8FAFC] motion-reduce:transition-none sm:text-sm">
                      {t("cover.onboarding.themeLabel")}
                    </summary>
                    <p className="mt-2 text-center text-xs leading-relaxed text-slate-400 max-[480px]:text-[0.72rem]">
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

                  <div className="flex w-full max-w-[min(360px,92vw)] flex-col items-center gap-2.5 max-[389px]:max-w-[calc(100vw-32px)]">
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
            "mx-auto flex w-full max-w-[min(440px,min(94vw,calc(100vw-28px)))] shrink-0 flex-col px-0.5 pb-[max(0.85rem,calc(env(safe-area-inset-bottom,0px)+10px))] pt-3",
            "mt-5 gap-4 sm:mt-8 sm:gap-6",
            "max-[480px]:mt-5 max-[480px]:gap-3.5 max-[480px]:pt-2.5 max-[480px]:pb-[max(0.65rem,calc(env(safe-area-inset-bottom,0px)+12px))]",
          ].join(" ")}
        >
          <nav className="flex justify-center gap-2.5 px-1 motion-reduce:gap-2" aria-label="온보딩 단계">
            {Array.from({ length: LAST_PAGE + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-current={pageIdx === i ? "step" : undefined}
                aria-label={`${i + 1} / ${LAST_PAGE + 1}`}
                className={[
                  "min-h-[12px] h-2.5 min-w-[2.65rem] max-w-[3rem] touch-manipulation rounded-full border border-white/22 transition-[opacity,transform,background-color] motion-reduce:transition-none motion-reduce:transform-none active:opacity-95",
                  pageIdx === i ? "scale-100 bg-slate-100/92 opacity-100" : "bg-white/20 opacity-50 hover:bg-white/30 hover:opacity-80 motion-reduce:transform-none",
                ].join(" ")}
                onClick={() => setPageIdx(i)}
              />
            ))}
          </nav>

          <div className="flex flex-row gap-2.5 px-0.5 sm:gap-3">
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
