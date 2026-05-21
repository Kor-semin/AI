/**
 * Sensora 공통 차량 카탈로그 — 브랜드 · 차종 · 트림(등급)
 * 공식 홈페이지 기준 대표 라인업(1차). 미등록 차종/트림은 자유 입력으로 보존.
 */

export type VehicleCatalogCountry = "KR" | "DE" | "JP" | "SE" | "US" | "UK" | "FR" | "IT";

export type VehicleCatalogBodyType =
  | "sedan"
  | "suv"
  | "hatchback"
  | "coupe"
  | "wagon"
  | "van"
  | "ev"
  | "pickup"
  | "other";

export type VehicleCatalogTrim = {
  id: string;
  displayName: string;
  aliases: string[];
  note?: string;
};

export type VehicleCatalogModel = {
  id: string;
  displayName: string;
  aliases: string[];
  bodyType?: VehicleCatalogBodyType;
  powertrain?: string[];
  trims?: VehicleCatalogTrim[];
  /** false면 트림·세부는 참고용(확정 DB 아님) */
  isOfficialConfirmed?: boolean;
};

export type VehicleCatalogBrand = {
  id: string;
  displayName: string;
  aliases: string[];
  country?: VehicleCatalogCountry;
  sourceLabel?: string;
  sourceUrl?: string;
  updatedAt?: string;
  models: VehicleCatalogModel[];
};

const CATALOG_UPDATED = "2026-05-21";

function trim(id: string, displayName: string, aliases: string[] = [], note?: string): VehicleCatalogTrim {
  return { id, displayName, aliases: [displayName, ...aliases], note };
}

function model(
  id: string,
  displayName: string,
  aliases: string[] = [],
  opts?: Partial<Pick<VehicleCatalogModel, "bodyType" | "powertrain" | "trims" | "isOfficialConfirmed">>,
): VehicleCatalogModel {
  return {
    id,
    displayName,
    aliases: [displayName, ...aliases],
    isOfficialConfirmed: opts?.isOfficialConfirmed ?? true,
    ...opts,
  };
}

/** 1차 브랜드 · 대표 차종(확장 가능) */
export const VEHICLE_CATALOG: readonly VehicleCatalogBrand[] = [
  {
    id: "hyundai",
    displayName: "현대",
    aliases: ["현대", "hyundai", "Hyundai"],
    country: "KR",
    sourceLabel: "현대자동차 공식 홈페이지",
    sourceUrl: "https://www.hyundai.com/kr/ko/e",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("avante", "아반떼", ["avante", "Avante"], { bodyType: "sedan", trims: [trim("modern", "Modern"), trim("inspiration", "Inspiration"), trim("nline", "N Line", ["N라인"])] }),
      model("sonata", "쏘나타", ["sonata", "쏘나타 디 엣지"], { bodyType: "sedan", trims: [trim("premium", "Premium"), trim("inspiration", "Inspiration")] }),
      model("grandeur", "그랜저", ["grandeur", "그랜저 캘리그래피"], { bodyType: "sedan", trims: [trim("calligraphy", "Calligraphy", ["캘리그래피"])] }),
      model("palisade", "팰리세이드", ["palisade"], { bodyType: "suv" }),
      model("tucson", "투싼", ["tucson"], { bodyType: "suv" }),
      model("santafe", "싼타페", ["santafe", "싼타 페"], { bodyType: "suv" }),
      model("kona", "코나", ["kona", "코나 일렉트릭"], { bodyType: "suv", powertrain: ["EV", "HEV"] }),
      model("ioniq5", "아이오닉5", ["ioniq 5", "IONIQ5"], { bodyType: "ev" }),
      model("ioniq6", "아이오닉6", ["ioniq 6"], { bodyType: "ev" }),
      model("staria", "스타리아", ["staria"], { bodyType: "van" }),
    ],
  },
  {
    id: "kia",
    displayName: "기아",
    aliases: ["기아", "kia", "Kia"],
    country: "KR",
    sourceLabel: "기아 공식 홈페이지",
    sourceUrl: "https://www.kia.com/kr",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("k3", "K3", ["k3", "K3 세단"], { bodyType: "sedan" }),
      model("k5", "K5", ["k5", "K5 하이브리드"], { bodyType: "sedan", powertrain: ["HEV"] }),
      model("k8", "K8", ["k8"], { bodyType: "sedan" }),
      model(
        "sorento-hybrid",
        "쏘렌토 · 하이브리드",
        ["쏘렌토 하이브리드", "쏘렌토하이브리드", "소렌토 하이브리드", "쏘렌트 하이브리드", "sorento hybrid", "Sorento Hybrid"],
        { bodyType: "suv", powertrain: ["HEV"], trims: [trim("prestige", "Prestige"), trim("noblesse", "Noblesse"), trim("signature", "Signature")] },
      ),
      model("sorento", "쏘렌토", ["쏘렌토", "소렌토", "쏘렌트", "sorento"], { bodyType: "suv" }),
      model("sportage", "스포티지", ["sportage", "스포티지 하이브리드"], { bodyType: "suv", powertrain: ["HEV"] }),
      model("carnival", "카니발", ["carnival", "카니발 하이브리드"], { bodyType: "van" }),
      model("seltos", "셀토스", ["seltos"], { bodyType: "suv" }),
      model("ev6", "EV6", ["ev6"], { bodyType: "ev" }),
      model("ray", "레이", ["ray", "레이 EV"], { bodyType: "hatchback" }),
    ],
  },
  {
    id: "genesis",
    displayName: "제네시스",
    aliases: ["제네시스", "genesis", "Genesis"],
    country: "KR",
    sourceLabel: "제네시스 공식 홈페이지",
    sourceUrl: "https://www.genesis.com/kr/ko/index.html",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("g70", "G70", ["g70"], { bodyType: "sedan" }),
      model("g80", "G80", ["g80"], { bodyType: "sedan", trims: [trim("prestige", "Prestige"), trim("signature", "Signature")] }),
      model("g90", "G90", ["g90"], { bodyType: "sedan" }),
      model("gv60", "GV60", ["gv60"], { bodyType: "suv", powertrain: ["EV"] }),
      model("gv70", "GV70", ["gv70", "GV70 일렉트리파이드"], { bodyType: "suv" }),
      model("gv80", "GV80", ["gv80"], { bodyType: "suv" }),
    ],
  },
  {
    id: "mercedes-benz",
    displayName: "Mercedes-Benz",
    aliases: ["Mercedes-Benz", "Mercedes Benz", "메르세데스", "메르세데스-벤츠", "벤츠", "mercedes", "benz"],
    country: "DE",
    sourceLabel: "Mercedes-Benz Korea 공식 홈페이지",
    sourceUrl: "https://www.mercedes-benz.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("cla", "CLA", ["cla-class"], { bodyType: "sedan" }),
      model("gla", "GLA", ["gla-class"], { bodyType: "suv" }),
      model("glb", "GLB", ["glb-class"], { bodyType: "suv" }),
      model("glc", "GLC", ["glc300", "glc 300", "glc-class", "GLC300"], { bodyType: "suv", trims: [trim("avantgarde", "Avantgarde"), trim("exclusive", "Exclusive"), trim("amg-line", "AMG Line", ["AMG라인", "amg line"])] }),
      model("gle", "GLE", ["gle450", "gle-class"], { bodyType: "suv", trims: [trim("amg-line", "AMG Line")] }),
      model("gls", "GLS", ["gls-class"], { bodyType: "suv" }),
      model("c-class", "C-Class", ["c class", "c클래스", "C클래스"], { bodyType: "sedan", isOfficialConfirmed: false }),
      model("e-class", "E-Class", ["e class", "e클래스"], { bodyType: "sedan", isOfficialConfirmed: false }),
      model("s-class", "S-Class", ["s class", "s클래스"], { bodyType: "sedan", isOfficialConfirmed: false }),
      model("eqe", "EQE", ["eqe suv"], { bodyType: "ev" }),
    ],
  },
  {
    id: "bmw",
    displayName: "BMW",
    aliases: ["BMW", "bmw", "비엠", "비엠더블유", "비엠더블유"],
    country: "DE",
    sourceLabel: "BMW Korea 공식 홈페이지",
    sourceUrl: "https://www.bmw.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("3-series", "3 Series", ["3시리즈", "320i", "330i"], { bodyType: "sedan", trims: [trim("m-sport", "M Sport", ["엠스포츠", "m sport"]), trim("luxury", "Luxury Line")] }),
      model("5-series", "5 Series", ["5시리즈", "520i", "530i"], { bodyType: "sedan", trims: [trim("m-sport", "M Sport")] }),
      model("x1", "X1", ["x1"], { bodyType: "suv" }),
      model("x3", "X3", ["x3", "x3 xdrive"], { bodyType: "suv", trims: [trim("m-sport", "M Sport"), trim("xline", "xLine")] }),
      model("x5", "X5", ["x5", "x5 50e", "x550e", "x5 xdrive", "x6"], { bodyType: "suv", trims: [trim("m-sport", "M Sport"), trim("xline", "xLine")] }),
      model("x6", "X6", ["x6 xdrive"], { bodyType: "suv", trims: [trim("m-sport", "M Sport")] }),
      model("i4", "i4", ["i4"], { bodyType: "ev" }),
      model("ix", "iX", ["ix"], { bodyType: "ev" }),
    ],
  },
  {
    id: "mini",
    displayName: "MINI",
    aliases: ["MINI", "mini", "미니", "Mini"],
    country: "DE",
    sourceLabel: "MINI Korea 공식 홈페이지",
    sourceUrl: "https://www.mini.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("cooper", "Cooper", ["쿠퍼", "mini cooper", "MINI Cooper"], { bodyType: "hatchback" }),
      model("countryman", "Countryman", ["컨트리맨", "country man"], { bodyType: "suv" }),
      model("clubman", "Clubman", ["클럽맨"], { bodyType: "wagon", isOfficialConfirmed: false }),
    ],
  },
  {
    id: "audi",
    displayName: "Audi",
    aliases: ["Audi", "audi", "아우디"],
    country: "DE",
    sourceLabel: "Audi Korea 공식 홈페이지",
    sourceUrl: "https://www.audi.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("a3", "A3", ["a3"], { bodyType: "sedan" }),
      model("a4", "A4", ["a4 premium", "a4 prestige"], { bodyType: "sedan", trims: [trim("premium", "Premium"), trim("prestige", "Prestige"), trim("s-line", "S line", ["S라인"])] }),
      model("a6", "A6", ["a6"], { bodyType: "sedan", trims: [trim("premium", "Premium"), trim("prestige", "Prestige")] }),
      model("q3", "Q3", ["q3"], { bodyType: "suv" }),
      model("q5", "Q5", ["q5"], { bodyType: "suv", trims: [trim("premium", "Premium"), trim("prestige", "Prestige"), trim("s-line", "S line")] }),
      model("q7", "Q7", ["q7"], { bodyType: "suv" }),
      model("q8", "Q8", ["q8"], { bodyType: "suv" }),
      model("etron", "e-tron", ["etron", "e tron"], { bodyType: "ev", isOfficialConfirmed: false }),
    ],
  },
  {
    id: "volkswagen",
    displayName: "Volkswagen",
    aliases: ["Volkswagen", "volkswagen", "폭스바겐", "폭스바겠", "VW"],
    country: "DE",
    sourceLabel: "Volkswagen Korea 공식 홈페이지",
    sourceUrl: "https://www.volkswagen.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("golf", "Golf", ["골프"], { bodyType: "hatchback" }),
      model("tiguan", "Tiguan", ["티구안", "tiguan"], { bodyType: "suv" }),
      model("passat", "Passat", ["파사트"], { bodyType: "sedan", isOfficialConfirmed: false }),
      model("id4", "ID.4", ["id4", "id.4"], { bodyType: "ev" }),
    ],
  },
  {
    id: "volvo",
    displayName: "Volvo",
    aliases: ["Volvo", "volvo", "볼보"],
    country: "SE",
    sourceLabel: "Volvo Cars Korea 공식 홈페이지",
    sourceUrl: "https://www.volvocars.com/kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("s60", "S60", ["s60"], { bodyType: "sedan" }),
      model("s90", "S90", ["s90"], { bodyType: "sedan" }),
      model("xc40", "XC40", ["xc40"], { bodyType: "suv" }),
      model("xc60", "XC60", ["xc60"], { bodyType: "suv" }),
      model("xc90", "XC90", ["xc90"], { bodyType: "suv" }),
    ],
  },
  {
    id: "lexus",
    displayName: "Lexus",
    aliases: ["Lexus", "lexus", "렉서스"],
    country: "JP",
    sourceLabel: "Lexus Korea 공식 홈페이지",
    sourceUrl: "https://www.lexus.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("es", "ES", ["es"], { bodyType: "sedan" }),
      model("rx", "RX", ["rx"], { bodyType: "suv" }),
      model("nx", "NX", ["nx"], { bodyType: "suv" }),
      model("ux", "UX", ["ux"], { bodyType: "suv" }),
      model("ls", "LS", ["ls"], { bodyType: "sedan", isOfficialConfirmed: false }),
    ],
  },
  {
    id: "toyota",
    displayName: "Toyota",
    aliases: ["Toyota", "toyota", "토요타", "도요타"],
    country: "JP",
    sourceLabel: "Toyota Korea 공식 홈페이지",
    sourceUrl: "https://www.toyota.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("camry", "Camry", ["캠리"], { bodyType: "sedan" }),
      model("rav4", "RAV4", ["rav4"], { bodyType: "suv" }),
      model("crown", "Crown", ["크라운"], { bodyType: "sedan", isOfficialConfirmed: false }),
      model("highlander", "Highlander", ["하이랜더"], { bodyType: "suv", isOfficialConfirmed: false }),
    ],
  },
  {
    id: "porsche",
    displayName: "Porsche",
    aliases: ["Porsche", "porsche", "포르쉐"],
    country: "DE",
    sourceLabel: "Porsche Korea 공식 홈페이지",
    sourceUrl: "https://www.porsche.com/korea/ko/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("911", "911", ["911 carrera"], { bodyType: "coupe", isOfficialConfirmed: false }),
      model("cayenne", "Cayenne", ["카이엔"], { bodyType: "suv" }),
      model("macan", "Macan", ["마칸"], { bodyType: "suv" }),
    ],
  },
  {
    id: "land-rover",
    displayName: "Land Rover",
    aliases: ["Land Rover", "land rover", "랜드로버", "랜드 로버"],
    country: "UK",
    sourceLabel: "Jaguar Land Rover Korea 공식 홈페이지",
    sourceUrl: "https://www.landroverkorea.co.kr/",
    updatedAt: CATALOG_UPDATED,
    models: [
      model("discovery-sport", "Discovery Sport", ["디스커버리 스포츠"], { bodyType: "suv" }),
      model("defender", "Defender", ["디펜더"], { bodyType: "suv" }),
      model("range-rover-evoque", "Range Rover Evoque", ["이보크", "evoque"], { bodyType: "suv", isOfficialConfirmed: false }),
    ],
  },
] as const;

/** 기존 고객 데이터·확장 브랜드(카탈로그 1차 외) */
const LEGACY_BRAND_OPTIONS = [
  "쉐보레(GM)",
  "르노코리아(삼성)",
  "KG모빌리티(쌍용)",
  "테슬라",
  "폴스타",
  "혼다",
] as const;

const LEGACY_MODELS_BY_BRAND: Record<string, readonly string[]> = {
  "쉐보레(GM)": ["트레일블레이저 · 트래버스 성격 상담", "픽업·코로라도 등 문의", "기타(직접비고)"],
  "르노코리아(삼성)": ["XM3 · 아르카나", "QM6", "레거시(SM 등) 차량 검토 고객", "기타(직접비고)"],
  "KG모빌리티(쌍용)": ["티볼리", "코란도 · 코란도 EV", "렉스턴 스포츠 · 스포츠 칸", "토레스", "상용 차량 등", "기타(직접비고)"],
  테슬라: ["Model 3", "Model Y", "Model S · X 등", "기타(직접비고)"],
  폴스타: ["폴스타 2", "폴스타 3 예약·상담", "기타(직접비고)"],
  혼다: ["CR-V", "파일럿 라인 검토 가능", "e:N 라인 등", "기타(직접비고)"],
};

export const VEHICLE_BRANDS = [
  ...VEHICLE_CATALOG.map((b) => b.displayName),
  ...LEGACY_BRAND_OPTIONS,
  "기타",
] as const;

export type VehicleBrandId = (typeof VEHICLE_BRANDS)[number];

const CATALOG_OTHER_SUFFIX = "기타(직접비고)";

function catalogModelSelectOptions(brand: VehicleCatalogBrand): string[] {
  const names = brand.models.map((m) => m.displayName);
  return [...names, CATALOG_OTHER_SUFFIX];
}

/** 브랜드별 차종(드롭다운). ‘기타’ 브랜드는 빈 목록. */
export const MODELS_BY_BRAND: Record<VehicleBrandId, readonly string[]> = (() => {
  const out = {} as Record<VehicleBrandId, readonly string[]>;
  for (const b of VEHICLE_CATALOG) {
    out[b.displayName as VehicleBrandId] = catalogModelSelectOptions(b);
  }
  for (const [k, v] of Object.entries(LEGACY_MODELS_BY_BRAND)) {
    out[k as VehicleBrandId] = v;
  }
  out.기타 = [];
  return out;
})();

export function vehicleModelsFor(brand?: string): readonly string[] {
  if (!brand) return [];
  const resolved = resolveCatalogBrand(brand);
  if (resolved) return MODELS_BY_BRAND[resolved.displayName as VehicleBrandId] ?? [];
  const normalized = brand === "폭스바겠" ? "Volkswagen" : brand;
  const b = normalized as VehicleBrandId;
  return MODELS_BY_BRAND[b] ?? [];
}

// ─── 조회 · 정규화 ─────────────────────────────────────────────

function foldAlias(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

export function normalizeKoreanVehicleSpellingInCatalog(text: string): string {
  return text
    .replace(/쏘렌트\s*하이브리드/gi, "쏘렌토 하이브리드")
    .replace(/소렌토\s*하이브리드/gi, "쏘렌토 하이브리드")
    .replace(/쏘렌트/gi, "쏘렌토")
    .replace(/소렌토/gi, "쏘렌토")
    .replace(/폭스바겠/gi, "Volkswagen")
    .replace(/메르세데스\s*벤츠/gi, "Mercedes-Benz")
    .replace(/메르세데스/gi, "Mercedes-Benz")
    .replace(/비엠더블유/gi, "BMW")
    .replace(/비엠\s*(?:더블유|W)/gi, "BMW")
    .replace(/아우디/gi, "Audi")
    .replace(/미니/gi, "MINI")
    .replace(/엠스포츠/gi, "M Sport")
    .replace(/amg\s*라인/gi, "AMG Line");
}

export function resolveCatalogBrand(input?: string): VehicleCatalogBrand | undefined {
  const raw = (input ?? "").trim();
  if (!raw) return undefined;
  const folded = foldAlias(normalizeKoreanVehicleSpellingInCatalog(raw));
  for (const b of VEHICLE_CATALOG) {
    if (foldAlias(b.displayName) === folded) return b;
    for (const a of b.aliases) {
      if (foldAlias(a) === folded) return b;
    }
  }
  if (folded === "벤츠" || folded.includes("mercedes")) {
    return VEHICLE_CATALOG.find((b) => b.id === "mercedes-benz");
  }
  if (folded === "폭스바겐" || folded === "vw") {
    return VEHICLE_CATALOG.find((b) => b.id === "volkswagen");
  }
  return undefined;
}

export function getCatalogBrandById(id: string): VehicleCatalogBrand | undefined {
  return VEHICLE_CATALOG.find((b) => b.id === id);
}

function modelAliasMatches(textFolded: string, m: VehicleCatalogModel): boolean {
  for (const a of m.aliases) {
    const af = foldAlias(a);
    if (!af) continue;
    if (textFolded === af) return true;
    if (af.length >= 3 && textFolded.includes(af)) return true;
    const re = new RegExp(`\\b${af.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(textFolded)) return true;
  }
  return false;
}

function findCatalogModel(brand: VehicleCatalogBrand, text: string): VehicleCatalogModel | undefined {
  const folded = foldAlias(normalizeKoreanVehicleSpellingInCatalog(text));
  const sorted = [...brand.models].sort((a, b) => {
    const al = Math.max(...a.aliases.map((x) => foldAlias(x).length));
    const bl = Math.max(...b.aliases.map((x) => foldAlias(x).length));
    return bl - al;
  });
  for (const m of sorted) {
    if (modelAliasMatches(folded, m)) return m;
  }
  return undefined;
}

function findCatalogTrim(model: VehicleCatalogModel, remainder: string): VehicleCatalogTrim | undefined {
  const folded = foldAlias(remainder);
  if (!folded || !model.trims?.length) return undefined;
  const sorted = [...model.trims].sort((a, b) => b.displayName.length - a.displayName.length);
  for (const t of sorted) {
    for (const a of t.aliases) {
      const af = foldAlias(a);
      if (af && (folded === af || folded.includes(af))) return t;
    }
  }
  return undefined;
}

/** 모델 코드·차종 문자열 → 카탈로그 브랜드 표시명 */
export function inferCatalogBrandForModelText(model: string): string | undefined {
  const m = normalizeKoreanVehicleSpellingInCatalog(model.trim());
  if (!m) return undefined;
  for (const b of VEHICLE_CATALOG) {
    if (findCatalogModel(b, m)) return b.displayName;
  }
  const upper = m.toUpperCase();
  const tokenMap: Record<string, string> = {
    GLC: "Mercedes-Benz",
    GLE: "Mercedes-Benz",
    GLS: "Mercedes-Benz",
    GLA: "Mercedes-Benz",
    GLB: "Mercedes-Benz",
    CLA: "Mercedes-Benz",
    EQE: "Mercedes-Benz",
    X1: "BMW",
    X3: "BMW",
    X5: "BMW",
    X6: "BMW",
    A3: "Audi",
    A4: "Audi",
    A6: "Audi",
    Q3: "Audi",
    Q5: "Audi",
    Q7: "Audi",
    GV70: "제네시스",
    GV80: "제네시스",
    GV60: "제네시스",
    G80: "제네시스",
    G90: "제네시스",
    G70: "제네시스",
  };
  for (const [token, brand] of Object.entries(tokenMap)) {
    if (upper.includes(token)) return brand;
  }
  if (/쏘렌토|카니발|스포티지|^K[358]\b/i.test(m)) return "기아";
  if (/그랜저|아반떼|투싼|팰리세이드|싼타페|코나|아이오닉/i.test(m)) return "현대";
  if (/^G[V]\d|^G[789]0?\b/i.test(m)) return "제네시스";
  if (/3시리즈|5시리즈|7시리즈|1시리즈/i.test(m)) return "BMW";
  if (/쿠퍼|컨트리맨|countryman|cooper/i.test(m)) return "MINI";
  return undefined;
}

export type ParsedVehicleInterest = {
  brandDisplayName?: string;
  modelDisplayName?: string;
  trimDisplayName?: string;
  /** 고객 interestedModel 등에 넣을 한 줄(카탈로그 매칭 시) */
  interestedModelLabel?: string;
  /** 카탈로그 옵션 문자열(드롭다운 일치용) */
  catalogModelOption?: string;
  /** 매칭 후 남은 자유 입력(절대 덮어쓰지 않음) */
  freeformRemainder?: string;
};

function stripBrandPrefix(text: string, brand: VehicleCatalogBrand): string {
  let rest = text.trim();
  const candidates = [brand.displayName, ...brand.aliases];
  for (const a of candidates.sort((x, y) => y.length - x.length)) {
    const re = new RegExp(`^${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i");
    rest = rest.replace(re, "").trim();
  }
  return rest;
}

function compactModelToken(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

/** GLC300 → GLC, X550e → X5 등 붙은 모델 코드 분리 */
function expandCompactModelCodes(rest: string, brand: VehicleCatalogBrand): string {
  let r = rest;
  if (brand.id === "mercedes-benz") {
    r = r.replace(/\bGLC\s*3?\s*0?\s*0?\b/gi, "GLC");
    r = r.replace(/\bGLC(\d{2,3})\b/gi, "GLC");
    r = r.replace(/\bGLE(\d{2,3})\b/gi, "GLE");
  }
  if (brand.id === "bmw") {
    r = r.replace(/\bX([1-7])\s*50e\b/gi, "X$1");
    r = r.replace(/\bX([1-7])(\d{2,3}[a-z]?)\b/gi, "X$1");
  }
  return r;
}

/** 상담·AI 입력 한 줄에서 브랜드·차종·트림 분리(없으면 freeform 보존). */
export function parseVehicleInterest(raw: string): ParsedVehicleInterest {
  const text = normalizeKoreanVehicleSpellingInCatalog(raw.trim());
  if (!text) return {};

  let brand = resolveCatalogBrand(text);
  let rest = text;

  if (!brand) {
    for (const b of VEHICLE_CATALOG) {
      for (const a of [b.displayName, ...b.aliases].sort((x, y) => y.length - x.length)) {
        if (foldAlias(text).includes(foldAlias(a)) && a.length >= 2) {
          brand = b;
          rest = stripBrandPrefix(text, b);
          break;
        }
      }
      if (brand) break;
    }
  } else {
    rest = stripBrandPrefix(text, brand);
  }

  if (!brand) {
    const inferred = inferCatalogBrandForModelText(text);
    if (inferred) {
      brand = resolveCatalogBrand(inferred);
      rest = text;
    }
  }

  if (!brand) {
    return { freeformRemainder: text, interestedModelLabel: text };
  }

  rest = expandCompactModelCodes(rest, brand);
  const catalogModel = findCatalogModel(brand, rest) ?? findCatalogModel(brand, text);

  if (!catalogModel) {
    return {
      brandDisplayName: brand.displayName,
      freeformRemainder: rest || text,
      interestedModelLabel: rest || text,
    };
  }

  let remainder = rest;
  const primaryAlias = catalogModel.displayName;
  remainder = remainder
    .replace(new RegExp(`\\b${primaryAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), " ")
    .trim();
  if (brand.id === "mercedes-benz") {
    remainder = remainder.replace(/\bGLC\d{0,3}\b/gi, " ").replace(/\bGLE\d{0,3}\b/gi, " ");
  }
  if (brand.id === "bmw") {
    remainder = remainder.replace(/\bX([1-7])\s*\d{2,3}[a-z]?\b/gi, " ").replace(/\bX([1-7])50e\b/gi, " ");
  }
  remainder = remainder.replace(/\b\d{2,3}[a-z]?\b/gi, " ").replace(/\s+/g, " ").trim();

  const catalogTrim = findCatalogTrim(catalogModel, remainder);
  const trimName = catalogTrim?.displayName;
  const freeform =
    remainder && !catalogTrim
      ? remainder
      : catalogTrim && remainder.replace(new RegExp(catalogTrim.displayName, "i"), "").trim()
        ? remainder
        : undefined;

  const interestedModelLabel = formatInterestedModelLabel(catalogModel.displayName, trimName);

  return {
    brandDisplayName: brand.displayName,
    modelDisplayName: catalogModel.displayName,
    trimDisplayName: trimName,
    catalogModelOption: catalogModel.displayName,
    interestedModelLabel: freeform?.trim() ? `${interestedModelLabel} ${freeform}`.trim() : interestedModelLabel,
    freeformRemainder: freeform?.trim() || undefined,
  };
}

export function formatInterestedModelLabel(model: string, trim?: string): string {
  const m = model.trim();
  const t = trim?.trim();
  if (!m) return t ?? "";
  if (!t) return m;
  if (m.includes("·") && m.toLowerCase().includes(t.toLowerCase())) return m;
  return `${m} · ${t}`;
}

function normalizeCatalogModelKey(text: string): string {
  return text.replace(/\s*·\s*/g, " ").replace(/\s+/g, " ").trim();
}

/** 브랜드 카탈로그 옵션에 맞게 관심 차종 표기(쏘렌토 하이브리드 → 쏘렌토 · 하이브리드 등). */
export function mapInterestedModelForBrand(
  brand: string | undefined,
  model: string | undefined,
): string | undefined {
  if (!model?.trim()) return undefined;
  const m = normalizeKoreanVehicleSpellingInCatalog(model.trim());
  const b = brand?.trim();
  if (!b) return m;

  const parsed = parseVehicleInterest(`${b} ${m}`);
  if (parsed.catalogModelOption && parsed.brandDisplayName === resolveCatalogBrand(b)?.displayName) {
    const opts = vehicleModelsFor(b);
    const label = parsed.interestedModelLabel ?? parsed.catalogModelOption;
    if (opts.includes(label)) return label;
    if (opts.includes(parsed.catalogModelOption)) {
      return parsed.trimDisplayName
        ? formatInterestedModelLabel(parsed.catalogModelOption, parsed.trimDisplayName)
        : parsed.catalogModelOption;
    }
    for (const opt of opts) {
      if (normalizeCatalogModelKey(opt) === normalizeCatalogModelKey(label)) return opt;
    }
    if (parsed.catalogModelOption) return parsed.interestedModelLabel ?? parsed.catalogModelOption;
  }

  const opts = [...vehicleModelsFor(b as VehicleBrandId)];
  if (opts.includes(m)) return m;
  const target = normalizeCatalogModelKey(m);
  for (const opt of opts) {
    if (normalizeCatalogModelKey(opt) === target) return opt;
  }
  return m;
}

export function isInterestedModelInBrandCatalog(brand: string, model: string): boolean {
  const b = brand.trim();
  const m = model.trim();
  if (!b || b === "기타" || !m) return false;
  const opts = [...vehicleModelsFor(b as VehicleBrandId)];
  if (opts.includes(m)) return true;
  const mapped = mapInterestedModelForBrand(b, m);
  return mapped ? opts.includes(mapped) : false;
}

/** 중고차·금융 datalist — 브랜드 후보(별칭 포함) */
export function getUsedCarBrandDatalistOptions(): string[] {
  const names = new Set<string>();
  for (const b of VEHICLE_CATALOG) {
    names.add(b.displayName);
    if (b.id === "mercedes-benz") names.add("벤츠");
    if (b.id === "volkswagen") names.add("폭스바겐");
    if (b.id === "toyota") names.add("토요타");
    if (b.id === "lexus") names.add("렉서스");
    if (b.id === "land-rover") names.add("랜드로버");
  }
  return [...names];
}

/** 중고차 차종 datalist — 단순 모델명(하이브리드 묶음 제외) */
export function getUsedCarModelDatalistOptions(brand?: string): string[] {
  const b = resolveCatalogBrand(brand ?? "");
  if (!b) return [];
  return b.models.map((m) => {
    const d = m.displayName;
    if (d.includes(" · ")) return d.split(" · ")[0]!.trim();
    return d;
  });
}

/** 브랜드·차종 기준 트림 후보(Audi quattro는 Audi만). */
export function getCatalogTrimSuggestions(brand?: string, modelDisplay?: string): string[] {
  const b = resolveCatalogBrand(brand ?? "");
  if (!b) return [];
  let models = b.models;
  if (modelDisplay?.trim()) {
    const hit =
      findCatalogModel(b, modelDisplay) ??
      b.models.find((m) => foldAlias(m.displayName) === foldAlias(modelDisplay));
    models = hit ? [hit] : models;
  }
  const out = new Set<string>();
  for (const m of models) {
    for (const t of m.trims ?? []) out.add(t.displayName);
  }
  return [...out];
}

/** 금융 조건 — 차명·트림 입력 보조 */
export function getFinanceVehicleNameSuggestions(customerBrand?: string, interestedModel?: string): string[] {
  const b = resolveCatalogBrand(customerBrand ?? "");
  if (!b) return interestedModel?.trim() ? [interestedModel.trim()] : [];
  const models = b.models.map((m) => m.displayName);
  const cur = interestedModel?.trim();
  if (cur && !models.includes(cur)) return [cur, ...models];
  return models;
}

export function getFinanceVehicleTrimSuggestions(
  customerBrand?: string,
  vehicleName?: string,
): string[] {
  return getCatalogTrimSuggestions(customerBrand, vehicleName);
}
