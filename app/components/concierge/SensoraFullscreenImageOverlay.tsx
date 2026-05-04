"use client";

import Image from "next/image";
import { useEffect } from "react";

type Props = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
  closeLabel: string;
  /** (레거시) 새 탭 열기 라벨이었으나, 현재는 새 탭 금지 정책으로 닫기 안내에 재사용 */
  openOriginalAria: string;
  openOriginalHint: string;
};

export function SensoraFullscreenImageOverlay({
  open,
  src,
  alt,
  onClose,
  closeLabel,
  openOriginalAria,
  openOriginalHint,
}: Props) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[480] flex flex-col bg-[#030712]/97 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] sm:px-5">
        <p className="min-h-11 flex-1 truncate text-left text-[12px] font-medium leading-tight text-slate-300 sm:text-sm">
          {openOriginalHint}
        </p>
        <button
          type="button"
          className="min-h-11 shrink-0 rounded-xl border border-white/[0.14] bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
          onClick={onClose}
        >
          {closeLabel}
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 pb-[max(1rem,calc(env(safe-area-inset-bottom,0px)+12px))]">
        <button
          type="button"
          className="relative mx-auto flex h-full max-h-[min(88dvh,88vh)] w-full max-w-[min(100%,1200px)] cursor-zoom-out items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          aria-label={openOriginalAria}
          onClick={onClose}
        >
          <Image
            src={src}
            alt={alt}
            width={2400}
            height={1600}
            className="h-auto max-h-full w-auto max-w-full object-contain"
            sizes="100vw"
            priority
          />
        </button>
      </div>
    </div>
  );
}
