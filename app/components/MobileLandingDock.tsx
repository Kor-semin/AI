"use client";

type Props = {
  onScrollLandingTop: () => void;
  onOpenCustomers: () => void;
  onOpenMemo: () => void;
  onOpenAi: () => void;
  onOpenMore: () => void;
};

/**
 * 랜딩 전용 모바일 하단 탭 골격(앱 느낌). 완전한 라우팅 분기보다 빠른 진입 UX 우선.
 */
export function MobileLandingDock({ onScrollLandingTop, onOpenCustomers, onOpenMemo, onOpenAi, onOpenMore }: Props) {
  const tab =
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold leading-tight text-slate-400 transition active:scale-[0.98] touch-manipulation sm:text-[11px]";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.1] bg-[#050a14]/96 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] pt-1.5 shadow-[0_-10px_28px_rgba(0,0,0,0.38)] backdrop-blur-xl lg:hidden"
      aria-label="빠른 이동"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
        <button type="button" className={`${tab} text-sky-200/95`} onClick={onScrollLandingTop}>
          홈
        </button>
        <button type="button" className={tab} onClick={onOpenCustomers}>
          고객
        </button>
        <button type="button" className={tab} onClick={onOpenMemo}>
          메모
        </button>
        <button type="button" className={tab} onClick={onOpenAi}>
          AI
        </button>
        <button type="button" className={tab} onClick={onOpenMore}>
          더보기
        </button>
      </div>
    </nav>
  );
}
