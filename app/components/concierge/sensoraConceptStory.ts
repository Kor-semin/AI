import type { TranslationKey } from "@/lib/i18n";

/** 랜딩·미리보기 플로우 공통 — 4개 테마 카드 (기존 가이드 + 워크스페이스 캡처) */
export type ConceptStorySlide = {
  id: string;
  src: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
};

export const SENSORA_CONCEPT_STORY_SLIDES: readonly ConceptStorySlide[] = [
  {
    id: "security",
    src: "/images/guides/sensora-guide-03.png",
    titleKey: "concept.story.security.title",
    descKey: "concept.story.security.desc",
  },
  {
    id: "onboarding",
    src: "/images/profile-workspace.png",
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
] as const;
