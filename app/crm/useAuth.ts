"use client";

import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/app/firebase/client";

const REDIRECT_PENDING_KEY = "customer-manager.auth.redirectPending";

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; uid: string; email?: string | null; name?: string | null };

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
      else setAuth({ status: "signed-in", uid: user.uid, email: user.email, name: user.displayName });
    });

    void (async () => {
      try {
        await setPersistence(a, browserLocalPersistence);

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
          });
          setAuthError(null);
        } else if (wasPending) {
          // Sometimes the redirect result is null but the user is still restored shortly after.
          await new Promise((r) => window.setTimeout(r, 1500));
          const u = a.currentUser;
          if (u) {
            setAuth({
              status: "signed-in",
              uid: u.uid,
              email: u.email,
              name: u.displayName,
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
        setAuthError(null);
        setAuth({ status: "loading" });
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(REDIRECT_PENDING_KEY, "1");
        }
        const a = getFirebaseAuth();
        await setPersistence(a, browserLocalPersistence);
        const provider = new GoogleAuthProvider();
        // Use redirect-only: avoids popup/handler misroutes and works more consistently.
        await signInWithRedirect(a, provider);
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

