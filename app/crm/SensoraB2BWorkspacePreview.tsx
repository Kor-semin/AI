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
const LEAD_FLOW_STEPS = ["접수", "담당자 배정", "상담 메모 작성", "Customer 전환", "FollowUp 생성"];

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
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  notice: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  warning: "border-rose-200 bg-rose-50 text-rose-700",
  muted: "border-slate-200 bg-slate-50 text-slate-500",
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
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{ROLE_LABELS[profile.role]}</p>
          <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{profile.name}</h4>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {WORKSPACE_LABELS[defaultWorkspace]}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-950">권한 범위</dt>
          <dd>{profile.scopeType} · {profile.scopeId ?? profile.id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-950">사용 가능 Workspace</dt>
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
                ? "border-slate-300 bg-slate-950 text-white"
                : "border-slate-200 bg-slate-50 text-slate-700",
            ].join(" ")}
          >
            {menu}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
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
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Lead Queue Beta</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">접수부터 고객 전환까지</h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slate-500">
          실제 배정 저장은 아직 연결하지 않고, 접수 데이터와 상태 흐름만 확인합니다.
        </p>
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-5">
        {LEAD_FLOW_STEPS.map((step, index) => (
          <li key={step} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <span className="text-xs font-bold text-slate-400">0{index + 1}</span>
            <p className="mt-1 text-sm font-semibold text-slate-900">{step}</p>
          </li>
        ))}
      </ol>

      <div className="mt-5 space-y-3">
        {sensoraB2BSeedData.leads.map((lead) => (
          <article key={lead.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-950">{lead.customerName}</h4>
                <p className="mt-1 text-sm text-slate-500">
                  {LEAD_SOURCE_LABELS[lead.source]} · {lead.interestedVehicle ?? "관심 차량 미정"}
                </p>
              </div>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                {LEAD_STATUS_LABELS[lead.status]}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <dt className="font-semibold text-slate-900">접수자</dt>
                <dd className="text-slate-600">{findUserName(lead.receivedBy)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">담당자</dt>
                <dd className="text-slate-600">{findUserName(lead.assignedUserId)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">배정 시간</dt>
                <dd className="text-slate-600">{formatDateTime(lead.assignedAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">지점</dt>
                <dd className="text-slate-600">{findBranchName(lead.branchId)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">팀</dt>
                <dd className="text-slate-600">{findTeamName(lead.teamId)}</dd>
              </div>
              <div className="sm:col-span-2 xl:col-span-1">
                <dt className="font-semibold text-slate-900">메모</dt>
                <dd className="text-slate-600">{lead.memo ?? "—"}</dd>
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
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Inventory Beta</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">차량 재고 확인</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          차종, 트림, 색상, 옵션과 재고 상태를 확인합니다. 실제 외부 연동은 구현하지 않았습니다.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {sensoraB2BSeedData.inventoryUnits.map((unit) => {
          const tone = getInventoryStatusTone(unit.stockStatus);
          return (
            <article key={unit.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-950">
                    {unit.brand} {unit.model}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {[unit.trim, unit.exteriorColor, unit.interiorColor].filter(Boolean).join(" · ") || "상세 조건 미정"}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_TONE_CLASS[tone]}`}>
                  {getInventoryStatusLabel(unit.stockStatus)}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-900">옵션 요약</dt>
                  <dd className="text-slate-600">{unit.optionSummary ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">차대번호 또는 식별값</dt>
                  <dd className="text-slate-600">{unit.vin ?? unit.id}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">업데이트 담당자</dt>
                  <dd className="text-slate-600">{findUserName(unit.updatedBy)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">마지막 업데이트</dt>
                  <dd className="text-slate-600">{formatDateTime(unit.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Integration status</dt>
                  <dd className="text-slate-600">{INTEGRATION_STATUS_LABELS[unit.integrationStatus ?? "manual"]}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">가능 작업</dt>
                  <dd className="text-slate-600">
                    {canReserveInventoryUnit(unit) ? "예약 검토 가능" : "예약 제한"} ·{" "}
                    {canMarkInventoryAsSold(unit) ? "판매 완료 처리 가능" : "판매 완료 처리 제한"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-slate-900">메모</dt>
                  <dd className="text-slate-600">{unit.memo ?? "—"}</dd>
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
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Activity Log Preview</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">중요 행동 기록</h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slate-500">
          누가, 언제, 어떤 데이터를 변경했는지 남기는 구조를 보여줍니다.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200">
        {sensoraB2BSeedData.activityLogs.map((log) => (
          <article key={log.id} className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 last:border-b-0 lg:grid-cols-[1.2fr_1fr_1.5fr]">
            <div>
              <p className="text-sm font-semibold text-slate-950">{ACTIVITY_ACTION_LABELS[log.action]}</p>
              <p className="mt-1 text-xs text-slate-500">
                {ACTIVITY_TARGET_LABELS[log.targetType]} · {log.targetId}
              </p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
            </div>
            <div className="text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">실행자:</span> {findUserName(log.actorUserId)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">지점:</span> {findBranchName(log.branchId)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">팀:</span> {findTeamName(log.teamId)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">변경 전:</span> {formatChangeSet(log.before)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">변경 후:</span> {formatChangeSet(log.after)}
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
    <section className="rounded-[32px] border border-white/[0.14] bg-slate-100 p-4 text-slate-900 shadow-[0_30px_80px_-38px_rgba(0,0,0,0.6)] sm:p-6 lg:p-8">
      <div className="rounded-[26px] bg-slate-950 px-5 py-6 text-white sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">B2B Sales Workspace Preview</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              자동차 영업조직을 위한 Sales Workspace 확장
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              영업팀장은 별도 시스템이 아니라 같은 Sales Workspace를 사용하며, 권한에 따라 팀 관리 메뉴만 추가됩니다.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.06] p-4 text-sm leading-relaxed text-slate-300">
            초기 베타에서는 AI가 자동으로 저장하거나 발송하지 않습니다. 상담 요약, 문자 초안, 다음 행동은 모두 미리보기로 제공되며, 최종 저장과 발송은 사용자가 직접 확인 후 진행합니다.
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {salesProfiles.map((profile) => (
          <WorkspaceRoleCard key={profile.id} profile={profile} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <LeadQueuePreview />
        <InventoryPreview />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <ActivityLogPreview />
        <aside className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Data Reliability Note</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">베타 데이터 신뢰성 원칙</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
            <li className="rounded-2xl bg-slate-50 p-3">저장 성공 전에는 저장된 것처럼 표시하지 않습니다.</li>
            <li className="rounded-2xl bg-slate-50 p-3">Follow-up 지연 여부는 저장된 텍스트가 아니라 dueDate, status, today 기준으로 계산됩니다.</li>
            <li className="rounded-2xl bg-slate-50 p-3">Inventory 변경은 누가, 언제 변경했는지 남기는 구조를 전제로 합니다.</li>
            <li className="rounded-2xl bg-slate-50 p-3">재고 차감, 문자 발송, 외부 시스템 연동은 사용자가 확인한 뒤 진행하는 흐름을 유지합니다.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
