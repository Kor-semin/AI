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
  /** 설정에서 주소록 가져오기 패널을 바로 엽니다(고객관리 화면으로 전환). */
  onOpenAddressBookImport?: () => void;
};

const SECTION_CARD = "rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm";
const SECTION_MUTED = "rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC] p-5";

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

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <div className="border-b border-[#E5E7EB] pb-5">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#111827]">설정</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
          기본값, 개인정보·저장 방식, 주소록 가져오기 안내입니다.
        </p>
      </div>

      <section className={SECTION_CARD}>
        <h3 className="text-[15px] font-semibold text-[#111827]">내 정보</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
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
        <h3 className="text-[15px] font-semibold text-[#111827]">언어</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
          기본값은 <span className="font-medium text-[#475569]">한국어</span>입니다. 베타 서비스는 한국어를 기본으로
          제공합니다. 다른 언어는 일부 문구가 영어로 남을 수 있습니다.
        </p>
        <div className="mt-4">
          <LanguageSelect />
        </div>
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[15px] font-semibold text-[#111827]">문자 톤</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
          고객에게 보내는 안내 문구의 기본 톤입니다. (정중한 스타일)
        </p>
        <p className="mt-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3 text-[14px] font-medium text-[#374151]">
          {workspaceSalesStyleLabel}
        </p>
        <p className="mt-3 text-[12px] leading-relaxed text-[#94A3B8]">
          AI 비서 화면에서 고객별로 톤을 바꿀 수 있습니다. 저장은 항상 확인 후 직접 결정합니다.
        </p>
      </section>

      <section className={SECTION_MUTED}>
        <h3 className="text-[15px] font-semibold text-[#111827]">데이터 저장</h3>
        <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-[#4B5563]">{storageModeLabel}</p>
      </section>

      <section className={SECTION_MUTED}>
        <h3 className="text-[15px] font-semibold text-[#111827]">연락처 가져오기·개인정보</h3>
        <p className="mt-3 text-[13px] leading-relaxed text-[#4B5563]">
          선택한 연락처, 업로드한 파일, 붙여넣은 내용만 가져옵니다. 가져오기 전 미리보기에서 확인할 수 있습니다. 기존
          고객 정보는 자동으로 덮어쓰지 않습니다.
        </p>
        {onOpenAddressBookImport ? (
          <button
            type="button"
            className="mt-4 min-h-[44px] rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-5 py-2.5 text-[14px] font-semibold text-[#0F172A] shadow-sm touch-manipulation hover:bg-[#F8FAFC]"
            onClick={onOpenAddressBookImport}
          >
            주소록 가져오기 열기
          </button>
        ) : null}
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[15px] font-semibold text-[#111827]">표지 다시 보기</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
          처음 안내 표지를 다시 엽니다. 서비스 소개는 아래 버튼에서 열 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
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
        <h3 className="text-[15px] font-semibold text-[#111827]">앱 정보</h3>
        <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-[#4B5563]">
          <li className="font-semibold text-[#111827]">{t("product.name")}</li>
          <li>베타 버전 v0.3</li>
          <li>자동차 영업사원을 위한 AI 고객관리 앱</li>
        </ul>
      </section>
    </div>
  );
}
