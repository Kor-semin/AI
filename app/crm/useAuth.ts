"use client";

import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";

const REDIRECT_PENDING_KEY = "customer-manager.auth.redirectPending";

function mapPopupClosedError(): Error {
  return new Error("Google 로그인이 취소되었습니다. 다시 시도해 주세요.");
}

function mapPopupBlockedError(): Error {
  return new Error("브라우저에서 Google 로그인 팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.");
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
  signIn: () => Promise<void>;
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

    // Start listening immediately so we don't get stuck in "loading".
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
          // 팝업 차단 등으로 redirect 폴백만 쓴 경우: 짧은 대기 후 currentUser 복원 시도
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

  return useMemo(() => {
    return {
      auth,
      authError,
      signIn: async () => {
        if (!isFirebaseConfigured()) {
          throw new Error("Firebase 설정(.env.local)이 아직 없습니다. 설정 후 서버를 재시작하세요.");
        }
        if (!isGoogleAuthEnabled()) {
          throw new Error("현재 Google 로그인은 잠시 꺼져 있습니다(준비중).");
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
          const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";

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
      },
      signOut: async () => {
        if (!isFirebaseConfigured()) return;
        setAuthError(null);
        const a = getFirebaseAuth();
        await signOut(a);
      },
    };
  }, [auth, authError]);
}
