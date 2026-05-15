"use client";

import { useEffect, useState } from "react";

import { normalizeEmailForBetaAccess as normalizeEmail } from "@/lib/betaEmailNormalize";

/** Values returned by `/api/beta-access/check` and Apps Script lookup (minimal). */
export type BetaAccessSheetStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "not_found"
  | "email_mismatch"
  | "error";

export type BetaAccessCheckResponse = {
  ok: boolean;
  approved: boolean;
  status: BetaAccessSheetStatus;
};

/** Normalize email the same way as the API route (trim + lowercase). */
export function normalizeEmailForBetaAccess(email: string): string {
  return normalizeEmail(email);
}

/**
 * 베타 승인 확인 UI용 이메일 마스킹(예: `se***@example.com`).
 * 콘솔 로그 등에는 사용하지 마세요.
 */
export function maskEmailForBetaDisplay(raw: string | null | undefined): string {
  const normalized = normalizeEmailForBetaAccess(typeof raw === "string" ? raw : "");
  if (!normalized) return "—";

  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) {
    return "***";
  }

  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (!local.length) {
    return `***@${domain}`;
  }

  let maskedLocal: string;
  if (local.length === 1) {
    maskedLocal = `${local}***`;
  } else if (local.length === 2) {
    maskedLocal = `${local}***`;
  } else {
    maskedLocal = `${local.slice(0, 2)}***`;
  }

  return `${maskedLocal}@${domain}`;
}

export async function postBetaAccessCheck(
  rawEmail: string,
  firebaseUid?: string | null,
): Promise<BetaAccessCheckResponse> {
  const email = normalizeEmailForBetaAccess(rawEmail);
  if (!email) {
    return { ok: false, approved: false, status: "error" };
  }
  try {
    const uid = typeof firebaseUid === "string" && firebaseUid.trim() ? firebaseUid.trim() : undefined;
    const res = await fetch("/api/beta-access/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uid ? { email, uid } : { email }),
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
    const allowedOutcome = new Set(["approved", "pending", "rejected", "not_found", "email_mismatch"]);
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
  /** 승인된 신청에 Firebase UID를 보강하기 위해 전달(선택). */
  uid?: string | null;
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
  const uidOpt = options?.uid;
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
      const r = await postBetaAccessCheck(emailNorm, uidOpt);
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
  }, [email, skip, uidOpt]);

  return { loading, resolved, approved, status };
}
