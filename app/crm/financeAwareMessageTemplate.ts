import type { Customer, FinanceConditionDraft, FinanceProductMode, MessageTemplate } from "./types";
import { vehicleDisplayLine } from "./newCarEstimateDraft";
import { parseMoneyToKrw } from "./recommendations";

/** 상황별 문자 초안 — 금융 방식별 견적 안내(통합 카드) */
export const ESTIMATE_GUIDE_TEMPLATE_TITLE = "견적 안내 문자";

const LEGACY_ESTIMATE_TITLES = new Set([
  "리스·장기렌트 안내",
  "할부 조건 확인",
  "현금·즉시 출고",
]);

const DEFAULT_ESTIMATE_GUIDE_BODY = `{고객명}님, 안녕하세요.

문의 주신 차량 기준으로 견적 조건을 정리해보고 있습니다.

차량명, 금융 방식, 초기 비용, 희망 월 납입금 또는 출고 희망일을 알려주시면 더 정확한 조건으로 안내드리겠습니다.

확인 후 가능한 조건과 참고 견적을 함께 정리해드리겠습니다.`;

function fmt(v?: string): string {
  return v && String(v).trim() ? String(v).trim() : "";
}

export function isEstimateGuideTemplateTitle(title: string): boolean {
  const key = title.trim();
  return key === ESTIMATE_GUIDE_TEMPLATE_TITLE || LEGACY_ESTIMATE_TITLES.has(key);
}

/** @deprecated — use isEstimateGuideTemplateTitle */
export function isFinanceAwareTemplateTitle(title: string): boolean {
  return isEstimateGuideTemplateTitle(title);
}

/** 금융 조건 초안에 문자 반영에 쓸 만한 값이 있는지 */
export function hasMeaningfulFinanceDraft(c: Customer): boolean {
  const fd = c.financeConditionDraft;
  if (!fd) return false;
  return Boolean(
    fmt(fd.vehicleName) ||
      fmt(fd.vehicleTrim) ||
      fmt(fd.totalVehiclePrice) ||
      fmt(fd.promotionOrDiscount) ||
      fmt(fd.downPayment) ||
      fmt(fd.deposit) ||
      fmt(fd.contractMonths) ||
      fmt(fd.monthlyPayment) ||
      fmt(fd.maturityOptions) ||
      fmt(fd.customerConditionNote),
  );
}

/** 리스·할부·현금 분리 카드 → 견적 안내 문자 통합(기존 저장 데이터 호환) */
export function consolidateMessageTemplates(templates: MessageTemplate[]): MessageTemplate[] {
  const mergedTitles = Array.from(LEGACY_ESTIMATE_TITLES);
  const filtered = templates.filter((t) => !mergedTitles.includes(t.title.trim()));
  const hasGuide = filtered.some((t) => t.title.trim() === ESTIMATE_GUIDE_TEMPLATE_TITLE);
  if (hasGuide) return filtered;
  const t0 = new Date().toISOString();
  return [
    {
      id: `tpl_estimate_guide_${t0.slice(0, 10).replace(/-/g, "")}`,
      title: ESTIMATE_GUIDE_TEMPLATE_TITLE,
      body: DEFAULT_ESTIMATE_GUIDE_BODY,
      updatedAt: t0,
    },
    ...filtered,
  ];
}

function vehicleLineWithTrim(c: Customer): string {
  const fd = c.financeConditionDraft;
  const name = fmt(fd?.vehicleName);
  const trim = fmt(fd?.vehicleTrim);
  if (name && trim) return `${name} ${trim}`;
  if (name) return name;
  return vehicleDisplayLine(c);
}

/** 차량가·프로모션·보증금·선납금 등 — 고객 문자용 만 원 단위 */
function formatManwonLabel(text?: string): string {
  const raw = fmt(text);
  if (!raw) return "";
  const won = parseMoneyToKrw(raw);
  if (won != null && won > 0) {
    const man = Math.round(won / 10_000);
    if (man > 0) return `${man.toLocaleString("ko-KR")}만 원`;
  }
  if (/^\d[\d,.\s]*$/.test(raw)) {
    const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n >= 1_000_000) {
      const man = Math.round(n / 10_000);
      return `${man.toLocaleString("ko-KR")}만 원`;
    }
    return `${n.toLocaleString("ko-KR")}만 원`;
  }
  return raw;
}

/** 월 납입금 — 원 단위 콤마(만 원 변환 없음) */
function formatMonthlyWonLabel(text?: string): string {
  const raw = fmt(text);
  if (!raw) return "";
  const won = parseMoneyToKrw(raw);
  if (won != null && won > 0) {
    return `약 ${won.toLocaleString("ko-KR")}원`;
  }
  if (/^\d[\d,.\s]*$/.test(raw)) {
    const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (n > 0) return `약 ${n.toLocaleString("ko-KR")}원`;
  }
  if (raw) return `약 ${raw}`;
  return "";
}

function formatContractMonths(text?: string): string {
  const raw = fmt(text);
  if (!raw) return "";
  if (/개월|month/i.test(raw)) return raw;
  const digits = raw.replace(/[^\d]/g, "");
  if (digits) return `${digits}개월`;
  return raw;
}

function buildConditionSummaryParts(fd: FinanceConditionDraft, opts?: { omitDownPayment?: boolean }): string[] {
  const bits: string[] = [];
  const price = formatManwonLabel(fd.totalVehiclePrice);
  if (price) bits.push(`차량가 ${price}`);
  const promo = formatManwonLabel(fd.promotionOrDiscount);
  if (promo) bits.push(`프로모션 ${promo}`);
  if (fmt(fd.deposit)) {
    bits.push(`보증금 ${formatManwonLabel(fd.deposit)}`);
  } else if (!opts?.omitDownPayment && fmt(fd.downPayment)) {
    bits.push(`선납금 ${formatManwonLabel(fd.downPayment)}`);
  }
  const months = formatContractMonths(fd.contractMonths);
  if (months) bits.push(`계약기간 ${months}`);
  const monthly = formatMonthlyWonLabel(fd.monthlyPayment);
  if (monthly) bits.push(`월 납입금은 ${monthly}`);
  return bits;
}

function appendMaturityLines(lines: string[], fd: FinanceConditionDraft, mode: "리스" | "장기렌트"): void {
  const mat = fmt(fd.maturityOptions);
  if (mat) {
    if (/반납/i.test(mat)) {
      lines.push("만기 조건은 현재 반납 기준으로 검토하겠습니다.");
    } else {
      lines.push(`만기 조건은 ${mat} 기준으로 함께 검토하겠습니다.`);
    }
    lines.push("");
  }
  if (!mentionsAnnualMileage(fd)) {
    if (mode === "장기렌트") {
      lines.push("편하실 때 연간 주행거리와 보험·정비 포함 여부를 알려주시면 더 정확하게 정리해드리겠습니다.");
    } else {
      lines.push("편하실 때 연간 주행거리와 만기 인수 여부를 알려주시면 더 정확하게 정리해드리겠습니다.");
    }
  }
}

function buildPriorityFocusSentence(needs: string[]): string | null {
  if (!needs.length) return null;
  const primary = needs[0]!;
  const map: Record<string, string> = {
    "월 납입금 부담 최소화":
      "월 납입금 부담을 줄이는 방향을 우선으로 보고 계셔서, 보증금과 계약기간 조정에 따른 조건도 함께 비교해드리겠습니다.",
    "초기 비용 최소화":
      "초기 비용 부담을 줄이는 방향을 우선으로 보고 계셔서, 선납금·보증금과 기간을 조정한 조건도 함께 비교해드리겠습니다.",
    "총 비용 확인":
      "총 납입 부담을 함께 보시는 것이 중요하시므로, 월 납입·초기·만기 기준을 함께 정리해드리겠습니다.",
    "빠른 출고":
      "빠른 출고를 원하실 경우 색상과 옵션 조정 가능 여부에 따라 가능한 재고가 달라질 수 있어, 현재 확인 가능한 차량 기준으로 정리해드리겠습니다.",
    "법인 비용처리":
      "법인 사용 목적에 맞춰 월 비용 부담과 필요 서류를 함께 확인해드리겠습니다.",
    "가족 사용": "가족 사용 목적까지 고려해 실사용 편의성과 조건을 함께 정리드리겠습니다.",
    "장기 보유":
      "장기 보유를 고려하신다면 월 납입금뿐 아니라 총 비용과 만기 선택지도 함께 비교해드리겠습니다.",
    "만기 인수 가능성":
      "만기 인수 가능성을 중요하게 보고 계셔서, 잔존가치와 만기 선택 조건을 함께 확인해드리겠습니다.",
    "프로모션 혜택 확인":
      "프로모션·혜택은 상담 시점과 재고에 따라 달라질 수 있어, 진행 전 다시 확인해 안내드리겠습니다.",
  };
  return map[primary] ?? `고객님께서 ${primary}을(를) 중요하게 보시는 만큼, 해당 기준으로 조건을 함께 비교해드리겠습니다.`;
}

function mentionsAnnualMileage(fd: FinanceConditionDraft): boolean {
  const blob = `${fd.customerConditionNote ?? ""} ${fd.maturityOptions ?? ""}`;
  return /주행|km|킬로|약정거리/i.test(blob);
}

function buildGenericEstimateGuideMessage(customer: Customer): string {
  const name = customer.name?.trim() || "고객";
  const veh = vehicleLineWithTrim(customer);
  const lines: string[] = [];
  lines.push(`${name}님, 안녕하세요.`);
  lines.push("");
  if (veh) {
    lines.push(`문의 주신 ${veh} 기준으로 견적 조건을 정리해보고 있습니다.`);
  } else {
    lines.push("문의 주신 차량 기준으로 견적 조건을 정리해보고 있습니다.");
  }
  lines.push("");
  lines.push(
    "차량명, 금융 방식, 초기 비용, 희망 월 납입금 또는 출고 희망일을 알려주시면 더 정확한 조건으로 안내드리겠습니다.",
  );
  lines.push("");
  lines.push("확인 후 가능한 조건과 참고 견적을 함께 정리해드리겠습니다.");
  return lines.join("\n");
}

function buildLeaseEstimateMessage(customer: Customer): string | null {
  const fd = customer.financeConditionDraft;
  if (!fd) return null;

  const name = customer.name?.trim() || "고객";
  const veh = vehicleLineWithTrim(customer);
  const needs = customer.customerPriorityNeeds ?? [];
  const lines: string[] = [];

  lines.push(`${name}님, 안녕하세요.`);
  lines.push("");
  if (veh) {
    lines.push(`문의 주신 ${veh} 기준으로 리스 조건을 정리해보고 있습니다.`);
  } else {
    lines.push("문의 주신 차량 기준으로 리스 조건을 정리해보고 있습니다.");
  }
  lines.push("");

  const bits = buildConditionSummaryParts(fd);
  if (bits.length) {
    lines.push(`현재 입력된 조건 기준으로는 ${bits.join(", ")} 수준으로 확인됩니다.`);
    lines.push("");
  }

  const focus = buildPriorityFocusSentence(needs);
  if (focus) {
    lines.push(focus);
    lines.push("");
  }

  lines.push(
    "리스는 약정거리, 만기 인수 여부, 보증금 조건에 따라 월 납입금이 달라질 수 있어 해당 부분까지 확인 후 안내드리겠습니다.",
  );
  lines.push("");

  appendMaturityLines(lines, fd, "리스");

  return lines.join("\n");
}

function buildLongRentEstimateMessage(customer: Customer): string | null {
  const fd = customer.financeConditionDraft;
  if (!fd) return null;

  const name = customer.name?.trim() || "고객";
  const veh = vehicleLineWithTrim(customer);
  const needs = customer.customerPriorityNeeds ?? [];
  const lines: string[] = [];

  lines.push(`${name}님, 안녕하세요.`);
  lines.push("");
  if (veh) {
    lines.push(`문의 주신 ${veh} 기준으로 장기렌트 조건을 정리해보고 있습니다.`);
  } else {
    lines.push("문의 주신 차량 기준으로 장기렌트 조건을 정리해보고 있습니다.");
  }
  lines.push("");

  const bits = buildConditionSummaryParts(fd);
  if (bits.length) {
    lines.push(`현재 입력된 조건 기준으로는 ${bits.join(", ")} 수준으로 확인됩니다.`);
    lines.push("");
  }

  const focus = buildPriorityFocusSentence(needs);
  if (focus) {
    lines.push(focus);
    lines.push("");
  }

  lines.push(
    "장기렌트는 약정거리, 보험 포함 여부, 정비 포함 여부, 만기 인수 여부에 따라 월 납입금이 달라질 수 있어 해당 부분까지 확인 후 안내드리겠습니다.",
  );
  lines.push("");

  appendMaturityLines(lines, fd, "장기렌트");

  return lines.join("\n");
}

function buildInstallmentEstimateMessage(customer: Customer): string | null {
  const fd = customer.financeConditionDraft;
  if (!fd) return null;

  const name = customer.name?.trim() || "고객";
  const veh = vehicleLineWithTrim(customer);
  const vehShort = fmt(fd.vehicleName) || vehicleDisplayLine(customer) || "문의 차량";
  const needs = customer.customerPriorityNeeds ?? [];
  const lines: string[] = [];

  lines.push(`${name}님, 안녕하세요.`);
  lines.push("");
  lines.push(`문의 주신 ${veh || vehShort} 기준으로 할부 조건을 정리해보고 있습니다.`);
  lines.push("");

  const bits = buildConditionSummaryParts(fd, { omitDownPayment: true });
  if (bits.length) {
    lines.push(`현재 입력된 조건 기준으로는 ${bits.join(", ")} 수준으로 확인됩니다.`);
    lines.push("");
  }

  const focus = buildPriorityFocusSentence(needs);
  if (focus) {
    const installmentFocus =
      needs[0] === "월 납입금 부담 최소화"
        ? "월 납입금 부담을 낮추는 방향을 우선으로 보고 계셔서, 초기 비용과 계약기간을 조정한 조건도 함께 비교해드리겠습니다."
        : focus;
    lines.push(installmentFocus);
    lines.push("");
  }

  const missingDown = !fmt(fd.downPayment);
  const missingTerm = !fmt(fd.contractMonths);
  const missingMonthly = !fmt(fd.monthlyPayment);
  if (missingDown || missingTerm || missingMonthly) {
    const ask: string[] = [];
    if (missingDown) ask.push("선납금(또는 초기 비용)");
    if (missingTerm) ask.push("기간");
    if (missingMonthly) ask.push("월 납입");
    lines.push(`${ask.join(", ")} 기준을 추가로 확인하면 더 정확하게 안내드릴 수 있습니다.`);
    lines.push("");
  }

  lines.push("확인 후 월 납입 기준과 총 납입 기준을 함께 안내드리겠습니다.");

  return lines.join("\n");
}

function buildCashEstimateMessage(customer: Customer): string | null {
  const fd = customer.financeConditionDraft;
  if (!fd) return null;

  const name = customer.name?.trim() || "고객";
  const veh = vehicleLineWithTrim(customer);
  const needs = customer.customerPriorityNeeds ?? [];
  const lines: string[] = [];

  lines.push(`${name}님, 안녕하세요.`);
  lines.push("");
  if (veh) {
    lines.push(`문의 주신 ${veh} 기준으로 현금 구매 조건과 출고 가능 여부를 확인해보고 있습니다.`);
  } else {
    lines.push("문의 주신 차량 기준으로 현금 구매 조건과 출고 가능 여부를 확인해보고 있습니다.");
  }
  lines.push("");

  const price = formatManwonLabel(fd.totalVehiclePrice);
  const promo = formatManwonLabel(fd.promotionOrDiscount);
  if (price && promo) {
    lines.push(`현재 입력된 조건 기준으로 차량가 ${price}, 프로모션 ${promo} 조건을 기준으로 안내드릴 수 있습니다.`);
  } else if (price) {
    lines.push(`현재 입력된 조건 기준으로 차량가 ${price} 조건을 기준으로 안내드릴 수 있습니다.`);
  } else if (promo) {
    lines.push(`현재 입력된 조건 기준으로 프로모션 ${promo} 조건을 기준으로 안내드릴 수 있습니다.`);
  }
  lines.push("");

  const focus = buildPriorityFocusSentence(needs);
  if (focus) {
    lines.push(focus);
    lines.push("");
  } else if (needs.includes("빠른 출고")) {
    lines.push(
      "빠른 출고를 원하실 경우 색상과 옵션 조정 가능 여부에 따라 가능한 재고가 달라질 수 있어, 현재 확인 가능한 차량 기준으로 정리해드리겠습니다.",
    );
    lines.push("");
  } else {
    lines.push(
      "색상과 옵션 조정 가능 여부에 따라 가능한 재고가 달라질 수 있어, 현재 확인 가능한 차량 기준으로 정리해드리겠습니다.",
    );
    lines.push("");
  }

  lines.push("확인 후 출고 가능 일정과 필요 서류를 함께 안내드리겠습니다.");

  return lines.join("\n");
}

type FinanceModeBranch = "리스" | "장기렌트" | "할부" | "현금" | "unknown";

function resolveFinanceMode(mode: FinanceProductMode | undefined): FinanceModeBranch {
  if (mode === "리스") return "리스";
  if (mode === "장기렌트") return "장기렌트";
  if (mode === "할부") return "할부";
  if (mode === "현금") return "현금";
  return "unknown";
}

/** 견적 안내 문자 — 금융 방식·입력 조건에 따른 검토용 문구 */
export function buildEstimateGuideMessage(customer: Customer): string {
  const mode = resolveFinanceMode(customer.financeConditionDraft?.productMode);

  if (mode === "리스") {
    return buildLeaseEstimateMessage(customer) ?? buildGenericEstimateGuideMessage(customer);
  }
  if (mode === "장기렌트") {
    return buildLongRentEstimateMessage(customer) ?? buildGenericEstimateGuideMessage(customer);
  }
  if (mode === "할부") {
    return buildInstallmentEstimateMessage(customer) ?? buildGenericEstimateGuideMessage(customer);
  }
  if (mode === "현금") {
    return buildCashEstimateMessage(customer) ?? buildGenericEstimateGuideMessage(customer);
  }

  return buildGenericEstimateGuideMessage(customer);
}

/** 상황별 문자 초안 본문 — 견적 안내는 금융 방식별 생성, 그 외는 저장 본문 */
export function resolveMessageTemplateBody(
  templateTitle: string,
  customer: Customer | null | undefined,
  fallbackBody: string,
): string {
  if (!customer) return fallbackBody;
  if (!isEstimateGuideTemplateTitle(templateTitle)) return fallbackBody;
  return buildEstimateGuideMessage(customer);
}
