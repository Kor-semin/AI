"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { NotebookCover } from "@/app/components/NotebookCover";
import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { ConciergeSidebar } from "@/app/components/concierge/ConciergeSidebar";
import {
  crmSectionToHash,
  hashToCrmSection,
  type CrmSection,
} from "@/app/crm/crmSectionTypes";
import { LandingShowroom } from "@/app/components/concierge/LandingSections";
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
  const [crmSection, setCrmSection] = useState<CrmSection>("dashboard");
  const router = useRouter();
  const { t } = useLanguage();

  const navigateCrmSection = useCallback(
    (s: CrmSection) => {
      setCrmSection(s);
      if (typeof window === "undefined") return;
      try {
        const qs = new URLSearchParams(window.location.search);
        qs.set("view", "app");
        const h = crmSectionToHash(s);
        const next = `${window.location.pathname}?${qs.toString()}#${h}`;
        window.history.replaceState(null, "", next);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  /** SSR → CSR navigation: searchParams 변경 시에는 state가 따라가야 함(useState 초기값은 1회만). */
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  /** 앱 진입 시·해시 변경 시 섹션 동기화 */
  useEffect(() => {
    if (view !== "app" || typeof window === "undefined") return;
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#/, "").trim();
      const mapped = raw ? hashToCrmSection(raw) : null;
      if (mapped) setCrmSection(mapped);
      else if (!raw) setCrmSection("dashboard");
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [view]);

  /** 브라우저 뒤로/앞으로 시 URL만 바뀌는 경우까지 view 동기화 */
  useEffect(() => {
    const onPop = () => {
      try {
        const qs = new URLSearchParams(window.location.search);
        setView(qs.get("view") === "app" ? "app" : "landing");
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openAppWorkspace = useCallback(() => {
    setView("app");
    setCrmSection("ai");
    void router.push("/?view=app#crm-ai-assistant");
  }, [router]);

  useEffect(() => {
    if (view !== "app") return undefined;
    const prefersReduce =
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const scrollToHash = () => {
      const rawHash =
        typeof window !== "undefined" && window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
      const id = rawHash.trim() ? rawHash.trim() : "crm-section-dashboard";
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({
          behavior: prefersReduce ? "auto" : "smooth",
          block: "start",
        });
      }
    };
    const timers = [
      window.setTimeout(() => {
        if (!cancelled) scrollToHash();
      }, 90),
      window.setTimeout(() => {
        if (!cancelled) scrollToHash();
      }, 320),
    ];
    return () => {
      cancelled = true;
      for (const tmr of timers) window.clearTimeout(tmr);
    };
  }, [view, crmSection]);

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

      <header
        className={[
          "sticky top-0 z-30 isolate border-b backdrop-blur-md",
          /** iPhone 상태바/notch 안전영역을 반영해 헤더 콘텐츠가 겹치지 않도록 */
          "px-4 pb-3 pt-[max(14px,calc(env(safe-area-inset-top,0px)+10px))] sm:px-6",
          view === "landing" ? "border-[#E5E7EB] bg-[#F4F6F8]/88" : "border-[color:var(--edge)] bg-[color:var(--background)]/72",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto flex w-full min-w-0 max-w-[1280px]",
            view === "landing"
              ? "flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              : "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          ].join(" ")}
        >
          {view === "landing" ? (
            <>
              <div className="min-w-0 shrink-0 sm:max-w-[min(100%,28rem)] sm:pr-4">
                <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-x-4">
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold leading-tight tracking-tight text-[#111827] sm:text-base">{t("product.name")}</div>
                    <p className="mt-1 text-[11px] leading-snug text-[#4B5563] sm:text-xs">{t("brand.slogan")}</p>
                  </div>
                  <p
                    className="max-w-full shrink-0 text-[10px] leading-snug text-[#94A3B8] sm:max-w-[13.5rem] sm:pt-0.5 sm:text-right sm:text-[11px]"
                    role="note"
                  >
                    {t("header.zoomHint")}
                  </p>
                </div>
              </div>
              <div className="relative z-[1] flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:max-w-[min(100%,28rem)] sm:items-end">
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
                  <LanguageSelect dense />
                  {auth.status === "loading" ? (
                    <span className="text-[11px] text-[#6B7280]">{t("auth.checkingLogin")}</span>
                  ) : auth.status === "signed-in" ? (
                    <>
                      <span className="hidden max-w-[10rem] truncate text-[11px] text-[#4B5563] lg:inline">{auth.name ?? auth.email ?? auth.uid}</span>
                      <button
                        type="button"
                        className="crm-ghost-btn inline-flex min-h-[44px] shrink-0 items-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#111827] touch-manipulation"
                        onClick={signOut}
                      >
                        {t("auth.signOut")}
                      </button>
                    </>
                  ) : authError ? (
                    <span className="max-w-full truncate text-[10px] font-medium text-[#B91C1C] sm:max-w-[14rem] sm:text-xs" title={authError}>
                      {authError}
                    </span>
                  ) : null}
                </div>
                <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-shrink-0 sm:flex-nowrap sm:justify-end sm:gap-2">
                  <button
                    type="button"
                    onClick={openAppWorkspace}
                    className="relative z-[20] inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#111827] px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1f2937] touch-manipulation sm:min-h-[44px] sm:w-auto sm:px-5"
                  >
                    {t("cta.tryAppExperience")}
                  </button>
                  <Link
                    href="/join"
                    prefetch={false}
                    className="relative z-[20] inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-center text-[13px] font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB] touch-manipulation sm:min-h-[44px] sm:w-auto sm:px-5"
                  >
                    {t("cta.joinBeta")}
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-xl border border-transparent p-1 text-left outline-none transition hover:border-[color:var(--edge)] hover:bg-[color:var(--paper-2)] focus-visible:ring-2 focus-visible:ring-[#94A3B8] sm:items-center sm:gap-3 sm:p-1.5"
                onClick={() => navigateCrmSection("dashboard")}
                aria-label={`${t("product.name")} — 요약 화면으로 이동`}
              >
                <SensoraAnimatedMark size={40} animated={false} className="pointer-events-none shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold tracking-tight">{t("product.name")}</div>
                    <div className="truncate text-[11px] text-[color:var(--ink-2)] sm:text-xs">{t("brand.subline")}</div>
                  </div>
                  <p className="pointer-events-none shrink-0 text-[10px] leading-snug text-[color:var(--ink-2)] sm:max-w-[14rem] sm:text-right sm:text-[11px]" role="note">
                    {t("header.zoomHint")}
                  </p>
                </div>
              </button>
              <div className="relative z-[1] flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-end">
                <span className="relative z-[1] shrink-0">
                  <LanguageSelect dense />
                </span>
                {auth.status === "loading" ? (
                  <div className="text-xs text-[color:var(--ink-2)]">{t("auth.checkingLogin")}</div>
                ) : auth.status === "signed-in" ? (
                  <>
                    <div className="hidden max-w-[10rem] truncate text-xs text-[color:var(--ink-2)] sm:block">
                      {auth.name ?? auth.email ?? auth.uid}
                    </div>
                    <button
                      type="button"
                      className="crm-ghost-btn inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation"
                      onClick={signOut}
                    >
                      {t("auth.signOut")}
                    </button>
                  </>
                ) : (
                  <>
                    {authError ? (
                      <div className="max-w-full text-xs font-medium text-[#B91C1C] sm:max-w-[14rem]" title={authError}>
                        로그인 오류 · 다시 시도
                      </div>
                    ) : null}
                    <Link
                      href="/register"
                      prefetch={false}
                      className="inline-flex min-h-[44px] shrink-0 items-center rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#334155] touch-manipulation transition hover:bg-[#F8FAFC] sm:shadow-none"
                    >
                      {t("auth.salesRegistration")}
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <main className={`relative z-10 flex-1 ${view === "landing" ? "bg-[#F4F6F8]" : ""}`}>
        {view === "landing" ? <LandingShowroom onOpenAppWorkspace={openAppWorkspace} /> : null}

        {view === "app" ? (
          <div
            id="app"
            className="min-h-[calc(100dvh-3.25rem)] scroll-mt-24 bg-[#F4F6F8] px-4 pb-12 pt-6 max-sm:pb-[max(7rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))] sm:px-6 lg:min-h-[calc(100dvh-3.5rem)]"
          >
            <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-2 lg:flex-row lg:gap-8">
              <ConciergeSidebar activeSection={crmSection} onNavigate={navigateCrmSection} />
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
                    activeSection={crmSection}
                    onActiveSectionChange={navigateCrmSection}
                    onOpenLandingView={() => setView("landing")}
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

