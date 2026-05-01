"use client";

import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

export type SettingsSectionProps = {
  sellerNickname: string;
  onNicknameChange: (v: string) => void;
  workspaceSalesStyleLabel: string;
  storageModeLabel: string;
  onShowCover: () => void;
  onOpenLanding?: () => void;
  /** 연락처 파일 준비 방법(최신 안내 모달) — CRMApp의 ContactImportFileGuideModal */
  onOpenContactImportGuide?: () => void;
  /** 주소록 가져오기 패널을 열고 고객 화면으로 전환 */
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
  onOpenContactImportGuide,
  onOpenAddressBookImport,
}: SettingsSectionProps) {
  const { t } = useLanguage();

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
        <p className="mt-3 text-[12px] leading-[1.65] text-[#94A3B8]">입력 즉시 이 브라우저(기기)에 저장되며, 별도의 저장 버튼은 필요 없습니다.</p>
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
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] font-medium leading-[1.7] text-[#374151]">
          <li>Sensora는 사용자가 직접 선택한 연락처만 가져옵니다.</li>
          <li>가져온 정보는 저장 전 사용자가 확인할 수 있습니다.</li>
          <li>AI는 고객 정보를 임의로 수정하거나 덮어쓰지 않습니다.</li>
        </ul>
        <p className="mt-3 text-[13px] leading-[1.65] text-[#64748B]">
          붙여넣기·파일 업로드는 직접 넣은 내용만 반영합니다. 이름이 비슷해도 기존 고객 카드는 미리보기에서 확인한 뒤에만
          병합·추가됩니다.
        </p>
        {onOpenContactImportGuide && onOpenAddressBookImport ?
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <button
              type="button"
              className="min-h-[46px] w-full shrink-0 rounded-xl border-2 border-[#0F172A] bg-[#0F172A] px-6 py-2.5 text-[14px] font-bold text-[#FFFFFF] shadow-sm touch-manipulation hover:bg-[#1E293B] sm:w-auto"
              onClick={() => onOpenContactImportGuide()}
            >
              주소록 가져오기 열기
            </button>
            <p className="text-[13px] leading-[1.65] text-[#64748B]">
              먼저 「연락처 파일 준비 방법」 안내를 엽니다. 파일을 준비한 뒤 안내창에서 「가져오기 화면 열기」를 누르면
              주소록 가져오기로 이동합니다.
            </p>
          </div>
        : null}
      </section>

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
