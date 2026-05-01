"use client";

import { useEffect } from "react";

const STORAGE_KEY = "crm.notebookCoverDismissed";

const TOC_ENTRIES: ReadonlyArray<{
  step: string;
  label: string;
  href: string;
}> = [
  { step: "01", label: "리드 목록 · 검색", href: "/#crm-aside" },
  { step: "02", label: "상담 고객 요약", href: "/#crm-detail-header" },
  { step: "03", label: "고객·차량 정보", href: "/#crm-block-profile" },
  { step: "04", label: "금융 조건·메모", href: "/#crm-block-budget" },
  { step: "05", label: "금융 안내 문구", href: "/#crm-block-quick-tpl" },
  { step: "06", label: "금융 다음 안내", href: "/#crm-block-next" },
  { step: "07", label: "상담 · 출고 일정", href: "/#crm-block-events" },
  { step: "08", label: "템플릿 관리", href: "/?tab=templates#crm-block-templates" },
  { step: "09", label: "실적 요약 · 백업", href: "/#crm-block-global" },
];

export default function TocPage() {
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <main
      className="relative flex min-h-[100dvh] min-h-[100svh] w-full flex-col items-center overflow-x-hidden bg-[#efe8df] px-[max(1.35rem,env(safe-area-inset-left))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1.35rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#2e2620]"
      aria-label="수첩 목차 페이지 전체 화면"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_135%_95%_at_50%_-8%,rgba(255,255,255,0.95),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_88%_58%_at_100%_8%,rgba(255,210,170,0.22),transparent_54%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_42%_at_50%_100%,rgba(200,176,150,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(120,100,84,0.08)]" />

      <div className="relative z-[1] mx-auto flex w-full max-w-[min(900px,100%)] flex-1 flex-col items-center pb-8 text-center">
        <header className="w-full shrink-0 px-2 pb-10 pt-7 text-center sm:pb-11 sm:pt-8">
          <div className="mx-auto mb-9 flex items-center justify-center gap-6">
            <div className="h-px w-[min(4.75rem,16vw)] max-w-none bg-gradient-to-r from-transparent to-[#9a8776]/38" aria-hidden />
            <p className="font-[family-name:var(--font-toc-serif,ui-serif)] text-[clamp(12px,2.8vw,13px)] font-bold uppercase tracking-[0.42em] text-[#6b5c4e]">
              Contents
            </p>
            <div className="h-px w-[min(4.75rem,16vw)] bg-gradient-to-l from-transparent to-[#9a8776]/38" aria-hidden />
          </div>

          <p className="text-[clamp(13px,2.95vw,14px)] font-semibold tracking-[0.06em] text-[#766860]">
            Field notebook · chapter
          </p>
          <h1 className="toc-page-title mx-auto mt-5 max-w-[22ch] text-balance text-center text-[clamp(1.92rem,5.4vw,2.72rem)] font-black leading-[1.06] tracking-[-0.04em] text-[#1f1712] md:max-w-[26ch]">
            자동차 금융 컨설턴트 목차
          </h1>
          <div className="mx-auto mt-7 max-w-[min(42ch,calc(100vw-4rem))] space-y-4 text-pretty text-center text-[clamp(1.06rem,2.75vw,1.28rem)] font-semibold leading-relaxed tracking-[-0.012em] text-[#54483e]">
            <p>상담부터 금융 안내, 사후관리까지 흐름에 맞게 이동합니다.</p>
            <p className="px-2 text-[#2a231c]">항목을 눌러 바로 해당 구역으로 갑니다.</p>
          </div>
        </header>

        <div className="grid w-full flex-1 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:max-w-none lg:gap-4">
          {TOC_ENTRIES.map((item, idx) => (
            <a
              key={item.href + item.step}
              href={item.href}
              className="toc-grid-item-animate group relative flex min-h-[5.85rem] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#d1c6ba]/92 bg-[linear-gradient(170deg,#fffcf9f8_0%,#f7f2ecee_54%,#efe9e2fb_100%)] px-[1.25rem] py-[1.25rem] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_14px_36px_-18px_rgba(90,78,62,0.14)] backdrop-blur-[8px] transition-[transform,box-shadow,border-color,background-image] hover:-translate-y-0.5 hover:border-[#c8b098]/95 hover:bg-[linear-gradient(170deg,#fffffffb_0%,#faf7f4f9_54%,#f4ece5ff_100%)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_22px_44px_-16px_rgba(90,78,62,0.18)] active:translate-y-0"
              style={{ animationDelay: `${0.035 + idx * 0.05}s` }}
            >
              <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[#d4baa2]/42 to-transparent opacity-95" aria-hidden />

              <span className="mb-2 font-mono text-[clamp(12px,2.85vw,15px)] font-bold tabular-nums tracking-tight text-[#9a8674] transition-colors group-hover:text-[#6b5844]">
                {item.step}
              </span>
              <span className="min-w-0 max-w-[20ch] text-center text-[clamp(15px,4.25vmin,23pt)] font-extrabold leading-snug tracking-[-0.024em] text-[#29221c] transition-colors group-hover:text-[#1f1812] sm:max-w-[22ch]">
                {item.label}
              </span>
              <span className="mt-2 inline-block translate-x-0 text-[15px] font-semibold text-[#9a8674]/70 opacity-90 transition-colors group-hover:text-[#6b5844]" aria-hidden>
                →
              </span>
            </a>
          ))}
        </div>

        <div className="mt-16 w-full max-w-xl shrink-0 px-2 text-center sm:mt-[4.25rem]">
          <div className="mb-7 h-px w-full bg-gradient-to-r from-transparent via-[#c4b4a4]/42 to-transparent" aria-hidden />
          <p className="mb-4 font-[family-name:var(--font-toc-serif)] text-[clamp(13px,2.95vw,14px)] font-bold tracking-[0.18em] text-[#766860]">
            운영 흐름
          </p>
          <a
            href="/delivery"
            className="group relative flex min-h-[4rem] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#beb0a2]/92 bg-[linear-gradient(180deg,#fdfaf7fa_0%,#efe8dff7_100%)] px-[1.25rem] py-[1.1rem] text-center text-[clamp(1.06rem,2.75vw,1.34rem)] font-extrabold tracking-[-0.024em] text-[#2c241e] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-[border-color,transform,background-color] hover:-translate-y-0.5 hover:border-[#b49a82]/92 hover:bg-[linear-gradient(180deg,#fffffffa_0%,#efe7ddfa_100%)] active:translate-y-0"
          >
            <span className="relative z-[1] flex flex-wrap justify-center gap-x-2 gap-y-1 text-center">
              <span className="font-black text-[#7a5838]">Tip</span>
              <span aria-hidden className="select-none text-[13px] font-semibold opacity-75">
                ·
              </span>
              <span className="tracking-tight">출고 · 인도 · 사후관리</span>
            </span>
            <span className="mt-3 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[#83756a] opacity-94">
              delivery hub
            </span>
          </a>
        </div>

        <div className="mt-auto flex w-full max-w-xl shrink-0 flex-col items-center gap-4 px-2 pt-[3.75rem]">
          <span className="text-[11px] font-semibold tracking-[0.24em] text-[#83756a]">업무 시작</span>
          <a
            href="/#crm-main"
            className="flex min-h-[3.95rem] w-full cursor-pointer items-center justify-center rounded-2xl bg-[linear-gradient(165deg,#fffffd_0%,#ebe2d8_42%,#d4baa2_118%)] px-10 py-[1rem] text-center text-[clamp(1.1rem,2.85vw,1.42rem)] font-black tracking-[-0.03em] text-[#17120f] shadow-[0_22px_48px_-10px_rgba(90,78,62,0.22)] ring-1 ring-[#dcd0c6]/92 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_28px_56px_-8px_rgba(90,78,62,0.28)] active:translate-y-0"
          >
            업무 대시보드 열기
          </a>
        </div>
      </div>
    </main>
  );
}
