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

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[0]) return m[0].trim();
  }
  return undefined;
}

/** 상담 원문에서 MVP 표시용 니즈 필드를 추출(규칙 기반 · optional). */
export function parseQuickConsultationNeeds(memo: string, summary: string): QuickConsultationNeeds {
  const raw = memo.trim();
  const vehicle =
    firstMatch(raw, [
      /(?:관심\s*)?(?:차량|모델)?\s*[:\-]?\s*([A-Za-z가-힣0-9\s\-]+(?:class|클래스|시리즈|라인)?)/i,
      /\b(GLC|GLE|GLS|C-Class|E-Class|S-Class|3시리즈|5시리즈|그랜저|쏘렌토|카니발|투싼|아반떼|K\d|EV\d)[^\n,。]*/i,
    ]) ?? firstMatch(summary, [/관심\s*차량[:\s]*([^\n]+)/i]);

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
  const insights = generateDemoConsultingResponse(memo.trim(), options);
  const needs = parseQuickConsultationNeeds(memo, insights.summary);
  const nextActions = splitNextActions(insights.nextAction);
  return {
    needs,
    summary: insights.summary.trim(),
    message: insights.message.trim(),
    nextActions: nextActions.length > 0 ? nextActions : [insights.nextAction.trim()].filter(Boolean),
    insights,
  };
}
