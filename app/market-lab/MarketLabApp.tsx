"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AI_RATIONALE_COPY,
  SAMPLE_MARKET_SUMMARY,
  SAMPLE_NEWS,
  SAMPLE_PAPERS,
  SAMPLE_REF_PRICES_KRW,
  buildSampleRiskDimensions,
} from "@/lib/marketLab/sampleData";
import {
  CHECKLIST_KEY,
  DEFAULT_BUDGET_KRW,
  DEFAULT_SYMBOLS,
  MARKET_LAB_BUDGET_KEY,
  MARKET_LAB_USER_NOTES_KEY,
  PORTFOLIO_KEY,
  WATCHLIST_KEY,
} from "@/lib/marketLab/storageKeys";

type CheckItem = { id: string; label: string; done: boolean };

const DEFAULT_CHECKLIST: CheckItem[] = [
  { id: "c1", label: "오늘 주요 뉴스·요약의 출처와 날짜를 확인했는가?", done: false },
  { id: "c2", label: "손실 가능성을 이해하고 감당 범위를 적어 두었는가?", done: false },
  { id: "c3", label: "생활비가 아닌 여유자금(소액)만 생각하는가?", done: false },
  { id: "c4", label: "AI가 아닌 본인이 이해한 뒤 판단하는가?", done: false },
  { id: "c5", label: "선물·레버리지를 사용하지 않는가?", done: false },
];

function clampBudget(n: number): number {
  if (!Number.isFinite(n) || n < 0) return DEFAULT_BUDGET_KRW;
  return Math.min(Math.max(Math.floor(n), 1_000), 1_000_000_000);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function normalizeSymbols(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw) {
    const t = s.trim().toUpperCase();
    if (t.length === 0 || t.length > 12) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out.length ? out : [...DEFAULT_SYMBOLS];
}

export function MarketLabApp() {
  const [watchlistInput, setWatchlistInput] = useState("");
  const [symbols, setSymbols] = useState<string[]>([...DEFAULT_SYMBOLS]);
  const [alloc, setAlloc] = useState<Record<string, number>>({});
  const [checklist, setChecklist] = useState<CheckItem[]>(DEFAULT_CHECKLIST);
  const [mockBudget, setMockBudget] = useState(DEFAULT_BUDGET_KRW);
  const [budgetInput, setBudgetInput] = useState(String(DEFAULT_BUDGET_KRW));
  const [userNotes, setUserNotes] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wl = readJson<string[]>(WATCHLIST_KEY, [...DEFAULT_SYMBOLS]);
    setSymbols(normalizeSymbols(wl));
    const pf = readJson<Record<string, number>>(PORTFOLIO_KEY, {});
    setAlloc(typeof pf === "object" && pf !== null ? pf : {});
    const cl = readJson<CheckItem[]>(CHECKLIST_KEY, DEFAULT_CHECKLIST);
    if (Array.isArray(cl) && cl.length) setChecklist(cl);
    const b = readJson<number | null>(MARKET_LAB_BUDGET_KEY, null);
    const budget = typeof b === "number" && Number.isFinite(b) ? clampBudget(b) : DEFAULT_BUDGET_KRW;
    setMockBudget(budget);
    setBudgetInput(String(budget));
    const notes = readJson<string>(MARKET_LAB_USER_NOTES_KEY, "");
    setUserNotes(typeof notes === "string" ? notes : "");
  }, []);

  useEffect(() => {
    writeJson(WATCHLIST_KEY, symbols);
  }, [symbols]);

  useEffect(() => {
    writeJson(PORTFOLIO_KEY, alloc);
  }, [alloc]);

  useEffect(() => {
    writeJson(CHECKLIST_KEY, checklist);
  }, [checklist]);

  useEffect(() => {
    writeJson(MARKET_LAB_BUDGET_KEY, mockBudget);
  }, [mockBudget]);

  useEffect(() => {
    writeJson(MARKET_LAB_USER_NOTES_KEY, userNotes);
  }, [userNotes]);

  const riskModel = useMemo(
    () => buildSampleRiskDimensions(`${SAMPLE_MARKET_SUMMARY.date}:${symbols.join(",")}`),
    [symbols]
  );

  const totalAlloc = useMemo(
    () => symbols.reduce((s, sym) => s + (Number(alloc[sym]) || 0), 0),
    [alloc, symbols]
  );
  const remainder = mockBudget - totalAlloc;
  const overAmount = totalAlloc > mockBudget ? totalAlloc - mockBudget : 0;

  const applyWatchlist = useCallback(() => {
    const parts = watchlistInput
      .split(/[\s,]+/)
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);
    const next = normalizeSymbols([...DEFAULT_SYMBOLS, ...parts]);
    setSymbols(next);
    setWatchlistInput("");
  }, [watchlistInput]);

  const setAmount = (sym: string, value: string) => {
    const n = Math.max(0, Math.floor(Number(value.replace(/[^\d]/g, "")) || 0));
    setAlloc((prev) => ({ ...prev, [sym]: n }));
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const resetPortfolio = () => setAlloc({});

  const applyBudgetFromInput = () => {
    const n = clampBudget(Number(budgetInput.replace(/[^\d]/g, "")) || 0);
    setMockBudget(n);
    setBudgetInput(String(n));
  };

  const setPresetBudget = (n: number) => {
    const v = clampBudget(n);
    setMockBudget(v);
    setBudgetInput(String(v));
  };

  const shell = "min-h-screen bg-[#0b1220] text-slate-200";
  const card =
    "rounded-2xl border border-slate-700/60 bg-[#0f172a]/90 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.4)_inset]";

  const newsById = useMemo(() => Object.fromEntries(SAMPLE_NEWS.map((n) => [n.id, n])), []);

  return (
    <div className={shell}>
      <header className="sticky top-0 z-20 border-b border-slate-700/60 bg-[#0b1220]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">Market Lab</h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              AI는 시장 정보와 근거를 정리하고, 최종 판단은 사용자가 합니다. 실제 투자는 사용자 본인만 실행할 수
              있습니다.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              AI는 투자 금액을 결정하지 않습니다. 이 화면은 투자 자문이 아니라 개인용 리서치·위험 점검 노트입니다.
              실제 주문, 자동매매, 거래소 API 연결은 제공하지 않습니다.
            </p>
          </div>
          <nav className="flex max-w-md flex-wrap gap-2 text-xs sm:justify-end">
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#summary">
              시장 요약
            </a>
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#budget">
              모의 예산
            </a>
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#risk">
              위험도
            </a>
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#research">
              참고 자료
            </a>
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#portfolio">
              모의 포트폴리오
            </a>
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#checklist">
              체크리스트
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className={`${card} border-amber-900/40 bg-amber-950/25`}>
          <h2 className="text-sm font-semibold text-amber-100">위험·역할 고지</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-amber-100/90">
            <li>AI는 금액을 추천하거나 배분하지 않습니다. 모의 예산·배분은 전부 사용자 입력입니다.</li>
            <li>실제 주문 없음 · 자동매매 없음 · 거래소 API·API 키 입력 없음 · 투자 자문 아님.</li>
            <li>레버리지와 선물 거래는 지원하지 않습니다.</li>
            <li>수익 보장·급등 예상·지금 매수하세요 같은 표현을 사용하지 않습니다.</li>
          </ul>
        </section>

        {/* 1 오늘의 시장 요약 */}
        <section id="summary" className={card}>
          <h2 className="text-base font-semibold text-slate-100">오늘의 시장 요약</h2>
          <p className="mt-1 text-xs text-slate-500">샘플 데이터 · 실제 시장과 다를 수 있습니다.</p>

          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
            <p className="text-xs font-medium text-slate-500">시장 분위기</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{SAMPLE_MARKET_SUMMARY.atmosphere}</p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">핵심 뉴스 (샘플 3개)</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {SAMPLE_MARKET_SUMMARY.keyNewsHeadlines.map((k) => (
                <li key={k.id} className="flex flex-col rounded-lg border border-slate-700/40 bg-slate-900/30 px-3 py-2">
                  <span className="text-slate-400">· {k.short}</span>
                  {newsById[k.id] && (
                    <span className="mt-1 text-xs text-slate-500">
                      {newsById[k.id].region} · {newsById[k.id].publishedAt}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">주요 리스크 (예시 3개)</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
              {SAMPLE_MARKET_SUMMARY.keyRisks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-amber-900/30 bg-amber-950/20 p-4">
            <p className="text-xs font-medium text-amber-200/90">오늘의 주의 문구</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/90">{SAMPLE_MARKET_SUMMARY.dailyCaution}</p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-600/50 bg-slate-900/50 p-4">
            <p className="text-xs font-medium text-slate-400">참고용 정적 숫자 (실시간 시세 아님)</p>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">BTC</dt>
                <dd className="font-mono text-slate-200">₩{SAMPLE_REF_PRICES_KRW.BTC.toLocaleString("ko-KR")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">ETH</dt>
                <dd className="font-mono text-slate-200">₩{SAMPLE_REF_PRICES_KRW.ETH.toLocaleString("ko-KR")}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 2 모의 투자 예산 (사용자 영역) */}
        <section id="budget" className={`${card} border-emerald-900/30`}>
          <h2 className="text-base font-semibold text-slate-100">모의 투자 예산 설정</h2>
          <div className="mt-3 space-y-2 rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-4 text-xs leading-relaxed text-emerald-100/90">
            <p>
              이 금액은 실제 투자금이 아니라{" "}
              <strong className="font-medium text-emerald-50">모의 포트폴리오 기준 금액</strong>입니다. 실제 주문은
              실행되지 않습니다.
            </p>
            <p>최종 투자 금액과 투자 여부는 사용자가 직접 결정합니다.</p>
            <p className="text-emerald-200/80">AI는 금액을 결정하지 않습니다 · 자동 배분·자동 주문 없음.</p>
          </div>

          {mounted ? (
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="mock-budget" className="text-xs text-slate-400">
                  총 모의 예산 (원, 직접 입력)
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="mock-budget"
                    type="text"
                    inputMode="numeric"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={applyBudgetFromInput}
                    className="rounded-lg border border-slate-500 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
                  >
                    내 판단으로 예산 적용
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">기본값 {DEFAULT_BUDGET_KRW.toLocaleString("ko-KR")}원 · 새로고침 후에도 유지(localStorage)</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">빠른 선택 (원)</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[50_000, 100_000, 300_000, 1_000_000].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPresetBudget(n)}
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                    >
                      {n.toLocaleString("ko-KR")}원
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2 border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">적용 중인 모의 예산</span>
                  <span className="font-mono text-slate-100">{mockBudget.toLocaleString("ko-KR")}원</span>
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2">
                  <span className="text-slate-400">사용 금액 (모의 배분 합계)</span>
                  <span className="font-mono text-slate-200">{totalAlloc.toLocaleString("ko-KR")}원</span>
                </div>
                <div className="mt-1 flex flex-wrap justify-between gap-2">
                  <span className="text-slate-400">남은 금액</span>
                  <span className={`font-mono ${remainder < 0 ? "text-rose-400" : "text-emerald-400/90"}`}>
                    {remainder.toLocaleString("ko-KR")}원
                  </span>
                </div>
                {overAmount > 0 && (
                  <p className="mt-3 text-sm text-rose-300">
                    예산 초과: 설정한 예산보다 {overAmount.toLocaleString("ko-KR")}원 많이 배분되어 있습니다. 금액은
                    사용자가 직접 줄여 주세요.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">로딩…</p>
          )}
        </section>

        {/* 3 BTC 위험도 분석 */}
        <section id="risk" className={card}>
          <h2 className="text-base font-semibold text-slate-100">BTC 위험도 분석 (샘플)</h2>
          <p className="mt-1 text-xs text-slate-500">
            합성 점수·항목은 교육용 데모입니다. 지금 매수·매도를 지시하지 않으며, 단기 방향을 단정하지 않습니다.
          </p>

          <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-8">
            <div
              className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-4 border-slate-600 bg-slate-900/80"
              style={{
                background: `conic-gradient(#f59e0b ${riskModel.totalScore * 3.6}deg, #1e293b 0deg)`,
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0f172a]">
                <span className="text-3xl font-bold text-slate-100">{riskModel.totalScore}</span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-medium text-slate-200">종합 상태 힌트 (단정 아님)</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{riskModel.narrativeHint}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-300">{AI_RATIONALE_COPY.title}</h3>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-400">
              {AI_RATIONALE_COPY.bullets.map((b, i) => (
                <li key={i}>· {b}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-500">
                  <th className="py-2 pr-2 font-medium">항목</th>
                  <th className="py-2 pr-2 font-medium">점수</th>
                  <th className="py-2 pr-2 font-medium">상태</th>
                  <th className="py-2 font-medium">이유·참고</th>
                </tr>
              </thead>
              <tbody>
                {riskModel.dimensions.map((d) => (
                  <tr key={d.id} className="border-b border-slate-800/80 align-top text-slate-300">
                    <td className="py-3 pr-2 font-medium text-slate-200">{d.label}</td>
                    <td className="py-3 pr-2 font-mono">{d.score}</td>
                    <td className="py-3 pr-2">{d.level}</td>
                    <td className="py-3 text-slate-400">
                      <p>{d.reason}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{d.refLabel}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4 뉴스/논문 참고 자료 */}
        <section id="research" className="space-y-4">
          <div className={card}>
            <h2 className="text-base font-semibold text-slate-100">뉴스 참고 자료 (샘플 · 투자 지시 아님)</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              참고한 자료로만 쓰이며, 단기 매매 근거로 단정하면 위험합니다. 시장에 줄 수 있는 영향은 가능성 수준입니다.
            </p>
            <ul className="mt-4 space-y-4">
              {SAMPLE_NEWS.map((n) => (
                <li key={n.id} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                  <p className="text-sm font-medium text-slate-100">{n.title}</p>
                  <dl className="mt-3 space-y-2 text-xs text-slate-400">
                    <div>
                      <dt className="text-slate-500">출처 / 지역</dt>
                      <dd>
                        {n.source} · {n.region}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">날짜</dt>
                      <dd>{n.publishedAt}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">핵심 요약</dt>
                      <dd className="text-slate-300">{n.summary}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">시장에 줄 수 있는 영향</dt>
                      <dd>{n.marketImpact}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">리스크 방향</dt>
                      <dd>{n.riskDirection}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">신뢰도·확인 필요</dt>
                      <dd>{n.trustOrVerify}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>

          <div className={card}>
            <h2 className="text-base font-semibold text-slate-100">논문·리서치 참고 자료 (샘플)</h2>
            <p className="mt-2 text-xs text-slate-500">학술·리서치는 장기 구조 이해용이며 매매 신호가 아닙니다.</p>
            <ul className="mt-4 space-y-4">
              {SAMPLE_PAPERS.map((p) => (
                <li key={p.id} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                  <p className="text-sm font-medium text-slate-100">{p.title}</p>
                  <dl className="mt-3 space-y-2 text-xs text-slate-400">
                    <div>
                      <dt className="text-slate-500">출처·기관</dt>
                      <dd>{p.institution}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">발표(연도/일)</dt>
                      <dd>{p.publishedAt}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">핵심 주장</dt>
                      <dd className="text-slate-300">{p.coreClaim}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">가상자산 시장과 연결되는 부분</dt>
                      <dd>{p.cryptoMarketLink}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">실제 투자 판단에 바로 쓰면 위험한 부분</dt>
                      <dd className="text-amber-200/90">{p.dangerousIfUsedAlone}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">장기 참고 포인트</dt>
                      <dd>{p.longTermTakeaway}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5 모의 포트폴리오 */}
        <section id="portfolio" className={card}>
          <h2 className="text-base font-semibold text-slate-100">모의 포트폴리오 (로컬만 · 실제 주문 없음)</h2>
          <p className="mt-1 text-xs text-slate-500">
            브라우저에만 저장됩니다. 금액은 사용자가 직접 입력합니다. 합계는 위에서 설정한 모의 예산을 기준으로
            확인하세요.
          </p>

          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">관심 목록 (기본 BTC, ETH · 추가 후 반영)</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={watchlistInput}
                onChange={(e) => setWatchlistInput(e.target.value)}
                placeholder="예: SOL ADA"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={applyWatchlist}
                className="rounded-lg border border-slate-500 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
              >
                관심 목록 반영
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">현재 심볼: {symbols.join(", ")}</p>
          </div>

          {mounted ? (
            <div className="mt-5 space-y-3">
              {symbols.map((sym) => (
                <div key={sym} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-slate-200">{sym}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">모의 배분(원)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={alloc[sym] ?? ""}
                      onChange={(e) => setAmount(sym, e.target.value)}
                      className="w-36 rounded-lg border border-slate-600 bg-slate-950 px-2 py-1.5 text-right font-mono text-sm text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">로딩…</p>
          )}

          <div className="mt-5 rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-slate-400">모의 배분 합계</span>
              <span className="font-mono text-slate-100">{totalAlloc.toLocaleString("ko-KR")}원</span>
            </div>
            <div className="mt-1 flex flex-wrap justify-between gap-2">
              <span className="text-slate-400">모의 예산 대비 남은 금액</span>
              <span className={`font-mono ${remainder < 0 ? "text-rose-400" : "text-emerald-400/90"}`}>
                {remainder.toLocaleString("ko-KR")}원
              </span>
            </div>
          </div>
          {overAmount > 0 && (
            <p className="mt-2 text-xs text-rose-300">
              예산 초과입니다. 모의 포트폴리오 금액을 줄이거나, 예산 섹션에서 모의 예산을 조정할 수 있습니다(모두 사용자
              결정).
            </p>
          )}

          <div className="mt-5">
            <label htmlFor="user-notes" className="text-xs text-slate-400">
              관망 메모 (선택 · 이 기기에만 저장)
            </label>
            <textarea
              id="user-notes"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={3}
              placeholder="판단 근거·보류 사유 등을 짧게 남깁니다. (투자 지시 아님)"
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetPortfolio}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
            >
              모의 배분 초기화
            </button>
          </div>
        </section>

        {/* 6 매수 전 체크리스트 */}
        <section id="checklist" className={card}>
          <h2 className="text-base font-semibold text-slate-100">매수 전 체크리스트</h2>
          <p className="mt-1 text-xs text-slate-500">체크 상태는 이 기기 브라우저에만 저장됩니다. 스스로 확인용입니다.</p>
          <ul className="mt-4 space-y-3">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-900 text-amber-600"
                />
                <span className={`text-sm leading-relaxed ${item.done ? "text-slate-500 line-through" : "text-slate-300"}`}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-5 w-full rounded-lg border border-slate-600 bg-slate-800/80 py-3 text-sm text-slate-200 hover:bg-slate-800 sm:w-auto sm:px-6"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            리스크 확인 완료 · 상단으로
          </button>
        </section>

        <footer className="border-t border-slate-800 pb-12 pt-6 text-center text-xs text-slate-500">
          <p>Market Lab — 개인 리서치·위험 점검용. 실제 주문·자동매매·거래소 API 없음 · 투자 자문 아님.</p>
          <p className="mt-2">
            <Link href="/" className="text-slate-400 underline decoration-slate-600 hover:text-slate-200">
              Sensora CRM으로 돌아가기
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
