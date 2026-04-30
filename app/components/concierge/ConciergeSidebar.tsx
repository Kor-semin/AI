"use client";

const MENU = [
  { label: "Dashboard", tab: "customers" as const, hint: "오늘의 흐름" },
  { label: "Customers", tab: "customers" as const, hint: "고객 카드" },
  { label: "Consulting Notes", tab: "customers" as const, hint: "상담 기록" },
  { label: "AI Secretary", href: "#ai-secretary", hint: "요약/문구" },
  { label: "Pipeline", href: "#pipeline", hint: "단계 흐름" },
  { label: "Vehicle Match", tab: "customers" as const, hint: "추천 메모" },
  { label: "Follow-up", tab: "next" as const, hint: "다음 할 일" },
  { label: "Settings", href: "/join", hint: "계정/승인" },
];

export function ConciergeSidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-[76px] rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/65 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="px-2 pb-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold-2)]">
            Sales Concierge AI
          </div>
          <div className="mt-2 text-sm font-semibold tracking-tight text-[color:var(--foreground)]">
            오토 세일즈 AI 비서
          </div>
          <div className="mt-1 text-[12px] text-[color:var(--ink-2)]">프리미엄 영업 업무실</div>
        </div>

        <nav className="mt-3 grid gap-1">
          {MENU.map((m) => {
            const href = m.href ?? `/?view=app&tab=${m.tab}#app`;
            return (
              <a
                key={m.label}
                href={href}
                className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-[12px] font-semibold text-[color:var(--foreground)]/92 hover:border-[color:var(--edge)] hover:bg-[color:var(--paper-2)]/55"
              >
                <span>{m.label}</span>
                <span className="text-[10px] font-semibold tracking-[0.14em] text-[color:var(--ink-2)] group-hover:text-[color:var(--gold)]">
                  {m.hint}
                </span>
              </a>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/60 px-4 py-3 text-[11px] text-[color:var(--ink-2)]">
          실제 CRM 기능은 오른쪽에서 실행됩니다. 이 메뉴는 콘셉트 프레임 + 빠른 진입 링크를 제공합니다.
        </div>
      </div>
    </aside>
  );
}

