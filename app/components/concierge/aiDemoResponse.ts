export type DemoConsultingResponse = {
  summary: string;
  nextAction: string;
  message: string;
};

/** 영업 문자 톤(데모). */
export type DemoSalesStyle = "polite" | "simple" | "premium" | "friendly" | "active";

/**
 * 향후 견적서 PDF/OCR·금융 견적 API 연동 시 채워 넣을 요약 블록 자리입니다.
 * 지금 데모는 이 필드를 받아도 규칙 기반 문자에 추가만 가능하도록 분리했습니다.
 */
export type DemoFinanceQuoteSummary = {
  /** 사람이 적어 둔 견적 핵심 문자열(예: OCR 후 텍스트) */
  rawLines?: string[];
  /** 구조화된 조건 예시 키(선택). */
  productTypeHint?: ("installment" | "lease" | "longRent")[];
  memo?: string;
};

export type DemoConsultingOptions = {
  salesStyle?: DemoSalesStyle;
  quoteSummary?: DemoFinanceQuoteSummary | null;
  financeQuote?: DemoFinanceQuoteSummary | null;
};

/** 상담 메모 속 건강·배려 맥락을 차량 기준 포인트로 바꿀 때 쓰는 분류입니다. */
export type CareNeedCategory =
  | "back_spine"
  | "neck_shoulder_joint"
  | "mobility_accessibility"
  | "elderly_family"
  | "pregnancy_child"
  | "motion_sensitivity"
  | "long_distance_fatigue";

export type CareNeeds = {
  categories: CareNeedCategory[];
  /** 요약용·안내 카드 등에 쓰이는 차량 고객 관점 표현 */
  customerFacingPhrases: string[];
  advisorGuidance: string[];
  vehicleCheckpoints: string[];
};

const CARE_CATEGORY_PRIORITY: Record<CareNeedCategory, number> = {
  elderly_family: 10,
  mobility_accessibility: 20,
  pregnancy_child: 30,
  motion_sensitivity: 40,
  long_distance_fatigue: 50,
  back_spine: 60,
  neck_shoulder_joint: 70,
};

const CARE_NEED_EMPTY: CareNeeds = {
  categories: [],
  customerFacingPhrases: [],
  advisorGuidance: [],
  vehicleCheckpoints: [],
};

function uniqKeepOrder(lines: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ln of lines) {
    const t = ln.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function sortCareCategories(cats: CareNeedCategory[]): CareNeedCategory[] {
  return [...new Set(cats)].sort((a, b) => CARE_CATEGORY_PRIORITY[a] - CARE_CATEGORY_PRIORITY[b]);
}

function scanCareNeedCategoriesStrictKo(raw: string): CareNeedCategory[] {
  const hit: CareNeedCategory[] = [];

  const back =
    /허리|척추|디스크|요통|허리통증|오래\s*앉기\s*힘듦|오래\s*앉아|오래\s*앉는\s*것/i.test(raw);
  const neckJoint =
    /목|어깨|무릎|관절염|무릎이?\s*불편|다리\s*불편|다리가?\s*불편|관절이?\s*불편/i.test(raw) ||
    (/통증/.test(raw) && !back && /목|어깨|무릎|관절|다리/i.test(raw));
  const mobility = /장애(?:인)?|거동\s*불편|휠체어|보행\s*보조|보호자\s*동승/i.test(raw);
  const elderly =
    /부모님|어머니|어머님|아버지|아버님|고령|어르신|병원에|병원\s*(?:이동|다니)|가족\s*케어|가족\s*돌봄|돌봄|모시고|모시(?:거나|실)|자주\s*모시/i.test(raw);
  const pregnancyChild = /임산부|임신|아기|아이들?|자녀|카시트|유모차|등하원/i.test(raw);
  const motion = /(?:차)?멀미|소음|예민|정숙|조용함?|조용한|부드러운\s*주행/i.test(raw);
  const longDrive =
    /장거리|출장|고속도로|오래\s*운전|운전\s*피로|피로가\s*적|장시간\s*운전|주행\s*보조/i.test(raw);

  if (back) hit.push("back_spine");
  if (neckJoint) hit.push("neck_shoulder_joint");
  if (mobility) hit.push("mobility_accessibility");
  if (elderly) hit.push("elderly_family");
  if (pregnancyChild) hit.push("pregnancy_child");
  if (motion) hit.push("motion_sensitivity");
  if (longDrive) hit.push("long_distance_fatigue");

  return sortCareCategories(hit);
}

/** 키보드·붙여넣기 차이로 패턴이 비는 경우까지 덮는 보조 분류(의료 단정 없음). */
function inferCareNeedCategoriesLooseKo(raw: string): CareNeedCategory[] {
  const hit: CareNeedCategory[] = [];
  const n = stripNoise(raw);

  const pregnancySignals =
    /임산부|임신|카시트|유모차|등하원|아이\s*가|아이\s*두|아기|자녀|아이(?:가|를|은|도|두)/i.test(n);
  const parentalFamilySignals =
    /어머니|어머님|부모님|부모|아버지|아버님|어머니?를|병원(?:에|으로|에서)?|어르신|고령|모시(?:고|거나|실)|자주\s*모시/i.test(
      n,
    );
  const elderlyRideContext =
    parentalFamilySignals ||
    (/(?:승하차|2열|후석)/.test(n) && /(?:가족|동승|함께|모시)/.test(n));

  if (parentalFamilySignals || elderlyRideContext) hit.push("elderly_family");
  if (pregnancySignals) hit.push("pregnancy_child");

  if (
    /무릎|목|어깨|관절염|관절이?\s*불편|오르(?:내리)?내릴|내릴\s*때|도어\s*개방감|차에\s*오르/i.test(n) ||
    (/통증/.test(n) && !/허리|등|허리통증|요통|디스크/i.test(n))
  )
    hit.push("neck_shoulder_joint");

  if (/(?:차)?멀미|조용|정숙|소음\s*예민|부드러운\s*주행/i.test(n)) hit.push("motion_sensitivity");
  if (/출장|장거리|고속도로|오래\s*운전|운전\s*피로|피로가\s*적|주행\s*보조|장시간\s*운전/i.test(n))
    hit.push("long_distance_fatigue");

  if (/허리|척추|디스크|요통|허리통증|오래\s*앉기/i.test(n)) hit.push("back_spine");

  if (/장애(?:인)?|휠체어|거동\s*불편|보행\s*보조/i.test(n)) hit.push("mobility_accessibility");

  return sortCareCategories(hit);
}

function rebuildCareNeedsFromCategories(categories: CareNeedCategory[]): CareNeeds {
  const customerFacingPhrases = uniqKeepOrder(
    categories.flatMap((c) => CARE_CUSTOMER_PHRASES[c] ?? []),
  );
  const advisorGuidance = uniqKeepOrder([
    CARE_ADVISOR_SHARED_KO,
    ...categories.flatMap((c) => CARE_ADVISOR_BY_CAT[c] ?? []),
  ]);
  const vehicleCheckpoints = uniqKeepOrder(categories.flatMap((c) => CARE_VEHICLE_CHECKS[c] ?? []));
  return {
    categories,
    customerFacingPhrases,
    advisorGuidance,
    vehicleCheckpoints,
  };
}

/** 엄격 스캔 + 느슨한 추론을 합친 최종 결과(UI·문자·요약 동일 규칙). */
export function detectCareNeedsKo(input: string): CareNeeds {
  const raw = input.replace(/\s+/g, " ").trim();
  if (!/[가-힣]/.test(raw)) return CARE_NEED_EMPTY;

  const merged = sortCareCategories(
    Array.from(new Set([...scanCareNeedCategoriesStrictKo(raw), ...inferCareNeedCategoriesLooseKo(raw)])),
  );

  if (merged.length === 0) return CARE_NEED_EMPTY;
  return rebuildCareNeedsFromCategories(merged);
}

const CARE_SMS_SCHEDULE_PREPARE_CLOSE_KO = "편하신 일정에 맞춰 차량 설명과 시승 안내를 준비해두겠습니다.";

/** SensoraGuide 등 UI용 짧은 감지 문구(ko·en 라벨 호출부에서 선택). */
export function formatCareNeedsGuideTopicsKo(input: string): string {
  const care = detectCareNeedsKo(input);
  if (!care.categories.length) return "";

  const labelByCat = (c: CareNeedCategory) =>
    CARE_UI_TOPIC_KO[c] ?? c.replace(/_/g, " ");

  return uniqKeepOrder(care.categories.map(labelByCat)).slice(0, 4).join(" · ");
}

const CARE_UI_TOPIC_EN: Partial<Record<CareNeedCategory, string>> = {
  back_spine: "Seat comfort · ride quality",
  neck_shoulder_joint: "Ingress/egress · doors",
  mobility_accessibility: "Cabin access path",
  elderly_family: "Rear-seat access",
  pregnancy_child: "Second row · cargo",
  motion_sensitivity: "Quiet cabin · gentle ride",
  long_distance_fatigue: "Long trips · assists",
};

export function formatCareNeedsGuideTopicsUi(input: string, lang: "ko" | "en"): string {
  const care = detectCareNeedsKo(input);
  if (!care.categories.length) return "";

  const map =
    lang === "en"
      ? (c: CareNeedCategory) => CARE_UI_TOPIC_EN[c] ?? CARE_UI_TOPIC_KO[c] ?? c.replace(/_/g, " ")
      : (c: CareNeedCategory) => CARE_UI_TOPIC_KO[c] ?? c.replace(/_/g, " ");

  return uniqKeepOrder(care.categories.map(map)).slice(0, 4).join(" · ");
}

const CARE_ADVISOR_SHARED_KO =
  "고객님이 말씀하신 개인적인 상황을 반복해서 언급하기보다는, 승하차 편의성·2열 공간·실내 동선처럼 차량을 실제로 사용하실 때 확인할 기준으로 안내하는 것이 좋습니다.";

const CARE_ADVISOR_BY_CAT: Record<CareNeedCategory, string[]> = {
  back_spine: [
    "등·허리 맥락은 과장하지 말고, 착좌감과 장거리 체감은 시승에서 직접 비교 확인하도록 짧게 제안하면 좋습니다.",
  ],
  neck_shoulder_joint: [
    "승하차 발판 높이·도어 각도는 문장 숫자보다 현장 체험 순서 안내가 자연스럽습니다.",
  ],
  mobility_accessibility: [
    "특정 고객군에게 ‘적합’ 같은 단정은 피하고, 동선·좌석·트렁크 적재 순서처럼 체험 순서형으로 적습니다.",
  ],
  elderly_family: [
    "다음 연락에서는 고객님께서 말씀하신 개인적인 배경을 장황하게 되풀이하기보다, 승하차 편의성·2열 공간·시트 착좌감·실내 동선처럼 차량 사용 기준 위주로 안내하는 편이 좋습니다.",
    "시승 때 동승하시는 가족분의 탑승·내리기 동선과 높이감까지 함께 보실 수 있게 짧은 순서로 유도하면 좋습니다.",
  ],
  pregnancy_child: ["카시트·유모차는 실제 차량별 넉넉함이 달라 시승·매장 재확인을 권하면 좋습니다."],
  motion_sensitivity: [
    "민감하신 분도 편하게 읽히도록 가감속·실내 소음 같은 ‘운행 체감’만 담백히 언급합니다.",
  ],
  long_distance_fatigue: [
    "장거리는 연비 과시보다 시트 피로·주행 보조 인지 순서처럼 ‘운전 상황’ 위주가 자연스럽습니다.",
  ],
};

const CARE_CUSTOMER_PHRASES: Record<CareNeedCategory, string[]> = {
  back_spine: ["장시간 이동 시 편안한 시트 착좌감과 승차감"],
  neck_shoulder_joint: ["승하차 높이와 도어 개방감, 시트 포지션"],
  mobility_accessibility: ["동승하시는 분의 편안한 승차·내리기와 실내 동선"],
  elderly_family: [
    "가족분과 함께 이동하시는 상황에서의 승하차 편의성",
    "동승하시는 분을 위해 넓게 보시는 2열 공간과 실내 동선",
  ],
  pregnancy_child: ["카시트·유모차를 고려한 후석 활용과 트렁크 공간"],
  motion_sensitivity: ["정숙한 실내 분위기와 차분한 가감속 시 승차감"],
  long_distance_fatigue: ["장거리 주행 부담을 줄일 수 있는 시트 편안함과 안정적인 주행 체감·주행 보조"],
};

const CARE_VEHICLE_CHECKS: Record<CareNeedCategory, string[]> = {
  back_spine: ["시트 조절 가능 범위", "충격·진동에 대한 장거리 체감(시승)", "등받이 형태 현장 확인"],
  neck_shoulder_joint: ["승하차 스텝·문턱 높이", "도어 스윙 각도와 주차 장소별 개방 폭"],
  mobility_accessibility: ["승하차 동선 폭·시트 높낮이 단계형 안내"],
  elderly_family: ["후석 진입 높이·문턱 높낮이", "도어 헤드룸 및 손잡이 위치", "안전·편의 사양 톤 과장 금지"],
  pregnancy_child: ["2열 카시트 설치 간격", "후석 무릎 공간 유모차 적재 여부 현장 확인"],
  motion_sensitivity: ["저속 회생제동 가감속 체감", "RPM·풍절음 구간별 체험 순서 안내"],
  long_distance_fatigue: ["시트 패키지 레벨", "헤드업·어댑티브 기능 체험 순서", "고속 크루즈 중 실내 진동 체감"],
};

const CARE_UI_TOPIC_KO: Partial<Record<CareNeedCategory, string>> = {
  back_spine: "착좌감·승차감",
  neck_shoulder_joint: "승하차·도어",
  mobility_accessibility: "실내 동선",
  elderly_family: "동승·후석",
  pregnancy_child: "2열·트렁크",
  motion_sensitivity: "정숙·승차감",
  long_distance_fatigue: "장거리·보조장치",
};

function buildCareRecallClauseKo(care: CareNeeds): string {
  const parts = care.customerFacingPhrases.slice(0, 2);
  if (parts.length === 0) return "편안한 이동과 실내 활용 관점에서의 기준";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} 및 ${parts[1]}`;
}

function buildCareSummaryLeadSentenceKoLegacy(label: string, care: CareNeeds): string {
  const frags = care.categories.map((c) => CARE_SUMMARY_FRAG_KO[c]).filter(Boolean) as string[];
  const uniq = uniqKeepOrder(frags);
  const head = uniq.slice(0, 2).join(" 및 ");
  if (!head.trim()) return `${label} 고객님은 말씀 주신 활용 목적 안에서 차량 조건을 함께 검토하고 있습니다.`;
  return `${label} 고객님은 ${head} 차량 활용 관점에서 함께 고려하고 계십니다.`;
}

function buildCareSummarySubjectPrefixKo(customerLabel: string | null): string | null {
  const c = customerLabel?.trim();
  if (!c || c === "해당") return null;
  return `${c} 고객님`;
}

function buildCareSummaryParagraphKo(
  customerLabelFromFacts: string | null,
  care: CareNeeds,
  rawMemo: string,
): string {
  const subject = buildCareSummarySubjectPrefixKo(
    customerLabelFromFacts ?? extractCustomerLabelKo(rawMemo),
  );

  const headPhrase = subject ? `${subject}은` : "고객님은";

  if (care.categories.includes("elderly_family")) {
    return `${headPhrase} 동승하시는 가족분의 승하차 편의성과 2열 공간을 중요하게 보고 계십니다. 가족분과 함께 이동하는 일이 많아 실내 동선과 탑승 편안함을 함께 고려하고 계십니다.`;
  }
  if (care.categories.includes("pregnancy_child") && !care.categories.includes("elderly_family")) {
    return `${headPhrase} 카시트·유모차를 함께 쓰시는 단계라 2열 공간과 트렁크 적재를 차량 활용 기준으로 중요하게 보고 계십니다. 자녀·유아 동승 조건에 맞는 실내 동선까지 함께 고려하면 좋습니다.`;
  }
  if (
    care.categories.includes("neck_shoulder_joint") &&
    !care.categories.some((x) => x === "back_spine" || x === "mobility_accessibility")
  ) {
    return `${headPhrase} 차에 오르내리실 때의 높이감과 도어 개방감을 차량 활용 포인트로 두고 검토 중입니다. 시트 포지션과 실내 동선은 차량별로 크게 다를 수 있습니다.`;
  }
  if (care.categories.includes("motion_sensitivity")) {
    return `${headPhrase} 정숙하고 부드러운 주행 체감을 중요하게 보고 계십니다. 가감속과 실내 분위기는 시승에서 직접 비교 확인하도록 안내하는 편이 좋습니다.`;
  }
  if (care.categories.includes("long_distance_fatigue")) {
    return `${headPhrase} 장거리 운행이 잦아 시트 편안함과 주행 보조 기능, 실내 안정감을 함께 보시는 단계입니다. 연비 과시보다 운행 피로 줄이는 구성 순서 안내가 자연스럽습니다.`;
  }

  const labelFallback = customerLabelFromFacts ?? "해당";
  return buildCareSummaryLeadSentenceKoLegacy(labelFallback, care);
}

function pickPrimaryCareCategoryKo(care: CareNeeds): CareNeedCategory | null {
  return care.categories[0] ?? null;
}

function buildSmsCareBodiesForPrimaryKo(
  primary: CareNeedCategory | null,
  modelLabel: string,
  tp: "은" | "는",
): string[] | null {
  switch (primary) {
    case "elderly_family":
      return [
        `지난 상담 때 말씀주신 가족분과 함께 이동하시는 상황과 승하차 편의성을 기준으로, 고객님께서 관심 가져주신 ${modelLabel}의 주요 포인트를 정리해보았습니다.`,
        `${modelLabel}${tp} 2열 공간, 승하차 동선, 시트 착좌감, 탑승 시 안정감 등을 함께 확인해보시면 좋습니다.`,
        `특히 가족분께서 타고 내리실 때의 높이감과 2열 공간은 실제로 탑승해보셨을 때 가장 정확하게 느끼실 수 있습니다.`,
        `고객님께서 말씀주신 기준을 바탕으로, ${modelLabel}의 승차감과 2열 편의성을 중심으로 안내드릴 수 있도록 준비하겠습니다.`,
      ];
    case "pregnancy_child":
      return [
        `지난 상담 때 말씀주신 자녀·유아 동승과 카시트·유모차 활용을 기준으로, 고객님께서 관심 가져주신 ${modelLabel}의 주요 포인트를 정리해보았습니다.`,
        `${modelLabel}${tp} 2열 간격과 트렁크 활용성, 안전·편의 사양, 승하차 동선까지 함께 확인해 보실 수 있습니다.`,
        `카시트·유모차는 차량별로 실제 넉넉함이 크게 다를 수 있어, 매장 또는 시승에서 직접 맞춰보시길 추천드립니다.`,
      ];
    case "neck_shoulder_joint":
      return [
        `지난 상담 때 말씀주신 승하차 높이와 도어 개방감 위주 기준으로, 고객님께서 관심 가져주신 ${modelLabel}의 주요 포인트를 정리해보았습니다.`,
        `${modelLabel}${tp} 시트 포지션, 문턱·스텝 느낌, 후석 접근까지 함께 보시면 선택에 도움이 됩니다.`,
        `주차 환경에 따라 도어 개방 폭이 달라질 수 있어, 실제로 오르내리실 때의 동선을 시승에서 한 번씩 비교해보시면 좋습니다.`,
      ];
    case "motion_sensitivity":
      return [
        `지난 상담 때 말씀주신 정숙성과 부드러운 주행 체감을 기준으로, 고객님께서 관심 가져주신 ${modelLabel}의 주요 포인트를 정리해보았습니다.`,
        `${modelLabel}${tp} 저속·고속 구간에서의 가감속 느낌과 실내 소음을 함께 확인해보시면 좋습니다.`,
        `민감도는 사람마다 다르니, 시승 때 직접 체감해 보시는 것이 가장 정확합니다.`,
      ];
    case "long_distance_fatigue":
      return [
        `지난 상담 때 말씀주신 장거리 운행과 주행 보조 기능을 함께 보시려는 기준으로, 고객님께서 관심 가져주신 ${modelLabel}의 주요 포인트를 정리해보았습니다.`,
        `${modelLabel}${tp} 시트 장시간 편안함과 크루즈·보조 기능 구성은 실주행 패턴과 맞는지 차분히 확인해보시면 좋습니다.`,
        `고속 크루즈 중 실내 안정감은 차량별로 크게 다를 수 있어 시승에서 한 번 확인하시길 추천드립니다.`,
      ];
    default:
      return null;
  }
}

const CARE_SUMMARY_FRAG_KO: Record<CareNeedCategory, string> = {
  back_spine: "장시간 이동 시 편안한 착좌감과 승차감",
  neck_shoulder_joint: "승하차 편의성과 도어·시트 포지션 감각",
  mobility_accessibility: "실내 동선과 승하차 동선까지 함께 보시는 편안한 이동",
  elderly_family: "동승하시는 분의 승차·내리기 편안함과 후석 공간",
  pregnancy_child: "자녀·유아 동승 조건까지 반영한 후석 공간 활용과 트렁크 활용성",
  motion_sensitivity: "정숙성과 차분한 운행 시의 승차감",
  long_distance_fatigue: "출장 등 장거리 운행을 전제로 한 시트 편안함과 주행 보조·실내 안정감",
};

function hasHangul(input: string) {
  return /[가-힣]/.test(input);
}

function hasAny(input: string, keywords: string[]) {
  const s = input.toLowerCase();
  return keywords.some((k) => s.includes(k.toLowerCase()));
}

function detectVehicleType(input: string): "SUV" | "세단" | "전기차" | null {
  const s = input.toLowerCase();
  if (s.includes("suv")) return "SUV";
  if (s.includes("세단")) return "세단";
  if (s.includes("전기차") || /\bev\d|\bev\b|아이오닉|테슬라|전기 차/i.test(s)) return "전기차";
  return null;
}

function stripNoise(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

/** SMS 줄바꿈을 살린 채 들여쓰기 공백만 정리합니다. */
function smsTrimLines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/** 숫자+한글(예: 7시리즈, 5시리즈)·Class 접미까지 잘리지 않게 모델 꼬리를 정규화합니다. */
function trimModelSlugTailKo(slug: string): string {
  return slug.replace(/\s{2,}/g, " ").replace(/^[,\s\-–]+/, "").trim();
}

/** 브랜드 접두 뒤에 오는 차량 타입 문자열 한 덩어리(예: 7시리즈, X5 시리즈, E-Class). */
function extractModelAfterBrandInclusive(rawRemainder: string): string | null {
  const remainder = stripNoise(rawRemainder.replace(/^[,:：\-–]+/, ""));
  if (!remainder) return null;

  const clauseSplit =
    /\s(?=고객님(?:은|은|이|가|께서)?\b)|\s(?:그리고|그런데|추천\s*차량|관심\s*차량|저희|지난|오늘|다음\b)/;
  let head = remainder.split(/\r?\n/).map(stripNoise).find(Boolean) ?? remainder;
  const clauseIdx = head.search(clauseSplit);
  if (clauseIdx > 0) head = head.slice(0, clauseIdx).trim();
  head = trimModelSlugTailKo(head);

  /** E-Class / S-Class (한 글자 시리즈 + Class) */
  const letterClassHit = /^([A-Za-z])\s*[-–]\s*Class\b|^([A-Za-z])\s+Class\b/i.exec(head);
  const letterForClass = letterClassHit?.[1] ?? letterClassHit?.[2];
  if (letterForClass) return `${letterForClass.toUpperCase()}-Class`;

  /** 숫자+시리즈/클래스(공백 없는 경우·있는 경우 모두) */
  const digitSeriesKo = /^(\d+)\s*(시리즈|클래스|클래스명)/u.exec(head);
  if (digitSeriesKo?.[1] && digitSeriesKo[2])
    return `${digitSeriesKo[1]}${digitSeriesKo[2]}`.trim();
  const digitHangul = /^(\d+[가-힣]+)/u.exec(head)?.[1];
  if (digitHangul) return digitHangul;

  /** Genesis GV80 · G90 등 */
  const gCode =
    /^((?:GV\d{1,4}[A-Za-z]?))\b|^((?:G\d{2,4}))\b|^((?:EQ[A-Za-z]\d+[A-Za-z]*))\b|^((?:RS|XC)\d{2,4})\b/i.exec(head);
  const gTok = gCode?.slice(1).find(Boolean);
  if (gTok) return gTok.trim();

  /** 라틴·숫자 혼합 코드 + 선택 한글 ‘시리즈/클래스’ */
  const latinHead =
    /^([A-Za-z0-9][A-Za-z0-9‑\-+]*(?:\s+[a-z][a-z0-9]{0,10}){0,3})\b(.*)?$/iu.exec(head);
  if (latinHead?.[1]) {
    const base = trimModelSlugTailKo(latinHead[1]);
    if (/^\d$/u.test(base)) return null;
    const restRaw = latinHead[2] ? trimModelSlugTailKo(latinHead[2]) : "";
    const koSeries = /^([가-힣]{2,12})\b/u.exec(restRaw)?.[1];
    if (koSeries && /시리즈|클래스|클래스명/u.test(koSeries))
      return trimModelSlugTailKo(`${base} ${koSeries}`);
    return base;
  }

  return null;
}

function prettifyExtractedLatinModelSlug(cleaned: string): string {
  const c = cleaned.trim();
  if (!c || /[가-힣]/.test(c)) return c;
  if (/^i\d{1,3}$/i.test(c)) return c;
  /** xDrive, Hybrid+ 등 소문자 토큰만 선별적으로 보정 */
  return c.replace(/\bxdrive\b/gi, "xDrive").replace(/\bHybrid\+\b|\bHybrid\b/gi, (m) => (m.includes("+") ? "Hybrid+" : "Hybrid")).replace(/\b(?:e-tron|etron)\b/gi, "e-tron").replace(/\bclass\b(?=$)/gi, "Class").replace(/^([a-z]+\d*)$/i, (w) =>
    /^gv\d+[a-z]?$/i.test(w) ?
      `${w.slice(0, 2).toUpperCase()}${w.slice(2)}`
    : /^g\d+/i.test(w) ?
      w.toUpperCase()
    : /^[a-z]+$/i.test(w) ?
      w.toUpperCase()
    : w.replace(/^(.)/u, (_m, x: string) => x.toUpperCase()),
  );
}

/** E-Class · X5 · BMW 7시리즈 / Countryman 같은 모델 토큰을 메모에서 끌어냅니다(데모 목적의 가벼운 추출). */
function extractLikelyVehicleModel(raw: string): string | null {
  const normalized = stripNoise(raw);

  const brandRe =
    /\b(Mercedes-Benz|Mercedes|Benz|메르세데스|벤츠|BMW|MINI|Audi|Genesis|Genesis_|제네시스|Porsche|포르쉐|Lexus|렉서스|Volvo|볼보)/i;

  const brandHit = brandRe.exec(normalized);
  if (brandHit?.[1]) {
    const brandRaw = brandHit[1];
    const idx = brandHit.index + brandHit[0].length;
    const after = normalized.slice(Math.max(idx, 0)).replace(/^[,\s:：]+/, "");

    const prettyBrand =
      /^mercedes|^benz|^메르세데스|^벤츠/i.test(brandRaw) ? "Mercedes-Benz"
      : /^bmw$/i.test(brandRaw) ? "BMW"
      : /^mini$/i.test(brandRaw) ? "MINI"
      : /^audi$/i.test(brandRaw) ? "Audi"
      : /^gen|^제네시스/i.test(brandRaw) ? "Genesis"
      : /^porsche|^포르쉐/i.test(brandRaw) ? "Porsche"
      : /^lexus|^렉서스/i.test(brandRaw) ? "Lexus"
      : /^volvo|^볼보/i.test(brandRaw) ? "Volvo"
      : brandRaw;

    let modelSlug = extractModelAfterBrandInclusive(after);

    /** Genesis 본문 G코드 우선(G80, GV80 등) */
    if (/^gen|^제네시스/i.test(brandRaw) && (!modelSlug || /^genesis$/i.test(modelSlug))) {
      modelSlug =
        normalized.match(/\bGV\d+[A-Za-z]?\b/i)?.[0] ??
        normalized.match(/\bG\d{2,4}\b/i)?.[0] ??
        modelSlug;
    }

    if (modelSlug) {
      modelSlug =
        /^genesis$/i.test(trimModelSlugTailKo(modelSlug)) ?
          (normalized.match(/\bG\d{2,4}\b|\bGV\d+[A-Za-z]?\b/i)?.[0] ?? modelSlug)
        : modelSlug;

      const cleaned = trimModelSlugTailKo(modelSlug);
      const displayModel =
        /[가-힣]/.test(cleaned) ? cleaned : prettifyExtractedLatinModelSlug(cleaned);

      return `${prettyBrand} ${displayModel}`.replace(/\s+/g, " ").trim();
    }
  }

  const knownModelCodes =
    /\b(G\d{2,4}|GV\d+[A-Za-z]?|G90|E[-–]?\s*Class|S[-–]?\s*Class|GLE|GLC|GLS|X\d|XM|XC\d{2}|A\d|RS\d+|Cayenne|Macan|Taycan|E-Tron|e-tron|Countryman|SUV)\b/i;

  const vehicleToken =
    normalized.match(/\b([A-Za-z]{1}[A-Za-z0-9‑\-+]+\s+(?:Countryman|SUV|Hybrid|Hybrid\+)\b)/i)?.[1] ??
    normalized.match(/\b(G\d{2,4}|GV\d+[A-Za-z]?|E[-–]?\s*Class|S[-–]?\s*Class|[A-Za-z]+\s*Countryman|[A-Za-z]+\s*Hybrid\+?|[A-Za-z]{1,10}\s*SUV)\b/i)?.[0] ??
    normalized.match(knownModelCodes)?.[0];

  /** 브랜드 없는 국내식 “7시리즈” 표기 등 */
  const seriesKoOnly = /\b(\d+)\s*(시리즈|클래스)\b/u.exec(normalized);
  if (!vehicleToken?.trim() && seriesKoOnly?.[1]) return `${seriesKoOnly[1]}${seriesKoOnly[2]}`;

  const hit = typeof vehicleToken === "string" ? vehicleToken.trim() : vehicleToken ?? null;

  const generic = /\b차량\b/.test(hit ?? "") ? null : hit;
  if (!generic) return null;

  return generic.includes("‑") ? generic.replace(/‑/g, "-") : generic;
}

/** 기아·현대 진영 EV·실사용 모델 토큰(데모 규칙). */
function extractDomesticLeadModelKo(raw: string): string | null {
  const n = stripNoise(raw);
  const kiaEv =
    /\b(?:기아|kia)\s*[·•.]?\s*ev\s*[-]?\s*(\d{1,2})\b/i.exec(n) ??
    /\b(?:기아|kia)[^\d]{0,6}\bev\s*[-]?\s*(\d{1,2})\b/i.exec(n);
  if (kiaEv?.[1]) return `KIA EV${kiaEv[1]}`;
  const evLoose =
    /\bev\s*[-]?\s*(\d{1,3})\b/i.exec(n) ??
    /\b(ev\d{2,})\b/i.exec(n);
  if (/\b(?:기아|kia|현대)\b/i.test(n) && evLoose?.[1]) {
    const digits = /\d+/.exec(evLoose[1])?.[0];
    if (digits) return /현대\b/i.test(n) ? `현대 EV${digits}` : `KIA EV${digits}`;
  }
  if (/\bev\b/i.test(n) && /\b(?:기아|kia)\b/i.test(n)) {
    const nm = /\bev\s*[-]?\s*(\d{1,2})\b/i.exec(n);
    if (nm?.[1]) return `KIA EV${nm[1]}`;
  }
  return null;
}

/** 메모 우선 순위: 기아 등 → 유럽/수입 패턴 추출기. */
function extractInterestModelInclusive(raw: string): string | null {
  return extractDomesticLeadModelKo(raw) ?? extractLikelyVehicleModel(raw);
}

type DemoMemoFactsKo = {
  customerLabel: string | null;
  postureDiscomfort: boolean;
  primaryModelKo: string | null;
  compareCue: boolean;
  sedanCue: boolean;
  suvCue: boolean;
  evCue: boolean;
  budgetPhrase: string | null;
  tradeInEstimatePhrase: string | null;
  discountIntent: boolean;
  sincereTone: boolean;
};

function extractCustomerLabelKo(raw: string): string | null {
  const t = raw.trim();
  const labeled =
    /\b([\u3131-\uD79D]{2,6})(?:님| 고객님)\b/.exec(stripNoise(t))?.[1] ??
    /\b([\u3131-\uD79D]{2,6})\s+고객님\b/.exec(stripNoise(t))?.[1];
  if (labeled) return labeled.replace(/\s+$/, "");

  const first = (raw.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0) ?? "").trim();
  if (/^[\u3131-\uD79D]{2,6}$/.test(first)) return first;
  return null;
}

/** 예: "4천만 원대", "약 4,000만 원" */
function extractBudgetPhraseKo(raw: string): string | null {
  if (!/(?:예산|잡음|예상).*?(만|원|천)|\d\s*천\s*만|\d청만원|만원\s*대?/i.test(raw)) return null;
  const n = stripNoise(raw);
  const compact = n.replace(/\s+/g, "");

  const thC = compact.match(/예산[^\d]{0,12}(\d)천만원(?:대)?(?:으로)?/i);
  if (thC?.[1]) return `약 ${thC[1]}천만 원대`;

  const th = /\b(\d+)\s*천\s*만\s*원(?:대|\s*으로\s*잡)?/i.exec(n);
  if (th?.[1]) return `약 ${th[1]}천만 원대`;

  const mw = /\b예산[^\d]{0,20}(\d{2,6})\s*만\s*(?:원|원대)?/i.exec(n);
  if (mw?.[1]) return `약 ${mw[1]}만 원 내외`;

  return null;
}

/** 중고/대차 맥락에서 숫자+만 원 조각 */
function extractTradeInEstimateKo(raw: string): string | null {
  if (!/중고|대차|기존\s*차량|중고차|중고 차|매각/i.test(raw)) return null;

  const n = stripNoise(raw);
  const th = /\b(\d+)\s*천\s*만\s*원\b/i.exec(n);
  if (th?.[1]) return `${th[1]}천만 원`;

  const amt =
    /(?:중고(?:차)?|대차|기존\s*차(?:량)?)[^0-9]{0,48}(?:현재\s*)?(?:약\s*)?(\d{2,7})\s*만\s*(?:원|원정도|정도)?/i.exec(
      n,
    ) ?? /(?:약\s*)?(\d{2,7})\s*만\s*(?:원|원정도|정도)\s*(?:나올|예상|정도|수준)/i.exec(n);
  if (amt?.[1]) return `약 ${amt[1]}만 원`;

  return null;
}

function extractDemoMemoFactsKo(input: string): DemoMemoFactsKo {
  const raw = stripNoise(input);
  const n = raw;
  const postureDiscomfort = /허리|허리통증|디스크|요통|불편하|불편감|통증\b|등이\s*아|아파|아프신/i.test(raw);

  const primaryModelKo = extractInterestModelInclusive(raw);

  const compareCue =
    /비교|함께\s*비교|타브랜드|다른\s*브랜드|모델별\s*비교|맞으시면서|대안과|비교하/i.test(raw);

  const sedanCue = /세단\b/i.test(raw);
  const suvCue = /\bSUV\b|승합|suv\b/i.test(raw);
  const evCue = /\bev\d|\bev\b|전기차|전기 차/i.test(raw);

  const discountIntent = /할인|프로모션|프로모|혜택|인센티브|\b프로모\b/i.test(raw);

  const sincereTone = /진심|진정성|성의|정성|전달하고|어떻게\s*전달/i.test(raw);

  return {
    customerLabel: extractCustomerLabelKo(input),
    postureDiscomfort,
    primaryModelKo,
    compareCue,
    sedanCue,
    suvCue,
    evCue,
    budgetPhrase: extractBudgetPhraseKo(raw),
    tradeInEstimatePhrase: extractTradeInEstimateKo(raw),
    discountIntent,
    sincereTone,
  };
}

/** 구체 디테일이 있으면 풍부한 한국어 SMS를 씁니다. */
function memoHasConcreteKo(f: DemoMemoFactsKo, inputLen: number): boolean {
  return (
    inputLen >= 20 &&
    (f.postureDiscomfort ||
      !!f.primaryModelKo ||
      !!f.budgetPhrase ||
      !!f.tradeInEstimatePhrase ||
      f.discountIntent ||
      f.compareCue ||
      f.sincereTone)
  );
}

type FinanceSignals = {
  mentionQuote: boolean;
  installment: boolean;
  lease: boolean;
  longRent: boolean;
  downPayment: boolean;
  deposit: boolean;
  monthlyPayment: boolean;
  contractPeriod: boolean;
  mileageCap: boolean;
  residual: boolean;
  initialCost: boolean;
  maturity: boolean;
};

function detectFinanceSignals(input: string): FinanceSignals {
  return {
    mentionQuote: hasAny(input, ["견적서", "견적"]),
    installment: hasAny(input, ["할부"]),
    lease: hasAny(input, ["리스"]),
    longRent: hasAny(input, ["장기렌트", "장기 렌트"]),
    downPayment: hasAny(input, ["선납", "선납금"]),
    deposit: hasAny(input, ["보증금"]),
    monthlyPayment: hasAny(input, ["월납", "월 납입", "월납입", "납입금"]),
    contractPeriod: hasAny(input, ["계약 기간", "계약기간"]),
    mileageCap: hasAny(input, ["약정 주행", "약정주행", "주행거리"]),
    residual: hasAny(input, ["잔존가치", "잔가"]),
    initialCost: hasAny(input, ["초기 비용", "초기비용"]),
    maturity: hasAny(input, ["만기"]),
  };
}

/** 담백한 / 정중한 / 프리미엄 / 친근 / 적극 — 고객 발송 문자 마무리·일부 동사만 변주합니다. */
function koSmsStyleTone(style: DemoSalesStyle) {
  switch (style) {
    case "simple":
      return {
        arranged: "정리해 두었습니다",
        arrangedAlt: "맞춰 두었습니다",
        confirmClose: "편하실 때 확인 부탁드립니다.",
        inviteQ: "",
        prepareTd: "시간·장소만 알려주시면 일정에 맞춰 시승 안내를 준비하겠습니다.",
      };
    case "premium":
      return {
        arranged: "정리해 두었습니다",
        arrangedAlt: "맞춰 두었습니다",
        confirmClose: "편하실 때 확인 부탁드립니다.",
        inviteQ: "추가로 궁금하신 점은 편하게 말씀 주세요.",
        prepareTd:
          "편하신 시간과 장소를 알려주시면, 일정에 맞춰 차량 설명과 시승 안내를 차분히 준비해 두겠습니다.",
      };
    case "friendly":
      return {
        arranged: "정리해 두었습니다",
        arrangedAlt: "맞춰 두었습니다",
        confirmClose: "편하실 때 한 번 확인해 주세요.",
        inviteQ: "궁금하신 부분은 부담 없이 말씀 주세요.",
        prepareTd:
          "편하신 시간과 장소만 알려주시면, 그에 맞춰 차량 설명과 시승까지 준비해 두겠습니다.",
      };
    case "active":
      return {
        arranged: "정리했습니다",
        arrangedAlt: "맞춰 두었습니다",
        confirmClose: "편하실 때 확인 부탁드립니다. 회신 주시면 이어서 일정부터 맞춰 보겠습니다.",
        inviteQ: "문의 주시면 바로 안내 도와드리겠습니다.",
        prepareTd:
          "편하신 시간·장소 알려주시면 시승 일정부터 잡고 차량 설명까지 준비하겠습니다.",
      };
    case "polite":
    default:
      return {
        arranged: "정리해 두었습니다",
        arrangedAlt: "맞춰 두었습니다",
        confirmClose: "편하실 때 확인 부탁드립니다.",
        inviteQ: "궁금하신 부분은 편하게 말씀 주세요.",
        prepareTd:
          "편하신 시간과 장소만 말씀해주시면 일정에 맞춰 차량 설명과 시승 안내를 준비하겠습니다.",
      };
  }
}

function mergeQuoteHintsFromOptions(
  input: string,
  options: DemoConsultingOptions | undefined,
): FinanceSignals {
  const sig = detectFinanceSignals(input);
  const q = options?.quoteSummary ?? options?.financeQuote;
  if (!q) return sig;
  const blob = `${q.memo ?? ""}\n${(q.rawLines ?? []).join("\n")}`;
  const s2 = detectFinanceSignals(blob);
  const product = q.productTypeHint ?? [];
  return {
    ...sig,
    mentionQuote: sig.mentionQuote || s2.mentionQuote,
    installment: sig.installment || s2.installment || product.includes("installment"),
    lease: sig.lease || s2.lease || product.includes("lease"),
    longRent: sig.longRent || s2.longRent || product.includes("longRent"),
    downPayment: sig.downPayment || s2.downPayment,
    deposit: sig.deposit || s2.deposit,
    monthlyPayment: sig.monthlyPayment || s2.monthlyPayment,
    contractPeriod: sig.contractPeriod || s2.contractPeriod,
    mileageCap: sig.mileageCap || s2.mileageCap,
    residual: sig.residual || s2.residual,
    initialCost: sig.initialCost || s2.initialCost,
    maturity: sig.maturity || s2.maturity,
  };
}

/** Single entry-point for replacing with real AI later. */
export function generateDemoConsultingResponse(
  inputRaw: string,
  options?: DemoConsultingOptions,
): DemoConsultingResponse {
  const input = (inputRaw ?? "").trim();
  const ko = hasHangul(input) || input.length === 0;
  let vehicleType = detectVehicleType(input);
  const memoFactsKo: DemoMemoFactsKo | null = ko ? extractDemoMemoFactsKo(input) : null;
  const careNeedsKo = ko ? detectCareNeedsKo(input) : CARE_NEED_EMPTY;
  const memoConcreteFactsKo = !!(memoFactsKo && memoHasConcreteKo(memoFactsKo, input.length));
  const memoCareRichKo =
    careNeedsKo.categories.length > 0 && stripNoise(input).replace(/\s+/g, "").length >= 8;
  const memoRichKo = memoConcreteFactsKo || memoCareRichKo;

  if (ko && memoFactsKo) {
    if (!vehicleType && memoFactsKo.suvCue) vehicleType = "SUV";
    else if (!vehicleType && memoFactsKo.sedanCue) vehicleType = "세단";
    else if (!vehicleType && memoFactsKo.evCue) vehicleType = "전기차";
  }

  const salesStyle: DemoSalesStyle = options?.salesStyle ?? "polite";
  const financeSignals = mergeQuoteHintsFromOptions(input, options);

  const motionCare = careNeedsKo.categories.includes("motion_sensitivity");
  const rideComfort =
    hasAny(input, ["승차감", "조용", "정숙", "정숙성"]) ||
    !!(memoFactsKo?.postureDiscomfort || motionCare);

  const family =
    hasAny(input, ["가족", "아이", "등하원"]) ||
    careNeedsKo.categories.some((c) => c === "elderly_family" || c === "pregnancy_child");

  const financeTopic =
    hasAny(input, [
      "리스",
      "할부",
      "장기렌트",
      "장기 렌트",
      "금융",
      "월납입",
      "월 납입",
      "월납",
      "납입금",
      "견적",
      "견적서",
      "선납",
      "선납금",
      "보증금",
      "잔존가치",
      "잔가",
      "계약 기간",
      "계약기간",
      "약정 주행",
      "약정주행",
      "초기 비용",
      "초기비용",
      "만기",
    ]) ||
    !!options?.quoteSummary ||
    !!options?.financeQuote;

  const finance = financeTopic || financeSignals.mentionQuote;
  const tradeIn =
    hasAny(input, ["중고차", "트레이드인", "대차", "기존차", "기존 차량", "매각"]) ||
    !!memoFactsKo?.tradeInEstimatePhrase;
  const deliverySoon = hasAny(input, ["출고", "일정", "빨리", "빠르게", "빠른"]);
  const compare =
    hasAny(input, ["고민", "비교", "타브랜드", "다른 브랜드"]) || !!(memoFactsKo?.compareCue);
  const wantsTestDrive = hasAny(input, ["시승", "테스트 드라이브", "test drive"]);

  const focus: string[] = [];
  if (careNeedsKo.categories.length > 0) focus.push("배려 응대 포인트(체험형 안내)");
  if (memoFactsKo?.postureDiscomfort) focus.push("허리·자세 고려 승차감/착좌감");
  else if (rideComfort) focus.push("정숙·승차감");
  if (family) focus.push("가족 이동 편의");
  if (finance) focus.push("금융·견적");
  if (tradeIn) focus.push("기존 차량 대차/매각");
  if (deliverySoon) focus.push("출고 가능 일정");
  if (vehicleType) focus.push(`관심 차종(${vehicleType})`);
  if (compare) focus.push("비교 포인트 정리");
  if (memoFactsKo?.primaryModelKo) focus.push(`관심 차량 메모 반영 (${memoFactsKo.primaryModelKo})`);

  function buildOpeningRecallFragmentsKo(): string[] {
    const frags: string[] = [];
    if (careNeedsKo.categories.length > 0) {
      frags.push(buildCareRecallClauseKo(careNeedsKo));
    } else if (memoFactsKo?.postureDiscomfort && rideComfort)
      frags.push("허리 부담을 고려해 승차감과 시트 착좌감");
    else if (rideComfort) frags.push("조용한 승차감과 정숙성");
    if (family) frags.push("가족 이동 편의성");

    let financeRecall = "";
    if (memoFactsKo?.budgetPhrase && !finance) {
      frags.push(`예산(${memoFactsKo.budgetPhrase})`);
    }

    if (finance) {
      if (financeSignals.downPayment && financeSignals.deposit) financeRecall = "선납금과 보증금을 포함한 금융 조건";
      else if (financeSignals.downPayment && financeSignals.monthlyPayment) financeRecall = "선납과 월 납입 조건";
      else if (financeSignals.deposit && financeSignals.monthlyPayment) financeRecall = "보증금과 월 납입 조건";
      else if (financeSignals.downPayment) financeRecall = "선납금 조건";
      else if (financeSignals.deposit) financeRecall = "보증금 조건";
      else if (financeSignals.mentionQuote) financeRecall = "견적에서 말씀 주신 포인트";
      else if (financeSignals.lease || financeSignals.installment || financeSignals.longRent)
        financeRecall = "금융 방식과 월 납입 조건";
      else financeRecall = "월 납입 조건";
      frags.push(financeRecall);
    }

    if (deliverySoon) frags.push("출고 일정");
    return frags;
  }

  function joinOpeningRecallKo(parts: string[]): string {
    if (parts.length === 0) return "고객님께서 나누어 주신 상담 내용";
    if (parts.length === 1) return parts[0];
    const last = parts[parts.length - 1];
    const head = parts.slice(0, -1).join(", ");
    return `${head}, 그리고 ${last}`;
  }

  /** 실제 문자용 금융 블록(고객 톤). */
  function buildFinanceBlockKo(style: DemoSalesStyle): string {
    if (!finance) return "";
    const tone = koSmsStyleTone(style);
    const lines: string[] = [];
    const sig = financeSignals;

    if (sig.downPayment && sig.deposit) {
      lines.push(
        `금융 조건은 말씀주신 선납금과 보증금 기준으로 월 납입금을 확인하실 수 있도록 ${tone.arranged}.`,
      );
    } else {
      const condParts: string[] = [];
      if (sig.downPayment) condParts.push("선납금");
      if (sig.deposit) condParts.push("보증금");
      if (sig.contractPeriod) condParts.push("계약 기간");
      if (sig.mileageCap) condParts.push("약정 주행거리");
      if (sig.residual) condParts.push("잔존가치");
      if (sig.initialCost) condParts.push("초기 비용");
      if (sig.maturity) condParts.push("만기 선택 조건");

      const condJoined =
        condParts.length >= 2 ? `${condParts.slice(0, -1).join(", ")}, ${condParts.slice(-1)}`
        : condParts.length === 1 ? condParts[0]
        : "";

      if (condJoined) {
        lines.push(
          `금융 조건은 말씀주신 ${condJoined} 기준으로 월 납입을 확인하실 수 있도록 ${tone.arranged}.`,
        );
      } else if (!sig.mentionQuote) {
        lines.push(`금융 조건은 말씀주신 기준으로 확인하실 수 있도록 ${tone.arranged}.`);
      }
    }

    if (
      sig.monthlyPayment &&
      !(sig.downPayment && sig.deposit) &&
      !lines.some((l) => l.includes("월 납입"))
    ) {
      lines.push(`월 납입금은 말씀주신 예산 범위를 기준으로 확인하실 수 있도록 ${tone.arrangedAlt}.`);
    }

    if (sig.lease && sig.installment) {
      lines.push(
        "리스와 할부 조건은 초기 비용과 월 납입금 기준으로 비교하시기 편하게 나눠서 안내드리겠습니다.",
      );
    } else if (sig.lease || sig.installment) {
      lines.push(
        `${sig.lease ? "리스" : "할부"} 조건은 초기 비용과 월 납입을 중심으로 정리해 두었으며, 필요하시면 항목별로 나누어 안내드리겠습니다.`,
      );
    }

    if (sig.longRent) {
      lines.push(
        "장기렌트 조건은 보험·정비 포함 여부에 따라 체감 비용이 달라질 수 있어 그 부분도 함께 확인하시면 좋습니다.",
      );
    }

    if (sig.mentionQuote) {
      if (!lines.some((l) => l.includes("견적서"))) {
        const qCond = sig.downPayment && sig.deposit ? "선납금과 보증금" : "말씀 주신 내용";
        lines.push(`${qCond} 기준으로 견적서를 정리해 함께 안내드릴 수 있도록 준비해 두었습니다.`);
      }
      lines.push(
        "표기된 금액은 안내 시점 기준으로, 등록 시점이나 금융사 조건에 따라 일부 변동될 수 있습니다.",
      );
    }

    return [...new Set(lines)].join("\n");
  }

  if (!input) {
    const tone = koSmsStyleTone(salesStyle);
    const emptyFinanceNote = ko
      ? "금융·견적 키워드(예: 할부, 리스, 선납, 월 납입)를 넣으면 고객 발송 문자에 견적 정리 표현도 함께 반영합니다."
      : "Add financing keywords (lease/installment/down payment, etc.) to reflect quote-ready wording.";
    const emptyCloseKo = smsTrimLines(
      `${tone.confirmClose}${tone.inviteQ ? `\n${tone.inviteQ}` : ""}\n감사합니다.`,
    );
    const emptyCloseEn = smsTrimLines(
      `Whenever it works for you, please take a moment to review.${salesStyle !== "simple" ? "\nFeel free to ask if anything is unclear." : ""}\nThank you.`,
    );
    return {
      summary: ko
        ? "상담 메모가 비어 있습니다. 예시 문구를 넣거나 고객 니즈·금융 조건·희망 일정을 한두 문장으로 입력해 보세요."
        : "Your memo is empty. Restore the example or write 1–2 sentences about needs, financing, and timing.",
      nextAction: ko
        ? `${emptyFinanceNote} 예시 문구를 넣고 반응을 확인하거나, 핵심 키워드를 포함해 메모를 작성합니다.`
        : `${emptyFinanceNote} Restore the example or add keywords (comfort, family, financing, trade-in).`,
      message: ko
        ? smsTrimLines(`
안녕하세요,
OO님.
저희 브랜드 [브랜드/전시장명] [영업사원명] [직급]입니다.

상담 메모를 작성해 주시면 말씀주신 기준으로 차량 장점과 금융 조건까지 부담 없이 정리해 안내드릴 수 있도록 문자로 드리겠습니다.

${emptyCloseKo}`)
        : `Hello—once you paste a memo, I’ll summarize the vehicle highlights and financing in a customer-ready note.\n${emptyCloseEn}`,
    };
  }

  const interestModelKo = memoFactsKo?.primaryModelKo ?? extractLikelyVehicleModel(input);
  const customerNameKo =
    memoFactsKo?.customerLabel ??
    (/\b([\u3131-\uD79D]{2,6})님\b/.exec(input)?.[1] ??
      /\b([\u3131-\uD79D]{2,6}) 고객님\b/.exec(input)?.[1] ??
      null);

  const focusText = focus.length ? focus.join(" · ") : ko ? "핵심 니즈" : "key needs";
  const openingRecallJoined = joinOpeningRecallKo(buildOpeningRecallFragmentsKo());

  function koSummaryConcreteParagraph(): string {
    const f = memoFactsKo!;
    const label = (f.customerLabel ?? "해당").trim();
    const parts: string[] = [];

    if (careNeedsKo.categories.length > 0) {
      parts.push(buildCareSummaryParagraphKo(f.customerLabel, careNeedsKo, input).trim());
    } else {
      parts.push(`${label} 고객님`);

      const bodyConcern = f.postureDiscomfort
        ? "말씀주신 편안함 기준으로 승차감과 시트 착좌감을 차량 활용 포인트로 중요하게 보고 계십니다."
        : rideComfort
          ? "승차감 중심으로 차량을 보고 계십니다."
          : "메모 상 니즈 기준으로 검토 중입니다.";

      parts.push(bodyConcern.trim());
    }

    const fusedCompareBudgetSedan =
      !!(f.primaryModelKo && compare && f.budgetPhrase && (vehicleType === "세단" || f.sedanCue));

    if (fusedCompareBudgetSedan && f.primaryModelKo && f.budgetPhrase) {
      const bp = stripNoise(f.budgetPhrase).replace(/^약\s*/, "예산 ");
      parts.push(`${f.primaryModelKo}와 비교하면서 ${bp}의 승차감 좋은 세단을 검토 중입니다.`);
    } else if (f.primaryModelKo && compare) {
      parts.push(`${f.primaryModelKo} 모델을 기준 차량 삼아 비교 검토하고 계신 점도 함께 반영해야 합니다.`);
      if (f.budgetPhrase) parts.push(`예산은 ${stripNoise(f.budgetPhrase)} 검토 단계입니다.`);
    } else if (f.primaryModelKo) parts.push(`${f.primaryModelKo} 후보 모델에 관심이 있습니다.`);

    if (!fusedCompareBudgetSedan && vehicleType) parts.push(`관심 차종은 메모 기준 ${vehicleType} 방향입니다.`);

    if (!(f.primaryModelKo && compare) && f.budgetPhrase)
      parts.push(`예산은 ${stripNoise(f.budgetPhrase)} 검토 단계입니다.`);
    if (f.tradeInEstimatePhrase)
      parts.push(
        `기존 차량은 ${stripNoise(f.tradeInEstimatePhrase)} 수준의 대차 가능성을 현재 참고 가능한 범위로 고려하고 계십니다.`,
      );

    if (f.discountIntent) parts.push(`적용 가능한 할인이나 프로모션을 고객께 전달해 드릴 필요가 있습니다. 과장하지 않도록 구체적인 조건 명시가 중요합니다.`);
    if (f.sincereTone)
      parts.push(`부담을 주지 않는 톤으로 진정성 있는 안내 방식으로 연락하는 것이 적절합니다.`);

    return parts.join(" ");
  }

  function koNextActionConcrete(): string[] {
    const f = memoFactsKo!;
    const out: string[] = [];
    if (careNeedsKo.categories.length > 0) {
      out.push(...careNeedsKo.advisorGuidance.slice(0, 3));
    }
    if (f.postureDiscomfort || rideComfort) {
      if (careNeedsKo.categories.length > 0) {
        out.push(
          "시승·재방문 때 착좌감·승하차 동선·장거리 체감은 고객님이 직접 비교 확인하실 수 있게 짧은 순서로 안내하는 편이 좋습니다.",
        );
      } else {
        out.push(
          "다음 연락에서는 편안한 착좌감과 승차감, 시트 높낮이, 장거리 주행 시 피로감을 차분하게 짚는 것부터 시작하는 편이 자연스럽습니다.",
        );
      }
    }

    const modelBit =
      interestModelKo && compare
        ? `${interestModelKo}와 비교 중이시라면 단순 할인보다 실제 주행감, 착좌감, 예산 범위와 중고·대차 추정까지 한 번에 짚어 안내하는 흐름이 자연스럽습니다.`
      : compare ? "비교 차량이 있다면 헤드업만 길게 쓰지 말고, 고객님이 중요하게 보는 기준 2~3가지 안에서 차이만 정리합니다."
      : "";

    if (modelBit) out.push(modelBit);

    if (f.budgetPhrase || finance) {
      const lead = f.budgetPhrase ? `${f.budgetPhrase}과(와) 연결되는 ` : "";
      out.push(
        `${lead}라인별 조건과 월 출금 흐름을 확인한 뒤, 현재 확인 가능한 조건 기준으로만 문자 톤을 맞춥니다.`,
      );
    }

    if (tradeIn && f.tradeInEstimatePhrase) {
      out.push(
        `${f.tradeInEstimatePhrase} 같은 추정 폭만 먼저 공유했는지 재확인하고, 진단 순서까지 고객이 이해하는 문장 순서인지 문자를 검토합니다.`,
      );
    } else if (tradeIn)
      out.push("대차/매각 흐름은 중고 추정 → 성능점검 → 확정순이라는 순서 메모가 문자에 명확한지 확인합니다.");

    if (f.discountIntent) {
      out.push(
        "할인 및 프로모션은 ‘좋은 기회입니다’ 과장 표현 없이 현재 게시 또는 승인된 조건 기준으로 차분하게 전달하는 것이 목표입니다.",
      );
    }
    out.push(`메모에 적힌 고객명·예산 수치·관심 모델 이름이 문자에 그대로 반영됐는지 마지막으로 한 번 더 확인합니다.`);

    return uniqKeepOrder(out.filter(Boolean));
  }

  const summaryLines: string[] = [];

  if (ko && memoFactsKo && (memoRichKo || careNeedsKo.categories.length > 0)) {
    summaryLines.push(koSummaryConcreteParagraph());
  } else {
    summaryLines.push(
      ko ? `이 고객은 ${focusText}를 중심으로 검토하고 있습니다.` : `This customer is prioritizing ${focusText}.`,
    );
    if (vehicleType)
      summaryLines.push(ko ? `관심 차종은 ${vehicleType}로 보입니다.` : `Likely vehicle interest: ${vehicleType}.`);
    if (compare)
      summaryLines.push(
        ko
          ? "비교 차량 대비 차이를 짧게 정리하면 결정 피로를 줄여 줄 수 있습니다."
          : "A tight comparison checklist will reduce decision fatigue.",
      );
    if (finance) {
      const partsKo: string[] = [];
      if (financeSignals.installment) partsKo.push("할부");
      if (financeSignals.lease) partsKo.push("리스");
      if (financeSignals.longRent) partsKo.push("장기렌트");
      const prod = partsKo.length ? `${partsKo.join("/")} 안내가 적절합니다` : "금융·월 납입 조건 확인이 필요합니다";
      summaryLines.push(
        ko
          ? `${prod}. 말씀 주신 금액 단위(선납·보증금·월 납입 등)와 견적서 기준 라인만 맞춰 고객에게 전달할 수 있습니다.`
          : `Financing (${prod})—align upfront/monthly/residual wording with quote lines before texting.`,
      );
    }
    if (tradeIn)
      summaryLines.push(
        ko
          ? "기존 차량은 중고 진단 순서와 대략 감액 가능성까지 함께 언급하는 편이 좋습니다."
          : "Mention inspection flow and indicative trade-in valuation range.",
      );
    if (deliverySoon)
      summaryLines.push(
        ko ? "출고 가능 시점과 준비 절차가 궁금해할 가능성이 큽니다." : "Likely attentive to delivery readiness and timelines.",
      );
  }

  const nextActionParts: string[] = [];
  if (ko && memoFactsKo && (memoRichKo || careNeedsKo.categories.length > 0)) {
    nextActionParts.push(...koNextActionConcrete());
  } else {
    nextActionParts.push(
      ko
        ? "고객이 말씀하신 숫자·조건 단위 그대로 기록과 맞춰 문자에 반영했는지 확인한 뒤, 과장 표현 없이 현재 확인 가능한 조건 기준으로 적어 두었음을 간단히 전달합니다."
        : "Re-check memo numbers against quote line items before sending SMS—keep tone factual.",
    );
    if (vehicleType)
      nextActionParts.push(
        ko ? `${vehicleType} 기준 핵심 트림 2안과 옵션만 짧게 남겨 문자에 붙입니다.` : `Attach 2 ${vehicleType} trims + key options.`,
      );
    if (rideComfort)
      nextActionParts.push(ko ? "정숙성·주행 피치는 숫자 과시보다 고객이 체감할 표현으로만 짚습니다." : "Describe ride quietly—no overstated specs.");
    if (family)
      nextActionParts.push(
        ko ? "카시트·2열 편의는 체험 매장에서 확인 가능한 순서까지 짧게 제안합니다." : "Suggest in-store checks for seating/fit.",
      );
    if (finance) {
      const finHint =
        ko ?
          financeSignals.mentionQuote
            ? "견적 관련 문자에는 변동 가능 문구까지 한 줄 붙였는지 검토합니다."
            : "초기 비용과 월 납입 라인만 중복 없이 문자에 두면 읽기 부담이 줄어듭니다."
        : financeSignals.mentionQuote
          ? "Double-check SMS includes lender/registration caveat when quote keywords fired."
          : "Keep upfront + monthly-only lines terse.";

      nextActionParts.push(finHint);
    }
    if (tradeIn)
      nextActionParts.push(
        ko ?
          "중고 가격 확인 → 진단 순서까지 문자에 순서 메모와 추정금액이 일치했는지 봅니다."
        : "Ensure trade-in flow language matches memo.",
      );
    if (deliverySoon)
      nextActionParts.push(ko ? "재고 가능일과 주문 납기를 나누어 한 줄씩 문자에 넣습니다." : "Split inventory vs ordered lead-times.");
    if (compare)
      nextActionParts.push(ko ? "비교 차량 명칭 받은 경우에만 ‘핵심 차이 세 가지’로 요약합니다." : "Summarize three differences only once comparables are named.");
  }

  function buildStructuredKoSms(): string {
    const f = memoFactsKo!;
    const tone = koSmsStyleTone(salesStyle);
    const customer = customerNameKo ? `${customerNameKo}님` : "OO님";

    function topicParticleSms(phrase: string): "은" | "는" {
      const t = phrase.trim();
      if (!t) return "는";
      const last = t[t.length - 1];
      const c = last.codePointAt(0)!;
      if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0 ? "은" : "는";
      return "는";
    }

    const modelLabel = interestModelKo ?? "관심 모델";

    const lines: string[] = [];
    lines.push(`안녕하세요,`, `${customer}.`, "[브랜드/전시장명] [영업사원명] [직급]입니다.", "");

    const budgetLead = f.budgetPhrase ? `${f.budgetPhrase} ` : "";
    const sedanBit =
      vehicleType === "세단" || f.sedanCue ? "승차감과 시트 착좌감이 좋은 세단" : "승차감과 시트 착좌감";

    function buildDealMidKo(): string {
      if (interestModelKo && compare) {
        return `고객님께서 ${interestModelKo}와(과) 함께 비교하고 계신 점을 기준으로, ${budgetLead}예산 범위에서 ${sedanBit}, 장거리 주행 시 피로도까지 함께 보실 수 있도록 말씀 주신 기준으로 조건을 정리해보았습니다.`;
      }
      if (interestModelKo) {
        return `고객님께서 관심 가져주신 ${interestModelKo}를 기준으로, ${budgetLead}예산 범위에서 ${sedanBit}, 장거리 주행 시 피로도까지 함께 보실 수 있도록 말씀 주신 기준으로 조건을 정리해보았습니다.`;
      }
      return `고객님께서 관심 가져주신 모델을 기준으로, ${budgetLead}예산 범위에서 ${sedanBit}, 장거리 주행 시 피로도까지 함께 보실 수 있도록 말씀 주신 기준으로 조건을 정리해보았습니다.`;
    }

    const dealMidApplicable =
      !!(f.budgetPhrase || compare || interestModelKo || f.postureDiscomfort || rideComfort);

    const hasCareAudience = careNeedsKo.categories.length > 0;

    const primaryCare = pickPrimaryCareCategoryKo(careNeedsKo);
    const tpMod = topicParticleSms(modelLabel);

    const careSceneBodies =
      hasCareAudience && primaryCare ?
        buildSmsCareBodiesForPrimaryKo(primaryCare, modelLabel, tpMod)
      : null;

    if (hasCareAudience && careSceneBodies?.length) {
      for (const para of careSceneBodies) {
        lines.push("");
        lines.push(smsTrimLines(para));
      }
      const appendStructuredDealMid =
        !!(f.budgetPhrase || compare || f.discountIntent || f.postureDiscomfort);
      if (dealMidApplicable && appendStructuredDealMid) {
        lines.push("");
        lines.push(smsTrimLines(buildDealMidKo()));
      }
    } else if (hasCareAudience) {
      const clause = buildCareRecallClauseKo(careNeedsKo);
      lines.push(
        smsTrimLines(
          `지난 상담 때 말씀주신 ${clause} 기준으로, 고객님께서 관심 가져주신 ${modelLabel}의 주요 포인트를 말씀 주신 기준으로 정리해보았습니다.`,
        ),
      );
      lines.push("");
      lines.push(
        smsTrimLines(
          `${modelLabel}${tpMod} 시트 착좌감, 실내 공간, 승하차 동선, 주행 시 안정감 등을 함께 확인해보시면 좋을 차량입니다.`,
        ),
      );
      lines.push("");
      lines.push(
        smsTrimLines(
          `특히 실제로 탑승해 보셨을 때 느껴지는 착좌감과 승하차 높이는 말씀주신 편안함 기준과 잘 맞는지 시승 때 직접 확인해보시는 것이 좋습니다.`,
        ),
      );
      if (dealMidApplicable && (interestModelKo || compare || f.budgetPhrase || vehicleType || f.discountIntent)) {
        lines.push("");
        lines.push(smsTrimLines(buildDealMidKo()));
      }
    } else if (f.postureDiscomfort) {
      lines.push(
        smsTrimLines(
          `지난 상담 때 말씀주신 편안함과 승차감을 중요하게 보신다는 내용 참고하였습니다.`,
        ),
      );
      lines.push("");
      lines.push(smsTrimLines(buildDealMidKo()));
    } else {
      lines.push(
        smsTrimLines(`지난 상담 때 말씀주신 ${openingRecallJoined} 바탕으로 다시 연락드렸습니다.`),
      );
      lines.push("");
      lines.push(smsTrimLines(buildDealMidKo()));
    }

    if (!hasCareAudience) {
      lines.push("");
      lines.push(
        smsTrimLines(
          `시승이나 재방문 때 실제 착좌감과 주행 피로 여부는 차량마다 체감이 달라질 수 있어, 현장에서 직접 확인해 보시는 것까지 함께 안내드리겠습니다.`,
        ),
      );
    }

    if (f.discountIntent) {
      lines.push("");
      lines.push(
        smsTrimLines(
          `특히 이번에 현재 확인 가능한 조건 기준으로 적용 가능한 할인 안내가 있어, 단순히 가격만 안내드리기보다는 고객님께서 중요하게 보시는 승차감과 예산 기준에 실제로 맞는지 비교하시기 편하도록 함께 확인해보시면 좋을 것 같아 연락드렸습니다.`,
        ),
      );
    }

    if (f.sincereTone && !f.discountIntent) {
      lines.push("");
      lines.push(
        smsTrimLines(
          `고객님께서 말씀주신 포인트를 부담 없이 전달드리기 위해 현재 확인 가능한 조건 기준으로 간단히 정리했습니다.`,
        ),
      );
    }

    if (tradeIn) {
      lines.push("");
      if (f.tradeInEstimatePhrase) {
        lines.push(
          smsTrimLines(
            `기존 차량은 현재 기준으로 ${stripNoise(f.tradeInEstimatePhrase)} 수준의 대차 가능성을 먼저 보고 있으며, 이후 성능점검장에서 실제 상태를 확인한 뒤 최종 금액이 정리될 예정입니다. 특별한 감가 요인이 없다면 대략적인 범위에서 크게 달라지지는 않을 가능성이 높습니다.`,
          ),
        );
      } else {
        lines.push(
          smsTrimLines(`
기존 차량 매각도 함께 고려하고 계신 것으로 기억하고 있습니다.
중고차 가격을 먼저 확인해보고, 이후 성능점검장에서 실제 상태를 확인할 예정입니다.
특별한 감가 요인이 없다면 안내드린 대략적인 금액에서 크게 달라지지는 않을 가능성이 높습니다.`),
        );
      }
    }

    if (wantsTestDrive) {
      lines.push("");
      lines.push(smsTrimLines(`시승 일정 관련해서 말씀 주신 내용 참고했습니다.\n${tone.prepareTd}`));
    }

    lines.push("");
    if (hasCareAudience) lines.push(CARE_SMS_SCHEDULE_PREPARE_CLOSE_KO);
    else lines.push(tone.confirmClose);
    if (tone.inviteQ && salesStyle !== "simple") lines.push(tone.inviteQ);
    lines.push("감사합니다.");

    return smsTrimLines(lines.join("\n"));
  }

  function buildOutboundSmsKo(): string {
    if (memoFactsKo && memoRichKo) return buildStructuredKoSms();

    function topicParticle(phrase: string): "은" | "는" {
      const t = phrase.trim();
      if (!t) return "는";
      const last = t[t.length - 1];
      const c = last.codePointAt(0)!;
      if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0 ? "은" : "는";
      return "는";
    }

    const customer = customerNameKo ? `${customerNameKo}님` : "OO님";
    const tone = koSmsStyleTone(salesStyle);

    /** 차량 본문 1문단 — 예시 카피와 유사하게. */
    let vehicleParagraph = "";

    function vehicleBodyComfortFamily(): string {
      return rideComfort && family ?
          "장거리 주행 시 편안한 승차감과 정숙성을 느끼기 좋고, 가족분들과 함께 이동하실 때도 실내 공간과 안정감 면에서 만족도가 높습니다."
        : rideComfort ? "장거리 주행에서도 차분한 정숙감과 승차감을 느끼기 좋습니다."
        : family ? "가족 탑승과 함께할 때 좌석·동선 중심으로 편의가 잘 잡히는 타입입니다."
        : "";
    }

    const bodyCore = vehicleBodyComfortFamily();

    if (interestModelKo) {
      const tp = topicParticle(interestModelKo);
      vehicleParagraph =
        bodyCore ?
          `${interestModelKo}${tp} ${bodyCore} 고객님께 잘 맞을 수 있는 차량으로 보입니다.`
        : `${interestModelKo}${tp} 말씀주신 기준에 맞춰 실 차량 상태와 금융 라인까지 함께 확인해 보실 수 있습니다.`;
    } else if (bodyCore) {
      vehicleParagraph = `고객님께서 관심 가져주신 모델은 ${bodyCore} 고객님께 잘 맞을 수 있는 차량입니다.`;
    } else if (finance) {
      vehicleParagraph =
        `고객님께서 관심 가져주신 모델은 말씀주신 조건 위주로 다시 차분히 확인하시기 좋은 차량입니다.`;
      if (compare)
        vehicleParagraph +=
          ` 비교가 걱정되시면 고객님께서 보시는 기준으로 핵심 차이만 나눠 안내 드리겠습니다.`;
    } else {
      vehicleParagraph =
        `고객님께서 관심 가져주신 모델은 상담에서 주신 포인트를 기준으로 다시 보시기 좋은 차량입니다.`;
      if (compare)
        vehicleParagraph += ` 다른 모델과의 차이는 핵심만 차분하게 비교 안내 드리겠습니다.`;
    }

    const financeBlock = buildFinanceBlockKo(salesStyle);

    const lines: string[] = [];
    lines.push(`안녕하세요,`);
    lines.push(`${customer}.`);
    lines.push("[브랜드/전시장명] [영업사원명] [직급]입니다.");

    lines.push("");
    lines.push(
      smsTrimLines(
        `지난 상담 때 말씀주신 ${openingRecallJoined} 바탕으로, 고객님께서 관심 가져주신 모델의 주요 장점을 한 번 더 안내드리고자 연락드렸습니다.`,
      ),
    );

    lines.push("");
    lines.push(smsTrimLines(vehicleParagraph));

    if (financeBlock) {
      lines.push("");
      lines.push(smsTrimLines(financeBlock));
    }

    if (tradeIn) {
      lines.push("");
      lines.push(
        smsTrimLines(`
기존 차량 매각도 함께 고려하고 계신 것으로 기억하고 있습니다.
중고차 가격을 먼저 확인해보고, 이후 성능점검장에서 실제 상태를 확인할 예정입니다.
특별한 감가 요인이 없다면 안내드린 대략적인 금액에서 크게 달라지지는 않을 가능성이 높습니다.`),
      );
    }

    if (wantsTestDrive) {
      lines.push("");
      lines.push(smsTrimLines(`시승 일정 관련해서 말씀 주신 내용 참고했습니다.\n${tone.prepareTd}`));
    }

    lines.push("");
    lines.push(tone.confirmClose);
    lines.push("감사합니다.");
    if (tone.inviteQ && salesStyle !== "simple") {
      lines.splice(lines.length - 1, 0, tone.inviteQ);
    }

    return smsTrimLines(lines.join("\n"));
  }

  function buildOutboundSmsEn(): string {
    const toneEn =
      salesStyle === "simple" ?
        { close: "When you have a moment, a quick glance is appreciated.", extra: "", td: "Share time/place—I’ll arrange the demo drive." }
      : salesStyle === "premium" ?
        {
          close: "Whenever convenient, kindly review when you have time.",
          extra: "Questions are welcome anytime.",
          td: "If you share a preferred time window and location, I’ll prepare the route and briefing calmly.",
        }
      : salesStyle === "friendly" ?
        {
          close: "Please review when convenient.",
          extra: "Anything unclear—just ping me lightly.",
          td: "A time window and location are enough—I’ll prepare the explanation and demo drive accordingly.",
        }
      : salesStyle === "active" ?
        {
          close: "A quick review whenever you’re free helps me line up scheduling next.",
          extra: "I’m here if you’d like clarification.",
          td: "Send time/location and I’ll prioritize the demo drive routing and briefing.",
        }
      : {
          close: "Whenever it works for you, please review briefly.",
          extra: "If anything is unclear, feel free to ask.",
          td: "If you share a convenient time window and location, I’ll prepare the explanation and demo drive accordingly.",
        };

    const customer = customerNameKo ? `${customerNameKo} 님` : "OO 님";

    type NeedPhrase = string;
    const needPhrases: NeedPhrase[] = [];
    const comfortNeed = rideComfort ? "quiet ride refinement" : "";
    const familyNeed = family ? "family convenience" : "";
    const financeNeed = finance ? "monthly-payment / financing" : "";
    const scheduleNeed = deliverySoon ? "delivery timing" : "";

    if (comfortNeed) needPhrases.push(comfortNeed);
    if (familyNeed) needPhrases.push(familyNeed);
    if (financeNeed) needPhrases.push(financeNeed);
    if (scheduleNeed) needPhrases.push(scheduleNeed);

    const needsRecall =
      needPhrases.length > 1
        ? `${needPhrases.slice(0, -1).join(", ")} and ${needPhrases.slice(-1)}`
        : needPhrases.length === 1
          ? needPhrases[0]
          : "what you shared earlier";

    const modelPhraseHead = interestModelKo ?? "[model of interest]";

    let body = "";

    const parts: string[] = [];
    if (rideComfort)
      parts.push(`It tends to stay composed on longer drives—quieter cruising is easy to appreciate.`);
    if (family) parts.push(`For family outings, usable space and stable ride usually rate highly.`);

    body = stripNoise(parts.filter(Boolean).join(" "));
    if (!body.length && finance)
      body = `We can revisit the quoted lines calmly—no hype—focus on upfront vs monthly totals.`;

    let finEn = "";
    if (finance) {
      if (financeSignals.downPayment && financeSignals.deposit) {
        finEn +=
          stripNoise(
            `Financing wording is summarized around your indicated down payment and deposit, so monthly payment bands are easier to validate.`,
          ) + " ";
      } else if (financeSignals.mentionQuote) {
        finEn +=
          stripNoise(
            `Quote lines are organized so you can review upfront vs monthly together; figures may vary with registration timing or lender criteria.`,
          ) + " ";
      } else if (finance) {
        finEn += stripNoise(`Payment flow is summarized so you can check monthly lines against your memo.`) + " ";
      }
      if (financeSignals.lease && financeSignals.installment) {
        finEn += stripNoise(
          `Lease vs installment is split upfront vs monthly for easier comparison.`,
        );
      }
      if (financeSignals.longRent) {
        finEn += ` Long-term rentals may vary materially with insurance/service inclusion—please cross-check together.`;
      }
    }

    if (compare) body += stripNoise(` If comparing brands, differences are distilled to essentials only.`);

    const linesEn: string[] = [];
    linesEn.push(stripNoise(`Hello, ${customer}.`));
    linesEn.push("[Brand / Showroom] [Name] [Title]");

    linesEn.push("");
    linesEn.push(
      smsTrimLines(`
Following ${needsRecall} from our last consultation, here are the headline strengths of ${modelPhraseHead} again in a concise note.`),
    );

    linesEn.push("");
    linesEn.push(
      `${modelPhraseHead} ${body.trim()}` +
        `${body.trim() && finEn.trim() ? " " : ""}${stripNoise(finEn)}`.trim(),
    );

    if (tradeIn) {
      linesEn.push("");
      linesEn.push(
        smsTrimLines(`
You’re also weighing trade-in—we’ll benchmark value first and confirm physically at inspection.
Absent major wear/damage surprises, estimates usually stay close to the ballpark already mentioned.`),
      );
    }

    if (wantsTestDrive) {
      linesEn.push("");
      linesEn.push(smsTrimLines(`
You mentioned next Monday—if you share timing and locations, ${toneEn.td}`));
    }

    linesEn.push("");
    linesEn.push(toneEn.close);
    if (toneEn.extra && salesStyle !== "simple") linesEn.push(toneEn.extra);
    linesEn.push("Thank you.");

    return smsTrimLines(linesEn.join("\n"));
  }

  const message = ko ? buildOutboundSmsKo() : buildOutboundSmsEn();

  return {
    summary: summaryLines.join(" "),
    nextAction: nextActionParts.join(" "),
    message,
  };
}

/** 랜딩 규칙형 데모 회귀·스모크 확인용 예시 메모(저장 없음). */
export const CARE_DEMO_SCENARIO_MEMOS: ReadonlyArray<{ id: string; memo: string }> = [
  {
    id: "elder_second_row_gate",
    memo:
      "고객님은 어머님을 자주 모시고 병원에 다니셔서 승하차가 편하고 2열 공간이 넉넉한 차량을 원하심.",
  },
  {
    id: "knee_ingress_doors",
    memo: "고객님은 무릎이 불편해서 차에 오르내릴 때 높이와 도어 개방감이 중요하다고 하심.",
  },
  {
    id: "twin_car_seats_cargo",
    memo: "아이가 둘이고 카시트와 유모차를 자주 사용해서 2열 공간과 트렁크 적재를 중요하게 보심.",
  },
  {
    id: "motion_sickness_quiet_ride",
    memo: "차멀미가 심해서 조용하고 부드러운 주행감을 중요하게 보심.",
  },
  {
    id: "highway_trips_driver_assists",
    memo: "출장이 많아 장거리 운전 피로가 적고 주행 보조 기능이 있는 차량을 원하심.",
  },
];
