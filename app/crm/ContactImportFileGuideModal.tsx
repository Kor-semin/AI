"use client";

import { useEffect } from "react";

const COMMON_LINES = [
  "CSV와 vCard(.vcf) 형식 파일을 업로드하거나, 같은 내용을 붙여넣어 목록에 넣을 수 있습니다.",
  "전화번호가 같은 기존 고객은 미리보기에서 표시합니다. 새로 만들지 않거나 메모만 이어 붙일 수 있습니다.",
] as const;

const QUICK_DEVICE_NOTES = [
  "iPhone: iCloud 연락처 또는 Mac 연락처 앱에서 vCard로 내보낼 수 있습니다.",
  "Google 연락처: contacts.google.com에서 CSV 또는 vCard로 내보낼 수 있습니다.",
  "Galaxy/Samsung: 연락처 앱의 내보내기 기능을 사용해 vCard 파일을 만들 수 있습니다.",
  "업로드 전 이름·전화번호·중복 연락처를 한 번 둘러봐 주세요.",
  "저장 전 미리보기에서 필요한 연락처만 골라 저장합니다.",
] as const;

const accordionClass =
  "rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-3 text-[13px] leading-relaxed text-[#374151] open:pb-4";
const summaryClass =
  "cursor-pointer select-none font-semibold text-[#0F172A] outline-none [&::-webkit-details-marker]:hidden";

const sectionMuted = "mt-2 text-[12px] leading-relaxed text-[#64748B]";

/** 아이폰·갤럭시·구글 연락처 파일 준비 안내(Audit: 자동 수집·전체 동기화 오인 표현 미사용) */
export function ContactImportFileGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[340] flex items-end justify-center overflow-y-auto bg-black/55 px-3 pb-[max(12px,calc(env(safe-area-inset-bottom,0px)+8px))] pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-file-guide-title"
        className="my-auto w-full max-h-[min(88vh,720px)] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.18)] sm:max-w-[min(100%,460px)] sm:p-6"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4">
          <h2 id="contact-file-guide-title" className="text-[17px] font-bold tracking-tight text-[#111827]">
            연락처 파일 준비 방법
          </h2>
          <button
            type="button"
            className="crm-ghost-btn min-h-[44px] shrink-0 rounded-xl px-4 py-2 text-[13px] font-semibold text-[#374151]"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <p className="mt-4 text-[12px] font-semibold text-[#334155]">기기별로 파일을 만드는 요약</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-[#475569]">
          {QUICK_DEVICE_NOTES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-[#475569]">
          {COMMON_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="mt-5 space-y-3">
          <details className={accordionClass}>
            <summary className={summaryClass}>아이폰 연락처</summary>
            <div className="mt-3 border-t border-[#F1F5F9] pt-3">
              <p>
                iCloud.com에 접속해 연락처를 선택한 뒤 vCard 파일로 내보낼 수 있습니다.
              </p>
              <p className={sectionMuted}>
                아이폰 연락처는 iCloud 연락처와 연결되어 있는 경우가 많습니다. PC 또는 모바일 브라우저에서 iCloud.com에
                접속한 뒤 연락처를 선택하고 vCard(.vcf)로 내보낸 파일을 업로드해 주세요.
              </p>
            </div>
          </details>

          <details className={accordionClass}>
            <summary className={summaryClass}>갤럭시 연락처</summary>
            <div className="mt-3 border-t border-[#F1F5F9] pt-3">
              <p>
                연락처 앱에서 연락처 관리 {">"} 가져오기/내보내기 {">"} 내보내기 메뉴를 통해 연락처 파일을 만들 수
                있습니다.
              </p>
              <p className={sectionMuted}>
                기기나 연락처 앱 버전에 따라 메뉴 이름은 조금 다를 수 있습니다. 내보내기 형식은 보통 VCF 파일입니다.
              </p>
            </div>
          </details>

          <details className={accordionClass}>
            <summary className={summaryClass}>구글 연락처</summary>
            <div className="mt-3 border-t border-[#F1F5F9] pt-3">
              <p>
                Google Contacts에서 연락처를 선택한 뒤 CSV 또는 vCard 형식으로 내보낼 수 있습니다.
              </p>
              <p className={sectionMuted}>
                contacts.google.com에서 연락처를 선택하고 내보내기를 누른 뒤 CSV 또는 vCard 형식으로 저장한 파일을
                업로드해 주세요.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
