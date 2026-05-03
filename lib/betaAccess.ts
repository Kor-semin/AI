"use client";

import { useEffect, useState } from "react";

/** Values returned by `/api/beta-access/check` and Apps Script lookup (minimal). */
export type BetaAccessSheetStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "not_found"
  | "error";

export type BetaAccessCheckResponse = {
  ok: boolean;
  approved: boolean;
  status: BetaAccessSheetStatus;
};

/** Normalize email the same way as the API route (trim + lowercase). */
export function normalizeEmailForBetaAccess(email: string): string {
  return email.trim().toLowerCase();
}

export async function postBetaAccessCheck(rawEmail: string): Promise<BetaAccessCheckResponse> {
  const email = normalizeEmailForBetaAccess(rawEmail);
  if (!email) {
    return { ok: false, approved: false, status: "error" };
  }
  try {
    const res = await fetch("/api/beta-access/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      return { ok: false, approved: false, status: "error" };
    }
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return { ok: false, approved: false, status: "error" };
    }
    if (!data || typeof data !== "object") {
      return { ok: false, approved: false, status: "error" };
    }
    const rec = data as Record<string, unknown>;
    const okServer = rec.ok === true;
    const stRaw = typeof rec.status === "string" ? rec.status.trim().toLowerCase() : "";
    const allowedOutcome = new Set(["approved", "pending", "rejected", "not_found"]);
    if (!okServer) {
      return { ok: false, approved: false, status: "error" };
    }
    if (!allowedOutcome.has(stRaw)) {
      return { ok: false, approved: false, status: "error" };
    }
    const st = stRaw as Exclude<BetaAccessSheetStatus, "error">;
    return { ok: true, approved: st === "approved", status: st };
  } catch {
    return { ok: false, approved: false, status: "error" };
  }
}

export type UseBetaSheetAccessOptions = {
  /** When true (e.g. signed out), do not call the API and treat as allowed so local CRM preview stays available. */
  skip?: boolean;
};

/**
 * Loads beta sheet approval for signed-in users. When `skip` is true, does not fetch and exposes approved=true.
 * When not skipping and `email` is empty, fails closed (not approved).
 */
export function useBetaSheetAccess(
  email: string | null | undefined,
  options?: UseBetaSheetAccessOptions,
): {
  loading: boolean;
  resolved: boolean;
  approved: boolean;
  status: BetaAccessSheetStatus | null;
} {
  const skip = options?.skip === true;
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [approved, setApproved] = useState(true);
  const [status, setStatus] = useState<BetaAccessSheetStatus | null>(null);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      setResolved(true);
      setApproved(true);
      setStatus(null);
      return;
    }

    const eRaw = typeof email === "string" ? email : "";
    if (!eRaw.trim()) {
      setLoading(false);
      setResolved(true);
      setApproved(false);
      setStatus("not_found");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setResolved(false);

    void (async () => {
      const emailNorm = normalizeEmailForBetaAccess(eRaw);
      if (!emailNorm) {
        if (!cancelled) {
          setLoading(false);
          setResolved(true);
          setApproved(false);
          setStatus("not_found");
        }
        return;
      }
      const r = await postBetaAccessCheck(emailNorm);
      if (cancelled) return;
      setLoading(false);
      setResolved(true);
      const st = r.status;
      setApproved(Boolean(r.ok && st === "approved"));
      setStatus(st);
    })();

    return () => {
      cancelled = true;
    };
  }, [email, skip]);

  return { loading, resolved, approved, status };
}
