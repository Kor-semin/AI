"use client";

/** 영업 가입 상태 — 명함 검토 후 사용 가능 */
export type SellerApprovalStatus = "needs_card" | "pending" | "approved" | "rejected";

export type SellerProfileDoc = {
  approvalStatus: SellerApprovalStatus;
  /** 구 방식(SMS 인증 유지 사용자) 레거시 또는 빈 상태 */
  phoneE164?: string;
  signupEmail?: string;
  /** Storage 전체 경로 */
  businessCardStoragePath?: string;
  submittedAtMs?: number;
  updatedAtMs?: number;
  rejectReason?: string;
  authProviderHint?: string;
};

const COLLECTION = "sellerProfiles";

export function subscribeSellerProfile(
  uid: string,
  onValue: (profile: SellerProfileDoc | null) => void,
  onError?: (e: unknown) => void,
): Promise<() => void> {
  return (async () => {
    const { doc, onSnapshot } = await import("firebase/firestore");
    const { getFirebaseDb } = await import("@/app/firebase/client");
    const db = getFirebaseDb();
    const ref = doc(db, COLLECTION, uid);
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          onValue(null);
          return;
        }
        const data = snap.data() as SellerProfileDoc;
        onValue({ ...data, approvalStatus: data.approvalStatus ?? "needs_card" });
      },
      (e) => onError?.(e),
    );
  })();
}

/**
 * SMS 없이 로그인 직후 Firestore 에 판매자 문서 초기화(승인·대기 상태는 유지).
 * Spark/ Storage 위주 사용 시 SMS 과금 회피.
 */
export async function ensureSellerNeedsCard(uid: string, emailHint?: string | null): Promise<void> {
  const { doc, getDoc, setDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? (snap.data() as SellerProfileDoc) : null;
  const st = prev?.approvalStatus;
  const nextStatus: SellerApprovalStatus =
    st === "approved" || st === "pending" || st === "rejected" ? st : "needs_card";
  await setDoc(
    ref,
    {
      ...(emailHint ? { signupEmail: emailHint } : {}),
      approvalStatus: nextStatus,
      updatedAtMs: Date.now(),
      authProviderHint: "oauth",
    },
    { merge: true },
  );
}

export async function submitBusinessCardPending(
  uid: string,
  businessCardStoragePath: string,
): Promise<void> {
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/app/firebase/client");
  const db = getFirebaseDb();
  const ref = doc(db, COLLECTION, uid);
  await setDoc(
    ref,
    {
      approvalStatus: "pending",
      businessCardStoragePath,
      submittedAtMs: Date.now(),
      updatedAtMs: Date.now(),
      submittedAtTs: serverTimestamp(),
    },
    { merge: true },
  );
}
