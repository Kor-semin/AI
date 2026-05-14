import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;

/** 서버에서 Firestore(betaApplications 등) 접근 시 사용. `FIREBASE_SERVICE_ACCOUNT_JSON` 미설정 시 null. */
export function isFirebaseAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim());
}

export function getFirebaseAdminApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
  }
  const json = JSON.parse(raw) as Record<string, unknown>;
  cachedApp = initializeApp({
    credential: cert(json as Parameters<typeof cert>[0]),
  });
  return cachedApp;
}

export function getAdminFirestore(): Firestore | null {
  if (!isFirebaseAdminConfigured()) return null;
  return getFirestore(getFirebaseAdminApp());
}
