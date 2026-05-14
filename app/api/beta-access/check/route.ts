import { NextResponse } from "next/server";

import { attachApprovedUidIfEmpty, getBetaAccessFromFirestore } from "@/lib/betaApplicationsServer";
import { isFirebaseAdminConfigured } from "@/lib/firebaseAdminApp";
import { mapUpstreamBetaStatusToCanonical } from "@/lib/betaAccessStatusMap";

export const runtime = "nodejs";

const UPSTREAM_MS = 12_000;

export async function POST(req: Request): Promise<NextResponse> {
  let emailNorm = "";
  let uid: string | undefined;

  try {
    const body: unknown = await req.json().catch(() => null);
    if (body && typeof body === "object") {
      const rec = body as { email?: unknown; uid?: unknown };
      if (typeof rec.email === "string") {
        emailNorm = rec.email.trim().toLowerCase();
      }
      if (typeof rec.uid === "string" && rec.uid.trim()) {
        uid = rec.uid.trim();
      }
    }
  } catch {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }

  if (!emailNorm) {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }

  if (isFirebaseAdminConfigured()) {
    try {
      const st = await getBetaAccessFromFirestore(emailNorm);
      if (st === null) {
        return NextResponse.json({ ok: false, approved: false, status: "error" });
      }
      if (st === "approved") {
        if (uid) {
          await attachApprovedUidIfEmpty(emailNorm, uid);
        }
        return NextResponse.json({ ok: true, approved: true, status: "approved" });
      }
      if (st === "pending") {
        return NextResponse.json({ ok: true, approved: false, status: "pending" });
      }
      if (st === "rejected") {
        return NextResponse.json({ ok: true, approved: false, status: "rejected" });
      }
      return NextResponse.json({ ok: true, approved: false, status: "not_found" });
    } catch {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }
  }

  const endpoint = process.env.BETA_ACCESS_ENDPOINT?.trim();
  if (!endpoint) {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set("action", "checkAccess");
    url.searchParams.set("email", emailNorm);
    const secret = process.env.BETA_ACCESS_SECRET?.trim();
    if (secret) url.searchParams.set("key", secret);

    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), UPSTREAM_MS);
    const upstream = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: ctl.signal,
    });
    clearTimeout(t);

    if (!upstream.ok) {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(await upstream.text()) as unknown;
    } catch {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    const rec = parsed as Record<string, unknown>;
    const okRaw = rec.ok === true;
    const canonical = mapUpstreamBetaStatusToCanonical(rec.status);

    if (!okRaw || canonical === "error_parse") {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    const approved = canonical === "approved";

    return NextResponse.json({
      ok: true,
      approved,
      status: canonical,
    });
  } catch {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }
}
