"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { COVER_QUOTES } from "@/app/components/coverQuotes";
import {
  NOTEBOOK_COVER_THEME_KEY,
  NOTEBOOK_COVER_THEME_LABELS,
  type NotebookCoverTheme,
  parseNotebookCoverTheme,
} from "@/app/components/notebookCoverTheme";
import { isGoogleAuthEnabled } from "@/app/firebase/client";

const STORAGE_KEY = "crm.notebookCoverDismissed";

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** 전체 화면 컨설턴트 표지 — 히어로 사진 + 실버 무드 오버레이 */
export function NotebookCover() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [coverTheme, setCoverTheme] = useState<NotebookCoverTheme>("natural");
  const panelRef = useRef<HTMLDivElement>(null);
  const googleAuthEnabled = isGoogleAuthEnabled();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cover") === "1" || params.get("openCover") === "1") {
        sessionStorage.removeItem(STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- ?cover URL 과 표지 동기화
        setDismissed(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- ?cover URL 과 표지 동기화
        setForceShow(false);
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
    const onShow = () => setForceShow(true);
    window.addEventListener("crm-show-notebook-cover", onShow);
    return () => window.removeEventListener("crm-show-notebook-cover", onShow);
  }, []);

  const visible = forceShow || !dismissed;

  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 표지 열 때마다 랜덤 글귀
    setQuoteIdx(Math.floor(Math.random() * COVER_QUOTES.length));
  }, [visible]);

  const dismissAndContinue = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setForceShow(false);
    if (googleAuthEnabled) router.push("/join");
  }, [router]);

  useEffect(() => {
    if (!visible || !panelRef.current) return;
    panelRef.current.focus({ preventScroll: true });
  }, [visible]);

  if (!visible) return null;

  const themes: NotebookCoverTheme[] = ["natural", "mono"];

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notebook-cover-title"
      tabIndex={0}
      className={`notebook-cover-sheet notebook-cover-sheet-consultant notebook-cover-sheet--tone-${coverTheme} outline-none [-webkit-tap-highlight-color:transparent]`}
      onClick={dismissAndContinue}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        dismissAndContinue();
      }}
    >
      <div className="notebook-cover-consultant-hero" aria-hidden>
        <div className="notebook-cover-hero-abstract" aria-hidden />
        <div className="notebook-cover-hero-dim" aria-hidden />
        <div className="notebook-cover-tone-scrim" aria-hidden />
      </div>

      <div className="notebook-cover-cover-layer notebook-cover-biz-micro notebook-cover-reveal notebook-cover-editorial-shell flex min-h-[100dvh] min-h-[100svh] w-full cursor-pointer flex-col pl-[max(22px,calc(env(safe-area-inset-left,0px)+1.25rem))] pr-[max(22px,calc(env(safe-area-inset-right,0px)+1.25rem))] pb-[calc(1.35rem+env(safe-area-inset-bottom,0px))] pt-[max(28px,calc(env(safe-area-inset-top,0px)+1.85rem))] text-center md:mx-auto md:max-w-[min(760px,calc(100vw-48px))] md:pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <header className="notebook-cover-cover-header shrink-0 px-3 pb-[1.1rem]">
          <p className="notebook-cover-cover-kicker-upper font-[family-name:var(--font-cover-serif)] text-[clamp(10px,2.55vw,12px)] font-semibold tracking-[0.2em]">
            FIELD OPS
          </p>
          <p className="notebook-cover-cover-kicker-sub mt-3.5 text-[clamp(12px,2.85vw,14px)] font-semibold leading-[1.45] tracking-[-0.018em]">
            고객을 기억하고, 흐름을 관리하는 프리미엄 업무 파트너
          </p>
          <p className="notebook-cover-tagline mt-3 text-[clamp(11px,2.5vw,13px)] font-medium leading-[1.6] tracking-[-0.012em]">
            고객 상담, 시승 일정, 출고 준비, 재구매 타이밍까지<br className="hidden sm:block" />
            놓치지 않도록 정리해주는 자동차 영업 AI 비서입니다.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="crm-free-badge">무료 사용</span>
          </div>
          <div aria-hidden className="notebook-cover-kicker-line" />
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-2 sm:px-4">
          <div className="flex shrink-0 flex-col items-center pt-[clamp(0.35rem,2.2vh,1.75rem)]">
            <div className="notebook-cover-cover-title-slot w-full px-2">
              <h1
                id="notebook-cover-title"
                className="notebook-cover-biz-heading notebook-cover-heading-block mx-auto max-w-[min(22ch,calc(100vw-2rem))] text-center sm:max-w-[min(520px,94vw)]"
              >
                <span className="notebook-cover-title-primary">자동차 영업</span>
                <span className="notebook-cover-title-sub">AI 영업 비서</span>
                <span aria-hidden className="notebook-cover-title-shine" />
              </h1>
            </div>
          </div>

          <div className="min-h-[clamp(1.75rem,4.5vh,3rem)] flex-1" aria-hidden />

          <div className="mx-auto shrink-0 pb-6">
            <section className="notebook-cover-quote-stack mx-auto w-full max-w-[min(24.5em,calc(100vw-40px))]">
              <blockquote
                id="notebook-cover-quote"
                aria-live="polite"
                className="notebook-cover-biz-quote notebook-cover-quote-pane notebook-cover-quote-emphasis rounded-xl px-[1.65rem] py-[1.55rem] text-[clamp(15px,3.35vw,18px)] font-semibold leading-[1.68] tracking-[-0.016em] sm:rounded-[1.1rem] sm:px-7 sm:py-[1.65rem]"
              >
                {COVER_QUOTES[quoteIdx >= 0 && quoteIdx < COVER_QUOTES.length ? quoteIdx : 0].map(
                  (line, i) => (
                    <span key={i} className="block [&:not(:first-child)]:mt-1.5">
                      {line}
                    </span>
                  ),
                )}
              </blockquote>

              <div
                aria-hidden
                className="notebook-cover-quote-rules mt-5 flex w-full items-center justify-center gap-3 px-2 opacity-95"
              >
                <div className="notebook-cover-quote-rule h-px max-w-[6rem] flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="notebook-cover-quote-dot size-[5px] rotate-45 border shadow-sm" />
                <div className="notebook-cover-quote-rule h-px max-w-[6rem] flex-1 bg-gradient-to-r from-transparent to-transparent" />
              </div>
            </section>

            <div className="mt-10 px-2 sm:mt-11">
              <p className="notebook-cover-theme-heading mb-3 font-[family-name:var(--font-cover-serif)] text-[clamp(11px,2.4vw,12px)] font-semibold tracking-[0.12em]">
                표현 톤
              </p>
              <div
                role="radiogroup"
                aria-label="표지 표현 자연 색 또는 흑백 선택"
                className="notebook-cover-theme-bar mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-2"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {themes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={coverTheme === t}
                    className={`notebook-cover-theme-chip ${coverTheme === t ? "notebook-cover-theme-chip--active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverTheme(t);
                      try {
                        window.localStorage.setItem(NOTEBOOK_COVER_THEME_KEY, t);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    {NOTEBOOK_COVER_THEME_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="notebook-cover-biz-micro notebook-cover-cta-wrap mt-[2.65rem] flex flex-col items-center gap-[0.72rem] text-center md:mt-12 md:gap-3">
              <span className="notebook-cover-cta-chip notebook-cover-cta-main inline-flex min-h-[2.75rem] min-w-[12.25rem] max-w-[min(90vw,20rem)] items-center justify-center rounded-full px-[1.4rem] py-2.5 text-center font-[family-name:var(--font-cover-sans)] text-[clamp(11.25px,2.65vw,12.5px)] font-bold leading-snug tracking-[-0.01em]">
                {googleAuthEnabled ? "Google로 시작하기" : "영업 시작하기"}
              </span>
              <span className="notebook-cover-cta-sub text-[clamp(11px,2.55vw,12px)] font-semibold leading-snug tracking-[-0.012em]">
                {googleAuthEnabled
                  ? "명함 등록 후 확인(승인) 시 이용 · SMS 발송 없음"
                  : "로컬에서 먼저 정리해보기 · 로그인은 준비중"}
              </span>
              <span className="notebook-cover-cta-hint text-[clamp(10px,2.35vw,10.75px)] font-medium leading-snug tracking-[-0.01em]">
                화면 탭 또는 Enter
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
