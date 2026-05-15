import type { Customer, FinanceConditionDraft } from "./types";
import type { TranslationKey } from "@/lib/i18n";
import { buildUsedCarSearchQuery } from "./recommendations";

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

const NEEDS_BLURB: Record<string, string> = {
  "월 납입금 부담 최소화": "월 납입 기준으로 조건을 나란히 비교해 말씀드리겠습니다.",
  "초기 비용 최소화": "선납금·보증금 등 초기 비용을 중심으로 정리해 말씀드리겠습니다.",
  "총 비용 확인": "총 납입 부담을 함께 확인하실 수 있도록 정리하겠습니다.",
  "빠른 출고": "출고 가능 시점은 재고·생산 상황에 따라 달라질 수 있어 상담 시점 기준 확인이 필요합니다.",
  "법인 비용처리": "법인 사용 목적에 맞는 조건을 중심으로 검토 포인트를 안내드리겠습니다.",
  "가족 사용": "실사용 목적(동승·공간 등)을 고려한 구성을 함께 보겠습니다.",
  "장기 보유": "장기 보유 관점에서 할부·소유 방식 차이를 함께 설명드리겠습니다.",
  "만기 인수 가능성": "리스의 경우 만기 선택지와 잔존가치를 중심으로 말씀드리겠습니다.",
  "프로모션 혜택 확인": "프로모션·혜택은 시점에 따라 변동될 수 있어 견적서 기준으로 다시 확인드리겠습니다.",
};

function fmt(v?: string): string {
  return v && String(v).trim() ? String(v).trim() : "";
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

/** 금융 조건·니즈·(선택 시) 견적서 첨부 안내 문구가 포함된 검토용 신차 문자 초안 */
export function buildNewCarFinanceSmsPreview(c: Customer, t: (key: TranslationKey) => string): string {
  const fd = c.financeConditionDraft;
  if (!fd?.productMode) return "";

  const name = c.name?.trim() || "고객";
  const vehicle = fmt(fd.vehicleName) || buildUsedCarSearchQuery(c);
  const chunks: string[] = [];

  if (fd.productMode === "리스") {
    chunks.push(
      `${name} 고객님, 문의주신 차량 리스 조건을 기준으로 정리드립니다.\n` +
        `현재 견적 기준으로 월 납입금은 약 ${fmt(fd.monthlyPayment) || "○○"}원으로 이해하고 있으며, 계약기간·잔존가치·보증금·선납금 조건에 따라 달라질 수 있습니다.\n` +
        `리스는 월 부담과 만기 선택지(반납·인수·연장 검토 등)를 함께 보시는 것이 좋습니다.`,
    );
  } else if (fd.productMode === "할부") {
    chunks.push(
      `${name} 고객님, 문의주신 차량 할부 조건을 기준으로 정리드립니다.\n` +
        `선수금과 할부 기간에 따라 월 납입금이 달라질 수 있으며, 장기 보유를 고려하신다면 총 납입 부담과 월 부담을 함께 비교해보시는 것이 좋습니다.\n` +
        `고객님께서 중요하게 보신 월 납입 기준에 맞춰 리스 조건과도 함께 비교해드리겠습니다.`,
    );
  } else if (fd.productMode === "알 수 없음") {
    chunks.push(
      `${name} 고객님, 문의 주신 견적 내용을 기준으로 금융 방식과 조건을 함께 확인하며 정리드립니다.\n` +
        `견적서상 표기만으로는 리스·할부 등이 명확하지 않을 수 있어, 월 납입 부담·초기 비용·잔존가치·계약기간을 상담 시점 기준으로 다시 확인드리겠습니다.`,
    );
  } else if (fd.productMode === "현금") {
    chunks.push(
      `${name} 고객님, 문의주신 차량 현금 조건을 기준으로 정리드립니다.\n` +
        `총 차량가와 프로모션·할인 적용 여부에 따라 실 납입 금액은 달라질 수 있습니다.`,
    );
  } else {
    chunks.push(
      `${name} 고객님, 장기렌트 검토를 함께 정리드립니다.\n` +
        `법인·개인 목적에 따라 적합한 설명이 달라질 수 있어 상담을 통해 확인드리겠습니다.`,
    );
  }

  if (vehicle) chunks.push(`문의 차량(또는 관심 모델): ${vehicle}`);
  const trim = fmt(fd.vehicleTrim);
  if (trim) chunks.push(`트림: ${trim}`);

  const detailLines: string[] = [];
  if (fmt(fd.totalVehiclePrice)) detailLines.push(`총 차량가(참고): ${fmt(fd.totalVehiclePrice)}`);
  if (fmt(fd.promotionOrDiscount)) detailLines.push(`프로모션/할인: ${fmt(fd.promotionOrDiscount)}`);
  if (fmt(fd.downPayment)) detailLines.push(`선납금: ${fmt(fd.downPayment)}`);
  if (fmt(fd.deposit)) detailLines.push(`보증금: ${fmt(fd.deposit)}`);
  if (fmt(fd.contractMonths)) detailLines.push(`계약기간: ${fmt(fd.contractMonths)}`);
  if (fmt(fd.residualValue)) detailLines.push(`잔존가치(리스): ${fmt(fd.residualValue)}`);
  if (fmt(fd.monthlyPayment) && fd.productMode !== "리스") detailLines.push(`월 납입금(참고): ${fmt(fd.monthlyPayment)}`);
  if (fmt(fd.maturityOptions)) detailLines.push(`만기 선택지 검토: ${fmt(fd.maturityOptions)}`);
  if (fmt(fd.customerConditionNote)) detailLines.push(`기타 확인 사항: ${fmt(fd.customerConditionNote)}`);
  if (detailLines.length) chunks.push(detailLines.join("\n"));

  const needs = c.customerPriorityNeeds ?? [];
  if (needs.length) {
    chunks.push(
      "고객님께서 중요하게 보신 기준을 반영해 다음을 중심으로 안내드리겠습니다.\n" +
        needs.map((n) => `· ${n}: ${NEEDS_BLURB[n] ?? "상담 시 비중을 두고 다시 정리해드리겠습니다."}`).join("\n"),
    );
  }

  if (c.smsDraftIncludeEstimateWording) {
    chunks.push(t("crm.newCar.smsAttachCommonIntro"));
    if (fd.productMode === "리스") {
      chunks.push(t("crm.newCar.smsAttachLeaseNote"));
    } else if (fd.productMode === "할부") {
      chunks.push(t("crm.newCar.smsAttachLoanNote"));
    } else {
      chunks.push(t("crm.newCar.smsAttachGenericNote"));
    }
    chunks.push(t("crm.newCar.smsAttachClosing"));
  }

  chunks.push(t("crm.newCar.smsPreviewClosingDisclaimer"));

  return chunks.join("\n\n");
}

/** 상담 요약·고객 메시지(빠른 초안) — 신차 상담 톤 */
export function buildConsultationQuickDraft(c: Customer, myName: string): string {
  const lines: string[] = [];
  lines.push(`안녕하세요 ${c.name}님. ${myName}입니다.`);
  const q = buildUsedCarSearchQuery(c);
  const vname = c.financeConditionDraft?.vehicleName?.trim();
  if (vname || q) lines.push(`문의 주신 차량·조건: ${vname || q}`);

  const mp = c.marketPrice;
  if (mp?.encarMin?.trim() || mp?.encarMax?.trim()) {
    const mn = mp.encarMin?.trim();
    const mx = mp.encarMax?.trim();
    const asOf = mp.asOf?.trim() || "상담 시점";
    if (mn && mx) {
      lines.push(
        `비교를 위해 확인해 둔 금액 범위는 약 ${mn} ~ ${mx}입니다(기준: ${asOf}). 신차·금융 조건에 따라 달라질 수 있어 견적서 기준으로 다시 안내드리겠습니다.`,
      );
    } else if (mn) {
      lines.push(
        `비교를 위해 확인해 둔 하한 참고값은 약 ${mn}입니다(기준: ${asOf}). 최종 조건은 견적서와 금융 승인 기준에 따라 다시 확인드리겠습니다.`,
      );
    } else if (mx) {
      lines.push(
        `비교를 위해 확인해 둔 상한 참고값은 약 ${mx}입니다(기준: ${asOf}). 최종 조건은 견적서와 금융 승인 기준에 따라 다시 확인드리겠습니다.`,
      );
    }
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

export function defaultFinanceDraft(): FinanceConditionDraft {
  return { productMode: "리스" };
}
