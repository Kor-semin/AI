import type { Customer, PaymentType } from "./types";

export type MemoFeedback = {
  bullets: string[];
  nextQuestions: string[];
  risks: string[];
};

function norm(s: string) {
  return s.toLowerCase();
}

/** 규칙 기반 가벼운 피드백(LLM 없음) */
export function getMemoFeedback(c: Customer): MemoFeedback {
  const blob = norm(`${c.memo ?? ""} ${c.budget ?? ""} ${c.paymentNotes ?? ""} ${c.comparisonNotes ?? ""}`);
  const bullets: string[] = [];
  const nextQuestions: string[] = [];
  const risks: string[] = [];

  const payment = c.paymentType as PaymentType | undefined;
  if (payment === "리스" || payment === "장기렌트") {
    bullets.push("리스/장기렌트면 잔가·약정거리·초과거리 요금을 짧게 확인하는 게 좋아요.");
    nextQuestions.push("약정 기간(36/48/60개월)과 연간 주행거리는 어느 정도인가요?");
  }
  if (payment === "할부") {
    bullets.push("할부면 선납·기간·금리(캐시백 포함) 3가지만 정리하면 상담이 빨라져요.");
    nextQuestions.push("월 납입 가능 한도(대략)는 어느 정도인가요?");
  }
  if (payment === "현금") {
    bullets.push("현금이면 즉시 출고/명의 이전 일정만 맞추면 됩니다.");
  }

  if (!c.interestedModel?.trim()) {
    nextQuestions.push("희망 차종(브랜드 포함)을 한 줄로만 정해 주실 수 있을까요?");
  }
  if (!c.budget?.trim()) {
    nextQuestions.push("총예산(또는 월 납입) 범위를 숫자로 알려 주실 수 있을까요?");
  }
  if (!c.phone?.trim()) {
    nextQuestions.push("연락 가능한 번호(또는 카톡)를 남겨 주실 수 있을까요?");
  }

  if (blob.includes("급") || blob.includes("빨리") || blob.includes("당일")) {
    bullets.push("일정이 급하면 ‘가능한 출고일’과 ‘타협 가능한 옵션’을 먼저 묶어두면 협상이 수월해요.");
    risks.push("급한 일정은 재고·등록 절차에 따라 변수가 생길 수 있어요.");
  }
  if (blob.includes("대차") || blob.includes("폐차")) {
    nextQuestions.push("대차/폐차 예상가와 잔존 할부가 있나요?");
  }
  if (blob.includes("전손") || blob.includes("침수") || blob.includes("사고")) {
    risks.push("사고/침수 이력은 성능점검 기록과 보험 이력을 같이 보는 게 안전합니다.");
  }
  if (blob.includes("리스") && blob.includes("승계")) {
    nextQuestions.push("리스 승계면 잔여 개월·보증금·인수비용을 숫자로 확인해 주세요.");
  }

  if (c.stage === "신규 문의") {
    bullets.push("지금 단계에선 ‘차종·예산·납기’만 잡아도 다음 상담이 쉬워집니다.");
  }
  if (c.stage === "시승 예정") {
    bullets.push("시승 전에 운전 패턴(출퇴근/고속)과 주차 환경을 한 번만 물어보면 차급 추천이 좋아져요.");
  }
  if (c.stage === "견적 발송") {
    bullets.push("견적 단계에선 ‘총액 vs 월납’ 두 가지 버전으로 비교하면 고객이 결정하기 쉽습니다.");
  }

  if (bullets.length === 0) bullets.push("메모에 숫자·일정·금융 키워드를 조금만 더 적으면 다음 액션이 더 구체적으로 나와요.");

  if (nextQuestions.length === 0) {
    nextQuestions.push("출고 희망일(대략)과 색상/옵션 우선순위를 알려 주실 수 있을까요?");
  }

  return { bullets, nextQuestions, risks };
}
