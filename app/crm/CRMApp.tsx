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
  encarSearchUrl,
  formatKrwShort,
  parseMoneyToKrw,
  recommendModelsByBudget,
  summarizeMarketVsBudget,
} from "./recommendations";
import { getMemoFeedback } from "./memoFeedback";
import { makeId, seedState } from "./seed";
import { CRMAppToc } from "./CRMAppToc";
import { ContactSyncDialog } from "./ContactSyncDialog";
import { DeliveryGuideScreen } from "@/app/crm/deliveryGuide/DeliveryGuideScreen";

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

export function CRMApp({
  uid,
  sellerDisplayName,
}: {
  uid?: string | null;
  /** `{내이름}` 치환: 로그인 시 구글 이름·이메일 등 */
  sellerDisplayName?: string | null;
}) {
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
    고객: "고객",
    다음할일: "다음 연락",
    일정: "일정",
    템플릿: "문자 템플릿",
  };

  function scrollToId(id: string) {
    window.requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        el.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    });
  }

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
      <div className="flex w-full flex-col">
        <CRMAppToc hasCustomer={Boolean(selectedCustomer)} tab={tab} setTab={setTab} />

        <div className="flex min-h-0 w-full flex-1">
      <aside
        id="crm-aside"
        tabIndex={-1}
        className="w-[360px] shrink-0 scroll-mt-24 border-r border-[color:var(--edge)] bg-[color:var(--paper)] p-4 outline-none"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="text-sm font-semibold tracking-tight">자동차 영업 AI 비서형 CRM</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {sync.mode === "cloud" ? "클라우드 동기화" : "로컬 저장"} ·{" "}
              {sync.status === "syncing"
                ? "동기화 중…"
                  : sync.status === "error"
                  ? "동기화 오류"
                  : "정상"}{" "}
              · v0.3
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              className="moleskine-ink-btn rounded-lg px-3 py-2 text-xs font-semibold"
              onClick={addCustomer}
            >
              + 고객 추가
            </button>
          </div>
        </div>

        <section
          id="crm-contact-sync"
          tabIndex={-1}
          className="scroll-mt-24 mt-4 rounded-xl border border-emerald-600/35 bg-emerald-50/95 p-4 shadow-[0_10px_32px_-12px_rgba(16,185,129,0.35)] dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:shadow-[0_10px_32px_-12px_rgba(0,0,0,0.45)]"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-900 dark:text-emerald-300">
            연락처 연동
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            구글·네이버·Outlook 주소록을 새 탭에서 열고, 복사·붙여넣기 또는 .vcf로 이 수첩에 반영할 수 있습니다.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-gradient-to-br from-emerald-700 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 active:translate-y-px dark:from-emerald-600 dark:to-teal-700"
            onClick={() => setContactSyncOpen(true)}
          >
            연동 · 가져오기
          </button>
        </section>

        <label className="mt-4 grid gap-1">
          <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">내 이름 (문자 템플릿)</div>
          <input
            value={sellerNickname}
            onChange={(e) => persistSellerNickname(e.target.value)}
            placeholder="예: 김실장 로그인 전에도 이름 고정 가능"
            className="w-full rounded-lg border border-[color:var(--edge)] bg-[color:var(--paper)] px-3 py-1.5 text-xs outline-none focus:border-[color:var(--edge-strong)]"
          />
        </label>

        <div className="mt-4">
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`이름/연락처/차종 검색 · ${SEARCH_SHORTCUT_HINT}`}
            className="w-full rounded-lg border border-[color:var(--edge)] bg-[color:var(--paper)] px-3 py-2 text-sm outline-none focus:border-[color:var(--edge-strong)]"
            title="어디서나 Ctrl+K (Mac: ⌘K) 로 포커스"
          />
        </div>

        <nav
          className="mt-4 rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/55 p-3"
          aria-label="주요 메뉴"
        >
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-600 dark:text-zinc-300">
            메뉴
          </div>
          <div className="mt-2 grid gap-1.5">
            <MenuBtn
              icon="home"
              label="홈"
              onClick={() => {
                scrollToId("crm-main");
              }}
            />
            <MenuBtn
              icon="users"
              label="고객 목록"
              onClick={() => {
                setTab("고객");
                scrollToId("crm-aside");
              }}
            />
            <MenuBtn
              icon="sparkles"
              label="AI 출고 안내서"
              emphasize
              onClick={() => {
                if (!selectedCustomerId && state.customers[0]?.id) {
                  setSelectedCustomerId(state.customers[0]!.id);
                }
                setDeliveryGuideOpen(true);
              }}
            />
            <MenuBtn
              icon="check"
              label="오늘 할 일"
              onClick={() => {
                setTab("다음할일");
                scrollToId("crm-detail-header");
              }}
            />
            <MenuBtn
              icon="calendar"
              label="일정 관리"
              onClick={() => {
                setTab("일정");
                scrollToId("crm-detail-header");
              }}
            />
            <MenuBtn
              icon="note"
              label="상담 메모"
              onClick={() => {
                scrollToId(selectedCustomerId ? "crm-block-memo" : "crm-detail-header");
              }}
            />
            <MenuBtn
              icon="message"
              label="메시지 템플릿"
              onClick={() => {
                setTab("템플릿");
                window.setTimeout(() => scrollToId("crm-block-templates"), 0);
              }}
            />
          </div>
        </nav>

        <nav className="mt-4 flex gap-2">
          {(["고객", "다음할일", "일정", "템플릿"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                tab === t
                  ? "bg-[color:var(--accent)] text-[color:var(--paper)]"
                  : "bg-[color:var(--paper-2)] text-zinc-800 hover:bg-[color:var(--paper-2)]/70",
              ].join(" ")}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>

        <div className="mt-4 space-y-2">
          {customersFiltered.map((c) => (
            <div
              key={c.id}
              className={[
                "flex w-full items-stretch gap-0 overflow-hidden rounded-xl border transition-colors",
                selectedCustomerId === c.id
                  ? "border-[color:var(--edge-strong)] bg-[color:var(--paper-2)]"
                  : "border-[color:var(--edge)] bg-[color:var(--paper)]",
              ].join(" ")}
            >
              <button
                type="button"
                className="min-w-0 flex-1 p-3 text-left hover:bg-[color:var(--paper-2)]/70"
                onClick={() => setSelectedCustomerId(c.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {c.phone ?? "연락처 없음"} ·{" "}
                      {[c.vehicleBrand, c.interestedModel].filter(Boolean).join(" ") ||
                        "브랜드·차종 없음"}
                    </div>
                  </div>
                    <div className="shrink-0 text-right">
                    <div className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-200">
                      {c.stage}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{c.leadSource}</div>
                    <button
                      type="button"
                      className="mt-0.5 text-left text-[10px] font-semibold text-emerald-800 underline decoration-emerald-800/40 underline-offset-2 hover:decoration-emerald-700 dark:text-emerald-400 dark:decoration-emerald-400/40"
                      title="가망 % 산정 기준 보기"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLeadExplainForId(c.id);
                      }}
                    >
                      {(() => {
                        const sx = scorePurchaseIntent(c);
                        return `가망 ${sx.percent}% · ${sx.grade}`;
                      })()}
                    </button>
                  </div>
                </div>
                {c.memo ? (
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {clampText(c.memo, 60)}
                  </div>
                ) : null}
              </button>
              {c.phone?.trim() ? (
                <button
                  type="button"
                  title="전화번호 복사"
                  className="shrink-0 self-stretch border-l border-[color:var(--edge)] px-2 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copyToClipboard(c.phone!.trim()).then((ok) => {
                      if (ok && typeof navigator !== "undefined" && "vibrate" in navigator)
                        navigator.vibrate(15);
                    });
                  }}
                >
                  복사
                </button>
              ) : null}
            </div>
          ))}
          {customersFiltered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">아직 등록된 고객이 없습니다</div>
              <div className="mt-1 leading-relaxed text-zinc-600 dark:text-zinc-300">
                상담 내용을 짧게 남기고, <span className="font-semibold">다음 연락</span>과{" "}
                <span className="font-semibold">일정</span>을 놓치지 않게 관리해보세요.
              </div>
              <button
                type="button"
                className="moleskine-ink-btn mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold"
                onClick={addCustomer}
              >
                첫 고객 등록하기
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header
          id="crm-detail-header"
          tabIndex={-1}
          className="scroll-mt-24 border-b border-zinc-200 bg-white px-6 py-4 outline-none dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight">
                {selectedCustomer ? selectedCustomer.name : "상담 고객을 선택하세요"}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {selectedCustomer
                  ? `마지막 기록: ${formatDateTime(selectedCustomer.updatedAt)}`
                  : "왼쪽 목록에서 선택 · 없다면 “+ 고객 추가”부터"}
              </div>
            </div>

            {selectedCustomer ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryGuideOpen(true);
                  }}
                  className="rounded-lg border border-[color:var(--edge)] bg-[color:var(--paper)] px-3 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:bg-[color:var(--paper-2)]"
                >
                  AI 출고 안내서
                </button>
                <button
                  onClick={() => addNextAction(selectedCustomer.id)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                >
                  + 다음 연락
                </button>
                <button
                  onClick={() => addEvent(selectedCustomer.id)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                >
                  + 일정
                </button>
                <button
                  onClick={() => exportCustomerSummary(selectedCustomer)}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  상담 요약 내보내기(.txt)
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-6">
          {selectedCustomer ? (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div
                  id="crm-block-profile"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
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
                      <div className="rounded-xl border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
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
                  id="crm-block-budget"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="text-sm font-semibold">금융·예산·시세 정리</div>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    시세는 엔카·보배에서 직접 확인한 값을 적어 두면, 예산과 비교해 한 줄로 정리합니다(자동 수집 아님).
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">금융 유형</div>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_TYPE_OPTIONS.map((pt) => (
                          <button
                            key={pt}
                            type="button"
                            className={[
                              "rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                              selectedCustomer.paymentType === pt
                                ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
                                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/30",
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
                          className="rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900/30"
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
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        해석: 약{" "}
                        <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                          {formatKrwShort(budgetWonSelected)}원
                        </span>{" "}
                        전후로 읽었습니다.
                      </div>
                    ) : null}

                    <div
                      id="crm-block-compare"
                      tabIndex={-1}
                      className="scroll-mt-24 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/30"
                    >
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        예산 기준 비교 차종(참고)
                      </div>
                      {budgetRecs.length ? (
                        <ul className="mt-2 space-y-2 text-xs text-zinc-700 dark:text-zinc-200">
                          {budgetRecs.map((pick) => (
                            <li
                              key={pick.label}
                              className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="font-semibold">{pick.label}</div>
                                {pick.note ? (
                                  <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {pick.note}
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
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
                                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
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
                        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          예산을 숫자로 적으면 이 구간에 비교 후보가 나옵니다.
                        </div>
                      )}
                    </div>

                    <div
                      id="crm-block-used-car"
                      tabIndex={-1}
                      className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        중고차 정리(엔카 바로 조회)
                      </div>
                      <datalist id="usedcar-brand-options">
                        {[
                          // 국산
                          "현대",
                          "기아",
                          "제네시스",
                          "쉐보레",
                          "르노코리아",
                          "KG모빌리티",
                          // 수입(자주 쓰는)
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
                        <datalist id={listIdForBrand("usedcar-model-options", selectedCustomer.usedCar?.brand)}>
                          {(() => {
                            const b = (selectedCustomer.usedCar?.brand ?? "").trim().toLowerCase();
                            const opts =
                              b === "현대"
                                ? ["그랜저", "쏘나타", "아반떼", "싼타페", "투싼", "팰리세이드", "아이오닉5", "아이오닉6"]
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
                        <datalist id={listIdForBrand("usedcar-trim-options", selectedCustomer.usedCar?.brand)}>
                          {(() => {
                            const b = (selectedCustomer.usedCar?.brand ?? "").trim().toLowerCase();
                            const common = ["프리미엄", "프레스티지", "익스클루시브", "캘리그래피", "노블레스", "시그니처"];
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
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {(() => {
                          const b = (selectedCustomer.usedCar?.brand ?? "").trim().toLowerCase();
                          const models =
                            b === "벤츠" || b === "mercedes" || b === "mercedes-benz"
                              ? ["E클래스", "C클래스", "S클래스", "GLC"]
                              : b === "bmw"
                                ? ["3시리즈", "5시리즈", "X3", "X5"]
                                : b === "아우디" || b === "audi"
                                  ? ["A6", "A4", "Q5", "Q7"]
                                  : b === "현대"
                                    ? ["그랜저", "쏘나타", "싼타페", "팰리세이드"]
                                    : b === "기아"
                                      ? ["K5", "K8", "쏘렌토", "카니발"]
                                      : b === "제네시스"
                                        ? ["G80", "G70", "GV80", "GV70"]
                                        : [];
                          return models.map((m) => (
                            <button
                              key={m}
                              type="button"
                              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/30"
                              onClick={() =>
                                upsertCustomer({
                                  id: selectedCustomer.id,
                                  usedCar: { ...(selectedCustomer.usedCar ?? {}), model: m },
                                })
                              }
                            >
                              {m}
                            </button>
                          ));
                        })()}
                        {(() => {
                          const b = (selectedCustomer.usedCar?.brand ?? "").trim().toLowerCase();
                          const trims =
                            b === "벤츠" || b === "mercedes" || b === "mercedes-benz"
                              ? ["Avantgarde", "AMG Line", "4MATIC", "Exclusive"]
                              : b === "bmw"
                                ? ["M Sport", "xDrive", "Luxury"]
                                : b === "아우디" || b === "audi"
                                  ? ["S line", "quattro", "Premium"]
                                  : ["프레스티지", "익스클루시브", "프리미엄", "시그니처"];
                          return trims.map((t) => (
                            <button
                              key={t}
                              type="button"
                              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/30"
                              onClick={() =>
                                upsertCustomer({
                                  id: selectedCustomer.id,
                                  usedCar: { ...(selectedCustomer.usedCar ?? {}), trim: t },
                                })
                              }
                            >
                              {t}
                            </button>
                          ));
                        })()}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {["현대", "기아", "제네시스", "벤츠", "BMW", "아우디"].map((b) => (
                          <button
                            key={b}
                            type="button"
                            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/30"
                            onClick={() =>
                              upsertCustomer({
                                id: selectedCustomer.id,
                                usedCar: { ...(selectedCustomer.usedCar ?? {}), brand: b },
                              })
                            }
                          >
                            {b}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="rounded-full border border-dashed border-zinc-300 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900/30"
                          onClick={() =>
                            upsertCustomer({
                              id: selectedCustomer.id,
                              usedCar: {
                                ...(selectedCustomer.usedCar ?? {}),
                                brand:
                                  selectedCustomer.usedCar?.brand ??
                                  (selectedCustomer.vehicleBrand && selectedCustomer.vehicleBrand !== "기타"
                                    ? selectedCustomer.vehicleBrand
                                    : ""),
                                model: selectedCustomer.usedCar?.model ?? (selectedCustomer.interestedModel ?? ""),
                              },
                            })
                          }
                        >
                          관심차종에서 가져오기
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                          onClick={() => {
                            const q = buildUsedCarSearchQuery(selectedCustomer);
                            window.open(encarSearchUrl(q), "_blank", "noopener,noreferrer");
                          }}
                        >
                          엔카 열기
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                          onClick={() => {
                            const q = buildUsedCarSearchQuery(selectedCustomer);
                            const url = encarSearchUrl(q);
                            void copyToClipboard(url).then((ok) => {
                              if (ok) showToast("엔카 링크 복사 완료");
                              else alert(url);
                            });
                          }}
                        >
                          링크 복사
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        검색어:{" "}
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                          {buildUsedCarSearchQuery(selectedCustomer)}
                        </span>
                      </p>
                      <div className="mt-2 grid gap-2">
                        <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                          엔카 링크(자동 생성)
                        </div>
                        <input
                          readOnly
                          value={encarSearchUrl(buildUsedCarSearchQuery(selectedCustomer))}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/25">
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        엔카 시세 메모(직접 확인 값)
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field
                          label="엔카 최저(만원/원)"
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
                          label="엔카 최고(만원/원)"
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
                        <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] text-zinc-700 dark:text-zinc-200">
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

                    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        상담 요약 메시지(자동 생성)
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        위에 입력한 상담/차량/시세/예산 메모를 바탕으로 짧게 정리합니다. 필요하면 문장을 수정해도 됩니다.
                      </p>
                      {(() => {
                        const q = buildUsedCarSearchQuery(selectedCustomer);
                        const url = encarSearchUrl(q);
                        const lines: string[] = [];
                        lines.push(`안녕하세요 ${selectedCustomer.name}님. ${myName}입니다.`);
                        if (selectedCustomer.usedCar?.brand || selectedCustomer.usedCar?.model || selectedCustomer.interestedModel) {
                          lines.push(`말씀주신 차량: ${q}`);
                        }
                        if (selectedCustomer.marketPrice?.encarMin || selectedCustomer.marketPrice?.encarMax) {
                          const mn = selectedCustomer.marketPrice?.encarMin?.trim();
                          const mx = selectedCustomer.marketPrice?.encarMax?.trim();
                          if (mn && mx) lines.push(`엔카 시세는 대략 ${mn} ~ ${mx} 범위로 확인됩니다(기준: ${selectedCustomer.marketPrice?.asOf ?? "최근"}).`);
                          else if (mn) lines.push(`엔카 최저가는 대략 ${mn}로 확인됩니다(기준: ${selectedCustomer.marketPrice?.asOf ?? "최근"}).`);
                          else if (mx) lines.push(`엔카 최고가는 대략 ${mx}로 확인됩니다(기준: ${selectedCustomer.marketPrice?.asOf ?? "최근"}).`);
                        }
                        if (selectedCustomer.budget?.trim()) {
                          lines.push(`예산: ${selectedCustomer.budget.trim()}`);
                        }
                        lines.push(`엔카 링크: ${url}`);
                        lines.push(`추가로 사고/보험이력(성능점검)까지 확인해서 안내드릴게요. 편하실 때 통화 가능 시간 부탁드립니다.`);
                        const text = lines.filter(Boolean).join("\n");
                        return (
                          <>
                            <textarea
                              rows={7}
                              className="mt-3 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
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
                                className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                                onClick={() => {
                                  void copyToClipboard(text).then((ok) => {
                                    if (ok) showToast("문자 내용 복사 완료");
                                    else alert(text);
                                  });
                                }}
                              >
                                메시지 복사
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                                onClick={() => {
                                  void copyToClipboard(url).then((ok) => {
                                    if (ok) showToast("엔카 링크 복사 완료");
                                    else alert(url);
                                  });
                                }}
                              >
                                링크만 복사
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {memoFeedback ? (
                      <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4 text-xs text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-50">
                        <div className="font-semibold">메모 피드백(참고)</div>
                        <ul className="mt-2 list-disc space-y-1 pl-4">
                          {memoFeedback.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                        {memoFeedback.risks.length ? (
                          <div className="mt-3">
                            <div className="text-[11px] font-semibold text-red-800 dark:text-red-200">
                              체크 포인트
                            </div>
                            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-red-900/90 dark:text-red-100/90">
                              {memoFeedback.risks.map((r) => (
                                <li key={r}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div className="mt-3 text-[11px] font-semibold text-emerald-900 dark:text-emerald-100">
                          다음에 물어보면 좋은 질문
                        </div>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px]">
                          {memoFeedback.nextQuestions.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <button
                      onClick={() => deleteCustomer(selectedCustomer.id)}
                      className="mt-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      고객 삭제
                    </button>
                  </div>
                </div>

                <div
                  id="crm-block-quick-tpl"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">빠른 메시지 템플릿</div>
                    <button
                      onClick={addTemplate}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                    >
                      + 템플릿
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {quickTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
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
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          클릭하면 고객명 치환 후 복사
                        </div>
                      </button>
                    ))}
                    {state.templates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
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
                  className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">다음 연락 · 후속 액션</div>
                    <button
                      onClick={() => addNextAction(selectedCustomer.id)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                    >
                      + 추가
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedNextActions.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
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
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {a.doneAt ? "완료" : "미완료"}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">기한</div>
                          <input
                            type="datetime-local"
                            value={isoToLocalInput(a.dueAt)}
                            onChange={(e) =>
                              updateNextAction(a.id, { dueAt: localInputToIso(e.target.value) })
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                          />
                        </div>
                      </div>
                    ))}
                    {selectedNextActions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        아직 없습니다. “+ 추가”로 만들어보세요.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  id="crm-block-events"
                  tabIndex={-1}
                  className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">상담·출고 일정</div>
                    <button
                      onClick={() => addEvent(selectedCustomer.id)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                    >
                      + 추가
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {selectedEvents.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <input
                            value={e.title}
                            onChange={(ev) => updateEvent(e.id, { title: ev.target.value })}
                            className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold outline-none"
                          />
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {formatDateTime(e.startAt)}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">시작</div>
                          <input
                            type="datetime-local"
                            value={isoToLocalInput(e.startAt)}
                            onChange={(ev) =>
                              updateEvent(e.id, { startAt: localInputToIso(ev.target.value) })
                            }
                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
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
                            className="min-h-[70px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                          />
                        </div>
                      </div>
                    ))}
                    {selectedEvents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        아직 없습니다. “+ 추가”로 만들어보세요.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div
                id="crm-block-global"
                tabIndex={-1}
                className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">실적 요약</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadText("crm_backup.json", JSON.stringify(state, null, 2))}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                    >
                      백업(.json)
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm("로컬 데이터를 초기화할까요? (되돌리기 어렵습니다)")) return;
                        const next = seedState();
                        setState(next);
                        setSelectedCustomerId(next.customers[0]?.id ?? null);
                      }}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                    >
                      초기화(샘플)
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs font-semibold">다음 할 일(전체)</div>
                    <div className="mt-3 space-y-2">
                      {allNextActions.slice(0, 8).map((a) => {
                        const c = state.customers.find((x) => x.id === a.customerId);
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelectedCustomerId(a.customerId)}
                            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate text-xs font-semibold">
                                {a.doneAt ? "✓ " : ""}{a.title}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {formatDateTime(a.dueAt)}
                              </div>
                            </div>
                            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                              {c?.name ?? "알 수 없음"}
                            </div>
                          </button>
                        );
                      })}
                      {allNextActions.length === 0 ? (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">없음</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="text-xs font-semibold">일정(전체)</div>
                    <div className="mt-3 space-y-2">
                      {allEvents.slice(0, 8).map((e) => (
                        <div
                          key={e.id}
                          className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-xs font-semibold">{e.title}</div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {formatDateTime(e.startAt)}
                            </div>
                          </div>
                          {e.customerId ? (
                            <button
                              onClick={() => setSelectedCustomerId(e.customerId!)}
                              className="mt-1 text-[11px] font-semibold text-zinc-700 hover:underline dark:text-zinc-200"
                            >
                              고객: {state.customers.find((x) => x.id === e.customerId)?.name ?? "?"}
                            </button>
                          ) : (
                            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                              고객 연결 없음
                            </div>
                          )}
                        </div>
                      ))}
                      {allEvents.length === 0 ? (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">없음</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              id="crm-block-empty-placeholder"
              tabIndex={-1}
              className="scroll-mt-24 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            >
              왼쪽에서 고객을 선택하거나 <span className="font-semibold">“+ 고객 추가”</span>로 상담을
              등록하세요. 고객을 열면 <span className="font-semibold text-zinc-900 dark:text-zinc-100">상담 메모</span>,
              <span className="font-semibold text-zinc-900 dark:text-zinc-100"> 다음 연락</span>,
              <span className="font-semibold text-zinc-900 dark:text-zinc-100"> 일정</span>을 한 화면에서 이어서 관리할 수 있습니다.
            </div>
          )}

          {tab === "템플릿" ? (
            <div
              id="crm-block-templates"
              tabIndex={-1}
              className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 outline-none dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">고객 상태별 문자 템플릿</div>
                <button
                  onClick={addTemplate}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  + 템플릿
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {state.templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <input
                      className="w-full border-0 bg-transparent text-sm font-semibold outline-none"
                      value={tpl.title}
                      onChange={(e) => updateTemplate(tpl.id, { title: e.target.value })}
                    />
                    <textarea
                      className="mt-2 min-h-[120px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
                      value={tpl.body}
                      onChange={(e) => updateTemplate(tpl.id, { body: e.target.value })}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={async () => {
                          const text = renderTemplate(tpl, selectedCustomer);
                          const ok = await copyToClipboard(text);
                          alert(
                            ok
                              ? "클립보드에 복사했습니다."
                              : "자동 복사가 불가했습니다. 위 상자 안의 글자를 길게 눌러 복사하거나 전체 선택(Ctrl+A) 후 복사해 주세요.",
                          );
                        }}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                      >
                        현재 고객으로 복사
                      </button>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        업데이트: {formatDateTime(tpl.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
                {state.templates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    템플릿이 없습니다.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

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
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="lead-explain-title"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              가망 % 산정 기준
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              실제 계약 가능성이 아니라, 입력된 메모·예산·관심차종·연락처 정보만으로 빠르게 정렬하기 위한
              참고 점수입니다.
            </p>
            {(() => {
              const c = state.customers.find((x) => x.id === leadExplainForId);
              if (!c) {
                return (
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    고객 정보를 찾지 못했습니다.
                  </p>
                );
              }
              const ex = explainPurchaseIntent(c);
              return (
                <div className="mt-3 space-y-3 text-xs text-zinc-800 dark:text-zinc-100">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      결과: {ex.percent}% · 등급 {ex.grade}
                    </span>
                    <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                      힌트: {ex.hints.join(" · ")}
                    </div>
                  </div>
                  <ul className="list-decimal space-y-1.5 pl-4 text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                    {ex.breakdown.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    키워드 예시: {LEAD_SCORE_HOTWORDS.join(", ")}
                  </div>
                </div>
              );
            })()}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
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
          <div className="max-h-[92vh] w-full max-w-[920px] overflow-hidden rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-[color:var(--edge)] bg-[color:var(--paper-2)] px-4 py-3">
              <div className="text-sm font-extrabold text-[color:var(--foreground)]">AI 출고 안내서</div>
              <button
                type="button"
                className="moleskine-ink-btn rounded-lg px-3 py-2 text-xs font-semibold"
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
          <div className="rounded-full border border-zinc-200 bg-white/95 px-4 py-2 text-center text-xs font-semibold text-zinc-800 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-100">
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
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
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
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</div>
      <input
        type="datetime-local"
        value={isoToLocalInput(valueIso)}
        onChange={(e) => onChangeIso(localInputToIso(e.target.value))}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
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
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</div>
      <input
        value={value}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
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
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</div>
      <select
        value={selectVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
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
      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="min-h-[110px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
      />
    </label>
  );
}

function MenuBtn({
  icon,
  label,
  onClick,
  emphasize,
}: {
  icon: "home" | "users" | "sparkles" | "check" | "calendar" | "note" | "message";
  label: string;
  onClick: () => void;
  emphasize?: boolean;
}) {
  const base =
    "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition";
  const cls = emphasize
    ? `${base} border-[color:var(--gold)]/45 bg-[color:var(--paper)] text-[color:var(--foreground)] hover:bg-[color:var(--paper)]/70`
    : `${base} border-[color:var(--edge)] bg-[color:var(--paper)] text-[color:var(--foreground)] hover:bg-[color:var(--paper)]/70`;

  return (
    <button type="button" className={cls} onClick={onClick}>
      <span aria-hidden className={emphasize ? "text-[color:var(--gold-ink)]" : "text-zinc-600 dark:text-zinc-300"}>
        <MenuIcon name={icon} />
      </span>
      <span className="min-w-0 truncate">{label}</span>
      {emphasize ? (
        <span className="ml-auto rounded-full border border-[color:var(--gold)]/35 bg-[color:var(--paper-2)] px-2 py-0.5 text-[10px] font-extrabold text-[color:var(--gold-ink)]">
          핵심
        </span>
      ) : null}
    </button>
  );
}

function MenuIcon({ name }: { name: string }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const;
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.5 21v-6.5h5V21" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21c0-2.2-1.8-4-4-4s-4 1.8-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "sparkles") {
    return (
      <svg {...common}>
        <path d="M12 2l1.1 4.2L17 7.3l-3.9 1.1L12 12l-1.1-3.6L7 7.3l3.9-1.1L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M4 13l.7 2.7L7.5 16.5l-2.8.8L4 20l-.7-2.7L.5 16.5l2.8-.8L4 13Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M19 13l.7 2.7 2.8.8-2.8.8L19 20l-.7-2.7-2.8-.8 2.8-.8L19 13Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common}>
        <path d="M9 11.5 11 13.5 15.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 4h10a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg {...common}>
        <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4.5 7.5h15V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V7.5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 10.5h15" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "note") {
    return (
      <svg {...common}>
        <path d="M7 3.5h10A2.5 2.5 0 0 1 19.5 6v12A2.5 2.5 0 0 1 17 20.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  // message
  return (
    <svg {...common}>
      <path d="M5 6.5h14A2.5 2.5 0 0 1 21.5 9v6A2.5 2.5 0 0 1 19 17.5H10l-4.5 3v-3H5A2.5 2.5 0 0 1 2.5 15V9A2.5 2.5 0 0 1 5 6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6.5 10h11M6.5 13.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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

