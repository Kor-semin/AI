/** Sensora 가이드 카드 단일 소스 — 앱 미리보기·뷰어·CRM 도움말에서 공통 사용 */

import type { TranslationKey } from "@/lib/i18n";

import type { CrmSection } from "@/app/crm/crmSectionTypes";

export type SensoraGuideId =
  | "sensora-guide-01"
  | "sensora-guide-02"
  | "sensora-guide-03"
  | "sensora-guide-04"
  | "sensora-guide-05";

export type SensoraGuideEntry = {
  id: SensoraGuideId;
  image: string;
  titleKey:
    | "guide.sensora-guide-01.title"
    | "guide.sensora-guide-02.title"
    | "guide.sensora-guide-03.title"
    | "guide.sensora-guide-04.title"
    | "guide.sensora-guide-05.title";
  descKey:
    | "guide.sensora-guide-01.desc"
    | "guide.sensora-guide-02.desc"
    | "guide.sensora-guide-03.desc"
    | "guide.sensora-guide-04.desc"
    | "guide.sensora-guide-05.desc";
  /** 상세 모달 긴 설명 본문 */
  detailBodyKey:
    | "guide.sensora-guide-01.detailBody"
    | "guide.sensora-guide-02.detailBody"
    | "guide.sensora-guide-03.detailBody"
    | "guide.sensora-guide-04.detailBody"
    | "guide.sensora-guide-05.detailBody";
  bulletKeys: readonly TranslationKey[];
  /** 상세 모달·미리보기에서 이어 보기 버튼에 사용 */
  relatedSection: CrmSection;
};

export const SENSORA_GUIDES = [
  {
    id: "sensora-guide-01",
    image: "/images/guides/sensora-guide-01.png",
    titleKey: "guide.sensora-guide-01.title",
    descKey: "guide.sensora-guide-01.desc",
    detailBodyKey: "guide.sensora-guide-01.detailBody",
    bulletKeys: [
      "guide.sensora-guide-01.bullet1",
      "guide.sensora-guide-01.bullet2",
      "guide.sensora-guide-01.bullet3",
    ] as const,
    relatedSection: "customers",
  },
  {
    id: "sensora-guide-02",
    image: "/images/guides/sensora-guide-02.png",
    titleKey: "guide.sensora-guide-02.title",
    descKey: "guide.sensora-guide-02.desc",
    detailBodyKey: "guide.sensora-guide-02.detailBody",
    bulletKeys: [
      "guide.sensora-guide-02.bullet1",
      "guide.sensora-guide-02.bullet2",
      "guide.sensora-guide-02.bullet3",
    ] as const,
    relatedSection: "ai",
  },
  {
    id: "sensora-guide-03",
    image: "/images/guides/sensora-guide-03.png",
    titleKey: "guide.sensora-guide-03.title",
    descKey: "guide.sensora-guide-03.desc",
    detailBodyKey: "guide.sensora-guide-03.detailBody",
    bulletKeys: [
      "guide.sensora-guide-03.bullet1",
      "guide.sensora-guide-03.bullet2",
      "guide.sensora-guide-03.bullet3",
      "guide.sensora-guide-03.bullet4",
    ] as const,
    relatedSection: "dashboard",
  },
  {
    id: "sensora-guide-04",
    image: "/images/guides/sensora-guide-04.png",
    titleKey: "guide.sensora-guide-04.title",
    descKey: "guide.sensora-guide-04.desc",
    detailBodyKey: "guide.sensora-guide-04.detailBody",
    bulletKeys: [
      "guide.sensora-guide-04.bullet1",
      "guide.sensora-guide-04.bullet2",
      "guide.sensora-guide-04.bullet3",
    ] as const,
    relatedSection: "followup",
  },
  {
    id: "sensora-guide-05",
    image: "/images/guides/sensora-guide-05.png",
    titleKey: "guide.sensora-guide-05.title",
    descKey: "guide.sensora-guide-05.desc",
    detailBodyKey: "guide.sensora-guide-05.detailBody",
    bulletKeys: [
      "guide.sensora-guide-05.bullet1",
      "guide.sensora-guide-05.bullet2",
      "guide.sensora-guide-05.bullet3",
    ] as const,
    relatedSection: "dashboard",
  },
] as const satisfies readonly SensoraGuideEntry[];

export const DEFAULT_GUIDE_ID: SensoraGuideId = "sensora-guide-03";

export function sensoraGuideIndex(id: string): number {
  const i = SENSORA_GUIDES.findIndex((g) => g.id === id);
  return i < 0 ? 0 : i;
}

export function sensoraGuideById(id: string): SensoraGuideEntry | undefined {
  return SENSORA_GUIDES.find((g) => g.id === id);
}
