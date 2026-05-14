"use client";

import Link from "next/link";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-[100dvh] bg-slate-50 px-4 py-10 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold text-sky-700">
          <Link href="/" className="hover:underline">
            {t("terms.backHome")}
          </Link>
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t("terms.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{t("terms.intro")}</p>

        <article className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. 서비스 목적</h2>
            <p className="mt-3">
              Sensora Auto CRM은 자동차 영업사원의 고객관리, 상담 메모, 사후관리, 문자 초안, 출고 안내를 돕는 AI 고객관리
              워크스페이스입니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. 사용자 책임</h2>
            <p className="mt-3">
              사용자는 자신이 입력하거나 업로드하는 정보에 대해 필요한 권한과 책임을 가지고 있어야 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. AI 기능 한계</h2>
            <p className="mt-3">
              AI는 검토용 초안과 정리 결과를 제안합니다. 최종 판단, 수정, 저장, 고객 응대는 사용자가 직접 해야 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. 금지 사항</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>타인의 개인정보를 권한 없이 입력하거나 업로드하는 행위</li>
              <li>고객정보를 부정한 목적으로 사용하는 행위</li>
              <li>서비스의 보안이나 운영을 방해하는 행위</li>
              <li>AI 결과를 검토 없이 확정 사실처럼 사용하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. 베타 서비스 특성</h2>
            <p className="mt-3">현재 서비스는 베타 운영 단계이며, 기능이 변경되거나 제한될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">6. 문의</h2>
            <p className="mt-3">베타 운영용 이메일은 추후 안내 예정입니다.</p>
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              TODO: 운영 이메일 확정 후 교체
            </p>
          </section>
        </article>

        <p className="mt-12 text-center text-xs text-slate-500">
          <Link href="/privacy" className="font-semibold text-sky-700 hover:underline">
            {t("privacy.title")}
          </Link>
          {" · "}
          <Link href="/" className="hover:underline">
            {t("terms.backHome")}
          </Link>
        </p>
      </div>
    </main>
  );
}
