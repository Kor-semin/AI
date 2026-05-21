/** 중고차 등급/트림 — 공통 차량 카탈로그 기준(브랜드별 분리) */

import {
  getCatalogTrimSuggestions,
  resolveCatalogBrand,
} from "./vehicleCatalog";

/** 브랜드 문자열 → 카탈로그 브랜드 id(미지정·기타는 null) */
export function normalizeUsedCarBrandKey(brand?: string): string | null {
  const resolved = resolveCatalogBrand(brand ?? "");
  return resolved?.id ?? null;
}

/** 선택 브랜드에 맞는 트림 추천 후보만 반환(브랜드 미정·기타는 빈 배열). */
export function getUsedCarTrimSuggestions(brand?: string, model?: string): string[] {
  const resolved = resolveCatalogBrand(brand ?? "");
  if (!resolved) return [];
  return getCatalogTrimSuggestions(resolved.displayName, model);
}

/** datalist용 — 현재 입력값이 후보에 없으면 맨 앞에 유지 */
export function buildUsedCarTrimDatalistOptions(
  brand: string | undefined,
  currentTrim?: string,
  model?: string,
): string[] {
  const suggestions = getUsedCarTrimSuggestions(brand, model);
  const cur = (currentTrim ?? "").trim();
  if (!cur) return suggestions;
  if (suggestions.includes(cur)) return suggestions;
  return [cur, ...suggestions];
}
