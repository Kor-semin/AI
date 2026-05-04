"use client";

import Image from "next/image";
import { useEffect } from "react";

type Props = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
  closeLabel: string;
  /** 새 탭으로 원본 열기 접근 이름 */
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

  const openOriginal = () => {
    try {
      const abs =
        src.startsWith("http://") || src.startsWith("https://")
          ? src
          : `${window.location.origin}${src.startsWith("/") ? src : `/${src}`}`;
      window.open(abs, "_blank", "noopener,noreferrer");
    } catch {
      /* ignore */
    }
  };

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[480] flex flex-col bg-[#030712]/97 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] sm:px-5">
        <button
          type="button"
          onClick={openOriginal}
          className="min-h-11 shrink-0 rounded-xl border border-sky-400/28 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-sky-400/42 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
          aria-label={openOriginalAria}
        >
          {openOriginalHint}
        </button>
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
          onClick={openOriginal}
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
