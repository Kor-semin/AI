import { sensoraB2BSeedData, type ActivityAction, type SensoraUserProfile } from "@/lib/sensora";

const userLabels: Record<string, string> = {
  user_sales: "오세민",
  user_team_leader: "최서윤",
  user_branch_manager: "윤도현",
};

const roleLabels: Record<SensoraUserProfile["role"], string> = {
  sales_consultant: "Sales Consultant",
  team_leader: "Team Leader",
  branch_manager: "Branch Manager",
  executive: "Executive",
  sensora_admin: "Sensora Admin",
};

const activityLabels: Record<ActivityAction, string> = {
  lead_created: "Lead가 접수되었습니다.",
  lead_assigned: "Lead 담당자가 지정되었습니다.",
  lead_converted_to_customer: "Lead가 Customer로 전환되었습니다.",
  consultation_created: "상담 메모가 등록되었습니다.",
  followup_created: "Follow-up이 생성되었습니다.",
  followup_completed: "Follow-up이 완료되었습니다.",
  followup_rescheduled: "Follow-up 일정이 조정되었습니다.",
  inventory_status_changed: "재고 상태가 변경되었습니다.",
  user_role_changed: "사용자 역할이 변경되었습니다.",
};

const teamMembers = sensoraB2BSeedData.users.filter((user) => user.teamId === "team_a");
const seedActivities = sensoraB2BSeedData.activityLogs;

export function SensoraTeamView({ compact = false }: { compact?: boolean }) {
  if (compact) {
    const compactTeamRows = [
      ["이서준 매니저", "정상 · 오늘 5건"],
      ["박하나 매니저", "지연 · 2건"],
      ["최민석 매니저", "정상 · 오늘 3건"],
      ["정유진 매니저", "확인 필요 · 1건"],
    ];
    const compactActivities = [
      "10:42 박하나 · 고객 통화 메모 추가",
      "10:18 이서준 · GV70 시승 일정 제안",
      "09:56 정유진 · 온라인 Lead 담당 배정",
      "09:31 최민석 · 계약 가능성 상태 변경",
    ];

    return (
      <section className="min-h-[583px] min-w-0 max-w-full rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="team-preview-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Team Overview</p>
            <h2 id="team-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[var(--s-text)]">팀 현황 미리보기</h2>
          </div>
          <span className="rounded-lg bg-[var(--s-brand-tint)] px-4 py-2 text-xs font-medium text-[var(--s-brand-text)]">READ ONLY</span>
        </div>

        <div className="mt-6 min-h-[190px] rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
          <div className="grid grid-cols-[1fr_1.3fr] gap-4 text-xs text-[var(--s-text-3)]"><span>팀원</span><span>Follow-up</span></div>
          <div className="mt-3 space-y-3">
            {compactTeamRows.map(([name, status], index) => (
              <div key={name} className="grid grid-cols-[1fr_1.3fr] gap-4 text-[0.8125rem]">
                <span className="text-[var(--s-text-2)]">{name}</span>
                <span className={index === 1 || index === 3 ? "text-[var(--s-warn-text)]" : "text-[var(--s-text-2)]"}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 min-h-[190px] rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
          <h3 className="text-sm font-semibold text-[var(--s-text)]">최근 Activity Log</h3>
          <div className="mt-4 space-y-3">
            {compactActivities.map((activity) => <p key={activity} className="text-xs leading-5 text-[var(--s-text-2)]">{activity}</p>)}
          </div>
        </div>

        <p className="mt-4 flex min-h-[60px] items-center rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-xs leading-5 text-[var(--s-text-3)]">팀장 화면은 읽기 전용 미리보기입니다. 담당자 변경·발송·상태 변경 기능은 연결하지 않았습니다.</p>
      </section>
    );
  }

  return (
    <section className="min-w-0 max-w-full rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby={compact ? "team-preview-title" : "team-view-title"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Team Overview</p>
          <h2 id={compact ? "team-preview-title" : "team-view-title"} className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--s-text)]">팀 현황</h2>
          <p className="mt-1 text-[0.8125rem] leading-5 text-[var(--s-text-3)]">Role과 Scope 범위 안에서 팀 follow-up과 최근 활동을 확인합니다.</p>
        </div>
        <span className="rounded-full border border-[var(--s-border)] bg-[var(--s-inner)] px-2.5 py-1 text-xs text-[var(--s-text-2)]">관리자 읽기 전용</span>
      </div>

      <div className={`mt-5 grid gap-4 ${compact ? "" : "xl:grid-cols-[1.05fr_.95fr]"}`}>
        <div className="rounded-lg border border-[var(--s-border)] bg-[var(--s-panel)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--s-text)]">팀원 follow-up</h3>
            <span className="text-xs text-[var(--s-text-3)]">Team A · {teamMembers.length}명</span>
          </div>
          <div className="mt-3 space-y-2">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3 rounded-lg bg-[var(--s-card)] px-3 py-3">
                <span className="grid size-8 place-items-center rounded-full bg-[var(--s-inner)] text-xs font-semibold text-[var(--s-text-2)]">{(userLabels[member.id] ?? member.name).slice(0, 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium text-[var(--s-text)]">{userLabels[member.id] ?? member.name}</span>
                  <span className="mt-0.5 block text-xs text-[var(--s-text-3)]">{roleLabels[member.role]} · {member.scopeType}</span>
                </span>
                <span className={index === 0 ? "text-xs font-medium text-[var(--s-warn-text)]" : "text-xs font-medium text-[var(--s-ok-text)]"}>{index === 0 ? "1건 확인 필요" : "정상"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--s-border)] bg-[var(--s-panel)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--s-text)]">최근 Activity Log</h3>
            <span className="text-xs text-[var(--s-text-3)]">조회 전용</span>
          </div>
          <div className="mt-4 space-y-4">
            {seedActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--s-brand-dot)]" />
                <span>
                  <span className="block text-[0.8125rem] leading-5 text-[var(--s-text-2)]">{activityLabels[activity.action]}</span>
                  <span className="mt-1 block text-xs text-[var(--s-text-3)]">{userLabels[activity.actorUserId] ?? "팀 관리자"} · 오늘 09:20</span>
                </span>
              </div>
            ))}
            <div className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--s-ok-text)]" />
              <span>
                <span className="block text-[0.8125rem] leading-5 text-[var(--s-text-2)]">Follow-up 진행 상태가 확인되었습니다.</span>
                <span className="mt-1 block text-xs text-[var(--s-text-3)]">오세민 · 어제 17:40</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-[0.8125rem] leading-6 text-[var(--s-text-2)]">팀장 화면은 관리 현황을 확인하는 읽기 전용 미리보기입니다. 담당자 배정이나 업무 상태 변경은 지원하지 않습니다.</p>
    </section>
  );
}
