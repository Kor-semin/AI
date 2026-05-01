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
      className="scroll-mt-28 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-4 shadow-[0_1px_4px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5"
      aria-label="미니 캘린더"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 gap-y-3">
        <div className="text-[15px] font-semibold text-[#111827]">
          일정 미리보기
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="min-h-[38px] min-w-[38px] touch-manipulation rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] font-semibold text-[#374151] hover:bg-[#F3F4F6]"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            aria-label="이전 달"
          >
            ‹
          </button>
          <span className="min-w-[7.5rem] text-center text-[14px] font-semibold tabular-nums text-[#111827]">
            {y}.{pad2(m0 + 1)}
          </span>
          <button
            type="button"
            className="min-h-[38px] min-w-[38px] touch-manipulation rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] font-semibold text-[#374151] hover:bg-[#F3F4F6]"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            aria-label="다음 달"
          >
            ›
          </button>
          <button
            type="button"
            className="min-h-[38px] touch-manipulation rounded-lg border border-[#111827] bg-[#111827] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1F2937]"
            onClick={goToday}
          >
            오늘
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#94A3B8]">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((dt, idx) =>
          dt ? (
            <button
              key={idx}
              type="button"
              onClick={() => setSelected(dt)}
              className={[
                "relative flex min-h-[40px] flex-col items-center justify-center rounded-xl border px-0.5 py-1 text-[13px] font-semibold transition touch-manipulation",
                selected && sameDay(selected, dt) ?
                  "border-[#111827] bg-[#F1F5F9] text-[#111827]"
                : sameDay(new Date(), dt) ? "border-[#CBD5E1] bg-[#FFFBEB] text-[#92400E]"
                : "border-transparent bg-[#FAFBFC] text-[#475569] hover:bg-[#F1F5F9]",
              ].join(" ")}
            >
              <span>{dt.getDate()}</span>
              {(() => {
                const k = isoDayKeyLocal(dt);
                const n = itemsByDay.get(k)?.length ?? 0;
                return n ?
                    <span className="mt-0.5 h-1.5 min-w-[6px] rounded-full bg-[#64748B]" aria-hidden />
                  : null;
              })()}
            </button>
          ) : (
            <div key={idx} className="min-h-[40px]" />
          ),
        )}
      </div>

      <div className="mt-5 rounded-xl border border-[#EEF1F5] bg-[#FAFBFC] px-3 py-3 sm:px-4">
        <div className="text-[12px] font-semibold text-[#64748B]">
          {selected.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
        </div>
        {list.length === 0 ? (
          <p className="mt-2 text-[13px] text-[#6B7280]">선택한 날짜의 일정이 없습니다.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {list.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2.5 text-left text-[13px] leading-snug text-[#374151] transition hover:bg-[#F8FAFC] touch-manipulation"
                  onClick={() => {
                    if (it.customerId && onPickCustomer) onPickCustomer(it.customerId);
                  }}
                  disabled={!it.customerId}
                >
                  {it.kind === "event" ?
                    `[일정] ${it.label}`
                  : it.kind === "next" ?
                    `[후속] ${it.label}`
                  : it.kind === "delivery" ?
                    `[출고] ${it.label}`
                  : `[연락] ${it.label}`}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
