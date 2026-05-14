import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { crmSectionToHash } from "@/app/crm/crmSectionTypes";

/**
 * 자동차 금융 컨설턴트 목차(/toc) 카드 → CRM 앱 섹션 매핑.
 * hash는 항상 crmSectionToHash / hashToCrmSection 과 일치하는 값만 사용합니다.
 *
 * 04 금융 조건·메모: 전용 finance 섹션 해시가 없으므로 고객관리(customers)로 연결합니다.
 *    고객 상세 패널의 금융·메모 블록(#crm-block-budget 등)으로의 딥링크는 추후 쿼리/상태로 확장 가능합니다.
 *
 * 08 템플릿 관리: 템플릿 UI는 고객 워크스페이스 탭 안에 있으므로 customers로 진입합니다.
 *    템플릿 탭 자동 전환은 추후 확장합니다.
 */
export const FINANCE_TOC_STEP_TARGETS: ReadonlyArray<{
  step: string;
  label: string;
  section: CrmSection;
  ariaLabel: string;
}> = [
  {
    step: "01",
    label: "리드 목록 · 검색",
    section: "customers",
    ariaLabel: "리드 목록 · 검색: 고객관리(고객 목록) 화면으로 이동",
  },
  {
    step: "02",
    label: "상담 고객 요약",
    section: "consulting",
    ariaLabel: "상담 고객 요약: 상담 메모 화면으로 이동",
  },
  {
    step: "03",
    label: "고객·차량 정보",
    section: "vehicle",
    ariaLabel: "고객·차량 정보: 차량 매칭 화면으로 이동",
  },
  {
    step: "04",
    label: "금융 조건·메모",
    section: "customers",
    ariaLabel: "금융 조건·메모: 고객관리 화면으로 이동",
  },
  {
    step: "05",
    label: "금융 안내 문구",
    section: "ai",
    ariaLabel: "금융 안내 문구: AI 비서(검토용 초안) 화면으로 이동",
  },
  {
    step: "06",
    label: "금융 다음 안내",
    section: "followup",
    ariaLabel: "금융 다음 안내: 사후관리 화면으로 이동",
  },
  {
    step: "07",
    label: "상담 · 출고 일정",
    section: "followup",
    ariaLabel: "상담 · 출고 일정: 사후관리 화면으로 이동",
  },
  {
    step: "08",
    label: "템플릿 관리",
    section: "customers",
    ariaLabel: "템플릿 관리: 고객관리 화면으로 이동",
  },
  {
    step: "09",
    label: "실적 요약 · 백업",
    section: "dashboard",
    ariaLabel: "실적 요약 · 백업: 요약 대시보드로 이동",
  },
];

export function financeTocAppHref(section: CrmSection): string {
  const h = crmSectionToHash(section);
  return `/?view=app#${h}`;
}
