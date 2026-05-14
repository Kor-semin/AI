"use client";

import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export function isFirebaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
}

/** Google OAuth — 필요 시 비활성화 가능 */
export function isGoogleAuthEnabled() {
  const v =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH ?? process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED;
  if (v == null) return true;
  return String(v).trim().toLowerCase() !== "false";
}

/** 이메일/비밀번호 로그인 — Firebase Console에서 Provider 활성화 필요 */
export function isEmailPasswordAuthEnabled() {
  const v = process.env.NEXT_PUBLIC_ENABLE_EMAIL_PASSWORD_AUTH;
  if (v == null) return true;
  return String(v).trim().toLowerCase() !== "false";
}

function getFirebaseConfig() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  } as const;

  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) {
    throw new Error(
      "Firebase env is missing. Set NEXT_PUBLIC_FIREBASE_* in .env.local (see .env.example).",
    );
  }

  return cfg;
}

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing) return existing;
  return initializeApp(getFirebaseConfig());
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorageBucket() {
  return getStorage(getFirebaseApp());
}
