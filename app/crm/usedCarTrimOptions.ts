/** 중고차 등급/트림 — 브랜드별 입력 보조 후보(정확한 트림 DB 아님) */

const TRIM_BY_BRAND_KEY: Record<string, string[]> = {
  mercedes: ["Avantgarde", "Exclusive", "AMG Line", "AMG", "4MATIC", "Maybach", "Edition"],
  bmw: ["M Sport", "xLine", "Luxury Line", "M Performance", "M", "xDrive"],
  audi: ["S line", "quattro", "Premium", "Prestige", "Sportback", "S", "RS"],
  genesis: ["기본형", "스포츠 패키지", "AWD", "Prestige", "Signature"],
  hyundai: ["Modern", "Premium", "Inspiration", "Calligraphy", "N Line"],
  kia: ["Prestige", "Noblesse", "Signature", "Gravity", "GT Line"],
};

/** 브랜드 문자열 → 내부 키(미지정·기타 브랜드는 null) */
export function normalizeUsedCarBrandKey(brand?: string): string | null {
  const b = (brand ?? "").trim().toLowerCase();
  if (!b) return null;
  if (b === "벤츠" || b === "mercedes" || b === "mercedes-benz" || b.includes("메르세데스")) {
    return "mercedes";
  }
  if (b === "bmw" || b.includes("비엠")) return "bmw";
  if (b === "audi" || b === "아우디") return "audi";
  if (b === "제네시스" || b === "genesis") return "genesis";
  if (b === "현대" || b === "hyundai") return "hyundai";
  if (b === "기아" || b === "kia") return "kia";
  return null;
}

/** 선택 브랜드에 맞는 트림 추천 후보만 반환(브랜드 미정·기타는 빈 배열). */
export function getUsedCarTrimSuggestions(brand?: string): string[] {
  const key = normalizeUsedCarBrandKey(brand);
  if (!key) return [];
  return [...(TRIM_BY_BRAND_KEY[key] ?? [])];
}

/** datalist용 — 현재 입력값이 후보에 없으면 맨 앞에 유지 */
export function buildUsedCarTrimDatalistOptions(brand: string | undefined, currentTrim?: string): string[] {
  const suggestions = getUsedCarTrimSuggestions(brand);
  const cur = (currentTrim ?? "").trim();
  if (!cur) return suggestions;
  if (suggestions.includes(cur)) return suggestions;
  return [cur, ...suggestions];
}
