import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/app/firebase/client";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import type { ActivityLog } from "./activity-log";
import {
  CUSTOMER_STATUSES,
  LEAD_SOURCES,
  type CustomerStatus,
  type LeadSource,
  type SensoraCustomer,
} from "./domain";
import { DEFAULT_SENSORA_WORKSPACE_ID } from "./leads";

const DEFAULT_BETA_BRANCH_ID = "sensora-beta-branch";

export type ConvertSensoraLeadToCustomerInput = {
  workspaceId?: string;
  leadId: string;
};

export type SensoraStoredCustomer = SensoraCustomer & {
  workspaceId: string;
  leadId: string;
  phone: string;
  interestedVehicle: string;
  createdByUid: string;
  ownerUid: string;
};

export type SensoraConversionActivityLog = ActivityLog & {
  workspaceId: string;
  leadId: string;
  customerId: string;
};

export type ConvertSensoraLeadToCustomerResult = {
  customer: SensoraStoredCustomer;
  activityLog: SensoraConversionActivityLog;
  lead: {
    id: string;
    status: "converted";
    convertedCustomerId: string;
    updatedAt: string;
  };
};

export type SensoraCustomerPersistenceErrorCode =
  | "firebase-not-configured"
  | "authentication-required"
  | "permission-denied"
  | "lead-not-found"
  | "lead-not-owned"
  | "already-converted"
  | "unavailable"
  | "unknown";

export class SensoraCustomerPersistenceError extends Error {
  code: SensoraCustomerPersistenceErrorCode;

  constructor(code: SensoraCustomerPersistenceErrorCode, message: string) {
    super(message);
    this.name = "SensoraCustomerPersistenceError";
    this.code = code;
  }
}

function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function requiredText(value: unknown, fieldName: string): string {
  const text = optionalText(value);
  if (!text) {
    throw new SensoraCustomerPersistenceError(
      "unknown",
      `Lead의 ${fieldName} 정보가 없어 고객으로 전환할 수 없습니다.`,
    );
  }
  return text;
}

function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === "string" && (LEAD_SOURCES as readonly string[]).includes(value);
}

function isCustomerStatus(value: unknown): value is CustomerStatus {
  return typeof value === "string" && (CUSTOMER_STATUSES as readonly string[]).includes(value);
}

function ensureFirebaseConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new SensoraCustomerPersistenceError(
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
    throw new SensoraCustomerPersistenceError(
      "authentication-required",
      "Lead 전환과 Customer 조회를 사용하려면 승인된 Firebase 계정으로 로그인해 주세요.",
    );
  }
  return uid;
}

function persistenceError(error: unknown): SensoraCustomerPersistenceError {
  if (error instanceof SensoraCustomerPersistenceError) return error;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code.includes("permission-denied")) {
    return new SensoraCustomerPersistenceError(
      "permission-denied",
      "Customer 전환 권한이 없습니다. 승인 상태와 Firestore rules를 확인해 주세요.",
    );
  }
  if (code.includes("unavailable") || code.includes("network")) {
    return new SensoraCustomerPersistenceError(
      "unavailable",
      "Firestore에 연결할 수 없습니다. 기존 Lead는 변경되지 않았습니다.",
    );
  }
  return new SensoraCustomerPersistenceError(
    "unknown",
    "Lead를 Customer로 전환하지 못했습니다. 기존 Lead는 변경되지 않았습니다.",
  );
}

export function getSensoraCustomerPersistenceMessage(error: unknown): string {
  return persistenceError(error).message;
}

export async function convertSensoraLeadToCustomer(
  input: ConvertSensoraLeadToCustomerInput,
): Promise<ConvertSensoraLeadToCustomerResult> {
  ensureFirebaseConfigured();

  const workspaceId = optionalText(input.workspaceId) || DEFAULT_SENSORA_WORKSPACE_ID;
  const leadId = requiredText(input.leadId, "식별자");
  const currentUserUid = await requireSignedInUserId();
  const db = getFirebaseDb();
  const leadRef = doc(db, "sensoraWorkspaces", workspaceId, "leads", leadId);
  const customerRef = doc(collection(db, "sensoraWorkspaces", workspaceId, "customers"));
  const activityLogRef = doc(collection(db, "sensoraWorkspaces", workspaceId, "activityLogs"));

  try {
    return await runTransaction(db, async (transaction) => {
      const leadSnapshot = await transaction.get(leadRef);
      if (!leadSnapshot.exists()) {
        throw new SensoraCustomerPersistenceError(
          "lead-not-found",
          "전환할 Lead를 찾을 수 없습니다. 목록을 다시 조회해 주세요.",
        );
      }

      const leadData = leadSnapshot.data();
      if (
        optionalText(leadData.workspaceId) !== workspaceId ||
        optionalText(leadData.createdByUid) !== currentUserUid
      ) {
        throw new SensoraCustomerPersistenceError(
          "lead-not-owned",
          "본인이 저장한 Lead만 Customer로 전환할 수 있습니다.",
        );
      }
      if (leadData.status === "converted" || optionalText(leadData.convertedCustomerId)) {
        throw new SensoraCustomerPersistenceError(
          "already-converted",
          "이미 Customer로 전환된 Lead입니다.",
        );
      }

      const now = new Date().toISOString();
      const customer: SensoraStoredCustomer = {
        id: customerRef.id,
        workspaceId,
        leadId,
        name: requiredText(leadData.customerName, "고객명"),
        phone: requiredText(leadData.phone, "연락처"),
        interestedVehicle: requiredText(leadData.interestedVehicle, "관심 차량"),
        source: isLeadSource(leadData.source) ? leadData.source : "unknown",
        purchaseTiming: optionalText(leadData.purchaseTiming),
        preferredContactTime: optionalText(leadData.preferredContactTime),
        memo: optionalText(leadData.memo),
        status: "new",
        createdByUid: currentUserUid,
        ownerUid: currentUserUid,
        assignedUserId: currentUserUid,
        branchId: optionalText(leadData.branchId) || DEFAULT_BETA_BRANCH_ID,
        createdAt: now,
        updatedAt: now,
      };
      const activityLog: SensoraConversionActivityLog = {
        id: activityLogRef.id,
        workspaceId,
        actorUserId: currentUserUid,
        action: "lead_converted_to_customer",
        targetType: "customer",
        targetId: customerRef.id,
        leadId,
        customerId: customerRef.id,
        before: { status: optionalText(leadData.status) || "new" },
        after: { status: "converted", convertedCustomerId: customerRef.id },
        branchId: customer.branchId,
        createdAt: now,
      };

      const customerData = Object.fromEntries(
        Object.entries(customer).filter(([, value]) => value !== undefined),
      );

      transaction.set(customerRef, {
        ...customerData,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp(),
      });
      transaction.update(leadRef, {
        status: "converted",
        convertedCustomerId: customerRef.id,
        updatedAt: now,
        updatedAtServer: serverTimestamp(),
      });
      transaction.set(activityLogRef, {
        ...activityLog,
        createdAtServer: serverTimestamp(),
      });

      return {
        customer,
        activityLog,
        lead: {
          id: leadId,
          status: "converted",
          convertedCustomerId: customerRef.id,
          updatedAt: now,
        },
      };
    });
  } catch (error) {
    throw persistenceError(error);
  }
}

export async function listSensoraCustomers(
  workspaceId = DEFAULT_SENSORA_WORKSPACE_ID,
  currentUserUid?: string,
): Promise<SensoraStoredCustomer[]> {
  ensureFirebaseConfigured();
  const ownerUid = currentUserUid || (await requireSignedInUserId());

  try {
    const db = getFirebaseDb();
    const customersQuery = query(
      collection(db, "sensoraWorkspaces", workspaceId, "customers"),
      where("workspaceId", "==", workspaceId),
      where("ownerUid", "==", ownerUid),
    );
    const snapshot = await getDocs(customersQuery);

    return snapshot.docs.map((customerDocument) => {
      const data = customerDocument.data();
      const createdAt = optionalText(data.createdAt) || new Date(0).toISOString();

      return {
        id: customerDocument.id,
        workspaceId: optionalText(data.workspaceId) || workspaceId,
        leadId: optionalText(data.leadId) || "",
        name: optionalText(data.name) || "이름 미확인",
        phone: optionalText(data.phone) || "",
        interestedVehicle: optionalText(data.interestedVehicle) || "관심 차량 미확인",
        source: isLeadSource(data.source) ? data.source : "unknown",
        purchaseTiming: optionalText(data.purchaseTiming),
        preferredContactTime: optionalText(data.preferredContactTime),
        memo: optionalText(data.memo),
        status: isCustomerStatus(data.status) ? data.status : "new",
        createdByUid: optionalText(data.createdByUid) || ownerUid,
        ownerUid: optionalText(data.ownerUid) || ownerUid,
        assignedUserId: optionalText(data.assignedUserId) || ownerUid,
        branchId: optionalText(data.branchId) || DEFAULT_BETA_BRANCH_ID,
        createdAt,
        updatedAt: optionalText(data.updatedAt) || createdAt,
      };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    throw persistenceError(error);
  }
}
