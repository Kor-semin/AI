export const TEXT_SIZE_STORAGE_KEY = "sensora:textSize" as const;

/**
 * 글자 배율 — 범용 접근성 규격(브라우저 확대 배율과 같은 방식)을 따릅니다.
 * "100" = 기본, "120" = 1.2배, "150" = 1.5배.
 * root font-size(%)를 조절하므로 rem 기반 크기만 함께 커집니다.
 */
export type TextSizeOption = "100" | "120" | "150";

const VALID: readonly TextSizeOption[] = ["100", "120", "150"];

export function normalizeTextSize(raw: string | null | undefined): TextSizeOption {
  if (raw === "100" || raw === "120" || raw === "150") return raw;
  // 구버전 저장값 호환: small/medium → 100%, large → 120%
  if (raw === "large") return "120";
  return "100";
}

/** 브라우저에서 호출 전제 (SSR 안전 가드 포함) */
export function readStoredTextSize(): TextSizeOption {
  if (typeof window === "undefined") return "100";
  try {
    return normalizeTextSize(window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY));
  } catch {
    return "100";
  }
}

export function writeStoredTextSize(size: TextSizeOption): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch {
    /* ignore */
  }
}

export function applyTextSizeToDocument(size: TextSizeOption): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-text-size", size);
}

export { VALID as TEXT_SIZE_OPTIONS };
