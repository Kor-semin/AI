"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CalendarEvent,
  CRMState,
  Customer,
  LeadSource,
  MessageTemplate,
  NextAction,
  PipelineStage,
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
import { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import type { VehicleBrandId } from "./vehicleCatalog";
import { vehicleModelsFor, VEHICLE_BRANDS } from "./vehicleCatalog";
import { parseContactPaste, type ParsedRow } from "./importContacts";
import { scorePurchaseIntent } from "./leadScore";
import { makeId, seedState } from "./seed";

const LEAD_SOURCES = [...DEALER_LEAD_SOURCES] satisfies LeadSource[];
const STAGES = [...DEALER_PIPELINE_STAGES] satisfies PipelineStage[];

const BRAND_OPTIONS: VehicleBrandId[] = [...VEHICLE_BRANDS];

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
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(SELLER_NICK_KEY);
      if (v) setSellerNickname(v);
    } catch {
      /* ignore */
    }
  }, []);

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
          setState(next);
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
      } ${c.memo ?? ""} ${c.leadSource} ${c.stage}`.toLowerCase();
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

  function upsertCustomer(patch: Partial<Customer> & { id: string }) {
    setState((prev) => {
      const now = nowIso();
      const exists = prev.customers.some((c) => c.id === patch.id);
      if (!exists) return prev;
      return {
        ...prev,
        customers: prev.customers.map((c) =>
          c.id === patch.id ? { ...c, ...patch, updatedAt: now } : c,
        ),
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
      stage: "문의·리드",
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
      stage: "문의·리드",
    }));
    setState((prev) => ({ ...prev, customers: [...batch, ...prev.customers] }));
    setSelectedCustomerId(batch[0]!.id);
    setTab("고객");
    setPasteOpen(false);
    setPasteText("");

    if (uid) {
      setSync({ mode: "cloud", status: "syncing" });
      void Promise.all(batch.map((c) => createCustomerCloud(uid!, c)))
        .then(() => setSync({ mode: "cloud", status: "idle" }))
        .catch((e) => setSync({ mode: "cloud", status: "error", message: String(e) }));
    }

    alert(`연락처 ${batch.length}명을 불러왔습니다. 정보를 확인·수정해 주세요.\n구글·삼성·애플은 「주소록 → 내보내기/복사」한 뒤 여기 붙여넣기 하면 됩니다.`);
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
      `- 브랜드: ${customer.vehicleBrand ?? "-"}`,
      `- 차종: ${customer.interestedModel ?? "-"}`,
      `- 예산: ${customer.budget ?? "-"}`,
      `- 메모: ${customer.memo ?? "-"}`,
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
    <div className="flex w-full">
      <aside className="w-[360px] shrink-0 border-r border-[color:var(--edge)] bg-[color:var(--paper)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="text-sm font-semibold tracking-tight">자동차딜러의 수첩</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {sync.mode === "cloud" ? "클라우드 동기화" : "로컬 저장(MVP)"} ·{" "}
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
              + 고객
            </button>
            <button
              type="button"
              className="rounded-lg border border-[color:var(--edge-strong)] bg-[color:var(--paper)] px-3 py-1.5 text-[11px] font-semibold hover:bg-[color:var(--paper-2)]"
              onClick={() => setPasteOpen(true)}
              title="다른 앱에서 복사한 목록 붙여넣기"
            >
              연락처 붙여넣기
            </button>
          </div>
        </div>

        <label className="mt-4 grid gap-1">
          <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">내 이름 (문자·템플릿)</div>
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
            placeholder={`이름/연락처 검색 · ${SEARCH_SHORTCUT_HINT}`}
            className="w-full rounded-lg border border-[color:var(--edge)] bg-[color:var(--paper)] px-3 py-2 text-sm outline-none focus:border-[color:var(--edge-strong)]"
            title="어디서나 Ctrl+K (Mac: ⌘K) 로 포커스"
          />
        </div>

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
              {t}
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
                    <div className="mt-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-400">
                      {(() => {
                        const sx = scorePurchaseIntent(c);
                        return `가망 ${sx.percent}% · ${sx.grade}`;
                      })()}
                    </div>
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
            <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              검색 결과가 없습니다. “+ 고객”으로 추가해보세요.
            </div>
          ) : null}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight">
                {selectedCustomer ? selectedCustomer.name : "고객을 선택하세요"}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {selectedCustomer ? `업데이트: ${formatDateTime(selectedCustomer.updatedAt)}` : "왼쪽 목록에서 선택"}
              </div>
            </div>

            {selectedCustomer ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => addNextAction(selectedCustomer.id)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                >
                  + 다음할일
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
                  내보내기(.txt)
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-6">
          {selectedCustomer ? (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-sm font-semibold">고객 정보</div>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <Field
                      label="이름"
                      value={selectedCustomer.name}
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, name: v })}
                    />
                    <Field
                      label="연락처"
                      value={selectedCustomer.phone ?? ""}
                      placeholder="010-0000-0000"
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, phone: v })}
                    />
                    <Field
                      label="이메일"
                      value={selectedCustomer.email ?? ""}
                      placeholder="example@domain.com"
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, email: v })}
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
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-sm font-semibold">예산·메모</div>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <Field
                      label="예산"
                      value={selectedCustomer.budget ?? ""}
                      placeholder="예: 3,800만원"
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, budget: v })}
                    />
                    <TextArea
                      label="메모"
                      value={selectedCustomer.memo ?? ""}
                      placeholder="상담 내용/특이사항"
                      onChange={(v) => upsertCustomer({ id: selectedCustomer.id, memo: v })}
                    />
                    <button
                      onClick={() => deleteCustomer(selectedCustomer.id)}
                      className="mt-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      고객 삭제
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">빠른 템플릿</div>
                    <button
                      onClick={addTemplate}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                    >
                      + 템플릿
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {state.templates.slice(0, 5).map((tpl) => (
                      <button
                        key={tpl.id}
                        className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
                        onClick={async () => {
                          const text = renderTemplate(tpl, selectedCustomer);
                          const ok = await copyToClipboard(text);
                          alert(
                            ok
                              ? "클립보드에 복사했습니다."
                              : "자동 복사가 불가했습니다. ‘템플릿’ 탭에서 본문을 길게 눌러 복사해 주세요.",
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
                        템플릿이 없습니다. “+ 템플릿”으로 추가하세요.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">다음 할 일</div>
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

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">일정</div>
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

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">전체 보기</div>
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
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              왼쪽에서 고객을 선택하거나 “+ 고객”을 눌러 추가하세요. 선택하면{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">브랜드·차종</span>을 고를 수
              있습니다.
            </div>
          )}

          {tab === "템플릿" ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">메시지 템플릿</div>
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

      {pasteOpen ? (
        <div
          className="fixed inset-0 z-[300] flex items-start justify-center bg-black/50 p-4 pt-14"
          onClick={() => setPasteOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setPasteOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="paste-import-title"
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div id="paste-import-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              연락처 붙여넣기
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              구글 · 삼성 · 애플 등에서 이름·번호가 보이도록 복사한 뒤 아래에 붙여 넣으세요.
              줄마다 이름과 전화를 넣거나, 공유 받은 카카오 문자를 통째로 붙여넣어도 시도합니다.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={11}
              className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder={`예시\n홍길동\t010-1234-5678\t시승 희망\n`}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                onClick={() => {
                  setPasteOpen(false);
                }}
              >
                닫기
              </button>
              <button
                type="button"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                onClick={() => ingestPastedContacts(parseContactPaste(pasteText))}
              >
                정리해서 고객으로 넣기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
        className="min-h-[110px] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
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

