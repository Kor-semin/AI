"use client";

import {
  sensoraB2BSeedData,
  type LeadSource,
  type LeadStatus,
} from "@/lib/sensora";

const LEAD_FLOW_STEPS = [
  { title: "접수", description: "전시장 전화·방문·온라인 문의를 Lead로 확인" },
  { title: "담당자 배정", description: "팀장이 담당 영업사원에게 확인 요청" },
  { title: "상담 메모 작성", description: "상담 내용과 니즈를 사용자 확인 후 기록" },
  { title: "Customer 전환", description: "관리 대상 고객으로 전환" },
  { title: "FollowUp 생성", description: "다음 연락과 사후관리 일정 연결" },
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

export function SensoraLeadQueueSection() {
  return (
    <section id="lead-queue" className="scroll-mt-24 rounded-[28px] border border-white/[0.12] bg-[#07111f]/82 p-5 text-slate-100 shadow-[0_28px_72px_-38px_rgba(0,0,0,0.75)] sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200/70">Lead Queue</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-50">Lead 접수</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            전시장 전화, 직접 방문, 온라인 문의 등 고객 전환 전의 접수 데이터를 확인하는 베타 화면입니다.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-rose-200/20 bg-[#3b0d16]/55 px-3 py-1.5 text-xs font-bold text-rose-50">
          미리보기 · 저장/배정 기능 없음
        </span>
      </div>

      <ol className="mt-6 grid gap-2 lg:grid-cols-5">
        {LEAD_FLOW_STEPS.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-white/[0.1] bg-white/[0.055] p-4">
            <span className="text-xs font-bold text-rose-200/70">0{index + 1}</span>
            <p className="mt-1 text-sm font-semibold text-slate-50">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.description}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 overflow-hidden rounded-[22px] border border-white/[0.1]">
        {sensoraB2BSeedData.leads.map((lead) => (
          <article key={lead.id} className="border-b border-white/[0.08] bg-[#0b1220]/86 p-5 last:border-b-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-50">{lead.customerName}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {LEAD_SOURCE_LABELS[lead.source]} · {lead.interestedVehicle ?? "관심 차량 미정"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-rose-300/30 bg-[#4a0f1b]/75 px-3 py-1 text-xs font-bold text-rose-50">
                  {LEAD_STATUS_LABELS[lead.status]}
                </span>
                <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                  구조 확인
                </span>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["접수자", findUserName(lead.receivedBy)],
                ["담당자", findUserName(lead.assignedUserId)],
                ["배정 시간", formatDateTime(lead.assignedAt)],
                ["지점", findBranchName(lead.branchId)],
                ["팀", findTeamName(lead.teamId)],
                ["메모", lead.memo ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">
                  <dt className="font-semibold text-slate-100">{label}</dt>
                  <dd className="mt-1 leading-relaxed text-slate-400">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
