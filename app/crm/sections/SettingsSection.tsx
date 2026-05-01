"use client";

import { useEffect, useRef, useState } from "react";

import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

export type SettingsSectionProps = {
  sellerNickname: string;
  onNicknameChange: (v: string) => void;
  workspaceSalesStyleLabel: string;
  storageModeLabel: string;
  onShowCover: () => void;
  onOpenLanding?: () => void;
  /** 설정에서 주소록 가져오기 패널을 바로 엽니다(고객관리 화면으로 전환). */
  onOpenAddressBookImport?: () => void;
};

const SECTION_CARD =
  "settings-section-panel rounded-2xl border border-[#E5E7EB] bg-white px-6 py-6 shadow-sm sm:px-7";
const SECTION_MUTED =
  "settings-section-panel rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC] px-6 py-6 sm:px-7";

export function SettingsSection({
  sellerNickname,
  onNicknameChange,
  workspaceSalesStyleLabel,
  storageModeLabel,
  onShowCover,
  onOpenLanding,
  onOpenAddressBookImport,
}: SettingsSectionProps) {
  const { t } = useLanguage();
  const importGuideDialogRef = useRef<HTMLDialogElement>(null);
  const [importGuideOpen, setImportGuideOpen] = useState(false);

  useEffect(() => {
    const el = importGuideDialogRef.current;
    if (!el) return;
    if (importGuideOpen) {
      try {
        el.showModal();
      } catch {
        /* ignore */
      }
    } else try {
      el.close();
    } catch {
      /* ignore */
    }
  }, [importGuideOpen]);

  const closeImportGuide = () => setImportGuideOpen(false);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-10">
      <div className="border-b border-[#E5E7EB] pb-6">
        <h2 className="text-[24px] font-bold tracking-tight text-[#111827]">설정</h2>
        <p className="mt-3 text-[15px] leading-[1.7] text-[#6B7280]">
          기본값, 개인정보, 저장 방식, 주소록 가져오기를 한곳에서 정리했습니다.
        </p>
      </div>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">내 정보</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-[#64748B]">
          문자 템플릿 등에 사용할 이름입니다.
        </p>
        <label className="mt-4 grid gap-2">
          <span className="text-[12px] font-semibold text-[#374151]">내 이름</span>
          <input
            value={sellerNickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="예: 김실장"
            className="min-h-[44px] w-full max-w-md rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[15px] text-[#111827] outline-none focus:border-[#94A3B8]"
          />
        </label>
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">언어</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-[#64748B]">
          기본값은 <span className="font-medium text-[#475569]">한국어</span>입니다. 베타 서비스는 한국어를 기본으로
          제공합니다. 다른 언어는 일부 문구가 영어로 남을 수 있습니다.
        </p>
        <div className="mt-4">
          <LanguageSelect />
        </div>
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">문자 톤</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-[#64748B]">
          고객에게 보내는 안내 문구의 기본 톤입니다. 현재 카드에는 정중한 스타일이 적용돼 있습니다.
        </p>
        <p className="mt-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3 text-[14px] font-medium text-[#374151]">
          {workspaceSalesStyleLabel}
        </p>
        <p className="mt-3 text-[12px] leading-[1.65] text-[#94A3B8]">
          AI 비서 화면에서 고객별로 톤을 바꿀 수 있습니다. 저장은 항상 확인 후 직접 결정합니다.
        </p>
      </section>

      <section className={SECTION_MUTED}>
        <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">데이터 저장</h3>
        <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.7] text-[#4B5563]">{storageModeLabel}</p>
      </section>

      <section className={SECTION_MUTED}>
        <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">연락처 가져오기 · 개인정보</h3>
        <p className="mt-3 text-[14px] leading-[1.7] text-[#4B5563]">
          선택한 연락처만, 업로드한 파일·붙여넣은 내용만 반영합니다. 저장 전에는 항상 미리보기로 확인합니다. 같은 이름이 있어도
          기존 고객 정보를 자동으로 덮어쓰지 않습니다.
        </p>
        {onOpenAddressBookImport ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <button
              type="button"
              className="min-h-[46px] w-full shrink-0 rounded-xl border-2 border-[#0F172A] bg-[#0F172A] px-6 py-2.5 text-[14px] font-bold text-[#FFFFFF] shadow-sm touch-manipulation hover:bg-[#1E293B] sm:w-auto"
              onClick={() => setImportGuideOpen(true)}
            >
              주소록 가져오기 열기
            </button>
            <p className="text-[13px] leading-[1.65] text-[#64748B]">
              버튼을 누르면 삼성폰 · 아이폰 · 구글 연락처 내보내기 방법 안내가 먼저 열립니다. 파일을 준비한 뒤 「가져오기
              화면 열기」로 이동하세요.
            </p>
          </div>
        ) : null}
      </section>

      <dialog
        ref={importGuideDialogRef}
        className="crm-import-guide-dialog w-[calc(100%-1.75rem)] max-w-[min(100%,540px)] rounded-2xl border border-[#E2E8F0] bg-white p-0 text-[#0F172A] shadow-[0_24px_64px_rgba(15,23,42,0.18)] backdrop:bg-[rgba(15,23,42,0.45)] [&::backdrop]:bg-[rgba(15,23,42,0.45)]"
        onClose={() => setImportGuideOpen(false)}
      >
        <div className="max-h-[min(88vh,720px)] overflow-y-auto p-6 sm:p-7">
          <h4 className="text-[17px] font-semibold tracking-tight text-[#0F172A]">연락처 가져오기 안내</h4>
          <p className="mt-3 text-[13px] leading-relaxed text-[#475569]">
            휴대폰/OS마다 메뉴 이름이 조금 다를 수 있습니다. 내보내기로 만든 파일을 Sensora에서 업로드하고, 미리보기에서
            확인한 뒤 저장하세요.
          </p>

          <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] leading-relaxed text-[#334155]">
            <p className="font-semibold text-[#0F172A]">공통</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>지원 형식: <strong className="font-semibold text-[#0F172A]">.vcf</strong>, <strong className="font-semibold text-[#0F172A]">.csv</strong></li>
              <li>기존 고객 정보는 자동으로 덮어쓰지 않습니다.</li>
              <li>저장 전 항상 미리보기로 확인합니다.</li>
              <li>파일에 메모나 추가 정보가 포함되어 있으면, 형식과 내용에 따라 가능한 범위에서 함께 반영합니다.</li>
            </ul>
          </div>

          <div className="mt-5 space-y-3">
            <details className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 open:pb-4">
              <summary className="cursor-pointer select-none text-[14px] font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
                삼성폰 연락처 내보내기
              </summary>
              <ol className="mt-3 space-y-2 border-t border-[#F1F5F9] pt-3 text-[13px] leading-relaxed text-[#475569] [counter-reset:step]">
                {[
                  "연락처 앱을 실행합니다.",
                  "⋯(더보기) 또는 메뉴에서 연락처 관리, 가져오기·내보내기 등 비슷한 항목을 찾습니다.",
                  "연락처 내보내기(또는 vCard 저장)를 선택합니다.",
                  "미리 선택한 이름들만 포함할 수 있습니다. 이름을 고른 뒤 내보내도 됩니다.",
                  ".vcf 파일을 휴대폰 또는 PC로 저장합니다.",
                  "Sensora의 주소록 가져오기에서 해당 파일을 업로드합니다.",
                  "미리보기에서 내용을 확인한 뒤 저장합니다.",
                ].map((line, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-px shrink-0 tabular-nums font-semibold text-[#64748B]">{idx + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </details>

            <details className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 open:pb-4">
              <summary className="cursor-pointer select-none text-[14px] font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
                아이폰(iCloud)에서 vCard 만들기
              </summary>
              <ol className="mt-3 space-y-2 border-t border-[#F1F5F9] pt-3 text-[13px] leading-relaxed text-[#475569]">
                {[
                  <>PC 브라우저에서 <span className="font-medium text-[#0F172A]">icloud.com</span>에 로그인합니다.</>,
                  "연락처를 연 뒤, 가져올 연락처만 선택합니다(여러 명 선택 가능).",
                  "내보내기 또는 vCard(.vcf)로 저장하는 기능을 사용합니다.",
                  "다운로드한 .vcf 파일을 Sensora 주소록 가져오기에 업로드합니다.",
                  "미리보기를 확인한 뒤 저장합니다.",
                ].map((line, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-px shrink-0 tabular-nums font-semibold text-[#64748B]">{idx + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </details>

            <details className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 open:pb-4">
              <summary className="cursor-pointer select-none text-[14px] font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
                구글 연락처 내보내기
              </summary>
              <ol className="mt-3 space-y-2 border-t border-[#F1F5F9] pt-3 text-[13px] leading-relaxed text-[#475569]">
                {[
                  <>PC 브라우저에서 <span className="font-medium text-[#0F172A]">contacts.google.com</span>에 접속합니다.</>,
                  "왼쪽 또는 상단 메뉴에서 내보내기를 찾습니다(화면 레이아웃은 계정 버전마다 조금 다를 수 있습니다).",
                  "vCard(.vcf) 또는 CSV 형식으로 내보냅니다(일부 선택은 버전별로 이름이 다를 수 있습니다).",
                  "파일을 다운로드한 뒤 Sensora 주소록 가져오기에 업로드합니다.",
                  "미리보기를 확인한 뒤 저장합니다.",
                ].map((line, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-px shrink-0 tabular-nums font-semibold text-[#64748B]">{idx + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </details>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-[#E5E7EB] pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              className="min-h-[44px] rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation hover:bg-[#F8FAFC] sm:min-w-[6.5rem]"
              onClick={closeImportGuide}
            >
              닫기
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-xl bg-[#0F172A] px-5 py-2.5 text-[14px] font-semibold text-[#FFFFFF] touch-manipulation hover:bg-[#1E293B] sm:min-w-[10rem]"
              onClick={() => {
                closeImportGuide();
                onOpenAddressBookImport?.();
              }}
            >
              가져오기 화면 열기
            </button>
          </div>
        </div>
      </dialog>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">표지 다시 보기</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-[#64748B]">
          처음 안내 표지를 다시 엽니다(PWA 또는 별도 안내 흐름). 웹 소개는 오른쪽 버튼으로 열 수 있습니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation hover:bg-[#F9FAFB]"
            onClick={onShowCover}
          >
            표지 다시 보기
          </button>
          {onOpenLanding ? (
            <button
              type="button"
              className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-2.5 text-[14px] font-semibold text-[#475569] touch-manipulation hover:bg-[#F9FAFB]"
              onClick={onOpenLanding}
            >
              웹 소개 페이지
            </button>
          ) : null}
        </div>
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">앱 정보</h3>
        <ul className="mt-4 space-y-2.5 text-[14px] leading-[1.65] text-[#4B5563]">
          <li className="font-bold text-[#111827]">{t("product.name")}</li>
          <li>베타 버전 v0.3</li>
          <li>차량 영업 현장용 상담·고객·사후관리 정리 앱입니다.</li>
        </ul>
      </section>
    </div>
  );
}
