"use client";

import {
  ROLE_ACCESS_PRINCIPLES,
  canPreviewB2BSectionForRole,
  getFollowUpDelayDays,
  isFollowUpOverdue,
  sensoraB2BSeedData,
  type ActivityAction,
  type ActivityTargetType,
  type UserRole,
} from "@/lib/sensora";

const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  lead_created: "Lead 접수",
  lead_assigned: "Lead 배정",
  lead_converted_to_customer: "Customer 전환",
  consultation_created: "상담 저장",
  followup_created: "FollowUp 생성",
  followup_completed: "FollowUp 완료",
  followup_rescheduled: "FollowUp 일정 변경",
  inventory_status_changed: "재고 상태 변경",
  user_role_changed: "사용자 권한 변경",
};

const ACTIVITY_TARGET_LABELS: Record<ActivityTargetType, string> = {
  lead: "Lead",
  customer: "Customer",
  consultation: "Consultation",
  followup: "FollowUp",
  inventory_unit: "Inventory Unit",
  user: "User",
  team: "Team",
  branch: "Branch",
  dealer_group: "Dealer Group",
};

const ROLE_LABELS: Record<UserRole, string> = {
  sales_consultant: "영업사원",
  team_leader: "영업팀장",
  branch_manager: "지점장",
  executive: "임원",
  sensora_admin: "Sensora 운영자",
};

const PREVIEW_ROLES: UserRole[] = ["sales_consultant", "team_leader", "branch_manager", "executive", "sensora_admin"];

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const date = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const minute = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}. ${month}. ${day}. ${hour}:${minute}`;
  } catch {
    return iso;
  }
}

function findUserName(userId?: string) {
  if (!userId) return "—";
  return sensoraB2BSeedData.users.find((user) => user.id === userId)?.name ?? userId;
}

function formatChangeSet(changeSet?: Record<string, unknown>) {
  if (!changeSet) return "—";
  const rows = Object.entries(changeSet).map(([key, value]) => `${key}: ${value == null ? "비어 있음" : String(value)}`);
  return rows.length > 0 ? rows.join(", ") : "—";
}

export function SensoraTeamViewSection() {
  const team = sensoraB2BSeedData.teams[0];
  const teamLeader = sensoraB2BSeedData.users.find((user) => user.id === team?.teamLeaderId);
  const teamMembers = sensoraB2BSeedData.users.filter((user) => user.teamId === team?.id);
  const teamCustomers = sensoraB2BSeedData.customers.filter((customer) => customer.teamId === team?.id);
  const teamFollowUps = sensoraB2BSeedData.followUps.filter((followUp) => followUp.teamId === team?.id);
  const overdueFollowUps = teamFollowUps.filter((followUp) => isFollowUpOverdue(followUp));
  const scheduledFollowUps = teamFollowUps.filter((followUp) => followUp.status === "scheduled" || followUp.status === "due_today");
  const recentLogs = sensoraB2BSeedData.activityLogs.filter((log) => log.teamId === team?.id).slice(0, 5);

  return (
    <section id="team-view" className="scroll-mt-24 rounded-[28px] border border-white/[0.12] bg-[#07111f]/82 p-5 text-slate-100 shadow-[0_28px_72px_-38px_rgba(0,0,0,0.75)] sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200/70">Team View Preview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-50">팀 현황</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            팀장은 별도 시스템을 쓰는 것이 아니라 같은 Sales Workspace 안에서 팀 관리 메뉴만 추가로 사용합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200/15 bg-[#3b0d16]/45 p-4 text-sm leading-relaxed text-rose-50/90">
          팀 현황은 팀장 권한에서 조회 중심으로 제공되는 미리보기입니다. 초기 베타에서는 팀원 데이터를 직접 수정하지 않고 확인 요청과 리포트 중심으로 운영됩니다. AI 추천과 요약은 자동 저장되지 않으며, 최종 저장과 발송은 사용자가 직접 확인 후 진행합니다.
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.1] bg-white/[0.045] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">권한별 노출 원칙</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {PREVIEW_ROLES.map((role) => (
            <div
              key={role}
              className={[
                "rounded-2xl border p-3",
                canPreviewB2BSectionForRole(role, "team_view")
                  ? "border-emerald-300/25 bg-emerald-400/10"
                  : "border-white/[0.08] bg-white/[0.035]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-slate-100">{ROLE_LABELS[role]}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{ROLE_ACCESS_PRINCIPLES[role]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {[
          ["팀 고객 수", teamCustomers.length],
          ["예정 Follow-up", scheduledFollowUps.length],
          ["지연 Follow-up", overdueFollowUps.length],
          ["최근 기록", recentLogs.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[20px] border border-white/[0.1] bg-[#0b1220]/86 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[24px] border border-white/[0.1] bg-[#0b1220]/86 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">Team Leader</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-50">{teamLeader?.name ?? "팀장 미지정"}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {team?.name ?? "데모 팀"} · {teamLeader?.email ?? "—"}
          </p>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-100">팀원 목록</p>
            <ul className="mt-3 space-y-2">
              {teamMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{member.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{member.role}</p>
                  </div>
                  <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-slate-300">
                    읽기 전용
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/[0.1] bg-[#0b1220]/86 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">Team Follow-up</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-semibold text-slate-50">팀 연락 흐름</h3>
            <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
              확인 요청 준비 중
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {teamFollowUps.map((followUp) => {
              const delayDays = getFollowUpDelayDays(followUp);
              return (
                <article key={followUp.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{followUp.purpose}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        담당자 {findUserName(followUp.userId)} · {formatDateTime(followUp.dueDate)}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-slate-300">
                      {delayDays > 0 ? `${delayDays}일 지연` : "예정"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-[24px] border border-white/[0.1] bg-[#0b1220]/86 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">Recent Activity</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-50">최근 Activity Log</h3>
        <div className="mt-4 space-y-3">
          {recentLogs.map((log) => (
            <article key={log.id} className="grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="text-sm font-semibold text-slate-100">{ACTIVITY_ACTION_LABELS[log.action]}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {ACTIVITY_TARGET_LABELS[log.targetType]} · {log.targetId} · {formatDateTime(log.createdAt)}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                변경 전: {formatChangeSet(log.before)} / 변경 후: {formatChangeSet(log.after)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
