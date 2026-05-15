import type { Firestore } from "firebase-admin/firestore";

import type { BetaSignupWireBody } from "@/lib/betaSignupSubmit";
import { normalizeEmailForBetaAccess } from "@/lib/betaEmailNormalize";

import { getAdminFirestore } from "@/lib/firebaseAdminApp";

export type BetaApplicationStatus = "pending" | "approved" | "rejected";

/** `/api/beta-access/check` 등에서 로그인 이메일 기준으로 반환하는 접근 판정. */
export type BetaAccessResolveStatus = BetaApplicationStatus | "not_found" | "email_mismatch";

export type BetaApplicationRecord = {
  fullName: string;
  contact: string;
  email: string;
  dealership: string;
  currentCrmApproach: string;
  motivation: string;
  submittedAt: string;
  updatedAt: string;
  status: BetaApplicationStatus;
  source: string;
  /** 신청·조회 키와 동일한 정규화 이메일(레거시 문서 보강용). */
  normalizedEmail?: string;
  /** Google 로그인 UID(승인 후 첫 승인 확인 시 보강 가능). */
  approvedUid?: string | null;
  /** 승인 처리한 관리자 이메일(감사용). */
  decidedByEmail?: string | null;
  consentPrivacy?: boolean;
  consentTerms?: boolean;
  consentMarketing?: boolean;
  consentedAt?: string;
  consentVersion?: string;
};

const COLLECTION = "betaApplications";

/** Firestore·시트 등에서 들어온 status 문자열을 소문자 표준값으로 맞춥니다. */
export function canonicalizeBetaApplicationStatus(raw: unknown): BetaApplicationStatus | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  if (s === "approved" || s === "approve" || s === "accepted") return "approved";
  if (s === "pending" || s === "review" || s === "submitted" || s === "new") return "pending";
  if (s === "rejected" || s === "reject" || s === "denied" || s === "declined") return "rejected";
  return null;
}

function wireToRecordFields(
  body: BetaSignupWireBody,
  emailNorm: string,
): Omit<
  BetaApplicationRecord,
  "status" | "submittedAt" | "updatedAt" | "approvedUid" | "decidedByEmail"
> {
  return {
    fullName: body.fullName.trim(),
    contact: body.contact.trim(),
    email: emailNorm,
    dealership: body.dealership.trim(),
    currentCrmApproach: body.currentCrmApproach.trim(),
    motivation: body.motivation.trim(),
    source: body.source.trim() || "sensora-alpha-join",
    normalizedEmail: emailNorm,
  };
}

function consentPatchFromWire(body: BetaSignupWireBody): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof body.consentPrivacy === "boolean") out.consentPrivacy = body.consentPrivacy;
  if (typeof body.consentTerms === "boolean") out.consentTerms = body.consentTerms;
  if (typeof body.consentMarketing === "boolean") out.consentMarketing = body.consentMarketing;
  if (typeof body.consentedAt === "string" && body.consentedAt.trim()) out.consentedAt = body.consentedAt.trim();
  if (typeof body.consentVersion === "string" && body.consentVersion.trim()) out.consentVersion = body.consentVersion.trim();
  return out;
}

export async function upsertBetaApplicationFromJoin(body: BetaSignupWireBody): Promise<boolean> {
  const db = getAdminFirestore();
  if (!db) return false;

  const emailNorm = normalizeEmailForBetaAccess(body.email);
  if (!emailNorm) return false;

  const ref = db.collection(COLLECTION).doc(emailNorm);
  const snap = await ref.get();
  const now = new Date().toISOString();
  const fields = wireToRecordFields(body, emailNorm);
  const consentExtra = consentPatchFromWire(body);

  if (!snap.exists) {
    await ref.set({
      ...fields,
      status: "pending",
      submittedAt: now,
      updatedAt: now,
      ...consentExtra,
    });
    return true;
  }

  const cur = snap.data() as Partial<BetaApplicationRecord> | undefined;
  const st = canonicalizeBetaApplicationStatus(cur?.status) ?? "pending";

  if (st === "approved") {
    await ref.set(
      {
        ...fields,
        ...consentExtra,
        status: "approved" as const,
        updatedAt: now,
        submittedAt: cur?.submittedAt ?? now,
      },
      { merge: true },
    );
  } else {
    await ref.set(
      {
        ...fields,
        ...consentExtra,
        status: "pending" as const,
        submittedAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  }
  return true;
}

/** Firestore 인스턴스가 준비된 경우 `betaApplications` 컬렉션을 조회합니다(빈 컬렉션은 []). */
export async function listBetaApplicationsFromDb(db: Firestore): Promise<BetaApplicationRecord[]> {
  const snap = await db.collection(COLLECTION).limit(400).get();
  const out: BetaApplicationRecord[] = [];
  for (const d of snap.docs) {
    const x = d.data() as Partial<BetaApplicationRecord>;
    const st = canonicalizeBetaApplicationStatus(x.status) ?? "pending";
    const emailDisplay = (x.email && String(x.email).trim()) || d.id;
    if (!x.fullName || !emailDisplay) continue;
    out.push({
      fullName: x.fullName,
      contact: x.contact ?? "",
      email: emailDisplay,
      dealership: x.dealership ?? "",
      currentCrmApproach: x.currentCrmApproach ?? "",
      motivation: x.motivation ?? "",
      submittedAt: x.submittedAt ?? "",
      updatedAt: x.updatedAt ?? "",
      status: st,
      source: x.source ?? "",
      normalizedEmail: x.normalizedEmail ?? d.id,
      approvedUid: x.approvedUid ?? null,
      decidedByEmail: x.decidedByEmail ?? null,
    });
  }
  out.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  return out;
}

export async function listBetaApplications(): Promise<BetaApplicationRecord[]> {
  const db = getAdminFirestore();
  if (!db) return [];
  return listBetaApplicationsFromDb(db);
}

export async function setBetaApplicationStatus(
  rawEmail: string,
  status: BetaApplicationStatus,
  opts: { adminEmail: string },
): Promise<boolean> {
  const db = getAdminFirestore();
  if (!db) return false;
  const emailNorm = normalizeEmailForBetaAccess(rawEmail);
  if (!emailNorm) return false;

  const ref = db.collection(COLLECTION).doc(emailNorm);
  const snap = await ref.get();
  if (!snap.exists) return false;

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status,
    email: emailNorm,
    normalizedEmail: emailNorm,
    updatedAt: now,
    decidedByEmail: opts.adminEmail,
  };

  if (status === "approved") {
    /** 신청자 Firebase UID는 로그인 후 `/api/beta-access/check` 에서 보강합니다. */
    patch.approvedUid = null;
  } else {
    patch.approvedUid = null;
  }

  await ref.set(patch, { merge: true });
  return true;
}

/** 승인된 신청에 대해 첫 로그인 시 UID를 보강합니다(이메일이 동일한 경우에만). */
export async function attachApprovedUidIfEmpty(emailNorm: string, uid: string): Promise<void> {
  const db = getAdminFirestore();
  if (!db || !emailNorm || !uid) return;
  const ref = db.collection(COLLECTION).doc(emailNorm);
  const snap = await ref.get();
  if (!snap.exists) return;
  const cur = snap.data() as Partial<BetaApplicationRecord>;
  const st = canonicalizeBetaApplicationStatus(cur.status);
  if (st !== "approved") return;
  if (cur.approvedUid && String(cur.approvedUid).trim()) return;
  await ref.set({ approvedUid: uid, updatedAt: new Date().toISOString() }, { merge: true });
}

const SELLER_PROFILES = "sellerProfiles";

/**
 * 베타 신청이 Firestore 상 approved 일 때만, 해당 로그인 uid 의 sellerProfiles 를 Admin 으로 맞춥니다.
 * 클라이언트가 임의로 approved 를 쓰는 우회를 막고, 베타 승인과 영업 프로필 상태를 일치시킵니다.
 */
export async function upsertSellerProfileWhenBetaApproved(emailNorm: string, uid: string): Promise<void> {
  const db = getAdminFirestore();
  if (!db || !emailNorm || !uid) return;
  const st = await getBetaAccessFromFirestore(emailNorm);
  if (st !== "approved") return;
  await db.collection(SELLER_PROFILES).doc(uid).set(
    {
      approvalStatus: "approved" as const,
      signupEmail: emailNorm,
      updatedAtMs: Date.now(),
      authProviderHint: "oauth",
    },
    { merge: true },
  );
}

export async function getBetaAccessFromFirestore(emailNorm: string): Promise<BetaApplicationStatus | "not_found" | null> {
  const db = getAdminFirestore();
  if (!db) return null;
  const snap = await db.collection(COLLECTION).doc(emailNorm).get();
  if (!snap.exists) return "not_found";
  const st = canonicalizeBetaApplicationStatus((snap.data() as { status?: string }).status);
  if (st) return st;
  return "pending";
}

async function findBetaApplicationDocByApprovedUid(db: Firestore, uid: string) {
  const q = await db.collection(COLLECTION).where("approvedUid", "==", uid).limit(25).get();
  if (q.empty) return null;
  const docs = q.docs;
  if (docs.length === 1) return docs[0]!;
  const ranked = docs
    .map((d) => ({
      d,
      st: canonicalizeBetaApplicationStatus(d.data() as { status?: string }) ?? "pending",
    }))
    .sort((a, b) => {
      const w = (s: BetaApplicationStatus) => (s === "approved" ? 0 : s === "pending" ? 1 : 2);
      return w(a.st) - w(b.st);
    });
  return ranked[0]!.d;
}

/**
 * 로그인 이메일(정규화)과 Firebase uid 로 베타 접근 상태를 판별합니다.
 * - 문서 ID는 항상 정규화된 신청 이메일입니다.
 * - `status` 필드가 APPROVED 등 대소문자 혼합이어도 승인으로 인식합니다.
 * - 다른 이메일로 신청 후 승인·UID가 보강된 계정으로 ‘다른’ 이메일로 로그인한 경우 `email_mismatch` 를 반환합니다.
 */
export async function resolveBetaAccessForLogin(
  emailNorm: string,
  uid?: string | null,
): Promise<BetaAccessResolveStatus | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snap = await db.collection(COLLECTION).doc(emailNorm).get();
  if (snap.exists) {
    const st = canonicalizeBetaApplicationStatus((snap.data() as { status?: string }).status) ?? "pending";
    return st;
  }

  const u = typeof uid === "string" && uid.trim() ? uid.trim() : "";
  if (!u) return "not_found";

  const alt = await findBetaApplicationDocByApprovedUid(db, u);
  if (!alt) return "not_found";

  const altId = alt.id;
  const altSt = canonicalizeBetaApplicationStatus((alt.data() as { status?: string }).status) ?? "pending";
  if (altId !== emailNorm && (altSt === "approved" || altSt === "pending")) {
    return "email_mismatch";
  }
  return "not_found";
}
