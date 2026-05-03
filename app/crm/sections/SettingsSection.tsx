"use client";

import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { TextSizeControl } from "@/app/components/settings/TextSizeControl";

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
  "sensora-premium-panel sensora-premium-panel-interactive settings-section-panel rounded-[22px] border-white/[0.11] px-6 py-6 shadow-[0_22px_52px_-28px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-7 motion-reduce:transform-none";
const SECTION_MUTED =
  "sensora-premium-panel rounded-[22px] border border-white/[0.09] bg-gradient-to-b from-slate-950/55 to-[rgba(7,17,31,0.92)] px-6 py-6 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-7";

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

  const inputCls =
    "min-h-[44px] w-full max-w-md rounded-xl border border-white/[0.12] bg-slate-950/55 px-4 py-2.5 text-[15px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/45";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-10">
      <div className="border-b border-white/[0.1] pb-6">
        <h2 className="text-[24px] font-bold tracking-tight text-slate-50">설정</h2>
        <p className="mt-3 text-[15px] leading-[1.7] text-slate-400">
          기본값, 개인정보, 저장 방식, 주소록 가져오기를 한곳에서 정리했습니다.
        </p>
      </div>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">내 정보</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">문자 템플릿 등에 사용할 이름입니다.</p>
        <p className="mt-3 text-[12px] leading-[1.65] text-slate-500">
          입력 즉시 이 브라우저(기기)에 저장되며, 별도의 저장 버튼은 필요 없습니다.
        </p>
        <label className="mt-4 grid gap-2">
          <span className="text-[12px] font-semibold text-slate-300">내 이름</span>
          <input value={sellerNickname} onChange={(e) => onNicknameChange(e.target.value)} placeholder="예: 김실장" className={inputCls} />
        </label>
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">언어</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">
          기본값은 <span className="font-medium text-slate-200">한국어</span>입니다. 베타 서비스는 한국어를 기본으로
          제공합니다. 다른 언어는 일부 문구가 영어로 남을 수 있습니다.
        </p>
        <div className="mt-4">
          <LanguageSelect />
        </div>
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">{t("settings.display.title")}</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">{t("settings.textSize.description")}</p>
        <p className="mt-4 text-[13px] font-semibold text-slate-200">{t("settings.textSize.title")}</p>
        <TextSizeControl />
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">문자 톤</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">
          고객에게 보내는 안내 문구의 기본 톤입니다. 현재 카드에는 정중한 스타일이 적용돼 있습니다.
        </p>
        <p className="mt-3 rounded-xl border border-white/[0.1] bg-[#020817]/45 px-4 py-3 text-[14px] font-medium text-slate-100">
          {workspaceSalesStyleLabel}
        </p>
        <p className="mt-3 text-[12px] leading-[1.65] text-slate-500">
          AI 비서 화면에서 고객별로 톤을 바꿀 수 있습니다. 저장은 항상 확인 후 직접 결정합니다.
        </p>
      </section>

      <section className={SECTION_MUTED}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">데이터 저장</h3>
        <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.7] text-slate-400">{storageModeLabel}</p>
      </section>

      <section className={SECTION_MUTED}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">연락처 가져오기 · 개인정보</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] font-medium leading-[1.7] text-slate-300">
          <li>Sensora는 사용자가 직접 선택한 연락처만 가져옵니다.</li>
          <li>가져온 정보는 저장 전 사용자가 확인할 수 있습니다.</li>
          <li>AI는 고객 정보를 임의로 수정하거나 덮어쓰지 않습니다.</li>
        </ul>
        <p className="mt-3 text-[13px] leading-[1.65] text-slate-400">
          붙여넣기·파일 업로드는 직접 넣은 내용만 반영합니다. 이름이 비슷해도 기존 고객 카드는 미리보기에서 확인한 뒤에만
          병합·추가됩니다.
        </p>
        {onOpenContactImportGuide && onOpenAddressBookImport ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <button
              type="button"
              className="sensora-premium-primary-workspace min-h-[46px] w-full shrink-0 rounded-xl px-6 py-2.5 text-[14px] font-bold touch-manipulation sm:w-auto"
              onClick={() => onOpenContactImportGuide()}
            >
              주소록 가져오기 열기
            </button>
            <p className="text-[13px] leading-[1.65] text-slate-400">
              먼저 「연락처 파일 준비 방법」 안내를 엽니다. 파일을 준비한 뒤 안내창에서 「가져오기 화면 열기」를 누르면 주소록
              가져오기로 이동합니다.
            </p>
          </div>
        ) : null}
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">표지 다시 보기</h3>
        <p className="mt-3 text-[14px] leading-[1.65] text-slate-400">
          처음 안내 표지를 다시 엽니다(PWA 또는 별도 안내 흐름). 웹 소개는 오른쪽 버튼으로 열 수 있습니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="sensora-dark-ghost-btn min-h-[44px] rounded-xl px-5 py-2.5 text-[14px] font-semibold touch-manipulation" onClick={onShowCover}>
            표지 다시 보기
          </button>
          {onOpenLanding ? (
            <button type="button" className="sensora-dark-ghost-btn min-h-[44px] rounded-xl px-5 py-2.5 text-[14px] font-semibold touch-manipulation" onClick={onOpenLanding}>
              웹 소개 페이지
            </button>
          ) : null}
        </div>
      </section>

      <section className={SECTION_CARD}>
        <h3 className="text-[16px] font-bold tracking-tight text-slate-50">앱 정보</h3>
        <ul className="mt-4 space-y-2.5 text-[14px] leading-[1.65] text-slate-400">
          <li className="font-bold text-slate-100">{t("product.name")}</li>
          <li>베타 버전 v0.3</li>
          <li>차량 영업 현장용 상담·고객·사후관리 정리 앱입니다.</li>
        </ul>
      </section>
    </div>
  );
}
