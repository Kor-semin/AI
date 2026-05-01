"use client";

import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";

export type SettingsSectionProps = {
  sellerNickname: string;
  onNicknameChange: (v: string) => void;
  workspaceSalesStyleLabel: string;
  storageModeLabel: string;
  onShowCover: () => void;
};

export function SettingsSection({
  sellerNickname,
  onNicknameChange,
  workspaceSalesStyleLabel,
  storageModeLabel,
  onShowCover,
}: SettingsSectionProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-[20px] font-semibold text-[#111827]">설정</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">워크스페이스 기본값과 안내입니다. 앱 버전 v0.3</p>
      </div>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-[14px] font-semibold text-[#374151]">내 이름 · 템플릿 치환</h3>
        <input
          value={sellerNickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder="예: 김실장"
          className="mt-3 min-h-[44px] w-full max-w-md rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[15px] outline-none focus:border-[#94A3B8]"
        />
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-[14px] font-semibold text-[#374151]">언어</h3>
        <div className="mt-3">
          <LanguageSelect />
        </div>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-[14px] font-semibold text-[#374151]">문자 톤(워크스페이스 표시)</h3>
        <p className="mt-2 text-[13px] text-[#64748B]">{workspaceSalesStyleLabel}</p>
        <p className="mt-3 text-[12px] leading-relaxed text-[#94A3B8]">
          AI 비서 화면에서 톤을 바꿀 수 있습니다.
        </p>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC] p-5">
        <h3 className="text-[14px] font-semibold text-[#374151]">데이터 저장</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">{storageModeLabel}</p>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC] p-5">
        <h3 className="text-[14px] font-semibold text-[#374151]">연락처 가져오기 · 개인정보</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
          선택한 연락처·파일·붙여넣기만 처리하며 미리보기 후 저장합니다. 기존 고객은 자동 덮어쓰기하지 않습니다.
        </p>
      </section>

      <button
        type="button"
        className="min-h-[44px] w-fit rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation"
        onClick={onShowCover}
      >
        표지 다시 보기
      </button>
    </div>
  );
}
