import { GoogleAuth } from "google-auth-library";

import {
  normalizeBetaApprovalStatus,
  type BetaApprovalApplicant,
  type BetaApprovalStatus,
} from "@/lib/internalBetaApproval";

type FirestoreValue = {
  stringValue?: string;
  timestampValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const FIREBASE_LOOKUP_TIMEOUT_MS = 10_000;
const FIRESTORE_TIMEOUT_MS = 12_000;

function projectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    ""
  ).trim();
}

function collectionId(): string {
  return (process.env.BETA_APPROVAL_FIRESTORE_COLLECTION || "betaSignups").trim();
}

function adminEmails(): Set<string> {
  return new Set(
    (process.env.BETA_APPROVAL_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function bearerToken(req: Request): string {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function verifyFirebaseUserEmail(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey || !idToken) return null;

  const res = await fetchWithTimeout(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
    FIREBASE_LOOKUP_TIMEOUT_MS,
  );
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as { users?: Array<{ email?: string }> } | null;
  const email = data?.users?.[0]?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

export async function requireBetaApprovalAdmin(req: Request): Promise<{ ok: true; email: string } | { ok: false; status: number; message: string }> {
  const allowed = adminEmails();
  if (allowed.size === 0) {
    return { ok: false, status: 503, message: "BETA_APPROVAL_ADMIN_EMAILS is not configured." };
  }

  const email = await verifyFirebaseUserEmail(bearerToken(req));
  if (!email) {
    return { ok: false, status: 401, message: "Admin sign-in is required." };
  }
  if (!allowed.has(email)) {
    return { ok: false, status: 403, message: "This account is not allowed to review beta applicants." };
  }
  return { ok: true, email };
}

async function firestoreAccessToken(): Promise<string> {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const auth = serviceAccountJson
    ? new GoogleAuth({
        credentials: JSON.parse(serviceAccountJson.replace(/\\n/g, "\n")) as Record<string, string>,
        scopes: [FIRESTORE_SCOPE],
      })
    : new GoogleAuth({ scopes: [FIRESTORE_SCOPE] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("missing_firestore_access_token");
  return token.token;
}

function firestoreString(fields: Record<string, FirestoreValue> | undefined, key: string): string {
  const value = fields?.[key];
  if (!value) return "";
  if (typeof value.stringValue === "string") return value.stringValue;
  if (typeof value.timestampValue === "string") return value.timestampValue;
  if (typeof value.integerValue === "string") return value.integerValue;
  if (typeof value.doubleValue === "number") return String(value.doubleValue);
  if (typeof value.booleanValue === "boolean") return String(value.booleanValue);
  return "";
}

function applicantFromDocument(doc: FirestoreDocument): BetaApprovalApplicant {
  const fields = doc.fields;
  const id = doc.name.split("/").pop() || doc.name;
  const usePurpose = firestoreString(fields, "usePurpose") || firestoreString(fields, "motivation");
  return {
    id,
    fullName: firestoreString(fields, "fullName") || firestoreString(fields, "name"),
    contact: firestoreString(fields, "contact") || firestoreString(fields, "phone"),
    email: firestoreString(fields, "email"),
    dealership: firestoreString(fields, "dealership") || firestoreString(fields, "brand") || firestoreString(fields, "showroom"),
    jobRole: firestoreString(fields, "jobRole") || firestoreString(fields, "role") || "—",
    usePurpose: usePurpose || "—",
    currentCrmApproach: firestoreString(fields, "currentCrmApproach") || "—",
    status: normalizeBetaApprovalStatus(firestoreString(fields, "status")),
    submittedAt: firestoreString(fields, "submittedAt") || firestoreString(fields, "createdAt"),
    source: firestoreString(fields, "source"),
    reviewNote: firestoreString(fields, "reviewNote"),
    approvedAt: firestoreString(fields, "approvedAt"),
    approvedBy: firestoreString(fields, "approvedBy"),
    rejectedAt: firestoreString(fields, "rejectedAt"),
    rejectedBy: firestoreString(fields, "rejectedBy"),
  };
}

export async function listBetaApprovalApplicants(): Promise<BetaApprovalApplicant[]> {
  const pid = projectId();
  if (!pid) throw new Error("missing_project_id");

  const token = await firestoreAccessToken();
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(pid)}/databases/(default)/documents/${encodeURIComponent(collectionId())}`,
  );
  url.searchParams.set("pageSize", "100");
  const res = await fetchWithTimeout(
    url.toString(),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
    FIRESTORE_TIMEOUT_MS,
  );
  if (!res.ok) throw new Error(`firestore_list_${res.status}`);
  const data = (await res.json().catch(() => null)) as { documents?: FirestoreDocument[] } | null;
  return (data?.documents || [])
    .map(applicantFromDocument)
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
}

export async function updateBetaApprovalApplicantStatus(
  id: string,
  status: Extract<BetaApprovalStatus, "approved" | "rejected">,
  adminEmail: string,
): Promise<void> {
  const pid = projectId();
  if (!pid || !id) throw new Error("missing_update_target");

  const token = await firestoreAccessToken();
  const now = new Date().toISOString();
  const fields =
    status === "approved"
      ? {
          status: { stringValue: "approved" },
          approvedAt: { stringValue: now },
          approvedBy: { stringValue: adminEmail },
          updatedAt: { stringValue: now },
        }
      : {
          status: { stringValue: "rejected" },
          rejectedAt: { stringValue: now },
          rejectedBy: { stringValue: adminEmail },
          updatedAt: { stringValue: now },
        };

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(pid)}/databases/(default)/documents/${encodeURIComponent(collectionId())}/${encodeURIComponent(id)}`,
  );
  for (const fieldPath of Object.keys(fields)) url.searchParams.append("updateMask.fieldPaths", fieldPath);

  const res = await fetchWithTimeout(
    url.toString(),
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    },
    FIRESTORE_TIMEOUT_MS,
  );
  if (!res.ok) throw new Error(`firestore_update_${res.status}`);
}
