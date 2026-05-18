"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { MobileAppSplash } from "@/app/components/MobileAppSplash";
import { NotebookCover } from "@/app/components/NotebookCover";
import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { MobileLandingDock } from "@/app/components/MobileLandingDock";
import { LanguageSelect } from "@/app/components/i18n/LanguageSelect";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { ConciergeSidebar } from "@/app/components/concierge/ConciergeSidebar";
import {
  crmSectionToHash,
  hashToCrmSection,
  type CrmSection,
} from "@/app/crm/crmSectionTypes";
import { LandingShowroom, type MobileLandingWorkspaceTarget } from "@/app/components/concierge/LandingSections";
import { CRMApp } from "@/app/crm/CRMApp";
import { useAuth } from "@/app/crm/useAuth";
import { sellerCanUseApp, useSellerProfile } from "@/app/crm/useSellerProfile";
import { isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";
import { maskEmailForBetaDisplay, useBetaSheetAccess } from "@/lib/betaAccess";

export function HomeClient({ initialView }: { initialView: "landing" | "app" }) {
  const router = useRouter();
  const { auth, authError, signOut } = useAuth();
  const { t } = useLanguage();
  const firebaseReady = isFirebaseConfigured();
  const googleAuthEnabled = isGoogleAuthEnabled();
  const seller = useSellerProfile(auth.status === "signed-in" ? auth.uid : null);
  const betaAccess = useBetaSheetAccess(auth.status === "signed-in" ? auth.email : undefined, {
    skip: auth.status !== "signed-in",
    uid: auth.status === "signed-in" ? auth.uid : null,
  });
  const [view, setView] = useState<"landing" | "app">(initialView);
  /** 모바일 랜딩: 업무 메뉴(둘러보기) — 시작 화면과 분리 */
  const [mobileLandingBrowseOpen, setMobileLandingBrowseOpen] = useState(false);
  const [crmSection, setCrmSection] = useState<CrmSection>("ai");
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

  useEffect(() => {
    if (view !== "landing") setMobileLandingBrowseOpen(false);
  }, [view]);

  /** 앱 진입 시·해시 변경 시 섹션 동기화 */
  useEffect(() => {
    if (view !== "app" || typeof window === "undefined") return;
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#/, "").trim();
      const mapped = raw ? hashToCrmSection(raw) : null;
      if (mapped) setCrmSection(mapped);
      else if (!raw) setCrmSection("ai");
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
        const next = qs.get("view") === "app" ? "app" : "landing";
        setView(next);
        if (next === "landing") setMobileLandingBrowseOpen(false);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const pushPreviewUrl = useCallback((href: string) => {
    if (typeof window === "undefined") return;
    window.history.pushState(null, "", href);
  }, []);

  const enterExactAppPreviewRoute = useCallback(
    (href: string, section: CrmSection) => {
      pushPreviewUrl(href);
      setView("app");
      setCrmSection(section);
    },
    [pushPreviewUrl],
  );

  const enterAppFromPreviewToc = useCallback(
    (section: CrmSection) => {
      const h = crmSectionToHash(section);
      enterExactAppPreviewRoute(`/?view=app#${h}`, section);
    },
    [enterExactAppPreviewRoute],
  );

  const goMobileWorkspace = useCallback(
    (target: MobileLandingWorkspaceTarget) => {
      if (target === "delivery") {
        router.push("/delivery");
        return;
      }
      enterAppFromPreviewToc(target);
    },
    [enterAppFromPreviewToc, router],
  );

  /** 랜딩·헤더의 「워크스페이스 체험」은 미리보기 모달 없이 요약 화면으로 바로 진입 */
  const openWorkspaceFromLanding = useCallback(() => {
    enterAppFromPreviewToc("ai");
  }, [enterAppFromPreviewToc]);

  const onMobileStartQuickAi = useCallback(() => {
    if (auth.status === "signed-in") {
      enterAppFromPreviewToc("ai");
    } else {
      router.push("/login");
    }
  }, [auth.status, enterAppFromPreviewToc, router]);

  const onMobileViewCustomers = useCallback(() => {
    if (auth.status === "signed-in") {
      enterAppFromPreviewToc("customers");
    } else {
      router.push("/login");
    }
  }, [auth.status, enterAppFromPreviewToc, router]);

  const returnToLanding = useCallback(() => {
    pushPreviewUrl("/?view=landing");
    setView("landing");
    setMobileLandingBrowseOpen(false);
  }, [pushPreviewUrl]);

  const scrollLandingToTop = useCallback(() => {
    if (typeof document === "undefined") return;
    document.getElementById("sensora-landing-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollLandingToCta = useCallback(() => {
    if (typeof document === "undefined") return;
    document.getElementById("sensora-landing-cta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /** 모바일: 헤더 「앱 체험」은 업무 메뉴(둘러보기)로, 데스크톱은 기존 워크스페이스 진입 유지 */
  const onHeaderTryAppExperience = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileLandingBrowseOpen(true);
      scrollLandingToTop();
      return;
    }
    openWorkspaceFromLanding();
  }, [openWorkspaceFromLanding, scrollLandingToTop]);

  const onMobileStartCustomerCare = useCallback(() => {
    if (auth.status === "signed-in") {
      enterAppFromPreviewToc("customers");
    } else {
      router.push("/login");
    }
  }, [auth.status, enterAppFromPreviewToc, router]);

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
      const id = rawHash.trim() ? rawHash.trim() : "crm-ai-assistant";
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

  /** 로그인 후 베타 시트 승인 + 명함 검토까지 CRM(클라우드 경로) 접근 제한 */
  const sellerApproved = sellerCanUseApp(seller.profile);
  const sellerLoading = sellerSignedIn && (seller.loading || betaAccess.loading);
  const betaBlocksCrm = sellerSignedIn && betaAccess.resolved && !betaAccess.approved;
  const sellerCardGateBlock =
    sellerSignedIn && betaAccess.resolved && betaAccess.approved && !seller.loading && !seller.error && !sellerApproved;

  const showCrmApp =
    !sellerSignedIn ||
    (!sellerLoading && !seller.error && betaAccess.approved && sellerApproved);

  const crmUid =
    sellerSignedIn && !sellerLoading && !seller.error && betaAccess.approved && sellerApproved
      ? auth.uid
      : null;

  const showNotebookCover = view === "app";

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden text-slate-100">
      <MobileAppSplash />
      <InspirationalBackdrop />
      {showNotebookCover ? <NotebookCover /> : null}

      <header
        className={[
          "sticky top-0 z-30 isolate backdrop-blur-xl",
          /** iPhone 상태바/notch 안전영역을 반영해 헤더 콘텐츠가 겹치지 않도록 */
            view === "landing"
            ? "flex flex-col border-b border-white/[0.09] bg-[#050a14]/94 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)] landing-service-nav landing-service-nav--compact pt-[max(10px,calc(env(safe-area-inset-top,0px)+6px))] pb-2 sm:pb-2.5"
            : [
                "border-b border-white/[0.1]",
                "px-4 pb-3 pt-[max(14px,calc(env(safe-area-inset-top,0px)+12px))] sm:px-6",
                "bg-[#07111f]/88 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
              ].join(" "),
          view === "landing" && !mobileLandingBrowseOpen ? "hidden" : "",
        ].join(" ")}
      >
        <div
          className={[
            "landing-nav-inner mx-auto flex w-full min-w-0 px-3 sm:px-6 lg:px-10",
            view === "landing"
              ? "max-w-[1440px] flex-col gap-2 max-lg:gap-1.5 sm:gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
              : "max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          ].join(" ")}
        >
          {view === "landing" ? (
            <>
              <div
                className="landing-nav-brand-cluster flex min-w-0 flex-1 items-start gap-2.5 max-lg:gap-2 sm:items-center sm:gap-3 lg:min-w-0 lg:max-w-none lg:items-center xl:max-w-[min(100%,28rem)]"
                aria-label={`${t("product.name")}. ${t("landing.showroom.header.subline")}`}
              >
                <SensoraAnimatedMark
                  size={44}
                  animated={false}
                  className="pointer-events-none hidden shrink-0 sm:block drop-shadow-[0_0_24px_-4px_rgba(56,189,248,0.35)]"
                  aria-hidden
                />
                <div className="min-w-0 hidden lg:block">
                  <div className="text-balance text-base font-semibold leading-[1.15] tracking-[-0.022em] text-white max-lg:text-[0.94rem] max-lg:leading-[1.12] max-sm:text-[0.97rem] sm:text-[1.12rem] lg:text-[1.22rem]">
                    {t("product.name")}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-300/95 max-lg:mt-0 max-lg:line-clamp-2 max-lg:text-[10px] max-lg:leading-snug sm:mt-1 sm:line-clamp-none sm:text-[0.8125rem] sm:text-slate-300 lg:text-sm">
                    {t("landing.showroom.header.subline")}
                  </p>
                </div>
              </div>

              <div className="landing-nav-actions-cluster flex w-full min-w-0 flex-col gap-2 max-lg:gap-1 sm:gap-2.5 lg:w-auto lg:max-w-none lg:flex-none lg:flex-row lg:items-center lg:justify-end lg:gap-4 xl:gap-5">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 max-lg:gap-x-1.5 max-lg:gap-y-1 sm:gap-x-3 sm:gap-y-2 lg:justify-end max-lg:[&_select]:h-7 max-lg:[&_select]:max-w-[5rem] max-lg:[&_select]:px-1.5 max-lg:[&_select]:py-1 max-lg:[&_select]:text-[10px]">
                  <LanguageSelect dense />
                  {auth.status === "loading" ? (
                    <span className="text-xs text-slate-400">{t("auth.checkingLogin")}</span>
                  ) : auth.status === "signed-in" ? (
                    <>
                      <span className="hidden max-w-[10rem] truncate text-xs text-slate-400 lg:inline">{auth.name ?? auth.email ?? auth.uid}</span>
                      <button
                        type="button"
                        className="sensora-dark-ghost-btn inline-flex min-h-[44px] shrink-0 items-center rounded-xl px-3 py-2 text-xs font-semibold touch-manipulation"
                        onClick={signOut}
                      >
                        {t("auth.signOut")}
                      </button>
                    </>
                  ) : authError ? (
                    <span className="max-w-full truncate text-[0.625rem] font-medium text-[#B91C1C] sm:max-w-[14rem] sm:text-xs" title={authError}>
                      {authError}
                    </span>
                  ) : null}
                </div>
                <div className="landing-nav-header-cta-row flex w-full min-w-0 flex-wrap items-stretch justify-end gap-x-2 gap-y-2 sm:gap-x-2.5 lg:w-auto lg:max-w-none">
                  <button
                    type="button"
                    onClick={onHeaderTryAppExperience}
                    className={[
                      "landing-nav-cta-preview landing-nav-cta-preview--compact landing-enterprise-btn-secondary relative z-[20] inline-flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-center text-[0.8125rem] font-semibold text-slate-100/95 backdrop-blur-sm sm:flex-none sm:whitespace-nowrap sm:px-3.5",
                      "transition duration-[180ms] ease-out focus-visible:outline-none active:scale-[0.99]",
                      "touch-manipulation",
                    ].join(" ")}
                  >
                    <svg className="size-[0.95rem] shrink-0 opacity-88" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path
                        d="M6.75 11.08V9.92c0-.6.323-1.15.839-1.424l5.62-3.068a1.583 1.583 0 012.541 1.424v8.088a1.584 1.584 0 01-2.541 1.424l-5.62-3.069a1.583 1.583 0 01-.839-1.423z"
                        fill="currentColor"
                        opacity="0.9"
                      />
                    </svg>
                    {t("cta.tryAppExperience")}
                  </button>
                  {auth.status === "signed-in" ? (
                    <Link
                      href="/?view=app"
                      prefetch={false}
                      className="landing-enterprise-btn-secondary relative z-[20] inline-flex min-h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-2 text-center text-[0.8125rem] font-semibold text-slate-100/95 backdrop-blur-sm transition duration-[180ms] ease-out focus-visible:outline-none active:scale-[0.99] touch-manipulation sm:flex-none"
                    >
                      {t("header.workspace")}
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      prefetch={false}
                      className="landing-enterprise-btn-secondary relative z-[20] inline-flex min-h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-2 text-center text-[0.8125rem] font-semibold text-slate-100/95 backdrop-blur-sm transition duration-[180ms] ease-out focus-visible:outline-none active:scale-[0.99] touch-manipulation sm:flex-none"
                    >
                      로그인
                    </Link>
                  )}
                  <Link
                    href="/join"
                    prefetch={false}
                    className={[
                      "landing-nav-cta-join landing-nav-cta-join--compact landing-enterprise-btn-primary relative z-[20] inline-flex min-h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-center text-[0.8125rem] font-semibold tracking-tight text-slate-50 sm:flex-none",
                      "touch-manipulation transition duration-[200ms] ease-out active:scale-[0.99]",
                      "focus-visible:outline-none",
                    ].join(" ")}
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
                className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-xl border border-transparent p-1 text-left outline-none transition duration-[220ms] hover:border-white/[0.12] hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-sky-400/40 sm:items-center sm:gap-3 sm:p-1.5"
                onClick={returnToLanding}
                aria-label={`${t("product.name")} — 랜딩으로 이동`}
              >
                <SensoraAnimatedMark size={40} animated={false} className="pointer-events-none shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold tracking-tight text-slate-50">{t("product.name")}</div>
                    <div className="truncate text-xs text-slate-400 sm:text-sm">{t("brand.subline")}</div>
                  </div>
                  <p className="pointer-events-none shrink-0 text-[0.625rem] leading-snug text-slate-500 sm:max-w-[14rem] sm:text-right sm:text-xs" role="note">
                    {t("header.zoomHint")}
                  </p>
                </div>
              </button>
              <div className="relative z-[1] flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-end">
                <span className="relative z-[1] shrink-0">
                  <LanguageSelect dense />
                </span>
                {auth.status === "loading" ? (
                  <div className="text-xs text-slate-400">{t("auth.checkingLogin")}</div>
                ) : auth.status === "signed-in" ? (
                  <>
                    <div className="hidden max-w-[10rem] truncate text-xs text-slate-400 sm:block">
                      {auth.name ?? auth.email ?? auth.uid}
                    </div>
                    <button
                      type="button"
                      className="sensora-dark-ghost-btn inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation"
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
                      className="sensora-dark-ghost-btn inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation sm:shadow-none"
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

      <main
        className={
          view === "landing"
            ? "relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden sensora-landing-main-depth bg-transparent"
            : "relative z-10 flex flex-1 flex-col"
        }
      >
        {view === "landing" ? (
          <LandingShowroom
            onOpenAppWorkspace={openWorkspaceFromLanding}
            onMobileOpenWorkspace={goMobileWorkspace}
            mobileLandingBrowseOpen={mobileLandingBrowseOpen}
            onMobileLandingBrowseOpen={() => setMobileLandingBrowseOpen(true)}
            onMobileStartCustomerCare={onMobileStartCustomerCare}
            onMobileStartQuickAi={onMobileStartQuickAi}
            onMobileViewCustomers={onMobileViewCustomers}
          />
        ) : null}

        {view === "app" ? (
          <div
            id="app"
            className="crm-bg crm-app-stage relative min-h-[calc(100dvh-3.25rem)] scroll-mt-24 px-4 pb-12 pt-6 text-slate-100 max-sm:pb-[max(7rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))] sm:px-6 lg:min-h-[calc(100dvh-3.5rem)]"
          >
            <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-2 lg:flex-row lg:gap-8">
              <ConciergeSidebar activeSection={crmSection} onNavigate={navigateCrmSection} onOpenLanding={returnToLanding} />
              <div className="relative min-h-[60vh] min-w-0 flex-1 rounded-2xl">
                {sellerLoading ? (
                  <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-white/[0.1] bg-slate-900/45 px-6 py-16 text-base text-slate-400 backdrop-blur-md">
                    영업 계정 상태를 확인하는 중…
                  </div>
                ) : null}

                {!sellerLoading && seller.error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm leading-relaxed text-red-900">
                    <p className="font-semibold">판매자 프로필을 불러오지 못했습니다.</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-red-800/95">
                      {seller.error === "permission_denied"
                        ? "베타 승인 정보와 계정 설정을 확인하고 있습니다. 잠시 후 다시 시도해 보시고, 문제가 계속되면 관리자에게 문의해 주세요."
                        : "일시적으로 프로필을 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요."}
                    </p>
                    {process.env.NODE_ENV === "development" ? (
                      <p className="mt-3 font-mono text-[11px] leading-snug text-red-900/80">개발용: {seller.error}</p>
                    ) : null}
                  </div>
                ) : null}

                {!sellerLoading && betaBlocksCrm ? (
                  <div className="sensora-premium-panel flex flex-col gap-8 px-8 py-16 text-center sm:px-12">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {t("register.title")}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
                        {betaAccess.status === "pending"
                          ? t("register.access.pendingTitle")
                          : betaAccess.status === "not_found"
                            ? t("register.access.notFoundTitle")
                            : betaAccess.status === "rejected"
                              ? t("register.access.rejectedTitle")
                              : betaAccess.status === "email_mismatch"
                                ? t("register.access.emailMismatchTitle")
                                : t("register.access.errorTitle")}
                      </h2>
                      <p className="mx-auto mt-4 max-w-md whitespace-pre-line text-base leading-relaxed text-slate-400">
                        {betaAccess.status === "pending"
                          ? t("register.access.pendingBody")
                          : betaAccess.status === "not_found"
                            ? t("register.access.notFoundBody")
                            : betaAccess.status === "rejected"
                              ? t("register.access.rejectedBody")
                              : betaAccess.status === "email_mismatch"
                                ? t("register.access.emailMismatchBody")
                                : t("register.access.errorBody")}
                      </p>
                      <p className="mx-auto mt-4 max-w-md text-[11px] leading-relaxed text-slate-500">
                        <span className="font-medium text-slate-400">{t("register.access.betaCheckEmailLabel")}</span>
                        {": "}
                        <span className="font-mono tabular-nums text-slate-300">
                          {maskEmailForBetaDisplay(auth.status === "signed-in" ? auth.email : null)}
                        </span>
                      </p>
                      <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-snug text-slate-500">
                        {t("register.access.betaCheckEmailGoogleNote")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/join"
                        className="sensora-premium-primary-workspace inline-flex min-h-[48px] items-center rounded-xl px-7 py-3 text-sm font-semibold transition touch-manipulation"
                      >
                        {t("register.access.goJoin")}
                      </Link>
                      <Link
                        href="/"
                        className="sensora-dark-ghost-btn inline-flex min-h-[48px] items-center rounded-xl px-6 py-3 text-sm font-semibold transition touch-manipulation"
                      >
                        {t("register.access.goHome")}
                      </Link>
                    </div>
                    <Link href="/toc" className="text-sm font-medium text-slate-400 underline underline-offset-4 hover:text-slate-200">
                      기능 소개(목차)만 보기
                    </Link>
                  </div>
                ) : null}

                {!sellerLoading && sellerCardGateBlock ? (
                  <div className="sensora-premium-panel flex flex-col gap-8 px-8 py-16 text-center sm:px-12">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">영업 전용</p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">아직 확인(승인) 전입니다</h2>
                      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-400">
                        {seller.profile?.approvalStatus === "rejected"
                          ? seller.profile.rejectReason?.trim()
                            ? `사유: ${seller.profile.rejectReason}`
                            : "등록 정보를 다시 확인한 뒤 다시 접수할 수 있습니다."
                          : seller.profile?.approvalStatus === "pending"
                            ? "제출해 주신 명함을 확인 중입니다. 승인이 완료되면 자동으로 열립니다."
                            : t("register.sellerGate.defaultLine")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/register"
                        className="sensora-premium-primary-workspace inline-flex min-h-[48px] items-center rounded-xl px-7 py-3 text-sm font-semibold transition touch-manipulation"
                      >
                        등록 계속하기
                      </Link>
                      <button
                        type="button"
                        className="sensora-dark-ghost-btn inline-flex min-h-[48px] items-center rounded-xl px-6 py-3 text-sm font-semibold transition touch-manipulation"
                        onClick={() => signOut()}
                      >
                        {t("register.sellerGate.changeAccount")}
                      </button>
                    </div>
                    <Link href="/toc" className="text-sm font-medium text-slate-400 underline underline-offset-4 hover:text-slate-200">
                      기능 소개(목차)만 보기
                    </Link>
                  </div>
                ) : null}

                {showCrmApp ? (
                  <CRMApp
                    uid={crmUid}
                    sellerDisplayName={
                      auth.status === "signed-in" ? auth.name?.trim() || auth.email?.split("@")[0] || "" : ""
                    }
                    activeSection={crmSection}
                    onActiveSectionChange={navigateCrmSection}
                    onOpenLandingView={returnToLanding}
                  />
                ) : null}

                {!firebaseReady || !googleAuthEnabled ? (
                  <div className="mt-6 rounded-xl border border-white/[0.08] bg-slate-900/40 px-5 py-4 text-xs leading-relaxed text-slate-400">
                    현재 로그인/연동 기능이 완전히 활성화되지 않아도, 로컬 저장 기반으로 고객 정리를 먼저 시작할 수 있습니다.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {view === "landing" && mobileLandingBrowseOpen ? (
        <MobileLandingDock
          onScrollLandingTop={scrollLandingToTop}
          onOpenCustomers={() => enterAppFromPreviewToc("customers")}
          onOpenMemo={() => enterAppFromPreviewToc("consulting")}
          onOpenAi={() => enterAppFromPreviewToc("ai")}
          onOpenMore={scrollLandingToCta}
        />
      ) : null}
    </div>
  );
}
