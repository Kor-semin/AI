import type { Customer } from "./types";

/** 참고용 — 실제 거래 결과가 아니라 입력 내용만으로 규칙 계산합니다. */
export type LeadScoreResult = {
  percent: number;
  grade: "S" | "A" | "B" | "C";
  hints: string[];
};

/** 가망 점수에 반영되는 키워드(메모·예산·관심차종 텍스트에서 매칭) */
export const LEAD_SCORE_HOTWORDS = [
  "계약",
  "출고",
  "견적",
  "시승",
  "예산",
  "할부",
  "리스",
  "방문",
  "카카오",
  "전화",
  "급",
  "예약",
  "내일",
] as const;

type ScoreParts = {
  percent: number;
  grade: "S" | "A" | "B" | "C";
  hints: string[];
  breakdown: string[];
};

function computeLeadScoreParts(
  customer: Pick<Customer, "memo" | "phone" | "email"> & {
    budget?: string;
    interestedModel?: string;
  },
): ScoreParts {
  const hints: string[] = [];
  const breakdown: string[] = [];
  let p = 45;
  breakdown.push("기본 45점에서 시작합니다(리드만 있어도 중간 정도).");

  const blob = `${customer.memo ?? ""} ${customer.budget ?? ""} ${customer.interestedModel ?? ""}`.toLowerCase();

  if (customer.phone?.trim()) {
    p += 8;
    hints.push("연락처 있음");
    breakdown.push("전화번호가 있으면 +8점");
  }
  if (customer.email?.trim()) {
    p += 5;
    hints.push("이메일 있음");
    breakdown.push("이메일이 있으면 +5점");
  }
  if ((customer.memo?.length ?? 0) >= 80) {
    p += 10;
    hints.push("메모가 구체적");
    breakdown.push("메모가 80자 이상이면 +10점(상담 내용이 구체적)");
  } else if ((customer.memo?.length ?? 0) >= 25) {
    p += 5;
    breakdown.push("메모가 25자 이상이면 +5점");
  }

  let hot = 0;
  const matched: string[] = [];
  for (const w of LEAD_SCORE_HOTWORDS) {
    if (blob.includes(w)) {
      hot++;
      matched.push(w);
    }
  }
  const hotPts = Math.min(28, hot * 4);
  p += hotPts;
  if (matched.length) {
    breakdown.push(
      `핵심 키워드 매칭: ${matched.slice(0, 8).join(", ")}${matched.length > 8 ? "…" : ""} → +${hotPts}점(최대 +28)`,
    );
  } else {
    breakdown.push("핵심 키워드(예: 시승/견적/예산 등) 매칭이 없어 이 구간 가점은 없습니다.");
  }

  if (blob.includes("견적") || blob.includes("시승")) {
    p += 6;
    breakdown.push("‘견적’ 또는 ‘시승’이 포함되면 +6점");
  }
  if (blob.includes("계약") || blob.includes("출고")) {
    p += 12;
    breakdown.push("‘계약’ 또는 ‘출고’가 포함되면 +12점");
  }

  const clamped = Math.min(96, Math.max(22, Math.round(p)));
  breakdown.push(`합산 후 ${Math.round(p)}점을 22~96 사이로 조정 → ${clamped}%`);

  const grade: ScoreParts["grade"] =
    clamped >= 82 ? "S" : clamped >= 66 ? "A" : clamped >= 48 ? "B" : "C";
  breakdown.push(`등급: ${grade} (S≥82, A≥66, B≥48, 그 외 C)`);

  if (hints.length === 0) hints.push("내용 추가 시 가중");

  return { percent: clamped, grade, hints, breakdown };
}

export function scorePurchaseIntent(
  customer: Pick<Customer, "memo" | "phone" | "email"> & {
    budget?: string;
    interestedModel?: string;
  },
): LeadScoreResult {
  const { percent, grade, hints } = computeLeadScoreParts(customer);
  return { percent, grade, hints };
}

/** UI용: 점수가 어떻게 나왔는지 줄글 설명 */
export function explainPurchaseIntent(
  customer: Pick<Customer, "memo" | "phone" | "email"> & {
    budget?: string;
    interestedModel?: string;
  },
): LeadScoreResult & { breakdown: string[] } {
  const parts = computeLeadScoreParts(customer);
  return {
    percent: parts.percent,
    grade: parts.grade,
    hints: parts.hints,
    breakdown: parts.breakdown,
  };
}
