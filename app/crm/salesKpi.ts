/**
 * 대시보드 KPI 계산 — 실제 저장된 고객 목록에서 파생됩니다.
 *
 * 이전에는 화면 장식용 하드코딩 숫자였고, 클릭해도 고객 카드로 이어지지 않았습니다.
 * 이제 KPI → 고객 목록 → 고객 카드(수정 가능)까지 같은 데이터를 사용합니다.
 */
import { HIGH_POTENTIAL_THRESHOLD, SEED_META } from "./sensoraSeedCustomers";
import type { CRMState, Customer } from "./types";

export type DashboardKpiId = "todayContacts" | "highPotential" | "overdueFollowUps" | "recentConsultations";

export type KpiRow = {
  customer: Customer;
  /** 이 고객이 해당 KPI에 포함된 이유 */
  reason: string;
  /** 강조 색 구분 */
  tone: "warn" | "ok" | "brand" | "muted";
  /** 계약 가능성 KPI에서 게이지로 표시 */
  probability?: number;
};

export type KpiSummary = {
  counts: Record<DashboardKpiId, number>;
  rows: Record<DashboardKpiId, KpiRow[]>;
  details: Record<DashboardKpiId, string>;
};

/**
 * 계약 가능성은 "영업 단계" 하나에서만 파생됩니다.
 * 단계를 바꾸면 대시보드 숫자가 즉시 따라 움직여야 하므로 별도 고정값을 두지 않습니다.
 */
const STAGE_PROBABILITY: Partial<Record<Customer["stage"], number>> = {
  "연락처 가져옴": 15,
  미상담: 20,
  "신규 문의": 35,
  "상담 완료": 50,
  "견적 발송": 62,
  "시승 예정": 74,
  "계약 검토": 85,
  "계약 완료": 95,
  "출고 대기": 92,
  "출고 완료": 40,
  사후관리: 30,
};

export function customerProbability(customer: Customer): number {
  return STAGE_PROBABILITY[customer.stage] ?? 40;
}

export function computeKpi(state: CRMState): KpiSummary {
  const { customers, nextActions } = state;

  const todayRows: KpiRow[] = [];
  const highRows: KpiRow[] = [];
  const overdueRows: KpiRow[] = [];
  const recentRows: KpiRow[] = [];

  let noAnswer = 0;
  let reserved = 0;
  let todayMemo = 0;

  const openActionByCustomer = new Map<string, string>();
  nextActions
    .filter((action) => !action.doneAt)
    .forEach((action) => {
      if (!openActionByCustomer.has(action.customerId)) openActionByCustomer.set(action.customerId, action.title);
    });

  for (const customer of customers) {
    const meta = SEED_META.get(customer.id);

    // 1) 오늘 연락할 고객
    if (meta?.todayContact) {
      const kind = meta.todayContact.kind;
      if (kind === "no_answer") noAnswer++;
      if (kind === "reserved") reserved++;
      todayRows.push({
        customer,
        reason: meta.todayContact.label,
        tone: kind === "no_answer" ? "warn" : kind === "reserved" ? "ok" : "muted",
      });
    }

    // 2) 계약 가능성이 높은 고객
    const probability = customerProbability(customer);
    if (probability >= HIGH_POTENTIAL_THRESHOLD) {
      highRows.push({ customer, reason: `계약 가능성 ${probability}%`, tone: "brand", probability });
    }

    // 3) 지연된 follow-up — 시드 메타 또는 미완료 다음 연락 항목
    const openAction = openActionByCustomer.get(customer.id);
    if (meta?.overdue) {
      overdueRows.push({
        customer,
        reason: `${meta.overdue.hours}시간 경과 · ${meta.overdue.purpose}`,
        tone: "warn",
      });
    } else if (openAction) {
      overdueRows.push({ customer, reason: `미완료 · ${openAction}`, tone: "warn" });
    }

    // 4) 최근 상담 요약 — 메모가 있는 고객
    if (customer.memo?.trim()) {
      const label = meta?.consultedAt?.label ?? "최근 수정";
      const isToday = meta?.consultedAt?.isToday ?? isUpdatedToday(customer.updatedAt);
      if (isToday) todayMemo++;
      recentRows.push({
        customer,
        reason: `${label} · ${truncate(customer.memo.trim(), 70)}`,
        tone: isToday ? "brand" : "muted",
      });
    }
  }

  highRows.sort((a, b) => (b.probability ?? 0) - (a.probability ?? 0));

  return {
    counts: {
      todayContacts: todayRows.length,
      highPotential: highRows.length,
      overdueFollowUps: overdueRows.length,
      recentConsultations: recentRows.length,
    },
    rows: {
      todayContacts: todayRows,
      highPotential: highRows,
      overdueFollowUps: overdueRows,
      recentConsultations: recentRows,
    },
    details: {
      todayContacts: `미응답 ${noAnswer}명 · 예약 ${reserved}건`,
      highPotential: `계약 가능성 ${HIGH_POTENTIAL_THRESHOLD}% 이상`,
      overdueFollowUps: "완료되지 않은 후속 연락",
      recentConsultations: `오늘 새 메모 ${todayMemo}건`,
    },
  };
}

function isUpdatedToday(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** 목록 표시용 연락처 마스킹 */
export function maskCustomerPhone(phone?: string): string {
  if (!phone) return "연락처 미입력";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "연락처 확인 필요";
  const prefixLength = digits.length === 10 ? 3 : Math.max(2, digits.length - 8);
  const middleLength = Math.max(3, digits.length - prefixLength - 4);
  return `${digits.slice(0, prefixLength)}-${"*".repeat(middleLength)}-${digits.slice(-4)}`;
}

export { HIGH_POTENTIAL_THRESHOLD };
