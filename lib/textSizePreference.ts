export const TEXT_SIZE_STORAGE_KEY = "sensora:textSize" as const;

export type TextSizeOption = "small" | "medium" | "large";

const VALID: readonly TextSizeOption[] = ["small", "medium", "large"];

export function normalizeTextSize(raw: string | null | undefined): TextSizeOption {
  if (raw === "small" || raw === "large" || raw === "medium") return raw;
  return "medium";
}

/** 브라우저에서 호출 전제 (SSR 안전 가드 포함) */
export function readStoredTextSize(): TextSizeOption {
  if (typeof window === "undefined") return "medium";
  try {
    return normalizeTextSize(window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY));
  } catch {
    return "medium";
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
