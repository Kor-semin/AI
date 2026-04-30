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
            className="absolute inset-0 bg-gradient-to-br from-[#fbf7ef]/93 via-[#f6f1e7]/82 to-transparent dark:from-[#0c0c0c]/93 dark:via-[#101010]/80 dark:to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,230,160,0.12),transparent_52%)] dark:bg-[radial-gradient(ellipse_at_70%_20%,rgba(80,140,220,0.06),transparent_48%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_18%_-10%,rgba(11,26,51,0.14),transparent_60%),radial-gradient(900px_520px_at_112%_12%,rgba(200,163,90,0.16),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(1200px_700px_at_18%_-10%,rgba(240,211,138,0.06),transparent_62%),radial-gradient(980px_560px_at_112%_16%,rgba(120,170,255,0.06),transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]"
          />
        </div>
      </div>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-14 left-4 z-[5] max-w-[min(92vw,22rem)] text-left text-[11px] font-medium tracking-tight text-zinc-800/95 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:text-white/92 dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
      >
        「{QUOTES[quoteIdx]}」
      </div>
    </>
  );
}
