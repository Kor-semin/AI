"use client";

import { useEffect, useState } from "react";

import { isFirebaseConfigured } from "@/app/firebase/client";
import type { SellerProfileDoc } from "@/app/crm/sellerProfile";
import { subscribeSellerProfile } from "@/app/crm/sellerProfile";

function mapSellerProfileSubscribeError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/permission|insufficient permissions|missing or insufficient permissions/i.test(raw)) {
    return "permission_denied";
  }
  return raw;
}

/** Firebase 로그인 후 영업 프로필 검토 상태 */
export function useSellerProfile(uid: string | null | undefined): {
  loading: boolean;
  profile: SellerProfileDoc | null;
  error: string | null;
} {
  const [loading, setLoading] = useState(() => Boolean(uid && isFirebaseConfigured()));
  const [profile, setProfile] = useState<SellerProfileDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) {
      setLoading(false);
      setProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setProfile(null);
    setError(null);

    let off: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        off = await subscribeSellerProfile(
          uid,
          (p) => {
            if (!cancelled) {
              setProfile(p);
              setLoading(false);
            }
          },
          (e) => {
            if (!cancelled) {
              if (typeof console !== "undefined" && typeof console.error === "function") {
                console.error("[sellerProfiles] snapshot error", e);
              }
              setProfile(null);
              setError(mapSellerProfileSubscribeError(e));
              setLoading(false);
            }
          },
        );
      } catch (e) {
        if (!cancelled) {
          if (typeof console !== "undefined" && typeof console.error === "function") {
            console.error("[sellerProfiles] subscribe setup error", e);
          }
          setError(mapSellerProfileSubscribeError(e));
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      off?.();
    };
  }, [uid]);

  return { loading, profile, error };
}

export function sellerCanUseApp(profile: SellerProfileDoc | null | undefined): boolean {
  return profile?.approvalStatus === "approved";
}
