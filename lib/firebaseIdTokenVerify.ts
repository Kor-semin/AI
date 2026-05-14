import { getAuth } from "firebase-admin/auth";

import { getFirebaseAdminApp, isFirebaseAdminConfigured } from "@/lib/firebaseAdminApp";
import { MissingEnvError } from "@/lib/notify-errors";

/** Firebase Auth ID 토큰 검증(서버 전용). Firebase Admin `verifyIdToken` 사용. */
export async function verifyFirebaseIdToken(idToken: string): Promise<{ uid: string; email?: string }> {
  const trimmed = typeof idToken === "string" ? idToken.trim() : "";
  if (!trimmed) {
    throw new Error("Missing id token");
  }
  if (!isFirebaseAdminConfigured()) {
    throw new MissingEnvError("FIREBASE_SERVICE_ACCOUNT_JSON (Firebase ID 토큰 검증·Admin SDK)");
  }

  const decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(trimmed);
  return { uid: decoded.uid, email: decoded.email ?? undefined };
}
