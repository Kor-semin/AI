import { sensoraB2BSeedData, type SensoraLead } from "@/lib/sensora";

const sourceLabels: Record<SensoraLead["source"], string> = {
  showroom_call: "전시장 전화",
  walk_in: "직접 방문",
  online_inquiry: "온라인 문의",
  referral: "고객 추천",
  test_drive_request: "시승 문의",
  event: "이벤트",
  unknown: "기타",
};

const baseLead = sensoraB2BSeedData.leads[0];

const previewLeads: SensoraLead[] = [
  baseLead,
  {
    ...baseLead,
    id: "lead_preview_walk_in",
    source: "walk_in",
    customerName: "김도현",
    interestedVehicle: "BMW 520i M Sport",
    assignedUserId: "user_team_leader",
    status: "contact_needed",
  },
  {
    ...baseLead,
    id: "lead_preview_online",
    source: "online_inquiry",
    customerName: "이서연",
    interestedVehicle: "Audi A6 45 TFSI",
    assignedUserId: undefined,
    status: "unassigned",
  },
];

const userLabels: Record<string, string> = {
  user_sales: "오세민",
  user_team_leader: "최서윤",
  user_branch_manager: "윤도현",
};

const readiness: Record<SensoraLead["status"], { label: string; tone: string }> = {
  new: { label: "정보 확인", tone: "text-[#B48A48]" },
  unassigned: { label: "담당자 확인", tone: "text-[#B48A48]" },
  assigned: { label: "전환 준비", tone: "text-[#4E8A66]" },
  contact_needed: { label: "연락 필요", tone: "text-[#B48A48]" },
  contacted: { label: "전환 검토", tone: "text-[#B7BDC6]" },
  in_consultation: { label: "전환 가능", tone: "text-[#4E8A66]" },
  converted: { label: "Customer 전환", tone: "text-[#4E8A66]" },
  lost: { label: "보류", tone: "text-[#7F8792]" },
  duplicate: { label: "중복 확인", tone: "text-[#7F8792]" },
  invalid: { label: "정보 확인", tone: "text-[#7F8792]" },
};

export function SensoraLeadQueueView({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section className="min-h-[380px] rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="lead-preview-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Lead Intake</p>
            <h2 id="lead-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">신규 Lead 접수</h2>
          </div>
          <span className="rounded-lg bg-[#2A151B] px-4 py-2 text-[10px] font-medium text-[#A93754]">NEW · 12분 전</span>
        </div>

        <dl className="mt-9 grid min-h-[150px] grid-cols-[68px_1fr] content-center gap-x-4 gap-y-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4 text-[11px]">
          <dt className="text-[#7F8792]">접수 채널</dt><dd className="text-[#B7BDC6]">전시장 전화 · 직접 방문</dd>
          <dt className="text-[#7F8792]">온라인 문의</dt><dd className="text-[#B7BDC6]">웹 폼 유입</dd>
          <dt className="text-[#7F8792]">담당 영업사원</dt><dd className="text-[#B7BDC6]">이서준 매니저</dd>
          <dt className="text-[#7F8792]">전환 상태</dt><dd className="text-[#B7BDC6]">Customer 전환 준비</dd>
        </dl>

        <div className="mt-6 rounded-lg bg-[#2A151B] p-4">
          <p className="text-xs font-semibold text-[#4E8A66]">Customer 전환 준비 · 80%</p>
          <p className="mt-2 text-[10px] leading-4 text-[#7F8792]">연락처 확인 완료 · 관심 모델 확인 · 시승 일정 확인 필요</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby={compact ? "lead-preview-title" : "lead-view-title"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A263A]">Lead Intake</p>
          <h2 id={compact ? "lead-preview-title" : "lead-view-title"} className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">Lead 접수</h2>
          <p className="mt-1 text-xs leading-5 text-[#7F8792]">유입 경로와 담당자, Customer 전환 준비 상태를 한곳에서 확인합니다.</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#2B3037] bg-[#1A1E23] px-2.5 py-1 text-[10px] text-[#B7BDC6]">읽기 전용</span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className={compact ? "min-w-[360px]" : "min-w-[600px]"}>
          <div className={`grid gap-3 border-b border-[#2B3037] px-3 pb-2 text-[10px] uppercase tracking-[0.1em] text-[#7F8792] ${compact ? "grid-cols-[1.25fr_1fr_.8fr]" : "grid-cols-[1fr_1.2fr_1.25fr_1fr]"}`}>
            {compact ? <><span>접수 고객</span><span>담당 영업사원</span><span>전환 상태</span></> : <><span>접수 경로</span><span>고객 / 관심 차량</span><span>담당 영업사원</span><span>전환 준비 상태</span></>}
          </div>
          {previewLeads.map((lead) => {
            const state = readiness[lead.status];
            return (
              <div key={lead.id} className={`grid items-center gap-3 border-b border-[#2B3037]/70 px-3 py-3.5 last:border-0 ${compact ? "grid-cols-[1.25fr_1fr_.8fr]" : "grid-cols-[1fr_1.2fr_1.25fr_1fr]"}`}>
                {compact ? null : <span className="text-xs font-medium text-[#B7BDC6]">{sourceLabels[lead.source]}</span>}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-[#F4F6F8]">{compact ? `${sourceLabels[lead.source]} · ${lead.customerName || "신규 고객"}` : lead.customerName || "신규 고객"}</span>
                  <span className="mt-1 block truncate text-[10px] text-[#7F8792]">{lead.interestedVehicle || "관심 차량 확인 중"}</span>
                </span>
                <span className="text-xs text-[#B7BDC6]">{lead.assignedUserId ? userLabels[lead.assignedUserId] ?? "담당자 확인" : "미배정 · 구조 확인"}</span>
                <span className={`text-xs font-medium ${state.tone}`}>{state.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {!compact ? (
        <p className="mt-5 rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-xs leading-5 text-[#B7BDC6]">베타 미리보기입니다. 배정·전환·저장 기능은 연결하지 않았습니다.</p>
      ) : null}
    </section>
  );
}
