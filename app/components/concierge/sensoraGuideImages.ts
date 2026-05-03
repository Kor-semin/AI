/**
 * Sensora 가이드 슬라이드 — `lib/sensoraGuide`와 동일한 5종.
 * 랜딩 TIP · CRM 도움말 뷰어에서 공유합니다.
 */
import type { TranslationKey } from "@/lib/i18n";
import { SENSORA_GUIDES } from "@/lib/sensoraGuide";

export type SensoraGuideSlide = {
  id: string;
  titleKey: TranslationKey;
  src: string;
};

export const SENSORA_GUIDE_IMAGES = SENSORA_GUIDES.map((g) => ({
  id: g.id,
  titleKey: g.titleKey as TranslationKey,
  src: g.image,
})) as readonly SensoraGuideSlide[];

/** 랜딩 TIP 카드 순번 1–4 → 배열 인덱스(0–4) */
export const SENSORA_TIP_CARD_INITIAL_INDEX: Readonly<Record<1 | 2 | 3 | 4, number>> = {
  1: 2,
  2: 0,
  3: 1,
  4: 3,
};

export function sensoraGuideImageSources(): readonly string[] {
  return SENSORA_GUIDE_IMAGES.map((s) => s.src);
}
