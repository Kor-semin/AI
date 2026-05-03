import type { TranslationKey } from "@/lib/i18n";

import type { SensoraGuideId } from "@/lib/sensoraGuide";

/** 컨셉 카드 → 통합 가이드 슬라이드 id (이미지·상세 모달 매칭용) */
export function sensoraGuideIdFromConceptSlideId(slideId: string): SensoraGuideId | null {
  switch (slideId) {
    case "security":
      return "sensora-guide-03";
    case "onboarding":
      return "sensora-guide-04";
    case "hub":
      return "sensora-guide-02";
    case "memoFlow":
      return "sensora-guide-01";
    default:
      return null;
  }
}

/** 랜딩·미리보기 플로우 공통 — 4개 테마 카드 (기존 가이드 + 워크스페이스 캡처) */
export type ConceptStorySlide = {
  id: string;
  src: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
};

/** TIP 섹션 표시 순서: 01 이용 시작 → 02 기능 → 03 흐름 → 04 베타·저장 안내 */
export const SENSORA_CONCEPT_TIP_SHORT_KEYS: readonly TranslationKey[] = [
  "landing.showroom.concept.tipStep1Short",
  "landing.showroom.concept.tipStep2Short",
  "landing.showroom.concept.tipStep3Short",
  "landing.showroom.concept.tipStep4Short",
] as const;

export const SENSORA_CONCEPT_STORY_SLIDES: readonly ConceptStorySlide[] = [
  {
    id: "onboarding",
    src: "/images/guides/sensora-guide-04.png",
    titleKey: "concept.story.path.title",
    descKey: "concept.story.path.desc",
  },
  {
    id: "hub",
    src: "/images/guides/sensora-guide-02.png",
    titleKey: "concept.story.hub.title",
    descKey: "concept.story.hub.desc",
  },
  {
    id: "memoFlow",
    src: "/images/guides/sensora-guide-01.png",
    titleKey: "concept.story.memo.title",
    descKey: "concept.story.memo.desc",
  },
  {
    id: "security",
    src: "/images/guides/sensora-guide-03.png",
    titleKey: "concept.story.security.title",
    descKey: "concept.story.security.desc",
  },
] as const;
