import {
  generateDemoConsultingResponse,
  type DemoConsultingOptions,
  type DemoConsultingResponse,
} from "@/app/components/concierge/aiDemoResponse";
import {
  buildEstimateGuideMessage,
  hasMeaningfulFinanceDraft,
} from "./financeAwareMessageTemplate";
import { parseMoneyToKrw } from "./recommendations";
import type { Customer, FinanceConditionDraft, NextAction, UsedCarAccident, UsedCarInfo } from "./types";

export type QuickConsultationNeeds = {
  vehicle?: string;
  budget?: string;
  timing?: string;
  priorities?: string;
  concerns?: string;
};

export type QuickConsultationResult = {
  needs: QuickConsultationNeeds;
  summary: string;
  message: string;
  nextActions: string[];
  insights: DemoConsultingResponse;
};

export type QuickCustomerIdentity = {
  name?: string;
  vehicle?: string;
};

const KNOWN_MODEL_RE =
  /\b(GLC|GLE|GLS|GLA|GLB|CLA|C-Class|E-Class|S-Class|EQE|EQS|3시리즈|5시리즈|X3|X5|그랜저|쏘렌토|카니발|투싼|아반떼|K\d{1,2}|EV\d{1,2})\b/i;

const BRAND_ONLY_RE =
  /^(?:Mercedes[\s-]*Benz|Mercedes-Benz|메르세데스|벤츠|BMW|Audi|아우디|폭스바겐|Volkswagen|렉서스|Lexus|제네시스|Genesis|현대|기아)$/i;

/** 데모·표시용 기아 Sorento 표기 통일(사용자 직접 입력 원문은 저장 시 그대로). */
export function normalizeKoreanVehicleSpelling(text: string): string {
  return text.replace(/소렌토/g, "쏘렌토");
}

const HANGUL_NAME_RE = /^[가-힣]{2,6}$/;
const MODEL_LINE_RE = /^[A-Za-z][A-Za-z0-9.\-\s]{0,24}$/;

/** 입력·AI 후보에서 브랜드 단독 대신 모델명 우선(GLC 등). */
export function normalizeInterestVehicle(memo: string, candidate?: string): string | undefined {
  const model = extractPreferredVehicleModel(memo);
  if (model) return model;

  const c = candidate?.trim();
  if (!c) return undefined;
  if (BRAND_ONLY_RE.test(c)) return undefined;

  const fromCandidate = c.match(KNOWN_MODEL_RE);
  if (fromCandidate) return fromCandidate[0];

  if (c.length <= 32 && !BRAND_ONLY_RE.test(c) && !/클래스\s*상담|라인업|기타/i.test(c)) {
    return normalizeKoreanVehicleSpelling(c);
  }
  return undefined;
}

/** 관심 신차(보유·대차 차량 문장 제외). */
export function extractInterestVehicleFromMemo(memo: string): string | undefined {
  const raw = memo.trim();
  if (!raw) return undefined;

  const labeled = raw.match(/관심\s*차량(?:은|이|:\s*)?([^\n。]+)/i);
  if (labeled?.[1]) {
    let v = labeled[1]
      .trim()
      .replace(/이고.*$/i, "")
      .replace(/이며.*$/i, "")
      .replace(/[,，].*$/, "")
      .trim();
    v = v.replace(/\s*(?:가족|주말|월|할부|리스).*$/i, "").trim();
    if (v) return normalizeKoreanVehicleSpelling(v);
  }

  for (const line of raw.split(/\n+/)) {
    if (/보유\s*차량|현재\s*보유|매입가/i.test(line)) continue;
    if (/관심\s*차량|쏘렌토|하이브리드/i.test(line)) {
      const hybrid = line.match(/쏘렌토\s*하이브리드/i);
      if (hybrid) return normalizeKoreanVehicleSpelling(hybrid[0]);
      const sorento = line.match(/쏘렌토/i);
      if (sorento) return "쏘렌토";
    }
  }

  return undefined;
}

export function extractPreferredVehicleModel(memo: string): string | undefined {
  const interest = extractInterestVehicleFromMemo(memo);
  if (interest) return interest;

  const raw = memo
    .split(/\n+/)
    .filter((line) => !/보유\s*차량|현재\s*보유/i.test(line))
    .join("\n")
    .trim();
  if (!raw) return undefined;

  const known = raw.match(KNOWN_MODEL_RE);
  if (known) return known[0];

  const combo = raw.match(
    /\b(?:Mercedes[\s-]*Benz|Mercedes-Benz|메르세데스|벤츠)\s*(GLC|GLE|GLS|GLA|GLB|CLA)\b/i,
  );
  if (combo?.[1]) return combo[1].toUpperCase();

  return undefined;
}

type ParsedOwnedVehicle = {
  label: string;
  brand?: string;
  model?: string;
  year?: string;
  mileageKm?: string;
  accident?: UsedCarAccident;
};

function parseOwnedVehicleFromMemo(memo: string): ParsedOwnedVehicle | undefined {
  const raw = memo.trim();
  const line =
    raw.split(/\n+/).find((l) => /보유\s*차량|현재\s*보유/i.test(l)) ??
    (/(?:아우디|Audi)\s*A4/i.test(raw) && /보유|매입/i.test(raw) ? raw : "");

  if (!line) return undefined;

  const brand = /아우디|audi/i.test(line) ? "아우디" : undefined;
  const model = /\bA4\b/i.test(line) ? "A4" : undefined;
  const year = line.match(/(\d{4})\s*년식/)?.[1];
  const mileageKm =
    line.match(/약\s*([\d,.]+)\s*만\s*km/i)?.[0]?.trim() ??
    line.match(/([\d,.]+)\s*km/i)?.[0]?.trim() ??
    (/\b9\s*만\s*km/i.test(line) ? "약 9만 km" : undefined);

  let accident: UsedCarAccident | undefined;
  if (/단순교환/.test(raw)) accident = "단순교환";
  else if (/무사고/.test(raw)) accident = "무사고";
  else if (/사고(?!\s*유무)/.test(raw) && !/무사고/.test(raw)) accident = "사고";

  const parts = [brand, model, year ? `${year}년식` : "", mileageKm, accident].filter(Boolean);
  if (!parts.length) return undefined;

  return { label: parts.join(" · "), brand, model, year, mileageKm, accident };
}

/** 구조화된 상담 메모(관심 차량·보유 차량·금융·다음 연락 등). */
export function isRichStructuredConsultation(memo: string): boolean {
  const raw = memo.trim();
  if (raw.length < 120) return false;
  let score = 0;
  if (/관심\s*차량/i.test(raw)) score += 1;
  if (/보유\s*차량|현재\s*보유/i.test(raw)) score += 1;
  if (/할부|리스/i.test(raw) && /비교|확정하지\s*않/i.test(raw)) score += 1;
  if (/다음\s*연락|토요일|통화/i.test(raw)) score += 1;
  if (/가족|7인승|공간|연비/i.test(raw)) score += 1;
  if (/월\s*납입|초기\s*비용/i.test(raw)) score += 1;
  return score >= 4;
}

function extractRichFinanceNote(memo: string): string | undefined {
  if (/할부.*리스|리스.*할부/i.test(memo) && /비교|확정하지\s*않/i.test(memo)) {
    return "할부와 리스 조건 비교(금융 방식 미정)";
  }
  if (/확정하지\s*않|금융\s*방식.*미정/i.test(memo)) return "금융 방식 미정";
  return undefined;
}

function extractRichBudgetNote(memo: string): string | undefined {
  const bits: string[] = [];
  if (/월\s*납입.*낮추|납입금.*낮추/i.test(memo)) bits.push("월 납입금 부담 최소화");
  if (/초기\s*비용.*많이\s*쓰고\s*싶지\s*않|초기\s*비용.*최소/i.test(memo)) bits.push("초기 비용 최소화");
  return bits.length ? bits.join(", ") + " 희망" : undefined;
}

function extractRichTimingNote(memo: string): string | undefined {
  if (/출고\s*가능/i.test(memo)) return "출고 가능 여부 확인 필요";
  if (/출고|인도/i.test(memo)) return extractDeliveryNote(memo);
  return undefined;
}

function extractRichPrioritiesNote(memo: string): string | undefined {
  const bits: string[] = [];
  if (/가족용\s*7인승|7인승/i.test(memo)) bits.push("가족용 7인승");
  if (/공간/i.test(memo)) bits.push("공간");
  if (/연비/i.test(memo)) bits.push("연비");
  if (/주요\s*옵션|옵션/i.test(memo)) bits.push("주요 옵션");
  return bits.length ? bits.join(", ") : undefined;
}

function extractRichConcernsNote(memo: string): string | undefined {
  const bits: string[] = [];
  if (/할부.*리스|리스.*할부/i.test(memo)) bits.push("할부/리스 조건 비교");
  else if (/할부|리스/i.test(memo)) bits.push("금융 조건 비교");
  if (/매입|대차/i.test(memo)) bits.push("기존 차량 매입가 확인");
  return bits.length ? bits.join(", ") : undefined;
}

/** Sensora Flow 고객 니즈 패널용(구조화 메모). */
export function formatRichConsultationNeedsDisplay(memo: string): string {
  const interest = extractInterestVehicleFromMemo(memo);
  const owned = parseOwnedVehicleFromMemo(memo);
  const lines: string[] = [];

  if (interest) lines.push(`관심 차량:\n${interest}`);
  const budget = extractRichBudgetNote(memo);
  if (budget) lines.push(`예산·월 납입:\n${budget}`);
  const timing = extractRichTimingNote(memo);
  if (timing) lines.push(`구매·출고 시기:\n${timing}`);
  const priorities = extractRichPrioritiesNote(memo);
  if (priorities) lines.push(`중요 조건:\n${priorities}`);
  const concerns = extractRichConcernsNote(memo);
  if (concerns) lines.push(`우려 사항:\n${concerns}`);
  if (owned) lines.push(`보유/대차 차량:\n${owned.label}`);

  return lines.join("\n\n").trim() || memo.slice(0, 200);
}

function buildRichConsultationSms(
  name: string,
  interestVehicle: string | undefined,
  memo: string,
  owned?: ParsedOwnedVehicle,
): string {
  const salutation = name.trim() || "고객";
  const vehiclePhrase = interestVehicle ? interestVehicle : "문의 주신 차량";
  const lines: string[] = [`${salutation}님, 안녕하세요.`, "담당 영업사원입니다.", ""];

  if (/가족|7인승/i.test(memo)) {
    lines.push(
      `말씀 주신 ${vehiclePhrase} 기준으로 가족용 7인승 사용에 맞는 주요 옵션과 출고 가능 여부를 확인해 보겠습니다.`,
      "",
    );
  } else {
    lines.push(
      `말씀 주신 ${vehiclePhrase} 기준으로 주요 옵션과 출고 가능 여부를 확인해 보겠습니다.`,
      "",
    );
  }

  const financeBits: string[] = [];
  if (/할부.*리스|리스.*할부/i.test(memo)) {
    financeBits.push("할부와 리스 조건은 월 납입 부담과 초기 비용을 낮추는 방향으로 비교해드리겠습니다");
  } else if (/월\s*납입|초기\s*비용/i.test(memo)) {
    financeBits.push("월 납입 부담과 초기 비용을 낮추는 방향으로 조건을 비교해드리겠습니다");
  }

  if (owned) {
    const ownedPhrase = owned.label.replace(/\s*·\s*단순교환$/, "");
    financeBits.push(`현재 보유 중이신 ${ownedPhrase} 차량의 매입 가능 금액도 함께 확인해 보겠습니다`);
  } else if (/매입|보유\s*차량/i.test(memo)) {
    financeBits.push("현재 보유 중이신 차량의 매입 가능 금액도 함께 확인해 보겠습니다");
  }

  if (financeBits.length) lines.push(`${financeBits.join(", ")}.`, "");

  const callWhen =
    firstMatch(memo, [/이번\s*주\s*토요일\s*오전[^\n。]*/i, /토요일\s*오전[^\n。]*/i]) ??
    (/토요일/i.test(memo) ? "토요일 오전" : undefined);
  if (callWhen) {
    lines.push(
      `${callWhen}에 통화 가능하실 때, 출고 일정과 월 납입 조건, 기존 차량 매입가까지 같이 정리해서 안내드리겠습니다.`,
      "",
    );
  } else if (/주말/i.test(memo)) {
    lines.push("주말 통화를 선호하신다고 메모되어 있어, 편하신 시간 알려주시면 맞춰 연락드리겠습니다.", "");
  }

  lines.push("감사합니다.");
  return sanitizeAiTextForInput(memo, lines.join("\n"));
}

function buildRichNextActions(
  memo: string,
  interestVehicle?: string,
  owned?: ParsedOwnedVehicle,
): string[] {
  const header =
    firstMatch(memo, [/이번\s*주\s*토요일\s*오전[^\n。]*/i])?.replace(/\s*에\s*통화.*$/, "").trim() ??
    (/토요일\s*오전/i.test(memo) ? "이번 주 토요일 오전 통화" : undefined);

  const bullets: string[] = [];
  const confirmLine = memo.match(/통화\s*때\s*확인할\s*내용(?:은|:\s*)?([^\n]+)/i)?.[1];
  if (confirmLine) {
    if (/출고\s*가능/i.test(confirmLine) && interestVehicle) {
      bullets.push(`${interestVehicle} 출고 가능 여부 확인`);
    } else if (/출고\s*가능/i.test(confirmLine)) {
      bullets.push("출고 가능 여부 확인");
    }
    if (/주요\s*옵션/i.test(confirmLine)) bullets.push("주요 옵션 확인");
    if (/월\s*납입|할부|리스/i.test(confirmLine)) bullets.push("할부/리스 월 납입 조건 비교");
    if (/매입|A4|보유/i.test(confirmLine) && owned) {
      bullets.push(`${owned.brand ?? ""} ${owned.model ?? ""} 매입 가능 금액 확인`.trim());
    } else if (/매입/i.test(confirmLine)) {
      bullets.push("기존 차량 매입 가능 금액 확인");
    }
  }

  if (!bullets.length) {
    if (interestVehicle) bullets.push(`${interestVehicle} 출고 가능 여부 확인`);
    bullets.push("주요 옵션 확인");
    if (/할부|리스/i.test(memo)) bullets.push("할부/리스 월 납입 조건 비교");
    if (owned) bullets.push(`${owned.brand ?? ""} ${owned.model ?? ""} 매입 가능 금액 확인`.trim());
  }

  const out: string[] = [];
  if (header) out.push(header);
  bullets.forEach((b) => out.push(`- ${b}`));
  return out.filter(Boolean);
}

function buildRichQuickConsultationResult(
  memo: string,
  identity: QuickCustomerIdentity,
): QuickConsultationResult {
  const name =
    identity.name?.trim() ||
    parseQuickCustomerIdentity(memo).name?.trim() ||
    firstMatch(memo, [/([가-힣]{2,6})\s*고객/i])?.replace(/\s*고객$/, "") ||
    "고객";
  const interestVehicle =
    extractInterestVehicleFromMemo(memo) ??
    normalizeInterestVehicle(memo, identity.vehicle) ??
    undefined;
  const owned = parseOwnedVehicleFromMemo(memo);

  const needs: QuickConsultationNeeds = {
    vehicle: interestVehicle,
    budget: extractRichBudgetNote(memo),
    timing: extractRichTimingNote(memo),
    priorities: extractRichPrioritiesNote(memo),
    concerns: extractRichConcernsNote(memo),
  };

  const summary = formatRichConsultationNeedsDisplay(memo);
  const message = buildRichConsultationSms(name, interestVehicle, memo, owned);
  const nextActions = buildRichNextActions(memo, interestVehicle, owned);

  const insights: DemoConsultingResponse = {
    summary,
    message: applyCustomerNameToMessageText(name, message),
    nextAction: nextActions.join("\n"),
  };

  return {
    needs,
    summary,
    message: insights.message,
    nextActions,
    insights,
  };
}

/** 구조화 메모에서 보유 차량 필드(저장 시 선택 반영용 · 기존 저장 API 변경 없음). */
export function parseOwnedVehicleFieldsFromMemo(memo: string): UsedCarInfo | undefined {
  const parsed = parseOwnedVehicleFromMemo(memo);
  if (!parsed) return undefined;
  return {
    brand: parsed.brand,
    model: parsed.model,
    year: parsed.year,
    mileageKm: parsed.mileageKm,
    accident: parsed.accident,
  };
}

const MODEL_TO_BRAND: Record<string, string> = {
  GLC: "Mercedes-Benz",
  GLE: "Mercedes-Benz",
  GLS: "Mercedes-Benz",
  GLA: "Mercedes-Benz",
  GLB: "Mercedes-Benz",
  CLA: "Mercedes-Benz",
  "C-CLASS": "Mercedes-Benz",
  "E-CLASS": "Mercedes-Benz",
  "S-CLASS": "Mercedes-Benz",
  EQE: "Mercedes-Benz",
  EQS: "Mercedes-Benz",
  X3: "BMW",
  X5: "BMW",
  "3시리즈": "BMW",
  "5시리즈": "BMW",
  그랜저: "현대",
  아반떼: "현대",
  투싼: "현대",
  쏘렌토: "기아",
  카니발: "기아",
  K3: "기아",
  K5: "기아",
  K8: "기아",
  G80: "제네시스",
  GV70: "제네시스",
  GV80: "제네시스",
};

/** 모델 코드에서 브랜드 추론(표시·저장 매핑용). */
export function inferVehicleBrandForModel(model: string): string | undefined {
  const key = model.trim();
  if (!key) return undefined;
  const upper = key.toUpperCase();
  return MODEL_TO_BRAND[upper] ?? MODEL_TO_BRAND[key];
}

/** 고객 저장 시 관심 차량 필드(모델 우선 · 브랜드는 보조). */
export function resolveCustomerVehicleFields(
  memo: string,
  modelCandidate?: string,
): { vehicleBrand?: string; interestedModel?: string } {
  const model =
    extractInterestVehicleFromMemo(memo) ??
    normalizeInterestVehicle(memo, modelCandidate);
  if (!model) return {};
  return {
    vehicleBrand: inferVehicleBrandForModel(model),
    interestedModel: model,
  };
}

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
    if (m?.[0]) return m[0].trim();
  }
  return undefined;
}

function stripNameSuffix(line: string): string {
  return line.replace(/님$/, "").trim();
}

function extractVehicleFromLine(line: string): string | undefined {
  const t = stripNameSuffix(line.trim());
  if (!t) return undefined;

  const glued = t.match(/^([가-힣]{2,6})([A-Za-z][A-Za-z0-9.\-]+)$/);
  if (glued) return glued[2].trim();

  if (HANGUL_NAME_RE.test(t)) return undefined;

  const known = t.match(KNOWN_MODEL_RE);
  if (known) return known[0];

  if (MODEL_LINE_RE.test(t) && !/[가-힣]{2,}/.test(t) && !BRAND_ONLY_RE.test(t)) return t;

  const labeled = t.match(/(?:관심\s*)?(?:차량|모델|차종)\s*[:\-]?\s*([A-Za-z가-힣0-9.\-\s]+)/i);
  if (labeled?.[1]) {
    const v = labeled[1].trim();
    const model = v.match(KNOWN_MODEL_RE);
    if (model) return model[0];
    if (v && !HANGUL_NAME_RE.test(v.replace(/\s/g, "")) && !BRAND_ONLY_RE.test(v)) return v;
  }

  return undefined;
}

function extractNameFromLine(line: string): string | undefined {
  const t = stripNameSuffix(line.trim());
  if (!t) return undefined;

  const glued = t.match(/^([가-힣]{2,6})([A-Za-z][A-Za-z0-9.\-]+)$/);
  if (glued) return glued[1];

  if (HANGUL_NAME_RE.test(t)) return t;

  const labeled = t.match(/(?:고객\s*명|성함|이름)\s*[:\-]?\s*([가-힣]{2,6})/i);
  if (labeled?.[1]) return labeled[1].trim();

  return undefined;
}

/** 짧은 상담 원문에서 고객명·관심 차량을 분리(붙어 있거나 줄바꿈·구분자). */
export function parseQuickCustomerIdentity(memo: string): QuickCustomerIdentity {
  const raw = memo.trim();
  if (!raw) return {};

  const slashParts = raw
    .split(/[\/|,，、]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (slashParts.length === 2) {
    let name: string | undefined;
    let vehicle: string | undefined;
    for (const part of slashParts) {
      const n = extractNameFromLine(part);
      const v = extractVehicleFromLine(part);
      if (n) name = n;
      if (v) vehicle = v;
    }
    if (name || vehicle) {
      return {
        name,
        vehicle: normalizeInterestVehicle(raw, vehicle),
      };
    }
  }

  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  let name: string | undefined;
  let vehicle: string | undefined;

  for (const line of lines) {
    const n = extractNameFromLine(line);
    const v = extractVehicleFromLine(line);
    if (n && !name) name = n;
    if (v && !vehicle) vehicle = v;
  }

  if (!name && !vehicle && lines.length === 1) {
    const single = lines[0]!;
    const glued = single.match(/^([가-힣]{2,6})([A-Za-z][A-Za-z0-9.\-]+)$/);
    if (glued) {
      return {
        name: glued[1],
        vehicle: normalizeInterestVehicle(raw, glued[2]),
      };
    }
  }

  const interest =
    extractInterestVehicleFromMemo(raw) ?? normalizeInterestVehicle(raw, vehicle);

  return {
    name,
    vehicle: interest,
  };
}

function extractPaymentNote(memo: string): string | undefined {
  return firstMatch(memo, [/월\s*납입[^\n,。]*/i, /납입\s*조건[^\n,。]*/i, /월\s*납입금[^\n,。]*/i]);
}

function extractDeliveryNote(memo: string): string | undefined {
  return firstMatch(memo, [/출고\s*일정[^\n,。]*/i, /출고\s*희망[^\n,。]*/i, /출고[^\n,。]*/i]);
}

function hasComfortTopicsInInput(memo: string): boolean {
  return /승차감|착좌감|주행\s*피로|시트|가족\s*이동|편의성|피로감/i.test(memo);
}

export function isSparseQuickConsultation(memo: string): boolean {
  const raw = memo.trim();
  if (!raw) return true;
  const lineCount = raw.split(/\n+/).filter((l) => l.trim()).length;
  if (raw.length > 120 || lineCount > 4) return false;
  const hasBudget = /예산|만\s*원|월\s*[\d,.]+\s*만|납입|할부\s*조건/i.test(raw);
  const hasTiming = /출고|구매\s*시기|이번\s*달|다음\s*달|\d+\s*월/i.test(raw);
  const hasRichContext = /시승|견적|프로모션|법인|가족|편의|우려|걱정/i.test(raw);
  return !hasBudget && !hasTiming && !hasRichContext;
}

/** 입력에 있는 조건만 중심으로 초안 작성(데모 엔진 과추측 방지). */
function shouldUseGroundedQuickDraft(memo: string): boolean {
  const raw = memo.trim();
  if (isSparseQuickConsultation(raw)) return true;
  const hasModel = Boolean(extractPreferredVehicleModel(raw));
  const hasBudget = /월\s*납입|납입\s*조건|예산|만\s*원/i.test(raw);
  const hasTiming = /출고\s*일정|출고\s*희망|출고/i.test(raw);
  if (hasModel && (hasBudget || hasTiming) && !hasComfortTopicsInInput(raw)) return true;
  return false;
}

export function sanitizeAiTextForInput(memo: string, text: string): string {
  const input = memo.trim();
  const body = text.trim();
  if (!input || !body) return body;

  const unsupported = [/승차감/, /착좌감/, /주행\s*피로/, /시트/, /가족\s*이동/, /편의성/];
  const chunks = body.split(/\n+/);
  const kept = chunks.filter((chunk) => {
    const t = chunk.trim();
    if (!t) return false;
    for (const p of unsupported) {
      if (p.test(t) && !p.test(input)) return false;
    }
    return true;
  });

  let out = kept.join("\n").trim();
  if (/착좌감/.test(out) && !/착좌감/.test(input)) {
    out = out.replace(/.*착좌감.*\n?/g, "").trim();
  }
  return out;
}

function buildGroundedSmsDraft(
  name: string,
  vehicle: string | undefined,
  paymentNote: string | undefined,
  deliveryNote: string | undefined,
): string {
  const paymentPhrase =
    paymentNote && deliveryNote
      ? "월 납입 조건과 출고 일정"
      : paymentNote
        ? "월 납입 조건"
        : deliveryNote
          ? "출고 일정"
          : "상담 때 말씀 주신 조건";

  const vehiclePhrase = vehicle ? `관심 가져주신 ${vehicle}` : "문의 주신 차량";

  return [
    `${name}님, 안녕하세요.`,
    "담당 영업사원입니다.",
    "",
    `지난 상담 때 말씀 주신 ${paymentPhrase} 기준으로 다시 연락드렸습니다.`,
    "",
    `${vehiclePhrase} 기준으로 현재 확인 가능한 조건과 출고 가능 일정을 정리해드리겠습니다. 월 납입 부담을 낮출 수 있는 조건도 함께 비교해서 안내드리겠습니다.`,
    "",
    "확인 후 견적과 참고 자료를 함께 보내드리겠습니다.",
    "",
    "편하실 때 확인 부탁드리며,",
    "궁금하신 부분은 언제든 편하게 말씀 주세요.",
    "",
    "감사합니다.",
  ].join("\n");
}

function buildSparseQuickConsultationResult(
  memo: string,
  identity: QuickCustomerIdentity,
): QuickConsultationResult {
  const name = identity.name?.trim() || "고객";
  const vehicle = normalizeInterestVehicle(memo, identity.vehicle);
  const paymentNote = extractPaymentNote(memo);
  const deliveryNote = extractDeliveryNote(memo);

  if (paymentNote || deliveryNote) {
    return buildGroundedQuickConsultationResult(memo, { ...identity, vehicle });
  }

  const summary = vehicle
    ? `${vehicle} 관심. 예산·구매 시기·출고 일정은 추가 확인이 필요합니다.`
    : "관심 차량·예산·구매 시기는 추가 확인이 필요합니다.";
  const message = vehicle
    ? `안녕하세요, ${name}님.\n문의 주신 ${vehicle} 관련해서 안내드리겠습니다.\n예산, 출고 희망일, 원하시는 조건을 알려주시면 그 기준으로 견적과 가능 조건을 정리해드리겠습니다.`
    : `안녕하세요, ${name}님.\n문의 주셔서 감사합니다.\n예산, 출고 희망일, 원하시는 조건을 알려주시면 견적과 가능 조건을 정리해드리겠습니다.`;
  const nextActions = ["예산·구매 시기·결제 방식 추가 확인"];
  const insights: DemoConsultingResponse = { summary, message, nextAction: nextActions.join("\n") };
  const needs: QuickConsultationNeeds = {
    vehicle: vehicle || undefined,
    budget: paymentNote,
    timing: deliveryNote,
  };
  return { needs, summary, message, nextActions, insights };
}

function buildGroundedQuickConsultationResult(
  memo: string,
  identity: QuickCustomerIdentity,
): QuickConsultationResult {
  const name = identity.name?.trim() || "고객";
  const vehicle = normalizeInterestVehicle(memo, identity.vehicle);
  const paymentNote = extractPaymentNote(memo);
  const deliveryNote = extractDeliveryNote(memo);

  const summary = vehicle
    ? `${vehicle} 관심. 월 납입·출고 일정을 중심으로 추가 상담이 필요합니다.`
    : "월 납입·출고 일정을 중심으로 추가 상담이 필요합니다.";

  const message = buildGroundedSmsDraft(name, vehicle, paymentNote, deliveryNote);
  const nextActions = ["리스·출고 조건 확인 후 견적 안내 문자 검토"];
  const insights: DemoConsultingResponse = {
    summary,
    message,
    nextAction: nextActions.join("\n"),
  };
  const needs: QuickConsultationNeeds = {
    vehicle: vehicle || undefined,
    budget: paymentNote,
    timing: deliveryNote,
  };
  return { needs, summary, message, nextActions, insights };
}

/** 고객 추가 모달용 짧은 상담 메모(긴 AI 결과·문자 초안 전문 제외). */
export function buildQuickCustomerModalMemo(memo: string, result: QuickConsultationResult): string {
  if (isRichStructuredConsultation(memo)) {
    const owned = parseOwnedVehicleFieldsFromMemo(memo);
    const lines: string[] = [];
    if (result.needs.vehicle) lines.push(`관심: ${result.needs.vehicle}`);
    if (owned?.brand || owned?.model) {
      lines.push(`보유/대차: ${[owned.brand, owned.model, owned.year, owned.mileageKm].filter(Boolean).join(" ")}`);
      if (owned.accident) lines.push(`사고: ${owned.accident}`);
    }
    if (result.needs.priorities) lines.push(result.needs.priorities);
    if (result.needs.budget) lines.push(result.needs.budget);
    if (result.needs.concerns) lines.push(result.needs.concerns);
    const next = result.nextActions[0]?.trim();
    if (next) lines.push("", "[다음 행동]", ...result.nextActions);
    return lines.join("\n");
  }

  const identity = parseQuickCustomerIdentity(memo);
  const vehicle = normalizeInterestVehicle(memo, result.needs.vehicle ?? identity.vehicle);
  const lines: string[] = [];
  if (vehicle) {
    lines.push(`${vehicle} 관심`);
  }
  const paymentNote = extractPaymentNote(memo) ?? result.needs.budget;
  const deliveryNote = extractDeliveryNote(memo) ?? result.needs.timing;
  if (paymentNote) lines.push(paymentNote);
  if (deliveryNote) lines.push(deliveryNote);
  if (!paymentNote && !deliveryNote) {
    lines.push("예산·구매 시기·출고 일정은 추가 확인이 필요합니다.");
  } else {
    const missing: string[] = [];
    if (!paymentNote) missing.push("월 납입 조건");
    if (!deliveryNote) missing.push("출고 일정");
    if (missing.length > 0) lines.push(`${missing.join(", ")} 추가 확인 필요`);
  }
  const next = result.nextActions[0]?.trim();
  if (next) {
    lines.push("", "[다음 행동]", next);
  }
  return lines.join("\n");
}

/** 상담 원문에서 MVP 표시용 니즈 필드를 추출(규칙 기반 · optional). */
export function parseQuickConsultationNeeds(memo: string, summary = ""): QuickConsultationNeeds {
  const identity = parseQuickCustomerIdentity(memo);
  const raw = memo.trim();
  const perLine = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  let vehicle = identity.vehicle;
  if (!vehicle) {
    for (const line of perLine) {
      const v = extractVehicleFromLine(line);
      if (v) {
        vehicle = v;
        break;
      }
    }
  }
  vehicle = normalizeInterestVehicle(raw, vehicle);
  if (!vehicle) {
    vehicle = normalizeInterestVehicle(raw, firstMatch(summary, [/관심\s*차량[:\s]*([^\n]+)/i]));
  }

  const budget =
    extractPaymentNote(raw) ??
    firstMatch(raw, [
      /월\s*[\d,.]+\s*만\s*원?\s*(?:이하|내외|대)?/i,
      /예산[:\s]*([^\n]+)/i,
      /[\d,.]+\s*만\s*원?\s*(?:이하|내외)/i,
    ]) ??
    firstMatch(summary, [/예산[:\s]*([^\n]+)/i, /월\s*납입[:\s]*([^\n]+)/i]);

  const timing =
    extractDeliveryNote(raw) ??
    firstMatch(raw, [
      /구매\s*시기[:\s]*([^\n]+)/i,
      /(?:이번|다음)\s*달[^\n,。]*/i,
      /\d+\s*월\s*(?:내|중|말)?\s*출고/i,
    ]) ??
    firstMatch(summary, [/구매\s*시기[:\s]*([^\n]+)/i, /출고[:\s]*([^\n]+)/i]);

  const priorities =
    firstMatch(raw, [
      /법인\s*비용\s*처리[^\n,。]*/i,
      /프로모션[^\n,。]*/i,
      /시승[^\n,。]*/i,
      /견적[^\n,。]*/i,
    ]) ?? undefined;

  const concerns =
    firstMatch(raw, [
      /우려[:\s]*([^\n]+)/i,
      /걱정[:\s]*([^\n]+)/i,
      /(?:승인|금리|조건)\s*(?:이|가)\s*[^\n,。]+/i,
    ]) ?? firstMatch(summary, [/우려[:\s]*([^\n]+)/i]);

  return {
    vehicle: vehicle || undefined,
    budget: budget || undefined,
    timing: timing || undefined,
    priorities: priorities || undefined,
    concerns: concerns || undefined,
  };
}

/** 고객 문자·요약에 쓸 호칭(이름 없으면 고객님). */
export function formatCustomerSalutation(name?: string | null): string {
  const n = name?.trim();
  return n ? `${n}님` : "고객님";
}

/** OO placeholder → 실제 고객명(없으면 고객님). */
export function applyCustomerNameToMessageText(name: string | undefined | null, text: string): string {
  const salutation = formatCustomerSalutation(name);
  return text
    .replaceAll("OO 님", salutation)
    .replaceAll("OO님", salutation)
    .replaceAll("{고객명}님", salutation)
    .replaceAll("{고객명}", name?.trim() || "고객");
}

const NEXT_ACTION_BOILERPLATE_RE =
  /라인별\s*조건|문자\s*톤|마지막으로\s*한\s*번\s*더|메모에\s*적힌|그대로\s*반영|현재\s*확인\s*가능한\s*조건\s*기준|입력된\s*조건\s*기준|월\s*출금|확인합니다|톤을\s*맞|리스\s*\/\s*장기렌트/i;

/** 다음 행동·검수 문구를 영업 카드용 1~2줄로 축약. */
export function polishNextActionForDisplay(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^-\s+/.test(t) || /토요일\s*오전|출고\s*가능\s*여부|매입\s*가능|할부\/리스/i.test(t)) {
    return t.replace(/^[-•*]\s*/, "").trim();
  }
  if (NEXT_ACTION_BOILERPLATE_RE.test(t) || t.length > 72) {
    if (/리스|할부|견적|금융/i.test(t)) {
      return "리스 조건과 출고 가능 여부 확인 후 견적 안내 문자 검토";
    }
    if (/월\s*납입|출고/i.test(t)) {
      return "월 납입·출고 일정 확인 후 안내";
    }
    return "견적·조건 확인 후 안내 문자 검토";
  }
  const first = t
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .find((line) => line.length > 0);
  return first ?? t;
}

function customerVehicleLine(c: Pick<Customer, "memo" | "interestedModel" | "vehicleBrand">): string {
  const memo = c.memo ?? "";
  const model = normalizeInterestVehicle(memo, c.interestedModel) ?? extractPreferredVehicleModel(memo);
  if (model) return normalizeKoreanVehicleSpelling(model);
  const im = c.interestedModel?.trim();
  if (im && !BRAND_ONLY_RE.test(im)) {
    return normalizeKoreanVehicleSpelling(im);
  }
  return "";
}

function formatInterestModelsForSms(c: Pick<Customer, "memo" | "interestedModel" | "vehicleBrand">): string {
  const im = c.interestedModel?.trim();
  if (im && /[·|/]/.test(im)) {
    const parts = im
      .split(/[·|/]+/)
      .map((s) => normalizeKoreanVehicleSpelling(s.trim()))
      .filter(Boolean);
    if (parts.length >= 2) return parts.join("와 ");
    if (parts.length === 1) return parts[0]!;
  }
  const line = customerVehicleLine(c);
  return line ? normalizeKoreanVehicleSpelling(line) : "";
}

function customerMemoCombined(c: Pick<Customer, "memo" | "personalityMemo">): string {
  return `${c.memo ?? ""}\n${c.personalityMemo ?? ""}`.trim();
}

/** 상담 메모·관심 차량만으로 문자 초안을 쓸지(과추측·데모 엔진 회피). */
export function shouldUseMemoContextSmsDraft(c: Pick<Customer, "memo" | "personalityMemo" | "interestedModel" | "vehicleBrand" | "financeConditionDraft">): boolean {
  const memo = customerMemoCombined(c);
  if (!memo && !c.interestedModel?.trim()) return false;
  if (hasMeaningfulFinanceDraft(c as Customer)) return false;
  if (hasComfortTopicsInInput(memo)) return false;
  if (isSparseQuickConsultation(memo)) return true;
  if (/가족|7인승|주말|시승|옵션/i.test(memo) && Boolean(formatInterestModelsForSms(c) || c.interestedModel?.trim())) {
    return true;
  }
  return shouldUseGroundedQuickDraft(memo);
}

export type MemoContextSmsOpts = { pendingNextActionTitle?: string | null };

/** 입력·관심 차량·메모만 반영한 검토용 문자 초안. */
export function buildMemoContextSmsDraft(
  c: Pick<Customer, "name" | "memo" | "personalityMemo" | "interestedModel" | "vehicleBrand" | "stage">,
  opts?: MemoContextSmsOpts,
): string {
  const name = c.name?.trim() || "고객";
  const memo = customerMemoCombined(c);
  const vehicle = formatInterestModelsForSms(c);
  const lines: string[] = [`${name}님, 안녕하세요.`, "담당 영업사원입니다.", ""];

  if (/가족|7인승/i.test(memo)) {
    lines.push("지난 상담 때 말씀 주신 가족용 7인승 차량 기준으로 다시 연락드렸습니다.", "");
  } else if (/시승/i.test(memo) || /시승/i.test(opts?.pendingNextActionTitle ?? "")) {
    lines.push("지난 상담 때 말씀 주신 시승·옵션 니즈를 기준으로 다시 연락드렸습니다.", "");
  }

  if (vehicle) {
    lines.push(
      `관심 가져주신 ${vehicle} 기준으로 출고 가능 여부, 주요 옵션, 월 납입 조건을 함께 확인해 보겠습니다.`,
      "",
    );
  }

  if (/주말/i.test(memo)) {
    lines.push(
      "주말 통화를 선호하신다고 메모되어 있어, 편하신 시간 알려주시면 맞춰 연락드리겠습니다.",
      "",
    );
  }

  const pending = opts?.pendingNextActionTitle?.trim();
  if (pending && !/시승/i.test(memo) && /시승|옵션/i.test(pending)) {
    lines.push(`다음으로는 ${pending}을(를) 함께 맞추면 좋겠습니다.`, "");
  }

  lines.push("감사합니다.");
  return lines.join("\n");
}

function collectMissingFields(c: Customer): string[] {
  const missing: string[] = [];
  if (!c.budget?.trim() && !c.financeConditionDraft?.monthlyPayment?.trim()) missing.push("예산");
  if (!c.purchaseTiming?.trim()) missing.push("구매 시기");
  if (!c.paymentType?.trim() && !c.financeConditionDraft?.productMode) missing.push("결제 방식");
  if (!customerVehicleLine(c)) missing.push("관심 차량");
  return missing;
}

function formatManwonDisplay(text?: string): string {
  const raw = text?.trim();
  if (!raw) return "";
  const won = parseMoneyToKrw(raw);
  if (won != null && won > 0) {
    const man = Math.round(won / 10_000);
    if (man > 0) return `${man.toLocaleString("ko-KR")}만 원`;
  }
  if (/^\d[\d,.\s]*$/.test(raw)) {
    const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (n >= 100) return `${n.toLocaleString("ko-KR")}만 원`;
  }
  return raw;
}

/** 금융 초안 필드 — 화면 표시용(단위 포함). */
export function formatFinanceDraftDisplay(
  field: keyof FinanceConditionDraft,
  raw?: string,
): string {
  const t = raw?.trim();
  if (!t) return "";
  if (field === "monthlyPayment") {
    const won = parseMoneyToKrw(t);
    if (won != null && won >= 100_000) {
      return `약 ${Math.round(won / 10_000).toLocaleString("ko-KR")}만 원`;
    }
    return t;
  }
  if (field === "contractMonths") {
    return /개월/i.test(t) ? t : `${t.replace(/[^\d]/g, "")}개월`;
  }
  if (field === "deposit" || field === "residualValue" || field === "downPayment" || field === "totalVehiclePrice") {
    return formatManwonDisplay(t);
  }
  return t;
}

/** 고객 맥락 요약 — 입력된 금융 조건 불릿 */
export function buildFinanceDraftDetailBullets(fd?: FinanceConditionDraft): string[] {
  if (!fd) return [];
  const lines: string[] = [];
  const months = formatFinanceDraftDisplay("contractMonths", fd.contractMonths);
  const deposit = formatFinanceDraftDisplay("deposit", fd.deposit);
  const residual = formatFinanceDraftDisplay("residualValue", fd.residualValue);
  const down = formatFinanceDraftDisplay("downPayment", fd.downPayment);
  const monthly = formatFinanceDraftDisplay("monthlyPayment", fd.monthlyPayment);
  if (months) lines.push(`계약기간: ${months}`);
  if (deposit) lines.push(`보증금: ${deposit}`);
  if (down) lines.push(`선납금: ${down}`);
  if (residual) lines.push(`잔존가치: ${residual}`);
  if (monthly) lines.push(`월 납입금: ${monthly}`);
  return lines;
}

function summarizePriorityNeedsPhrase(needs: string[]): string {
  if (!needs.length) return "";
  const bits: string[] = [];
  if (needs.includes("월 납입금 부담 최소화")) bits.push("월 납입 부담");
  if (needs.includes("초기 비용 최소화")) bits.push("초기 비용");
  if (needs.includes("빠른 출고")) bits.push("출고 일정");
  if (needs.length && !bits.length) return `${needs.slice(0, 2).join(", ")}을 중요하게 보고 있습니다.`;
  if (bits.length === 1) return `${bits[0]}을 중요하게 보고 있습니다.`;
  if (bits.length >= 2) return `${bits.slice(0, 2).join("과 ")}을 낮추는 조건을 중요하게 보고 있습니다.`;
  return "";
}

/** 고객 카드·AI 요약 — 짧은 카드형 한 줄 */
export function buildCustomerAiSummaryLine(c: Customer): string {
  const memoRaw = c.memo ?? "";
  const vehicle = customerVehicleLine(c) || extractPreferredVehicleModel(memoRaw);
  const mode = c.financeConditionDraft?.productMode ?? c.paymentType;
  const needs = c.customerPriorityNeeds ?? [];
  const needPhrase = summarizePriorityNeedsPhrase(needs);

  if (vehicle && mode) {
    const base = `${vehicle} ${mode} 상담입니다.`;
    return needPhrase ? `${base} ${needPhrase}` : base;
  }
  if (vehicle) {
    return needPhrase ? `${vehicle} 관심 고객입니다. ${needPhrase}` : `${vehicle} 관심 고객입니다.`;
  }
  if (needPhrase) return needPhrase;

  const firstLine =
    memoRaw
      .split(/\n+/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("[") && !/^(?:다음 행동|ai 요약)/i.test(l)) ?? "";
  if (firstLine) {
    const short = firstLine.replace(/추가 확인 필요/g, "추가 상담 필요");
    return short.length <= 72 ? short : `${short.slice(0, 71)}…`;
  }
  return "상담·견적 정리 중입니다.";
}

/** Flow·상세 화면용 AI 출력 정리(고객명·금융 조건 반영). */
export type FlowInsightOptions = DemoConsultingOptions & { /** 분석 중인 워크스페이스 메모(저장 전) */ inputMemo?: string };

export function polishFlowInsightsForCustomer(
  customer: Customer,
  insights: DemoConsultingResponse,
  options?: FlowInsightOptions,
): DemoConsultingResponse {
  const name = customer.name?.trim();
  const memo = (options?.inputMemo?.trim() || customerMemoCombined(customer)).trim();

  if (memo && isRichStructuredConsultation(memo)) {
    const identity = parseQuickCustomerIdentity(memo);
    if (name) identity.name = name;
    const q = buildRichQuickConsultationResult(memo, identity);
    return {
      summary: q.summary,
      message: applyCustomerNameToMessageText(name, q.message),
      nextAction: q.nextActions.join("\n"),
    };
  }

  const summary =
    buildCustomerAiSummaryLine(customer) ||
    applyCustomerNameToMessageText(name, insights.summary.trim());

  let message: string;
  if (hasMeaningfulFinanceDraft(customer)) {
    message = buildEstimateGuideMessage(customer);
  } else if (shouldUseMemoContextSmsDraft(customer)) {
    message = buildMemoContextSmsDraft(customer);
  } else if (memo && (shouldUseGroundedQuickDraft(memo) || isSparseQuickConsultation(memo))) {
    const q = buildQuickConsultationResult(memo, options);
    message = applyCustomerNameToMessageText(name, sanitizeAiTextForInput(memo, q.message));
  } else {
    message = applyCustomerNameToMessageText(name, sanitizeAiTextForInput(memo, insights.message.trim()));
  }

  const nextLines = splitNextActions(insights.nextAction).map(polishNextActionForDisplay).filter(Boolean);
  const nextAction = nextLines.length > 0 ? nextLines.join("\n") : polishNextActionForDisplay(insights.nextAction);

  return { summary, message, nextAction };
}

function formatExportDateTime(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}

type CalendarEventLike = { title: string; startAt: string };

/**보내기·복사용 고객 요약(핵심만, 빈 필드 최소). */
export function buildCompactCustomerExportText(
  customer: Customer,
  nextActions: NextAction[],
  events: CalendarEventLike[],
): string {
  const vehicle = customerVehicleLine(customer);
  const fd = customer.financeConditionDraft;
  const lines: string[] = ["고객 요약"];

  if (customer.name?.trim()) lines.push(`- 이름: ${customer.name.trim()}`);
  if (customer.phone?.trim()) lines.push(`- 연락처: ${customer.phone.trim()}`);
  if (vehicle) lines.push(`- 관심 차량: ${vehicle}`);
  if (customer.stage?.trim()) lines.push(`- 상담 상태: ${customer.stage.trim()}`);
  if (fd?.productMode) lines.push(`- 금융 방식: ${fd.productMode}`);

  const needs = customer.customerPriorityNeeds ?? [];
  if (needs.length) lines.push(`- 상담 포인트: ${needs.join(", ")}`);

  const missing = collectMissingFields(customer);
  if (missing.length) {
    lines.push("", "추가 확인 필요", ...missing.map((m) => `- ${m}`));
  }

  const memoBrief =
    customer.memo
      ?.split(/\n+/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("[") && !/^다음 행동/i.test(l)) ?? "";
  if (memoBrief && memoBrief.length <= 80) {
    lines.push(`- 상담 메모: ${memoBrief}`);
  }

  const actions = nextActions.filter((a) => a.customerId === customer.id);
  const pending = actions.filter((a) => !a.doneAt);
  const uniqueTitles = [...new Set(pending.map((a) => polishNextActionForDisplay(a.title)).filter(Boolean))];

  lines.push("", "다음 할 일");
  if (uniqueTitles.length) {
    uniqueTitles.slice(0, 6).forEach((title) => lines.push(`- ${title}`));
  } else {
    lines.push("- (등록된 할 일 없음)");
  }

  const custEvents = events.filter((e) => e);
  if (custEvents.length) {
    lines.push("", "일정");
    custEvents.slice(0, 8).forEach((e) => {
      lines.push(`- ${e.title} (${formatExportDateTime(e.startAt)})`);
    });
  }

  lines.push("", `업데이트: ${formatExportDateTime(customer.updatedAt)}`);
  return lines.join("\n");
}

function splitNextActions(nextAction: string): string[] {
  return nextAction
    .split(/\n+/)
    .map((line) => polishNextActionForDisplay(line.replace(/^[-•*]\s*/, "").trim()))
    .filter((line) => line.length > 0);
}

export function buildQuickConsultationResult(memo: string, options?: DemoConsultingOptions): QuickConsultationResult {
  const trimmed = memo.trim();
  const identity = parseQuickCustomerIdentity(trimmed);

  if (isRichStructuredConsultation(trimmed)) {
    return buildRichQuickConsultationResult(trimmed, identity);
  }

  if (shouldUseGroundedQuickDraft(trimmed)) {
    return buildGroundedQuickConsultationResult(trimmed, identity);
  }

  const insightsRaw = generateDemoConsultingResponse(trimmed, options);
  const insights = {
    ...insightsRaw,
    summary: insightsRaw.summary.trim(),
    message: applyCustomerNameToMessageText(identity.name, insightsRaw.message.trim()),
    nextAction: insightsRaw.nextAction
      .split(/\n+/)
      .map((ln) => polishNextActionForDisplay(ln))
      .filter(Boolean)
      .join("\n") || polishNextActionForDisplay(insightsRaw.nextAction),
  };
  const needs = parseQuickConsultationNeeds(trimmed, insights.summary);
  if (identity.vehicle && !needs.vehicle) {
    needs.vehicle = identity.vehicle;
  }
  needs.vehicle = normalizeInterestVehicle(trimmed, needs.vehicle);

  let message = sanitizeAiTextForInput(trimmed, insights.message);
  let summary = sanitizeAiTextForInput(trimmed, insights.summary);

  if (!message || message.length < 40) {
    const paymentNote = extractPaymentNote(trimmed);
    const deliveryNote = extractDeliveryNote(trimmed);
    message = buildGroundedSmsDraft(
      identity.name?.trim() || "고객",
      needs.vehicle,
      paymentNote,
      deliveryNote,
    );
  }

  const nextActions = splitNextActions(insights.nextAction);
  return {
    needs,
    summary,
    message,
    nextActions: nextActions.length > 0 ? nextActions : [insights.nextAction.trim()].filter(Boolean),
    insights: { ...insights, summary, message },
  };
}
