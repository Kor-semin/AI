"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/app/crm/useAuth";
import type { CalendarEvent, Customer, NextAction } from "@/app/crm/types";
import { loadState, subscribeCustomers, subscribeEvents, subscribeNextActions } from "@/app/crm/storage";

function formatDateTime(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function daysFromNow(iso: string) {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((t - now) / (1000 * 60 * 60 * 24));
}

const DELIVERY_KEYWORDS = ["출고", "인도", "탁송", "등록", "번호판", "PDI", "보험"];
const AFTERCARE_KEYWORDS = ["점검", "블랙박스", "썬팅", "하이패스", "보험", "번호판", "등록", "인수"];

function isDeliveryEvent(ev: CalendarEvent) {
  const hay = `${ev.title ?? ""} ${ev.notes ?? ""}`.toLowerCase();
  return DELIVERY_KEYWORDS.some((k) => hay.includes(k.toLowerCase()));
}

function isAftercareAction(a: NextAction) {
  const hay = `${a.title ?? ""}`.toLowerCase();
  return AFTERCARE_KEYWORDS.some((k) => hay.includes(k.toLowerCase()));
}

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* ignore */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.readOnly = true;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.left = "0";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

const CONTRACT_5WDAY_PROCESS = [
  {
    day: "영업일 1일차 (계약 당일)",
    items: [
      "계약서/개인정보/신분증/사업자(해당 시) 등 기본 서류 확인",
      "결제 방식 확정(현금/할부/리스/렌트) + 조건 최종 확인",
      "금융 진행 시: 심사/한도/필수 서류 안내 메시지 발송",
      "차량/트림/옵션/색상/탁송지/출고희망일 재확인(오더 오류 방지)",
    ],
  },
  {
    day: "영업일 2일차",
    items: [
      "금융 심사/접수 진행 상태 확인(미접수/보완/승인)",
      "필요 서류 보완 요청(누락/해상도/유효기간 등)",
      "프로모션/금리/조건 변동 여부 체크(고객에게 불필요한 혼선 방지)",
    ],
  },
  {
    day: "영업일 3일차",
    items: [
      "차량 배정/생산/출고 예정일 1차 안내(가능하면 근거 포함)",
      "탁송/인도 방식(센터/매장/자택) 확정",
      "보험/등록 관련 필요정보(등록명/공동명의/주소/연락처) 선확인",
    ],
  },
  {
    day: "영업일 4일차",
    items: [
      "등록/번호판/보험 진행 계획 확정(업무 분장 포함)",
      "인도일 후보 2~3개 제시 + 고객 일정 확인",
      "추가 용품/작업(블랙박스/썬팅/하이패스 등) 일정 조율",
    ],
  },
  {
    day: "영업일 5일차",
    items: [
      "인도 전 최종 체크리스트(PDI, 옵션 장착, 서류 원본, 결제/잔금) 점검",
      "고객 안내 메시지(인도 장소/시간/준비물/소요시간) 발송",
      "인도 후 7일/30일 사후관리(만족도/사용 문의) 리마인드 예약",
    ],
  },
] as const;

export default function DeliveryPage() {
  const { auth } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [actions, setActions] = useState<NextAction[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const local = loadState();
    if (local) {
      setCustomers(local.customers ?? []);
      setEvents(local.events ?? []);
      setActions(local.nextActions ?? []);
    }
  }, []);

  useEffect(() => {
    if (auth.status !== "signed-in") return;
    let unsubs: Array<() => void> = [];
    let cancelled = false;
    const onErr = () => {
      /* ignore */
    };
    void (async () => {
      try {
        const uid = auth.uid;
        const u1 = await subscribeCustomers(uid, (v) => !cancelled && setCustomers(v), onErr);
        const u2 = await subscribeEvents(uid, (v) => !cancelled && setEvents(v), onErr);
        const u3 = await subscribeNextActions(uid, (v) => !cancelled && setActions(v), onErr);
        unsubs = [u1, u2, u3];
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
      unsubs.forEach((fn) => fn());
    };
  }, [auth.status]);

  const customerNameById = useMemo(() => {
    const m = new Map<string, string>();
    customers.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [customers]);

  const upcomingDeliveries = useMemo(() => {
    const list = events
      .filter((e) => e?.startAt && isDeliveryEvent(e))
      .map((e) => ({ ...e, _d: daysFromNow(e.startAt) }))
      .filter((e) => e._d >= -1 && e._d <= 45)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
    return list;
  }, [events]);

  const aftercareTodos = useMemo(() => {
    return actions
      .filter((a) => !a.doneAt)
      .filter((a) => (a.dueAt ? daysFromNow(a.dueAt) <= 45 : true))
      .filter((a) => isAftercareAction(a) || (a.dueAt ? daysFromNow(a.dueAt) <= 14 : false))
      .sort((a, b) => `${a.dueAt ?? ""}_${a.createdAt ?? ""}`.localeCompare(`${b.dueAt ?? ""}_${b.createdAt ?? ""}`));
  }, [actions]);

  const contractProcessText = useMemo(() => {
    const lines: string[] = [];
    lines.push("계약 후 5영업일 프로세스 (신차)");
    lines.push("(주말/공휴일은 제외하고 ‘영업일’ 기준으로 진행)");
    lines.push("");
    for (const b of CONTRACT_5WDAY_PROCESS) {
      lines.push(`■ ${b.day}`);
      for (const it of b.items) lines.push(`- ${it}`);
      lines.push("");
    }
    return lines.join("\n").trim();
  }, []);

  return (
    <main className="min-h-screen bg-[color:var(--paper)] px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight">출고 · 인도 · 사후관리</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              신차 고객의 출고 일정과 인도 후 체크를 한 화면에서 관리합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/toc"
              className="rounded-lg border border-[color:var(--edge)] bg-[color:var(--paper)] px-3 py-2 text-xs font-semibold hover:bg-[color:var(--paper-2)] dark:bg-zinc-950"
            >
              목차
            </a>
            <a
              href="/#crm-main"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              CRM로 돌아가기
            </a>
          </div>
        </header>

        <section className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 dark:bg-zinc-950">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold tracking-tight">계약 후 5영업일 프로세스</h2>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                신차 계약 직후 누락되기 쉬운 항목을 영업일 1~5일차로 정리했습니다. (주말/공휴일 제외)
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
              onClick={async () => {
                const ok = await copyText(contractProcessText);
                setCopied(ok ? "복사됨" : "복사 실패");
                window.setTimeout(() => setCopied(null), 1200);
              }}
            >
              체크리스트 복사
            </button>
          </div>

          {copied ? (
            <div className="mt-3 rounded-xl border border-[color:var(--edge)] bg-[color:var(--paper-2)] px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200">
              {copied}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {CONTRACT_5WDAY_PROCESS.map((block) => (
              <div
                key={block.day}
                className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-4 dark:bg-zinc-950"
              >
                <div className="text-xs font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                  {block.day}
                </div>
                <ul className="mt-2 grid gap-1 text-sm text-zinc-700 dark:text-zinc-200">
                  {block.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                      <span className="min-w-0">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 dark:bg-zinc-950">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-bold tracking-tight">출고/인도 일정 (±45일)</h2>
              <a
                href="/#crm-block-events"
                className="text-xs font-semibold text-zinc-700 hover:underline dark:text-zinc-200"
              >
                일정 편집 →
              </a>
            </div>
            <div className="mt-4 space-y-2">
              {upcomingDeliveries.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-3 dark:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{e.title || "일정"}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {e.customerId ? `고객: ${customerNameById.get(e.customerId) ?? "?"}` : "고객 연결 없음"}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-zinc-600 dark:text-zinc-300">
                      <div>{formatDateTime(e.startAt)}</div>
                      <div className="mt-0.5 font-semibold">
                        {e._d === 0 ? "D-DAY" : e._d > 0 ? `D-${e._d}` : `D+${Math.abs(e._d)}`}
                      </div>
                    </div>
                  </div>
                  {e.notes ? (
                    <div className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{e.notes}</div>
                  ) : null}
                </div>
              ))}
              {upcomingDeliveries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  출고/인도 관련 일정이 없습니다. CRM에서 일정 제목에 “출고/인도/등록/탁송” 같은 키워드를 넣으면 자동으로 잡힙니다.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 dark:bg-zinc-950">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-bold tracking-tight">사후관리 체크 (미완료)</h2>
              <a
                href="/#crm-block-next"
                className="text-xs font-semibold text-zinc-700 hover:underline dark:text-zinc-200"
              >
                액션 편집 →
              </a>
            </div>
            <div className="mt-4 space-y-2">
              {aftercareTodos.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-3 dark:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{a.title || "할 일"}</div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {a.customerId ? `고객: ${customerNameById.get(a.customerId) ?? "?"}` : "고객 연결 없음"}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-zinc-600 dark:text-zinc-300">
                      {a.dueAt ? (
                        <>
                          <div>{formatDateTime(a.dueAt)}</div>
                          <div className="mt-0.5 font-semibold">{daysFromNow(a.dueAt) >= 0 ? `D-${daysFromNow(a.dueAt)}` : "기한 지남"}</div>
                        </>
                      ) : (
                        <div className="font-semibold">기한 없음</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {aftercareTodos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  미완료 사후관리 할 일이 없습니다. CRM에서 “점검/블랙박스/썬팅/하이패스/보험/번호판/등록/인수” 같은 키워드를 넣으면
                  이 화면에 자동으로 묶입니다.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 dark:bg-zinc-950">
          <h2 className="text-sm font-bold tracking-tight">빠른 팁 (신차 기준)</h2>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <li>
              - <span className="font-semibold">일정 제목</span>에 “출고/인도/등록/탁송”을 포함하면 출고 일정으로 자동 분류됩니다.
            </li>
            <li>
              - <span className="font-semibold">할 일 제목</span>에 “보험/번호판/점검/하이패스/블랙박스/썬팅” 등을 넣으면 사후관리로 자동 묶입니다.
            </li>
            <li>
              - 가장 정확하게 쓰려면 CRM에서 고객별로 <span className="font-semibold">출고일(D-day)</span> 이벤트를 하나 만들어 두는 걸 추천합니다.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
