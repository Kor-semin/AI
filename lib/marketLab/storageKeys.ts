/** Market Lab localStorage 키 (실제 거래·API 없음) */

export const WATCHLIST_KEY = "market-lab.watchlist.v1";

/** 모의 배분 금액(원), 심볼별 */
export const PORTFOLIO_KEY = "market-lab.portfolio-krw.v1";

/** 사용자 체크리스트 (v2: 매수 전 질문 갱신) */
export const CHECKLIST_KEY = "market-lab.checklist.v2";

/** 총 모의 예산(원) — 기본 100_000 */
export const MARKET_LAB_BUDGET_KEY = "market-lab.budget-krw.v1";

/** 관망·메모 (선택) */
export const MARKET_LAB_USER_NOTES_KEY = "market-lab.user-notes.v1";

export const DEFAULT_BUDGET_KRW = 100_000;

/** @deprecated 런타임 예산은 MARKET_LAB_BUDGET_KEY / state 사용 */
export const BUDGET_KRW = DEFAULT_BUDGET_KRW;

export const DEFAULT_SYMBOLS = ["BTC", "ETH"] as const;
