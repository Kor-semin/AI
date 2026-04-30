"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import type { ParsedRow } from "./importContacts";
import {
  explainPurchaseIntent,
  LEAD_SCORE_HOTWORDS,
  scorePurchaseIntent,
} from "./leadScore";
import {
  buildUsedCarSearchQuery,
  formatKrwShort,
  parseMoneyToKrw,
  recommendModelsByBudget,
  summarizeMarketVsBudget,
} from "./recommendations";
import { getMemoFeedback } from "./memoFeedback";
import { makeId, seedState } from "./seed";
import { ContactSyncDialog } from "./ContactSyncDialog";
import { DeliveryGuideScreen } from "@/app/crm/deliveryGuide/DeliveryGuideScreen";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";

const LEAD_SOURCES = [...DEALER_LEAD_SOURCES] satisfies LeadSource[];
const STAGES = [...DEALER_PIPELINE_STAGES] satisfies PipelineStage[];

const BRAND_OPTIONS: VehicleBrandId[] = [...VEHICLE_BRANDS];

const PAYMENT_TYPE_OPTIONS: PaymentType[] = ["현금", "할부", "리스", "장기렌트"];
const ACCIDENT_OPTIONS: UsedCarAccident[] = ["무사고", "단순교환", "사고", "미상"];

function nowIso() {
  return new Date().toISOString();
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

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#111827]">{value}</div>
      {hint ? <div className="mt-2 text-[14px] leading-snug text-[#6B7280]">{hint}</div> : null}
    </div>
  );
}

export function CRMApp({
  uid,
  sellerDisplayName,
}: {
  uid?: string | null;
  /** `{내이름}` 치환: 로그인 시 구글 이름·이메일 등 */
  sellerDisplayName?: string | null;
}) {
  const { t } = useLanguage();
  // uid=null means local-only mode.
  const [state, setState] = useState<CRMState>(() => emptyState());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"고객" | "다음할일" | "일정" | "템플릿">("고객");
  const didHydrateRef = useRef(false);
  const [sync, setSync] = useState<SyncStatus>({ mode: uid ? "cloud" : "local", status: "idle" });
  const cloudPartsRef = useRef<Partial<CRMState>>({});

  const SEARCH_SHORTCUT_HINT = "(Ctrl+K)";
  const SELLER_NICK_KEY = "crm.sellerNickname";
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  /** 문자 템플릿 `{내이름}` : 로컬 입력이 있으면 우선 */
  const [sellerNickname, setSellerNickname] = useState("");
  const [contactSyncOpen, setContactSyncOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [leadExplainForId, setLeadExplainForId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deliveryGuideOpen, setDeliveryGuideOpen] = useState(false);

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
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          setState(migrateCRMState(next));
          setSelectedCustomerId((prev) => prev ?? next.customers[0]?.id ?? null);
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
    if (!didHydrateRef.current) return;
    // Always keep a local copy (offline fallback / quick restore).
    saveState(state);
  }, [state]);

  const customersFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...state.customers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (!q) return list;
    return list.filter((c) => {
      const hay = `${c.name} ${c.phone ?? ""} ${c.email ?? ""} ${c.vehicleBrand ?? ""} ${
        c.interestedModel ?? ""
      } ${c.compareVehicles ?? ""} ${c.purchaseTiming ?? ""} ${c.memo ?? ""} ${c.personalityMemo ?? ""} ${c.leadSource} ${c.stage}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, state.customers]);

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

  function upsertCustomer(patch: Partial<Customer> & { id: string }) {
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
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function addCustomer() {
    const id = makeId("cus");
    const t = nowIso();
    const customer: Customer = {
      id,
      createdAt: t,
      updatedAt: t,
      name: "새 고객",
      leadSource: "전화·매장방문",
      stage: "신규 문의",
    };
    setState((prev) => ({ ...prev, customers: [customer, ...prev.customers] }));
    setSelectedCustomerId(id);
    setTab("고객");

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void createCustomerCloud(uid, customer)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function ingestPastedContacts(rows: ParsedRow[]) {
    if (rows.length === 0) {
      alert("인식된 연락처가 없습니다. 전화번호·이름 형식으로 붙여넣어 보세요.");
      return;
    }
    const t = nowIso();
    const batch: Customer[] = rows.map((row) => ({
      id: makeId("cus"),
      createdAt: t,
      updatedAt: t,
      name: row.name || "신규",
      phone: row.phone,
      memo: row.memo,
      leadSource: "전화·매장방문",
      stage: "신규 문의",
    }));
    setState((prev) => ({ ...prev, customers: [...batch, ...prev.customers] }));
    setSelectedCustomerId(batch[0]!.id);
    setTab("고객");
    setContactSyncOpen(false);
    setPasteText("");

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void Promise.all(batch.map((c) => createCustomerCloud(uid!, c)))
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }

    alert(
      `연락처 ${batch.length}명을 불러왔습니다. 정보를 확인·수정해 주세요.\n구글·네이버 등은 「연락처 연동」에서 페이지를 연 뒤 복사·붙여넣기 또는 .vcf로 가져오면 됩니다.`,
    );
  }

  function deleteCustomer(id: string) {
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

  function addNextAction(customerId: string) {
    const t = nowIso();
    const action: NextAction = {
      id: makeId("act"),
      customerId,
      createdAt: t,
      dueAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      title: "다음 할 일",
    };
    setState((prev) => ({ ...prev, nextActions: [action, ...prev.nextActions] }));
    setTab("다음할일");

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void createNextActionCloud(uid, action)
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }
  }

  function toggleNextActionDone(id: string) {
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
      <div id="crm-main" className="w-full min-w-0 pb-8 lg:pb-10">
        <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-6 px-2 sm:px-4 xl:px-0">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="min-w-0">
              <h1 className="text-[clamp(22px,2.8vw,30px)] font-semibold leading-tight tracking-tight text-[#111827]">
                {t("product.name")}
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#6B7280]">
                {sync.mode === "cloud" ? "클라우드 동기화" : "로컬 저장"} ·{" "}
                {sync.status === "syncing"
                  ? "동기화 중…"
                  : sync.status === "error"
                    ? "동기화 오류"
                    : "정상"}{" "}
                · v0.3
              </p>
            </div>
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch lg:max-w-[540px]">
              <label className="min-w-0 flex-1">
                <span className="sr-only">{t("common.search")}</span>
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`이름 · 연락처 · 차종 · 메모 (${SEARCH_SHORTCUT_HINT})`}
                  title="어디서나 Ctrl+K (⌘K) 로 포커스"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3.5 text-[15px] text-[#111827] outline-none transition focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]/65"
                />
              </label>
              <button
                type="button"
                className="shrink-0 rounded-xl bg-[#111827] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#94A3B8] sm:w-auto sm:whitespace-nowrap"
                onClick={addCustomer}
              >
                + {t("crm.addCustomer")}
              </button>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-2 sm:justify-between">
            <label className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="whitespace-nowrap text-[13px] font-semibold text-[#374151]">
                내 이름 · 템플릿 치환
              </span>
              <input
                value={sellerNickname}
                onChange={(e) => persistSellerNickname(e.target.value)}
                placeholder="예: 김실장"
                className="max-w-xs flex-1 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-[15px] text-[#111827] outline-none focus:border-[#94A3B8]"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-2.5 text-[14px] font-semibold text-[#111827] ring-1 ring-inset ring-[#E5E7EB] transition hover:bg-[#F3F4F6]"
                onClick={() => setContactSyncOpen(true)}
              >
                연락처 연동
              </button>
              {selectedCustomer ? (
                <button
                  type="button"
                  className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-2.5 text-[14px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
                  onClick={() => setDeliveryGuideOpen(true)}
                >
                  AI 출고 안내서
                </button>
              ) : null}
            </div>
          </div>

          <nav
            className="flex flex-wrap gap-1 border-b border-[#E5E7EB]"
            aria-label="업무 영역"
          >
            {(["고객", "다음할일", "일정", "템플릿"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  "-mb-px px-5 py-3 text-[14px] font-semibold transition",
                  tab === t
                    ? "border-b-2 border-[#111827] text-[#111827]"
                    : "border-b-2 border-transparent text-[#6B7280] hover:text-[#111827]",
                ].join(" ")}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>

          <div
            id="crm-overview-stats"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard label={t("crm.stat.todayFollowups")} value={overviewStats.dueToday} hint="오늘 기한 후속" />
            <StatCard
              label={t("crm.stat.dealProbability")}
              value={overviewStats.highPotential}
              hint="가망등급 A·S 및 66%+"
            />
            <StatCard label={t("crm.stat.followupNeeded")} value={overviewStats.followUp} hint="미완료 업무 수" />
            <StatCard label={t("crm.stat.recentConsultations")} value={overviewStats.recentConsult} hint="7일 내 기록 수정" />
          </div>

          {tab === "고객" ? (
            <div className="flex min-w-0 flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1.06fr)_minmax(336px,0.94fr)] xl:items-start xl:gap-8">
              <div
                id="crm-customer-table"
                className="min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_4px_rgba(15,23,42,0.04)] xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-13rem)] xl:overflow-auto"
              >
                <div className="border-b border-[#E5E7EB] px-5 py-5 sm:px-6">
                  <h2 className="text-[18px] font-semibold text-[#111827]">{t("crm.section.customerList")}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">
                    고객 행을 눌러 선택합니다. 선택 시 오른쪽에서 상세·상담·후속 업무를 이어서 다룹니다.
                  </p>
                </div>
                <div className="overflow-x-auto xl:overflow-y-auto xl:[max-height:calc(100vh-20rem)]">
                  <table className="min-w-[880px] w-full text-left">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                        <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] sm:px-6">
                          고객명
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] sm:px-6">
                          {t("common.interestedVehicle")}
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] sm:px-6">
                          {t("common.status")}
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] sm:px-6">
                          {t("crm.section.nextAction")}
                        </th>
                        <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#6B7280] sm:px-6">
                          {t("common.potential")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {customersFiltered.map((c) => {
                        const na = state.nextActions.find((a) => a.customerId === c.id && !a.doneAt);
                        const nextLbl = na?.title?.trim()
                          ? na.title
                          : c.nextContactAt
                            ? formatDateTime(c.nextContactAt)
                            : "—";
                        const sx = scorePurchaseIntent(c);
                        return (
                          <tr
                            key={c.id}
                            className={
                              selectedCustomerId === c.id
                                ? "bg-[#F1F5F9]"
                                : "bg-[#FFFFFF] hover:bg-[#FAFBFC]"
                            }
                          >
                            <td className="px-5 py-4 align-top sm:px-6">
                              <button
                                type="button"
                                className="text-left font-semibold text-[#111827] text-[16px] leading-snug hover:underline"
                                onClick={() => setSelectedCustomerId(c.id)}
                              >
                                {c.name}
                              </button>
                              <div className="mt-1 text-[14px] text-[#9CA3AF]">
                                {c.phone?.trim() || "연락처 없음"}
                              </div>
                            </td>
                            <td className="max-w-[220px] px-5 py-4 align-top text-[15px] text-[#374151] sm:px-6">
                              {[c.vehicleBrand, c.interestedModel].filter(Boolean).join(" ") || "—"}
                            </td>
                            <td className="px-5 py-4 align-top text-[15px] font-semibold text-[#111827] sm:px-6">
                              {c.stage}
                            </td>
                            <td className="max-w-[260px] px-5 py-4 align-top text-[14px] leading-snug text-[#6B7280] sm:px-6">
                              {clampText(nextLbl, 90)}
                            </td>
                            <td className="px-5 py-4 align-top sm:px-6">
                              <button
                                type="button"
                                title="산정 기준"
                                className="text-[15px] font-semibold text-[#475569] underline decoration-[#CBD5E1] underline-offset-[5px] hover:text-[#111827]"
                                onClick={() => setLeadExplainForId(c.id)}
                              >
                                {sx.percent}% · {sx.grade}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {customersFiltered.length === 0 ? (
                  <div className="border-t border-[#E5E7EB] px-8 py-14 text-center">
                    <p className="text-[18px] font-semibold text-[#111827]">등록된 고객이 없습니다</p>
                    <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#6B7280]">
                      첫 고객을 추가하고 상담 메모와 후속 할 일을 이어 가 보세요.
                    </p>
                    <button
                      type="button"
                      className="mt-8 rounded-xl bg-[#111827] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#1F2937]"
                      onClick={addCustomer}
                    >
                      고객 추가하기
                    </button>
                  </div>
                ) : null}
              </div>

              <section
                id="crm-detail-panel"
                tabIndex={-1}
                className="flex min-h-[48vh] min-w-0 flex-col gap-5 xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto"
              >
                <header id="crm-detail-header" className="scroll-mt-28 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] px-6 py-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[22px] font-semibold tracking-tight text-[#111827]">
                        {selectedCustomer ? selectedCustomer.name : t("crm.section.customerDetails")}
                      </div>
                      <div className="mt-2 text-[15px] text-[#6B7280]">
                        {selectedCustomer
                          ? `${selectedCustomer.phone?.trim() || "연락처 미입력"} · 마지막 기록 ${formatDateTime(selectedCustomer.updatedAt)}`
                          : "목록에서 고객을 선택하거나 새로 추가합니다."}
                      </div>
                      {selectedCustomer?.phone?.trim() ? (
                        <button
                          type="button"
                          className="mt-3 rounded-lg bg-[#F3F4F6] px-4 py-2 text-[13px] font-semibold text-[#374151] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#E5E7EB]"
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
                          className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-[13px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
                        >
                          AI 출고 안내서
                        </button>
                        <button
                          type="button"
                          onClick={() => addNextAction(selectedCustomer.id)}
                          className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-[13px] font-semibold hover:bg-[#F3F4F6]"
                        >
                          + 다음 연락
                        </button>
                        <button
                          type="button"
                          onClick={() => addEvent(selectedCustomer.id)}
                          className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-[13px] font-semibold hover:bg-[#F3F4F6]"
                        >
                          + 일정
                        </button>
                        <button
                          type="button"
                          onClick={() => exportCustomerSummary(selectedCustomer)}
                          className="rounded-xl bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1F2937]"
                        >
                          요약 내보내기
                        </button>
                      </div>
                    ) : null}
                  </div>
                </header>

                <div className="flex flex-col gap-6">
          {selectedCustomer ? (
            <>
              {memoFeedback ? (
                <div className="rounded-2xl border border-[#CBD5E1] bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] p-6 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                      {t("crm.section.aiRecommendation")}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeliveryGuideOpen(true)}
                      className="rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1F2937]"
                    >
                      출고 안내서
                    </button>
                  </div>
                  <ul className="mt-4 space-y-3 text-[16px] leading-relaxed text-[#111827]">
                    {memoFeedback.bullets.slice(0, 5).map((b) => (
                      <li key={b}>· {b}</li>
                    ))}
                  </ul>
                  {memoFeedback.risks.length ? (
                    <div className="mt-4 rounded-xl bg-[#F1F5F9] px-4 py-3 text-[13px] text-[#64748B]">
                      <span className="font-semibold text-[#475569]">점검: </span>
                      {memoFeedback.risks.slice(0, 3).join(" · ")}
                    </div>
                  ) : null}
                  {memoFeedback.nextQuestions[0] ? (
                    <>
                      <p className="mt-5 text-[13px] font-semibold text-[#374151]">다음 연락 때 질문</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">
                        {memoFeedback.nextQuestions[0]}
                      </p>
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                      {t("crm.section.consultationSummary")} · 고객 메시지
                    </div>
                    <div className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">
                      상담/예산/차량 메모를 바탕으로 자동으로 정리됩니다. 필요하면 문장을 수정해도 됩니다.
                    </div>
                  </div>
                </div>
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
                        className="mt-4 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
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
                          className="rounded-xl bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1F2937]"
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

              <div className="flex flex-col gap-6">
                <details
                  id="crm-block-budget"
                  className="scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-1.5 outline-none transition hover:bg-[#F9FAFB]">
                    <div>
                      <div className="text-[16px] font-semibold text-[#111827]">{t("crm.financeMarketInfo")}</div>
                      <div className="mt-1 text-[13px] text-[#6B7280]">필요할 때 펼쳐서 입력·확인</div>
                    </div>
                    <span className="rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-[12px] font-semibold text-[#475569]">
                      펼치기
                    </span>
                  </summary>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <div className="text-xs font-semibold text-[#374151]">금융 유형</div>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_TYPE_OPTIONS.map((pt) => (
                          <button
                            key={pt}
                            type="button"
                            className={[
                              "rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                              selectedCustomer.paymentType === pt
                                ? "border-[#111827] bg-[#F3F4F6] text-[#111827] shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)]"
                                : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]",
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
                          className="rounded-full border border-dashed border-[#D1D5DB] px-3 py-1.5 text-[11px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6]"
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
                      <div className="text-[11px] text-[#6B7280]">
                        해석: 약{" "}
                        <span className="font-semibold text-[#111827]">
                          {formatKrwShort(budgetWonSelected)}원
                        </span>{" "}
                        전후로 읽었습니다.
                      </div>
                    ) : null}

                    <div
                      id="crm-block-compare"
                      tabIndex={-1}
                      className="scroll-mt-24 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                    >
                      <div className="text-xs font-semibold text-[#111827]">
                        예산 기준 비교 차종(참고)
                      </div>
                      {budgetRecs.length ? (
                        <ul className="mt-2 space-y-2 text-xs text-[#374151]">
                          {budgetRecs.map((pick) => (
                            <li
                              key={pick.label}
                              className="flex flex-col gap-2 rounded-lg border border-[#E5E7EB] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="font-semibold">{pick.label}</div>
                                {pick.note ? (
                                  <div className="mt-0.5 text-[11px] text-[#6B7280]">
                                    {pick.note}
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-semibold hover:bg-[#F3F4F6]"
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
                                  className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-semibold hover:bg-[#F3F4F6]"
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
                        <div className="mt-2 text-xs text-[#6B7280]">
                          예산을 숫자로 적으면 이 구간에 비교 후보가 나옵니다.
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                      <div className="text-xs font-semibold text-[#111827]">
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
                        <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] text-[#374151]">
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
                      className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F3F4F6]"
                    >
                      고객 삭제
                    </button>
                  </div>
                </details>

                <details
                  id="crm-block-used-car"
                  className="scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-1.5 outline-none transition hover:bg-[#F9FAFB]">
                    <div>
                      <div className="text-[16px] font-semibold text-[#111827]">{t("crm.tradeInSummary")}</div>
                      <div className="mt-1 text-[13px] text-[#6B7280]">검색어 생성 · 연식/주행/사고 기록</div>
                    </div>
                    <span className="rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-[12px] font-semibold text-[#475569]">
                      펼치기
                    </span>
                  </summary>
                  <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                    <div className="text-xs font-semibold text-[#111827]">중고차 정리(검색어 생성)</div>
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
                        className="rounded-lg bg-[#111827] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1F2937]"
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
                        className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#F3F4F6]"
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
                    <p className="mt-2 text-[11px] text-[#6B7280]">
                      검색어:{" "}
                      <span className="font-medium text-[#374151]">
                        {buildUsedCarSearchQuery(selectedCustomer)}
                      </span>
                    </p>
                  </div>
                </details>

                <div
                  id="crm-block-profile"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-white p-5 outline-none"
                >
                  <div className="text-sm font-semibold">고객·상담 정보</div>
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
                      <div className="rounded-xl border border-dashed border-[#E5E7EB] px-3 py-2 text-xs text-[#6B7280]">
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
                </div>

                <div
                  id="crm-block-quick-tpl"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-white p-5 outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{t("crm.section.templates")}</div>
                    <button
                      onClick={addTemplate}
                      className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#F3F4F6]"
                    >
                      + 템플릿
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {quickTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-left hover:bg-[#F3F4F6]"
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
                        <div className="mt-1 text-xs text-[#6B7280]">
                          클릭하면 고객명 치환 후 복사
                        </div>
                      </button>
                    ))}
                    {state.templates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#D1D5DB] p-4 text-xs text-[#6B7280]">
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
                  className="scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-white p-5 outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">다음 연락 · 후속 액션</div>
                    <button
                      onClick={() => addNextAction(selectedCustomer.id)}
                      className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#F3F4F6]"
                    >
                      + 추가
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedNextActions.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-[#E5E7EB] bg-white p-3"
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
                          <div className="text-[11px] text-[#6B7280]">
                            {a.doneAt ? "완료" : "미완료"}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-xs text-[#6B7280]">기한</div>
                          <input
                            type="datetime-local"
                            value={isoToLocalInput(a.dueAt)}
                            onChange={(e) =>
                              updateNextAction(a.id, { dueAt: localInputToIso(e.target.value) })
                            }
                            className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-xs outline-none focus:border-[#94A3B8]"
                          />
                        </div>
                      </div>
                    ))}
                    {selectedNextActions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#D1D5DB] p-4 text-xs text-[#6B7280]">
                        아직 없습니다. “+ 추가”로 만들어보세요.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  id="crm-block-events"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-white p-5 outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{t("crm.tab.events")}</div>
                    <button
                      onClick={() => addEvent(selectedCustomer.id)}
                      className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#F3F4F6]"
                    >
                      + 추가
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedEvents.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-xl border border-[#E5E7EB] bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <input
                            value={e.title}
                            onChange={(ev) => updateEvent(e.id, { title: ev.target.value })}
                            className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold outline-none"
                          />
                          <div className="text-[11px] text-[#6B7280]">
                            {formatDateTime(e.startAt)}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="text-xs text-[#6B7280]">시작</div>
                          <input
                            type="datetime-local"
                            value={isoToLocalInput(e.startAt)}
                            onChange={(ev) =>
                              updateEvent(e.id, { startAt: localInputToIso(ev.target.value) })
                            }
                            className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-xs outline-none focus:border-[#94A3B8]"
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
                            className="min-h-[70px] w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs outline-none focus:border-[#94A3B8]"
                          />
                        </div>
                      </div>
                    ))}
                    {selectedEvents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#D1D5DB] p-4 text-xs text-[#6B7280]">
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
              className="scroll-mt-24 rounded-2xl border border-dashed border-[#D1D5DB] bg-white p-8 text-sm text-[#6B7280] outline-none"
            >
              목록에서 고객을 선택하거나 <span className="font-semibold">위의 “+ 고객 추가”</span>로 상담을
              등록하세요. 고객을 열면 <span className="font-semibold text-[#111827]">상담 메모</span>,
              <span className="font-semibold text-[#111827]"> 다음 연락</span>,
              <span className="font-semibold text-[#111827]"> 일정</span>을 한 화면에서 이어서 관리할 수 있습니다.
            </div>
          )}

                </div>
              </section>
            </div>
          ) : tab === "다음할일" ? (
            <div id="crm-workspace-next" className="space-y-6">
              <p className="text-[15px] leading-relaxed text-[#6B7280]">
                선택한 고객과 무관하게 <span className="font-semibold text-[#374151]">모든 다음 연락</span>을 한눈에
                봅니다. 행을 눌러 해당 고객으로 이동합니다.
              </p>
              <div
                id="crm-block-global"
                tabIndex={-1}
                className="scroll-mt-24 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-[0_1px_4px_rgba(15,23,42,0.04)] outline-none"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[16px] font-semibold text-[#111827]">{t("common.backup")}</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => downloadText("crm_backup.json", JSON.stringify(state, null, 2))}
                      className="rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-2.5 text-[13px] font-semibold text-[#111827] hover:bg-[#E5E7EB]"
                    >
                      {t("common.backup")}(.json)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm("로컬 데이터를 초기화할까요? (되돌리기 어렵습니다)")) return;
                        const next = seedState();
                        setState(next);
                        setSelectedCustomerId(next.customers[0]?.id ?? null);
                      }}
                      className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-[13px] font-semibold text-[#64748B] hover:bg-[#F9FAFB]"
                    >
                      {t("common.reset")}(샘플)
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                    <div className="text-[13px] font-semibold text-[#111827]">{t("crm.section.allNextActions")}</div>
                    <div className="mt-4 max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
                      {allNextActions.map((a) => {
                        const c = state.customers.find((x) => x.id === a.customerId);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomerId(a.customerId);
                              setTab("고객");
                            }}
                            className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 text-left text-[14px] transition hover:bg-[#F9FAFB]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate font-semibold text-[#111827]">
                                {a.doneAt ? "완료 · " : ""}
                                {a.title}
                              </div>
                              <div className="shrink-0 text-[13px] text-[#9CA3AF]">
                                {formatDateTime(a.dueAt)}
                              </div>
                            </div>
                            <div className="mt-1 text-[13px] text-[#6B7280]">{c?.name ?? "알 수 없음"}</div>
                          </button>
                        );
                      })}
                      {allNextActions.length === 0 ? (
                        <div className="text-[14px] text-[#6B7280]">등록된 다음 연락이 없습니다.</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                    <div className="text-[13px] font-semibold text-[#111827]">{t("crm.section.eventsPreview")}</div>
                    <div className="mt-4 max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
                      {allEvents.slice(0, 24).map((e) => (
                        <div
                          key={e.id}
                          className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 text-[14px]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="font-semibold text-[#111827]">{e.title}</div>
                            <div className="text-[13px] text-[#9CA3AF]">{formatDateTime(e.startAt)}</div>
                          </div>
                          {e.customerId ? (
                            <button
                              type="button"
                              className="mt-2 text-[13px] font-semibold text-[#475569] underline underline-offset-4 hover:text-[#111827]"
                              onClick={() => {
                                setSelectedCustomerId(e.customerId!);
                                setTab("고객");
                              }}
                            >
                              고객: {state.customers.find((x) => x.id === e.customerId)?.name ?? "?"}
                            </button>
                          ) : (
                            <div className="mt-2 text-[13px] text-[#9CA3AF]">고객 연결 없음</div>
                          )}
                        </div>
                      ))}
                      {allEvents.length === 0 ? (
                        <div className="text-[14px] text-[#6B7280]">등록된 일정이 없습니다.</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : tab === "일정" ? (
            <div id="crm-workspace-events" className="space-y-4">
              <p className="text-[15px] leading-relaxed text-[#6B7280]">
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
                      setTab("고객");
                    }}
                    className="flex w-full flex-col rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-4 text-left transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="text-[17px] font-semibold text-[#111827]">{e.title}</span>
                    <span className="mt-2 text-[15px] text-[#9CA3AF]">{formatDateTime(e.startAt)}</span>
                    {e.customerId ? (
                      <span className="mt-2 text-[14px] font-semibold text-[#475569]">
                        고객: {state.customers.find((x) => x.id === e.customerId)?.name ?? "?"}
                      </span>
                    ) : (
                      <span className="mt-2 text-[14px] text-[#9CA3AF]">고객 미연결</span>
                    )}
                  </button>
                ))}
                {allEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#FFFFFF] px-6 py-12 text-center text-[15px] text-[#6B7280]">
                    일정이 없습니다.
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div
              id="crm-block-templates"
              tabIndex={-1}
              className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-[0_1px_4px_rgba(15,23,42,0.04)] outline-none"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[18px] font-semibold text-[#111827]">{t("crm.section.templates")}</div>
                <button
                  type="button"
                  onClick={addTemplate}
                  className="rounded-xl bg-[#111827] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#1F2937]"
                >
                  + 템플릿
                </button>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {state.templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5"
                  >
                    <input
                      className="w-full border-0 bg-transparent text-[17px] font-semibold text-[#111827] outline-none"
                      value={tpl.title}
                      onChange={(e) => updateTemplate(tpl.id, { title: e.target.value })}
                    />
                    <textarea
                      className="mt-3 min-h-[130px] w-full resize-y rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
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
                        className="rounded-xl bg-[#F3F4F6] px-4 py-2.5 text-[13px] font-semibold text-[#111827] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#E5E7EB]"
                      >
                        {selectedCustomer ? `${t("common.select")} · ${t("common.copy")}` : t("common.copy")}
                      </button>
                      <div className="text-[12px] text-[#9CA3AF]">업데이트: {formatDateTime(tpl.updatedAt)}</div>
                    </div>
                  </div>
                ))}
                {state.templates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D1D5DB] px-8 py-12 text-center text-[15px] text-[#6B7280]">
                    템플릿이 없습니다.
                  </div>
                ) : null}
              </div>
            </div>
          )}
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
            className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="lead-explain-title"
              className="text-sm font-semibold text-[#111827]"
            >
              가망 % 산정 기준
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              실제 계약 가능성이 아니라, 입력된 메모·예산·관심차종·연락처 정보만으로 빠르게 정렬하기 위한
              참고 점수입니다.
            </p>
            {(() => {
              const c = state.customers.find((x) => x.id === leadExplainForId);
              if (!c) {
                return (
                  <p className="mt-3 text-xs text-[#6B7280]">
                    고객 정보를 찾지 못했습니다.
                  </p>
                );
              }
              const ex = explainPurchaseIntent(c);
              return (
                <div className="mt-3 space-y-3 text-xs text-[#111827]">
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                    <span className="font-semibold text-[#334155]">
                      결과: {ex.percent}% · 등급 {ex.grade}
                    </span>
                    <div className="mt-1 text-[11px] text-[#6B7280]">
                      힌트: {ex.hints.join(" · ")}
                    </div>
                  </div>
                  <ul className="list-decimal space-y-1.5 pl-4 text-[11px] leading-relaxed text-[#374151]">
                    {ex.breakdown.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-[#6B7280]">
                    키워드 예시: {LEAD_SCORE_HOTWORDS.join(", ")}
                  </div>
                </div>
              );
            })()}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-[#111827] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1F2937]"
                onClick={() => setLeadExplainForId(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ContactSyncDialog
        open={contactSyncOpen}
        onClose={() => setContactSyncOpen(false)}
        pasteText={pasteText}
        setPasteText={setPasteText}
        onIngestFromParsed={ingestPastedContacts}
        showToast={showToast}
      />

      {deliveryGuideOpen && selectedCustomer ? (
        <div className="fixed inset-0 z-[320] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center">
          <div className="max-h-[92vh] w-full max-w-[920px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
              <div className="text-sm font-extrabold text-[#111827]">AI 출고 안내서</div>
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
              />
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-[400] w-[min(520px,calc(100vw-24px))] -translate-x-1/2">
          <div className="rounded-full border border-[#E5E7EB] bg-white/95 px-4 py-2 text-center text-xs font-semibold text-[#111827] shadow-lg backdrop-blur">
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
      <div className="text-[13px] font-semibold text-[#374151]">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-[15px] outline-none focus:border-[#94A3B8]"
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
      <div className="text-xs font-semibold text-[#374151]">{label}</div>
      <input
        type="datetime-local"
        value={isoToLocalInput(valueIso)}
        onChange={(e) => onChangeIso(localInputToIso(e.target.value))}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#94A3B8]"
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
      <div className="text-xs font-semibold text-[#374151]">{label}</div>
      <input
        value={value}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#94A3B8]"
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
      <div className="text-[13px] font-semibold text-[#374151]">{label}</div>
      <select
        value={selectVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-[15px] outline-none focus:border-[#94A3B8]"
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
      <div className="text-[13px] font-semibold text-[#374151]">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="min-h-[120px] w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-[15px] outline-none focus:border-[#94A3B8]"
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

