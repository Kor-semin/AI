"use client";

import { useEffect, useRef, useState } from "react";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";

/** Sensora 자체 카피 — 짧은 영업 다짐 톤(과장·실제 명언 인용 없음). */
export const SPLASH_QUOTES = [
  "좋은 영업은 고객을 기억하는 것에서 시작됩니다.",
  "기록은 다음 상담의 신뢰가 됩니다.",
  "고객의 말은 지나가지만, 기록은 다음 행동이 됩니다.",
  "오늘의 상담이 내일의 기회가 됩니다.",
  "놓치지 않는 사람이 신뢰를 만듭니다.",
  "영업은 설득보다 기억에서 시작됩니다.",
  "좋은 관리는 좋은 관계를 남깁니다.",
  "상담의 흐름을 기억하면 다음 연락이 선명해집니다.",
  "고객을 이해하는 힘은 기록에서 시작됩니다.",
  "작은 메모가 다음 계약의 방향을 만듭니다.",
] as const;

const STORAGE_KEY = "sensora.session.splash.v2";

/** 본문 체류 + 페이드 인·아웃 포함 전체가 ~1.35s 내(1.4s 미만). */
const TOTAL_BEFORE_FADE_MS = 920;
const FADE_OUT_MS = 380;
const BRAND_REVEAL_MS = 480;
const QUOTE_DELAY_MS = 200;
const QUOTE_FADE_MS = 420;

function pickQuote(): string {
  const i = Math.floor(Math.random() * SPLASH_QUOTES.length);
  return SPLASH_QUOTES[i] ?? SPLASH_QUOTES[0];
}

/**
 * 모바일·홈 랜딩(`/`) 첫 진입 시 세션당 1회, 짧은 프리미엄 스플래시.
 * `/?view=app` 직접 진입은 생략 · prefers-reduced-motion 생략.
 */
export function MobileAppSplash() {
  const [live, setLive] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [quote, setQuote] = useState("");
  const [showBrand, setShowBrand] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const clearTimers = () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };

    const reduce =
      typeof window.matchMedia !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      return undefined;
    }

    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia("(max-width: 1023px)");
    } catch {
      return undefined;
    }
    if (!mq.matches) return undefined;

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return undefined;
    } catch {
      return undefined;
    }

    const qs = new URLSearchParams(window.location.search);
    if (qs.get("view") === "app") {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      return undefined;
    }

    if (window.location.pathname !== "/") return undefined;

    setQuote(pickQuote());
    setLive(true);

    const tBrand = window.setTimeout(() => setShowBrand(true), 36);
    const tQuote = window.setTimeout(() => setShowQuote(true), QUOTE_DELAY_MS + 36);
    const tFade = window.setTimeout(() => setFadeOut(true), TOTAL_BEFORE_FADE_MS);
    const tDone = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setLive(false);
      setFadeOut(false);
      setShowBrand(false);
      setShowQuote(false);
    }, TOTAL_BEFORE_FADE_MS + FADE_OUT_MS);

    timersRef.current = [tBrand, tQuote, tFade, tDone];
    return () => {
      clearTimers();
    };
  }, []);

  if (!live && !fadeOut) return null;

  return (
    <div
      className="sensora-mobile-splash fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-7"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-out`,
        pointerEvents: fadeOut ? "none" : "auto",
      }}
      aria-hidden
    >
      <div
        className="sensora-mobile-splash__bg pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_92%_64%_at_50%_22%,rgba(56,189,248,0.11),transparent_58%),radial-gradient(ellipse_72%_52%_at_88%_78%,rgba(139,92,246,0.08),transparent_52%),linear-gradient(185deg,#040a14_0%,#020617_46%,#030712_100%)]"
        aria-hidden
      />
      <div
        className="sensora-mobile-splash__scrim pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_48%_at_50%_42%,rgba(148,163,184,0.055),transparent_62%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.22)_100%)]"
        aria-hidden
      />

      <div className="relative z-[1] flex max-w-[min(20rem,calc(100vw-2.5rem))] flex-col items-center text-center">
        <div
          className="relative flex items-center justify-center"
          style={{
            opacity: showBrand ? 1 : 0,
            transform: showBrand ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
            transition: `opacity ${BRAND_REVEAL_MS}ms ease-out, transform ${BRAND_REVEAL_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          <div
            className="sensora-mobile-splash__glow pointer-events-none absolute inset-[-28%] rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.2), rgba(139,92,246,0.1) 42%, transparent 72%)",
            }}
            aria-hidden
          />
          <SensoraAnimatedMark size={52} animated={false} className="relative z-[1] drop-shadow-[0_0_32px_-8px_rgba(56,189,248,0.35)]" aria-hidden />
        </div>

        <p
          className="relative z-[1] mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400/95"
          style={{
            opacity: showBrand ? 1 : 0,
            transform: showBrand ? "translateY(0)" : "translateY(6px)",
            transition: `opacity ${BRAND_REVEAL_MS}ms ease-out 32ms, transform ${BRAND_REVEAL_MS}ms cubic-bezier(0.22, 1, 0.36, 1) 32ms`,
          }}
        >
          SENSORA
        </p>

        <p
          className="relative z-[1] mt-4 text-[0.8125rem] font-medium leading-snug tracking-[-0.02em] text-slate-300/95 [word-break:keep-all] sm:text-[0.84375rem]"
          style={{
            opacity: showQuote ? 1 : 0,
            transform: showQuote ? "translateY(0)" : "translateY(8px)",
            transition: `opacity ${QUOTE_FADE_MS}ms ease-out, transform ${BRAND_REVEAL_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {quote}
        </p>
      </div>
    </div>
  );
}
