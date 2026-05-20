import type { Customer } from "./types";

function clampText(s: string, max = 80) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** 데모·예시 데이터 기반 AI 요약 한 줄 (실제 AI 연동 없음) */
export function getDemoAiSummaryLine(c: Customer): string {
  const model = [c.vehicleBrand, c.interestedModel].filter(Boolean).join(" ").toLowerCase();
  const memo = (c.memo ?? "").toLowerCase();

  if (model.includes("쏘렌토") || model.includes("소렌토") || memo.includes("가족") || memo.includes("7인")) {
    return "관심 차량 비교와 가족 이동 편의성을 함께 확인하려는 고객입니다.";
  }
  if (memo.includes("할부") || memo.includes("보험") || memo.includes("첫차") || memo.includes("첫 차")) {
    return "월 납입 부담 완화와 빠른 출고 가능 여부를 중요하게 보고 있습니다.";
  }
  if (c.budget?.trim()) {
    return "월 납입·견적 조건과 출고 일정을 함께 검토하는 고객입니다.";
  }
  if (c.memo?.trim()) {
    return clampText(c.memo.trim(), 72);
  }
  return "상담 메모를 바탕으로 AI 비서가 니즈를 정리한 고객입니다.";
}
