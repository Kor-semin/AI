import type { Customer, FinanceConditionDraft } from "./types";
import { vehicleDisplayLine } from "./newCarEstimateDraft";
import { formatKrwShort, parseMoneyToKrw } from "./recommendations";

const FINANCE_AWARE_TITLES = new Set(["리스·장기렌트 안내", "할부 조건 확인"]);

function fmt(v?: string): string {
  return v && String(v).trim() ? String(v).trim() : "";
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

export function isFinanceAwareTemplateTitle(title: string): boolean {
  return FINANCE_AWARE_TITLES.has(title.trim());
}

function vehicleLineWithTrim(c: Customer): string {
  const fd = c.financeConditionDraft;
  const name = fmt(fd?.vehicleName);
  const trim = fmt(fd?.vehicleTrim);
  if (name && trim) return `${name} ${trim}`;
  if (name) return name;
  return vehicleDisplayLine(c);
}

/** 만·원 단위 자연 표현(빈 값·0만 제외) */
function formatFinanceAmountLabel(text?: string): string {
  const raw = fmt(text);
  if (!raw) return "";
  const won = parseMoneyToKrw(raw);
  if (won != null && won > 0) {
    if (won >= 1_000_000) {
      return `${won.toLocaleString("ko-KR")}원`;
    }
    const man = Math.round(won / 10_000);
    if (man > 0) return `${man.toLocaleString("ko-KR")}만 원`;
  }
  if (/^\d[\d,.\s]*$/.test(raw)) {
    const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n >= 1_000_000) return `${n.toLocaleString("ko-KR")}원`;
    return `${n.toLocaleString("ko-KR")}만 원`;
  }
  return raw;
}

function formatMonthlyPaymentLabel(text?: string): string {
  const raw = fmt(text);
  if (!raw) return "";
  const won = parseMoneyToKrw(raw);
  if (won != null && won > 0) {
    if (won >= 10_000) return `약 ${won.toLocaleString("ko-KR")}원`;
    return `약 ${formatKrwShort(won)}원`;
  }
  if (/^\d[\d,.\s]*$/.test(raw)) {
    const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (n > 0) return `약 ${n.toLocaleString("ko-KR")}원`;
  }
  return `약 ${raw}`;
}

function formatContractMonths(text?: string): string {
  const raw = fmt(text);
  if (!raw) return "";
  if (/개월|month/i.test(raw)) return raw;
  const digits = raw.replace(/[^\d]/g, "");
  if (digits) return `${digits}개월`;
  return raw;
}

function buildConditionSummaryParts(fd: FinanceConditionDraft): string[] {
  const bits: string[] = [];
  const price = formatFinanceAmountLabel(fd.totalVehiclePrice);
  if (price) bits.push(`차량가 ${price}`);
  const promo = formatFinanceAmountLabel(fd.promotionOrDiscount);
  if (promo) bits.push(`프로모션 ${promo}`);
  if (fmt(fd.deposit)) {
    bits.push(`보증금 ${formatFinanceAmountLabel(fd.deposit)}`);
  } else if (fmt(fd.downPayment)) {
    bits.push(`선납금 ${formatFinanceAmountLabel(fd.downPayment)}`);
  }
  const months = formatContractMonths(fd.contractMonths);
  if (months) bits.push(`계약기간 ${months} 기준`);
  const monthly = formatMonthlyPaymentLabel(fd.monthlyPayment);
  if (monthly) bits.push(`월 납입금은 ${monthly} 수준`);
  return bits;
}

function buildPriorityFocusSentence(needs: string[]): string | null {
  if (!needs.length) return null;
  const primary = needs[0]!;
  const map: Record<string, string> = {
    "월 납입금 부담 최소화":
      "고객님께서 월 납입금 부담을 가장 중요하게 보시는 만큼, 보증금과 계약기간 조정에 따라 월 납입금이 더 낮아질 수 있는 조건도 함께 비교해드리겠습니다.",
    "초기 비용 최소화":
      "초기 비용 부담을 줄이는 방향을 우선으로 보고 계셔서, 선납금·보증금과 기간을 조정한 조건도 함께 비교해드리겠습니다.",
    "총 비용 확인":
      "총 납입 부담을 함께 보시는 것이 중요하시므로, 월 납입·초기·만기 기준을 함께 정리해드리겠습니다.",
    "빠른 출고":
      "출고 시점도 중요하게 보고 계셔서, 재고·배정 가능 여부는 상담 시점 기준으로 다시 확인해 안내드리겠습니다.",
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

function buildLeaseFinanceAwareMessage(customer: Customer): string | null {
  const fd = customer.financeConditionDraft;
  if (!fd || !hasMeaningfulFinanceDraft(customer)) return null;

  const name = customer.name?.trim() || "고객";
  const veh = vehicleLineWithTrim(customer);
  const needs = customer.customerPriorityNeeds ?? [];
  const lines: string[] = [];

  lines.push(`${name}님, 안녕하세요.`);
  lines.push("");
  if (veh) {
    lines.push(`문의 주신 ${veh} 기준으로 리스/장기렌트 조건을 정리해보고 있습니다.`);
  } else {
    lines.push("문의 주신 차량 기준으로 리스/장기렌트 조건을 정리해보고 있습니다.");
  }
  lines.push("");

  const bits = buildConditionSummaryParts(fd);
  if (bits.length) {
    lines.push(`현재 확인된 조건 기준으로는 ${bits.join(", ")}으로 확인됩니다.`);
    lines.push("");
  }

  const focus = buildPriorityFocusSentence(needs);
  if (focus) {
    lines.push(focus);
    lines.push("");
  }

  lines.push(
    "리스와 장기렌트는 약정거리, 인수 여부, 보험 포함 여부에 따라 조건이 달라질 수 있어 해당 부분까지 확인 후 비교표로 안내드리겠습니다.",
  );
  lines.push("");

  if (fmt(fd.maturityOptions)) {
    lines.push(`만기 관련해서는 ${fmt(fd.maturityOptions)} 기준으로 함께 검토하겠습니다.`);
    lines.push("");
  }

  if (!mentionsAnnualMileage(fd)) {
    lines.push("편하실 때 연간 주행거리와 만기 인수 여부만 알려주시면 더 정확하게 정리해드리겠습니다.");
  } else {
    lines.push("추가로 확인이 필요한 약정거리·인수 조건이 있으면 말씀 주시면 비교표에 반영하겠습니다.");
  }

  return lines.join("\n");
}

function buildInstallmentFinanceAwareMessage(customer: Customer): string | null {
  const fd = customer.financeConditionDraft;
  if (!fd || !hasMeaningfulFinanceDraft(customer)) return null;

  const name = customer.name?.trim() || "고객";
  const veh = vehicleLineWithTrim(customer);
  const vehShort = fmt(fd.vehicleName) || vehicleDisplayLine(customer) || "문의 차량";
  const needs = customer.customerPriorityNeeds ?? [];
  const lines: string[] = [];

  lines.push(`${name}님, 안녕하세요.`);
  lines.push("");
  lines.push(`문의 주신 ${veh || vehShort} 기준으로 할부 조건을 정리해보고 있습니다.`);
  lines.push("");

  const bits = buildConditionSummaryParts(fd);
  if (bits.length) {
    lines.push(`현재 입력된 조건 기준으로 ${bits.join(", ")}으로 확인됩니다.`);
    lines.push("");
  } else {
    lines.push("현재 입력된 조건을 기준으로 할부 조건을 다시 정리해보고 있습니다.");
    lines.push("");
  }

  const focus = buildPriorityFocusSentence(needs);
  if (focus) {
    lines.push(focus);
    lines.push("");
  }

  const missingDown = !fmt(fd.downPayment) && !fmt(fd.deposit);
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

  lines.push("확인 후 부담이 적은 조건과 총 납입 기준을 함께 안내드리겠습니다.");

  return lines.join("\n");
}

/** 상황별 문자 초안 본문 — 금융 조건이 있으면 검토용 맞춤 문구, 없으면 기존 템플릿 */
export function resolveMessageTemplateBody(
  templateTitle: string,
  customer: Customer | null | undefined,
  fallbackBody: string,
): string {
  if (!customer) return fallbackBody;
  const title = templateTitle.trim();
  if (title === "리스·장기렌트 안내") {
    return buildLeaseFinanceAwareMessage(customer) ?? fallbackBody;
  }
  if (title === "할부 조건 확인") {
    return buildInstallmentFinanceAwareMessage(customer) ?? fallbackBody;
  }
  return fallbackBody;
}
