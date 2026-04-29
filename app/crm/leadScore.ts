import type { Customer } from "./types";

/** 참고용 — 실제 거래 결과가 아니라 입력 내용만으로 규칙 계산합니다. */
export type LeadScoreResult = {
  percent: number;
  grade: "S" | "A" | "B" | "C";
  hints: string[];
};

const HOTWORDS = [
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
];

export function scorePurchaseIntent(customer: Pick<Customer, "memo" | "phone" | "email"> & {
  budget?: string;
  interestedModel?: string;
}): LeadScoreResult {
  const hints: string[] = [];
  let p = 45;
  const blob = `${customer.memo ?? ""} ${customer.budget ?? ""} ${customer.interestedModel ?? ""}`.toLowerCase();

  if (customer.phone?.trim()) {
    p += 8;
    hints.push("연락처 있음");
  }
  if (customer.email?.trim()) {
    p += 5;
    hints.push("이메일 있음");
  }
  if ((customer.memo?.length ?? 0) >= 80) {
    p += 10;
    hints.push("메모가 구체적");
  } else if ((customer.memo?.length ?? 0) >= 25) {
    p += 5;
  }

  let hot = 0;
  for (const w of HOTWORDS) {
    if (blob.includes(w)) hot++;
  }
  p += Math.min(28, hot * 4);

  if (blob.includes("견적") || blob.includes("시승")) p += 6;
  if (blob.includes("계약") || blob.includes("출고")) p += 12;

  p = Math.min(96, Math.max(22, Math.round(p)));

  const grade =
    p >= 82 ? "S" : p >= 66 ? "A" : p >= 48 ? "B" : "C";

  if (hints.length === 0) hints.push("내용 추가 시 가중");

  return { percent: p, grade, hints };
}
