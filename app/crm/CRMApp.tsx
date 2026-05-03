"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CalendarEvent,
  CRMState,
  Customer,
  LeadSource,
  MessageTemplate,
  NextAction,
  PaymentType,
  PipelineStage,
  UsedCarAccident,
} from "./types";
import type { SyncStatus } from "./types";
import {
  createCustomerCloud,
  createEventCloud,
  createNextActionCloud,
  createTemplateCloud,
  deleteCustomerCloud,
  hasAnyCloudData,
  loadState,
  saveState,
  seedCloudFromState,
  subscribeCustomers,
  subscribeEvents,
  subscribeNextActions,
  subscribeTemplates,
  updateEventCloud,
  updateNextActionCloud,
  updateTemplateCloud,
  upsertCustomerCloud,
} from "./storage";
import { migrateCRMState } from "./migrate";
import { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import type { VehicleBrandId } from "./vehicleCatalog";
import { vehicleModelsFor, VEHICLE_BRANDS } from "./vehicleCatalog";
import {
  explainPurchaseIntent,
  LEAD_SCORE_HOTWORDS,
  scorePurchaseIntent,
  shouldShowPurchaseIntentScore,
} from "./leadScore";
import {
  buildUsedCarSearchQuery,
  formatKrwShort,
  parseMoneyToKrw,
  recommendModelsByBudget,
  summarizeMarketVsBudget,
} from "./recommendations";
import { getMemoFeedback } from "./memoFeedback";
import {
  formatCareNeedsGuideTopicsUi,
  generateDemoConsultingResponse,
  type DemoConsultingResponse,
  type DemoSalesStyle,
} from "@/app/components/concierge/aiDemoResponse";
import { makeId, seedState } from "./seed";
import { ContactImportFileGuideModal } from "./ContactImportFileGuideModal";
import { ImportContactsPanel, type ImportContactsCommitPayload } from "./ImportContactsPanel";
import type { NormalizedImportedContact } from "./contactImport/normalizeImportedContact";
import type { CrmSection } from "./crmSectionTypes";
import { CRM_SECTION_LABELS, CRM_SECTION_MOBILE_SUBTITLE_KEYS } from "./crmSectionTypes";
import { DashboardSection } from "./sections/DashboardSection";
import { ConsultingNotesSection } from "./sections/ConsultingNotesSection";
import { PipelineSection } from "./sections/PipelineSection";
import { VehicleMatchSection } from "./sections/VehicleMatchSection";
import { FollowUpSection } from "./sections/FollowUpSection";
import { SettingsSection } from "./sections/SettingsSection";
import { CustomersSection } from "./sections/CustomersSection";
import { AiSecretarySection } from "./sections/AiSecretarySection";
import { CrmAiAssistantPanel } from "./CrmAiAssistantPanel";
import { CrmMiniCalendar } from "@/app/crm/CrmMiniCalendar";
import { DeliveryGuideScreen } from "@/app/crm/deliveryGuide/DeliveryGuideScreen";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import {
  SEASON_CARE_BRAND_PRESETS,
  SEASON_CARE_PURPOSES,
  SEASON_CARE_SEASONS,
  SEASON_CARE_TONES,
  generateSeasonCareMessage,
  seasonCareMessageLocale,
  type SeasonCareBrandPreset,
  type SeasonCarePurpose,
  type SeasonCareSeason,
  type SeasonCareTone,
} from "./seasonCareMessage";
import { SensoraGuideImageViewer } from "@/app/components/concierge/SensoraGuideImageViewer";
import { SENSORA_GUIDE_IMAGES } from "@/app/components/concierge/sensoraGuideImages";

const CRM_GUIDE_VIEWER_IMAGES = SENSORA_GUIDE_IMAGES.map((s) => ({ src: s.src }));
const CRM_GUIDE_SLIDE_TITLE_KEYS = SENSORA_GUIDE_IMAGES.map((s) => s.titleKey);

const LEAD_SOURCES = [...DEALER_LEAD_SOURCES] satisfies LeadSource[];
const STAGES = [...DEALER_PIPELINE_STAGES] satisfies PipelineStage[];

const BRAND_OPTIONS: VehicleBrandId[] = [...VEHICLE_BRANDS];

const WORKSPACE_AI_STYLE_KEYS: Record<DemoSalesStyle, TranslationKey> = {
  polite: "landing.aiDemo.salesStyle.polite",
  simple: "landing.aiDemo.salesStyle.simple",
  premium: "landing.aiDemo.salesStyle.premium",
  friendly: "landing.aiDemo.salesStyle.friendly",
  active: "landing.aiDemo.salesStyle.active",
};
const PAYMENT_TYPE_OPTIONS: PaymentType[] = ["현금", "할부", "리스", "장기렌트"];
const ACCIDENT_OPTIONS: UsedCarAccident[] = ["무사고", "단순교환", "사고", "미상"];

/** 새 고객 추가 모달 기본 초기값(고객명은 사용자 입력 필수 — 저장 전에는 고객을 만들지 않음) */
const CREATE_CUSTOMER_INITIAL = {
  name: "",
  phone: "",
  leadSource: "전화·매장방문" as LeadSource,
  stage: "신규 문의" as PipelineStage,
  vehicleBrand: "" as string,
  interestedModel: "",
  memo: "",
  nextContactAt: undefined as string | undefined,
  nextActionText: "",
};

const SC_BRAND_OPTIONS: (SeasonCareBrandPreset | "other")[] = [...SEASON_CARE_BRAND_PRESETS, "other"];

const SC_BRAND_TKEY: Record<SeasonCareBrandPreset | "other", TranslationKey> = {
  "mercedes-benz": "crm.seasonCare.brand.mercedesBenz",
  bmw: "crm.seasonCare.brand.bmw",
  mini: "crm.seasonCare.brand.mini",
  audi: "crm.seasonCare.brand.audi",
  porsche: "crm.seasonCare.brand.porsche",
  lexus: "crm.seasonCare.brand.lexus",
  volvo: "crm.seasonCare.brand.volvo",
  genesis: "crm.seasonCare.brand.genesis",
  other: "crm.seasonCare.brand.other",
};

const SC_SEASON_TKEY: Record<SeasonCareSeason, TranslationKey> = {
  spring_cherry: "crm.seasonCare.season.springCherry",
  summer_monsoon: "crm.seasonCare.season.summerMonsoon",
  summer_heat: "crm.seasonCare.season.summerHeat",
  autumn_foliage: "crm.seasonCare.season.autumnFoliage",
  winter_cold: "crm.seasonCare.season.winterCold",
  winter_snow: "crm.seasonCare.season.winterSnow",
  holiday_lunar_new_year: "crm.seasonCare.season.lunarNewYear",
  holiday_chuseok: "crm.seasonCare.season.chuseok",
  vacation_season: "crm.seasonCare.season.vacation",
  before_long_trip: "crm.seasonCare.season.beforeLongTrip",
  tire_check: "crm.seasonCare.season.tireCheck",
  battery_check: "crm.seasonCare.season.batteryCheck",
  oil_check: "crm.seasonCare.season.oilCheck",
  wiper_ac_filter_check: "crm.seasonCare.season.wiperAcFilterCheck",
};

const SC_PURPOSE_TKEY: Record<SeasonCarePurpose, TranslationKey> = {
  greeting: "crm.seasonCare.purpose.greeting",
  maintenance_info: "crm.seasonCare.purpose.maintenance",
  tire_reminder: "crm.seasonCare.purpose.tire",
  promotion: "crm.seasonCare.purpose.promotion",
  revisit: "crm.seasonCare.purpose.revisit",
  delivery_customer_care: "crm.seasonCare.purpose.deliveryCare",
  reengage_silent: "crm.seasonCare.purpose.reengage",
  personal_branding: "crm.seasonCare.purpose.personalBranding",
};

const SC_TONE_TKEY: Record<SeasonCareTone, TranslationKey> = {
  polite: "crm.seasonCare.tone.polite",
  warm: "crm.seasonCare.tone.warm",
  premium: "crm.seasonCare.tone.premium",
  brief: "crm.seasonCare.tone.brief",
  promo: "crm.seasonCare.tone.promo",
};

function nowIso() {
  return new Date().toISOString();
}

function mergeImportedCustomerMemo(existing: string | undefined, append: string): string {
  const a = (existing ?? "").trim();
  const b = (append ?? "").trim();
  if (!b) return a;
  if (!a) return b;
  return `${a}\n\n— 주소록 가져오기·메모 추가(원문 유지) —\n${b}`;
}

function computeCustomersAfterContactImport(
  prev: Customer[],
  payload: ImportContactsCommitPayload,
  t: string,
): Customer[] {
  const chunksById = new Map<string, string[]>();
  for (const m of payload.merges) {
    const xs = chunksById.get(m.customerId) ?? [];
    xs.push(m.memoAppend);
    chunksById.set(m.customerId, xs);
  }

  const adjusted = prev.map((c) => {
    const chunks = chunksById.get(c.id);
    if (!chunks?.length) return c;
    const memo = chunks.reduce((acc, bit) => mergeImportedCustomerMemo(acc, bit), c.memo ?? "");
    return { ...c, memo, updatedAt: t };
  });

  return [...payload.creates, ...adjusted];
}

function formatDateTime(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function clampText(s: string, n = 80) {
  const t = (s ?? "").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
}

/** 검색·바로가기 매칭용: 소문자 + 공백 제거 */
function normalizeSearchFold(s: string): string {
  return (s ?? "").toLowerCase().replace(/\s+/g, "");
}

/** 목록용 연락처 마스킹(뒤 자리 가림) */
function maskPhoneForSearchList(phone?: string): string {
  const raw = (phone ?? "").replace(/[^\d+]/g, "");
  if (!raw) return "—";
  const d = raw.replace(/^\+82/, "0").replace(/\D/g, "");
  if (d.length >= 10) return `${d.slice(0, 3)}-${d.slice(3, 7)}-****`;
  if (d.length >= 7) return `${d.slice(0, 3)}-${d.slice(3)}-**`;
  if (d.length >= 4) return `${d.slice(0, 3)}-**`;
  return `${d.slice(0, Math.min(3, d.length))}***`;
}

type CrmSearchFeatureId =
  | "ai-assistant"
  | "create-customer"
  | "season-care"
  | "delivery"
  | "followup"
  | "customer-list";

const CRM_SEARCH_FEATURES: {
  id: CrmSearchFeatureId;
  title: string;
  subtitle: string;
  keywords: string[];
}[] = [
  {
    id: "ai-assistant",
    title: "Sensora AI 비서로 이동",
    subtitle: "상담 메모를 정리하고 고객 발송 문구를 제안합니다.",
    keywords: [
      "AI비서",
      "sensora ai 비서",
      "sensora ai",
      "AI 비서",
      "에이아이",
      "비서",
      "상담정리",
      "상담 정리",
      "상담메모",
      "AI",
    ],
  },
  {
    id: "create-customer",
    title: "새 고객 추가",
    subtitle: "새 고객 정보를 입력합니다.",
    keywords: ["고객추가", "고객 추가", "신규고객", "신규 고객", "고객등록", "고객 등록"],
  },
  {
    id: "season-care",
    title: "시즌 케어 메시지",
    subtitle: "계절·상황별 고객 연락 문구를 준비합니다.",
    keywords: ["시즌케어", "시즌 케어", "시즌", "계절문자", "계절 문자"],
  },
  {
    id: "delivery",
    title: "출고 안내",
    subtitle: "출고 준비·인도 정보를 확인합니다.",
    keywords: ["출고", "출고안내", "출고 안내", "차량인도", "차량 인도"],
  },
  {
    id: "followup",
    title: "다음 연락 · 할 일",
    subtitle: "고객 카드에서 다음 연락 일정과 할 일을 이어서 관리합니다.",
    keywords: ["사후관리", "후속", "다음연락", "다음 연락", "연락"],
  },
  {
    id: "customer-list",
    title: "고객 목록으로 이동",
    subtitle: "등록된 고객표를 확인합니다.",
    keywords: ["고객 목록", "고객목록", "목록", "고객리스트"],
  },
];

function crmFeatureMatchesQuery(normQuery: string, keywords: string[]): boolean {
  if (normQuery.length < 2) return false;
  return keywords.some((kw) => {
    const nk = normalizeSearchFold(kw);
    if (!nk) return false;
    return nk.includes(normQuery) || normQuery.includes(nk);
  });
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** 클립보드 API가 막힌 브라우저/WebView에서는 textarea 폴백 사용 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 폴백 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.readOnly = true;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.left = "0";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

function emptyState(): CRMState {
  return { version: 1, customers: [], nextActions: [], events: [], templates: [] };
}

export function CRMApp({
  uid,
  sellerDisplayName,
  activeSection,
  onActiveSectionChange,
  onOpenLandingView,
}: {
  uid?: string | null;
  /** `{내이름}` 치환: 로그인 시 구글 이름·이메일 등 */
  sellerDisplayName?: string | null;
  activeSection: CrmSection;
  onActiveSectionChange: (s: CrmSection) => void;
  /** 설정 등에서 소개(랜딩) 페이지로 전환할 때 호출 */
  onOpenLandingView?: () => void;
}) {
  const { t, language } = useLanguage();
  // uid=null means local-only mode.
  const [state, setState] = useState<CRMState>(() => emptyState());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [tab, setTab] = useState<"고객" | "다음할일" | "일정" | "템플릿">("고객");
  const didHydrateRef = useRef(false);
  const [sync, setSync] = useState<SyncStatus>({ mode: uid ? "cloud" : "local", status: "idle" });
  const cloudPartsRef = useRef<Partial<CRMState>>({});
  /** Firestore 에코 전 onSnapshot 덮어쓰기에 낙관적으로 추가된 고객 행 유지 */
  const pendingCustomerCreatesRef = useRef<Set<string>>(new Set());

  const SEARCH_SHORTCUT_HINT = "Ctrl+K";
  const SELLER_NICK_KEY = "crm.sellerNickname";
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const crmSearchWrapRef = useRef<HTMLDivElement | null>(null);
  /** 문자 템플릿 `{내이름}` : 로컬 입력이 있으면 우선 */
  const [sellerNickname, setSellerNickname] = useState("");
  const [importContactsOpen, setImportContactsOpen] = useState(false);
  const [contactFileGuideOpen, setContactFileGuideOpen] = useState(false);
  const [previewGateOpen, setPreviewGateOpen] = useState(false);
  const openPreviewGate = useCallback(() => setPreviewGateOpen(true), []);
  const [sensoraTipIntroOpen, setSensoraTipIntroOpen] = useState(false);
  const [sensoraGuideViewerOpen, setSensoraGuideViewerOpen] = useState(false);
  const [sensoraGuideInitialIndex, setSensoraGuideInitialIndex] = useState(0);
  const openCustomersImportHub = useCallback(() => {
    if (!uid) {
      openPreviewGate();
      return;
    }
    onActiveSectionChange("customers");
    setTab("고객");
    setImportContactsOpen(true);
  }, [uid, openPreviewGate, onActiveSectionChange]);
  const [leadExplainForId, setLeadExplainForId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deliveryGuideOpen, setDeliveryGuideOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [createCustomerDraft, setCreateCustomerDraft] = useState({ ...CREATE_CUSTOMER_INITIAL });
  const createCustomerDraftRef = useRef(createCustomerDraft);
  createCustomerDraftRef.current = createCustomerDraft;

  const [seasonCareBrand, setSeasonCareBrand] = useState<SeasonCareBrandPreset | "other">("mercedes-benz");
  const [seasonCareBrandCustom, setSeasonCareBrandCustom] = useState("");
  const [seasonCareSeason, setSeasonCareSeason] = useState<SeasonCareSeason>("spring_cherry");
  const [seasonCarePurpose, setSeasonCarePurpose] = useState<SeasonCarePurpose>("greeting");
  const [seasonCareTone, setSeasonCareTone] = useState<SeasonCareTone>("polite");
  const [seasonCareSellerName, setSeasonCareSellerName] = useState("");
  const [seasonCareShowroom, setSeasonCareShowroom] = useState("");
  const [seasonCareContact, setSeasonCareContact] = useState("");
  const [seasonCareJobTitle, setSeasonCareJobTitle] = useState("");
  const [seasonCareOutput, setSeasonCareOutput] = useState("");
  const [workspaceAiMemoDraft, setWorkspaceAiMemoDraft] = useState("");
  /** 분석 버튼이 마지막으로 참조한 메모 스냅샷(Sensora Flow · flowDraft). 입력 중 자동 변경 없음 */
  const [flowDraftMemo, setFlowDraftMemo] = useState("");
  /** generateDemoConsultingResponse 결과 캐시 — 저장으로 CRM 필드 자동 변경 없음 */
  const [flowDraftInsights, setFlowDraftInsights] = useState<DemoConsultingResponse | null>(null);
  const [workspaceAiBusy, setWorkspaceAiBusy] = useState(false);
  const [workspaceSalesStyle, setWorkspaceSalesStyle] = useState<DemoSalesStyle>("polite");
  /** 고객 전환 시 generate에 최신 스타일 주입(disabled ESLint 고객 id 전용 이펙트) */
  const workspaceSalesStyleRef = useRef(workspaceSalesStyle);
  workspaceSalesStyleRef.current = workspaceSalesStyle;
  const smsRewriteNonceRef = useRef(0);

  const TAB_LABELS: Record<typeof tab, string> = {
    고객: t("crm.tab.customers"),
    다음할일: t("crm.tab.next"),
    일정: t("crm.tab.events"),
    템플릿: t("crm.tab.templates"),
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const v = window.localStorage.getItem(SELLER_NICK_KEY);
        if (v) setSellerNickname(v);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 1500);
  }

  /** Sensora Flow: 명시적 분석 클릭 시에만 flowDraft 업데이트 (입력 중 자동 재분석 없음) */
  function runSensoraFlowAnalyzeOrRefresh() {
    if (!uid) {
      openPreviewGate();
      return;
    }
    if (!selectedCustomerId) return;
    const snap = workspaceAiMemoDraft.trim();
    if (!snap) {
      showToast(t("crm.sensoraFlow.needMemoForAnalyze"));
      return;
    }
    setWorkspaceAiBusy(true);
    smsRewriteNonceRef.current = 0;
    window.setTimeout(() => {
      setFlowDraftMemo(snap);
      setFlowDraftInsights(
        generateDemoConsultingResponse(snap, {
          salesStyle: workspaceSalesStyle,
        }),
      );
      window.setTimeout(() => setWorkspaceAiBusy(false), 220);
    }, 0);
  }

  /** 같은 메모로도 제안 카드 전체를 새로 뽑아 볼 때(내부 변동 — 저장·자동 반영 없음). */
  function runSensoraFlowNewProposal() {
    if (!uid) {
      openPreviewGate();
      return;
    }
    if (!selectedCustomerId) return;
    const snap = workspaceAiMemoDraft.trim();
    if (!snap) {
      showToast(t("crm.sensoraFlow.needMemoForAnalyze"));
      return;
    }
    setWorkspaceAiBusy(true);
    smsRewriteNonceRef.current += 1;
    const salt = "\u2060".repeat(smsRewriteNonceRef.current);
    window.setTimeout(() => {
      setFlowDraftMemo(snap);
      setFlowDraftInsights(
        generateDemoConsultingResponse(`${snap}${salt}`, {
          salesStyle: workspaceSalesStyle,
        }),
      );
      window.setTimeout(() => setWorkspaceAiBusy(false), 220);
    }, 0);
  }

  /** 문자 초안만 다시 채우기(de·규칙 엔진: snapshot에 nonce를 붙여 재계산 후 message만 교체). */
  function runSensoraFlowRewriteSmsDraft() {
    if (!uid) {
      openPreviewGate();
      return;
    }
    if (!selectedCustomerId) return;
    const snapshot = flowDraftMemo.trim();
    if (!snapshot) {
      showToast(t("crm.sensoraFlow.needMemoForAnalyze"));
      return;
    }
    if (!flowDraftInsights) {
      runSensoraFlowAnalyzeOrRefresh();
      return;
    }
    setWorkspaceAiBusy(true);
    smsRewriteNonceRef.current += 1;
    const salt = "\u2060".repeat(smsRewriteNonceRef.current);
    window.setTimeout(() => {
      const fresh = generateDemoConsultingResponse(`${snapshot}${salt}`, {
        salesStyle: workspaceSalesStyle,
      });
      setFlowDraftInsights((prev) => {
        if (!prev) return fresh;
        return { summary: prev.summary, nextAction: prev.nextAction, message: fresh.message };
      });
      window.setTimeout(() => setWorkspaceAiBusy(false), 220);
    }, 0);
  }

  function resetSeasonCareForm() {
    setSeasonCareBrand("mercedes-benz");
    setSeasonCareBrandCustom("");
    setSeasonCareSeason("spring_cherry");
    setSeasonCarePurpose("greeting");
    setSeasonCareTone("polite");
    setSeasonCareSellerName("");
    setSeasonCareShowroom("");
    setSeasonCareContact("");
    setSeasonCareJobTitle("");
    setSeasonCareOutput("");
  }

  function runSeasonCareGenerate() {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const msg = generateSeasonCareMessage(
      {
        brandPreset: seasonCareBrand,
        brandCustom: seasonCareBrandCustom,
        season: seasonCareSeason,
        purpose: seasonCarePurpose,
        tone: seasonCareTone,
        sellerName: seasonCareSellerName,
        showroom: seasonCareShowroom,
        contact: seasonCareContact,
        jobTitle: seasonCareJobTitle,
      },
      seasonCareMessageLocale(language),
    );
    setSeasonCareOutput(msg);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        if (
          tag &&
          (tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            (t?.isContentEditable ?? false))
        ) {
          return;
        }
        e.preventDefault();
        const inp = searchInputRef.current;
        inp?.focus();
        inp?.select();
        window.setTimeout(() => {
          if (inp && normalizeSearchFold(inp.value).length >= 1) setSearchOpen(true);
        }, 0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!createCustomerOpen) return undefined;
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "SELECT") return;
      e.preventDefault();
      setCreateCustomerOpen(false);
      setCreateCustomerDraft({ ...CREATE_CUSTOMER_INITIAL });
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [createCustomerOpen]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam === "customers") setTab("고객");
        if (tabParam === "next") setTab("다음할일");
        if (tabParam === "events") setTab("일정");
        if (tabParam === "templates") setTab("템플릿");

        if (tabParam) {
          params.delete("tab");
          const q = params.toString();
          const next = `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`;
          window.history.replaceState(null, "", next);
        }
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  function persistSellerNickname(next: string) {
    setSellerNickname(next);
    try {
      if (next.trim()) window.localStorage.setItem(SELLER_NICK_KEY, next.trim());
      else window.localStorage.removeItem(SELLER_NICK_KEY);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    (async () => {
      setSync({ mode: uid ? "cloud" : "local", status: "syncing" });
      const local = loadState();
      if (!uid) {
        const next = local ?? seedState();
        setState(next);
        setSelectedCustomerId(next.customers[0]?.id ?? null);
        didHydrateRef.current = true;
        setSync({ mode: "local", status: "idle" });
        return;
      }

      try {
        const hasData = await hasAnyCloudData(uid);
        if (!hasData) {
          const seed = local ?? seedState();
          await seedCloudFromState(uid, seed);
        }

        cloudPartsRef.current = {};
        const apply = () => {
          const p = cloudPartsRef.current;
          if (!p.customers || !p.nextActions || !p.events || !p.templates) return;
          const next: CRMState = {
            version: 1,
            customers: p.customers,
            nextActions: p.nextActions,
            events: p.events,
            templates: p.templates,
          };
          const migrated = migrateCRMState(next);

          setState((prev) => {
            for (const c of migrated.customers) {
              pendingCustomerCreatesRef.current.delete(c.id);
            }
            const cloudIds = new Set(migrated.customers.map((c) => c.id));
            const pendingLocals = prev.customers.filter(
              (c) => pendingCustomerCreatesRef.current.has(c.id) && !cloudIds.has(c.id),
            );
            const mergedCustomers = [...pendingLocals, ...migrated.customers].sort((a, b) =>
              b.updatedAt.localeCompare(a.updatedAt),
            );
            return { ...migrated, customers: mergedCustomers };
          });

          setSelectedCustomerId((sel) => sel ?? migrated.customers[0]?.id ?? null);
          didHydrateRef.current = true;
          setSync({ mode: "cloud", status: "idle" });
        };

        const unsubs: Array<() => void> = [];
        const onSubError = (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          setSync({ mode: "cloud", status: "error", message: msg });
        };
        unsubs.push(
          await subscribeCustomers(uid, (v) => {
            cloudPartsRef.current.customers = v;
            apply();
          }, onSubError),
        );
        unsubs.push(
          await subscribeNextActions(uid, (v) => {
            cloudPartsRef.current.nextActions = v;
            apply();
          }, onSubError),
        );
        unsubs.push(
          await subscribeEvents(uid, (v) => {
            cloudPartsRef.current.events = v;
            apply();
          }, onSubError),
        );
        unsubs.push(
          await subscribeTemplates(uid, (v) => {
            cloudPartsRef.current.templates = v;
            apply();
          }, onSubError),
        );

        return () => {
          unsubs.forEach((fn) => fn());
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Cloud sync error";
        setSync({ mode: "cloud", status: "error", message: msg });
      }
    })();
  }, [uid]);

  useEffect(() => {
    if (!didHydrateRef.current) {
      // 클라우드 첫 hydrate 전이라도 사용자가 고객을 추가하면 로컬 백업 허용
      if (!(uid && pendingCustomerCreatesRef.current.size > 0 && state.customers.length > 0)) {
        return;
      }
    }
    // Always keep a local copy (offline fallback / quick restore).
    saveState(state);
  }, [state, uid]);

  useEffect(() => {
    setSelectedCustomerId((sel) => {
      if (!sel) return null;
      if (state.customers.some((c) => c.id === sel)) return sel;
      return state.customers[0]?.id ?? null;
    });
  }, [state.customers]);

  const customersFiltered = useMemo(() => {
    const list = [...state.customers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const nq = normalizeSearchFold(searchQuery);
    if (!nq) return list;
    return list.filter((c) => {
      const hay = normalizeSearchFold(
        `${c.name} ${c.phone ?? ""} ${c.vehicleBrand ?? ""} ${c.interestedModel ?? ""} ${c.memo ?? ""} ${c.leadSource} ${c.stage}`,
      );
      return hay.includes(nq);
    });
  }, [searchQuery, state.customers]);

  const customerSearchResults = useMemo(() => customersFiltered.slice(0, 5), [customersFiltered]);

  const featureSearchResults = useMemo(() => {
    const nq = normalizeSearchFold(searchQuery);
    if (nq.length < 2) return [];
    const hits = CRM_SEARCH_FEATURES.filter((f) => crmFeatureMatchesQuery(nq, f.keywords));
    return hits.slice(0, 5);
  }, [searchQuery]);

  useEffect(() => {
    if (!previewGateOpen) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setPreviewGateOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [previewGateOpen]);

  useEffect(() => {
    function onMouseDown(ev: MouseEvent) {
      const wrap = crmSearchWrapRef.current;
      if (!wrap || !searchOpen) return;
      const target = ev.target;
      if (target instanceof Node && wrap.contains(target)) return;
      setSearchOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [searchOpen]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (createCustomerOpen) return;
      if (!searchOpen) return;
      e.preventDefault();
      setSearchOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [searchOpen, createCustomerOpen]);

  useEffect(() => {
    if (createCustomerOpen) setSearchOpen(false);
  }, [createCustomerOpen]);

  const selectedCustomer = useMemo(
    () => state.customers.find((c) => c.id === selectedCustomerId) ?? null,
    [state.customers, selectedCustomerId],
  );

  const selectedNextActions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return state.nextActions
      .filter((a) => a.customerId === selectedCustomerId)
      .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  }, [selectedCustomerId, state.nextActions]);

  const selectedEvents = useMemo(() => {
    if (!selectedCustomerId) return [];
    return state.events
      .filter((e) => e.customerId === selectedCustomerId)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [selectedCustomerId, state.events]);

  const budgetWonSelected = useMemo(
    () => parseMoneyToKrw(selectedCustomer?.budget),
    [selectedCustomer?.budget],
  );
  const budgetRecs = useMemo(
    () => (budgetWonSelected ? recommendModelsByBudget(budgetWonSelected) : []),
    [budgetWonSelected],
  );
  const marketSummaryLines = useMemo(() => {
    if (!selectedCustomer) return [];
    return summarizeMarketVsBudget({
      budgetWon: budgetWonSelected,
      encarMin: selectedCustomer.marketPrice?.encarMin,
      encarMax: selectedCustomer.marketPrice?.encarMax,
    });
  }, [selectedCustomer, budgetWonSelected]);
  const memoFeedback = useMemo(
    () => (selectedCustomer ? getMemoFeedback(selectedCustomer) : null),
    [selectedCustomer],
  );

  useEffect(() => {
    setWorkspaceAiBusy(false);
    smsRewriteNonceRef.current = 0;
    if (!selectedCustomerId) {
      setWorkspaceAiMemoDraft("");
      setFlowDraftMemo("");
      setFlowDraftInsights(null);
      return;
    }
    const c = state.customers.find((row) => row.id === selectedCustomerId);
    const m = c?.memo ?? "";
    const trimmed = m.trim();
    setWorkspaceAiMemoDraft(m);
    setFlowDraftMemo(trimmed);
    setFlowDraftInsights(
      trimmed
        ? generateDemoConsultingResponse(m, {
            salesStyle: workspaceSalesStyleRef.current,
          })
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 고객 전환 시점만 동기화(타이핑 중 재분석·덮어쓰기 방지)
  }, [selectedCustomerId]);

  const memoDiffersFromFlowSnapshot = useMemo(
    () => workspaceAiMemoDraft.trim() !== flowDraftMemo.trim(),
    [workspaceAiMemoDraft, flowDraftMemo],
  );

  const workspaceAiCoachTopics = useMemo(() => {
    if (!flowDraftInsights || !flowDraftMemo.trim()) return null;
    const langUi: "ko" | "en" = language === "ko" ? "ko" : "en";
    return formatCareNeedsGuideTopicsUi(flowDraftMemo, langUi);
  }, [flowDraftMemo, flowDraftInsights, language]);

  const workspaceCustomerOptions = useMemo(() => {
    return [...state.customers].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  }, [state.customers]);

  const quickTemplates = useMemo(() => {
    const tpls = [...state.templates];
    if (!selectedCustomer) return tpls.slice(0, 10);
    const stage = selectedCustomer.stage;
    const pay = (selectedCustomer.paymentType ?? "").toLowerCase();
    const scoreTpl = (t: MessageTemplate) => {
      let s = 0;
      const hay = `${t.title} ${t.body}`.toLowerCase();
      if (stage.includes("시승") && (hay.includes("시승") || hay.includes("방문"))) s += 2;
      if (stage.includes("견적") && hay.includes("견적")) s += 2;
      if (stage.includes("계약") && hay.includes("계약")) s += 2;
      if (pay && hay.includes(pay)) s += 2;
      if (hay.includes("중고")) s += 1;
      return s;
    };
    tpls.sort((a, b) => scoreTpl(b) - scoreTpl(a));
    return tpls.slice(0, 10);
  }, [state.templates, selectedCustomer]);

  const overviewStats = useMemo(() => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    let dueToday = 0;
    for (const a of state.nextActions) {
      if (a.doneAt) continue;
      if (!a.dueAt) continue;
      const when = new Date(a.dueAt);
      if (when >= dayStart && when <= dayEnd) dueToday++;
    }

    let highPotential = 0;
    for (const c of state.customers) {
      if (!shouldShowPurchaseIntentScore(c)) continue;
      const sx = scorePurchaseIntent(c);
      if (sx.grade === "S" || sx.grade === "A" || sx.percent >= 66) highPotential++;
    }

    const followUp = state.nextActions.filter((a) => !a.doneAt).length;

    const weekCut = new Date(Date.now() - 7 * 86400000).toISOString();
    let recentConsult = 0;
    for (const c of state.customers) {
      if (c.updatedAt >= weekCut) recentConsult++;
    }

    return { dueToday, highPotential, followUp, recentConsult };
  }, [state.customers, state.nextActions]);

  const dashboardTodayDueLines = useMemo(() => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const lines: string[] = [];
    for (const a of state.nextActions) {
      if (a.doneAt || !a.dueAt) continue;
      const when = new Date(a.dueAt);
      if (when < dayStart || when > dayEnd) continue;
      const c = state.customers.find((x) => x.id === a.customerId);
      lines.push(`${c?.name ?? "?"} — ${a.title} (${formatDateTime(a.dueAt)})`);
    }
    return lines;
  }, [state.customers, state.nextActions]);

  const dashboardRecentMemoLines = useMemo(() => {
    const sorted = [...state.customers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return sorted.slice(0, 6).map((c) => {
      const m = (c.memo ?? "").trim();
      return {
        id: c.id,
        name: c.name,
        excerpt: m ? m.slice(0, 120) : "(메모 없음)",
      };
    });
  }, [state.customers]);

  const showWorkspaceTabs = activeSection === "customers" || activeSection === "followup";
  const showSellerToolsRow =
    activeSection === "customers" ||
    activeSection === "followup" ||
    activeSection === "consulting" ||
    activeSection === "ai";
  const workspaceSalesStyleLabel = t(WORKSPACE_AI_STYLE_KEYS[workspaceSalesStyle]);
  const storageModeLabel =
    sync.mode === "cloud"
      ? sync.status === "error"
        ? `계정 동기화를 일시적으로 진행하지 못했습니다${sync.message ? ` (${sync.message})` : ""}. 잠시 후 다시 확인해 주세요.`
        : "로그인한 계정 기준으로 저장됩니다. 이 기기에서 고객·일정·메모를 수정하면 클라우드에 반영되며, 접속한 다른 기기와 맞춰집니다."
      : "현재 고객 정보는 이 기기 브라우저에 저장됩니다.\n다른 기기와 자동으로 동기화되지 않습니다.\n중요한 고객 정보는 별도로 백업해 주세요. (「일정」 등에서 백업 기능을 활용할 수 있습니다.)";

  useEffect(() => {
    if (activeSection === "followup") setTab("다음할일");
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "ai") setTab("고객");
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "customers") setTab("고객");
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "ai") return undefined;
    const tmr = window.setTimeout(() => {
      document.getElementById("crm-ai-assistant")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 140);
    return () => window.clearTimeout(tmr);
  }, [activeSection]);

  function upsertCustomer(patch: Partial<Customer> & { id: string }) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    if ("name" in patch && typeof patch.name === "string" && !patch.name.trim()) {
      showToast("고객명을 입력해 주세요.");
      return;
    }
    setState((prev) => {
      const now = nowIso();
      const exists = prev.customers.some((c) => c.id === patch.id);
      if (!exists) return prev;
      return {
        ...prev,
        customers: prev.customers.map((c) => {
          if (c.id !== patch.id) return c;
          const merged = { ...c, ...patch, updatedAt: now } as Customer;
          if ("paymentType" in patch && patch.paymentType === undefined) {
            delete merged.paymentType;
          }
          return merged;
        }),
      };
    });

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void upsertCustomerCloud(uid, patch)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => {
          setSync({ mode: "cloud", status: "error", message: String(e) });
          showToast(`고객 정보를 저장하지 못했습니다: ${String(e)}`);
        });
    }
  }

  function openCreateCustomerModal() {
    if (!uid) {
      openPreviewGate();
      return;
    }
    setCreateCustomerDraft({ ...CREATE_CUSTOMER_INITIAL });
    setCreateCustomerOpen(true);
  }

  function handleSelectCustomerSearchResult(customerId: string) {
    setSearchQuery("");
    setSearchOpen(false);
    setSelectedCustomerId(customerId);
    onActiveSectionChange("customers");
    setTab("고객");
    window.setTimeout(() => {
      document.getElementById("crm-detail-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function handleOpenAiAssistantFromSearch() {
    setSearchQuery("");
    setSearchOpen(false);
    onActiveSectionChange("ai");
  }

  function handleOpenCreateCustomerFromSearch() {
    setSearchQuery("");
    setSearchOpen(false);
    onActiveSectionChange("customers");
    openCreateCustomerModal();
  }

  function handleOpenSeasonCareFromSearch() {
    setSearchQuery("");
    setSearchOpen(false);
    onActiveSectionChange("customers");
    setTab("템플릿");
    window.setTimeout(() => {
      document.getElementById("season-care")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function handleOpenDeliveryGuideFromSearch() {
    setSearchQuery("");
    setSearchOpen(false);
    onActiveSectionChange("customers");
    setTab("고객");
    window.setTimeout(() => {
      if (selectedCustomerId) {
        setDeliveryGuideOpen(true);
        document.getElementById("crm-detail-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document.getElementById("crm-detail-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("출고 안내를 열려면 고객을 먼저 선택해 주세요.");
      }
    }, 60);
  }

  function handleOpenFollowupFromSearch() {
    setSearchQuery("");
    setSearchOpen(false);
    onActiveSectionChange("followup");
    window.setTimeout(() => {
      document.getElementById("crm-workspace-next")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }

  function handleOpenCustomerListFromSearch() {
    setSearchQuery("");
    setSearchOpen(false);
    onActiveSectionChange("customers");
    setTab("고객");
    window.setTimeout(() => {
      document.getElementById("crm-customer-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function activateSearchFeature(id: CrmSearchFeatureId) {
    switch (id) {
      case "ai-assistant":
        handleOpenAiAssistantFromSearch();
        break;
      case "create-customer":
        handleOpenCreateCustomerFromSearch();
        break;
      case "season-care":
        handleOpenSeasonCareFromSearch();
        break;
      case "delivery":
        handleOpenDeliveryGuideFromSearch();
        break;
      case "followup":
        handleOpenFollowupFromSearch();
        break;
      case "customer-list":
        handleOpenCustomerListFromSearch();
        break;
      default:
        break;
    }
  }

  function closeCreateCustomerModal() {
    setCreateCustomerOpen(false);
    setCreateCustomerDraft({ ...CREATE_CUSTOMER_INITIAL });
  }

  async function submitCreateCustomer() {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const d = createCustomerDraftRef.current;
    const nameTrim = d.name.trim();
    if (!nameTrim) {
      showToast("고객명을 입력해 주세요.");
      return;
    }

    const id = makeId("cus");
    const t = nowIso();
    const brandStr = (d.vehicleBrand ?? "").trim();
    const vehicleBrand = brandStr ? (brandStr as VehicleBrandId) : undefined;

    const customer: Customer = {
      id,
      createdAt: t,
      updatedAt: t,
      name: nameTrim,
      phone: d.phone.trim() ? d.phone.trim() : undefined,
      leadSource: d.leadSource,
      stage: d.stage,
      vehicleBrand,
      interestedModel: d.interestedModel.trim() ? d.interestedModel.trim() : undefined,
      memo: d.memo.trim() ? d.memo.trim() : undefined,
      nextContactAt: d.nextContactAt,
    };
    const nextLine = d.nextActionText.trim();

    const finishSuccess = () => {
      pendingCustomerCreatesRef.current.add(id);
      setState((prev) => ({ ...prev, customers: [customer, ...prev.customers] }));
      setSelectedCustomerId(id);
      onActiveSectionChange("customers");
      setTab("고객");
      setCreateCustomerOpen(false);
      setCreateCustomerDraft({ ...CREATE_CUSTOMER_INITIAL });
      showToast("고객이 추가되었습니다.");
      if (nextLine) addNextAction(id, nextLine, { skipTabSwitch: true });
    };

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      try {
        await createCustomerCloud(uid, customer);
        setSync({ mode: "cloud", status: "idle" });
        finishSuccess();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setSync({ mode: "cloud", status: "error", message: msg });
        showToast(`저장하지 못했습니다. 다시 시도해 주세요. (${msg})`);
      }
    } else {
      finishSuccess();
    }
  }

  function buildCustomerFromImportedDraft(draft: NormalizedImportedContact): Customer {
    const t = nowIso();
    return {
      id: makeId("cus"),
      createdAt: t,
      updatedAt: t,
      name: draft.name,
      phone: draft.phone,
      email: draft.email,
      memo: draft.memoRaw,
      /** 상담·관심차량 입력 전: 목록 가망·등급은 표시하지 않음 */
      interestedModel: undefined,
      compareVehicles: undefined,
      leadSource: "주소록 가져오기",
      stage: "연락처 가져옴",
    };
  }

  function handleCommitImportContactsHub(payload: ImportContactsCommitPayload) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const t = nowIso();
    const mergeIds = [...new Set(payload.merges.map((m) => m.customerId))];

    setState((prev) => {
      const nextCustomers = computeCustomersAfterContactImport(prev.customers, payload, t);
      payload.creates.forEach((c) => pendingCustomerCreatesRef.current.add(c.id));

      if (uid) {
        queueMicrotask(() => {
          setSync({ mode: "cloud", status: "syncing" });
          void Promise.all([
            ...payload.creates.map((c) => createCustomerCloud(uid!, c)),
            ...mergeIds.map((id) => {
              const memo = nextCustomers.find((c) => c.id === id)?.memo;
              return upsertCustomerCloud(uid!, { id, memo });
            }),
          ])
            .then(() => setSync({ mode: "cloud", status: "idle" }))
            .catch((e) => {
              setSync({ mode: "cloud", status: "error", message: String(e) });
              showToast(`클라우드 동기화에 실패했을 수 있습니다. (${String(e)})`);
            });
        });
      }

      return { ...prev, customers: nextCustomers };
    });

    setSelectedCustomerId((sel) => payload.creates[0]?.id ?? mergeIds[0] ?? sel);
    setTab("고객");

    for (const c of payload.creates) {
      addNextAction(c.id, "상담 메모 입력 필요", { skipTabSwitch: true });
    }

    showToast(
      payload.creates.length || payload.merges.length ?
        `주소록 반영: 신규 ${payload.creates.length}명, 메모 병합 ${payload.merges.length}건`
      : "저장된 변경이 없습니다.",
    );
  }

  function deleteCustomer(id: string) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    pendingCustomerCreatesRef.current.delete(id);
    setState((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== id),
      nextActions: prev.nextActions.filter((a) => a.customerId !== id),
      events: prev.events.filter((e) => e.customerId !== id),
    }));
    setSelectedCustomerId((prev) => (prev === id ? null : prev));

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void deleteCustomerCloud(uid, id)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function addNextAction(
    customerId: string,
    titleOverride?: string,
    opts?: { skipTabSwitch?: boolean },
  ) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const raw = titleOverride?.trim();
    const title =
      raw && raw.length > 0
        ? raw.length > 140
          ? `${raw.slice(0, 137)}…`
          : raw
        : "다음 할 일";
    const t = nowIso();
    const action: NextAction = {
      id: makeId("act"),
      customerId,
      createdAt: t,
      dueAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      title,
    };
    setState((prev) => ({ ...prev, nextActions: [action, ...prev.nextActions] }));
    if (!opts?.skipTabSwitch) setTab("다음할일");

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void createNextActionCloud(uid, action)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function toggleNextActionDone(id: string) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const doneAt = state.nextActions.find((a) => a.id === id)?.doneAt ? undefined : nowIso();
    setState((prev) => ({
      ...prev,
      nextActions: prev.nextActions.map((a) =>
        a.id === id ? { ...a, doneAt } : a,
      ),
    }));

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void updateNextActionCloud(uid, id, { doneAt })
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function updateNextAction(id: string, patch: Partial<NextAction>) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    setState((prev) => ({
      ...prev,
      nextActions: prev.nextActions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void updateNextActionCloud(uid, id, patch)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function addEvent(customerId?: string) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const start = new Date();
    start.setMinutes(start.getMinutes() + 30);
    const ev: CalendarEvent = {
      id: makeId("evt"),
      customerId,
      startAt: start.toISOString(),
      title: "일정",
    };
    setState((prev) => ({ ...prev, events: [ev, ...prev.events] }));
    setTab("일정");

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void createEventCloud(uid, ev)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function updateEvent(id: string, patch: Partial<CalendarEvent>) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void updateEventCloud(uid, id, patch)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function addTemplate() {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const t = nowIso();
    const tpl: MessageTemplate = {
      id: makeId("tpl"),
      title: "새 템플릿",
      body: "안녕하세요 {고객명}님, ...",
      updatedAt: t,
    };
    setState((prev) => ({ ...prev, templates: [tpl, ...prev.templates] }));
    setTab("템플릿");

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void createTemplateCloud(uid, tpl)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function updateTemplate(id: string, patch: Partial<MessageTemplate>) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t,
      ),
    }));

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void updateTemplateCloud(uid, id, patch)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function exportCustomerSummary(customer: Customer) {
    if (!uid) {
      openPreviewGate();
      return;
    }
    const actions = state.nextActions.filter((a) => a.customerId === customer.id);
    const events = state.events.filter((e) => e.customerId === customer.id);
    const text = [
      `고객 요약`,
      `- 이름: ${customer.name}`,
      `- 연락처: ${customer.phone ?? "-"}`,
      `- 이메일: ${customer.email ?? "-"}`,
      `- 유입: ${customer.leadSource}`,
      `- 단계: ${customer.stage}`,
      `- 구매 예정 시기: ${customer.purchaseTiming ?? "-"}`,
      `- 다음 연락 예정일: ${customer.nextContactAt ? formatDateTime(customer.nextContactAt) : "-"}`,
      `- 브랜드: ${customer.vehicleBrand ?? "-"}`,
      `- 차종: ${customer.interestedModel ?? "-"}`,
      `- 비교 차량: ${customer.compareVehicles ?? "-"}`,
      `- 예산: ${customer.budget ?? "-"}`,
      `- 금융유형: ${customer.paymentType ?? "-"}`,
      `- 금융메모: ${customer.paymentNotes ?? "-"}`,
      `- 중고차: ${customer.usedCar ? JSON.stringify(customer.usedCar) : "-"}`,
      `- 시세메모: ${customer.marketPrice ? JSON.stringify(customer.marketPrice) : "-"}`,
      `- 비교·시세 정리: ${customer.comparisonNotes ?? "-"}`,
      `- 마지막 상담 메모: ${customer.memo ?? "-"}`,
      `- 고객 성향 메모: ${customer.personalityMemo ?? "-"}`,
      ``,
      `다음 할 일`,
      ...actions.map((a) => `- [${a.doneAt ? "완료" : "미완"}] ${a.title} (${formatDateTime(a.dueAt)})`),
      ``,
      `일정`,
      ...events.map((e) => `- ${e.title} (${formatDateTime(e.startAt)})`),
      ``,
      `업데이트: ${formatDateTime(customer.updatedAt)}`,
    ].join("\n");
    downloadText(`customer_${customer.name}_${customer.id}.txt`, text);
  }

  const myName = sellerNickname.trim() || sellerDisplayName?.trim() || "영업 담당";

  function renderTemplate(tpl: MessageTemplate, customer?: Customer | null) {
    const cName = customer?.name ?? "고객";
    return tpl.body.replaceAll("{고객명}", cName).replaceAll("{내이름}", myName);
  }

  const allNextActions = useMemo(() => {
    return [...state.nextActions].sort((a, b) => {
      const aKey = `${a.doneAt ? "1" : "0"}_${a.dueAt ?? ""}`;
      const bKey = `${b.doneAt ? "1" : "0"}_${b.dueAt ?? ""}`;
      return aKey.localeCompare(bKey);
    });
  }, [state.nextActions]);

  const allEvents = useMemo(() => {
    return [...state.events].sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [state.events]);

  return (
    <>
      <div id="crm-main" className="w-full min-w-0 pb-8 text-slate-100 lg:pb-10">
        <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-6 px-2 sm:px-4 xl:px-0">
          {!uid ? (
            <div
              className="sensora-premium-panel rounded-[18px] px-4 py-3.5 text-left text-[13px] leading-[1.6] text-slate-400 backdrop-blur-xl max-[390px]:px-3.5"
              role="status"
              aria-live="polite"
            >
              <p className="font-medium text-slate-100">{t("crm.demoContextNotice.primary")}</p>
              <p className="mt-2 text-[13px] leading-relaxed">{t("crm.demoContextNotice.secondary")}</p>
              <p className="mt-2 text-[13px] leading-relaxed font-medium text-slate-300">
                {t("crm.demoContextNotice.accessAfterBeta")}
              </p>
            </div>
          ) : null}
          <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="min-w-0">
              <h1 className="text-[clamp(22px,2.8vw,30px)] font-semibold leading-tight tracking-tight text-slate-50">
                {t("product.name")}
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-400">
                {!uid ? (
                  t("crm.previewMode.headerSubtitle")
                ) : (
                  <>
                    {sync.mode === "cloud" ? "클라우드 동기화" : "로컬 저장"} ·{" "}
                    {sync.status === "syncing"
                      ? "동기화 중…"
                      : sync.status === "error"
                        ? "동기화 오류"
                        : "정상"}{" "}
                    · v0.3
                  </>
                )}
              </p>
            </div>
            <div className="flex w-full min-w-0 flex-col gap-3 lg:max-w-[640px]">
              <div className="flex flex-col gap-3 rounded-[22px] border border-white/[0.12] bg-gradient-to-br from-slate-950/40 to-[#07111f]/45 p-3 shadow-[0_22px_52px_-28px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:flex-row sm:items-stretch sm:gap-3 sm:p-4">
                <button
                  type="button"
                  className="sensora-dark-ghost-btn inline-flex min-h-[44px] shrink-0 touch-manipulation items-center justify-center self-stretch rounded-xl px-4 py-2 text-[13px] font-semibold sm:min-w-[9.5rem]"
                  onClick={() => setSensoraTipIntroOpen(true)}
                >
                  {t("crm.sensoraTip.openButton")}
                </button>
              <div ref={crmSearchWrapRef} className="relative min-w-0 flex-1">
                <label className="block min-w-0">
                  <span className="sr-only">고객·기능 통합 검색</span>
                  <input
                    ref={searchInputRef}
                    type="search"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={searchQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearchQuery(v);
                      setSearchOpen(normalizeSearchFold(v).length >= 1);
                    }}
                    onFocus={() => {
                      if (normalizeSearchFold(searchQuery).length >= 1) setSearchOpen(true);
                    }}
                    placeholder={`고객명, 차량, AI비서, 시즌케어를 검색하세요 (${SEARCH_SHORTCUT_HINT})`}
                    title="어디서나 Ctrl+K (⌘K)로 포커스"
                    role="combobox"
                    aria-expanded={
                      searchOpen && normalizeSearchFold(searchQuery).length >= 1
                    }
                    aria-controls="crm-unified-search-results"
                    aria-autocomplete="list"
                    className="min-h-[44px] w-full rounded-[20px] border border-white/[0.14] bg-[#020817]/55 px-4 py-3 text-[15px] text-slate-100 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md transition placeholder:text-slate-500 focus:border-sky-400/38 focus:ring-2 focus:ring-sky-500/25"
                  />
                </label>
                {searchOpen && normalizeSearchFold(searchQuery).length >= 1 ? (
                  <div
                    id="crm-unified-search-results"
                    role="listbox"
                    className="pointer-events-auto absolute left-0 right-0 top-[calc(100%+4px)] z-50 flex max-h-[min(440px,calc(100vh-7rem))] flex-col overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#07111f]/97 shadow-[0_24px_56px_-20px_rgba(0,0,0,0.55)] backdrop-blur-md sm:max-h-[min(480px,calc(100vh-6rem))]"
                  >
                    <div className="max-h-[min(440px,calc(100vh-7rem))] overflow-y-auto overscroll-contain px-1 py-2 sm:max-h-[min(480px,calc(100vh-6rem))]">
                      {customerSearchResults.length === 0 && featureSearchResults.length === 0 ? (
                        <p className="px-4 py-8 text-center text-[14px] leading-relaxed text-slate-500">
                          고객명 또는 기능명을 입력해 주세요.
                        </p>
                      ) : (
                        <>
                          {customerSearchResults.length > 0 ? (
                            <div className="pb-2">
                              <div className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                고객
                              </div>
                              <ul className="space-y-0.5">
                                {customerSearchResults.map((c) => {
                                  const vehicle =
                                    [c.vehicleBrand, c.interestedModel].filter(Boolean).join(" ").trim() ||
                                    "—";
                                  return (
                                    <li key={c.id}>
                                      <button
                                        type="button"
                                        role="option"
                                        className="w-full rounded-[14px] px-3 py-2.5 text-left text-[15px] font-semibold leading-snug text-slate-100 transition hover:bg-white/[0.06]"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectCustomerSearchResult(c.id)}
                                      >
                                        <span className="text-slate-500">[고객]</span> {c.name} · {vehicle} ·{" "}
                                        <span className="font-medium text-slate-400">
                                          {maskPhoneForSearchList(c.phone)}
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : null}
                          {featureSearchResults.length > 0 ? (
                            <div className={customerSearchResults.length > 0 ? "border-t border-white/[0.08] pt-2" : ""}>
                              <div className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                바로가기
                              </div>
                              <ul className="space-y-0.5">
                                {featureSearchResults.map((f) => (
                                  <li key={f.id}>
                                    <button
                                      type="button"
                                      role="option"
                                      className="flex w-full flex-col rounded-[14px] px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => activateSearchFeature(f.id)}
                                    >
                                      <span className="text-[15px] font-semibold leading-snug text-slate-100">
                                        <span className="text-slate-500">[바로가기]</span> {f.title}
                                      </span>
                                      <span className="mt-1 text-[13px] leading-relaxed text-slate-500">
                                        {f.subtitle}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="sensora-premium-primary-workspace min-h-[44px] shrink-0 rounded-[20px] px-5 py-3 text-[15px] font-semibold sm:w-auto sm:whitespace-nowrap touch-manipulation focus:outline-none"
                onClick={openCreateCustomerModal}
              >
                + {t("crm.addCustomer")}
              </button>
              </div>
            </div>
          </header>

          <div
            id="crm-section-title"
            className="sensora-premium-panel scroll-mt-24 rounded-[22px] px-4 py-3.5 shadow-[0_22px_48px_-26px_rgba(0,0,0,0.48)] backdrop-blur-xl max-[390px]:px-3.5 max-[390px]:py-3 lg:hidden"
          >
            <p className="text-[18px] font-bold tracking-tight text-slate-50">{CRM_SECTION_LABELS[activeSection].title}</p>
            <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-400">
              {t(CRM_SECTION_MOBILE_SUBTITLE_KEYS[activeSection])}
            </p>
          </div>

          {showSellerToolsRow ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-between">
              <label className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="whitespace-nowrap text-[13px] font-semibold text-slate-300">
                  내 이름 · 템플릿 치환
                </span>
                <input
                  value={sellerNickname}
                  onChange={(e) => persistSellerNickname(e.target.value)}
                  placeholder="예: 김실장"
                  className="max-w-xs flex-1 rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-2.5 text-[15px] text-slate-50 outline-none placeholder:text-slate-500 focus:border-sky-400/45"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-[44px] rounded-[20px] border border-white/[0.11] bg-slate-950/45 px-5 py-2.5 text-[14px] font-semibold text-slate-50 ring-1 ring-inset ring-white/[0.12] transition hover:bg-white/[0.08] touch-manipulation"
                  onClick={() => openCustomersImportHub()}
                >
                  주소록 가져오기
                </button>
                {selectedCustomer ? (
                  <button
                    type="button"
                    className="min-h-[44px] rounded-[20px] border border-white/[0.11] bg-slate-950/55 px-5 py-2.5 text-[14px] font-semibold text-slate-300 transition hover:bg-slate-950/45 touch-manipulation"
                    onClick={() => setDeliveryGuideOpen(true)}
                  >
                    출고 안내
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {showWorkspaceTabs ? (
            <nav
              className="flex flex-wrap gap-1 border-b border-white/[0.11]"
              aria-label="업무 영역"
            >
              {(["고객", "다음할일", "일정", "템플릿"] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setTab(tabKey)}
                  className={[
                    "min-h-[44px] -mb-px touch-manipulation px-5 py-3 text-[14px] font-semibold outline-none transition focus-visible:rounded-t-lg focus-visible:ring-2 focus-visible:ring-sky-400/35",
                    tab === tabKey
                      ? "border-b-2 border-sky-400/75 text-slate-50 shadow-[0_12px_24px_-16px_rgba(56,189,248,0.12)]"
                      : "border-b-2 border-transparent text-slate-400 hover:text-slate-200",
                  ].join(" ")}
                >
                  {TAB_LABELS[tabKey]}
                </button>
              ))}
            </nav>
          ) : null}

          {activeSection === "customers" && tab === "고객" ? (
            <CrmMiniCalendar
              customers={state.customers}
              nextActions={state.nextActions}
              events={state.events}
              onPickCustomer={(id) => {
                setSelectedCustomerId(id);
                setTab("고객");
                window.setTimeout(() => {
                  document.getElementById("crm-detail-panel")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 50);
              }}
            />
          ) : null}

          {activeSection === "dashboard" ? (
            <div id="crm-section-dashboard" className="scroll-mt-24">
              <DashboardSection
                todayFollowUps={overviewStats.dueToday}
                highPotential={overviewStats.highPotential}
                followUpOpen={overviewStats.followUp}
                recentConsult={overviewStats.recentConsult}
                customers={state.customers}
                nextActions={state.nextActions}
                events={state.events}
                todayDueLines={dashboardTodayDueLines}
                recentMemoLines={dashboardRecentMemoLines}
                onPickCustomer={(id) => setSelectedCustomerId(id)}
                onGoSection={onActiveSectionChange}
              />
            </div>
          ) : null}

          {activeSection === "consulting" ? (
            <ConsultingNotesSection
              customers={state.customers}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomerId={setSelectedCustomerId}
              memoDraft={workspaceAiMemoDraft}
              onMemoDraftChange={setWorkspaceAiMemoDraft}
              onSaveMemo={() => {
                if (!selectedCustomerId) return;
                upsertCustomer({ id: selectedCustomerId, memo: workspaceAiMemoDraft });
                showToast("상담 메모를 저장했습니다.");
              }}
              onGoAi={() => onActiveSectionChange("ai")}
              disabledSave={
                !selectedCustomerId ||
                workspaceAiMemoDraft.trim() === (selectedCustomer?.memo ?? "").trim()
              }
            />
          ) : null}

          {activeSection === "pipeline" ? (
            <PipelineSection
              customers={state.customers}
              onSelectCustomer={(id) => {
                setSelectedCustomerId(id);
                onActiveSectionChange("customers");
              }}
            />
          ) : null}

          {activeSection === "vehicle" ? (
            <VehicleMatchSection
              customer={selectedCustomer}
              memoForAnalysis={selectedCustomer?.memo ?? ""}
              onOpenCustomers={() => onActiveSectionChange("customers")}
            />
          ) : null}

          {activeSection === "settings" ? (
            <SettingsSection
              sellerNickname={sellerNickname}
              onNicknameChange={persistSellerNickname}
              workspaceSalesStyleLabel={workspaceSalesStyleLabel}
              storageModeLabel={storageModeLabel}
              onShowCover={() => window.dispatchEvent(new CustomEvent("crm-show-notebook-cover"))}
              onOpenLanding={onOpenLandingView}
              onOpenContactImportGuide={() => setContactFileGuideOpen(true)}
              onOpenAddressBookImport={openCustomersImportHub}
            />
          ) : null}

          {activeSection === "ai" ? (
            <AiSecretarySection>
              <CrmAiAssistantPanel
                t={t}
                workspaceAiCoachTopics={workspaceAiCoachTopics}
                workspaceAiBusy={workspaceAiBusy}
                selectedCustomerId={selectedCustomerId}
                onCustomerIdChange={setSelectedCustomerId}
                workspaceCustomerOptions={workspaceCustomerOptions}
                workspaceSalesStyle={workspaceSalesStyle}
                onWorkspaceSalesStyleChange={setWorkspaceSalesStyle}
                workspaceAiMemoDraft={workspaceAiMemoDraft}
                onWorkspaceAiMemoDraftChange={setWorkspaceAiMemoDraft}
                memoDiffersFromFlowSnapshot={memoDiffersFromFlowSnapshot}
                flowDraftMemo={flowDraftMemo}
                flowDraftInsights={flowDraftInsights}
                onAnalyzeOrRefresh={runSensoraFlowAnalyzeOrRefresh}
                onNewProposal={runSensoraFlowNewProposal}
                onRewriteSmsDraft={runSensoraFlowRewriteSmsDraft}
                onCopySms={() => {
                  const text = flowDraftInsights?.message.trim();
                  if (!text || !selectedCustomerId) return;
                  void copyToClipboard(text).then((ok) => {
                    if (ok) showToast(t("crm.workspaceAi.smsCopyToast"));
                    else showToast(t("crm.seasonCare.copyFail"));
                  });
                }}
                onSaveMemoToCrm={() => {
                  if (!selectedCustomerId) return;
                  upsertCustomer({ id: selectedCustomerId, memo: workspaceAiMemoDraft });
                  smsRewriteNonceRef.current = 0;
                  const trimmed = workspaceAiMemoDraft.trim();
                  setFlowDraftMemo(trimmed);
                  setFlowDraftInsights(null);
                  showToast(t("crm.workspaceAi.saveToast"));
                }}
                onCreateFollowUpFromInsights={() => {
                  if (!selectedCustomerId || !flowDraftInsights) return;
                  const raw = flowDraftInsights.nextAction
                    .split("\n")
                    .map((ln) => ln.trim())
                    .find((ln) => ln.length > 0);
                  const line =
                    raw?.replace(/^[-•*]\s*/, "") ?? t("crm.workspaceAi.followUpDefaultTitle");
                  addNextAction(selectedCustomerId, line);
                  showToast(t("crm.workspaceAi.followUpToast"));
                }}
              />
            </AiSecretarySection>
          ) : null}

          {showWorkspaceTabs && tab === "고객" ? (
            <CustomersSection>
            <div className="flex min-w-0 flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1.06fr)_minmax(336px,0.94fr)] xl:items-start xl:gap-8">
              <div
                id="crm-customer-table"
                className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.11] bg-slate-950/55 shadow-[0_1px_4px_rgba(15,23,42,0.04)] xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-13rem)] xl:overflow-auto"
              >
                <div className="border-b border-white/[0.11] px-5 py-5 sm:px-6">
                  <h2 className="text-[18px] font-semibold text-slate-50">{t("crm.section.customerList")}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
                    고객 행을 눌러 선택합니다. 선택 시 오른쪽에서 상세·상담·다음 연락까지 이어서 다룹니다.
                  </p>
                </div>
                <div className="overflow-x-auto xl:overflow-y-auto xl:[max-height:calc(100vh-20rem)]">
                  <table className="min-w-[880px] w-full border-collapse text-left">
                    <thead className="sticky top-0 z-[2] backdrop-blur-sm">
                      <tr className="border-b border-white/[0.11] bg-slate-900/92 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.08)]">
                        <th className="px-5 py-4 text-[12px] font-semibold tracking-[-0.01em] text-slate-400 sm:px-6">
                          고객명
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold tracking-[-0.01em] text-slate-400 sm:px-6">
                          {t("common.interestedVehicle")}
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold tracking-[-0.01em] text-slate-400 sm:px-6">
                          {t("common.status")}
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold tracking-[-0.01em] text-slate-400 sm:px-6">
                          {t("crm.section.nextAction")}
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold tracking-[-0.01em] text-slate-400 sm:px-6">
                          {t("common.potential")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.09]">
                      {customersFiltered.map((c) => {
                        const na = state.nextActions.find((a) => a.customerId === c.id && !a.doneAt);
                        const nextLbl = na?.title?.trim()
                          ? na.title
                          : c.nextContactAt
                            ? formatDateTime(c.nextContactAt)
                            : "—";
                        const sx = scorePurchaseIntent(c);
                        const showScore = shouldShowPurchaseIntentScore(c);
                        return (
                          <tr
                            key={c.id}
                            className={
                              selectedCustomerId === c.id
                                ? "bg-sky-950/20"
                                : "bg-slate-950/55 hover:bg-white/[0.04]"
                            }
                          >
                            <td className="px-5 py-4 align-top sm:px-6">
                              <button
                                type="button"
                                className="text-left font-semibold text-slate-50 text-[16px] leading-snug hover:underline"
                                onClick={() => setSelectedCustomerId(c.id)}
                              >
                                {c.name}
                              </button>
                              <div className="mt-1 text-[14px] font-medium text-slate-400">
                                {c.phone?.trim() || "연락처 없음"}
                              </div>
                            </td>
                            <td className="max-w-[220px] px-5 py-4 align-top text-[15px] text-slate-300 sm:px-6">
                              {[c.vehicleBrand, c.interestedModel].filter(Boolean).join(" ") || "—"}
                            </td>
                            <td className="px-5 py-4 align-top text-[15px] font-semibold text-slate-50 sm:px-6">
                              {c.stage}
                            </td>
                            <td className="max-w-[260px] px-5 py-4 align-top text-[14px] leading-snug text-slate-400 sm:px-6">
                              {clampText(nextLbl, 90)}
                            </td>
                            <td className="px-5 py-4 align-top sm:px-6">
                              {showScore ? (
                                <button
                                  type="button"
                                  title="산정 기준"
                                  className="text-[15px] font-semibold text-slate-300 underline decoration-white/25 underline-offset-[5px] hover:text-slate-50"
                                  onClick={() => setLeadExplainForId(c.id)}
                                >
                                  {sx.percent}% · {sx.grade}
                                </button>
                              ) : (
                                <span className="text-[15px] font-medium text-slate-400">분석 전 · —</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {customersFiltered.length === 0 ? (
                  <div className="border-t border-white/[0.11] px-8 py-14 text-center">
                    <p className="text-[18px] font-semibold text-slate-50">등록된 고객이 없습니다</p>
                    <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-400">
                      첫 고객을 추가하거나 「주소록 가져오기」로 불러와 상담과 일정을 이어 가 보세요.
                    </p>
                    <button
                      type="button"
                      className="sensora-premium-primary-workspace mt-8 rounded-xl px-6 py-3 text-[15px] font-semibold touch-manipulation"
                      onClick={openCreateCustomerModal}
                    >
                      고객 추가하기
                    </button>
                  </div>
                ) : null}
              </div>

              <section
                id="crm-detail-panel"
                tabIndex={-1}
                className="flex min-h-[48vh] min-w-0 flex-col gap-4 xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto"
              >
                <header id="crm-detail-header" className="scroll-mt-28 rounded-[22px] border border-white/[0.11] bg-slate-950/55 px-5 py-4 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[22px] font-semibold tracking-tight text-slate-50">
                        {selectedCustomer ? selectedCustomer.name : t("crm.section.customerDetails")}
                      </div>
                      <div className="mt-2 text-[15px] text-slate-400">
                        {selectedCustomer
                          ? `${selectedCustomer.phone?.trim() || "연락처 미입력"} · 마지막 기록 ${formatDateTime(selectedCustomer.updatedAt)}`
                          : "목록에서 고객을 선택하거나 새로 추가합니다."}
                      </div>
                      {selectedCustomer?.phone?.trim() ? (
                        <button
                          type="button"
                          className="mt-3 rounded-lg bg-white/[0.07] px-4 py-2 text-[13px] font-semibold text-slate-300 ring-1 ring-inset ring-white/[0.12] hover:bg-white/[0.1]"
                          onClick={() =>
                            void copyToClipboard(selectedCustomer.phone!.trim()).then((ok) =>
                              ok ? showToast("전화번호를 복사했습니다.") : alert(selectedCustomer.phone),
                            )
                          }
                        >
                          {t("common.copy")}
                        </button>
                      ) : null}
                    </div>
                    {selectedCustomer ? (
                      <div className="flex flex-shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryGuideOpen(true)}
                          className="rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-2.5 text-[13px] font-semibold text-slate-50 hover:bg-slate-950/45"
                        >
                          출고 안내
                        </button>
                        <button
                          type="button"
                          onClick={() => addNextAction(selectedCustomer.id)}
                          className="min-h-[44px] rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/[0.08] touch-manipulation"
                        >
                          + 연락
                        </button>
                        <button
                          type="button"
                          onClick={() => addEvent(selectedCustomer.id)}
                          className="min-h-[44px] rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/[0.08] touch-manipulation"
                        >
                          + 일정
                        </button>
                        <button
                          type="button"
                          onClick={() => exportCustomerSummary(selectedCustomer)}
                          className="sensora-premium-primary-workspace min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-semibold touch-manipulation"
                        >
                          요약
                        </button>
                      </div>
                    ) : null}
                  </div>
                </header>

                <div className="rounded-[18px] border border-white/[0.11] bg-slate-950/38 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  <p className="text-[12px] font-medium leading-relaxed text-slate-400">
                    상담 메모 분석과 발송 문자 초안은 <span className="font-semibold text-slate-300">Sensora AI 비서</span> 화면에서
                    진행합니다. 메모는 고객 카드 또는 상담 메뉴에서 직접 수정합니다.
                  </p>
                  <button
                    type="button"
                    className="sensora-premium-primary-workspace mt-3 min-h-[44px] rounded-xl px-4 py-2 text-[13px] font-semibold touch-manipulation"
                    onClick={() => onActiveSectionChange("ai")}
                  >
                    AI 비서 열기
                  </button>
                </div>

                <div className="flex flex-col gap-4">
          {selectedCustomer ? (
            <>
              {memoFeedback ? (
                <div className="rounded-[22px] border border-white/[0.11] bg-gradient-to-b from-slate-950/70 to-[#07111f]/72 px-5 py-4 shadow-[0_22px_48px_-26px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="text-[12px] font-semibold tracking-[-0.01em] text-slate-300">
                      {t("crm.section.aiRecommendation")}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeliveryGuideOpen(true)}
                      className="sensora-premium-primary-workspace rounded-lg px-3 py-1.5 text-[12px] font-semibold touch-manipulation"
                    >
                      출고 안내
                    </button>
                  </div>
                  <ul className="mt-4 space-y-3 text-[16px] leading-relaxed text-slate-50">
                    {memoFeedback.bullets.slice(0, 5).map((b) => (
                      <li key={b}>· {b}</li>
                    ))}
                  </ul>
                  {memoFeedback.risks.length ? (
                    <div className="mt-4 rounded-xl bg-sky-950/20 px-4 py-3 text-[13px] text-slate-400">
                      <span className="font-semibold text-slate-300">점검: </span>
                      {memoFeedback.risks.slice(0, 3).join(" · ")}
                    </div>
                  ) : null}
                  {memoFeedback.nextQuestions[0] ? (
                    <>
                      <p className="mt-5 text-[13px] font-semibold text-slate-300">다음 연락 때 질문</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
                        {memoFeedback.nextQuestions[0]}
                      </p>
                    </>
                  ) : null}
                </div>
              ) : null}

              <details
                open
                className="scroll-mt-24 rounded-[22px] border border-white/[0.11] bg-slate-950/55 px-5 py-4 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] sm:p-5"
              >
                <summary className="list-none rounded-xl px-1 py-2 outline-none transition hover:bg-slate-950/38 focus-visible:ring-2 focus-visible:ring-sky-400/35 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold tracking-[-0.01em] text-slate-300">
                      {t("crm.section.consultationSummary")} · 고객 메시지
                    </div>
                    <div className="mt-2 text-[14px] leading-relaxed text-slate-400">
                      상담/예산/차량 메모를 바탕으로 자동으로 정리됩니다. 필요하면 문장을 수정해도 됩니다.
                    </div>
                  </div>
                  <span className="sr-only">드래프트 문자 영역 접기 또는 펼치기</span>
                </summary>
                <div className="border-t border-white/[0.08] pt-4">
                  {(() => {
                  const q = buildUsedCarSearchQuery(selectedCustomer);
                  const lines: string[] = [];
                  lines.push(`안녕하세요 ${selectedCustomer.name}님. ${myName}입니다.`);
                  if (
                    selectedCustomer.usedCar?.brand ||
                    selectedCustomer.usedCar?.model ||
                    selectedCustomer.interestedModel
                  ) {
                    lines.push(`말씀주신 차량: ${q}`);
                  }
                  if (selectedCustomer.marketPrice?.encarMin || selectedCustomer.marketPrice?.encarMax) {
                    const mn = selectedCustomer.marketPrice?.encarMin?.trim();
                    const mx = selectedCustomer.marketPrice?.encarMax?.trim();
                    if (mn && mx)
                      lines.push(
                        `시세는 대략 ${mn} ~ ${mx} 범위로 확인됩니다(기준: ${selectedCustomer.marketPrice?.asOf ?? "최근"}).`,
                      );
                    else if (mn)
                      lines.push(
                        `최저 시세는 대략 ${mn}로 확인됩니다(기준: ${selectedCustomer.marketPrice?.asOf ?? "최근"}).`,
                      );
                    else if (mx)
                      lines.push(
                        `최고 시세는 대략 ${mx}로 확인됩니다(기준: ${selectedCustomer.marketPrice?.asOf ?? "최근"}).`,
                      );
                  }
                  if (selectedCustomer.budget?.trim()) {
                    lines.push(`예산: ${selectedCustomer.budget.trim()}`);
                  }
                  lines.push(
                    `추가로 사고/보험이력(성능점검)까지 확인해서 안내드릴게요. 편하실 때 통화 가능 시간 부탁드립니다.`,
                  );
                  const text = lines.filter(Boolean).join("\n");
                  return (
                    <>
                      <textarea
                        rows={7}
                        className="mt-4 w-full min-h-[144px] resize-y rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-3 text-[14px] text-slate-300 outline-none focus:border-sky-400/45"
                        value={text}
                        readOnly
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="sensora-premium-primary-workspace min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-semibold touch-manipulation"
                          onClick={() => {
                            void copyToClipboard(text).then((ok) => {
                              if (ok) showToast("문자 내용 복사 완료");
                              else alert(text);
                            });
                          }}
                        >
                          {t("common.copy")}
                        </button>
                      </div>
                    </>
                  );
                })()}
                </div>
              </details>

              <div className="flex flex-col gap-4">
                <details
                  id="crm-block-budget"
                  className="scroll-mt-24 rounded-2xl border border-white/[0.11] bg-slate-950/55 p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-1.5 outline-none transition hover:bg-slate-950/45">
                    <div>
                      <div className="text-[16px] font-semibold text-slate-50">{t("crm.financeMarketInfo")}</div>
                      <div className="mt-1 text-[13px] text-slate-400">필요할 때 펼쳐서 입력·확인</div>
                    </div>
                    <span className="rounded-full border border-white/[0.11] bg-white/[0.07] px-3 py-1 text-[12px] font-semibold text-slate-300">
                      펼치기
                    </span>
                  </summary>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <div className="text-xs font-semibold text-slate-300">금융 유형</div>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_TYPE_OPTIONS.map((pt) => (
                          <button
                            key={pt}
                            type="button"
                            className={[
                              "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                              selectedCustomer.paymentType === pt
                                ? "border-sky-400/45 bg-sky-500/12 text-slate-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_28px_-14px_rgba(56,189,248,0.12)]"
                                : "border-white/[0.11] bg-slate-950/55 text-slate-300 hover:bg-white/[0.08]",
                            ].join(" ")}
                            onClick={() =>
                              upsertCustomer({ id: selectedCustomer.id, paymentType: pt })
                            }
                          >
                            {pt}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="rounded-full border border-dashed border-slate-500/35 px-3 py-1.5 text-[12px] font-semibold text-slate-400 hover:bg-white/[0.08]"
                          onClick={() =>
                            upsertCustomer({ id: selectedCustomer.id, paymentType: undefined })
                          }
                        >
                          미정
                        </button>
                      </div>
                    </div>

                    <Field
                      label="예산"
                      value={selectedCustomer.budget ?? ""}
                      placeholder="예: 3,800만원 또는 3800"
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, budget: v })}
                    />
                    {budgetWonSelected ? (
                      <div className="text-[12px] text-slate-400">
                        해석: 약{" "}
                        <span className="font-semibold text-slate-50">
                          {formatKrwShort(budgetWonSelected)}원
                        </span>{" "}
                        전후로 읽었습니다.
                      </div>
                    ) : null}

                    <div
                      id="crm-block-compare"
                      tabIndex={-1}
                      className="scroll-mt-24 rounded-xl border border-white/[0.11] bg-slate-950/45 p-4"
                    >
                      <div className="text-xs font-semibold text-slate-50">
                        예산 기준 비교 차종(참고)
                      </div>
                      {budgetRecs.length ? (
                        <ul className="mt-2 space-y-2 text-xs text-slate-300">
                          {budgetRecs.map((pick) => (
                            <li
                              key={pick.label}
                              className="flex flex-col gap-2 rounded-lg border border-white/[0.11] bg-slate-950/55 p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="font-semibold">{pick.label}</div>
                                {pick.note ? (
                                  <div className="mt-0.5 text-[12px] text-slate-400">
                                    {pick.note}
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-2.5 py-1 text-[12px] font-semibold hover:bg-white/[0.08]"
                                  onClick={() =>
                                    upsertCustomer({
                                      id: selectedCustomer.id,
                                      interestedModel: pick.label,
                                    })
                                  }
                                >
                                  관심차종으로
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-2.5 py-1 text-[12px] font-semibold hover:bg-white/[0.08]"
                                  onClick={() => {
                                    const line = `- ${pick.label}${pick.note ? ` (${pick.note})` : ""}\n`;
                                    upsertCustomer({
                                      id: selectedCustomer.id,
                                      comparisonNotes: `${selectedCustomer.comparisonNotes ?? ""}${line}`,
                                    });
                                  }}
                                >
                                  비교메모에 추가
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-2 text-xs text-slate-400">
                          예산을 숫자로 적으면 이 구간에 비교 후보가 나옵니다.
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/[0.11] bg-slate-950/45 p-4">
                      <div className="text-xs font-semibold text-slate-50">
                        시세 메모(직접 확인 값)
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field
                          label="시세 최저(만원/원)"
                          value={selectedCustomer.marketPrice?.encarMin ?? ""}
                          placeholder="예: 2100만"
                          onChange={(v) =>
                            upsertCustomer({
                              id: selectedCustomer.id,
                              marketPrice: {
                                ...(selectedCustomer.marketPrice ?? {}),
                                encarMin: v,
                              },
                            })
                          }
                        />
                        <Field
                          label="시세 최고(만원/원)"
                          value={selectedCustomer.marketPrice?.encarMax ?? ""}
                          placeholder="예: 2350만"
                          onChange={(v) =>
                            upsertCustomer({
                              id: selectedCustomer.id,
                              marketPrice: {
                                ...(selectedCustomer.marketPrice ?? {}),
                                encarMax: v,
                              },
                            })
                          }
                        />
                        <Field
                          label="시세 기준일"
                          value={selectedCustomer.marketPrice?.asOf ?? ""}
                          placeholder="예: 2026-04-29"
                          onChange={(v) =>
                            upsertCustomer({
                              id: selectedCustomer.id,
                              marketPrice: { ...(selectedCustomer.marketPrice ?? {}), asOf: v },
                            })
                          }
                        />
                      </div>
                      {marketSummaryLines.length ? (
                        <ul className="mt-3 list-disc space-y-1 pl-4 text-[12px] text-slate-300">
                          {marketSummaryLines.map((line, i) => (
                            <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <TextArea
                      label="마지막 상담 메모"
                      value={selectedCustomer.memo ?? ""}
                      placeholder="상담 내용/특이사항, 협상 포인트, 고객이 말한 핵심 문장 등을 빠르게 정리"
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, memo: v })}
                    />

                    <div id="crm-block-memo" tabIndex={-1} className="scroll-mt-24" />

                    <TextArea
                      label="고객 성향 메모"
                      value={selectedCustomer.personalityMemo ?? ""}
                      placeholder="예: 결정 빠름/신중함, 가격 민감, 가족 동승, 연락 선호 시간 등"
                      onChange={(v) =>
                        upsertCustomer({ id: selectedCustomer.id, personalityMemo: v })
                      }
                    />

                    <button
                      onClick={() => deleteCustomer(selectedCustomer.id)}
                      className="mt-2 rounded-lg border border-white/[0.11] bg-slate-950/45 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.08]"
                    >
                      고객 삭제
                    </button>
                  </div>
                </details>

                <details
                  id="crm-block-used-car"
                  className="scroll-mt-24 rounded-2xl border border-white/[0.11] bg-slate-950/55 p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-1.5 outline-none transition hover:bg-slate-950/45">
                    <div>
                      <div className="text-[16px] font-semibold text-slate-50">{t("crm.tradeInSummary")}</div>
                      <div className="mt-1 text-[13px] text-slate-400">검색어 생성 · 연식/주행/사고 기록</div>
                    </div>
                    <span className="rounded-full border border-white/[0.11] bg-white/[0.07] px-3 py-1 text-[12px] font-semibold text-slate-300">
                      펼치기
                    </span>
                  </summary>
                  <div className="mt-4 rounded-xl border border-white/[0.11] bg-slate-950/55 p-4">
                    <div className="text-xs font-semibold text-slate-50">중고차 정리(검색어 생성)</div>
                    <datalist id="usedcar-brand-options">
                      {[
                        "현대",
                        "기아",
                        "제네시스",
                        "쉐보레",
                        "르노코리아",
                        "KG모빌리티",
                        "벤츠",
                        "BMW",
                        "아우디",
                        "폭스바겐",
                        "미니",
                        "볼보",
                        "렉서스",
                        "도요타",
                        "혼다",
                        "포르쉐",
                        "랜드로버",
                        "지프",
                        "테슬라",
                      ].map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FieldList
                        label="중고차 브랜드"
                        value={selectedCustomer.usedCar?.brand ?? ""}
                        placeholder="예: 현대 / 벤츠 / Audi"
                        onChange={(v) =>
                          upsertCustomer({
                            id: selectedCustomer.id,
                            usedCar: { ...(selectedCustomer.usedCar ?? {}), brand: v },
                          })
                        }
                        listId="usedcar-brand-options"
                      />
                      <datalist
                        id={listIdForBrand("usedcar-model-options", selectedCustomer.usedCar?.brand)}
                      >
                        {(() => {
                          const b = (selectedCustomer.usedCar?.brand ?? "").trim().toLowerCase();
                          const opts =
                            b === "현대"
                              ? [
                                  "그랜저",
                                  "쏘나타",
                                  "아반떼",
                                  "싼타페",
                                  "투싼",
                                  "팰리세이드",
                                  "아이오닉5",
                                  "아이오닉6",
                                ]
                              : b === "기아"
                                ? ["K5", "K8", "K3", "쏘렌토", "스포티지", "카니발", "셀토스", "EV6"]
                                : b === "제네시스"
                                  ? ["G70", "G80", "G90", "GV70", "GV80"]
                                  : b === "벤츠" || b === "mercedes" || b === "mercedes-benz"
                                    ? ["E클래스", "C클래스", "S클래스", "GLC", "GLE", "GLB", "CLA"]
                                    : b === "bmw"
                                      ? ["3시리즈", "5시리즈", "7시리즈", "X3", "X5", "X6", "1시리즈"]
                                      : b === "아우디" || b === "audi"
                                        ? ["A4", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8"]
                                        : b === "폭스바겐" || b === "volkswagen"
                                          ? ["골프", "파사트", "티구안", "투아렉"]
                                          : b === "볼보" || b === "volvo"
                                            ? ["S60", "S90", "XC40", "XC60", "XC90"]
                                            : b === "렉서스" || b === "lexus"
                                              ? ["ES", "RX", "NX", "LS"]
                                              : [];
                          return opts.map((m) => <option key={m} value={m} />);
                        })()}
                      </datalist>
                      <FieldList
                        label="중고차 차종"
                        value={selectedCustomer.usedCar?.model ?? ""}
                        placeholder="예: 그랜저 / 팰리세이드 / A6"
                        onChange={(v) =>
                          upsertCustomer({
                            id: selectedCustomer.id,
                            usedCar: { ...(selectedCustomer.usedCar ?? {}), model: v },
                          })
                        }
                        listId={listIdForBrand("usedcar-model-options", selectedCustomer.usedCar?.brand)}
                      />
                      <Field
                        label="연식(예: 2019)"
                        value={selectedCustomer.usedCar?.year ?? ""}
                        placeholder="2019"
                        onChange={(v) =>
                          upsertCustomer({
                            id: selectedCustomer.id,
                            usedCar: { ...(selectedCustomer.usedCar ?? {}), year: v },
                          })
                        }
                      />
                      <Field
                        label="주행거리(km)"
                        value={selectedCustomer.usedCar?.mileageKm ?? ""}
                        placeholder="예: 120000 또는 12만"
                        onChange={(v) =>
                          upsertCustomer({
                            id: selectedCustomer.id,
                            usedCar: { ...(selectedCustomer.usedCar ?? {}), mileageKm: v },
                          })
                        }
                      />
                      <SelectField
                        label="사고 여부(대략)"
                        placeholderOption="선택 안 함"
                        value={selectedCustomer.usedCar?.accident ?? ""}
                        options={[...ACCIDENT_OPTIONS]}
                        onChange={(v) =>
                          upsertCustomer({
                            id: selectedCustomer.id,
                            usedCar: {
                              ...(selectedCustomer.usedCar ?? {}),
                              accident: v ? (v as UsedCarAccident) : undefined,
                            },
                          })
                        }
                      />
                      <datalist
                        id={listIdForBrand("usedcar-trim-options", selectedCustomer.usedCar?.brand)}
                      >
                        {(() => {
                          const b = (selectedCustomer.usedCar?.brand ?? "").trim().toLowerCase();
                          const common = [
                            "프리미엄",
                            "프레스티지",
                            "익스클루시브",
                            "캘리그래피",
                            "노블레스",
                            "시그니처",
                          ];
                          const importCommon = ["AMG Line", "M Sport", "S line", "quattro", "4MATIC"];
                          const opts =
                            b === "벤츠" || b === "mercedes" || b === "mercedes-benz"
                              ? [...importCommon, "Avantgarde", "Exclusive", "AMG"]
                              : b === "bmw"
                                ? [...importCommon, "Luxury", "xDrive", "MSport"]
                                : b === "아우디" || b === "audi"
                                  ? [...importCommon, "Premium", "Prestige"]
                                  : common;
                          return opts.map((t) => <option key={t} value={t} />);
                        })()}
                      </datalist>
                      <FieldList
                        label="등급/트림"
                        value={selectedCustomer.usedCar?.trim ?? ""}
                        placeholder="예: 익스클루시브 / 프레스티지"
                        onChange={(v) =>
                          upsertCustomer({
                            id: selectedCustomer.id,
                            usedCar: { ...(selectedCustomer.usedCar ?? {}), trim: v },
                          })
                        }
                        listId={listIdForBrand("usedcar-trim-options", selectedCustomer.usedCar?.brand)}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="sensora-premium-primary-workspace rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation"
                        onClick={() => {
                          const q = buildUsedCarSearchQuery(selectedCustomer);
                          void copyToClipboard(q).then((ok) => {
                            if (ok) showToast("검색어 복사 완료");
                            else alert(q);
                          });
                        }}
                      >
                        {t("common.copy")}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-3 py-2 text-xs font-semibold hover:bg-white/[0.08]"
                        onClick={() => {
                          const q = buildUsedCarSearchQuery(selectedCustomer);
                          const line = `${q}\n- 연식/주행거리/사고/등급을 추가로 입력하면 더 정확합니다.`;
                          void copyToClipboard(line).then((ok) => {
                            if (ok) showToast("메모 복사 완료");
                            else alert(line);
                          });
                        }}
                      >
                        {t("common.copy")}
                      </button>
                    </div>
                    <p className="mt-2 text-[12px] text-slate-400">
                      검색어:{" "}
                      <span className="font-medium text-slate-300">
                        {buildUsedCarSearchQuery(selectedCustomer)}
                      </span>
                    </p>
                  </div>
                </details>

                <details
                  id="crm-block-profile"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-[22px] border border-white/[0.11] bg-slate-950/55 p-5 outline-none"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-1 py-2 outline-none transition hover:bg-slate-950/45 focus-visible:ring-2 focus-visible:ring-sky-400/35 [&::-webkit-details-marker]:hidden">
                    <span className="text-[15px] font-semibold text-slate-50">고객·상담 정보</span>
                    <span className="rounded-full border border-white/[0.11] bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                      펼치기
                    </span>
                  </summary>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <Field
                      label="고객명"
                      value={selectedCustomer.name}
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, name: v })}
                    />
                    <Field
                      label="연락처"
                      value={selectedCustomer.phone ?? ""}
                      placeholder="010-0000-0000"
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, phone: v })}
                    />
                    <SelectField
                      label="유입경로"
                      value={selectedCustomer.leadSource}
                      options={LEAD_SOURCES}
                      onChange={(v) =>
                        upsertCustomer({ id: selectedCustomer.id, leadSource: v as LeadSource })
                      }
                    />
                    <SelectField
                      label="상담 단계"
                      value={selectedCustomer.stage}
                      options={STAGES}
                      onChange={(v) =>
                        upsertCustomer({ id: selectedCustomer.id, stage: v as PipelineStage })
                      }
                    />
                    <DateTimeField
                      label="다음 연락 예정일"
                      valueIso={selectedCustomer.nextContactAt}
                      onChangeIso={(iso) =>
                        upsertCustomer({ id: selectedCustomer.id, nextContactAt: iso })
                      }
                      placeholder="예: 내일 14:00"
                    />
                    <SelectField
                      label="브랜드"
                      placeholderOption="먼저 브랜드를 선택해 주세요"
                      value={(selectedCustomer.vehicleBrand ?? "") as string}
                      options={[...BRAND_OPTIONS]}
                      onChange={(brandStr) => {
                        const id = selectedCustomer.id;
                        if (!brandStr) {
                          upsertCustomer({ id, vehicleBrand: undefined, interestedModel: "" });
                          return;
                        }
                        const brand = brandStr as VehicleBrandId;
                        const opts = [...vehicleModelsFor(brand)];
                        const prevModel = selectedCustomer.interestedModel ?? "";
                        const keep =
                          brand === "기타"
                            ? prevModel
                            : opts.includes(prevModel)
                              ? prevModel
                              : "";
                        upsertCustomer({ id, vehicleBrand: brand, interestedModel: keep });
                      }}
                    />
                    {selectedCustomer.vehicleBrand ? (
                      selectedCustomer.vehicleBrand === "기타" ? (
                        <Field
                          label="차종 (직접 입력)"
                          value={selectedCustomer.interestedModel ?? ""}
                          placeholder="예: 수입 디젤 픽업, 클래식 카 등"
                          onChange={(v) =>
                            upsertCustomer({ id: selectedCustomer.id, interestedModel: v })
                          }
                        />
                      ) : (
                        <SelectField
                          label="관심 차종"
                          placeholderOption="목록에서 선택"
                          value={selectedCustomer.interestedModel ?? ""}
                          options={[...vehicleModelsFor(selectedCustomer.vehicleBrand)]}
                          onChange={(v) =>
                            upsertCustomer({ id: selectedCustomer.id, interestedModel: v })
                          }
                        />
                      )
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/[0.11] px-3 py-2 text-xs text-slate-400">
                        위에서 브랜드를 고르면 대표 차종 목록이 나옵니다.
                      </div>
                    )}
                    <Field
                      label="비교 중인 차량"
                      value={selectedCustomer.compareVehicles ?? ""}
                      placeholder="예: GV70 / X3 / GLC (쉼표로 구분)"
                      onChange={(v) =>
                        upsertCustomer({ id: selectedCustomer.id, compareVehicles: v })
                      }
                    />
                    <Field
                      label="구매 예정 시기"
                      value={selectedCustomer.purchaseTiming ?? ""}
                      placeholder="예: 이번달 / 3개월 내 / 연말"
                      onChange={(v) =>
                        upsertCustomer({ id: selectedCustomer.id, purchaseTiming: v })
                      }
                    />
                  </div>
                </details>

                <div
                  id="crm-block-quick-tpl"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-white/[0.11] bg-slate-950/55 p-5 outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{t("crm.section.templates")}</div>
                    <button
                      onClick={addTemplate}
                      className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-3 py-2 text-xs font-semibold hover:bg-white/[0.08]"
                    >
                      + 템플릿
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {quickTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        className="w-full rounded-xl border border-white/[0.11] bg-slate-950/55 p-3 text-left hover:bg-white/[0.08]"
                        onClick={async () => {
                          const text = renderTemplate(tpl, selectedCustomer);
                          const ok = await copyToClipboard(text);
                          alert(
                            ok
                              ? "클립보드에 복사했습니다."
                              : "자동 복사가 불가했습니다. ‘문자 템플릿’ 탭에서 본문을 길게 눌러 복사해 주세요.",
                          );
                        }}
                      >
                        <div className="text-xs font-semibold">{tpl.title}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          클릭하면 고객명 치환 후 복사
                        </div>
                      </button>
                    ))}
                    {state.templates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-500/35 p-4 text-xs text-slate-400">
                        템플릿이 없습니다. “+ 템플릿”으로 자주 쓰는 문장을 먼저 만들어 두세요.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div
                  id="crm-block-next"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-white/[0.11] bg-slate-950/55 p-5 outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">다음 연락 · 할 일</div>
                    <button
                      onClick={() => addNextAction(selectedCustomer.id)}
                      className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-3 py-2 text-xs font-semibold hover:bg-white/[0.08]"
                    >
                      + 추가
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedNextActions.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-white/[0.11] bg-slate-950/55 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex min-w-0 items-start gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(a.doneAt)}
                              onChange={() => toggleNextActionDone(a.id)}
                              className="mt-1"
                            />
                            <input
                              value={a.title}
                              onChange={(e) => updateNextAction(a.id, { title: e.target.value })}
                              className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold outline-none"
                            />
                          </label>
                          <div className="text-[12px] font-medium text-slate-400">
                            {a.doneAt ? "완료" : "미완료"}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-xs text-slate-400">기한</div>
                          <input
                            type="datetime-local"
                            value={isoToLocalInput(a.dueAt)}
                            onChange={(e) =>
                              updateNextAction(a.id, { dueAt: localInputToIso(e.target.value) })
                            }
                            className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-2 py-1 text-xs outline-none focus:border-sky-400/45"
                          />
                        </div>
                      </div>
                    ))}
                    {selectedNextActions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-500/35 p-4 text-xs text-slate-400">
                        아직 없습니다. “+ 추가”로 만들어보세요.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  id="crm-block-events"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-white/[0.11] bg-slate-950/55 p-5 outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{t("crm.tab.events")}</div>
                    <button
                      onClick={() => addEvent(selectedCustomer.id)}
                      className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-3 py-2 text-xs font-semibold hover:bg-white/[0.08]"
                    >
                      + 추가
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedEvents.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-xl border border-white/[0.11] bg-slate-950/55 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <input
                            value={e.title}
                            onChange={(ev) => updateEvent(e.id, { title: ev.target.value })}
                            className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold outline-none"
                          />
                          <div className="text-[12px] font-medium text-slate-400">
                            {formatDateTime(e.startAt)}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="text-xs text-slate-400">시작</div>
                          <input
                            type="datetime-local"
                            value={isoToLocalInput(e.startAt)}
                            onChange={(ev) =>
                              updateEvent(e.id, { startAt: localInputToIso(ev.target.value) })
                            }
                            className="rounded-lg border border-white/[0.11] bg-slate-950/55 px-2 py-1 text-xs outline-none focus:border-sky-400/45"
                          />
                        </div>
                        <div className="mt-2">
                          <textarea
                            value={e.notes ?? ""}
                            placeholder="메모"
                            onChange={(ev) => updateEvent(e.id, { notes: ev.target.value })}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            className="min-h-[70px] w-full resize-y rounded-xl border border-white/[0.11] bg-slate-950/55 px-3 py-2 text-xs outline-none focus:border-sky-400/45"
                          />
                        </div>
                      </div>
                    ))}
                    {selectedEvents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-500/35 p-4 text-xs text-slate-400">
                        아직 없습니다. “+ 추가”로 만들어보세요.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              id="crm-block-empty-placeholder"
              tabIndex={-1}
              className="scroll-mt-24 rounded-2xl border border-dashed border-slate-500/35 bg-slate-950/40 p-8 text-sm text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none backdrop-blur-sm"
            >
              목록에서 고객을 선택하거나 <span className="font-semibold">위의 “+ 고객 추가”</span>로 상담을
              등록하세요. 고객을 열면 <span className="font-semibold text-slate-50">상담 메모</span>,
              <span className="font-semibold text-slate-50"> 다음 연락</span>,
              <span className="font-semibold text-slate-50"> 일정</span>을 한 화면에서 이어서 관리할 수 있습니다.
            </div>
          )}

                </div>
              </section>
            </div>
            </CustomersSection>
          ) : showWorkspaceTabs && tab === "다음할일" ? (
            <FollowUpSection>
              <CrmMiniCalendar
                customers={state.customers}
                nextActions={state.nextActions}
                events={state.events}
                onPickCustomer={(id) => {
                  setSelectedCustomerId(id);
                  onActiveSectionChange("customers");
                  setTab("고객");
                  window.setTimeout(() => {
                    document.getElementById("crm-detail-panel")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 50);
                }}
              />
            <div id="crm-workspace-next" className="space-y-6">
              <p className="text-[15px] leading-relaxed text-slate-400">
                선택한 고객과 무관하게 <span className="font-semibold text-slate-300">모든 다음 연락</span>을 한눈에
                봅니다. 행을 눌러 해당 고객으로 이동합니다.
              </p>
              <div
                id="crm-block-global"
                tabIndex={-1}
                className="scroll-mt-24 rounded-2xl border border-white/[0.11] bg-slate-950/55 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.04)] outline-none"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[16px] font-semibold text-slate-50">{t("common.backup")}</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!uid) {
                          openPreviewGate();
                          return;
                        }
                        downloadText("crm_backup.json", JSON.stringify(state, null, 2));
                      }}
                      className="rounded-xl border border-white/[0.11] bg-white/[0.07] px-4 py-2.5 text-[13px] font-semibold text-slate-50 hover:bg-white/[0.1]"
                    >
                      {t("common.backup")}(.json)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!uid) {
                          openPreviewGate();
                          return;
                        }
                        if (!confirm("로컬 데이터를 초기화할까요? (되돌리기 어렵습니다)")) return;
                        const next = seedState();
                        setState(next);
                        setSelectedCustomerId(next.customers[0]?.id ?? null);
                      }}
                      className="rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-2.5 text-[13px] font-semibold text-slate-400 hover:bg-slate-950/45"
                    >
                      {t("common.reset")}(샘플)
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.11] bg-slate-950/45 p-5">
                    <div className="text-[13px] font-semibold text-slate-50">{t("crm.section.allNextActions")}</div>
                    <div className="mt-4 max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
                      {allNextActions.map((a) => {
                        const c = state.customers.find((x) => x.id === a.customerId);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomerId(a.customerId);
                              onActiveSectionChange("customers");
                              setTab("고객");
                            }}
                            className="w-full rounded-xl border border-white/[0.11] bg-slate-950/55 p-4 text-left text-[14px] transition hover:bg-slate-950/45"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate font-semibold text-slate-50">
                                {a.doneAt ? "완료 · " : ""}
                                {a.title}
                              </div>
                              <div className="shrink-0 text-[13px] font-medium text-slate-400">
                                {formatDateTime(a.dueAt)}
                              </div>
                            </div>
                            <div className="mt-1 text-[13px] text-slate-400">{c?.name ?? "알 수 없음"}</div>
                          </button>
                        );
                      })}
                      {allNextActions.length === 0 ? (
                        <div className="text-[14px] text-slate-400">등록된 다음 연락이 없습니다.</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.11] bg-slate-950/45 p-5">
                    <div className="text-[13px] font-semibold text-slate-50">{t("crm.section.eventsPreview")}</div>
                    <div className="mt-4 max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
                      {allEvents.slice(0, 24).map((e) => (
                        <div
                          key={e.id}
                          className="rounded-xl border border-white/[0.11] bg-slate-950/55 p-4 text-[14px]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="font-semibold text-slate-50">{e.title}</div>
                            <div className="text-[13px] font-medium text-slate-400">{formatDateTime(e.startAt)}</div>
                          </div>
                          {e.customerId ? (
                            <button
                              type="button"
                              className="mt-2 text-[13px] font-semibold text-slate-300 underline underline-offset-4 hover:text-slate-50"
                              onClick={() => {
                                setSelectedCustomerId(e.customerId!);
                                onActiveSectionChange("customers");
                                setTab("고객");
                              }}
                            >
                              고객: {state.customers.find((x) => x.id === e.customerId)?.name ?? "?"}
                            </button>
                          ) : (
                            <div className="mt-2 text-[13px] font-medium text-slate-400">고객 연결 없음</div>
                          )}
                        </div>
                      ))}
                      {allEvents.length === 0 ? (
                        <div className="text-[14px] text-slate-400">등록된 일정이 없습니다.</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </FollowUpSection>
          ) : showWorkspaceTabs && tab === "일정" ? (
            <div id="crm-workspace-events" className="space-y-4">
              <p className="text-[15px] leading-relaxed text-slate-400">
                모든 상담·출고 일정입니다. 카드를 누르면 해당 고객 화면으로 이동합니다.
              </p>
              <div className="max-h-[min(640px,calc(100vh-16rem))] space-y-3 overflow-y-auto">
                {allEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    disabled={!e.customerId}
                    onClick={() => {
                      if (!e.customerId) return;
                      setSelectedCustomerId(e.customerId);
                      onActiveSectionChange("customers");
                      setTab("고객");
                    }}
                    className="flex w-full flex-col rounded-2xl border border-white/[0.11] bg-slate-950/55 px-5 py-4 text-left transition hover:bg-slate-950/45 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="text-[17px] font-semibold text-slate-50">{e.title}</span>
                    <span className="mt-2 text-[15px] font-medium text-slate-400">{formatDateTime(e.startAt)}</span>
                    {e.customerId ? (
                      <span className="mt-2 text-[14px] font-semibold text-slate-300">
                        고객: {state.customers.find((x) => x.id === e.customerId)?.name ?? "?"}
                      </span>
                    ) : (
                      <span className="mt-2 text-[14px] font-medium text-slate-400">고객 미연결</span>
                    )}
                  </button>
                ))}
                {allEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-500/35 bg-slate-950/55 px-6 py-12 text-center text-[15px] text-slate-400">
                    일정이 없습니다.
                  </div>
                ) : null}
              </div>
            </div>
          ) : showWorkspaceTabs && tab === "템플릿" ? (
            <div
              id="crm-block-templates"
              tabIndex={-1}
              className="rounded-2xl border border-white/[0.11] bg-slate-950/55 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.04)] outline-none"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[18px] font-semibold text-slate-50">{t("crm.section.templates")}</div>
                <button
                  type="button"
                  onClick={addTemplate}
                  className="sensora-premium-primary-workspace rounded-xl px-5 py-2.5 text-[14px] font-semibold touch-manipulation"
                >
                  + 템플릿
                </button>
              </div>

              <section
                id="season-care"
                aria-labelledby="season-care-title"
                className="mt-8 scroll-mt-28 rounded-[22px] border border-white/[0.11] bg-slate-950/38 p-5 sm:p-6"
              >
                <header className="border-b border-white/[0.11] pb-4">
                  <h3 id="season-care-title" className="text-[17px] font-semibold tracking-[-0.01em] text-slate-50">
                    {t("crm.seasonCare.title")}
                  </h3>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-400">
                    {t("crm.seasonCare.intro")}
                  </p>
                </header>

                <div className="mt-6 space-y-8">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-50">{t("crm.seasonCare.stepConditions")}</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.brandLabel")}</span>
                        <select
                          value={seasonCareBrand}
                          onChange={(e) =>
                            setSeasonCareBrand(e.target.value as SeasonCareBrandPreset | "other")
                          }
                          className="min-h-[44px] w-full rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] outline-none focus:border-sky-400/45 focus:ring-2 focus:ring-sky-500/25"
                        >
                          {SC_BRAND_OPTIONS.map((id) => (
                            <option key={id} value={id}>
                              {t(SC_BRAND_TKEY[id])}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.seasonLabel")}</span>
                        <select
                          value={seasonCareSeason}
                          onChange={(e) => setSeasonCareSeason(e.target.value as SeasonCareSeason)}
                          className="min-h-[44px] w-full rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] outline-none focus:border-sky-400/45 focus:ring-2 focus:ring-sky-500/25"
                        >
                          {SEASON_CARE_SEASONS.map((id) => (
                            <option key={id} value={id}>
                              {t(SC_SEASON_TKEY[id])}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.purposeLabel")}</span>
                        <select
                          value={seasonCarePurpose}
                          onChange={(e) => setSeasonCarePurpose(e.target.value as SeasonCarePurpose)}
                          className="min-h-[44px] w-full rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] outline-none focus:border-sky-400/45 focus:ring-2 focus:ring-sky-500/25"
                        >
                          {SEASON_CARE_PURPOSES.map((id) => (
                            <option key={id} value={id}>
                              {t(SC_PURPOSE_TKEY[id])}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.toneLabel")}</span>
                        <select
                          value={seasonCareTone}
                          onChange={(e) => setSeasonCareTone(e.target.value as SeasonCareTone)}
                          className="min-h-[44px] w-full rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] outline-none focus:border-sky-400/45 focus:ring-2 focus:ring-sky-500/25"
                        >
                          {SEASON_CARE_TONES.map((id) => (
                            <option key={id} value={id}>
                              {t(SC_TONE_TKEY[id])}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {seasonCareBrand === "other" ? (
                      <label className="mt-4 grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.brandOtherHint")}</span>
                        <input
                          value={seasonCareBrandCustom}
                          onChange={(e) => setSeasonCareBrandCustom(e.target.value)}
                          placeholder={t("crm.seasonCare.customBrandPlaceholder")}
                          autoComplete="off"
                          spellCheck={false}
                          className="min-h-[44px] w-full rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] outline-none focus:border-sky-400/45"
                        />
                      </label>
                    ) : null}
                  </div>

                  <div className="rounded-[18px] border border-white/[0.11] bg-slate-950/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,1)] sm:p-5">
                    <p className="text-[13px] font-semibold text-slate-50">{t("crm.seasonCare.stepSender")}</p>
                    <p className="mt-1 text-[13px] text-slate-400">
                      {t("crm.seasonCare.sellerHeading")}{" "}
                      <span className="font-medium">({t("crm.seasonCare.optionalHint")})</span>
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.sellerName")}</span>
                        <input
                          value={seasonCareSellerName}
                          onChange={(e) => setSeasonCareSellerName(e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                          className="min-h-[44px] rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-2.5 text-[15px] outline-none focus:border-sky-400/45"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.showroom")}</span>
                        <input
                          value={seasonCareShowroom}
                          onChange={(e) => setSeasonCareShowroom(e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                          className="min-h-[44px] rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-2.5 text-[15px] outline-none focus:border-sky-400/45"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">
                          {t("crm.seasonCare.sellerContactField")}
                        </span>
                        <input
                          value={seasonCareContact}
                          onChange={(e) => setSeasonCareContact(e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                          inputMode="tel"
                          className="min-h-[44px] rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-2.5 text-[15px] outline-none focus:border-sky-400/45"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.jobTitle")}</span>
                        <input
                          value={seasonCareJobTitle}
                          onChange={(e) => setSeasonCareJobTitle(e.target.value)}
                          autoComplete="off"
                          spellCheck={false}
                          className="min-h-[44px] rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-3 py-2.5 text-[15px] outline-none focus:border-sky-400/45"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-4 z-[5] mt-8 flex flex-wrap gap-3 rounded-[16px] border border-white/[0.11] bg-slate-950/55/94 px-3 py-3 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.12)] backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => runSeasonCareGenerate()}
                    className="sensora-premium-primary-workspace min-h-[44px] rounded-[14px] px-5 py-2.5 text-[14px] font-semibold touch-manipulation"
                  >
                    {t("crm.seasonCare.generate")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!seasonCareOutput.trim()) {
                        showToast(t("crm.seasonCare.copyEmptyHint"));
                        return;
                      }
                      const ok = await copyToClipboard(seasonCareOutput);
                      showToast(ok ? t("crm.seasonCare.copyToast") : t("crm.seasonCare.copyFail"));
                    }}
                    className="min-h-[44px] rounded-[14px] bg-white/[0.07] px-5 py-2.5 text-[14px] font-semibold text-slate-50 ring-1 ring-inset ring-white/[0.12] hover:bg-white/[0.1] touch-manipulation"
                  >
                    {t("crm.seasonCare.copy")}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetSeasonCareForm()}
                    className="min-h-[44px] rounded-[14px] bg-slate-950/55 px-5 py-2.5 text-[14px] font-semibold text-slate-300 ring-1 ring-inset ring-white/[0.12] hover:bg-slate-950/45 touch-manipulation"
                  >
                    {t("common.reset")}
                  </button>
                </div>

                <label htmlFor="season-care-output" className="mt-6 grid gap-3">
                  <span className="text-[13px] font-semibold text-slate-300">{t("crm.seasonCare.previewLabel")}</span>
                  <textarea
                    id="season-care-output"
                    value={seasonCareOutput}
                    onChange={(e) => setSeasonCareOutput(e.target.value)}
                    rows={16}
                    className="min-h-[min(440px,calc(100vh-16rem))] w-full resize-y rounded-[14px] border border-white/[0.11] bg-slate-950/55 px-4 py-3 text-[15px] leading-relaxed text-slate-50 outline-none focus:border-sky-400/45"
                    spellCheck={false}
                  />
                </label>

                <details className="mt-6 rounded-[16px] border border-white/[0.11] bg-slate-950/55 px-4 py-3">
                  <summary className="cursor-pointer list-none text-[12px] font-semibold leading-snug text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 [&::-webkit-details-marker]:hidden">
                    {t("crm.seasonCare.adNoticeHeading")}
                  </summary>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-400">{t("crm.seasonCare.disclaimer")}</p>
                </details>
              </section>

              <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {state.templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="rounded-2xl border border-white/[0.11] bg-slate-950/45 p-5"
                  >
                    <input
                      className="w-full border-0 bg-transparent text-[17px] font-semibold text-slate-50 outline-none"
                      value={tpl.title}
                      onChange={(e) => updateTemplate(tpl.id, { title: e.target.value })}
                    />
                    <textarea
                      className="mt-3 min-h-[130px] w-full resize-y rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-3 text-[14px] text-slate-300 outline-none focus:border-sky-400/45"
                      value={tpl.body}
                      onChange={(e) => updateTemplate(tpl.id, { body: e.target.value })}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          const text = renderTemplate(tpl, selectedCustomer);
                          const ok = await copyToClipboard(text);
                          alert(
                            ok
                              ? "클립보드에 복사했습니다."
                              : "자동 복사가 불가했습니다. 본문을 길게 눌러 복사해 주세요.",
                          );
                        }}
                        className="rounded-xl bg-white/[0.07] px-4 py-2.5 text-[13px] font-semibold text-slate-50 ring-1 ring-inset ring-white/[0.12] hover:bg-white/[0.1]"
                      >
                        {selectedCustomer ? `${t("common.select")} · ${t("common.copy")}` : t("common.copy")}
                      </button>
                      <div className="text-[12px] font-medium text-slate-400">업데이트: {formatDateTime(tpl.updatedAt)}</div>
                    </div>
                  </div>
                ))}
                {state.templates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-500/35 px-8 py-12 text-center text-[15px] text-slate-400">
                    템플릿이 없습니다.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {leadExplainForId ? (
        <div
          className="fixed inset-0 z-[320] flex items-start justify-center bg-black/50 p-4 pt-14"
          onClick={() => setLeadExplainForId(null)}
          onKeyDown={(e) => e.key === "Escape" && setLeadExplainForId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-explain-title"
            className="w-full max-w-lg rounded-2xl border border-white/[0.11] bg-slate-950/55 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="lead-explain-title"
              className="text-sm font-semibold text-slate-50"
            >
              가망 % 산정 기준
            </div>
            <p className="mt-2 text-xs text-slate-400">
              실제 계약 가능성이 아니라, 입력된 메모·예산·관심차종·연락처 정보만으로 빠르게 정렬하기 위한
              참고 점수입니다.
            </p>
            {(() => {
              const c = state.customers.find((x) => x.id === leadExplainForId);
              if (!c) {
                return (
                  <p className="mt-3 text-xs text-slate-400">
                    고객 정보를 찾지 못했습니다.
                  </p>
                );
              }
              const ex = explainPurchaseIntent(c);
              return (
                <div className="mt-3 space-y-3 text-xs text-slate-50">
                  <div className="rounded-xl border border-white/[0.11] bg-slate-950/45 px-3 py-2">
                    <span className="font-semibold text-slate-100">
                      결과: {ex.percent}% · 등급 {ex.grade}
                    </span>
                    <div className="mt-1 text-[12px] text-slate-400">
                      힌트: {ex.hints.join(" · ")}
                    </div>
                  </div>
                  <ul className="list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed text-slate-300">
                    {ex.breakdown.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <div className="text-[12px] text-slate-400">
                    키워드 예시: {LEAD_SCORE_HOTWORDS.join(", ")}
                  </div>
                </div>
              );
            })()}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="sensora-premium-primary-workspace rounded-lg px-4 py-2 text-xs font-semibold touch-manipulation"
                onClick={() => setLeadExplainForId(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {createCustomerOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[330] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-3"
          onClick={closeCreateCustomerModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-create-customer-title"
            className="flex max-h-[92dvh] w-full max-w-[520px] flex-col rounded-t-[22px] border border-white/[0.11] bg-slate-950/55 shadow-2xl sm:rounded-[22px]"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.11] bg-slate-950/45 px-4 py-3 sm:px-5">
              <h2 id="crm-create-customer-title" className="text-[16px] font-extrabold text-slate-50">
                새 고객 추가
              </h2>
              <button
                type="button"
                className="crm-ghost-btn min-h-[44px] shrink-0 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-300"
                aria-label="닫기"
                onClick={closeCreateCustomerModal}
              >
                닫기
              </button>
            </div>
            <form
              id="crm-create-customer-form"
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:gap-5 sm:px-6 sm:py-5"
              onSubmit={(e) => {
                e.preventDefault();
                void submitCreateCustomer();
              }}
            >
              <Field
                label="고객명 *"
                value={createCustomerDraft.name}
                placeholder="예: 홍길동"
                onChange={(v) => setCreateCustomerDraft((prev) => ({ ...prev, name: v }))}
              />
              <Field
                label="연락처"
                value={createCustomerDraft.phone}
                placeholder="010-0000-0000"
                onChange={(v) => setCreateCustomerDraft((prev) => ({ ...prev, phone: v }))}
              />
              <SelectField
                label="유입 경로"
                value={createCustomerDraft.leadSource}
                options={[...LEAD_SOURCES]}
                onChange={(v) =>
                  setCreateCustomerDraft((prev) => ({
                    ...prev,
                    leadSource: v as LeadSource,
                  }))
                }
              />
              <SelectField
                label="상담 단계"
                value={createCustomerDraft.stage}
                options={[...STAGES]}
                onChange={(v) =>
                  setCreateCustomerDraft((prev) => ({
                    ...prev,
                    stage: v as PipelineStage,
                  }))
                }
              />
              <SelectField
                label="브랜드"
                placeholderOption="선택 안 함"
                value={createCustomerDraft.vehicleBrand}
                options={[...BRAND_OPTIONS]}
                onChange={(brandStr) =>
                  setCreateCustomerDraft((prev) => ({
                    ...prev,
                    vehicleBrand: brandStr,
                    interestedModel:
                      brandStr !== prev.vehicleBrand ? "" : prev.interestedModel,
                  }))
                }
              />
              {(createCustomerDraft.vehicleBrand ?? "").trim() &&
              createCustomerDraft.vehicleBrand !== "기타" ? (
                <SelectField
                  label="관심 차종"
                  placeholderOption="선택 안 함 · 목록 외 차종은 브랜드를 ‘기타’로 선택"
                  value={createCustomerDraft.interestedModel}
                  options={[...vehicleModelsFor(createCustomerDraft.vehicleBrand as VehicleBrandId)]}
                  onChange={(v) => setCreateCustomerDraft((prev) => ({ ...prev, interestedModel: v }))}
                />
              ) : (
                <Field
                  label="관심 차량"
                  value={createCustomerDraft.interestedModel}
                  placeholder="예: GV80 5인승 디젤 또는 자유 입력"
                  onChange={(v) =>
                    setCreateCustomerDraft((prev) => ({ ...prev, interestedModel: v }))
                  }
                />
              )}
              <TextArea
                label="상담 메모"
                value={createCustomerDraft.memo}
                placeholder="상담 중 파악한 요구사항 등"
                onChange={(v) => setCreateCustomerDraft((prev) => ({ ...prev, memo: v }))}
              />
              <DateTimeField
                label="다음 연락 예정"
                valueIso={createCustomerDraft.nextContactAt}
                placeholder="예: 내일 오후 재통화"
                onChangeIso={(iso) =>
                  setCreateCustomerDraft((prev) => ({ ...prev, nextContactAt: iso }))
                }
              />
              <Field
                label="처리할 업무"
                value={createCustomerDraft.nextActionText}
                placeholder="예: 견적서 발송 필요"
                onChange={(v) =>
                  setCreateCustomerDraft((prev) => ({ ...prev, nextActionText: v }))
                }
              />
            </form>
            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-white/[0.11] bg-slate-950/55 px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
              <button
                type="button"
                className="min-h-[44px] shrink-0 rounded-xl border border-white/[0.11] bg-slate-950/55 px-5 py-2.5 text-[14px] font-semibold text-slate-300 hover:bg-slate-950/45 touch-manipulation"
                onClick={closeCreateCustomerModal}
              >
                취소
              </button>
              <button
                type="submit"
                form="crm-create-customer-form"
                className="sensora-premium-primary-workspace min-h-[44px] shrink-0 rounded-xl px-6 py-2.5 text-[14px] font-semibold touch-manipulation"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ContactImportFileGuideModal
        open={contactFileGuideOpen}
        onClose={() => setContactFileGuideOpen(false)}
        onProceedToImport={openCustomersImportHub}
      />

      <ImportContactsPanel
        open={importContactsOpen}
        onClose={() => setImportContactsOpen(false)}
        existingCustomers={state.customers}
        onCommit={handleCommitImportContactsHub}
        makeId={makeId}
        buildCustomer={buildCustomerFromImportedDraft}
        showToast={showToast}
        onOpenFileGuide={() => setContactFileGuideOpen(true)}
      />

      {deliveryGuideOpen && selectedCustomer ? (
        <div className="fixed inset-0 z-[320] flex items-end justify-center bg-black/40 px-3 pb-3 pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] backdrop-blur-sm sm:items-center sm:px-4 sm:pb-5 sm:pt-5">
          <div className="max-h-[min(92dvh,92vh)] w-full max-w-[920px] overflow-hidden rounded-2xl border border-white/[0.11] bg-slate-950/55 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.11] bg-slate-950/45 px-4 py-3">
              <div className="text-sm font-extrabold text-slate-50">AI 출고 안내서</div>
              <button
                type="button"
                className="crm-ink-btn rounded-lg px-3 py-2 text-xs font-semibold"
                onClick={() => setDeliveryGuideOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className="max-h-[calc(92vh-56px)] overflow-y-auto p-4">
              <DeliveryGuideScreen
                customers={state.customers}
                selectedCustomerId={selectedCustomer.id}
                onSelectCustomerId={(id) => setSelectedCustomerId(id)}
                onUpsertCustomerGuide={(customerId, nextGuide) =>
                  upsertCustomer({ id: customerId, deliveryGuide: nextGuide })
                }
                onNotify={showToast}
              />
            </div>
          </div>
        </div>
      ) : null}

      {sensoraTipIntroOpen ? (
        <div
          className="fixed inset-0 z-[430] flex items-end justify-center bg-black/55 px-3 pb-[max(16px,calc(12px+env(safe-area-inset-bottom,0px)))] pt-[max(12px,calc(env(safe-area-inset-top,0px)+8px))] backdrop-blur-md sm:items-center sm:px-4 sm:pb-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crm-sensora-tip-intro-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={t("landing.showroom.tip.closeOverlay")}
            onClick={() => setSensoraTipIntroOpen(false)}
          />
          <div
            className="sensora-modal-panel-reveal relative z-[1] w-full max-w-md rounded-2xl border border-white/[0.14] bg-gradient-to-b from-slate-950/95 to-[#07111f]/98 p-6 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md max-[390px]:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="crm-sensora-tip-intro-title"
              className="text-[17px] font-semibold tracking-tight text-slate-50 sm:text-lg"
            >
              {t("landing.showroom.tip.title")}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-400">{t("crm.guideTip.body")}</p>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{t("crm.demoContextNotice.accessAfterBeta")}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl border border-sky-400/25 bg-gradient-to-b from-[#1e293b] to-[#0f172a] px-4 py-3 text-center text-[14px] font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-sky-400/40"
                onClick={() => {
                  setSensoraGuideInitialIndex(0);
                  setSensoraTipIntroOpen(false);
                  setSensoraGuideViewerOpen(true);
                }}
              >
                {t("crm.guideTip.openViewer")}
              </button>
              <button
                type="button"
                className="min-h-[44px] w-full touch-manipulation rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-slate-300 transition hover:bg-white/[0.07]"
                onClick={() => setSensoraTipIntroOpen(false)}
              >
                {t("landing.showroom.tip.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SensoraGuideImageViewer
        open={sensoraGuideViewerOpen}
        onClose={() => setSensoraGuideViewerOpen(false)}
        images={CRM_GUIDE_VIEWER_IMAGES}
        initialSlideIndex={sensoraGuideInitialIndex}
        title={t("landing.showroom.tip.title")}
        slideTitleKeys={CRM_GUIDE_SLIDE_TITLE_KEYS}
      />

      {previewGateOpen ? (
        <div
          className="fixed inset-0 z-[460] flex items-end justify-center bg-black/55 px-3 pb-[max(16px,calc(12px+env(safe-area-inset-bottom,0px)))] pt-10 backdrop-blur-md sm:items-center sm:px-4 sm:pb-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crm-preview-gate-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={t("landing.showroom.tip.closeOverlay")}
            onClick={() => setPreviewGateOpen(false)}
          />
          <div
            className="sensora-modal-panel-reveal relative z-[1] w-full max-w-md rounded-2xl border border-white/[0.14] bg-gradient-to-b from-slate-950/95 to-[#07111f]/98 p-6 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md max-[390px]:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="crm-preview-gate-title"
              className="text-[17px] font-semibold tracking-tight text-slate-50 sm:text-lg"
            >
              {t("crm.previewGate.title")}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-400">{t("crm.previewGate.body")}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/join?returnTo=preview"
                className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl border border-sky-400/25 bg-gradient-to-b from-[#1e293b] to-[#0f172a] px-4 py-3 text-center text-[14px] font-semibold text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-sky-400/40"
                onClick={() => setPreviewGateOpen(false)}
              >
                {t("crm.previewGate.join")}
              </Link>
              <Link
                href="/register"
                className="sensora-dark-ghost-btn inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl px-4 py-3 text-center text-[14px] font-semibold transition"
                onClick={() => setPreviewGateOpen(false)}
              >
                {t("crm.previewGate.register")}
              </Link>
              <button
                type="button"
                className="min-h-[48px] w-full touch-manipulation rounded-xl border border-transparent px-4 py-3 text-[14px] font-semibold text-slate-400 underline underline-offset-4 hover:text-slate-200"
                onClick={() => setPreviewGateOpen(false)}
              >
                {t("crm.previewGate.continuePreview")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-[400] w-[min(520px,calc(100vw-24px))] -translate-x-1/2">
          <div className="rounded-full border border-white/[0.12] bg-[#07111f]/92 px-4 py-2 text-center text-xs font-semibold text-slate-100 shadow-lg backdrop-blur-md">
            {toast}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <div className="text-[13px] font-semibold text-slate-300">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/45"
      />
    </label>
  );
}

function DateTimeField({
  label,
  valueIso,
  onChangeIso,
  placeholder,
}: {
  label: string;
  valueIso?: string;
  onChangeIso: (iso: string | undefined) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <input
        type="datetime-local"
        value={isoToLocalInput(valueIso)}
        onChange={(e) => onChangeIso(localInputToIso(e.target.value))}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.11] bg-slate-950/55 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/45"
      />
    </label>
  );
}

function FieldList({
  label,
  value,
  onChange,
  placeholder,
  listId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  listId: string;
}) {
  return (
    <label className="grid gap-1">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <input
        value={value}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.11] bg-slate-950/55 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/45"
      />
    </label>
  );
}

function listIdForBrand(prefix: string, brand: string | undefined): string {
  const b = (brand ?? "").trim().toLowerCase();
  const key = b
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .slice(0, 24);
  return `${prefix}-${key || "default"}`;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholderOption,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  /** 있으면 맨 위에 빈 값 옵션(라벨)을 붙입니다. */
  placeholderOption?: string;
}) {
  const mergedOpts = [...options];
  if (value && !mergedOpts.includes(value)) mergedOpts.unshift(value);
  const selectVal = mergedOpts.includes(value) ? value : "";

  return (
    <label className="grid gap-1">
      <div className="text-[13px] font-semibold text-slate-300">{label}</div>
      <select
        value={selectVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/45"
      >
        {placeholderOption != null ? (
          <option value="">{placeholderOption}</option>
        ) : null}
        {mergedOpts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <div className="text-[13px] font-semibold text-slate-300">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="min-h-[120px] w-full resize-y rounded-xl border border-white/[0.11] bg-slate-950/55 px-3 py-3 text-[15px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/45"
      />
    </label>
  );
}

function isoToLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function localInputToIso(v: string) {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

