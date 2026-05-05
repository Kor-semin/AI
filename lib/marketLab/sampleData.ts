/** Market Lab — 샘플 데이터만 사용 (실시간 시세/주문 없음) */

export const SAMPLE_MARKET_SUMMARY = {
  date: "2026-05-06",
  bullets: [
    "글로벌 유동성 이슈와 거시 지표가 단기 변동성을 키울 수 있습니다. 급한 결정보다 손실 한도를 먼저 정리하세요.",
    "거래량은 과거 대비 증가했으나, 추세 확정을 단정하지 않습니다. 샘플 지표입니다.",
    "이 요약은 교육용 예시 문구이며 실제 시장과 다를 수 있습니다.",
  ],
};

export const SAMPLE_NEWS = [
  {
    id: "n1",
    title: "규제 논의 재개: 거래소 보고 의무 강화안 타진(샘플)",
    summary: "입법 초안 단계로, 세부 시행 시점과 범위는 불확실합니다. 투자 결정 전 공식 공지를 확인하세요.",
    source: "샘플 언론",
    tone: "중립",
  },
  {
    id: "n2",
    title: "기관 보유량 변동 구간 관측(샘플)",
    summary: "일부 온체인 지표에서 보유 편차가 나타났습니다. 단기 방향을 예측하지 않습니다.",
    source: "샘플 리서치",
    tone: "주의",
  },
] as const;

export const SAMPLE_PAPERS = [
  {
    id: "p1",
    title: "On-chain liquidity and retail participation (예시 논문명)",
    summary: "소액 투자자의 참여 패턴이 유동성에 미치는 영향을 이론적으로 정리한 문헌입니다.",
    venue: "샘플 저널",
  },
  {
    id: "p2",
    title: "Volatility clustering in crypto markets (예시)",
    summary: "변동성 뭉침 현상을 설명하는 모형 소개. 수익을 보장하지 않습니다.",
    venue: "샘플 프리프린트",
  },
] as const;

/** 데모용: 입력 문자열 기반 의사 난수 (항상 동일 입력 → 동일 점수) */
export function sampleBtcRiskScore(seed: string): { score: number; label: string; factors: string[] } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const u = Math.abs(h) % 101;
  const label =
    u >= 70 ? "높음 · 손실 한도 재점검 권장" : u >= 40 ? "중간 · 포지션 크기 주의" : "낮음 · 그래도 변동 위험은 존재";
  return {
    score: u,
    label,
    factors: [
      "샘플 계산: 변동성·유동성 지표를 단순 가중(실거래 데이터 아님)",
      "동일 입력일 때 점수는 재현됩니다. 실제 리스크와 다를 수 있습니다.",
    ],
  };
}

/** 표시용 정적 참고치 (실시간 시세 아님) */
export const SAMPLE_REF_PRICES_KRW = {
  BTC: 98_500_000,
  ETH: 3_420_000,
} as const;
