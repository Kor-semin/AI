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
            className="absolute inset-0 bg-gradient-to-br from-[#eef1f4] via-[#e8ecf2] to-[#f8fafc]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_20%_-12%,rgba(148,163,184,0.2),transparent_55%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(900px_560px_at_100%_18%,rgba(255,255,255,0.75),transparent_58%),linear-gradient(180deg,rgba(241,245,249,0.5),transparent)]"
          />
        </div>
      </div>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-14 left-4 z-[5] max-w-[min(92vw,22rem)] text-left text-[11px] font-medium tracking-tight text-[#64748b]"
      >
        「{QUOTES[quoteIdx]}」
      </div>
    </>
  );
}
