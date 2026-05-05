"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SAMPLE_MARKET_SUMMARY,
  SAMPLE_NEWS,
  SAMPLE_PAPERS,
  SAMPLE_REF_PRICES_KRW,
  sampleBtcRiskScore,
} from "@/lib/marketLab/sampleData";
import {
  BUDGET_KRW,
  CHECKLIST_KEY,
  DEFAULT_SYMBOLS,
  PORTFOLIO_KEY,
  WATCHLIST_KEY,
} from "@/lib/marketLab/storageKeys";

type CheckItem = { id: string; label: string; done: boolean };

const DEFAULT_CHECKLIST: CheckItem[] = [
  { id: "c1", label: "손실 감당 범위(소액)를 글로 적었는가?", done: false },
  { id: "c2", label: "레버리지·선물이 아닌 현물·소액만 고려하는가?", done: false },
  { id: "c3", label: "뉴스·요약을 믿기 전에 출처·날짜를 확인했는가?", done: false },
  { id: "c4", label: "FOMO(놓칠 것 같은 압박) 없이 하룻밤 자고 다시 볼 수 있는가?", done: false },
  { id: "c5", label: "이 거래가 없어도 생활에 지장이 없는가?", done: false },
];

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wl = readJson<string[]>(WATCHLIST_KEY, [...DEFAULT_SYMBOLS]);
    setSymbols(normalizeSymbols(wl));
    const pf = readJson<Record<string, number>>(PORTFOLIO_KEY, {});
    setAlloc(typeof pf === "object" && pf !== null ? pf : {});
    const cl = readJson<CheckItem[]>(CHECKLIST_KEY, DEFAULT_CHECKLIST);
    if (Array.isArray(cl) && cl.length) setChecklist(cl);
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

  const risk = useMemo(() => sampleBtcRiskScore(`${SAMPLE_MARKET_SUMMARY.date}:${symbols.join(",")}`), [symbols]);

  const totalAlloc = useMemo(
    () => symbols.reduce((s, sym) => s + (Number(alloc[sym]) || 0), 0),
    [alloc, symbols]
  );
  const remainder = BUDGET_KRW - totalAlloc;

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

  const shell = "min-h-screen bg-[#0b1220] text-slate-200";
  const card =
    "rounded-2xl border border-slate-700/60 bg-[#0f172a]/90 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.4)_inset]";

  return (
    <div className={shell}>
      <header className="sticky top-0 z-20 border-b border-slate-700/60 bg-[#0b1220]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">Market Lab</h1>
            <p className="mt-1 text-xs text-slate-400">
              AI는 시장 정보를 정리하고, 최종 판단은 사용자가 합니다. 이 화면은 투자 자문이 아니라 개인용 분석 노트입니다.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-xs">
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#summary">
              시장 요약
            </a>
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#risk">
              리스크
            </a>
            <a className="rounded-lg border border-slate-600/70 px-2 py-1 text-slate-300 hover:bg-slate-800/80" href="#research">
              뉴스·논문
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
          <h2 className="text-sm font-semibold text-amber-100">위험·한도 고지</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-amber-100/90">
            <li>{BUDGET_KRW.toLocaleString("ko-KR")}원 이하 소액 학습용 기준으로 표시합니다.</li>
            <li>레버리지와 선물 거래는 지원하지 않습니다.</li>
            <li>자동매수·자동매도, 거래소 주문, API 키 입력 기능은 없습니다.</li>
            <li>수익 보장·급등 확정·무조건 매수 같은 표현을 사용하지 않습니다.</li>
          </ul>
        </section>

        {/* 1 오늘의 시장 요약 */}
        <section id="summary" className={card}>
          <h2 className="text-base font-semibold text-slate-100">오늘의 시장 요약</h2>
          <p className="mt-1 text-xs text-slate-500">샘플 문구 · 실제 시장과 다를 수 있습니다.</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {SAMPLE_MARKET_SUMMARY.bullets.map((b, i) => (
              <li key={i} className="leading-relaxed">
                {b}
              </li>
            ))}
          </ul>
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

        {/* 2 비트코인 리스크 점수 */}
        <section id="risk" className={card}>
          <h2 className="text-base font-semibold text-slate-100">비트코인 리스크 점수 (샘플)</h2>
          <p className="mt-1 text-xs text-slate-500">0–100 데모 지표. 실제 리스크와 무관할 수 있습니다.</p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-slate-600 bg-slate-900/80"
              style={{
                background: `conic-gradient(#f59e0b ${risk.score * 3.6}deg, #1e293b 0deg)`,
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0f172a]">
                <span className="text-3xl font-bold text-slate-100">{risk.score}</span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-300">{risk.label}</p>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-slate-400">
            {risk.factors.map((f, i) => (
              <li key={i}>· {f}</li>
            ))}
          </ul>
        </section>

        {/* 3 뉴스/논문 요약 카드 */}
        <section id="research" className="space-y-4">
          <div className={card}>
            <h2 className="text-base font-semibold text-slate-100">뉴스 요약 카드 (샘플)</h2>
            <ul className="mt-4 space-y-4">
              {SAMPLE_NEWS.map((n) => (
                <li
                  key={n.id}
                  className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4"
                >
                  <p className="text-sm font-medium text-slate-100">{n.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{n.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {n.source} · 톤: {n.tone}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className={card}>
            <h2 className="text-base font-semibold text-slate-100">논문 요약 카드 (샘플)</h2>
            <ul className="mt-4 space-y-4">
              {SAMPLE_PAPERS.map((p) => (
                <li key={p.id} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                  <p className="text-sm font-medium text-slate-100">{p.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">{p.venue}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4 10만 원 모의 포트폴리오 */}
        <section id="portfolio" className={card}>
          <h2 className="text-base font-semibold text-slate-100">10만 원 모의 포트폴리오 (로컬만)</h2>
          <p className="mt-1 text-xs text-slate-500">
            브라우저 localStorage에만 저장됩니다. 실제 주문·체결 없음. 합계가 {BUDGET_KRW.toLocaleString("ko-KR")}원을
            넘지 않도록 스스로 맞춥니다.
          </p>

          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">관심 목록 (기본 BTC, ETH · 쉼표/공백으로 추가)</p>
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
                반영
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
                    <span className="text-xs text-slate-500">배분(원)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={alloc[sym] ?? ""}
                      onChange={(e) => setAmount(sym, e.target.value)}
                      className="w-32 rounded-lg border border-slate-600 bg-slate-950 px-2 py-1.5 text-right font-mono text-sm text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">로딩…</p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-sm">
            <div>
              <span className="text-slate-400">배분 합계 </span>
              <span className="font-mono text-slate-100">{totalAlloc.toLocaleString("ko-KR")}원</span>
            </div>
            <div>
              <span className="text-slate-400">남은 예산 </span>
              <span
                className={`font-mono ${remainder < 0 ? "text-rose-400" : "text-emerald-400/90"}`}
              >
                {remainder.toLocaleString("ko-KR")}원
              </span>
            </div>
          </div>
          {remainder < 0 && (
            <p className="mt-2 text-xs text-rose-300">합계가 예산을 초과했습니다. 금액을 줄여 소액 학습 범위 안에서 맞추세요.</p>
          )}

          <button
            type="button"
            onClick={resetPortfolio}
            className="mt-4 text-xs text-slate-500 underline decoration-slate-600 hover:text-slate-300"
          >
            모의 배분 초기화 (localStorage)
          </button>
        </section>

        {/* 5 매수 전 체크리스트 */}
        <section id="checklist" className={card}>
          <h2 className="text-base font-semibold text-slate-100">매수 전 체크리스트</h2>
          <p className="mt-1 text-xs text-slate-500">체크 상태는 이 기기 브라우저에만 저장됩니다.</p>
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
        </section>

        <footer className="border-t border-slate-800 pb-12 pt-6 text-center text-xs text-slate-500">
          <p>Market Lab — 개인 리서치용 MVP. 주문·자동매매 없음.</p>
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
