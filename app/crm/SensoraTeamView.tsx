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
  return (
    <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby={compact ? "team-preview-title" : "team-view-title"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A263A]">Team Overview</p>
          <h2 id={compact ? "team-preview-title" : "team-view-title"} className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">팀 현황</h2>
          <p className="mt-1 text-xs leading-5 text-[#7F8792]">Role과 Scope 범위 안에서 팀 follow-up과 최근 활동을 확인합니다.</p>
        </div>
        <span className="rounded-full border border-[#2B3037] bg-[#1A1E23] px-2.5 py-1 text-[10px] text-[#B7BDC6]">관리자 읽기 전용</span>
      </div>

      <div className={`mt-5 grid gap-4 ${compact ? "" : "xl:grid-cols-[1.05fr_.95fr]"}`}>
        <div className="rounded-lg border border-[#2B3037] bg-[#0D0F12] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold text-[#F4F6F8]">팀원 follow-up</h3>
            <span className="text-[10px] text-[#7F8792]">Team A · {teamMembers.length}명</span>
          </div>
          <div className="mt-3 space-y-2">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3 rounded-lg bg-[#14171B] px-3 py-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#1A1E23] text-[10px] font-semibold text-[#B7BDC6]">{(userLabels[member.id] ?? member.name).slice(0, 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-[#F4F6F8]">{userLabels[member.id] ?? member.name}</span>
                  <span className="mt-0.5 block text-[10px] text-[#7F8792]">{roleLabels[member.role]} · {member.scopeType}</span>
                </span>
                <span className={index === 0 ? "text-[10px] font-medium text-[#B48A48]" : "text-[10px] font-medium text-[#4E8A66]"}>{index === 0 ? "1건 확인 필요" : "정상"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#2B3037] bg-[#0D0F12] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold text-[#F4F6F8]">최근 Activity Log</h3>
            <span className="text-[10px] text-[#7F8792]">조회 전용</span>
          </div>
          <div className="mt-4 space-y-4">
            {seedActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#7A263A]" />
                <span>
                  <span className="block text-xs leading-5 text-[#B7BDC6]">{activityLabels[activity.action]}</span>
                  <span className="mt-1 block text-[10px] text-[#7F8792]">{userLabels[activity.actorUserId] ?? "팀 관리자"} · 오늘 09:20</span>
                </span>
              </div>
            ))}
            <div className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#4E8A66]" />
              <span>
                <span className="block text-xs leading-5 text-[#B7BDC6]">Follow-up 진행 상태가 확인되었습니다.</span>
                <span className="mt-1 block text-[10px] text-[#7F8792]">오세민 · 어제 17:40</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-[11px] leading-5 text-[#B7BDC6]">팀장 화면은 관리 현황을 확인하는 읽기 전용 미리보기입니다. 담당자 배정이나 업무 상태 변경은 지원하지 않습니다.</p>
    </section>
  );
}
