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

const STORAGE_KEY = "sensora.session.splash.v3";

const TOTAL_MS = 1200;
const FADE_OUT_MS = 250;
const FADE_OUT_START_MS = TOTAL_MS - FADE_OUT_MS;
const BG_BRIGHTEN_MS = 200;
const LOGO_ANIM_MS = 420;
/** SENSORA 노출(~120ms) 이후 약 0.2초 늦춤 */
const QUOTE_DELAY_AFTER_MOUNT_MS = 320;
const QUOTE_FADE_MS = 380;
const LOGO_MARK_PX = 80;

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
  const [outerFadeOut, setOuterFadeOut] = useState(false);
  const [quote, setQuote] = useState("");
  const [bgBright, setBgBright] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showSensora, setShowSensora] = useState(false);
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

    const tBg = window.setTimeout(() => setBgBright(true), 32);
    const tLogo = window.setTimeout(() => setShowLogo(true), 48);
    const tSensora = window.setTimeout(() => setShowSensora(true), 120);
    const tQuote = window.setTimeout(() => setShowQuote(true), QUOTE_DELAY_AFTER_MOUNT_MS);
    const tFade = window.setTimeout(() => setOuterFadeOut(true), FADE_OUT_START_MS);
    const tDone = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setLive(false);
      setOuterFadeOut(false);
      setBgBright(false);
      setShowLogo(false);
      setShowSensora(false);
      setShowQuote(false);
    }, TOTAL_MS);

    timersRef.current = [tBg, tLogo, tSensora, tQuote, tFade, tDone];
    return () => {
      clearTimers();
    };
  }, []);

  if (!live) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden px-7"
      style={{
        opacity: outerFadeOut ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-out`,
        pointerEvents: outerFadeOut ? "none" : "auto",
      }}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[#020713]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(88,80,236,0.20),transparent_32%),radial-gradient(circle_at_50%_60%,rgba(14,165,233,0.10),transparent_38%)] transition-opacity ease-out"
        style={{ opacity: bgBright ? 1 : 0.82, transitionDuration: `${BG_BRIGHTEN_MS}ms` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_38%,rgba(15,23,42,0.5),transparent_55%)] opacity-90"
        aria-hidden
      />
      {/* 아주 약한 별 점 — 정적, 낮은 대비 */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden>
        <span className="absolute left-[12%] top-[18%] size-0.5 rounded-full bg-slate-200/80" />
        <span className="absolute right-[16%] top-[22%] size-px rounded-full bg-cyan-100/70" />
        <span className="absolute left-[22%] bottom-[28%] size-px rounded-full bg-violet-100/60" />
        <span className="absolute right-[24%] bottom-[20%] size-0.5 rounded-full bg-slate-300/70" />
        <span className="absolute left-[48%] top-[12%] size-px rounded-full bg-slate-200/50" />
      </div>

      <div className="relative z-[1] -mt-[min(8vh,3.5rem)] flex max-w-[min(20rem,calc(100vw-2.5rem))] flex-col items-center text-center">
        <div className="relative mb-7 flex items-center justify-center">
          <div
            className="pointer-events-none absolute inset-[-22px] rounded-full bg-cyan-400/10 blur-2xl transition-[opacity,transform] duration-[900ms] ease-out"
            style={{
              opacity: showLogo ? 1 : 0.55,
              transform: showLogo ? "scale(1.04)" : "scale(0.96)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-[-18px] rounded-full bg-violet-500/8 blur-3xl transition-opacity duration-[700ms] ease-out"
            style={{ opacity: showLogo ? 1 : 0.4 }}
            aria-hidden
          />
          <div
            style={{
              opacity: showLogo ? 1 : 0,
              transform: showLogo ? "scale(1)" : "scale(0.96)",
              transition: `opacity ${LOGO_ANIM_MS}ms ease-out, transform ${LOGO_ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            <SensoraAnimatedMark
              size={LOGO_MARK_PX}
              animated={false}
              className="relative z-[1] drop-shadow-[0_0_36px_-10px_rgba(56,189,248,0.32)]"
              aria-hidden
            />
          </div>
        </div>

        <p
          className="mb-4 text-[13px] font-semibold tracking-[0.42em] text-cyan-200/80"
          style={{
            opacity: showSensora ? 1 : 0,
            transform: showSensora ? "translateY(0)" : "translateY(6px)",
            transition: `opacity ${LOGO_ANIM_MS}ms ease-out 40ms, transform ${LOGO_ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1) 40ms`,
          }}
        >
          SENSORA
        </p>

        <p
          className="max-w-[280px] text-[18px] font-semibold leading-relaxed tracking-[-0.02em] text-white [word-break:keep-all] sm:text-[19px]"
          style={{
            opacity: showQuote ? 1 : 0,
            transform: showQuote ? "translateY(0)" : "translateY(8px)",
            transition: `opacity ${QUOTE_FADE_MS}ms ease-out, transform ${LOGO_ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {quote}
        </p>
      </div>
    </div>
  );
}
