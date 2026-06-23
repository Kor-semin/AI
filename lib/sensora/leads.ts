import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/app/firebase/client";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadSource,
  type LeadStatus,
  type SensoraLead,
} from "./domain";

export const DEFAULT_SENSORA_WORKSPACE_ID = "sensora-beta-workspace";

const DEFAULT_BETA_BRANCH_ID = "sensora-beta-branch";

export type CreateSensoraLeadInput = {
  workspaceId?: string;
  customerName: string;
  phone: string;
  source: LeadSource;
  interestedVehicle: string;
  purchaseTiming?: string;
  preferredContactTime?: string;
  memo?: string;
};

export type SensoraStoredLead = SensoraLead & {
  workspaceId: string;
  createdByUid: string;
  phone: string;
  interestedVehicle: string;
};

export type SensoraLeadPersistenceErrorCode =
  | "firebase-not-configured"
  | "authentication-required"
  | "permission-denied"
  | "unavailable"
  | "unknown";

export class SensoraLeadPersistenceError extends Error {
  code: SensoraLeadPersistenceErrorCode;

  constructor(code: SensoraLeadPersistenceErrorCode, message: string) {
    super(message);
    this.name = "SensoraLeadPersistenceError";
    this.code = code;
  }
}

function requiredText(value: string, fieldName: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new SensoraLeadPersistenceError("unknown", `${fieldName}을(를) 입력해 주세요.`);
  }
  return trimmed;
}

function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === "string" && (LEAD_SOURCES as readonly string[]).includes(value);
}

function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

function persistenceError(error: unknown): SensoraLeadPersistenceError {
  if (error instanceof SensoraLeadPersistenceError) return error;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code.includes("permission-denied")) {
    return new SensoraLeadPersistenceError(
      "permission-denied",
      "Firestore 저장 권한이 없습니다. 베타 워크스페이스 권한 설정을 확인해 주세요.",
    );
  }

  if (code.includes("unavailable") || code.includes("network")) {
    return new SensoraLeadPersistenceError(
      "unavailable",
      "Firestore에 연결할 수 없습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  }

  return new SensoraLeadPersistenceError(
    "unknown",
    "Lead를 Firestore에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  );
}

function ensureFirebaseConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new SensoraLeadPersistenceError(
      "firebase-not-configured",
      "Firebase 설정이 없습니다. NEXT_PUBLIC_FIREBASE_* 환경변수를 확인해 주세요.",
    );
  }
}

async function requireSignedInUserId(): Promise<string> {
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new SensoraLeadPersistenceError(
      "authentication-required",
      "Lead 저장과 조회를 사용하려면 승인된 Firebase 계정으로 로그인해 주세요.",
    );
  }
  return uid;
}

export function getSensoraLeadPersistenceMessage(error: unknown): string {
  return persistenceError(error).message;
}

export async function createSensoraLead(
  input: CreateSensoraLeadInput,
): Promise<SensoraStoredLead> {
  ensureFirebaseConfigured();

  const workspaceId = optionalText(input.workspaceId) || DEFAULT_SENSORA_WORKSPACE_ID;
  const createdByUid = await requireSignedInUserId();
  const now = new Date().toISOString();

  try {
    const db = getFirebaseDb();
    const leadRef = doc(collection(db, "sensoraWorkspaces", workspaceId, "leads"));
    const lead: SensoraStoredLead = {
      id: leadRef.id,
      workspaceId,
      createdByUid,
      source: input.source,
      receivedAt: now,
      customerName: requiredText(input.customerName, "고객명"),
      phone: requiredText(input.phone, "연락처"),
      interestedVehicle: requiredText(input.interestedVehicle, "관심 차량"),
      purchaseTiming: optionalText(input.purchaseTiming),
      preferredContactTime: optionalText(input.preferredContactTime),
      memo: optionalText(input.memo),
      status: "new",
      branchId: DEFAULT_BETA_BRANCH_ID,
      createdAt: now,
      updatedAt: now,
    };

    const firestoreLead = Object.fromEntries(
      Object.entries(lead).filter(([, value]) => value !== undefined),
    );

    await setDoc(leadRef, {
      ...firestoreLead,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    });

    return lead;
  } catch (error) {
    throw persistenceError(error);
  }
}

export async function listSensoraLeads(
  workspaceId = DEFAULT_SENSORA_WORKSPACE_ID,
): Promise<SensoraStoredLead[]> {
  ensureFirebaseConfigured();
  const createdByUid = await requireSignedInUserId();

  try {
    const db = getFirebaseDb();
    const leadsQuery = query(
      collection(db, "sensoraWorkspaces", workspaceId, "leads"),
      where("createdByUid", "==", createdByUid),
    );
    const snapshot = await getDocs(leadsQuery);

    return snapshot.docs.map((leadDocument) => {
      const data = leadDocument.data();
      const createdAt = optionalText(data.createdAt) || new Date(0).toISOString();

      return {
        id: leadDocument.id,
        workspaceId: optionalText(data.workspaceId) || workspaceId,
        createdByUid: optionalText(data.createdByUid) || createdByUid,
        source: isLeadSource(data.source) ? data.source : "unknown",
        receivedAt: optionalText(data.receivedAt) || createdAt,
        receivedBy: optionalText(data.receivedBy),
        assignedUserId: optionalText(data.assignedUserId),
        assignedBy: optionalText(data.assignedBy),
        assignedAt: optionalText(data.assignedAt),
        customerName: optionalText(data.customerName) || "이름 미확인",
        phone: optionalText(data.phone) || "",
        interestedVehicle: optionalText(data.interestedVehicle) || "관심 차량 미확인",
        purchaseTiming: optionalText(data.purchaseTiming),
        preferredContactTime: optionalText(data.preferredContactTime),
        status: isLeadStatus(data.status) ? data.status : "new",
        convertedCustomerId: optionalText(data.convertedCustomerId),
        memo: optionalText(data.memo),
        branchId: optionalText(data.branchId) || DEFAULT_BETA_BRANCH_ID,
        teamId: optionalText(data.teamId),
        createdAt,
        updatedAt: optionalText(data.updatedAt) || createdAt,
      };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    throw persistenceError(error);
  }
}
