export type NotebookCoverTheme = "natural" | "mono";

export const NOTEBOOK_COVER_THEME_KEY = "crm.notebookCoverTheme";

/** 표지 표현 — 자연 색 배경 또는 흑백 처리 */
export const NOTEBOOK_COVER_THEME_LABELS: Record<NotebookCoverTheme, string> = {
  natural: "자연 색상",
  mono: "흑백",
};

/** 예전 저장값(diary/showroom/rose 또는 mono) → 새 2종으로 이월 */
export function parseNotebookCoverTheme(raw: string | null): NotebookCoverTheme {
  if (raw === "mono") return "mono";
  if (raw === "natural") return "natural";
  if (raw === "showroom") return "mono";
  /* diary, rose, 기타 빈 문자열 등 → 자연 색 */
  return "natural";
}
