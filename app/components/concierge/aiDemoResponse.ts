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
  if (s.includes("전기차") || s.includes("ev")) return "전기차";
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

/** E-Class · X5 / Countryman 같은 모델 토큰을 메모에서 끌어냅니다(데모 목적의 가벼운 추출). */
function extractLikelyVehicleModel(raw: string): string | null {
  const normalized = stripNoise(raw);
  const brandModel =
    /\b(Mercedes-Benz|Mercedes|Benz|메르세데스|벤츠|BMW|MINI|Audi|Genesis|Genesis_|제네시스|Porsche|포르쉐|Lexus|렉서스|Volvo|볼보)\s+([A-Za-z0-9][A-Za-z0-9‑\-+]*)+/i.exec(
      normalized,
    );
  if (brandModel?.[2]) {
    const brand = brandModel[1];
    const model = brandModel[2];
    const prettyBrand =
      /^mercedes|^benz|^메르세데스|^벤츠/i.test(brand) ? "Mercedes-Benz"
      : /^bmw$/i.test(brand) ? "BMW"
      : /^mini$/i.test(brand) ? "MINI"
      : /^audi$/i.test(brand) ? "Audi"
      : /^gen|^제네시스/i.test(brand) ? "Genesis"
      : /^porsche|^포르쉐/i.test(brand) ? "Porsche"
      : /^lexus|^렉서스/i.test(brand) ? "Lexus"
      : /^volvo|^볼보/i.test(brand) ? "Volvo"
      : brand;

    const cleanModel =
      /^genesis$/i.test(model) ? (normalized.match(/G\d{2,4}/i)?.[0] ?? model).toUpperCase() : model;
    const upperModel = /^[a-z]+$/.test(cleanModel)
      ? cleanModel.toUpperCase()
      : cleanModel.replace(/^./, (c) => c.toUpperCase());

    return `${prettyBrand} ${upperModel}`;
  }

  const knownModelCodes =
    /\b(G\d{2,4}|E[-–]?\s*Class|S[-–]?\s*Class|GLE|GLC|GLS|X\d|XM|XC\d{2}|A\d|RS\d+|Cayenne|Macan|Taycan|E-Tron|e-tron|Countryman|SUV)\b/i;

  const vehicleToken =
    normalized.match(/\b([A-Za-z]{1}[A-Za-z0-9‑\-+]+\s+(?:Countryman|SUV|Hybrid|Hybrid\+)\b)/i)?.[1] ??
    normalized.match(/\b(G\d{2,4}|E[-–]?\s*Class|S[-–]?\s*Class|[A-Za-z]+\s*Countryman|[A-Za-z]+\s*Hybrid\+?|[A-Za-z]{1,6}\s*SUV)\b/i)?.[0] ??
    normalized.match(knownModelCodes)?.[0];

  const hit = typeof vehicleToken === "string" ? vehicleToken.trim() : vehicleToken ?? null;

  const generic = /\b차량\b/.test(hit ?? "") ? null : hit;
  if (!generic) return null;

  return generic.includes("‑") ? generic.replace(/‑/g, "-") : generic;
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
  const vehicleType = detectVehicleType(input);
  const salesStyle: DemoSalesStyle = options?.salesStyle ?? "polite";
  const financeSignals = mergeQuoteHintsFromOptions(input, options);

  const rideComfort = hasAny(input, ["승차감", "조용", "정숙", "정숙성"]);
  const family = hasAny(input, ["가족", "아이", "등하원"]);

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
  const tradeIn = hasAny(input, ["중고차", "트레이드인", "대차", "기존차", "기존 차량", "매각"]);
  const deliverySoon = hasAny(input, ["출고", "일정", "빨리", "빠르게", "빠른"]);
  const compare = hasAny(input, ["고민", "비교", "타브랜드", "다른 브랜드"]);
  const wantsTestDrive = hasAny(input, ["시승", "테스트 드라이브", "test drive"]);

  const focus: string[] = [];
  if (rideComfort) focus.push("정숙·승차감");
  if (family) focus.push("가족 이동 편의");
  if (finance) focus.push("금융·견적");
  if (tradeIn) focus.push("기존 차량 대차/매각");
  if (deliverySoon) focus.push("출고 가능 일정");
  if (vehicleType) focus.push(`관심 차종(${vehicleType})`);
  if (compare) focus.push("비교 포인트 정리");

  function buildOpeningRecallFragmentsKo(): string[] {
    const frags: string[] = [];
    if (rideComfort) frags.push("조용한 승차감과 정숙성");
    if (family) frags.push("가족 이동 편의성");

    let financeRecall = "";
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

  const interestModelKo = extractLikelyVehicleModel(input);
  const customerNameKo =
    /\b([\u3131-\uD79D]{2,4})님\b/.exec(input)?.[1] ??
    /\b([\u3131-\uD79D]{2,4}) 고객님\b/.exec(input)?.[1] ??
    null;

  const focusText = focus.length ? focus.join(" · ") : ko ? "핵심 니즈" : "key needs";
  const openingRecallJoined = joinOpeningRecallKo(buildOpeningRecallFragmentsKo());

  const summaryLines: string[] = [];
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

  const nextActionParts: string[] = [];
  nextActionParts.push(
    ko
      ? "고객이 말씀하신 숫자·조건 단위 그대로 견적서 항목이 맞는지 재확인한 뒤, 문자에는 ‘정리해 두었음/안내드릴 수 있음’ 형태로 가볍게 전달합니다."
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
      ko ? "중고 가격 확인 → 진단 순서까지 고정 멘트로 정리했는지 문자에 반영되어 있는지 봅니다." : "Ensure trade-in flow language matches memo.",
    );
  if (deliverySoon)
    nextActionParts.push(ko ? "재고 가능일과 주문 납기를 나누어 한 줄씩 문자에 넣습니다." : "Split inventory vs ordered lead-times.");
  if (compare)
    nextActionParts.push(ko ? "비교 차량 명칭 받은 경우에만 ‘핵심 차이 세 가지’로 요약합니다." : "Summarize three differences only once comparables are named.");

  function buildOutboundSmsKo(): string {
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
      vehicleParagraph = `고객님께서 관심 가져 주신 모델은 ${bodyCore} 고객님께 잘 맞을 수 있는 차량입니다.`;
    } else if (finance) {
      vehicleParagraph =
        `고객님께서 관심 가져 주신 모델은 말씀주신 조건 위주로 다시 차분히 확인하시기 좋은 차량입니다.`;
      if (compare)
        vehicleParagraph +=
          ` 비교가 걱정되시면 고객님께서 보시는 기준으로 핵심 차이만 나눠 안내 드리겠습니다.`;
    } else {
      vehicleParagraph =
        `고객님께서 관심 가져 주신 모델은 상담에서 주신 포인트를 기준으로 다시 보시기 좋은 차량입니다.`;
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
        `지난 상담 때 말씀주신 ${openingRecallJoined} 바탕으로, 고객님께서 관심 가져 주신 모델의 주요 장점을 한 번 더 안내드리고자 연락드렸습니다.`,
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
      lines.push(smsTrimLines(`
다음 주 월요일 시승을 원하신다고 하셨는데,
${tone.prepareTd}`));
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
