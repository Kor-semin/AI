import { getFollowUpDisplayStatus, sensoraB2BSeedData, type SensoraFollowUp } from "@/lib/sensora";

const baseFollowUp = sensoraB2BSeedData.followUps[0];
const today = new Date("2026-06-22T00:00:00.000Z");
const previewFollowUps: SensoraFollowUp[] = [
  { ...baseFollowUp, id: "followup_today_1", customerId: "customer_park", dueDate: "2026-06-22T05:00:00.000Z", status: "due_today", purpose: "GV70 시승 일정 확인" },
  { ...baseFollowUp, id: "followup_overdue_1", customerId: "customer_kim", dueDate: "2026-06-20T07:00:00.000Z", status: "overdue", purpose: "X5 금융 조건 안내" },
  { ...baseFollowUp, id: "followup_completed_1", customerId: "customer_lee", dueDate: "2026-06-21T01:00:00.000Z", status: "completed", purpose: "E300 재고 안내", completedAt: "2026-06-21T02:00:00.000Z" },
  { ...baseFollowUp, id: "followup_scheduled_1", customerId: "customer_jung", dueDate: "2026-06-24T02:00:00.000Z", status: "scheduled", purpose: "A6 프로모션 확인" },
];

const customerLabels: Record<string, string> = { customer_park: "박민지", customer_kim: "김태훈", customer_lee: "이수현", customer_jung: "정유진" };
const statusLabels = { completed: "완료", cancelled: "취소", overdue: "지연", due_today: "오늘 예정", scheduled: "예정" } as const;

export function SensoraFollowUpView() {
  const displayRows = previewFollowUps.map((followUp) => ({ followUp, displayStatus: getFollowUpDisplayStatus(followUp, today) }));

  return (
    <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">After Sales</p><h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.035em] text-[var(--s-text)]">사후관리</h1><p className="mt-1.5 text-[0.8125rem] text-[var(--s-text-3)]">dueDate와 status를 기준으로 고객별 후속 연락 상태를 확인합니다.</p></div><span className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-2 text-xs text-[var(--s-text-2)]">Follow-up 읽기 전용 미리보기</span></header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="follow-up 요약">
        {[["오늘 연락 예정", "5", "14:00부터"], ["지연 follow-up", "2", "우선 확인 필요"], ["완료 follow-up", "8", "최근 7일"], ["다음 연락 일정", "7", "향후 3일"]].map(([label, value, detail], index) => <article key={label} className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-4"><p className="text-[0.8125rem] text-[var(--s-text-2)]">{label}</p><p className={`mt-3 text-[1.75rem] font-semibold ${index === 1 ? "text-[var(--s-warn-text)]" : "text-[var(--s-text)]"}`}>{value}</p><p className="mt-2 text-xs text-[var(--s-text-3)]">{detail}</p></article>)}
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="followup-list-title">
        <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="followup-list-title" className="text-lg font-semibold text-[var(--s-text)]">Follow-up 목록</h2><span className="text-xs text-[var(--s-text-3)]">Demo data · 예시 데이터</span></div>
        <div className="mt-5 overflow-x-auto"><div className="min-w-[760px]">
          <div className="grid grid-cols-[.8fr_1.25fr_1fr_.8fr_1.5fr_.8fr] gap-4 rounded-lg bg-[var(--s-inner)] px-4 py-3 text-xs text-[var(--s-text-3)]"><span>고객</span><span>관심 차량</span><span>다음 연락일</span><span>상태</span><span>후속 조치</span><span>화면 상태</span></div>
          <div className="mt-3 space-y-2">{displayRows.map(({ followUp, displayStatus }, index) => (
            <div key={followUp.id} className="grid min-h-[72px] grid-cols-[.8fr_1.25fr_1fr_.8fr_1.5fr_.8fr] items-center gap-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 text-[0.8125rem]">
              <span className="font-semibold text-[var(--s-text)]">{customerLabels[followUp.customerId]}</span><span className="text-[var(--s-text-2)]">{["Genesis GV70", "BMW X5", "Mercedes-Benz E300", "Audi A6"][index]}</span><span className="text-[var(--s-text-3)]">{index === 0 ? "예시 · 14:00" : index === 1 ? "예시 · 6월 20일" : index === 2 ? "예시 · 6월 21일" : "예시 · 6월 24일"}</span><span className={displayStatus === "overdue" ? "font-medium text-[var(--s-warn-text)]" : displayStatus === "completed" ? "text-[var(--s-ok-text)]" : "text-[var(--s-text-2)]"}>{statusLabels[displayStatus]}</span><span className="text-[var(--s-text-2)]">{followUp.purpose}</span><span className="text-[var(--s-text-3)]">{displayStatus === "completed" ? "확인 완료 예시" : "구조 확인"}</span>
            </div>
          ))}</div>
        </div></div>
        <p className="mt-5 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-xs leading-5 text-[var(--s-text-3)]">실제 운영 데이터가 아닙니다. 완료 처리와 일정 저장 기능은 연결하지 않았으며, 표시는 dueDate/status/today 계산 결과의 미리보기입니다.</p>
      </section>
    </div>
  );
}
