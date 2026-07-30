/**
 * 워크스페이스 ↔ 기존 CRM이 공유하는 로컬 CRM 상태 스토어.
 *
 * 저장소는 storage.ts의 localStorage 키("customer-manager.crm.v1")를 그대로 사용하므로
 * 기존 CRM 화면에서 등록한 고객이 워크스페이스에도 보이고, 반대도 마찬가지입니다.
 * useSyncExternalStore로 구독해 hydration 불일치 없이 클라이언트에서 로드합니다.
 *
 * 원칙: 모든 쓰기는 사용자의 명시적 동작(버튼 클릭)에서만 호출합니다. AI가 직접 호출하지 않습니다.
 * 예외적으로 최초 1회 예시 고객 시딩은 빈 상태일 때만 자동 실행되고, 설정에서 초기화할 수 있습니다.
 */
import { buildSeedCustomers, buildSeedNextActions, SEED_VERSION } from "./sensoraSeedCustomers";
import { loadState, saveState } from "./storage";
import type { CRMState, Customer, NextAction } from "./types";

const EMPTY_STATE: CRMState = { version: 1, customers: [], nextActions: [], events: [], templates: [] };
const SEED_FLAG_KEY = "sensora:seedApplied";

let cache: CRMState | null = null;
const listeners = new Set<() => void>();

function seedApplied(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SEED_FLAG_KEY) === SEED_VERSION;
  } catch {
    return true;
  }
}

function markSeedApplied(): void {
  try {
    window.localStorage.setItem(SEED_FLAG_KEY, SEED_VERSION);
  } catch {
    /* ignore */
  }
}

function ensure(): CRMState {
  if (cache !== null) return cache;

  const stored = loadState();
  if (stored) {
    cache = stored;
    return cache;
  }

  // 저장된 상태가 없고 아직 시딩하지 않았다면 예시 고객 20명을 넣습니다.
  if (typeof window !== "undefined" && !seedApplied()) {
    const now = new Date();
    const seeded: CRMState = {
      ...EMPTY_STATE,
      customers: buildSeedCustomers(now),
      nextActions: buildSeedNextActions(now),
    };
    cache = seeded;
    saveState(seeded);
    markSeedApplied();
    return cache;
  }

  cache = EMPTY_STATE;
  return cache;
}

function commit(next: CRMState): void {
  cache = next;
  saveState(next);
  listeners.forEach((listener) => listener());
}

export function subscribeCrmState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCrmStateSnapshot(): CRMState {
  return ensure();
}

/** SSR 프리렌더 스냅샷 — 항상 동일 참조여야 합니다. */
export function getCrmServerSnapshot(): CRMState {
  return EMPTY_STATE;
}

function makeId(prefix: string): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${rand}`;
}

export type NewCustomerInput = {
  name: string;
  phone?: string;
  interestedModel?: string;
};

/** 새 고객 등록 — 사용자가 "추가" 버튼을 누를 때만 호출됩니다. */
export function addCustomer(input: NewCustomerInput): Customer {
  const now = new Date().toISOString();
  const customer: Customer = {
    id: makeId("customer"),
    createdAt: now,
    updatedAt: now,
    name: input.name.trim(),
    phone: input.phone?.trim() || undefined,
    interestedModel: input.interestedModel?.trim() || undefined,
    leadSource: "전화·매장방문",
    stage: "미상담",
  };
  const state = ensure();
  commit({ ...state, customers: [customer, ...state.customers] });
  return customer;
}

/** 고객 카드 부분 수정 — 사용자가 저장 버튼을 누를 때만 호출됩니다. */
export function updateCustomer(customerId: string, patch: Partial<Omit<Customer, "id" | "createdAt">>): boolean {
  const state = ensure();
  if (!state.customers.some((customer) => customer.id === customerId)) return false;
  commit({
    ...state,
    customers: state.customers.map((customer) =>
      customer.id === customerId
        ? { ...customer, ...patch, updatedAt: new Date().toISOString() }
        : customer,
    ),
  });
  return true;
}

/** 상담 메모 저장 — 사용자가 확인 후 "저장"을 누를 때만 호출됩니다. */
export function saveCustomerMemo(customerId: string, memo: string): boolean {
  return updateCustomer(customerId, { memo });
}

/* ---------- 메뉴 간 이동 컨텍스트 ----------
 * 고객관리에서 "상담 메모 작성"을 누르면 대상 고객을 여기 담아 두고,
 * 상담 메모 화면이 열릴 때 한 번 꺼내 선택 상태로 시작합니다. */
let consultingTargetId: string | null = null;

export function setConsultingTarget(customerId: string): void {
  consultingTargetId = customerId;
}

export function consumeConsultingTarget(): string | null {
  const id = consultingTargetId;
  consultingTargetId = null;
  return id;
}

/* 대시보드/고객관리에서 "고객 카드 열기"로 넘길 대상 */
let customerDetailTargetId: string | null = null;

export function setCustomerDetailTarget(customerId: string): void {
  customerDetailTargetId = customerId;
}

export function consumeCustomerDetailTarget(): string | null {
  const id = customerDetailTargetId;
  customerDetailTargetId = null;
  return id;
}

export function addNextAction(customerId: string, title: string): NextAction {
  const action: NextAction = {
    id: makeId("action"),
    customerId,
    createdAt: new Date().toISOString(),
    title: title.trim(),
  };
  const state = ensure();
  commit({ ...state, nextActions: [action, ...state.nextActions] });
  return action;
}

/** 다음 연락 완료 처리 */
export function completeNextAction(actionId: string): void {
  const state = ensure();
  commit({
    ...state,
    nextActions: state.nextActions.map((action) =>
      action.id === actionId ? { ...action, doneAt: new Date().toISOString() } : action,
    ),
  });
}

/** 예시 데이터로 초기화 — 설정 화면에서 사용자가 명시적으로 실행합니다. */
export function resetToSeedData(): void {
  const now = new Date();
  commit({ ...EMPTY_STATE, customers: buildSeedCustomers(now), nextActions: buildSeedNextActions(now) });
  markSeedApplied();
}

/** 전체 비우기 — 설정 화면에서 사용자가 명시적으로 실행합니다. */
export function clearAllCustomers(): void {
  commit({ ...EMPTY_STATE });
  markSeedApplied();
}
