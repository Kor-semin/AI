"use client";

import {
  canAccessSalesWorkspace,
  canMarkInventoryAsSold,
  canReserveInventoryUnit,
  canViewTeamData,
  getAvailableWorkspacesForRole,
  getDefaultWorkspaceForRole,
  getInventoryStatusLabel,
  getInventoryStatusTone,
  sensoraB2BSeedData,
  type ActivityAction,
  type ActivityTargetType,
  type InventoryIntegrationStatus,
  type LeadSource,
  type LeadStatus,
  type SensoraUserProfile,
} from "@/lib/sensora";

const SALES_BASE_MENUS = ["내 고객", "내 상담", "내 팔로업", "AI 비서", "관심 차량", "재고 확인"];
const TEAM_LEADER_MENUS = ["팀 현황", "팀 팔로업", "팀 리포트", "팀원별 상담 흐름 확인"];
const LEAD_FLOW_STEPS = [
  { title: "접수", description: "전시장 전화·방문·온라인 문의를 Lead로 기록" },
  { title: "담당자 배정", description: "팀장이 담당 영업사원에게 확인 요청" },
  { title: "상담 메모 작성", description: "상담 내용과 고객 니즈를 사용자 확인 후 저장" },
  { title: "Customer 전환", description: "실제 관리 대상 고객으로 전환" },
  { title: "FollowUp 생성", description: "다음 연락과 사후관리 일정을 연결" },
] as const;

const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  showroom_call: "전시장 전화",
  walk_in: "직접 방문",
  online_inquiry: "온라인 문의",
  referral: "소개",
  test_drive_request: "시승 요청",
  event: "이벤트",
  unknown: "미확인",
};

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "신규",
  unassigned: "미배정",
  assigned: "배정 완료",
  contact_needed: "연락 필요",
  contacted: "연락 완료",
  in_consultation: "상담 중",
  converted: "고객 전환",
  lost: "이탈",
  duplicate: "중복",
  invalid: "무효",
};

const INTEGRATION_STATUS_LABELS: Record<InventoryIntegrationStatus, string> = {
  manual: "수동 관리",
  csv_ready: "CSV 준비",
  integration_planned: "DMS/ERP 연동 예정",
};

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

const ROLE_LABELS: Record<SensoraUserProfile["role"], string> = {
  sales_consultant: "영업사원",
  team_leader: "영업팀장",
  branch_manager: "지점장",
  executive: "임원",
  sensora_admin: "Sensora 운영자",
};

const WORKSPACE_LABELS: Record<SensoraUserProfile["defaultWorkspace"], string> = {
  sales: "Sales Workspace",
  manager: "Manager Workspace",
  console: "Console Workspace",
};

const STATUS_TONE_CLASS: Record<ReturnType<typeof getInventoryStatusTone>, string> = {
  positive: "border-emerald-300/35 bg-emerald-400/12 text-emerald-100",
  notice: "border-sky-300/35 bg-sky-400/12 text-sky-100",
  neutral: "border-slate-300/25 bg-white/[0.08] text-slate-100",
  warning: "border-rose-300/40 bg-rose-400/14 text-rose-100",
  muted: "border-slate-400/20 bg-white/[0.05] text-slate-400",
};

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatChangeSet(changeSet?: Record<string, unknown>) {
  if (!changeSet) return "—";
  const rows = Object.entries(changeSet).map(([key, value]) => `${key}: ${value == null ? "비어 있음" : String(value)}`);
  return rows.length > 0 ? rows.join(", ") : "—";
}

function findUserName(userId?: string) {
  if (!userId) return "—";
  return sensoraB2BSeedData.users.find((user) => user.id === userId)?.name ?? userId;
}

function findBranchName(branchId?: string) {
  if (!branchId) return "—";
  return sensoraB2BSeedData.branches.find((branch) => branch.id === branchId)?.name ?? branchId;
}

function findTeamName(teamId?: string) {
  if (!teamId) return "—";
  return sensoraB2BSeedData.teams.find((team) => team.id === teamId)?.name ?? teamId;
}

function WorkspaceRoleCard({ profile }: { profile: SensoraUserProfile }) {
  const defaultWorkspace = getDefaultWorkspaceForRole(profile.role);
  const availableWorkspaces = getAvailableWorkspacesForRole(profile.role);
  const canUseSales = canAccessSalesWorkspace(profile);
  const team = sensoraB2BSeedData.teams.find((row) => row.id === profile.teamId);
  const canSeeTeam = team
    ? canViewTeamData(profile, {
        teamId: team.id,
        branchId: profile.branchId,
        dealerGroupId: profile.dealerGroupId,
      })
    : false;
  const menus = profile.role === "team_leader" ? [...SALES_BASE_MENUS, ...TEAM_LEADER_MENUS] : SALES_BASE_MENUS;

  return (
    <article className="rounded-[22px] border border-white/[0.1] bg-[#0b1220]/88 p-5 shadow-[0_22px_56px_-34px_rgba(0,0,0,0.7)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{ROLE_LABELS[profile.role]}</p>
          <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">{profile.name}</h4>
        </div>
        <span className="rounded-full border border-[#7f1d1d]/35 bg-[#3b0d16]/70 px-3 py-1 text-xs font-semibold text-rose-100">
          {WORKSPACE_LABELS[defaultWorkspace]}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-100">권한 범위</dt>
          <dd>{profile.scopeType} · {profile.scopeId ?? profile.id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-100">사용 가능 Workspace</dt>
          <dd>{availableWorkspaces.map((workspace) => WORKSPACE_LABELS[workspace]).join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {menus.map((menu) => (
          <span
            key={`${profile.id}-${menu}`}
            className={[
              "rounded-full border px-3 py-1 text-xs font-semibold",
              TEAM_LEADER_MENUS.includes(menu)
                ? "border-rose-300/25 bg-[#4a0f1b]/75 text-rose-50"
                : "border-white/[0.1] bg-white/[0.06] text-slate-200",
            ].join(" ")}
          >
            {menu}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        {profile.role === "team_leader"
          ? `같은 Sales Workspace 안에서 팀 데이터 조회가 가능합니다. 초기 베타에서는 직접 수정 대신 조회, 확인 요청, 리포트 중심입니다.`
          : `본인 고객과 본인 상담 중심으로 Sales Workspace를 사용합니다.`}
      </p>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        Sales 접근: {canUseSales ? "가능" : "제한"} · 팀 데이터 조회: {canSeeTeam ? "가능" : "본인 범위 중심"}
      </p>
    </article>
  );
}

function LeadQueuePreview() {
  return (
    <section className="rounded-[26px] border border-white/[0.1] bg-[#0b1220]/88 p-5 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.72)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">Lead Queue Beta</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">접수부터 고객 전환까지</h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slate-400">
          실제 배정 저장은 아직 연결하지 않고, 접수 데이터와 상태 흐름만 확인합니다.
        </p>
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-5">
        {LEAD_FLOW_STEPS.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-white/[0.1] bg-white/[0.055] px-3 py-3">
            <span className="text-xs font-bold text-rose-200/65">0{index + 1}</span>
            <p className="mt-1 text-sm font-semibold text-slate-50">{step.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{step.description}</p>
          </li>
        ))}
      </ol>

      <div className="mt-5 space-y-3">
        {sensoraB2BSeedData.leads.map((lead) => (
          <article key={lead.id} className="rounded-[20px] border border-white/[0.1] bg-[#111827]/86 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-50">{lead.customerName}</h4>
                <p className="mt-1 text-sm text-slate-400">
                  {LEAD_SOURCE_LABELS[lead.source]} · {lead.interestedVehicle ?? "관심 차량 미정"}
                </p>
              </div>
              <span className="rounded-full border border-rose-300/30 bg-[#4a0f1b]/75 px-3 py-1 text-xs font-bold text-rose-50">
                {LEAD_STATUS_LABELS[lead.status]}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <dt className="font-semibold text-slate-100">접수자</dt>
                <dd className="mt-1 text-slate-400">{findUserName(lead.receivedBy)}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <dt className="font-semibold text-slate-100">담당자</dt>
                <dd className="mt-1 text-slate-400">{findUserName(lead.assignedUserId)}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <dt className="font-semibold text-slate-100">배정 시간</dt>
                <dd className="mt-1 text-slate-400">{formatDateTime(lead.assignedAt)}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <dt className="font-semibold text-slate-100">지점</dt>
                <dd className="mt-1 text-slate-400">{findBranchName(lead.branchId)}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <dt className="font-semibold text-slate-100">팀</dt>
                <dd className="mt-1 text-slate-400">{findTeamName(lead.teamId)}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-3 sm:col-span-2 xl:col-span-1">
                <dt className="font-semibold text-slate-100">메모</dt>
                <dd className="mt-1 text-slate-400">{lead.memo ?? "—"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function InventoryPreview() {
  return (
    <section className="rounded-[26px] border border-white/[0.1] bg-[#0b1220]/88 p-5 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.72)] sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">Inventory Beta</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">차량 재고 확인</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          차종, 트림, 색상, 옵션과 재고 상태를 확인합니다. 실제 DMS/ERP 연동은 구현하지 않았습니다.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {sensoraB2BSeedData.inventoryUnits.map((unit) => {
          const tone = getInventoryStatusTone(unit.stockStatus);
          return (
            <article key={unit.id} className="rounded-[20px] border border-white/[0.1] bg-[#111827]/86 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-50">
                    {unit.brand} {unit.model}
                  </h4>
                  <p className="mt-1 text-sm text-slate-400">
                    {[unit.trim, unit.exteriorColor, unit.interiorColor].filter(Boolean).join(" · ") || "상세 조건 미정"}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_TONE_CLASS[tone]}`}>
                  {getInventoryStatusLabel(unit.stockStatus)}
                </span>
              </div>

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <dt className="font-semibold text-slate-100">브랜드 / 모델 / 트림</dt>
                  <dd className="mt-1 text-slate-400">
                    {unit.brand} · {unit.model} · {unit.trim ?? "트림 미정"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <dt className="font-semibold text-slate-100">외장색 / 내장색</dt>
                  <dd className="mt-1 text-slate-400">
                    {unit.exteriorColor ?? "외장 미정"} · {unit.interiorColor ?? "내장 미정"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <dt className="font-semibold text-slate-100">옵션 요약</dt>
                  <dd className="mt-1 text-slate-400">{unit.optionSummary ?? "—"}</dd>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <dt className="font-semibold text-slate-100">차대번호 또는 식별값</dt>
                  <dd className="mt-1 text-slate-400">{unit.vin ?? unit.id}</dd>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <dt className="font-semibold text-slate-100">업데이트 담당자 / 시간</dt>
                  <dd className="mt-1 text-slate-400">
                    {findUserName(unit.updatedBy)} · {formatDateTime(unit.updatedAt)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3">
                  <dt className="font-semibold text-slate-100">Beta 관리 상태</dt>
                  <dd className="mt-1 flex flex-wrap gap-2 text-slate-400">
                    <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-xs font-semibold">
                      {INTEGRATION_STATUS_LABELS[unit.integrationStatus ?? "manual"]}
                    </span>
                    <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-xs font-semibold">
                      CSV 준비 가능
                    </span>
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/[0.045] p-3 sm:col-span-2">
                  <dt className="font-semibold text-slate-100">가능 작업 / 메모</dt>
                  <dd className="mt-1 text-slate-400">
                    {canReserveInventoryUnit(unit) ? "예약 검토 가능" : "예약 제한"} ·{" "}
                    {canMarkInventoryAsSold(unit) ? "판매 완료 처리 가능" : "판매 완료 처리 제한"} · {unit.memo ?? "—"}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActivityLogPreview() {
  return (
    <section className="rounded-[26px] border border-white/[0.1] bg-[#0b1220]/88 p-5 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.72)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">Activity Log Preview</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">중요 행동 기록</h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slate-400">
          누가, 언제, 어떤 데이터를 변경했는지 남기는 구조를 보여줍니다.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] border border-white/[0.1]">
        {sensoraB2BSeedData.activityLogs.map((log) => (
          <article key={log.id} className="grid gap-3 border-b border-white/[0.08] bg-[#111827]/86 p-4 last:border-b-0 lg:grid-cols-[1.2fr_1fr_1.5fr]">
            <div>
              <p className="text-sm font-semibold text-slate-50">{ACTIVITY_ACTION_LABELS[log.action]}</p>
              <p className="mt-1 text-xs text-slate-500">
                {ACTIVITY_TARGET_LABELS[log.targetType]} · {log.targetId}
              </p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
            </div>
            <div className="text-sm text-slate-400">
              <p>
                <span className="font-semibold text-slate-100">실행자:</span> {findUserName(log.actorUserId)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-100">지점:</span> {findBranchName(log.branchId)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-100">팀:</span> {findTeamName(log.teamId)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.045] p-3 text-xs leading-relaxed text-slate-400">
              <p>
                <span className="font-semibold text-slate-100">변경 전:</span> {formatChangeSet(log.before)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-100">변경 후:</span> {formatChangeSet(log.after)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SensoraB2BWorkspacePreview() {
  const salesProfiles = sensoraB2BSeedData.users.filter((user) => user.role === "sales_consultant" || user.role === "team_leader");

  return (
    <section className="rounded-[32px] border border-white/[0.14] bg-[radial-gradient(circle_at_top_left,rgba(127,29,29,0.28),transparent_36%),linear-gradient(135deg,#070b14,#111827_52%,#2a0b13)] p-4 text-slate-100 shadow-[0_30px_80px_-38px_rgba(0,0,0,0.75)] sm:p-6 lg:p-8">
      <div className="rounded-[26px] border border-white/[0.1] bg-black/25 px-5 py-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-200/70">B2B Sales Workspace 확장 미리보기</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              권한에 따라 달라지는 자동차 영업조직 CRM
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              영업사원, 팀장, 지점장, 운영자가 하나의 로그인에서 권한에 따라 다른 업무 범위를 확인하는 구조입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200/15 bg-[#3b0d16]/45 p-4 text-sm leading-relaxed text-rose-50/90">
            초기 베타에서는 AI가 자동으로 저장하거나 발송하지 않습니다. 상담 요약, 문자 초안, 다음 행동은 모두 미리보기로 제공되며, 최종 저장과 발송은 사용자가 직접 확인 후 진행합니다.
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {salesProfiles.map((profile) => (
          <WorkspaceRoleCard key={profile.id} profile={profile} />
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {[
          ["Lead 접수", "전시장 전화, 방문, 온라인 문의를 접수하고 담당자 배정 흐름을 확인합니다."],
          ["재고 관리", "브랜드, 모델, 트림, 색상, 옵션, 재고 상태를 베타 구조로 확인합니다."],
          ["팀 현황", "팀장은 같은 Sales Workspace 안에서 팀 흐름과 Activity Log를 조회합니다."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-[22px] border border-white/[0.1] bg-[#0b1220]/88 p-5 shadow-[0_22px_56px_-34px_rgba(0,0,0,0.7)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">New CRM Section</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-50">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
            <p className="mt-4 text-xs font-semibold text-slate-500">좌측 메뉴에서 상세 미리보기를 확인할 수 있습니다.</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5">
        <aside className="rounded-[26px] border border-white/[0.1] bg-[#0b1220]/88 p-5 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.72)] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/70">Data Reliability Note</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">베타 데이터 신뢰성 원칙</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
            <li className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">AI는 고객 정보, 상담 요약, 문자 초안을 자동 저장하지 않습니다.</li>
            <li className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">상담 요약, 문자 초안, 다음 행동은 미리보기로 제공되며 최종 저장과 발송은 사용자가 직접 확인합니다.</li>
            <li className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">Follow-up 지연은 텍스트 저장값이 아니라 dueDate, status, today 기준으로 계산됩니다.</li>
            <li className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">Inventory 변경은 누가, 언제 바꿨는지 남기는 구조를 전제로 합니다.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
