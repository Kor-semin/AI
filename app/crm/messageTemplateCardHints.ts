import { hasMeaningfulFinanceDraft, isFinanceAwareTemplateTitle } from "./financeAwareMessageTemplate";
import type { Customer } from "./types";

/** 상황별 문자 초안 카드 하단 설명(제목 기준, 기존 저장 데이터 호환) */
const MESSAGE_TEMPLATE_CARD_HINTS: Record<string, string> = {
  "중고 매입·대차 문의": "차량 상태 확인 후 대략적인 감가를 안내합니다.",
  "첫 인사·상담 예약": "문의 고객에게 첫 안내와 상담 일정을 제안합니다.",
  "첫 인사/상담 예약": "문의 고객에게 첫 안내와 상담 일정을 제안합니다.",
  "견적 발송 후 팔로업": "견적 확인 이후 옵션·프로모션·납기를 다시 안내합니다.",
  "시승·매장 방문 안내": "방문 시간과 시승 준비사항을 부드럽게 안내합니다.",
  "할부 조건 확인": "선납금·기간·월 납입 기준을 확인합니다.",
  "리스·장기렌트 안내": "약정거리와 인수 조건을 기준으로 비교 안내합니다.",
  "현금·즉시 출고": "재고와 색상·옵션 가능 조건을 빠르게 확인합니다.",
  "계약 전 체크리스트": "명의·등록·보험·출고 전 확인사항을 정리합니다.",
};

export function getMessageTemplateCardHint(title: string, customer?: Customer | null): string {
  const key = title.trim();
  if (customer && hasMeaningfulFinanceDraft(customer) && isFinanceAwareTemplateTitle(key)) {
    return "입력된 금융 조건을 반영해 검토용 문구를 만듭니다.";
  }
  return MESSAGE_TEMPLATE_CARD_HINTS[key] ?? "";
}
