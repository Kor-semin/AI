import type { TranslationKey } from "@/lib/i18n";
import { scorePurchaseIntent, shouldShowPurchaseIntentScore } from "./leadScore";
import type { Customer, NextAction } from "./types";

export type CustomerListFilterId =
  | "all"
  | "contactToday"
  | "consulting"
  | "estimateReview"
  | "deliveryPrep"
  | "aftercare";

export type CustomerListSortId = "recentConsult" | "nextContact" | "interest";

export const CUSTOMER_LIST_FILTER_OPTIONS: {
  id: CustomerListFilterId;
  labelKey: TranslationKey;
}[] = [
  { id: "all", labelKey: "crm.customerList.filter.all" },
  { id: "contactToday", labelKey: "crm.customerList.filter.contactToday" },
  { id: "consulting", labelKey: "crm.customerList.filter.consulting" },
  { id: "estimateReview", labelKey: "crm.customerList.filter.estimateReview" },
  { id: "deliveryPrep", labelKey: "crm.customerList.filter.deliveryPrep" },
  { id: "aftercare", labelKey: "crm.customerList.filter.aftercare" },
];

export const CUSTOMER_LIST_SORT_OPTIONS: {
  id: CustomerListSortId;
  labelKey: TranslationKey;
}[] = [
  { id: "recentConsult", labelKey: "crm.customerList.sort.recentConsult" },
  { id: "nextContact", labelKey: "crm.customerList.sort.nextContact" },
  { id: "interest", labelKey: "crm.customerList.sort.interest" },
];

const CONSULTING_STAGES = new Set([
  "연락처 가져옴",
  "미상담",
  "신규 문의",
  "상담 진행",
  "상담 완료",
  "시승 예정",
]);

const ESTIMATE_REVIEW_STAGES = new Set(["견적 발송", "계약 검토"]);
const DELIVERY_PREP_STAGES = new Set(["계약 완료", "출고 대기"]);
const AFTERCARE_STAGES = new Set(["사후관리", "출고 완료"]);

function parseIsoToLocalDate(iso: string): Date | null {
  const t = iso?.trim();
  if (!t) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfTodayLocal(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function isSameLocalDay(iso: string | undefined, dayStart: Date): boolean {
  if (!iso) return false;
  const d = parseIsoToLocalDate(iso);
  if (!d) return false;
  return (
    d.getFullYear() === dayStart.getFullYear() &&
    d.getMonth() === dayStart.getMonth() &&
    d.getDate() === dayStart.getDate()
  );
}

function pendingActionsFor(customerId: string, nextActions: NextAction[]): NextAction[] {
  return nextActions.filter((a) => a.customerId === customerId && !a.doneAt);
}

export function isCustomerContactToday(c: Customer, nextActions: NextAction[]): boolean {
  const today = startOfTodayLocal();
  if (isSameLocalDay(c.nextContactAt, today)) return true;
  return pendingActionsFor(c.id, nextActions).some((a) => isSameLocalDay(a.dueAt, today));
}

export function isCustomerNoResponse(c: Customer, nextActions: NextAction[]): boolean {
  const todayStart = startOfTodayLocal();
  const todayStartMs = todayStart.getTime();

  if (c.nextContactAt) {
    const d = parseIsoToLocalDate(c.nextContactAt);
    if (d && d.getTime() < todayStartMs) return true;
  }

  for (const a of pendingActionsFor(c.id, nextActions)) {
    if (!a.dueAt) continue;
    const d = parseIsoToLocalDate(a.dueAt);
    if (d && d.getTime() < todayStartMs) return true;
  }

  return false;
}

function customerContextBlob(c: Customer, nextActions: NextAction[]): string {
  const actionText = pendingActionsFor(c.id, nextActions)
    .map((a) => a.title)
    .join(" ");
  return `${c.stage} ${c.memo ?? ""} ${actionText}`.toLowerCase();
}

function matchesContext(hay: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(hay));
}

export function matchesCustomerListFilter(
  c: Customer,
  filter: CustomerListFilterId,
  nextActions: NextAction[],
): boolean {
  if (filter === "all") return true;
  if (filter === "contactToday") return isCustomerContactToday(c, nextActions);

  const hay = customerContextBlob(c, nextActions);

  if (filter === "consulting") {
    return (
      CONSULTING_STAGES.has(c.stage) ||
      matchesContext(hay, [/시승/, /니즈/, /상담/, /문의/, /방문/, /카탈로그/, /브랜드/])
    );
  }
  if (filter === "estimateReview") {
    return (
      ESTIMATE_REVIEW_STAGES.has(c.stage) ||
      matchesContext(hay, [/견적/, /프로모션/, /월\s*납입/, /조건\s*비교/, /할부\s*조건/])
    );
  }
  if (filter === "deliveryPrep") {
    return (
      DELIVERY_PREP_STAGES.has(c.stage) ||
      matchesContext(hay, [/출고\s*일정/, /출고\s*전/, /인도/, /등록/, /보험\s*가입/, /명의/])
    );
  }
  if (filter === "aftercare") {
    if (AFTERCARE_STAGES.has(c.stage)) return true;
    return matchesContext(hay, [
      /출고\s*후/,
      /안부/,
      /점검/,
      /보험\s*만기/,
      /시즌/,
      /재구매/,
      /소개\s*요청/,
    ]);
  }
  return true;
}

function nextContactSortKey(c: Customer, nextActions: NextAction[]): number {
  const pending = pendingActionsFor(c.id, nextActions)
    .map((a) => parseIsoToLocalDate(a.dueAt ?? ""))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const contact = parseIsoToLocalDate(c.nextContactAt ?? "");
  const candidates = [pending, contact].filter((d): d is Date => d !== null);
  if (candidates.length === 0) return Number.POSITIVE_INFINITY;
  return Math.min(...candidates.map((d) => d.getTime()));
}

export function sortCustomersForList(
  customers: Customer[],
  sort: CustomerListSortId,
  nextActions: NextAction[],
): Customer[] {
  const list = [...customers];
  if (sort === "recentConsult") {
    list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return list;
  }
  if (sort === "nextContact") {
    list.sort((a, b) => nextContactSortKey(a, nextActions) - nextContactSortKey(b, nextActions));
    return list;
  }
  list.sort((a, b) => {
    const sa = shouldShowPurchaseIntentScore(a) ? scorePurchaseIntent(a).percent : -1;
    const sb = shouldShowPurchaseIntentScore(b) ? scorePurchaseIntent(b).percent : -1;
    if (sb !== sa) return sb - sa;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  return list;
}

export function filterCustomersByListFilter(
  customers: Customer[],
  filter: CustomerListFilterId,
  nextActions: NextAction[],
): Customer[] {
  return customers.filter((c) => matchesCustomerListFilter(c, filter, nextActions));
}

export type CustomerListStats = {
  total: number;
  contactToday: number;
  noResponse: number;
};

export function computeCustomerListStats(
  customers: Customer[],
  nextActions: NextAction[],
): CustomerListStats {
  let contactToday = 0;
  let noResponse = 0;
  for (const c of customers) {
    if (isCustomerContactToday(c, nextActions)) contactToday += 1;
    if (isCustomerNoResponse(c, nextActions)) noResponse += 1;
  }
  return { total: customers.length, contactToday, noResponse };
}
