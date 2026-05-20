import type { Customer } from "./types";

export type CalendarMiniItemKind = "event" | "next" | "contact" | "delivery";

const AFTERCARE_RE =
  /출고\s*후|안부|정기\s*점검|보험\s*만기|재구매|소개\s*요청|시즌\s*케어|AS\s*안내/i;
const DELIVERY_PREP_RE = /출고\s*일정|출고\s*전|차량\s*인도|인도\s*준비|출고\s*안내|출고\s*예정/i;
const CONTRACT_PREP_RE =
  /계약\s*전|명의|등록\s*지역|보험\s*가입\s*시점|서류\s*준비|체크리스트/i;
const CONSULTATION_RE =
  /시승|옵션|니즈|견적|예산|상담|카탈로그|방문|프로모션|할부|리스|관심\s*차/i;
const NEXT_ACTION_RE =
  /연락|확인|안내|조율|발송|팔로업|follow/i;

const CONSULTATION_STAGES = new Set([
  "신규 문의",
  "상담 진행",
  "상담 완료",
  "견적 발송",
  "시승 예정",
  "미상담",
  "연락처 가져옴",
]);

/** 미니 캘린더 일정 prefix — nextAction을 사후관리로 고정하지 않음 */
export function getCalendarItemPrefix(
  kind: CalendarMiniItemKind,
  label: string,
  customer?: Customer,
): string {
  if (kind === "event") return "[일정]";
  if (kind === "contact") return "[다음 연락]";
  if (kind === "delivery") return "[출고 준비]";

  const titlePart = label.includes("·") ? label.split("·").slice(1).join("·").trim() : label;
  const hay = `${titlePart} ${customer?.stage ?? ""} ${customer?.memo ?? ""}`;
  const stage = customer?.stage ?? "";

  if (stage === "사후관리" || AFTERCARE_RE.test(hay)) {
    return "[사후관리]";
  }
  if (stage === "출고 대기" || (stage === "출고 완료" && DELIVERY_PREP_RE.test(hay) && !AFTERCARE_RE.test(hay))) {
    return "[출고 준비]";
  }
  if (DELIVERY_PREP_RE.test(hay) && !AFTERCARE_RE.test(hay)) {
    return "[출고 준비]";
  }
  if (stage === "계약 검토" || stage === "계약 완료" || CONTRACT_PREP_RE.test(hay)) {
    return "[계약 준비]";
  }
  if (CONSULTATION_STAGES.has(stage) || CONSULTATION_RE.test(hay)) {
    return "[상담 진행]";
  }
  if (NEXT_ACTION_RE.test(hay)) {
    return "[다음 행동]";
  }
  return "[다음 행동]";
}
