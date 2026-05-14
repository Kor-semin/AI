"use client";

import { useEffect, useState } from "react";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";

const STORAGE_KEY = "sensora.session.splash.v1";
const DISPLAY_MS = 1500;
const FADE_MS = 450;

/**
 * 모바일(좁은 화면)에서 세션당 1회, 앱 첫인상용 짧은 스플래시.
 * 민감 정보 없음 · 과한 모션 없음(fade만).
 */
export function MobileAppSplash() {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return undefined;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return undefined;
    } catch {
      return undefined;
    }
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
    setPhase("show");
    const t1 = window.setTimeout(() => setPhase("fade"), DISPLAY_MS);
    const t2 = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setPhase("hidden");
    }, DISPLAY_MS + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "hidden") return null;

  const opacity = phase === "show" ? 1 : 0;
  const pointerEvents = phase === "fade" ? "none" : "auto";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_88%_60%_at_50%_18%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_80%_72%,rgba(139,92,246,0.09),transparent_52%),linear-gradient(180deg,#050a14_0%,#020617_48%,#030712_100%)] px-6"
      style={{
        opacity,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents,
      }}
      aria-hidden={phase === "fade"}
    >
      <SensoraAnimatedMark size={52} animated={false} className="drop-shadow-[0_0_28px_-6px_rgba(56,189,248,0.45)]" aria-hidden />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/85">Sensora</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-[0.14em] text-slate-50 sm:text-[1.65rem]">SENSORA</h1>
      <p className="mt-4 max-w-[20ch] text-center text-[0.8125rem] font-medium leading-snug text-slate-300/95 [word-break:keep-all] sm:max-w-[24ch] sm:text-[0.875rem]">
        자동차 영업사원 전용
      </p>
      <p className="mt-1.5 text-center text-[11px] leading-relaxed text-slate-500/95 sm:text-xs">AI 고객관리 워크스페이스</p>
    </div>
  );
}
