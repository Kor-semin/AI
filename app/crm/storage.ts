import type { CalendarEvent, CRMState, Customer, MessageTemplate, NextAction } from "./types";
import { migrateCRMState } from "./migrate";

const STORAGE_KEY = "customer-manager.crm.v1";

export function loadState(): CRMState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CRMState;
    if (!parsed || parsed.version !== 1) return null;
    return migrateCRMState(parsed);
  } catch {
    return null;
  }
}

export function saveState(state: CRMState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function nowIso() {
  return new Date().toISOString();
}

/** Firestore 쓰기에 `undefined` 가 포함되면 실패할 수 있어 제거합니다(일반 객체·배열만 재귀). */
function stripUndefinedDeep(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map(stripUndefinedDeep).filter((v) => v !== undefined);
  }
  const tag = Object.prototype.toString.call(value);
  if (tag === "[object Timestamp]" || typeof (value as { toMillis?: unknown }).toMillis === "function") {
    return value;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return value;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v === undefined) continue;
    const next = stripUndefinedDeep(v);
    if (next !== undefined) out[k] = next;
  }
  return out;
}

type Unsubscribe = () => void;
type OnError = (e: unknown) => void;

function usersPath(uid: string, collection: string) {
  return ["users", uid, collection] as const;
}

export async function subscribeCustomers(
  uid: string,
  onValue: (v: Customer[]) => void,
  onError?: OnError,
): Promise<Unsubscribe> {
  const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const q = query(collection(db, ...usersPath(uid, "customers")), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
    const list = snap.docs.map((d) => d.data() as Customer);
    onValue(list);
    },
    (e) => onError?.(e),
  );
}

export async function subscribeNextActions(
  uid: string,
  onValue: (v: NextAction[]) => void,
  onError?: OnError,
): Promise<Unsubscribe> {
  const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const q = query(collection(db, ...usersPath(uid, "nextActions")), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
    const list = snap.docs.map((d) => d.data() as NextAction);
    onValue(list);
    },
    (e) => onError?.(e),
  );
}

export async function subscribeEvents(
  uid: string,
  onValue: (v: CalendarEvent[]) => void,
  onError?: OnError,
): Promise<Unsubscribe> {
  const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const q = query(collection(db, ...usersPath(uid, "events")), orderBy("startAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
    const list = snap.docs.map((d) => d.data() as CalendarEvent);
    onValue(list);
    },
    (e) => onError?.(e),
  );
}

export async function subscribeTemplates(
  uid: string,
  onValue: (v: MessageTemplate[]) => void,
  onError?: OnError,
): Promise<Unsubscribe> {
  const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const q = query(collection(db, ...usersPath(uid, "templates")), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
    const list = snap.docs.map((d) => d.data() as MessageTemplate);
    onValue(list);
    },
    (e) => onError?.(e),
  );
}

export async function upsertCustomerCloud(uid: string, patch: Partial<Customer> & { id: string }): Promise<void> {
  const { deleteField, doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const t = nowIso();
  const ref = doc(db, "users", uid, "customers", patch.id);
  const payload: Record<string, unknown> = { ...patch, updatedAt: t, updatedAtServer: serverTimestamp() };
  if ("paymentType" in patch && patch.paymentType === undefined) {
    payload.paymentType = deleteField();
  }
  await setDoc(ref, stripUndefinedDeep(payload) as Record<string, unknown>, { merge: true });
}

export async function createCustomerCloud(uid: string, customer: Customer): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid, "customers", customer.id);
  await setDoc(
    ref,
    stripUndefinedDeep({
      ...customer,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    }) as Record<string, unknown>,
    { merge: true },
  );
}

export async function deleteCustomerCloud(uid: string, customerId: string): Promise<void> {
  const { collection, doc, getDocs, query, where, writeBatch } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  batch.delete(doc(db, "users", uid, "customers", customerId));

  const actionsSnap = await getDocs(
    query(collection(db, "users", uid, "nextActions"), where("customerId", "==", customerId)),
  );
  actionsSnap.docs.forEach((d) => batch.delete(d.ref));

  const eventsSnap = await getDocs(
    query(collection(db, "users", uid, "events"), where("customerId", "==", customerId)),
  );
  eventsSnap.docs.forEach((d) => batch.delete(d.ref));

  await batch.commit();
}

export async function createNextActionCloud(uid: string, action: NextAction): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid, "nextActions", action.id);
  await setDoc(ref, { ...action, createdAtServer: serverTimestamp(), updatedAtServer: serverTimestamp() }, { merge: true });
}

export async function updateNextActionCloud(
  uid: string,
  id: string,
  patch: Partial<NextAction>,
): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid, "nextActions", id);
  await setDoc(ref, { ...patch, updatedAtServer: serverTimestamp() }, { merge: true });
}

export async function createEventCloud(uid: string, ev: CalendarEvent): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid, "events", ev.id);
  await setDoc(ref, { ...ev, createdAtServer: serverTimestamp(), updatedAtServer: serverTimestamp() }, { merge: true });
}

export async function updateEventCloud(uid: string, id: string, patch: Partial<CalendarEvent>): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid, "events", id);
  await setDoc(ref, { ...patch, updatedAtServer: serverTimestamp() }, { merge: true });
}

export async function createTemplateCloud(uid: string, tpl: MessageTemplate): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid, "templates", tpl.id);
  await setDoc(ref, { ...tpl, createdAtServer: serverTimestamp(), updatedAtServer: serverTimestamp() }, { merge: true });
}

export async function updateTemplateCloud(uid: string, id: string, patch: Partial<MessageTemplate>): Promise<void> {
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, "users", uid, "templates", id);
  await setDoc(ref, { ...patch, updatedAt: nowIso(), updatedAtServer: serverTimestamp() }, { merge: true });
}

export async function hasAnyCloudData(uid: string): Promise<boolean> {
  const { collection, getDocs, limit, query } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const cols = ["customers", "nextActions", "events", "templates"] as const;
  for (const c of cols) {
    const snap = await getDocs(query(collection(db, "users", uid, c), limit(1)));
    if (!snap.empty) return true;
  }
  return false;
}

export async function seedCloudFromState(uid: string, state: CRMState): Promise<void> {
  const { doc, serverTimestamp, writeBatch } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  for (const c of state.customers) {
    batch.set(
      doc(db, "users", uid, "customers", c.id),
      stripUndefinedDeep({
        ...c,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp(),
      }) as Record<string, unknown>,
      { merge: true },
    );
  }
  for (const a of state.nextActions) {
    batch.set(doc(db, "users", uid, "nextActions", a.id), { ...a, createdAtServer: serverTimestamp(), updatedAtServer: serverTimestamp() }, { merge: true });
  }
  for (const e of state.events) {
    batch.set(doc(db, "users", uid, "events", e.id), { ...e, createdAtServer: serverTimestamp(), updatedAtServer: serverTimestamp() }, { merge: true });
  }
  for (const t of state.templates) {
    batch.set(doc(db, "users", uid, "templates", t.id), { ...t, createdAtServer: serverTimestamp(), updatedAtServer: serverTimestamp() }, { merge: true });
  }

  await batch.commit();
}

