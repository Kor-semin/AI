import { NextResponse } from "next/server";

import {
  buildGroundedDraft,
  composeDraftFromFacts,
  FACT_VOCABULARY,
  type DraftTone,
  type GroundedFact,
  verifyQuotedFacts,
} from "@/app/crm/consultingDraft";
import type { Customer } from "@/app/crm/types";

/**
 * 상담 메모 → 검토용 초안 (LLM 경로)
 *
 * 보안·정확성 원칙:
 * - OPENAI_API_KEY는 이 서버 라우트에서만 읽습니다. 브라우저에 절대 노출되지 않습니다.
 * - LLM의 역할은 "메모에서 사실 추출"까지입니다. 추출 결과는 verifyQuotedFacts로
 *   메모 원문과 대조해 검증하고, 검증 실패 항목은 버립니다.
 * - 문자 초안·다음 행동·확인 필요 항목은 검증된 사실에서 결정적으로 조립합니다
 *   (composeDraftFromFacts). 따라서 LLM이 무슨 답을 하든 왜곡된 문장이 고객에게
 *   전달될 경로가 없습니다.
 * - 키가 없거나 호출이 실패하면 규칙 기반(buildGroundedDraft)으로 폴백합니다.
 */

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const MEMO_MAX = 4000;

type RequestBody = {
  memo?: unknown;
  tone?: unknown;
  sellerName?: unknown;
  customer?: unknown;
};

function asTrimmedString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseCustomer(value: unknown): Customer | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const name = asTrimmedString(record.name, 40);
  if (!name) return null;
  // 초안 조립에 필요한 필드만 받습니다(연락처 등 불필요 정보는 서버로 보내지 않는 전제).
  return {
    name,
    interestedModel: asTrimmedString(record.interestedModel, 80) || undefined,
    compareVehicles: asTrimmedString(record.compareVehicles, 120) || undefined,
    budget: asTrimmedString(record.budget, 80) || undefined,
    purchaseTiming: asTrimmedString(record.purchaseTiming, 80) || undefined,
  } as Customer;
}

function buildCardFacts(customer: Customer | null): GroundedFact[] {
  if (!customer) return [];
  const fields: { id: string; label: string; value?: string }[] = [
    { id: "cardModel", label: "관심 차량 (카드)", value: customer.interestedModel },
    { id: "cardCompare", label: "비교 차량 (카드)", value: customer.compareVehicles },
    { id: "cardBudget", label: "예산 (카드)", value: customer.budget },
    { id: "cardTiming", label: "구매 시점 (카드)", value: customer.purchaseTiming },
  ];
  return fields
    .filter((field) => field.value?.trim())
    .map((field) => ({ id: field.id, label: field.label, value: field.value!.trim(), quote: "", source: "card" as const }));
}

const SYSTEM_PROMPT = `당신은 자동차 영업 상담 메모에서 "사실"만 추출하는 도구입니다.

절대 규칙:
1. 메모에 명시적으로 적힌 내용만 추출합니다. 추론·보완·일반화 금지.
2. 각 항목의 quote는 메모에서 그대로 복사한 연속된 원문 조각이어야 합니다. 바꿔 쓰기 금지.
3. 메모에 없는 항목은 출력하지 않습니다. 빈 배열이 정답일 수 있습니다.
4. 금액·날짜·조건을 만들어내지 마십시오.

허용되는 id 목록(이외 id 금지):
${Object.entries(FACT_VOCABULARY).map(([id, label]) => `- ${id}: ${label}`).join("\n")}

놓치기 쉬운 항목 — 다음 표현이 보이면 반드시 추출하십시오:
- decider: 아내·남편·배우자·가족·부모가 의견에 관여한다는 언급 (예: "아내가 승차감 중요하다고 함" → ride와 decider 둘 다)
- testDrive: "시승" 언급 전부
- contactPref: 통화·연락 가능/어려운 시간대 언급
- concern: 대기·납기·가격 부담 등 망설임의 이유
한 문장에서 여러 항목이 나올 수 있으며, 같은 quote를 여러 항목에 써도 됩니다.

출력은 JSON 객체 하나:
{"facts":[{"id":"...","value":"항목 요약(40자 이내)","quote":"메모 원문 조각(120자 이내)"}]}

예시:
메모: "아내가 승차감 중요하다고 함. 오전엔 통화 어려움. 대기 길면 곤란."
출력: {"facts":[
 {"id":"ride","value":"승차감 중시","quote":"아내가 승차감 중요하다고 함"},
 {"id":"decider","value":"아내 의견 관여","quote":"아내가 승차감 중요하다고 함"},
 {"id":"contactPref","value":"오전 통화 어려움","quote":"오전엔 통화 어려움"},
 {"id":"concern","value":"대기 기간 우려","quote":"대기 길면 곤란"}]}`;

async function callOpenAi(apiKey: string, memo: string): Promise<GroundedFact[] | null> {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `상담 메모:\n${memo}` },
      ],
    }),
    // 영업 현장에서 오래 기다리게 하지 않습니다.
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as { facts?: unknown };
    // 핵심: LLM 출력은 반드시 원문 대조 검증을 통과해야 합니다.
    return verifyQuotedFacts(parsed.facts, memo);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const memo = asTrimmedString(body.memo, MEMO_MAX);
  if (!memo) {
    return NextResponse.json({ error: "memo_required" }, { status: 400 });
  }

  const toneRaw = asTrimmedString(body.tone, 16);
  const tone: DraftTone = toneRaw === "simple" || toneRaw === "friendly" ? toneRaw : "polite";
  const sellerName = asTrimmedString(body.sellerName, 40);
  const customer = parseCustomer(body.customer);

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (apiKey) {
    try {
      const llmFacts = await callOpenAi(apiKey, memo);
      if (llmFacts !== null) {
        const draft = composeDraftFromFacts(memo, customer, [...llmFacts, ...buildCardFacts(customer)], {
          tone,
          sellerName,
        });
        return NextResponse.json({ engine: "llm", draft });
      }
    } catch {
      // 아래 규칙 기반 폴백으로 진행
    }
  }

  const draft = buildGroundedDraft(memo, customer, { tone, sellerName });
  return NextResponse.json({ engine: "rules", reason: apiKey ? "llm_unavailable" : "no_api_key", draft });
}
