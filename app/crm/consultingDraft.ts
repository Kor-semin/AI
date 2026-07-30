/**
 * 상담 메모 → 검토용 초안 (근거 기반 추출기)
 *
 * ── 설계 원칙 (위반 시 상담 사실 왜곡이 됩니다) ─────────────────────────
 * 1. 메모에서 실제로 매칭된 원문(quote)이 없으면 어떤 항목도 출력하지 않는다.
 * 2. 고객 카드에 저장된 값은 "메모"와 구분해 source: "card"로 표기한다.
 * 3. 확인되지 않은 항목은 추측해서 채우지 않고 "확인 필요"로 남긴다.
 * 4. 문자 초안은 확인된 사실만 사용하고, 나머지는 영업사원이 채울
 *    플레이스홀더([ ])로 비워 둔다. 금액·일정·금융 조건을 임의 생성하지 않는다.
 * 5. 다음 행동은 설명문이 아니라 바로 실행 가능한 짧은 문장(30자 이내)으로 만든다.
 *
 * 이 모듈은 레거시 aiDemoResponse.ts를 사용하지 않습니다.
 * (레거시 엔진은 메모에 없는 금융·대차·옵션 문단을 생성하는 문제가 있었습니다)
 */
import type { Customer } from "./types";

export type DraftTone = "polite" | "simple" | "friendly";

export type GroundedFact = {
  id: string;
  /** 화면 표시 라벨 */
  label: string;
  /** 정규화된 값 */
  value: string;
  /** 근거 — 메모 원문 발췌 (source가 card면 비어 있음) */
  quote: string;
  source: "memo" | "card";
};

export type MissingField = {
  id: string;
  label: string;
  /** 왜 확인이 필요한지 */
  why: string;
};

export type NextActionItem = {
  /** 30자 이내 실행 문장 */
  title: string;
  /** 이 행동이 나온 근거 */
  basis: string;
};

export type SmsDraft = {
  text: string;
  /** 초안에 실제로 사용된 사실 id */
  usedFactIds: string[];
  /** 영업사원이 반드시 채워야 하는 자리 */
  placeholders: string[];
};

export type GroundedDraft = {
  facts: GroundedFact[];
  missing: MissingField[];
  actions: NextActionItem[];
  sms: SmsDraft;
  /** 메모가 너무 짧아 초안 품질이 낮을 때 */
  thinMemo: boolean;
};

/* ---------- 메모 분해 ---------- */

/** 문장·항목 단위로 자릅니다. 실제 상담 메모는 마침표 없이 ·, 줄바꿈, 쉼표로 나열되는 경우가 많습니다. */
function splitClauses(memo: string): string[] {
  return memo
    .split(/[\n·•]+|(?<=[.!?])\s+/)
    .map((clause) => clause.trim())
    .filter((clause) => clause.length > 0);
}

function clip(text: string, max = 60): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
}

/** 패턴에 맞는 첫 절을 찾아 근거로 돌려줍니다. 없으면 null. */
function findClause(clauses: string[], pattern: RegExp): string | null {
  for (const clause of clauses) {
    if (pattern.test(clause)) return clause;
  }
  return null;
}

/* ---------- 추출 규칙 ----------
 * 각 규칙은 "메모에 이 표현이 있을 때만" 사실을 만듭니다. */

type Rule = {
  id: string;
  label: string;
  pattern: RegExp;
  /** 매칭된 절에서 표시값을 만듭니다. */
  value: (clause: string) => string;
};

/** 관심 조건 — 고객이 중요하다고 말한 것 */
const PRIORITY_RULES: Rule[] = [
  { id: "ride", label: "우선 조건", pattern: /승차감|승차 감/, value: () => "승차감" },
  { id: "quiet", label: "우선 조건", pattern: /정숙|조용|소음/, value: () => "정숙성" },
  { id: "safety", label: "우선 조건", pattern: /안전/, value: () => "안전 사양" },
  { id: "fuel", label: "우선 조건", pattern: /연비|유지비/, value: () => "연비·유지비" },
  { id: "space", label: "우선 조건", pattern: /공간|넓|트렁크|[67]\s*인승|카시트/, value: () => "실내·적재 공간" },
  { id: "power", label: "우선 조건", pattern: /출력|가속|퍼포먼스|주행\s*성능/, value: () => "주행 성능" },
  { id: "charge", label: "우선 조건", pattern: /충전|보조금/, value: () => "충전 환경·보조금" },
];

const FACT_RULES: Rule[] = [
  {
    id: "budget",
    label: "예산 · 월 납입",
    pattern: /예산|\d[\d,]*\s*만\s*원?|월\s*\d[\d,]*만|월\s*납입|월납/,
    value: (clause) => {
      const monthly = clause.match(/월\s*[^\d]{0,4}(\d[\d,]*)\s*만/);
      if (monthly) return `월 ${monthly[1]}만 원 수준`;
      const total = clause.match(/(\d[\d,]*)\s*만\s*원?/);
      if (total) return `${total[1]}만 원 내외`;
      return "메모에 예산 언급 있음 (금액 미기재)";
    },
  },
  {
    id: "timing",
    label: "구매 · 출고 시점",
    pattern: /(\d{1,2})\s*월|이번\s*달|다음\s*달|\d\s*개월\s*(이내|안)|연말|즉시|바로|내년|올해/,
    value: (clause) => {
      const month = clause.match(/(\d{1,2})\s*월/);
      if (month) return `${month[1]}월 관련 언급`;
      const within = clause.match(/(\d)\s*개월\s*(이내|안)/);
      if (within) return `${within[1]}개월 이내`;
      if (/즉시|바로/.test(clause)) return "즉시 출고 희망";
      if (/이번\s*달/.test(clause)) return "이번 달";
      if (/다음\s*달/.test(clause)) return "다음 달";
      if (/연말/.test(clause)) return "연말";
      return "시점 언급 있음";
    },
  },
  {
    id: "decider",
    label: "동반 결정자",
    pattern: /아내|남편|배우자|와이프|신랑|가족|부모|어머니|아버지|남자친구|여자친구/,
    value: (clause) => {
      const who = clause.match(/아내|남편|배우자|와이프|신랑|가족|부모|어머니|아버지|남자친구|여자친구/);
      return `${who?.[0] ?? "가족"} 의견 관여`;
    },
  },
  {
    id: "testDrive",
    label: "시승",
    pattern: /시승/,
    value: (clause) => (/희망|원|예약|하고\s*싶/.test(clause) ? "시승 희망" : "시승 언급 있음"),
  },
  {
    id: "color",
    label: "선호 색상",
    pattern: /(흰|하양|화이트|검정|검은|블랙|그레이|회색|파란|블루|은색|실버|빨간|레드)\s*(색|색상)?/,
    value: (clause) => {
      const color = clause.match(/흰|하양|화이트|검정|검은|블랙|그레이|회색|파란|블루|은색|실버|빨간|레드/);
      return `${color?.[0] ?? ""} 계열 선호`.trim();
    },
  },
  {
    id: "usage",
    label: "사용 패턴",
    pattern: /장거리|출장|출퇴근|고속도로|주말|시내|주\s*\d\s*회/,
    value: (clause) => {
      const parts: string[] = [];
      if (/장거리|고속도로/.test(clause)) parts.push("장거리 주행");
      if (/출장/.test(clause)) parts.push("출장");
      if (/출퇴근/.test(clause)) parts.push("출퇴근");
      if (/주말/.test(clause)) parts.push("주말 이용");
      if (/시내/.test(clause)) parts.push("시내 주행");
      const freq = clause.match(/주\s*(\d)\s*회/);
      if (freq) parts.push(`주 ${freq[1]}회`);
      return parts.length > 0 ? parts.join(" · ") : "사용 패턴 언급 있음";
    },
  },
  {
    id: "compare",
    label: "비교 차량",
    pattern: /비교|경쟁|같이\s*보|함께\s*보|고민\s*중|타사/,
    value: () => "비교 검토 중",
  },
  {
    id: "finance",
    label: "금융 조건",
    pattern: /할부|리스|렌트|현금|선수금|캐피탈|금융|이자|잔가/,
    value: (clause) => {
      const parts: string[] = [];
      if (/할부/.test(clause)) parts.push("할부");
      if (/리스/.test(clause)) parts.push("리스");
      if (/렌트/.test(clause)) parts.push("장기렌트");
      if (/현금/.test(clause)) parts.push("현금");
      if (/선수금/.test(clause)) parts.push("선수금");
      if (/잔가/.test(clause)) parts.push("잔가");
      return parts.length > 0 ? `${parts.join(" · ")} 언급` : "금융 조건 언급 있음";
    },
  },
  {
    id: "tradeIn",
    label: "기존 차량",
    pattern: /대차|매각|기존\s*차량|타던|중고\s*(차)?\s*(매입|처리)?/,
    value: () => "기존 차량 처리 언급",
  },
  {
    id: "contactPref",
    label: "연락 선호",
    // 시간 표현만으로는 잡지 않습니다. 통화·연락·전화 의도가 함께 있어야 합니다.
    // (예: "토요일 오후 시승 희망"은 연락 선호가 아니라 시승 항목입니다)
    pattern: /(통화|연락|전화|문자)[^.]{0,12}(가능|어려|선호|부탁|주세요|해\s*달)|(오전|오후|저녁|점심|평일|주말)[^.]{0,10}(통화|연락|전화)/,
    value: (clause) => clip(clause, 34),
  },
  {
    id: "concern",
    label: "우려 · 장애물",
    // 막연한 단어(기간·아직)만으로는 잡지 않습니다.
    pattern: /대기\s*(기간|시간)|납기|걱정|부담|비싸|망설|보류|끊긴|연락이\s*없/,
    value: (clause) => clip(clause, 34),
  },
];

/* ---------- 확인 필요 항목 ---------- */

const MISSING_CANDIDATES: { id: string; label: string; why: string }[] = [
  { id: "budget", label: "예산 · 월 납입 범위", why: "조건 비교와 금융 안내의 기준이 됩니다" },
  { id: "timing", label: "구매 · 출고 희망 시점", why: "재고와 출고 일정 확인에 필요합니다" },
  { id: "model", label: "관심 차종 · 트림", why: "견적과 재고 확인의 출발점입니다" },
  { id: "contactPref", label: "연락 가능한 시간", why: "후속 연락 성공률에 직접 영향을 줍니다" },
];

/* ---------- 다음 행동 ---------- */

const ACTION_FROM_FACT: Record<string, string> = {
  ride: "정숙성·승차감 비교 자료 준비",
  quiet: "정숙성·승차감 비교 자료 준비",
  safety: "안전 사양 비교표 준비",
  fuel: "실연비·유지비 자료 준비",
  space: "2·3열 공간 실측 안내",
  power: "주행 성능 사양 정리",
  charge: "충전 환경·보조금 확인",
  testDrive: "시승 가능 일정 2개 제안",
  decider: "동반 시승 일정 조율",
  color: "선호 색상 재고 확인",
  compare: "비교 차량 항목별 정리",
  finance: "언급된 금융 조건만 재확인",
  tradeIn: "기존 차량 대차 견적 확인",
  usage: "주행 환경 맞춤 사양 확인",
  concern: "우려 사항 해소 자료 준비",
};

const ACTION_FROM_MISSING: Record<string, string> = {
  budget: "예산 범위 확인",
  timing: "구매 시점 확인",
  model: "관심 차종 확인",
  contactPref: "연락 가능 시간 확인",
};

/* ---------- 문자 초안 ---------- */

const TONE_OPEN: Record<DraftTone, (name: string, seller: string) => string> = {
  polite: (name, seller) => `${name}님, 안녕하세요. ${seller}입니다.`,
  simple: (name, seller) => `${name}님 안녕하세요, ${seller}입니다.`,
  friendly: (name, seller) => `${name}님, 안녕하세요! ${seller}입니다.`,
};

const TONE_CLOSE: Record<DraftTone, string> = {
  polite: "편하실 때 짧게 통화 가능하실까요?",
  simple: "통화 가능한 시간 알려주시면 정리해 드리겠습니다.",
  friendly: "편한 시간에 연락 주시면 바로 준비해 두겠습니다!",
};

export function buildSms(
  customerName: string,
  facts: GroundedFact[],
  tone: DraftTone,
  sellerName: string,
): SmsDraft {
  const lines: string[] = [];
  const usedFactIds: string[] = [];
  const placeholders: string[] = [];

  const name = customerName.trim() || "고객";
  lines.push(TONE_OPEN[tone](name, sellerName.trim() || "담당 컨설턴트"));

  // 우선 조건 — 메모에서 확인된 것만 언급.
  // LLM value는 통문장일 수 있으므로 문자에는 항상 정규 명사를 사용합니다.
  const PRIORITY_NOUNS: Record<string, string> = {
    ride: "승차감",
    quiet: "정숙성",
    safety: "안전 사양",
    fuel: "연비·유지비",
    space: "실내 공간",
    power: "주행 성능",
    charge: "충전 환경",
  };
  const priorities = facts.filter((fact) => PRIORITY_NOUNS[fact.id]);
  if (priorities.length > 0) {
    const listed = priorities.slice(0, 2).map((fact) => PRIORITY_NOUNS[fact.id]).join("과 ");
    lines.push(`말씀 주신 ${listed} 부분을 기준으로 확인해 두었습니다.`);
    priorities.slice(0, 2).forEach((fact) => usedFactIds.push(fact.id));
  }

  // 시승은 메모에 있을 때만, 날짜는 임의 생성하지 않고 자리만 비움
  const testDrive = facts.find((fact) => fact.id === "testDrive");
  if (testDrive) {
    lines.push("시승은 [희망 날짜·시간]으로 준비해 드릴 수 있습니다.");
    usedFactIds.push(testDrive.id);
    placeholders.push("희망 날짜·시간");
  }

  // 동반 결정자
  const decider = facts.find((fact) => fact.id === "decider");
  if (decider && testDrive) {
    lines.push("동반하실 분과 함께 오셔도 괜찮습니다.");
    usedFactIds.push(decider.id);
  }

  // 금융은 메모에 언급이 있을 때만, 조건 수치는 넣지 않는다
  const finance = facts.find((fact) => fact.id === "finance");
  if (finance) {
    lines.push("문의하신 조건은 [확인된 조건]으로 정리해서 보여드리겠습니다.");
    usedFactIds.push(finance.id);
    placeholders.push("확인된 조건");
  }

  // 근거가 하나도 없으면 사실을 만들지 않고 짧게 끝낸다
  if (usedFactIds.length === 0) {
    lines.push("상담 내용 정리해서 안내드리려 연락드렸습니다.");
  }

  lines.push(TONE_CLOSE[tone]);

  return { text: lines.join("\n"), usedFactIds, placeholders };
}

/* ---------- 메인 ---------- */

export function buildGroundedDraft(
  memoRaw: string,
  customer: Customer | null,
  options?: { tone?: DraftTone; sellerName?: string },
): GroundedDraft {
  const memo = (memoRaw ?? "").trim();
  const clauses = splitClauses(memo);
  const tone = options?.tone ?? "polite";
  const facts: GroundedFact[] = [];

  // 1) 우선 조건
  for (const rule of PRIORITY_RULES) {
    const clause = findClause(clauses, rule.pattern);
    if (!clause) continue;
    facts.push({ id: rule.id, label: rule.label, value: rule.value(clause), quote: clip(clause), source: "memo" });
  }

  // 2) 일반 사실
  for (const rule of FACT_RULES) {
    const clause = findClause(clauses, rule.pattern);
    if (!clause) continue;
    facts.push({ id: rule.id, label: rule.label, value: rule.value(clause), quote: clip(clause), source: "memo" });
  }

  // 3) 고객 카드에 저장된 값 — 메모와 출처를 구분해 표기
  if (customer) {
    const cardFields: { id: string; label: string; value?: string }[] = [
      { id: "cardModel", label: "관심 차량 (카드)", value: customer.interestedModel },
      { id: "cardCompare", label: "비교 차량 (카드)", value: customer.compareVehicles },
      { id: "cardBudget", label: "예산 (카드)", value: customer.budget },
      { id: "cardTiming", label: "구매 시점 (카드)", value: customer.purchaseTiming },
    ];
    for (const field of cardFields) {
      if (!field.value?.trim()) continue;
      facts.push({ id: field.id, label: field.label, value: field.value.trim(), quote: "", source: "card" });
    }
  }

  return composeDraftFromFacts(memo, customer, facts, { tone, sellerName: options?.sellerName });
}

/**
 * 확인된 사실 목록 → 초안 조립 (결정적).
 * LLM 경로에서도 이 함수를 재사용하므로, 문자·다음 행동·확인 필요 항목은
 * 어떤 엔진을 쓰든 "검증된 사실"에서만 만들어집니다.
 */
export function composeDraftFromFacts(
  memoRaw: string,
  customer: Customer | null,
  factsInput: GroundedFact[],
  options?: { tone?: DraftTone; sellerName?: string },
): GroundedDraft {
  const memo = (memoRaw ?? "").trim();
  const tone = options?.tone ?? "polite";

  // id 중복 제거(먼저 온 것 우선), 카드 사실은 뒤로
  const seenIds = new Set<string>();
  const facts: GroundedFact[] = [];
  for (const fact of [...factsInput.filter((f) => f.source === "memo"), ...factsInput.filter((f) => f.source === "card")]) {
    if (seenIds.has(fact.id)) continue;
    seenIds.add(fact.id);
    facts.push(fact);
  }

  const has = (id: string) => facts.some((fact) => fact.id === id);
  const missing: MissingField[] = MISSING_CANDIDATES.filter((candidate) => {
    if (candidate.id === "budget") return !has("budget") && !has("cardBudget");
    if (candidate.id === "timing") return !has("timing") && !has("cardTiming");
    if (candidate.id === "model") return !has("cardModel");
    return !has(candidate.id);
  });

  const actions: NextActionItem[] = [];
  const seen = new Set<string>();
  const push = (title: string, basis: string) => {
    if (!title || seen.has(title) || actions.length >= 5) return;
    seen.add(title);
    actions.push({ title, basis });
  };
  for (const fact of facts) {
    const title = ACTION_FROM_FACT[fact.id];
    if (title) push(title, fact.source === "memo" ? `메모: ${fact.quote}` : `고객 카드: ${fact.value}`);
  }
  for (const field of missing) {
    const title = ACTION_FROM_MISSING[field.id];
    if (title) push(title, `메모에서 확인되지 않음 · ${field.why}`);
  }

  const sms = customer
    ? buildSms(customer.name, facts, tone, options?.sellerName ?? "")
    : { text: "고객을 선택하면 문자 초안을 만들 수 있습니다.", usedFactIds: [], placeholders: [] };

  return {
    facts,
    missing,
    actions,
    sms,
    thinMemo: memo.replace(/\s+/g, "").length < 15,
  };
}

/* ---------- LLM 결과 검증 ----------
 * LLM은 "추출"만 담당하고, 출력이 실제 메모 원문과 일치하는지 여기서 검증합니다.
 * 검증에 실패한 항목은 조용히 버립니다 — 왜곡보다 누락이 낫습니다. */

/** LLM에 허용하는 사실 id 어휘 (이 밖의 id는 폐기) */
export const FACT_VOCABULARY: Record<string, string> = {
  ride: "우선 조건",
  quiet: "우선 조건",
  safety: "우선 조건",
  fuel: "우선 조건",
  space: "우선 조건",
  power: "우선 조건",
  charge: "우선 조건",
  budget: "예산 · 월 납입",
  timing: "구매 · 출고 시점",
  decider: "동반 결정자",
  testDrive: "시승",
  color: "선호 색상",
  usage: "사용 패턴",
  compare: "비교 차량",
  finance: "금융 조건",
  tradeIn: "기존 차량",
  contactPref: "연락 선호",
  concern: "우려 · 장애물",
};

function normalizeForMatch(text: string): string {
  return text.replace(/[\s⁠]+/g, "").toLowerCase();
}

/** LLM이 낸 사실 후보를 메모 원문 대조로 검증합니다. */
export function verifyQuotedFacts(candidates: unknown, memo: string): GroundedFact[] {
  if (!Array.isArray(candidates)) return [];
  const memoNorm = normalizeForMatch(memo);
  const verified: GroundedFact[] = [];

  for (const item of candidates.slice(0, 20)) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : "";
    const value = typeof record.value === "string" ? record.value.trim() : "";
    const quote = typeof record.quote === "string" ? record.quote.trim() : "";

    if (!FACT_VOCABULARY[id] || !value || !quote) continue;
    if (value.length > 60 || quote.length > 120) continue;
    // 핵심 검증: 인용문이 실제 메모에 존재해야 함
    if (!memoNorm.includes(normalizeForMatch(quote))) continue;

    verified.push({ id, label: FACT_VOCABULARY[id], value: clip(value, 40), quote: clip(quote), source: "memo" });
  }
  return verified;
}

/* ---------- 레거시 호환 어댑터 ----------
 * 기존 CRM(CRMApp)·차량 매칭 화면이 쓰던 {summary, nextAction, message} 형태를
 * 근거 기반 초안으로 만들어 돌려줍니다. aiDemoResponse의 상용 문구는 사용하지 않습니다. */

export type LegacyConsultingResponse = { summary: string; nextAction: string; message: string };

function mapLegacyStyle(style?: string): DraftTone {
  if (style === "simple") return "simple";
  if (style === "friendly" || style === "active") return "friendly";
  return "polite"; // polite · premium · 기타
}

export function generateGroundedConsultingResponse(
  inputRaw: string,
  options?: { salesStyle?: string; customerName?: string; sellerName?: string },
): LegacyConsultingResponse {
  // 레거시 재생성 로직이 붙이는 보이지 않는 salt(U+2060) 제거
  const memo = (inputRaw ?? "").replace(/⁠+/g, "").trim();
  const pseudoCustomer = { name: options?.customerName?.trim() || "고객" } as Customer;
  const draft = buildGroundedDraft(memo, pseudoCustomer, {
    tone: mapLegacyStyle(options?.salesStyle),
    sellerName: options?.sellerName ?? "",
  });

  const memoFacts = draft.facts.filter((fact) => fact.source === "memo");
  const summaryLines =
    memoFacts.length === 0
      ? ["메모에서 확인된 항목이 없습니다. 내용을 추측해 채우지 않았습니다."]
      : memoFacts.map((fact) => `· ${fact.label}: ${fact.value} (근거 “${fact.quote}”)`);
  if (draft.missing.length > 0) {
    summaryLines.push(`확인 필요: ${draft.missing.map((field) => field.label).join(", ")}`);
  }

  const actionLines =
    draft.actions.length === 0
      ? ["제안할 행동이 없습니다."]
      : draft.actions.map((action, index) => `${String(index + 1).padStart(2, "0")} ${action.title}`);

  return {
    summary: summaryLines.join("\n"),
    nextAction: actionLines.join("\n"),
    message: draft.sms.text,
  };
}
