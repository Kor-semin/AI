"use client";

import {
  ROLE_ACCESS_PRINCIPLES,
  canMarkInventoryAsSold,
  canPreviewB2BSectionForRole,
  canReserveInventoryUnit,
  getInventoryStatusLabel,
  getInventoryStatusTone,
  sensoraB2BSeedData,
  type InventoryIntegrationStatus,
  type UserRole,
} from "@/lib/sensora";

const INTEGRATION_STATUS_LABELS: Record<InventoryIntegrationStatus, string> = {
  manual: "수동 관리",
  csv_ready: "CSV 준비",
  integration_planned: "DMS/ERP 연동 예정",
};

const STATUS_TONE_CLASS: Record<ReturnType<typeof getInventoryStatusTone>, string> = {
  positive: "border-emerald-300/35 bg-emerald-400/12 text-emerald-100",
  notice: "border-sky-300/35 bg-sky-400/12 text-sky-100",
  neutral: "border-slate-300/25 bg-white/[0.08] text-slate-100",
  warning: "border-rose-300/40 bg-rose-400/14 text-rose-100",
  muted: "border-slate-400/20 bg-white/[0.05] text-slate-400",
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

export function SensoraInventorySection() {
  return (
    <section id="inventory" className="scroll-mt-24 rounded-[28px] border border-white/[0.12] bg-[#07111f]/82 p-5 text-slate-100 shadow-[0_28px_72px_-38px_rgba(0,0,0,0.75)] sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200/70">Inventory Beta</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-50">재고 관리</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            차종, 트림, 색상, 옵션과 재고 상태를 확인하는 베타 화면입니다. 실제 상태 변경과 외부 연동은 아직 연결하지 않았습니다.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-rose-200/20 bg-[#3b0d16]/55 px-3 py-1.5 text-xs font-bold text-rose-50">
          읽기 전용 · Integration Planned
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-rose-200/15 bg-[#3b0d16]/45 p-4 text-sm leading-relaxed text-rose-50/90">
          현재 재고 관리는 CSV/수동 관리 기반 베타 구조입니다. 실제 DMS/ERP 연동은 아직 연결되지 않았으며, 연동 예정 상태만 표시합니다. AI 추천과 요약은 자동 저장되지 않으며, 최종 저장과 발송은 사용자가 직접 확인 후 진행합니다.
        </div>
        <div className="rounded-2xl border border-white/[0.1] bg-white/[0.045] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">권한별 노출 원칙</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PREVIEW_ROLES.map((role) => (
              <span
                key={role}
                className={[
                  "rounded-full border px-2.5 py-1 text-xs font-semibold",
                  canPreviewB2BSectionForRole(role, "inventory")
                    ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                    : "border-white/[0.1] bg-white/[0.04] text-slate-500",
                ].join(" ")}
                title={ROLE_ACCESS_PRINCIPLES[role]}
              >
                {ROLE_LABELS[role]} 조회
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {sensoraB2BSeedData.inventoryUnits.map((unit) => {
          const tone = getInventoryStatusTone(unit.stockStatus);
          return (
            <article key={unit.id} className="overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#0b1220]/86">
              <div className="flex flex-col gap-3 border-b border-white/[0.08] p-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-50">
                    {unit.brand} {unit.model}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {unit.trim ?? "트림 미정"} · {unit.exteriorColor ?? "외장 미정"} · {unit.interiorColor ?? "내장 미정"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_TONE_CLASS[tone]}`}>
                    {getInventoryStatusLabel(unit.stockStatus)}
                  </span>
                  <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                    {INTEGRATION_STATUS_LABELS[unit.integrationStatus ?? "manual"]}
                  </span>
                  <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                    CSV 준비
                  </span>
                </div>
              </div>

              <dl className="grid gap-0 text-sm md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["브랜드", unit.brand],
                  ["모델", unit.model],
                  ["트림", unit.trim ?? "—"],
                  ["외장색", unit.exteriorColor ?? "—"],
                  ["내장색", unit.interiorColor ?? "—"],
                  ["옵션 요약", unit.optionSummary ?? "—"],
                  ["VIN 또는 식별값", unit.vin ?? unit.id],
                  ["업데이트 담당자", findUserName(unit.updatedBy)],
                  ["마지막 업데이트", formatDateTime(unit.updatedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-r border-white/[0.07] p-4">
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
                    <dd className="mt-1.5 leading-relaxed text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid gap-3 p-5 text-sm lg:grid-cols-[1fr_1.2fr]">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4">
                  <p className="font-semibold text-slate-100">가능 작업</p>
                  <p className="mt-2 leading-relaxed text-slate-400">
                    {canReserveInventoryUnit(unit) ? "예약 검토 가능" : "예약 제한"} ·{" "}
                    {canMarkInventoryAsSold(unit) ? "판매 완료 처리 가능" : "판매 완료 처리 제한"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4">
                  <p className="font-semibold text-slate-100">메모</p>
                  <p className="mt-2 leading-relaxed text-slate-400">{unit.memo ?? "—"}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
