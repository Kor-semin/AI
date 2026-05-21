import type { Customer } from "./types";
import {
  buildCustomerAiSummaryLine,
  extractPreferredVehicleModel,
  inferVehicleBrandForModel,
  normalizeInterestVehicle,
  polishNextActionForDisplay,
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
  const polished = polishNextActionForDisplay(t);
  return clampText(polished, 56);
}

/** 데모·예시 데이터 기반 AI 요약 (실제 AI 연동 없음) */
export function getDemoAiSummaryLine(c: Customer): string {
  return buildCustomerAiSummaryLine(c);
}
