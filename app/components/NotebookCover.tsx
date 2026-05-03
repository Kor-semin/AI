"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  NOTEBOOK_COVER_THEME_KEY,
  type NotebookCoverTheme,
  parseNotebookCoverTheme,
} from "@/app/components/notebookCoverTheme";
import { UnifiedSensoraGuideFlow } from "@/app/components/concierge/UnifiedSensoraGuideFlow";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { useAuth } from "@/app/crm/useAuth";
import { useSellerProfile } from "@/app/crm/useSellerProfile";
import { isFirebaseConfigured } from "@/app/firebase/client";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

const STORAGE_KEY = "crm.notebookCoverDismissed";

/** 브라우저 탭(일반 웹)에서는 표지를 자동으로 띄우지 않고, PWA/홈 화면 추가 등 standalone 에서만 노출합니다. */
function isPwaStandaloneWindow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
  } catch {
    /* ignore */
  }
  const nav = navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

const WORKSPACE_PATH = "/?view=app" as const;
const WORKSPACE_AI_HASH = "/?view=app#crm-ai-assistant" as const;

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const onboardCloseBtn =
  "inline-flex touch-manipulation items-center justify-center rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium tracking-[-0.01em] text-[#94A3B8] transition motion-reduce:transition-none hover:bg-white/[0.06] hover:text-[#E2E8F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8]/65";

/**
 * PWA 첫 진입 등 — 앱 미리보기(AppPreviewToc)와 동일한 Sensora 통합 가이드 흐름을 재사용합니다.
 * 표지 레이아웃·톤(자연광·모노) 래퍼는 유지하고, 안내 단계 중복만 제거합니다.
 */
export function NotebookCover() {
  const router = useRouter();
  const { t } = useLanguage();
  const { auth } = useAuth();
  const firebaseReady = isFirebaseConfigured();
  const [coverHydrated, setCoverHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [forceShow, setForceShow] = useState(false);
  const [coverTheme, setCoverTheme] = useState<NotebookCoverTheme>("natural");
  const panelRef = useRef<HTMLDivElement>(null);

  const sellerUid = auth.status === "signed-in" ? auth.uid : null;
  const seller = useSellerProfile(sellerUid);
  const sellerSignedIn = firebaseReady && auth.status === "signed-in";
  const sellerLoading = sellerSignedIn && seller.loading;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cover") === "1" || params.get("openCover") === "1") {
        sessionStorage.removeItem(STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- URL 쿼리와 초기 노출 동기화
        setDismissed(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForceShow(false);
        params.delete("cover");
        params.delete("openCover");
        const q = params.toString();
        const next = `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`;
        window.history.replaceState(null, "", next);
        setCoverHydrated(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setDismissed(isPwaStandaloneWindow() ? readDismissed() : true);
    setCoverHydrated(true);
  }, []);

  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined" ? window.localStorage.getItem(NOTEBOOK_COVER_THEME_KEY) : null;
      setCoverTheme(parseNotebookCoverTheme(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onShow = () => {
      setDismissed(false);
      setForceShow(true);
    };
    window.addEventListener("crm-show-notebook-cover", onShow);
    return () => window.removeEventListener("crm-show-notebook-cover", onShow);
  }, []);

  const visible = coverHydrated && (forceShow || !dismissed);

  const dismissQuiet = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setForceShow(false);
  }, []);

  const dismissAndNavigate = useCallback(
    (href: string) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setDismissed(true);
      setForceShow(false);
      router.push(href);
    },
    [router],
  );

  const enterFromGuide = useCallback(
    (section: CrmSection) => {
      dismissAndNavigate(section === "ai" ? WORKSPACE_AI_HASH : WORKSPACE_PATH);
    },
    [dismissAndNavigate],
  );

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissQuiet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismissQuiet]);

  useEffect(() => {
    if (!visible || !panelRef.current) return;
    panelRef.current.focus({ preventScroll: true });
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`notebook-cover-sheet sensora-notebook-sheet-galaxy notebook-cover-sheet-consultant notebook-cover-sheet--tone-${coverTheme} outline-none [-webkit-tap-highlight-color:transparent]`}>
      <div className="notebook-cover-consultant-hero sensora-notebook-nebula-accent" aria-hidden>
        <div className="notebook-cover-hero-abstract" />
        <div className="notebook-cover-hero-dim" />
        <div className="notebook-cover-tone-scrim" />
      </div>

      <button
        type="button"
        className="absolute inset-0 z-[5] cursor-default border-0 bg-[rgba(2,8,23,0.58)] p-0 motion-safe:transition-colors motion-safe:duration-200 hover:bg-[rgba(2,8,23,0.64)]"
        aria-label={t("cover.onboarding.close")}
        onClick={dismissQuiet}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notebook-cover-panel-heading"
        tabIndex={-1}
        className={[
          "notebook-cover-cover-layer notebook-cover-biz-micro notebook-cover-reveal notebook-cover-editorial-shell relative z-10 mx-auto flex min-h-[100dvh] min-h-[100svh] w-full max-w-[min(780px,calc(100vw-28px))] flex-col overflow-hidden overscroll-contain pl-[max(18px,calc(env(safe-area-inset-left,0px)+1rem))] pr-[max(18px,calc(env(safe-area-inset-right,0px)+1rem))] pb-[max(0.5rem,calc(env(safe-area-inset-bottom,0px)+2px))] pt-[max(10px,calc(env(safe-area-inset-top,0px)+0.5rem))] text-center",
          "max-[480px]:[scrollbar-width:none] max-[480px]:[-ms-overflow-style:none] max-[480px]:[&::-webkit-scrollbar]:hidden",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-end pb-1 max-[480px]:pb-0 sm:pb-2">
          <button type="button" className={onboardCloseBtn} onClick={dismissQuiet} aria-label={t("cover.onboarding.close")}>
            {t("cover.onboarding.close")}
          </button>
        </div>

        <h2 id="notebook-cover-panel-heading" className="sr-only">
          {t("guide.unified.pageTitle")}
        </h2>

        <UnifiedSensoraGuideFlow
          active={visible}
          variant="notebook"
          onClose={dismissQuiet}
          onSelectSection={enterFromGuide}
          sellerLoading={sellerLoading}
          className="flex min-h-0 flex-1 flex-col"
        />
      </div>
    </div>
  );
}
