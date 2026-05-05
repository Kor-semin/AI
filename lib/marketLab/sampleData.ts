/** Market Lab — 샘플 데이터만 사용 (실시간 시세·주문·API 없음) */

export type NewsRiskDirection = "긍정" | "중립" | "부정";

export type SampleNewsItem = {
  id: string;
  title: string;
  source: string;
  region: string;
  publishedAt: string;
  summary: string;
  marketImpact: string;
  riskDirection: NewsRiskDirection;
  trustOrVerify: string;
};

export type SamplePaperItem = {
  id: string;
  title: string;
  institution: string;
  publishedAt: string;
  coreClaim: string;
  cryptoMarketLink: string;
  dangerousIfUsedAlone: string;
  longTermTakeaway: string;
};

/** 오늘의 시장 요약 — 샘플 */
export const SAMPLE_MARKET_SUMMARY = {
  date: "2026-05-06",
  atmosphere:
    "단기 변동성이 이슈로 부각된 관망 분위기입니다. 방향을 단정하지 않으며, 아래는 교육용 예시 문구입니다.",
  keyNewsHeadlines: [
    { id: "n1", short: "거래소 보고 의무·규제 논의 재개(샘플)" },
    { id: "n2", short: "온체인·기관 보유 편차 관측(샘플)" },
    { id: "n3", short: "거시지표 발표 앞두고 관망 심리(샘플)" },
  ],
  keyRisks: [
    "추격매수에 따른 단기 되돌림 위험(일반적 리스크 설명, 예시)",
    "규제 뉴스의 해석 편차 및 시차(샘플)",
    "거래소·보안 이슈는 종목·거래소별로 다름 — 단정 금지(예시)",
  ],
  dailyCaution:
    "리스크 확인이 우선입니다. 소액 학습용 모의 기록만 권장하며, 단기 매매 근거로 단정하면 위험합니다.",
} as const;

export const SAMPLE_NEWS: SampleNewsItem[] = [
  {
    id: "n1",
    title: "규제 논의 재개: 거래소 보고 의무 강화안 타진(샘플)",
    source: "샘플 글로벌 언론 A",
    region: "북미",
    publishedAt: "2026-05-04",
    summary:
      "입법 초안 단계로 시행 시점·범위는 불확실합니다. 공식 원문·날짜를 확인하기 전에는 방향을 단정하지 마세요.",
    marketImpact:
      "규제 불확실성 심리가 단기 변동을 키울 수 있습니다. 실제 시장 반응은 때에 따라 다릅니다.",
    riskDirection: "부정",
    trustOrVerify: "원문·입법 로드맵 확인 필요 · 샘플 요약",
  },
  {
    id: "n2",
    title: "기관 보유량 변동 구간이 온체인에서 관측됨(샘플)",
    source: "샘플 유럽 리서치 데스크",
    region: "EU",
    publishedAt: "2026-05-05",
    summary:
      "일부 지표에서 보유 편차가 보였습니다. 지표는 후행적일 수 있고 원인은 복합적입니다.",
    marketImpact: "해석에 따라 기대·우려가 갈릴 수 있는 구간입니다. 추세 확정으로 보지 않습니다.",
    riskDirection: "중립",
    trustOrVerify: "지표 정의·시점 재확인 권장 · 샘플",
  },
  {
    id: "n3",
    title: "주요 국가 CPI·고용 지표 발표 예고(샘플)",
    source: "샘플 아시아 경제 매체",
    region: "아시아",
    publishedAt: "2026-05-06",
    summary:
      "거시경제 지표 발표 전후로 유동성·심리 변동이 나올 수 있습니다. 결과는 발표 전 시점에 알 수 없습니다.",
    marketImpact: "금리·유동성 기대 변화가 가상자산 변동성에 간접 영향을 줄 수 있습니다(일반론).",
    riskDirection: "중립",
    trustOrVerify: "실제 발표치·시장 반응 확인 필요 · 샘플",
  },
];

export const SAMPLE_PAPERS: SamplePaperItem[] = [
  {
    id: "p1",
    title: "On-chain liquidity and retail participation (예시 제목)",
    institution: "샘플 대학 프리프린트",
    publishedAt: "2024-11",
    coreClaim: "소매 참여가 유동성에 미치는 효과를 모형으로 설명합니다.",
    cryptoMarketLink:
      "단기 가격 예측이 아니라 구조 이해용 참고입니다. 시장에 바로 대입하면 위험합니다.",
    dangerousIfUsedAlone:
      "학술 가정·표본이 실제 거래와 다를 수 있습니다. 논문만 보고 매매 타이밍을 잡기 어렵습니다.",
    longTermTakeaway: "유동성·참여 구조를 장기적으로 이해하는 데 참고할 수 있는 관점입니다.",
  },
  {
    id: "p2",
    title: "Volatility clustering in crypto markets (예시)",
    institution: "샘플 저널",
    publishedAt: "2023-08",
    coreClaim: "가격 변동이 군집을 이룰 수 있음을 통계적으로 기술합니다.",
    cryptoMarketLink:
      "변동성 확대 구간에서 추격매수·레버리지 위험이 커질 수 있다는 일반적 시사에 활용할 수 있습니다.",
    dangerousIfUsedAlone:
      "단기 매매 신호로 쓰기엔 불확실성이 큽니다. 손실 한도·소액 원칙이 우선입니다.",
    longTermTakeaway: "리스크 관리·포지션 크기 점검의 참고 자료로만 보세요.",
  },
];

export type RiskDimensionId =
  | "volatility"
  | "news"
  | "macro"
  | "regulation"
  | "exchange"
  | "sentiment";

export type RiskLevelLabel = "낮음" | "보통" | "높음";

export type SampleRiskDimension = {
  id: RiskDimensionId;
  label: string;
  score: number;
  level: RiskLevelLabel;
  reason: string;
  refLabel: string;
};

function levelFromScore(s: number): RiskLevelLabel {
  if (s < 35) return "낮음";
  if (s < 70) return "보통";
  return "높음";
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * 시드 기반 데모 점수(동일 입력 → 동일 출력).
 * 실제 시장 리스크와 무관할 수 있습니다.
 */
export function buildSampleRiskDimensions(seed: string): {
  totalScore: number;
  dimensions: SampleRiskDimension[];
  narrativeHint: string;
} {
  const h = hashSeed(seed);
  const dims: Omit<SampleRiskDimension, "score" | "level">[] = [
    {
      id: "volatility",
      label: "가격 변동성",
      reason:
        "최근 단기 변동폭이 확대된 구간으로 가정한 예시입니다. 추격매수·과대 포지션에 주의하라는 일반 경고입니다.",
      refLabel: "참고: 논문 p2 (변동성 군집), 뉴스 n3",
    },
    {
      id: "news",
      label: "뉴스 분위기",
      reason:
        "규제·거시 뉴스가 혼재해 해석이 갈릴 수 있습니다. 단기 방향을 단정하지 않습니다.",
      refLabel: "참고: 뉴스 n1, n2",
    },
    {
      id: "macro",
      label: "거시경제 불확실성",
      reason: "지표 발표 전후 변동 가능성 — 결과는 알 수 없으며 관망·리스크 확인이 우선입니다.",
      refLabel: "참고: 뉴스 n3",
    },
    {
      id: "regulation",
      label: "규제·정책 리스크",
      reason:
        "규제 관련 뉴스는 있으나 입법 단계·시점이 불확실합니다. 단기 방향성을 단정하기 어렵습니다.",
      refLabel: "참고: 뉴스 n1",
    },
    {
      id: "exchange",
      label: "거래소·보안 리스크",
      reason:
        "플랫폼별로 다릅니다. 이 화면에서는 일반적 경고만 제시합니다. 개별 거래소 공지를 확인하세요.",
      refLabel: "참고: 내부 샘플 설명 (실데이터 없음)",
    },
    {
      id: "sentiment",
      label: "투자 심리 과열 여부",
      reason:
        "단기 관심 증가가 과열 신호일 수 있습니다. FOMO·추격매수를 경계하는 표현으로 쓰였습니다.",
      refLabel: "참고: 시장 요약 문구",
    },
  ];

  const scores = dims.map((_, i) => {
    const v = (h >> (i * 5)) ^ (h + i * 7919);
    return Math.abs(v) % 101;
  });

  const dimensions: SampleRiskDimension[] = dims.map((d, i) => {
    const score = scores[i]!;
    return { ...d, score, level: levelFromScore(score) };
  });

  const totalScore = Math.round(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length);

  const narrativeHint =
    totalScore >= 70
      ? "리스크 확인 필요 · 변동성 확대 구간으로 가정한 데모입니다."
      : totalScore >= 40
        ? "관망 우세 · 세부 항목을 각각 점검하세요."
        : "상대적으로 낮게 나왔으나, 변동 위험은 항상 존재합니다.";

  return { totalScore, dimensions, narrativeHint };
}

/** 레거시 호환: 단일 점수 + 문구 */
export function sampleBtcRiskScore(seed: string): { score: number; label: string; factors: string[] } {
  const { totalScore, narrativeHint } = buildSampleRiskDimensions(seed);
  return {
    score: totalScore,
    label: narrativeHint,
    factors: [
      "항목별 점수는 아래 표에서 확인하세요.",
      "점수는 규칙 기반 샘플이며 투자 자문이 아닙니다.",
    ],
  };
}

/** AI(앱)가 왜 이렇게 정리하는지 — 금액·매수 지시 없음 */
export const AI_RATIONALE_COPY = {
  title: "왜 이렇게 보는지 (정리 방식 설명)",
  bullets: [
    "뉴스·논문은 출처·날짜를 붙여 ‘참고 자료’로만 제시합니다. 단기 매수·매도를 권유하지 않습니다.",
    "위험 항목별 점수는 교육용 데모로, 내부 시드값으로 재현 가능한 의사 난수입니다. 실제 데이터 피드가 아닙니다.",
    "시장에 줄 수 있는 영향은 ‘가능성’ 수준으로만 쓰였고, 확정·예측 표현은 피했습니다.",
    "금액·비중·몇 원 매수 같은 판단은 앱이 하지 않으며, 모의 예산·배분은 전부 사용자 입력입니다.",
  ],
} as const;

/** 표시용 정적 참고치 (실시간 시세 아님) */
export const SAMPLE_REF_PRICES_KRW = {
  BTC: 98_500_000,
  ETH: 3_420_000,
} as const;
