import type { Customer } from "./types";
import {
  extractPreferredVehicleModel,
  inferVehicleBrandForModel,
  normalizeInterestVehicle,
} from "./customerContextDraft";

const BRAND_ONLY_RE =
  /^(?:Mercedes[\s-]*Benz|Mercedes-Benz|메르세데스|벤츠|BMW|Audi|아우디|폭스바겐|Volkswagen|렉서스|Lexus|제네시스|Genesis|현대|기아)$/i;

function clampText(s: string, max = 80) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** 고객 카드·상세의 관심 차량 한 줄(모델명 우선 · 메모에서 GLC 등 복구). */
export function formatCustomerInterestVehicle(c: Customer): string {
  const memo = c.memo ?? "";
  const model =
    normalizeInterestVehicle(memo, c.interestedModel) ?? extractPreferredVehicleModel(memo);

  if (model) {
    const inferredBrand = inferVehicleBrandForModel(model);
    const storedBrand = c.vehicleBrand?.trim();
    if (storedBrand && inferredBrand && storedBrand === inferredBrand) {
      return `${storedBrand} ${model}`;
    }
    return model;
  }

  const im = c.interestedModel?.trim();
  if (im && !BRAND_ONLY_RE.test(im)) {
    const brand = c.vehicleBrand?.trim();
    if (brand && !im.toLowerCase().includes(brand.toLowerCase())) {
      return `${brand} ${im}`;
    }
    return im;
  }

  const brand = c.vehicleBrand?.trim();
  if (brand && BRAND_ONLY_RE.test(brand)) {
    const fromMemo = extractPreferredVehicleModel(memo);
    if (fromMemo) return fromMemo;
  }

  const parts = [c.vehicleBrand, c.interestedModel].filter(Boolean).map((p) => String(p).trim());
  return parts.join(" ").trim();
}

/** 고객 카드 다음 행동 라벨(과도하게 긴 AI 문구 축약). */
export function formatCustomerNextActionLabel(raw: string): string {
  const t = raw.trim();
  if (!t) return "—";
  if (/라인별 조건|문자 톤|마지막으로 한 번 더|현재 확인 가능한 조건 기준으로만/i.test(t)) {
    return "월 납입 조건과 출고 가능 일정 확인 후 안내";
  }
  if (/월\s*납입|출고\s*가능|출고\s*일정|견적\s*기준/i.test(t) && t.length > 56) {
    return clampText("월 납입 조건과 출고 가능 일정 확인 후 안내", 56);
  }
  return clampText(t, 56);
}

/** 데모·예시 데이터 기반 AI 요약 한 줄 (실제 AI 연동 없음) */
export function getDemoAiSummaryLine(c: Customer): string {
  const memoRaw = c.memo ?? "";
  const memo = memoRaw.toLowerCase();
  const model =
    normalizeInterestVehicle(memoRaw, c.interestedModel) ?? extractPreferredVehicleModel(memoRaw);

  if (model) {
    const hasPayment = /월\s*납입|납입\s*조건/i.test(memo);
    const hasDelivery = /출고\s*일정|출고\s*희망|출고/i.test(memo);
    if (hasPayment && hasDelivery) {
      return `${model} 관심. 월 납입 조건과 출고 일정 확인 필요.`;
    }
    if (hasPayment) return `${model} 관심. 월 납입 조건 확인 필요.`;
    if (hasDelivery) return `${model} 관심. 출고 일정 확인 필요.`;
    return `${model}에 관심이 있는 고객입니다.`;
  }

  if (memo.includes("glc")) {
    return "GLC 관심. 월 납입 조건과 출고 일정 확인 필요.";
  }

  const modelJoined = [c.vehicleBrand, c.interestedModel].filter(Boolean).join(" ").toLowerCase();
  if (modelJoined.includes("쏘렌토") || modelJoined.includes("소렌토") || memo.includes("가족") || memo.includes("7인")) {
    return "관심 차량 비교와 가족 이동 편의성을 함께 확인하려는 고객입니다.";
  }
  if (memo.includes("할부") || memo.includes("보험") || memo.includes("첫차") || memo.includes("첫 차")) {
    return "월 납입 부담 완화와 빠른 출고 가능 여부를 중요하게 보고 있습니다.";
  }
  if (c.budget?.trim()) {
    return "월 납입·견적 조건과 출고 일정을 함께 검토하는 고객입니다.";
  }

  const firstLine =
    memoRaw
      .split(/\n+/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("[") && !/^(?:다음 행동|ai 요약)/i.test(l)) ?? "";
  if (firstLine && firstLine.length <= 52) {
    return firstLine;
  }

  if (memoRaw.trim()) {
    return clampText(memoRaw.replace(/\s+/g, " "), 52);
  }
  return "상담 메모를 바탕으로 AI 비서가 니즈를 정리한 고객입니다.";
}
