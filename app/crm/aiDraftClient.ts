"use client";

import { buildGroundedDraft, type DraftTone, type GroundedDraft } from "./consultingDraft";
import type { Customer } from "./types";

/**
 * 검토용 초안 요청 클라이언트.
 * 서버 라우트(/api/ai/consulting-draft)를 먼저 시도하고,
 * 실패하면 기기 내 규칙 기반으로 폴백합니다 — 분석 버튼이 죽는 일은 없습니다.
 */

export type DraftEngine = "llm" | "rules";

export type DraftResult = {
  draft: GroundedDraft;
  engine: DraftEngine;
  /** rules일 때 이유: no_api_key | llm_unavailable | network_error */
  reason?: string;
};

export async function requestConsultingDraft(
  memo: string,
  customer: Customer | null,
  options: { tone: DraftTone; sellerName?: string },
): Promise<DraftResult> {
  try {
    const response = await fetch("/api/ai/consulting-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memo,
        tone: options.tone,
        sellerName: options.sellerName ?? "",
        customer: customer
          ? {
              // 초안 조립에 필요한 최소 필드만 전송(연락처·이메일은 보내지 않음)
              name: customer.name,
              interestedModel: customer.interestedModel,
              compareVehicles: customer.compareVehicles,
              budget: customer.budget,
              purchaseTiming: customer.purchaseTiming,
            }
          : null,
      }),
    });

    if (response.ok) {
      const payload = (await response.json()) as { engine?: DraftEngine; reason?: string; draft?: GroundedDraft };
      if (payload.draft) {
        return { draft: payload.draft, engine: payload.engine === "llm" ? "llm" : "rules", reason: payload.reason };
      }
    }
  } catch {
    /* 네트워크 실패 → 아래 로컬 폴백 */
  }

  return {
    draft: buildGroundedDraft(memo, customer, { tone: options.tone, sellerName: options.sellerName }),
    engine: "rules",
    reason: "network_error",
  };
}

export function engineLabel(result: Pick<DraftResult, "engine" | "reason">): string {
  if (result.engine === "llm") return "AI 분석 (OpenAI)";
  if (result.reason === "no_api_key") return "규칙 기반 분석 (AI 키 미설정)";
  return "규칙 기반 분석";
}
