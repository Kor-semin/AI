"use client";

import { useTextSize } from "@/app/components/TextSizeProvider";
import type { TextSizeOption } from "@/lib/textSizePreference";

/**
 * 워크스페이스 설정용 글자 배율 컨트롤.
 * 범용 접근성 규격(100% / 120% / 150%)을 따르며, 선택값은 브라우저에 저장되어
 * 앱 전체(rem 기반 크기)에 적용됩니다.
 */
const OPTIONS: readonly { id: TextSizeOption; label: string; description: string }[] = [
  { id: "100", label: "100%", description: "기본 크기" },
  { id: "120", label: "120%", description: "글자를 1.2배로" },
  { id: "150", label: "150%", description: "글자를 1.5배로" },
];

export function SensoraTextSizeControl() {
  const { textSize, setTextSize } = useTextSize();

  return (
    <div className="mt-5">
      <div className="grid gap-2.5 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const active = textSize === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTextSize(opt.id)}
              aria-pressed={active}
              className={[
                "flex min-h-[68px] flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors",
                active
                  ? "border-[var(--s-brand-border)] bg-[var(--s-brand-tint)] text-[var(--s-text)]"
                  : "border-[var(--s-border)] bg-[var(--s-inner)] text-[var(--s-text-2)] hover:border-[var(--s-brand-border-soft)] hover:text-[var(--s-text)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-brand-hover)]",
              ].join(" ")}
            >
              <span className={`text-sm font-bold ${active ? "text-[var(--s-brand-text)]" : ""}`}>{opt.label}</span>
              <span className="text-xs text-[var(--s-text-3)]">{opt.description}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--s-text-3)]">선택한 배율은 이 브라우저에 저장되고 앱 전체 화면에 적용됩니다.</p>
    </div>
  );
}
