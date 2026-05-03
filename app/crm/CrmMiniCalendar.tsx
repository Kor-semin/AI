"use client";

import type { CalendarEvent, Customer, DeliveryGuide, NextAction } from "@/app/crm/types";
import { useMemo, useState } from "react";

type MiniItem = {
  id: string;
  kind: "event" | "next" | "contact" | "delivery";
  at: Date;
  label: string;
  customerId: string | null;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function isoDayKeyLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseIsoToLocalDate(iso: string): Date | null {
  const t = iso?.trim();
  if (!t) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  const x = new Date(d.getFullYear(), d.getMonth() + delta, 1);
  return x;
}

function daysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate();
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export type CrmMiniCalendarProps = {
  customers: Customer[];
  nextActions: NextAction[];
  events: CalendarEvent[];
  onPickCustomer?: (customerId: string) => void;
};

export function CrmMiniCalendar({
  customers,
  nextActions,
  events,
  onPickCustomer,
}: CrmMiniCalendarProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  });

  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, MiniItem[]>();

    const push = (key: string, item: MiniItem) => {
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    };

    for (const a of nextActions) {
      if (a.doneAt) continue;
      const due = a.dueAt ? parseIsoToLocalDate(a.dueAt) : null;
      if (!due) continue;
      const key = isoDayKeyLocal(due);
      const c = customerById.get(a.customerId);
      push(key, {
        id: `na-${a.id}`,
        kind: "next",
        at: due,
        label: c ? `${c.name} · ${a.title}` : a.title,
        customerId: a.customerId,
      });
    }

    for (const e of events) {
      const st = parseIsoToLocalDate(e.startAt);
      if (!st) continue;
      const key = isoDayKeyLocal(st);
      const c = e.customerId ? customerById.get(e.customerId) : undefined;
      const title = e.title?.trim() || "일정";
      const time = st.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
      push(key, {
        id: `ev-${e.id}`,
        kind: "event",
        at: st,
        label: c ? `${c.name} · ${time} · ${title}` : `${time} · ${title}`,
        customerId: e.customerId ?? null,
      });
    }

    for (const c of customers) {
      if (c.nextContactAt) {
        const d = parseIsoToLocalDate(c.nextContactAt);
        if (d) {
          const key = isoDayKeyLocal(d);
          const time = d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
          push(key, {
            id: `nc-${c.id}-${key}`,
            kind: "contact",
            at: d,
            label: `${c.name} · ${time} · 다음 연락`,
            customerId: c.id,
          });
        }
      }
      const g: DeliveryGuide | undefined = c.deliveryGuide;
      if (g?.deliveryEtaDate) {
        const d = parseIsoToLocalDate(g.deliveryEtaDate);
        if (d) {
          const key = isoDayKeyLocal(d);
          push(key, {
            id: `dl-${c.id}-${key}`,
            kind: "delivery",
            at: d,
            label: `${c.name} · 출고 예정`,
            customerId: c.id,
          });
        }
      }
    }

    for (const [, arr] of map) {
      arr.sort((x, y) => x.at.getTime() - y.at.getTime());
    }
    return map;
  }, [customers, nextActions, events, customerById]);

  const y = cursor.getFullYear();
  const m0 = cursor.getMonth();
  const dim = daysInMonth(y, m0);
  const firstDow = new Date(y, m0, 1).getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let day = 1; day <= dim; day++) cells.push(new Date(y, m0, day));

  const selKey = isoDayKeyLocal(selected);
  const list = itemsByDay.get(selKey) ?? [];

  const goToday = () => {
    const n = new Date();
    setCursor(startOfMonth(n));
    setSelected(new Date(n.getFullYear(), n.getMonth(), n.getDate()));
  };

  return (
    <section
      id="crm-mini-calendar"
      className="sensora-premium-panel scroll-mt-28 rounded-[22px] px-4 py-4 backdrop-blur-xl sm:px-5 sm:py-5"
      aria-label="미니 캘린더"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 gap-y-3">
        <div className="text-[15px] font-semibold text-slate-50">일정 미리보기</div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="sensora-dark-ghost-btn min-h-[40px] min-w-[40px] touch-manipulation rounded-xl px-3 py-2 text-[13px] font-semibold"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            aria-label="이전 달"
          >
            ‹
          </button>
          <span className="min-w-[7.5rem] text-center text-[14px] font-semibold tabular-nums text-slate-200">
            {y}.{pad2(m0 + 1)}
          </span>
          <button
            type="button"
            className="sensora-dark-ghost-btn min-h-[40px] min-w-[40px] touch-manipulation rounded-xl px-3 py-2 text-[13px] font-semibold"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            aria-label="다음 달"
          >
            ›
          </button>
          <button
            type="button"
            className="sensora-premium-primary-workspace min-h-[40px] touch-manipulation rounded-xl px-4 py-2 text-[13px] font-semibold"
            onClick={goToday}
          >
            오늘
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-px rounded-xl border border-white/[0.1] bg-white/[0.08] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div key={w} className="bg-[#07111f]/90 py-2 text-[12px] font-bold tracking-wide text-slate-400">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-px grid grid-cols-7 gap-px rounded-xl border border-white/[0.1] bg-white/[0.06] p-px">
        {cells.map((dt, idx) =>
          dt ? (
            <button
              key={idx}
              type="button"
              onClick={() => setSelected(dt)}
              className={[
                "relative flex min-h-[42px] flex-col items-center justify-center rounded-lg border px-0.5 py-1 text-[13px] font-semibold transition duration-200 ease-out touch-manipulation",
                selected && sameDay(selected, dt)
                  ? "border-sky-400/45 bg-sky-500/15 text-slate-50 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25),0_0_24px_-6px_rgba(56,189,248,0.12)] ring-1 ring-sky-400/30"
                  : sameDay(new Date(), dt)
                    ? "border-white/[0.18] bg-white/[0.07] text-slate-100 hover:border-sky-400/28"
                    : "border-transparent bg-[#020817]/50 text-slate-300 hover:z-[1] hover:border-sky-400/22 hover:bg-[#07111f]/82",
              ].join(" ")}
            >
              <span className={sameDay(new Date(), dt) && !(selected && sameDay(selected, dt)) ? "font-bold text-slate-50" : ""}>
                {dt.getDate()}
              </span>
              {(() => {
                const k = isoDayKeyLocal(dt);
                const n = itemsByDay.get(k)?.length ?? 0;
                return n ? (
                  <span
                    className="mt-0.5 h-1.5 min-w-[7px] rounded-full bg-gradient-to-r from-sky-400/85 to-indigo-400/75 shadow-[0_0_10px_-2px_rgba(56,189,248,0.45)]"
                    aria-hidden
                  />
                ) : null;
              })()}
            </button>
          ) : (
            <div key={idx} className="min-h-[42px] rounded-lg bg-[#020817]/25" />
          ),
        )}
      </div>

      <div className="crm-mini-cal-list-shell mt-6 border-t border-white/[0.09] pt-5">
        <div className="text-[13px] font-bold text-slate-100">
          {selected.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
        </div>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">해당 날짜 일정</p>
        {list.length === 0 ? (
          <p className="mt-3 text-[13px] text-slate-500">선택한 날짜에 예정된 항목이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {list.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#020817]/48 px-3 py-2.5 text-left text-[13px] leading-snug text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm transition-[border-color,background-color,transform] duration-200 touch-manipulation hover:border-sky-400/26 hover:bg-[#07111f]/72 active:scale-[0.997]"
                  onClick={() => {
                    if (it.customerId && onPickCustomer) onPickCustomer(it.customerId);
                  }}
                  disabled={!it.customerId}
                >
                  <span className="font-semibold text-sky-200/95">
                    {it.kind === "event"
                      ? "[일정]"
                      : it.kind === "next"
                        ? "[사후관리]"
                        : it.kind === "delivery"
                          ? "[출고]"
                          : "[다음 연락]"}
                  </span>{" "}
                  <span className="font-medium text-slate-300">{it.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
