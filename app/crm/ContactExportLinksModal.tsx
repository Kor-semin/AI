"use client";

import { useEffect } from "react";

export type ContactExportLinksVariant = "google" | "icloud";

const GOOGLE_CONTACTS_URL = "https://contacts.google.com/";
const GOOGLE_CONTACTS_EXPORT_HELP_URL = "https://support.google.com/contacts/answer/7199294";
const ICLOUD_CONTACTS_URL = "https://www.icloud.com/contacts";
const ICLOUD_CONTACTS_EXPORT_HELP_URL =
  "https://support.apple.com/guide/icloud/import-export-and-print-contacts-mmfba748b2/icloud";

const overlayClass =
  "fixed inset-0 z-[362] flex items-end justify-center bg-black/[0.58] backdrop-blur-[2px] px-3 pb-[max(12px,calc(env(safe-area-inset-bottom,0px)+8px))] pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] sm:items-center sm:p-6";

const primaryBtn =
  "inline-flex min-h-[44px] w-full flex-1 items-center justify-center rounded-xl bg-[#0F172A] px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1E293B] sm:min-w-[10rem] sm:flex-none";
const secondaryBtn =
  "inline-flex min-h-[44px] w-full flex-1 items-center justify-center rounded-xl border-2 border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#334155] transition hover:bg-[#F8FAFC] sm:min-w-[10rem] sm:flex-none";
const helpTextBtn =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-3 py-2 text-[13px] font-semibold text-[#475569] underline decoration-[#CBD5E1] underline-offset-[5px] hover:text-[#111827]";

/** Google / iCloud 공식 사이트·도움말 — 별도 오버레이로 오인(자동 동기화 등) 방지 */
export function ContactExportLinksModal({
  open,
  variant,
  onClose,
}: {
  open: boolean;
  variant: ContactExportLinksVariant | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !variant) return null;

  const isGoogle = variant === "google";
  const title = isGoogle
    ? "Google 연락처에서 CSV 또는 vCard 파일 준비"
    : "iCloud 연락처에서 vCard 파일 준비";
  const body = isGoogle ? (
    <>
      <p>
        Google 연락처에서 연락처를 선택한 뒤 CSV 또는 vCard 형식으로 내보낼 수 있습니다.
      </p>
      <p className="mt-2 text-[#475569]">
        내보낸 파일은 Sensora에서 미리보기 후 선택한 항목만 저장할 수 있습니다.
      </p>
    </>
  ) : (
    <>
      <p>iCloud 연락처에서 vCard 파일을 내보낸 뒤 Sensora에 업로드할 수 있습니다.</p>
      <p className="mt-2 text-[#475569]">
        iPhone에서는 연락처 직접 선택이 제한될 수 있으므로, vCard 파일 업로드 방식을 권장합니다.
      </p>
    </>
  );

  return (
    <div
      className={overlayClass}
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-export-links-title"
        className="relative w-full max-w-[440px] rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)] max-sm:max-h-[min(88dvh,640px)] max-sm:overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
          <h2 id="contact-export-links-title" className="min-w-0 flex-1 text-[16px] font-bold leading-snug text-[#111827]">
            {title}
          </h2>
          <button
            type="button"
            aria-label="닫기"
            className="-mr-1 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9]"
            onClick={onClose}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
        <div className="px-5 py-4 text-[13px] leading-relaxed text-[#334155] sm:px-6">{body}</div>
        <div className="flex flex-col gap-2 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:flex-wrap sm:px-6">
          {isGoogle ? (
            <>
              <a href={GOOGLE_CONTACTS_URL} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
                Google 연락처 열기
              </a>
              <a
                href={GOOGLE_CONTACTS_EXPORT_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryBtn}
              >
                내보내기 도움말 보기
              </a>
            </>
          ) : (
            <>
              <a href={ICLOUD_CONTACTS_URL} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
                iCloud 연락처 열기
              </a>
              <a
                href={ICLOUD_CONTACTS_EXPORT_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryBtn}
              >
                iCloud 내보내기 도움말 보기
              </a>
            </>
          )}
        </div>
        <div className="border-t border-[#E5E7EB] px-5 pb-[max(16px,calc(env(safe-area-inset-bottom,0px)+12px))] pt-2 sm:px-6">
          <button type="button" className={helpTextBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
