import {
  generateDemoConsultingResponse,
  type DemoConsultingOptions,
  type DemoConsultingResponse,
} from "@/app/components/concierge/aiDemoResponse";

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

const KNOWN_VEHICLE_RE =
  /\b(GLC|GLE|GLS|C-Class|E-Class|S-Class|3시리즈|5시리즈|그랜저|쏘렌토|카니발|투싼|아반떼|K\d{1,2}|EV\d{1,2})\b/i;

const HANGUL_NAME_RE = /^[가-힣]{2,6}$/;
const MODEL_LINE_RE = /^[A-Za-z][A-Za-z0-9.\-\s]{0,24}$/;

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

  const known = t.match(KNOWN_VEHICLE_RE);
  if (known) return known[0];

  if (MODEL_LINE_RE.test(t) && !/[가-힣]{2,}/.test(t)) return t;

  const labeled = t.match(/(?:관심\s*)?(?:차량|모델|차종)\s*[:\-]?\s*([A-Za-z가-힣0-9.\-\s]+)/i);
  if (labeled?.[1]) {
    const v = labeled[1].trim();
    if (v && !HANGUL_NAME_RE.test(v.replace(/\s/g, ""))) return v;
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
    if (name || vehicle) return { name, vehicle };
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
      return { name: glued[1], vehicle: glued[2] };
    }
  }

  return { name, vehicle };
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

function buildSparseQuickConsultationResult(
  memo: string,
  identity: QuickCustomerIdentity,
): QuickConsultationResult {
  const name = identity.name?.trim() || "고객";
  const vehicle = identity.vehicle?.trim();
  const summary = vehicle
    ? `${vehicle}에 관심이 있는 고객입니다.\n예산, 구매 시기, 출고 희망일, 결제 방식은 추가 확인이 필요합니다.`
    : "관심 차량 확인이 필요한 고객입니다.\n예산, 구매 시기, 출고 희망일, 결제 방식은 추가 확인이 필요합니다.";
  const message = vehicle
    ? `안녕하세요, ${name}님.\n문의 주신 ${vehicle} 관련해서 안내드리겠습니다.\n예산, 출고 희망일, 원하시는 조건을 알려주시면 그 기준으로 견적과 가능 조건을 정리해드리겠습니다.`
    : `안녕하세요, ${name}님.\n문의 주셔서 감사합니다.\n예산, 출고 희망일, 원하시는 조건을 알려주시면 견적과 가능 조건을 정리해드리겠습니다.`;
  const nextActions = ["예산, 구매 시기, 출고 희망일, 결제 방식을 추가로 확인합니다."];
  const insights: DemoConsultingResponse = {
    summary,
    message,
    nextAction: nextActions.join("\n"),
  };
  const needs: QuickConsultationNeeds = {
    vehicle: vehicle || undefined,
    budget: undefined,
    timing: undefined,
    priorities: undefined,
    concerns: undefined,
  };
  return {
    needs,
    summary,
    message,
    nextActions,
    insights,
  };
}

/** 고객 추가 모달용 짧은 상담 메모(긴 AI 결과·문자 초안 전문 제외). */
export function buildQuickCustomerModalMemo(memo: string, result: QuickConsultationResult): string {
  const identity = parseQuickCustomerIdentity(memo);
  const vehicle = (result.needs.vehicle ?? identity.vehicle)?.trim();
  const lines: string[] = [];
  if (vehicle) {
    lines.push(`${vehicle} 관심`);
  }
  lines.push("예산, 구매 시기, 출고 희망일, 결제 방식 추가 확인 필요");
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
  if (!vehicle) {
    vehicle =
      firstMatch(raw, [KNOWN_VEHICLE_RE]) ??
      firstMatch(summary, [/관심\s*차량[:\s]*([^\n]+)/i]);
  }
  if (vehicle && identity.name && vehicle.includes(identity.name)) {
    const stripped = vehicle.replace(identity.name, "").trim();
    vehicle = stripped.length > 0 ? stripped : undefined;
  }

  const budget =
    firstMatch(raw, [
      /월\s*[\d,.]+\s*만\s*원?\s*(?:이하|내외|대)?/i,
      /예산[:\s]*([^\n]+)/i,
      /[\d,.]+\s*만\s*원?\s*(?:이하|내외)/i,
    ]) ?? firstMatch(summary, [/예산[:\s]*([^\n]+)/i, /월\s*납입[:\s]*([^\n]+)/i]);

  const timing =
    firstMatch(raw, [
      /(?:빠른\s*)?출고[^\n,。]*/i,
      /구매\s*시기[:\s]*([^\n]+)/i,
      /(?:이번|다음)\s*달[^\n,。]*/i,
      /\d+\s*월\s*(?:내|중|말)?\s*출고/i,
    ]) ?? firstMatch(summary, [/구매\s*시기[:\s]*([^\n]+)/i, /출고[:\s]*([^\n]+)/i]);

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

function splitNextActions(nextAction: string): string[] {
  return nextAction
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

export function buildQuickConsultationResult(memo: string, options?: DemoConsultingOptions): QuickConsultationResult {
  const trimmed = memo.trim();
  const identity = parseQuickCustomerIdentity(trimmed);

  if (isSparseQuickConsultation(trimmed)) {
    return buildSparseQuickConsultationResult(trimmed, identity);
  }

  const insights = generateDemoConsultingResponse(trimmed, options);
  const needs = parseQuickConsultationNeeds(trimmed, insights.summary);
  if (identity.vehicle && !needs.vehicle) {
    needs.vehicle = identity.vehicle;
  }
  const nextActions = splitNextActions(insights.nextAction);
  return {
    needs,
    summary: insights.summary.trim(),
    message: insights.message.trim(),
    nextActions: nextActions.length > 0 ? nextActions : [insights.nextAction.trim()].filter(Boolean),
    insights,
  };
}
