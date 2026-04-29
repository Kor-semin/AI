"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "crm.notebookCoverDismissed";

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** 전체 화면 다이어리 표지. 클릭·탭 · Enter · Space 로 다음 화면 */
export function NotebookCover() {
  const [dismissed, setDismissed] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 저장소 초기 동기화
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cover") === "1" || params.get("openCover") === "1") {
        sessionStorage.removeItem(STORAGE_KEY);
        setDismissed(false);
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
    setDismissed(readDismissed());
  }, []);

  useEffect(() => {
    const onShow = () => setForceShow(true);
    window.addEventListener("crm-show-notebook-cover", onShow);
    return () => window.removeEventListener("crm-show-notebook-cover", onShow);
  }, []);

  const visible = forceShow || !dismissed;

  const handleOpenNotebook = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setForceShow(false);
  }, []);

  useEffect(() => {
    if (!visible || !panelRef.current) return;
    panelRef.current.focus({ preventScroll: true });
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notebook-cover-title"
      tabIndex={0}
      className="notebook-cover-sheet outline-none [-webkit-tap-highlight-color:transparent]"
      onClick={handleOpenNotebook}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        handleOpenNotebook();
      }}
    >
      <div aria-hidden className="notebook-cover-spine" />

      <div className="relative z-[1] flex min-h-[100dvh] min-h-[100svh] w-full cursor-pointer flex-col justify-between pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pl-[max(5.5rem,calc(env(safe-area-inset-left,0px)+92px))] pr-[max(28px,calc(env(safe-area-inset-right,0px)+1.75rem))] pt-[max(28px,calc(env(safe-area-inset-top,0px)+1.75rem))] md:mx-auto md:max-w-[min(880px,calc(100vw-56px))]">
        <header className="shrink-0 border-b border-white/[0.1] pb-6 opacity-96">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.45em] text-white/54">
              Field notes
            </span>
            <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] text-white/62">
              CRM
            </span>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-3">
          <h1
            id="notebook-cover-title"
            className="max-w-[20ch] text-center text-[clamp(1.5rem,5.2vw,2.1875rem)] font-semibold leading-[1.45] tracking-tight text-[#fdfcfa] drop-shadow-[0_1px_18px_rgba(0,0,0,0.45)] sm:max-w-none sm:text-[clamp(1.75rem,3.9vw,2.375rem)]"
          >
            자동차 컨설턴트 전용
            <span className="mt-5 block opacity-93">수첩</span>
          </h1>

          <p className="mt-14 max-w-[26em] text-center text-[clamp(13px,2.95vw,15px)] leading-relaxed text-white/73">
            상담·견적·재콜이 한 페이지에 만나는
            <br className="sm:hidden" />{" "}
            <span className="hidden sm:inline"> </span>
            매장 현장용 작업 노트입니다.
          </p>

          <div
            aria-hidden
            className="mt-[min(20vh,7.5rem)] h-px w-[min(11rem,calc(100vw-48px))] bg-[linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.42),rgba(255,255,255,.08))]"
          />
        </div>

        <p className="shrink-0 select-none text-center text-[clamp(11px,2.85vw,13px)] text-white/[0.38] antialiased md:text-[13px]">
          어디든 클릭하거나 두드려서 다음으로 · Enter / 스페이스
        </p>
      </div>
    </div>
  );
}
