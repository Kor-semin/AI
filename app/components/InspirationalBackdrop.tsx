"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  "한 걸음 한 걸음이 결과를 만든다.",
  "오늘의 상담이 내일의 출고가 된다.",
  "고객의 말 속에 다음 기회가 있다.",
  "정리된 연락처가 빠른 응대를 만든다.",
  "작은 신뢰가 큰 재구매를 만든다.",
  "집중하면 길은 짧아진다.",
  "내일 잘 닫을 하루만 보자.",
  "성실함은 가장 현명한 전략이다.",
];

export function InspirationalBackdrop() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const tQt = window.setInterval(
      () => setQuoteIdx((i) => (i + 1) % QUOTES.length),
      16000,
    );
    return () => {
      window.clearInterval(tQt);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#020817] via-[#07111f] to-[#020817]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_48%_at_58%_22%,rgba(56,189,248,0.09),transparent_60%),radial-gradient(ellipse_50%_36%_at_50%_92%,rgba(15,23,42,0.5),transparent_62%),radial-gradient(ellipse_42%_30%_at_72%_36%,rgba(99,102,241,0.04),transparent_55%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_74%_50%_at_62%_12%,rgba(56,189,248,0.055),transparent_58%),radial-gradient(62%_48%_at_96%_18%,rgba(139,92,246,0.075),transparent_52%),radial-gradient(ellipse_58%_44%_at_12%_68%,rgba(56,189,248,0.035),transparent_56%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.35),transparent_42%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_55%,rgba(15,23,42,0.62),transparent_62%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-80 mix-blend-soft-light bg-[radial-gradient(ellipse_85%_52%_at_48%_100%,rgba(30,58,138,0.09),transparent_58%),radial-gradient(ellipse_58%_42%_at_82%_58%,rgba(79,70,229,0.055),transparent_55%)]"
          />
        </div>
      </div>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-14 left-4 z-[5] max-w-[min(92vw,22rem)] text-left text-[11px] font-medium tracking-tight text-slate-500"
      >
        「{QUOTES[quoteIdx]}」
      </div>
    </>
  );
}
