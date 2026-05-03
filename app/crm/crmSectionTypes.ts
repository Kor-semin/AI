import type { TranslationKey } from "@/lib/i18n";

export type CrmSection =
  | "dashboard"
  | "customers"
  | "consulting"
  | "ai"
  | "pipeline"
  | "vehicle"
  | "followup"
  | "settings";

export const CRM_SECTION_LABELS: Record<CrmSection, { title: string; subtitle: string }> = {
  dashboard: { title: "요약", subtitle: "오늘의 영업 흐름" },
  customers: { title: "고객관리", subtitle: "목록·상세·상태" },
  consulting: { title: "상담 메모", subtitle: "직접 수정·원문 보존" },
  ai: { title: "AI 비서", subtitle: "니즈·영업 포인트·문자" },
  pipeline: { title: "영업 단계", subtitle: "단계별 고객" },
  vehicle: { title: "차량 매칭", subtitle: "조건·예산·모델 적합" },
  followup: { title: "사후관리", subtitle: "해야 할 일과 일정" },
  settings: { title: "설정", subtitle: "내 정보·안내" },
};

export const CRM_SECTION_ORDER: CrmSection[] = [
  "dashboard",
  "customers",
  "consulting",
  "ai",
  "pipeline",
  "vehicle",
  "followup",
  "settings",
];

/** 좁은 화면(모바일) 섹션 탭 부제 · 요약 카드 한 줄 표시용 */
export const CRM_SECTION_MOBILE_SUBTITLE_KEYS: Record<CrmSection, TranslationKey> = {
  dashboard: "crm.nav.mobileSubtitle.dashboard",
  customers: "crm.nav.mobileSubtitle.customers",
  consulting: "crm.nav.mobileSubtitle.consulting",
  ai: "crm.nav.mobileSubtitle.ai",
  pipeline: "crm.nav.mobileSubtitle.pipeline",
  vehicle: "crm.nav.mobileSubtitle.vehicle",
  followup: "crm.nav.mobileSubtitle.followup",
  settings: "crm.nav.mobileSubtitle.settings",
};

/** URL hash → 섹션 (기존 #crm-ai-assistant 유지) */
export function hashToCrmSection(hashRaw: string): CrmSection | null {
  const h = hashRaw.replace(/^#/, "").trim().toLowerCase();
  if (!h) return null;
  switch (h) {
    case "dashboard":
      return "dashboard";
    case "customers":
    case "crm-main":
      return "customers";
    case "consulting":
      return "consulting";
    case "crm-ai-assistant":
    case "ai":
      return "ai";
    case "pipeline":
      return "pipeline";
    case "vehicle-match":
    case "vehicle":
      return "vehicle";
    case "follow-up":
    case "followup":
    case "crm-workspace-next":
      return "followup";
    case "settings":
      return "settings";
    default:
      return null;
  }
}

export function crmSectionToHash(s: CrmSection): string {
  switch (s) {
    case "dashboard":
      return "dashboard";
    case "customers":
      return "customers";
    case "consulting":
      return "consulting";
    case "ai":
      return "crm-ai-assistant";
    case "pipeline":
      return "pipeline";
    case "vehicle":
      return "vehicle-match";
    case "followup":
      return "follow-up";
    case "settings":
      return "settings";
    default:
      return "dashboard";
  }
}
