"use client";

type Tab = "고객" | "다음할일" | "일정" | "템플릿";

/** 그대로 브라우저 앵커 이동(스크롤 마진만 본문에 적용됨). */
function scrollToAnchor(id: string): void {
  window.requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior:
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      block: "start",
    });
    try {
      el.focus({ preventScroll: true });
    } catch {
      /* ignore */
    }
  });
}

export function CRMAppToc({
  hasCustomer,
  tab,
  setTab,
}: {
  hasCustomer: boolean;
  tab: Tab;
  setTab: (next: Tab) => void;
}) {
  const chip =
    "inline-flex items-center rounded-full border border-[color:var(--edge)] bg-[color:var(--paper)] px-2.5 py-1 text-[11px] font-semibold text-zinc-700 transition hover:bg-[color:var(--paper-2)] dark:text-zinc-200";

  return (
    <nav
      className="shrink-0 border-b border-[color:var(--edge)] bg-[color:var(--paper-2)]/80 px-3 py-3 backdrop-blur-sm sm:px-4"
      aria-label="CRM 본문 목차"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          상담 목차 · 빠른 이동
        </p>
        <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 text-left">
          <li>
            <a className={chip} href="#crm-aside">
              고객 목록 · 검색
            </a>
          </li>
          <li>
            <a className={chip} href="#crm-contact-sync">
              연락처 연동
            </a>
          </li>
          <li>
            <a className={chip} href="#crm-detail-header">
              상담 고객 요약
            </a>
          </li>
          {hasCustomer ? (
            <>
              <li>
                <a className={chip} href="#crm-block-profile">
                  고객·차량 정보
                </a>
              </li>
              <li>
                <a className={chip} href="#crm-block-budget">
                  예산·시세·조건
                </a>
              </li>
              <li>
                <a className={chip} href="#crm-block-compare">
                  비교 차종
                </a>
              </li>
              <li>
                <a className={chip} href="#crm-block-used-car">
                  중고차 정리
                </a>
              </li>
              <li>
                <a className={chip} href="#crm-block-quick-tpl">
                  빠른 메시지
                </a>
              </li>
              <li>
                <a className={chip} href="#crm-block-next">
                  다음 연락 · 후속
                </a>
              </li>
              <li>
                <a className={chip} href="#crm-block-events">
                  상담·출고 일정
                </a>
              </li>
              <li>
                <a className={chip} href="#crm-block-global">
                  실적·백업
                </a>
              </li>
            </>
          ) : (
            <li className="text-[11px] text-zinc-500 dark:text-zinc-400">
              (고객을 선택하면 상담 카드별 입력칸이 열립니다)
            </li>
          )}
          <li>
            <button
              type="button"
              className={chip}
              onClick={() => {
                setTab("템플릿");
                /* 템플릿 블록은 탭 전환 후에만 DOM에 붙음 */
                window.setTimeout(() => scrollToAnchor("crm-block-templates"), 0);
              }}
            >
              템플릿 관리
              {tab === "템플릿" ? (
                <span className="ml-1 text-[10px] font-normal opacity-75">표시 중</span>
              ) : null}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
