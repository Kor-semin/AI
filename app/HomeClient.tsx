"use client";

import Link from "next/link";
import { useState } from "react";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { NotebookCover } from "@/app/components/NotebookCover";
import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { ConciergeSidebar } from "@/app/components/concierge/ConciergeSidebar";
import {
  AIDemoSection,
  CRMDemoSection,
  HeroSection,
} from "@/app/components/concierge/LandingSections";
import { CRMApp } from "@/app/crm/CRMApp";
import { useAuth } from "@/app/crm/useAuth";
import { sellerCanUseApp, useSellerProfile } from "@/app/crm/useSellerProfile";
import { isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";

export function HomeClient({ initialView }: { initialView: "landing" | "app" }) {
  const { auth, authError, signOut } = useAuth();
  const firebaseReady = isFirebaseConfigured();
  const googleAuthEnabled = isGoogleAuthEnabled();
  const seller = useSellerProfile(auth.status === "signed-in" ? auth.uid : null);
  const [view, setView] = useState<"landing" | "app">(initialView);
  const { t } = useLanguage();

  const sellerSignedIn = firebaseReady && auth.status === "signed-in";

  /** Google 등 로그인 후 명함 검토까지 본 문서(CRM 동기화) 접근 제한(SMS 과금 회피 경로 포함) */
  const sellerApproved = sellerCanUseApp(seller.profile);
  const sellerLoading = sellerSignedIn && seller.loading;
  const sellerGateBlock = sellerSignedIn && !seller.loading && !seller.error && !sellerApproved;

  const crmUid = auth.status === "signed-in" && !(sellerLoading || sellerGateBlock) ? auth.uid : null;

  const showNotebookCover = view === "app";

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden text-[color:var(--foreground)]">
      <InspirationalBackdrop />
      {showNotebookCover ? <NotebookCover /> : null}

      <header className="sticky top-0 z-20 border-b border-[color:var(--edge)] bg-[color:var(--background)]/72 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            <div className="text-sm font-semibold tracking-tight">{t("product.name")}</div>
            <div className="hidden text-xs text-[color:var(--ink-2)] sm:block">{t("brand.slogan")} · Sales Concierge AI</div>
            <span className="crm-free-badge hidden sm:inline-flex text-[12px] font-extrabold">무료 사용</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelect />
            <button
              type="button"
              className="crm-ghost-btn inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-lg px-2.5 py-2 text-[11px] font-medium touch-manipulation sm:min-h-0 sm:py-1.5"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("crm-show-notebook-cover"));
              }}
            >
              {t("header.cover")}
            </button>
            <button
              type="button"
              className="crm-ghost-btn inline-flex min-h-[42px] max-w-[6.75rem] items-center justify-center truncate rounded-lg px-2.5 py-2 text-[11px] font-medium touch-manipulation sm:max-w-none sm:min-h-0 sm:py-1.5"
              title={view === "app" ? t("header.landing") : t("header.workspace")}
              onClick={() => setView((v) => (v === "app" ? "landing" : "app"))}
            >
              {view === "app" ? t("header.landing") : t("header.workspace")}
            </button>
            {auth.status === "loading" ? (
              <div className="text-xs text-[color:var(--ink-2)]">{t("auth.checkingLogin")}</div>
            ) : auth.status === "signed-in" ? (
              <>
                <div className="hidden text-xs text-[color:var(--ink-2)] sm:block">{auth.name ?? auth.email ?? auth.uid}</div>
                <button
                  className="crm-ghost-btn inline-flex min-h-[42px] items-center rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation"
                  onClick={signOut}
                >
                  {t("auth.signOut")}
                </button>
              </>
            ) : (
              <>
                {authError ? (
                  <div className="max-w-[520px] text-xs font-medium text-[#B91C1C]">로그인 오류: {authError}</div>
                ) : null}
                <Link
                  href="/register"
                  className={[
                    "crm-ink-btn inline-flex min-h-[42px] items-center rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation",
                    firebaseReady ? "" : "opacity-55",
                  ].join(" ")}
                >
                  {t("auth.salesRegistration")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {view === "landing" ? (
          <>
            <HeroSection />
            <AIDemoSection />
            <CRMDemoSection />
          </>
        ) : null}

        {view === "app" ? (
          <div
            id="app"
            className="min-h-[calc(100dvh-3.25rem)] scroll-mt-24 bg-[#F4F6F8] px-4 pb-12 pt-6 sm:px-6 lg:min-h-[calc(100dvh-3.5rem)]"
          >
            <div className="mx-auto flex w-full max-w-[1520px] gap-6 lg:gap-8">
              <ConciergeSidebar />
              <div className="relative min-h-[60vh] min-w-0 flex-1 rounded-2xl">
                {sellerLoading ? (
                  <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-base text-[#6B7280]">
                    영업 계정 상태를 확인하는 중…
                  </div>
                ) : null}

                {!sellerLoading && seller.error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm leading-relaxed text-red-900">
                    <p className="font-semibold">판매자 프로필 불러오기 실패</p>
                    <p className="mt-1">{seller.error}</p>
                    <p className="mt-3 text-xs text-red-800/90">
                      Firestore{" "}
                      <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[11px]">sellerProfiles/{`{uid}`}</code>
                      에 대한 읽기 권한이 있는지 확인해 주세요.
                    </p>
                  </div>
                ) : null}

                {!sellerLoading && sellerGateBlock ? (
                  <div className="flex flex-col gap-8 rounded-2xl border border-[#E5E7EB] bg-white px-8 py-16 text-center sm:px-12">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">영업 전용</p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">아직 확인(승인) 전입니다</h2>
                      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6B7280]">
                        {seller.profile?.approvalStatus === "rejected"
                          ? seller.profile.rejectReason?.trim()
                            ? `사유: ${seller.profile.rejectReason}`
                            : "등록 정보를 다시 확인한 뒤 다시 접수할 수 있습니다."
                          : seller.profile?.approvalStatus === "pending"
                            ? "제출해 주신 명함을 확인 중입니다. 승인이 완료되면 자동으로 열립니다."
                            : "Google 로그인 후 명함 이미지를 제출하면 승인 요청이 접수됩니다."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/register"
                        className="inline-flex items-center rounded-xl bg-[#111827] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1F2937]"
                      >
                        등록 계속하기
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
                        onClick={() => signOut()}
                      >
                        다른 Google 계정으로
                      </button>
                    </div>
                    <Link href="/toc" className="text-sm font-medium text-[#6B7280] underline underline-offset-4 hover:text-[#111827]">
                      기능 소개(목차)만 보기
                    </Link>
                  </div>
                ) : null}

                {!sellerLoading && !sellerGateBlock ? (
                  <CRMApp
                    uid={crmUid}
                    sellerDisplayName={
                      auth.status === "signed-in" ? auth.name?.trim() || auth.email?.split("@")[0] || "" : ""
                    }
                  />
                ) : null}

                {!firebaseReady || !googleAuthEnabled ? (
                  <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#FAFAFB] px-5 py-4 text-xs leading-relaxed text-[#6B7280]">
                    현재 로그인/연동 기능이 완전히 활성화되지 않아도, 로컬 저장 기반으로 고객 정리를 먼저 시작할 수 있습니다.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

