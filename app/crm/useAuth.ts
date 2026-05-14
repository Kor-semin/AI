"use client";

import type { AuthError } from "firebase/auth";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getFirebaseAuth,
  isEmailPasswordAuthEnabled,
  isFirebaseConfigured,
  isGoogleAuthEnabled,
} from "@/app/firebase/client";

const REDIRECT_PENDING_KEY = "customer-manager.auth.redirectPending";

function mapPopupClosedError(): Error {
  return new Error("로그인이 취소되었습니다. 다시 시도해 주세요.");
}

function mapPopupBlockedError(): Error {
  return new Error("브라우저에서 로그인 창이 차단되었습니다. 팝업을 허용한 뒤 다시 시도해 주세요.");
}

function firebaseAuthCode(e: unknown): string {
  if (typeof e === "object" && e !== null && "code" in e) return String((e as AuthError).code);
  return "";
}

/** 사용자에게 노출할 짧은 메시지(원문·스택 미노출). */
function friendlyFirebaseAuthMessage(e: unknown): string {
  const code = firebaseAuthCode(e);
  switch (code) {
    case "auth/invalid-email":
      return "이메일 형식을 확인해 주세요.";
    case "auth/user-disabled":
      return "이 계정은 사용할 수 없습니다. 관리자에게 문의해 주세요.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/email-already-in-use":
      return "이미 사용 중인 이메일입니다. 로그인을 시도해 주세요.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상으로 설정해 주세요.";
    case "auth/too-many-requests":
      return "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    case "auth/network-request-failed":
      return "네트워크 오류입니다. 연결을 확인해 주세요.";
    case "auth/operation-not-allowed":
      return "이메일/비밀번호 로그인이 비활성화되어 있습니다. Firebase 콘솔에서 로그인 방법을 켜 주세요.";
    case "auth/missing-email":
      return "이메일을 입력해 주세요.";
    default:
      return "로그인에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | {
      status: "signed-in";
      uid: string;
      email?: string | null;
      name?: string | null;
      /** 휴대폰 인증을 쓴 경우만 채워짐 — 영업 승인 검사에 사용 */
      phoneNumber?: string | null;
    };

export function useAuth(): {
  auth: AuthState;
  authError: string | null;
  /** Google OAuth (기존 호환용 이름). */
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [auth, setAuth] = useState<AuthState>(() =>
    isFirebaseConfigured() ? { status: "loading" } : { status: "signed-out" },
  );
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }
    const a = getFirebaseAuth();

    let cancelled = false;

    const unsub = onAuthStateChanged(a, (user) => {
      if (!user) setAuth({ status: "signed-out" });
      else
        setAuth({
          status: "signed-in",
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          phoneNumber: user.phoneNumber,
        });
    });

    void (async () => {
      try {
        await setPersistence(a, browserLocalPersistence);
        if (typeof a.authStateReady === "function") {
          await a.authStateReady();
        }

        const res = await getRedirectResult(a);
        const wasPending =
          typeof window !== "undefined" && window.sessionStorage.getItem(REDIRECT_PENDING_KEY);
        if (typeof window !== "undefined") window.sessionStorage.removeItem(REDIRECT_PENDING_KEY);

        if (cancelled) return;

        if (res?.user) {
          setAuth({
            status: "signed-in",
            uid: res.user.uid,
            email: res.user.email,
            name: res.user.displayName,
            phoneNumber: res.user.phoneNumber,
          });
          setAuthError(null);
        } else if (wasPending) {
          await new Promise((r) => window.setTimeout(r, 1500));
          const u = a.currentUser;
          if (u) {
            setAuth({
              status: "signed-in",
              uid: u.uid,
              email: u.email,
              name: u.displayName,
              phoneNumber: u.phoneNumber,
            });
            setAuthError(null);
          } else {
            setAuthError(
              "로그인 리다이렉트는 완료됐지만 세션을 복원하지 못했습니다. 브라우저가 인증 저장소(쿠키/저장소)를 차단하고 있을 수 있습니다.",
            );
          }
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        console.error(e);
        setAuthError(msg);
        setAuth({ status: "signed-out" });
      }
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const signInWithGoogleImpl = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase 설정(.env.local)이 아직 없습니다. 설정 후 서버를 재시작하세요.");
    }
    if (!isGoogleAuthEnabled()) {
      throw new Error("현재 로그인은 일시적으로 비활성화되어 있습니다(준비 중).");
    }
    setAuthError(null);
    setAuth({ status: "loading" });

    const a = getFirebaseAuth();
    await setPersistence(a, browserLocalPersistence);
    const provider = new GoogleAuthProvider();

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(REDIRECT_PENDING_KEY);
    }

    try {
      const cred = await signInWithPopup(a, provider);
      if (cred.user) {
        setAuth({
          status: "signed-in",
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName,
          phoneNumber: cred.user.phoneNumber,
        });
        setAuthError(null);
      }
    } catch (e) {
      const code = firebaseAuthCode(e);

      if (code === "auth/popup-blocked") {
        if (typeof window !== "undefined") {
          try {
            setAuthError(mapPopupBlockedError().message);
            window.sessionStorage.setItem(REDIRECT_PENDING_KEY, "1");
            await signInWithRedirect(a, provider);
            return;
          } catch (e2) {
            window.sessionStorage.removeItem(REDIRECT_PENDING_KEY);
            setAuth({ status: "signed-out" });
            if (e2 instanceof Error) throw e2;
            throw new Error(String(e2));
          }
        }
        setAuth({ status: "signed-out" });
        throw mapPopupBlockedError();
      }

      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setAuth({ status: "signed-out" });
        throw mapPopupClosedError();
      }

      setAuth({ status: "signed-out" });
      if (e instanceof Error) throw e;
      throw new Error(String(e));
    }
  }, []);

  const signInWithEmailPasswordImpl = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase 설정(.env.local)이 아직 없습니다. 설정 후 서버를 재시작하세요.");
    }
    if (!isEmailPasswordAuthEnabled()) {
      throw new Error("이메일 로그인이 비활성화되어 있습니다. 설정을 확인해 주세요.");
    }
    setAuthError(null);
    const a = getFirebaseAuth();
    await setPersistence(a, browserLocalPersistence);
    try {
      await signInWithEmailAndPassword(a, email.trim(), password);
      setAuthError(null);
    } catch (e) {
      throw new Error(friendlyFirebaseAuthMessage(e));
    }
  }, []);

  const signUpWithEmailPasswordImpl = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase 설정(.env.local)이 아직 없습니다. 설정 후 서버를 재시작하세요.");
    }
    if (!isEmailPasswordAuthEnabled()) {
      throw new Error("이메일 로그인이 비활성화되어 있습니다. 설정을 확인해 주세요.");
    }
    setAuthError(null);
    const a = getFirebaseAuth();
    await setPersistence(a, browserLocalPersistence);
    try {
      await createUserWithEmailAndPassword(a, email.trim(), password);
      setAuthError(null);
    } catch (e) {
      throw new Error(friendlyFirebaseAuthMessage(e));
    }
  }, []);

  const requestPasswordResetImpl = useCallback(async (email: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase 설정(.env.local)이 아직 없습니다. 설정 후 서버를 재시작하세요.");
    }
    if (!isEmailPasswordAuthEnabled()) {
      throw new Error("이메일 로그인이 비활성화되어 있습니다. 설정을 확인해 주세요.");
    }
    const a = getFirebaseAuth();
    const trimmed = email.trim();
    if (!trimmed) {
      throw new Error("비밀번호 재설정을 위해 이메일을 입력해 주세요.");
    }
    try {
      await firebaseSendPasswordResetEmail(a, trimmed);
    } catch (e) {
      throw new Error(friendlyFirebaseAuthMessage(e));
    }
  }, []);

  const signOutImpl = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setAuthError(null);
    const a = getFirebaseAuth();
    await signOut(a);
  }, []);

  return useMemo(() => {
    return {
      auth,
      authError,
      signIn: signInWithGoogleImpl,
      signInWithGoogle: signInWithGoogleImpl,
      signInWithEmailPassword: signInWithEmailPasswordImpl,
      signUpWithEmailPassword: signUpWithEmailPasswordImpl,
      requestPasswordReset: requestPasswordResetImpl,
      signOut: signOutImpl,
    };
  }, [
    auth,
    authError,
    signInWithGoogleImpl,
    signInWithEmailPasswordImpl,
    signUpWithEmailPasswordImpl,
    requestPasswordResetImpl,
    signOutImpl,
  ]);
}
