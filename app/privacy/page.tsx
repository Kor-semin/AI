"use client";

import Link from "next/link";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-[100dvh] bg-slate-50 px-4 py-10 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold text-sky-700">
          <Link href="/" className="hover:underline">
            {t("privacy.backHome")}
          </Link>
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("privacy.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{t("privacy.intro")}</p>

        <article className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. 수집 목적</h2>
            <p className="mt-3">
              Sensora는 자동차 영업사원의 고객관리 업무를 돕기 위해 필요한 최소한의 정보를 수집합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. 수집 항목</h2>
            <p className="mt-3 font-medium text-slate-800">베타 신청·계정 등록 시</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>이름</li>
              <li>이메일</li>
              <li>연락처</li>
              <li>소속 브랜드·전시장</li>
              <li>현재 고객관리 방식</li>
              <li>서비스 이용 목적 또는 사용 이유</li>
              <li>서비스 이용 기록</li>
            </ul>
            <p className="mt-4 font-medium text-slate-800">사용자가 직접 입력하거나 선택 저장한 경우</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>고객명</li>
              <li>고객 연락처</li>
              <li>관심 차량</li>
              <li>상담 메모</li>
              <li>다음 연락일</li>
              <li>출고 안내 관련 메모</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. 고객정보 저장 원칙</h2>
            <p className="mt-3 whitespace-pre-line">
              {`Sensora는 영업사원의 고객 DB를 수집·판매·공유하기 위한 서비스가 아닙니다.
고객정보는 사용자가 직접 입력하거나 선택한 경우에만 저장됩니다.
Sensora는 사용자의 고객 DB를 자동으로 수집하지 않습니다.`}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. 연락처 업로드 원칙</h2>
            <p className="mt-3 whitespace-pre-line">
              {`Sensora는 사용자의 연락처를 자동으로 가져오지 않습니다.
사용자가 직접 선택한 파일만 업로드할 수 있습니다.
업로드한 연락처는 바로 저장되지 않으며, 미리보기 화면에서 사용자가 선택하고 확인한 항목만 고객관리 목록에 저장됩니다.
선택하지 않은 연락처는 고객관리 목록에 저장되지 않습니다.`}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. AI 기능 원칙</h2>
            <p className="mt-3 whitespace-pre-line">
              {`AI는 상담 정리와 초안 작성을 돕는 기능이며, 최종 확인과 저장은 사용자가 직접 합니다.
AI가 고객정보를 임의로 수정하거나 자동 저장하지 않습니다.`}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">6. 제3자 제공</h2>
            <p className="mt-3">Sensora는 사용자의 고객정보를 판매하거나 광고 목적으로 공유하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">7. 보관 및 삭제</h2>
            <p className="mt-3">
              베타 운영 단계에서 삭제를 요청하시면, 요청 내용을 확인한 뒤 합리적인 범위에서 처리하는 것을 목표로 합니다. 정확한
              절차·기한은 서비스 성숙도에 맞추어 정리될 수 있습니다.
            </p>
            <p className="mt-2 text-xs text-slate-500">베타 운영용 이메일은 추후 안내 예정입니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">8. 문의</h2>
            <p className="mt-3">베타 운영용 이메일은 추후 안내 예정입니다.</p>
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              TODO: 운영 이메일 확정 후 교체
            </p>
          </section>
        </article>

        <p className="mt-12 text-center text-xs text-slate-500">
          <Link href="/terms" className="font-semibold text-sky-700 hover:underline">
            {t("terms.title")}
          </Link>
          {" · "}
          <Link href="/" className="hover:underline">
            {t("privacy.backHome")}
          </Link>
        </p>
      </div>
    </main>
  );
}
