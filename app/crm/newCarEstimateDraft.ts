import type { Customer, FinanceConditionDraft, FinanceProductMode } from "./types";
import type { TranslationKey } from "@/lib/i18n";
import {
  buildFinanceDraftDetailBullets,
  buildMemoContextSmsDraft,
  normalizeKoreanVehicleSpelling,
  sanitizeAiTextForInput,
  shouldUseMemoContextSmsDraft,
} from "./customerContextDraft";
import { buildUsedCarSearchQuery } from "./recommendations";
import { buildTradeInPriceSmsParagraphs } from "./tradeInPriceNotes";
import { formatCrmDisplayDateTime } from "./customerListDisplay";

/** 고객 니즈 선택지(한글 라벨 — Firestore·상태에 그대로 저장) */
export const CUSTOMER_PRIORITY_OPTIONS = [
  "월 납입금 부담 최소화",
  "초기 비용 최소화",
  "총 비용 확인",
  "빠른 출고",
  "법인 비용처리",
  "가족 사용",
  "장기 보유",
  "만기 인수 가능성",
  "프로모션 혜택 확인",
] as const;

export type CustomerPriorityOption = (typeof CUSTOMER_PRIORITY_OPTIONS)[number];

/** 니즈별 문자·요약에 쓰는 확정 문장(체크 라벨과 키 일치) */
const NEEDS_SMS_LINE: Record<string, string> = {
  "월 납입금 부담 최소화": "고객님께서 중요하게 보신 월 납입 부담을 기준으로 조건을 다시 정리드리겠습니다.",
  "초기 비용 최소화":
    "초기 비용 부담을 줄이는 방향으로 선납금과 보증금 조건을 함께 비교해드리겠습니다.",
  "총 비용 확인": "총 비용(월 납입·초기·만기 포함)을 함께 확인하실 수 있도록 정리드리겠습니다.",
  "빠른 출고":
    "출고 가능 시점은 재고와 배정 상황에 따라 달라질 수 있어 상담 시점 기준으로 다시 확인드리겠습니다.",
  "법인 비용처리": "법인 사용 목적에 맞춰 월 비용 부담과 필요 서류를 함께 확인해드리겠습니다.",
  "가족 사용": "가족 사용 목적까지 고려해 실사용 편의성과 조건을 함께 정리드리겠습니다.",
  "장기 보유":
    "장기 보유를 고려하신다면 월 납입금뿐 아니라 총 비용과 만기 선택지도 함께 보시는 것이 좋습니다.",
  "만기 인수 가능성":
    "만기 인수 가능성을 고려하신다면 잔존가치와 만기 선택 조건을 함께 확인하시는 것이 중요합니다.",
  "프로모션 혜택 확인":
    "프로모션은 상담 시점과 재고 상황에 따라 달라질 수 있어 진행 전 다시 확인드리겠습니다.",
};

/** 니즈별 추천 다음 행동(검토 제안 — 자동 실행 아님) */
const NEEDS_REC_ACTION: Record<string, string> = {
  "월 납입금 부담 최소화": "월 납입·보증금 조건 검토용 문자 발송",
  "초기 비용 최소화": "선납금·보증금 조정안 검토",
  "총 비용 확인": "월 납입·초기·만기 포함 총비용 시나리오 정리",
  "빠른 출고": "재고·배정 가능 여부 확인",
  "법인 비용처리": "법인 필요 서류 및 비용처리 가능 항목 안내",
  "가족 사용": "실사용 목적과 옵션 확인",
  "장기 보유": "할부·만기 선택(인수 등) 조건 비교",
  "만기 인수 가능성": "잔존가치 및 만기 인수 조건 안내",
  "프로모션 혜택 확인": "상담 시점 기준 프로모션 재확인",
};

const SMS_FORBIDDEN_SUBSTRINGS = [
  "좋은 매물",
  "실매물",
  "무사고",
  "성능점검",
  "전 차주",
  "중고차 시세",
  "매입 차량",
  "최저가 보장",
  "무조건 승인",
  "계약 보장",
];

function fmt(v?: string): string {
  return v && String(v).trim() ? String(v).trim() : "";
}

function sanitizeSmsRedFlags(text: string): string {
  let out = text;
  for (const bad of SMS_FORBIDDEN_SUBSTRINGS) {
    if (out.includes(bad)) out = out.split(bad).join("");
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

/** 등록일 기준 최신 견적서가 앞 */
export function sortedEstimateAttachments(c: Customer) {
  return [...(c.estimateAttachments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 문자 초안·빠른 열기에 쓸 선택 견적서(null이면 해당 없음) */
export function resolveSmsDraftEstimateAttachment(c: Customer) {
  const list = sortedEstimateAttachments(c);
  if (!list.length) return null;
  const sid = c.smsDraftEstimateAttachmentId;
  if (sid === "__none__") return null;
  if (sid) return list.find((x) => x.id === sid) ?? list[0] ?? null;
  return list[0] ?? null;
}

/** 관심 차량 한 줄(금융 초안 차명 → 브랜드+차종 → 기타) */
export function vehicleDisplayLine(c: Customer): string {
  const fd = c.financeConditionDraft;
  const fromFd = fmt(fd?.vehicleName);
  if (fromFd) return fromFd;
  const b = c.vehicleBrand;
  const m = c.interestedModel?.trim();
  if (b && m) return normalizeKoreanVehicleSpelling(`${b} ${m}`);
  if (m) return normalizeKoreanVehicleSpelling(m);
  return "";
}

/** 상담 메모에서 원문 인용 없이 반영할 짧은 문장만 생성 */
export function reflectMemoToSafePhrases(memoRaw: string): string[] {
  const raw = memoRaw.replace(/\s+/g, " ").trim();
  if (raw.length < 2) return [];
  const phrases: string[] = [];
  if (/월\s*\d|납입|월납|\d\s*만|만\s*원|만원|월\s*이하|이하\s*희망/i.test(raw)) {
    phrases.push("말씀주신 월 납입 부담과 조건을 기준으로 다시 정리드리겠습니다.");
  }
  if (/출고|인도|빠른/i.test(raw)) {
    phrases.push("말씀주신 출고 가능 여부를 기준으로 재고·배정을 확인해 안내드리겠습니다.");
  }
  if (/가족|동승|아이|캐리|함께\s*사용/i.test(raw)) {
    phrases.push("가족 사용 목적까지 고려해 차량 조건도 함께 확인드리겠습니다.");
  }
  if (/법인/i.test(raw)) {
    phrases.push("법인 사용 목적에 맞춰 필요 서류와 비용 처리 가능 항목을 함께 확인해드리겠습니다.");
  }
  if (/프로모션|혜택|지원금/i.test(raw)) {
    phrases.push("프로모션·혜택은 상담 시점에 따라 달라질 수 있어 진행 전 다시 확인드리겠습니다.");
  }
  if (/리스/i.test(raw) && !/장기렌트/i.test(raw)) {
    phrases.push("검토 중이신 리스 조건에 맞춰 다시 정리드리겠습니다.");
  } else if (/장기렌트/i.test(raw)) {
    phrases.push("검토 중이신 장기렌트 조건에 맞춰 다시 정리드리겠습니다.");
  }
  if (/할부|할인금융/i.test(raw)) {
    phrases.push("할부 조건과 기간에 따라 달라질 수 있는 부분을 함께 확인드리겠습니다.");
  }
  return [...new Set(phrases)].slice(0, 3);
}

/** 메모에서 UI용 짧은 태그(원문 미전체 노출) */
export function memoReflectTags(memoRaw: string): string[] {
  const raw = memoRaw.replace(/\s+/g, " ").trim();
  if (raw.length < 4) return [];
  const tags: string[] = [];
  if (/월|납입|만원|만\s*\d/i.test(raw)) tags.push("월 납입 부담");
  if (/출고|인도/i.test(raw)) tags.push("출고 일정");
  if (/가족|동승/i.test(raw)) tags.push("가족 사용");
  if (/법인/i.test(raw)) tags.push("법인");
  if (/프로모션|혜택/i.test(raw)) tags.push("프로모션");
  return [...new Set(tags)].slice(0, 5);
}

export function buildNeedBasedMessageParagraph(needs: string[]): string | null {
  if (!needs.length) return null;
  const lines = needs.map((n) => {
    const line = NEEDS_SMS_LINE[n];
    return line ?? `· ${n}: 상담 시 비중을 두고 다시 정리해드리겠습니다.`;
  });
  return lines.map((l) => (l.startsWith("·") ? l : `· ${l}`)).join("\n");
}

export function buildRecommendedNextActionsFromCustomer(c: Customer): string[] {
  const needs = c.customerPriorityNeeds ?? [];
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (s: string) => {
    const x = s.trim();
    if (x && !seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  };
  for (const n of needs) {
    const a = NEEDS_REC_ACTION[n];
    if (a) push(a);
  }
  const mode = c.financeConditionDraft?.productMode;
  const memoTags = memoReflectTags(`${c.memo ?? ""}\n${c.personalityMemo ?? ""}`);
  if (memoTags.includes("월 납입 부담") && !needs.some((n) => n.includes("월 납입"))) {
    if (mode === "리스") push("리스 조건·견적 안내 문자 검토");
    else if (mode === "할부") push("할부 조건·견적 안내 문자 검토");
    else if (mode === "장기렌트") push("장기렌트 조건·견적 안내 문자 검토");
    else push("월 납입 조건·견적 안내 문자 검토");
  }
  if (memoTags.includes("출고 일정") && !needs.includes("빠른 출고")) {
    push("재고·배정 가능 여부 확인");
  }
  if (memoTags.includes("가족 사용") && !needs.includes("가족 사용")) {
    push("실사용 목적과 옵션 확인");
  }
  return out.slice(0, 8);
}

/** 견적서 첨부 안내 문구(니즈와 자연 연결, 실제 발송 없음) */
export function buildEstimateAttachmentLine(
  c: Customer,
  t: (key: TranslationKey) => string,
): string {
  const needs = c.customerPriorityNeeds ?? [];
  if (needs.includes("월 납입금 부담 최소화")) {
    return "고객님께서 중요하게 보신 월 납입 부담을 기준으로 정리한 견적서를 함께 첨부드립니다.";
  }
  if (needs.includes("초기 비용 최소화")) {
    return "초기 비용과 월 납입 조건을 함께 확인하실 수 있도록 견적서를 첨부드립니다.";
  }
  return t("crm.newCar.smsAttachCommonIntro");
}

export function buildCustomerContextBulletLines(
  c: Customer,
  t: (key: TranslationKey) => string,
): string[] {
  const lines: string[] = [];
  const veh = vehicleDisplayLine(c);
  const fd = c.financeConditionDraft;
  const needs = c.customerPriorityNeeds ?? [];
  const mode = fd?.productMode ?? c.paymentType;

  if (veh) lines.push(`${t("crm.contextSummary.vehicle")}: ${veh}`);
  if (mode) lines.push(`${t("crm.contextSummary.financeMode")}: ${mode}`);
  if (needs.length) lines.push(`중요 조건: ${needs.join(", ")}`);

  const missing: string[] = [];
  if (!c.purchaseTiming?.trim()) missing.push("구매 시기");
  if (!c.budget?.trim() && !fd?.monthlyPayment?.trim()) missing.push("예산");
  if (needs.includes("빠른 출고") || /출고/i.test(c.memo ?? "")) {
    if (!/출고/i.test(`${c.memo ?? ""}${c.personalityMemo ?? ""}`)) missing.push("출고 가능 여부");
  }
  if (missing.length) lines.push(`확인 필요: ${missing.join(", ")}`);

  const finBullets = buildFinanceDraftDetailBullets(fd);
  if (finBullets.length) {
    lines.push(t("crm.contextSummary.financeDetails"));
    finBullets.forEach((b) => lines.push(b));
  }

  const est = sortedEstimateAttachments(c);
  if (est.length) {
    const attachState = c.smsDraftIncludeEstimateWording
      ? t("crm.contextSummary.estimateAttachOn")
      : t("crm.contextSummary.estimateAttachOff");
    lines.push(
      t("crm.contextSummary.estimateLine")
        .replace("{{n}}", String(est.length))
        .replace("{{attach}}", attachState),
    );
  }
  if (c.nextContactAt) {
    const when = formatCrmDisplayDateTime(c.nextContactAt);
    if (when) lines.push(`${t("crm.contextSummary.nextContact")}: ${when}`);
  }
  return lines;
}

export type BuildSmsPreviewOpts = {
  pendingNextActionTitle?: string | null;
};

/** 금융·니즈·메모·견적 첨부 안내가 연결된 검토용 신차 문자 초안 */
export function buildNewCarFinanceSmsPreview(
  c: Customer,
  t: (key: TranslationKey) => string,
  opts?: BuildSmsPreviewOpts,
): string {
  const memoCombined = `${c.memo ?? ""}\n${c.personalityMemo ?? ""}`.trim();
  const fd = c.financeConditionDraft;
  const hasSavedFinance = Boolean(fd?.productMode && fd.productMode !== "알 수 없음");

  if (!fd && shouldUseMemoContextSmsDraft(c)) {
    const draft = buildMemoContextSmsDraft(c, { pendingNextActionTitle: opts?.pendingNextActionTitle });
    return sanitizeSmsRedFlags(sanitizeAiTextForInput(memoCombined, draft));
  }

  const name = c.name?.trim() || "고객";
  const veh = vehicleDisplayLine(c);
  const needs = c.customerPriorityNeeds ?? [];
  const memoPhrases = reflectMemoToSafePhrases(memoCombined);
  const hasContext = Boolean(veh || needs.length || memoPhrases.length || c.stage || hasSavedFinance);

  if (!hasContext) return "";

  const chunks: string[] = [];

  if (veh) {
    chunks.push(`${name} 고객님, 문의주신 ${veh} 차량·견적 조건 기준으로 정리드립니다.`);
  } else {
    chunks.push(`${name} 고객님, 문의주신 차량·견적 조건 기준으로 정리드립니다.`);
  }

  if (c.stage) {
    chunks.push(`상담 단계는 "${c.stage}"로 이해하고 있습니다.`);
  }

  const needPara = buildNeedBasedMessageParagraph(needs);
  if (needPara) {
    chunks.push(`말씀주신 기준을 반영해 아래를 중심으로 확인드리겠습니다.\n${needPara}`);
  }

  if (memoPhrases.length) {
    const filtered = memoPhrases.filter((line) => {
      if (needs.includes("월 납입금 부담 최소화") && line.includes("월 납입 부담")) return false;
      if (needs.includes("빠른 출고") && line.includes("출고")) return false;
      if (needs.includes("가족 사용") && line.includes("가족")) return false;
      if (needs.includes("법인 비용처리") && line.includes("법인")) return false;
      if (needs.includes("프로모션 혜택 확인") && line.includes("프로모션")) return false;
      return true;
    });
    if (filtered.length) {
      chunks.push(`상담 내용을 바탕으로는 아래도 함께 맞춰보겠습니다.\n${filtered.map((l) => `· ${l}`).join("\n")}`);
    }
  }

  if (hasSavedFinance && fd) {
    const detailLines: string[] = [];
    if (fmt(fd.totalVehiclePrice)) detailLines.push(`총 차량가(참고): ${fmt(fd.totalVehiclePrice)}`);
    if (fmt(fd.promotionOrDiscount)) detailLines.push(`프로모션/할인: ${fmt(fd.promotionOrDiscount)}`);
    if (fmt(fd.downPayment)) detailLines.push(`선납금: ${fmt(fd.downPayment)}`);
    if (fmt(fd.deposit)) detailLines.push(`보증금: ${fmt(fd.deposit)}`);
    if (fmt(fd.contractMonths)) detailLines.push(`계약기간: ${fmt(fd.contractMonths)}`);
    if (fmt(fd.residualValue)) detailLines.push(`잔존가치(리스): ${fmt(fd.residualValue)}`);
    if (fmt(fd.monthlyPayment)) detailLines.push(`월 납입금(참고): ${fmt(fd.monthlyPayment)}`);
    if (fmt(fd.maturityOptions)) detailLines.push(`만기 선택지 검토: ${fmt(fd.maturityOptions)}`);
    if (fmt(fd.interestRate)) detailLines.push(`금리(참고): ${fmt(fd.interestRate)}`);
    if (fmt(fd.agreedDistance)) detailLines.push(`약정거리(참고): ${fmt(fd.agreedDistance)}`);
    if (fmt(fd.insuranceIncluded)) detailLines.push(`보험 포함: ${fmt(fd.insuranceIncluded)}`);
    if (fmt(fd.customerConditionNote)) detailLines.push(`기타 확인 사항: ${fmt(fd.customerConditionNote)}`);

    if (fd.productMode === "리스") {
      chunks.push(
        `현재 견적 기준으로 월 납입금은 약 ${fmt(fd.monthlyPayment) || "(견적서 확인)"} 수준이며, 계약기간·잔존가치·보증금·선납금 조건에 따라 달라질 수 있습니다.\n` +
          `리스는 월 부담과 만기 선택지(반납·인수·연장 검토 등)를 함께 보시는 것이 좋습니다.`,
      );
    } else if (fd.productMode === "할부") {
      chunks.push(
        `할부 조건에 따라 월 납입금이 달라질 수 있으며, 장기 보유를 고려하신다면 총 납입 부담과 월 부담을 함께 비교해보시는 것이 좋습니다.\n` +
          `말씀주신 월 납입 기준에 맞춰 할부 조건을 다시 정리해드리겠습니다.`,
      );
    } else if (fd.productMode === "알 수 없음") {
      chunks.push(
        `견적 내용을 기준으로 금융 방식과 조건을 함께 확인하며 정리드립니다.\n` +
          `월 납입 부담·초기 비용·잔존가치·계약기간은 상담 시점 기준으로 다시 확인드리겠습니다.`,
      );
    } else if (fd.productMode === "현금") {
      chunks.push(
        `현금 조건을 기준으로 정리드립니다.\n` +
          `총 차량가와 프로모션·할인 적용 여부에 따라 실 납입 금액은 달라질 수 있습니다.`,
      );
    } else {
      chunks.push(
        `장기렌트 검토를 함께 정리드립니다.\n` +
          `법인·개인 목적에 따라 적합한 설명이 달라질 수 있어 상담을 통해 확인드리겠습니다.`,
      );
    }

    if (detailLines.length) chunks.push(detailLines.join("\n"));
  }

  const tradeInParas = buildTradeInPriceSmsParagraphs(c);
  if (tradeInParas.length) {
    chunks.push(tradeInParas.join("\n"));
  }

  if (opts?.pendingNextActionTitle?.trim()) {
    chunks.push(`다음 연락·진행으로는 "${opts.pendingNextActionTitle.trim()}"을(를) 함께 맞추면 좋겠습니다.`);
  }

  if (c.smsDraftIncludeEstimateWording && sortedEstimateAttachments(c).length > 0) {
    chunks.push(buildEstimateAttachmentLine(c, t));
    if (fd?.productMode === "리스") {
      chunks.push(t("crm.newCar.smsAttachLeaseNote"));
    } else if (fd?.productMode === "할부") {
      chunks.push(t("crm.newCar.smsAttachLoanNote"));
    } else if (fd?.productMode) {
      chunks.push(t("crm.newCar.smsAttachGenericNote"));
    }
    chunks.push(t("crm.newCar.smsAttachClosing"));
  }

  chunks.push(t("crm.newCar.smsPreviewClosingDisclaimer"));

  return sanitizeSmsRedFlags(sanitizeAiTextForInput(memoCombined, chunks.join("\n\n")));
}

/** 상담 요약·고객 메시지(빠른 초안) — 신차 상담 톤, 니즈·메모 태그 연동 */
export function buildConsultationQuickDraft(c: Customer, myName: string): string {
  const lines: string[] = [];
  lines.push(`안녕하세요 ${c.name}님. ${myName}입니다.`);
  const q = buildUsedCarSearchQuery(c);
  const vname = c.financeConditionDraft?.vehicleName?.trim();
  if (vname || q) lines.push(`문의 주신 차량·조건: ${vname || q}`);

  const needs = c.customerPriorityNeeds ?? [];
  if (needs.length) {
    lines.push(`우선 확인해 둔 조건: ${needs.join(", ")}`);
  }
  const tags = memoReflectTags(`${c.memo ?? ""}\n${c.personalityMemo ?? ""}`);
  if (tags.length) {
    lines.push(`상담 메모에서 함께 반영할 포인트: ${tags.join(" · ")}`);
  }

  const tradeInLines = buildTradeInPriceSmsParagraphs(c);
  if (tradeInLines.length) {
    lines.push(...tradeInLines);
  }

  if (c.budget?.trim()) {
    lines.push(`예산·월 납입 부담(고객 말씀): ${c.budget.trim()}`);
  }

  lines.push(
    `현재 견적·프로모션·출고 가능 시점은 상담 시점에 따라 변동될 수 있습니다.\n` +
      `고객님께서 중요하게 보신 조건을 함께 점검한 뒤, 최종 안내는 제가 다시 확인드리겠습니다.\n` +
      `통화 편하신 시간 알려주시면 상세히 정리해 드리겠습니다.`,
  );

  return lines.filter(Boolean).join("\n");
}

/** 금융 조건 폼 — 입력 필드 식별자 */
export type FinanceFieldId =
  | "vehicleName"
  | "vehicleTrim"
  | "totalVehiclePrice"
  | "promotionOrDiscount"
  | "downPayment"
  | "deposit"
  | "contractMonths"
  | "interestRate"
  | "residualValue"
  | "maturityOptions"
  | "monthlyPayment"
  | "agreedDistance"
  | "insuranceIncluded"
  | "deliveryAvailability"
  | "registrationFeesNote"
  | "customerConditionNote";

const FINANCE_FIELD_PLACEHOLDERS: Partial<Record<FinanceFieldId, string>> = {
  vehicleName: "예: 쏘렌토 하이브리드",
  vehicleTrim: "예: 캘리그래피",
  totalVehiclePrice: "예: 4,200만원",
  promotionOrDiscount: "예: 출고 지원금",
  downPayment: "예: 300만원",
  deposit: "예: 500만원",
  contractMonths: "예: 48개월",
  interestRate: "예: 4.9%",
  residualValue: "예: 55%",
  maturityOptions: "예: 인수/반납 검토",
  monthlyPayment: "예: 견적서 기준 참고",
  agreedDistance: "예: 연 2만 km",
  insuranceIncluded: "예: 포함 / 별도",
  deliveryAvailability: "예: 2주 내 가능",
  registrationFeesNote: "예: 취등록세·번호판 등",
  customerConditionNote: "예: 월 납입 부담, 초기비용, 출고 시점",
};

export function financeFieldLabel(field: FinanceFieldId, mode: FinanceProductMode): string {
  const labels: Record<FinanceFieldId, string> = {
    vehicleName: "차량명",
    vehicleTrim: "트림",
    totalVehiclePrice: mode === "알 수 없음" ? "예산" : "총 차량가",
    promotionOrDiscount: "프로모션/할인",
    downPayment: "선납금",
    deposit: "보증금",
    contractMonths: "계약 기간",
    interestRate: "금리",
    residualValue: "잔존가치",
    maturityOptions: "만기 선택",
    monthlyPayment: mode === "장기렌트" ? "월 렌트료" : mode === "알 수 없음" ? "희망 월 납입금" : "월 납입금",
    agreedDistance: "약정거리",
    insuranceIncluded: "보험 포함 여부",
    deliveryAvailability: "출고 가능 여부",
    registrationFeesNote: "등록비/부대비용 메모",
    customerConditionNote: "고객 요청사항 메모",
  };
  return labels[field];
}

export function financeFieldPlaceholder(field: FinanceFieldId, mode: FinanceProductMode): string {
  if (field === "totalVehiclePrice" && mode === "알 수 없음") return "예: 4,000만원 내외";
  if (field === "monthlyPayment" && mode === "알 수 없음") return "예: 70만원 이하";
  if (field === "downPayment" && mode === "할부") return "예: 300만원";
  return FINANCE_FIELD_PLACEHOLDERS[field] ?? "";
}

/** 금융 방식별 기본 입력 필드(상세 접기 영역 제외) */
export function financeFieldsForMode(mode: FinanceProductMode): FinanceFieldId[] {
  switch (mode) {
    case "알 수 없음":
      return ["vehicleName", "vehicleTrim", "totalVehiclePrice", "monthlyPayment", "customerConditionNote"];
    case "할부":
      return [
        "vehicleName",
        "vehicleTrim",
        "totalVehiclePrice",
        "promotionOrDiscount",
        "downPayment",
        "contractMonths",
        "interestRate",
        "monthlyPayment",
        "customerConditionNote",
      ];
    case "리스":
      return [
        "vehicleName",
        "vehicleTrim",
        "totalVehiclePrice",
        "promotionOrDiscount",
        "downPayment",
        "deposit",
        "contractMonths",
        "residualValue",
        "maturityOptions",
        "monthlyPayment",
        "customerConditionNote",
      ];
    case "장기렌트":
      return [
        "vehicleName",
        "vehicleTrim",
        "totalVehiclePrice",
        "deposit",
        "downPayment",
        "contractMonths",
        "agreedDistance",
        "insuranceIncluded",
        "monthlyPayment",
        "customerConditionNote",
      ];
    case "현금":
      return [
        "vehicleName",
        "vehicleTrim",
        "totalVehiclePrice",
        "promotionOrDiscount",
        "deliveryAvailability",
        "registrationFeesNote",
        "customerConditionNote",
      ];
    default:
      return ["vehicleName", "vehicleTrim", "customerConditionNote"];
  }
}

export function defaultFinanceDraft(): FinanceConditionDraft {
  return { productMode: "알 수 없음" };
}
