import type { Customer, FinanceProductMode, PaymentType } from "./types";

export type MemoFeedback = {
  bullets: string[];
  nextQuestions: string[];
  risks: string[];
};

function norm(s: string) {
  return s.toLowerCase();
}

function resolveFinanceMode(c: Customer): FinanceProductMode | PaymentType | undefined {
  return c.financeConditionDraft?.productMode ?? c.paymentType;
}

function financeModeBullet(mode: FinanceProductMode | PaymentType | undefined): string | null {
  if (mode === "리스") {
    return "리스 조건은 잔존가치, 보증금, 약정거리, 선납금에 따라 월 납입금이 달라질 수 있습니다.";
  }
  if (mode === "장기렌트") {
    return "장기렌트 조건은 약정거리, 보험 포함 여부, 보증금 조건에 따라 월 납입금이 달라질 수 있습니다.";
  }
  if (mode === "할부") {
    return "할부 조건은 선납금, 기간, 금리에 따라 월 납입금이 달라질 수 있습니다.";
  }
  if (mode === "현금") {
    return "현금 구매는 차량가, 프로모션, 등록 시점에 필요한 비용을 함께 확인하면 좋습니다.";
  }
  return null;
}

/** 규칙 기반 가벼운 피드백(LLM 없음) */
export function getMemoFeedback(c: Customer): MemoFeedback {
  const blob = norm(`${c.memo ?? ""} ${c.budget ?? ""} ${c.paymentNotes ?? ""} ${c.comparisonNotes ?? ""}`);
  const bullets: string[] = [];
  const nextQuestions: string[] = [];
  const risks: string[] = [];

  const mode = resolveFinanceMode(c);
  const modeBullet = financeModeBullet(mode);
  if (modeBullet) bullets.push(modeBullet);

  if (!c.interestedModel?.trim()) {
    nextQuestions.push("희망 차종(브랜드 포함)을 한 줄로만 정해 주실 수 있을까요?");
  }
  if (!c.budget?.trim() && !c.financeConditionDraft?.monthlyPayment?.trim()) {
    nextQuestions.push("총예산(또는 월 납입) 범위를 숫자로 알려 주실 수 있을까요?");
  }
  if (!c.phone?.trim()) {
    nextQuestions.push("연락 가능한 번호(또는 카톡)를 남겨 주실 수 있을까요?");
  }

  if (mode === "리스" || mode === "장기렌트") {
    nextQuestions.push("약정 기간(36/48/60개월)과 연간 주행거리는 어느 정도인가요?");
  }
  if (mode === "할부") {
    nextQuestions.push("월 납입 가능 한도(대략)는 어느 정도인가요?");
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
