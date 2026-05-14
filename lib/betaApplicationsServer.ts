import type { Firestore } from "firebase-admin/firestore";

import type { BetaSignupWireBody } from "@/lib/betaSignupSubmit";
import { normalizeEmailForBetaAccess } from "@/lib/betaEmailNormalize";

import { getAdminFirestore } from "@/lib/firebaseAdminApp";

export type BetaApplicationStatus = "pending" | "approved" | "rejected";

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
  /** Google 로그인 UID(승인 후 첫 승인 확인 시 보강 가능). */
  approvedUid?: string | null;
  /** 승인 처리한 관리자 이메일(감사용). */
  decidedByEmail?: string | null;
};

const COLLECTION = "betaApplications";

function wireToRecordFields(body: BetaSignupWireBody): Omit<BetaApplicationRecord, "status" | "submittedAt" | "updatedAt" | "approvedUid" | "decidedByEmail"> {
  return {
    fullName: body.fullName.trim(),
    contact: body.contact.trim(),
    email: body.email.trim(),
    dealership: body.dealership.trim(),
    currentCrmApproach: body.currentCrmApproach.trim(),
    motivation: body.motivation.trim(),
    source: body.source.trim() || "sensora-alpha-join",
  };
}

export async function upsertBetaApplicationFromJoin(body: BetaSignupWireBody): Promise<boolean> {
  const db = getAdminFirestore();
  if (!db) return false;

  const emailNorm = normalizeEmailForBetaAccess(body.email);
  if (!emailNorm) return false;

  const ref = db.collection(COLLECTION).doc(emailNorm);
  const snap = await ref.get();
  const now = new Date().toISOString();
  const fields = wireToRecordFields(body);

  if (!snap.exists) {
    const rec: BetaApplicationRecord = {
      ...fields,
      status: "pending",
      submittedAt: now,
      updatedAt: now,
    };
    await ref.set(rec);
    return true;
  }

  const cur = snap.data() as Partial<BetaApplicationRecord> | undefined;
  const st = cur?.status;

  if (st === "approved") {
    await ref.set(
      {
        ...fields,
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
    if (!x.fullName || !x.email || !x.status) continue;
    out.push({
      fullName: x.fullName,
      contact: x.contact ?? "",
      email: x.email,
      dealership: x.dealership ?? "",
      currentCrmApproach: x.currentCrmApproach ?? "",
      motivation: x.motivation ?? "",
      submittedAt: x.submittedAt ?? "",
      updatedAt: x.updatedAt ?? "",
      status: x.status,
      source: x.source ?? "",
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
  if (cur.status !== "approved") return;
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
  const st = (snap.data() as { status?: string }).status;
  if (st === "approved" || st === "pending" || st === "rejected") return st;
  return "not_found";
}
