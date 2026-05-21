import {
  ESTIMATE_GUIDE_TEMPLATE_TITLE,
  hasMeaningfulFinanceDraft,
  isEstimateGuideTemplateTitle,
} from "./financeAwareMessageTemplate";
import type { Customer } from "./types";

/** 상황별 문자 초안 카드 하단 설명(제목 기준, 기존 저장 데이터 호환) */
const MESSAGE_TEMPLATE_CARD_HINTS: Record<string, string> = {
  "중고 매입·대차 문의": "차량 상태 확인 후 대략적인 감가를 안내합니다.",
  "첫 인사·상담 예약": "문의 고객에게 첫 안내와 상담 일정을 제안합니다.",
  "첫 인사/상담 예약": "문의 고객에게 첫 안내와 상담 일정을 제안합니다.",
  "견적 안내 문자": "차량·금융 조건을 입력하면 견적 안내 문자가 더 구체적으로 정리됩니다.",
  "견적 발송 후 팔로업": "견적 확인 이후 옵션·프로모션·출고 일정을 다시 안내합니다.",
  "시승·매장 방문 안내": "방문 시간과 시승 준비사항을 부드럽게 안내합니다.",
  "계약 전 체크리스트": "명의·등록·보험·출고 전 확인사항을 정리합니다.",
  "프로모션 안내": "진행 중인 프로모션·혜택을 확인 후 안내합니다.",
  "출고 가능 재고 안내": "출고 가능 재고와 옵션 조정 가능 여부를 안내합니다.",
  "재상담 요청": "이전 상담 이후 추가 확인 사항을 다시 정리합니다.",
};

export function getMessageTemplateCardHint(title: string, customer?: Customer | null): string {
  const key = title.trim();
  if (key === ESTIMATE_GUIDE_TEMPLATE_TITLE) {
    if (customer && hasMeaningfulFinanceDraft(customer)) {
      return "입력한 차량명, 금융 방식, 월 납입 조건을 바탕으로 안내 문구를 정리합니다.";
    }
    return MESSAGE_TEMPLATE_CARD_HINTS[key] ?? "";
  }
  if (isEstimateGuideTemplateTitle(key)) {
    return MESSAGE_TEMPLATE_CARD_HINTS[ESTIMATE_GUIDE_TEMPLATE_TITLE] ?? "";
  }
  return MESSAGE_TEMPLATE_CARD_HINTS[key] ?? "";
}
