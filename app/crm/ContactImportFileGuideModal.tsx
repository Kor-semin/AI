"use client";

import { useEffect, useState } from "react";

const PRIVACY_PRINCIPLES = [
  "기존 고객 정보는 자동으로 덮어쓰지 않습니다.",
  "저장 전 항상 미리보기로 확인합니다.",
  "선택한 연락처만 저장합니다.",
  "Sensora는 고객 정보를 임의로 수집하거나 자동 저장하지 않습니다.",
] as const;

const accordionClass =
  "rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] px-3 py-2.5 text-[13px] leading-relaxed text-[#374151] open:pb-3 sm:px-4 sm:py-3 open:sm:pb-4";
const summaryClass =
  "cursor-pointer select-none font-semibold text-[#0F172A] outline-none [&::-webkit-details-marker]:hidden";

const sectionMuted = "mt-2 text-[12px] leading-relaxed text-[#64748B]";

/** 아이폰·갤럭시·구글 연락처 파일 준비 안내(Audit: 자동 수집·전체 동기화 오인 표현 미사용) */
export function ContactImportFileGuideModal({
  open,
  onClose,
  onProceedToImport,
}: {
  open: boolean;
  onClose: () => void;
  /** 가져오기 패널을 추가로 열어야 할 때(설정 등). 미지정이면 모달만 닫습니다. */
  onProceedToImport?: () => void;
}) {
  /** 모달을 열 때마다 details를 리마운트해 브라우저/OS에 따라 남을 수 있는 펼침 상태를 초기화합니다. */
  const [accordionMountKey, setAccordionMountKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setAccordionMountKey((k) => k + 1);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[340] flex items-end justify-center overflow-y-auto bg-black/55 px-3 pb-[max(12px,calc(env(safe-area-inset-bottom,0px)+8px))] pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] backdrop-blur-sm max-[480px]:[scrollbar-width:none] max-[480px]:[-ms-overflow-style:none] max-[480px]:[&::-webkit-scrollbar]:hidden sm:items-center sm:p-4`}
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
        className="my-auto flex max-h-[min(88dvh,720px)] w-full max-w-[min(100%,460px)] flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-[#E5E7EB] px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <h2 id="contact-file-guide-title" className="text-[17px] font-bold tracking-tight text-[#111827]">
            연락처 파일 준비 방법
          </h2>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <p className="text-[13px] leading-relaxed text-[#475569]">
            휴대폰 기종과 OS 버전에 따라 연락처 앱의 메뉴 이름은 조금씩 다를 수 있습니다. 내보내기로 만든 파일을 Sensora에
            올린 뒤, 미리보기에서 내용을 확인하고 저장하면 됩니다.
          </p>

          <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] leading-relaxed text-[#334155] sm:mt-4 sm:px-4 sm:py-3">
            <p className="font-semibold text-[#0F172A]">개인정보·저장 시 확인</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-snug text-[#475569] sm:mt-2 sm:space-y-1.5 sm:pl-5">
              {PRIVACY_PRINCIPLES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-[#64748B] sm:mt-4">
            지원 형식은 주로 <span className="font-medium text-[#334155]">CSV</span>,{" "}
            <span className="font-medium text-[#334155]">vCard(.vcf)</span> 입니다. 기기별 경로는 아래에서 펼쳐 보실 수
            있습니다.
          </p>

          <div key={accordionMountKey} className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
            <details className={accordionClass}>
              <summary className={summaryClass}>아이폰(iCloud)에서 vCard 만들기</summary>
              <div className="mt-3 border-t border-[#F1F5F9] pt-3">
                <p>iCloud.com에 접속해 연락처를 선택한 뒤 vCard 파일로 내보낼 수 있습니다.</p>
                <p className={sectionMuted}>
                  아이폰 연락처는 iCloud 연락처와 연결되어 있는 경우가 많습니다. PC 또는 모바일 브라우저에서 iCloud.com에
                  접속한 뒤 연락처를 선택하고 vCard(.vcf)로 내보낸 파일을 업로드해 주세요. Mac을 쓰신다면 Mac의 연락처
                  앱에서도 vCard로 내보낼 수 있습니다.
                </p>
              </div>
            </details>

            <details className={accordionClass}>
              <summary className={summaryClass}>Galaxy/Samsung 연락처 내보내기</summary>
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
              <summary className={summaryClass}>Google 연락처 내보내기</summary>
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

        <div className="flex shrink-0 flex-col gap-2 border-t border-[#E5E7EB] bg-white px-4 py-3 pb-[max(12px,calc(env(safe-area-inset-bottom,0px)+10px))] sm:flex-row sm:flex-wrap sm:justify-end sm:px-6 sm:py-4">
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation hover:bg-[#F8FAFC] sm:min-w-[6.5rem]"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-xl bg-[#0F172A] px-5 py-2.5 text-[14px] font-semibold text-[#FFFFFF] touch-manipulation hover:bg-[#1E293B] sm:min-w-[10rem]"
            onClick={() => {
              onClose();
              onProceedToImport?.();
            }}
          >
            가져오기 화면 열기
          </button>
        </div>
      </div>
    </div>
  );
}
