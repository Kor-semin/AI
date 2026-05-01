import type { Customer, DeliveryGuide } from "@/app/crm/types";
import { deliveryAccountEntered, formatDeliveryAccountShareText } from "@/app/crm/deliveryGuide/formatDeliveryAccount";

function pick(v?: string): string {
  const t = (v ?? "").trim();
  return t ? t : "-";
}

function fmtDate(iso?: string): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  } catch {
    return iso;
  }
}

function serviceSummary(s: Record<string, string | undefined>): string {
  const parts: string[] = [];
  if (s.tintBrand || s.tintGrade) parts.push(`선팅 ${[s.tintBrand, s.tintGrade].filter(Boolean).join(" / ")}`);
  if (s.blackbox) parts.push(`블랙박스 ${s.blackbox}`);
  if (s.hipass) parts.push(`하이패스 ${s.hipass}`);
  if (s.glassCoating) parts.push(`유리막 ${s.glassCoating}`);
  if (s.ppf) parts.push(`PPF ${s.ppf}`);
  if (s.gifts) parts.push(`사은품 ${s.gifts}`);
  return parts.length ? parts.join(" · ") : "-";
}

/** 고객 전달용·내부 검토용 공유 텍스트(이미지 데이터 URL 미포함) */
export function formatDeliveryGuideShareText(customer: Customer, guide: DeliveryGuide): string {
  const pricing = guide.pricing ?? {};
  const services = guide.services ?? {};

  const lines: string[] = [
    "【Sensora 출고 안내서 요약 텍스트】",
    "",
    "■ 고객 기본 정보",
    `고객명: ${customer.name}`,
    `연락처: ${pick(customer.phone)}`,
    `계약일: ${fmtDate(guide.contractDate)}`,
    `출고 예정일: ${fmtDate(guide.deliveryEtaDate)}`,
    `모델명: ${pick(guide.modelName ?? customer.interestedModel)}`,
    `연식: ${pick(guide.modelYear)}`,
    `외장 색상: ${pick(guide.exteriorColor)}`,
    `내장 색상: ${pick(guide.interiorColor)}`,
    `출고 장소: ${pick(guide.deliveryPlace)}`,
    `서비스 품목 요약: ${serviceSummary(services)}`,
    "",
    "■ 서비스 품목",
    `선팅 브랜드: ${pick(services.tintBrand)}`,
    `선팅 등급: ${pick(services.tintGrade)}`,
    `블랙박스: ${pick(services.blackbox)}`,
    `하이패스: ${pick(services.hipass)}`,
    `유리막: ${pick(services.glassCoating)}`,
    `PPF: ${pick(services.ppf)}`,
    `사은품: ${pick(services.gifts)}`,
    "",
    "■ 가격·금융",
    `차량가격: ${pick(pricing.vehiclePrice)}`,
    `옵션비용: ${pick(pricing.optionsPrice)}`,
    `할인금액: ${pick(pricing.discount)}`,
    `최종 적용 가격: ${pick(pricing.finalPrice)}`,
    `금융사: ${pick(pricing.financeCompany)}`,
    `월 납입금: ${pick(pricing.monthlyPayment)}`,
    `초기부담금: ${pick(pricing.upfrontPayment)}`,
  ];

  const imgCount = (guide.images ?? []).length;
  lines.push("", `■ 참고: 시공 예시 이미지 ${imgCount}장(본문에는 이미지 파일이 포함되지 않습니다.)`);

  if (deliveryAccountEntered(guide)) {
    lines.push("", "■ 입금 계좌(고객 발송문 참고)", formatDeliveryAccountShareText(customer.name, guide));
  }

  return lines.join("\n").trim();
}
