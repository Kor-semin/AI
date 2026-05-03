/**
 * Sensora 이미지 가이드 단일 소스 — 랜딩 TIP · 앱 도움말에서 동일하게 사용합니다.
 * 슬라이드 순서 = 뷰어에서 1/3, 2/3, 3/3
 */
export type SensoraGuideSlide = {
  id: string;
  /** landing.showroom.tip.card*.title 과 맞춤 */
  titleKey:
    | "landing.showroom.tip.card1.title"
    | "landing.showroom.tip.card2.title"
    | "landing.showroom.tip.card3.title";
  src: string;
};

export const SENSORA_GUIDE_IMAGES = [
  {
    id: "start",
    titleKey: "landing.showroom.tip.card1.title",
    src: "/images/guides/sensora-guide-03.png",
  },
  {
    id: "features",
    titleKey: "landing.showroom.tip.card2.title",
    src: "/images/guides/sensora-guide-02.png",
  },
  {
    id: "overview",
    titleKey: "landing.showroom.tip.card3.title",
    src: "/images/guides/sensora-guide-01.png",
  },
] as const satisfies readonly SensoraGuideSlide[];

/** 랜딩 TIP 카드 순번 1–4 → SENSORA_GUIDE_IMAGES 배열 인덱스 */
export const SENSORA_TIP_CARD_INITIAL_INDEX: Readonly<Record<1 | 2 | 3 | 4, number>> = {
  1: 0,
  2: 1,
  3: 2,
  4: 0,
};

export function sensoraGuideImageSources(): readonly string[] {
  return SENSORA_GUIDE_IMAGES.map((s) => s.src);
}
