import { NextResponse } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebaseAdminApp";
import { upsertBetaApplicationFromJoin } from "@/lib/betaApplicationsServer";
import type { BetaSignupWireBody } from "@/lib/betaSignupSubmit";
import { normalizeEmailForBetaAccess } from "@/lib/betaEmailNormalize";

export const runtime = "nodejs";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const payload: BetaSignupWireBody = {
    fullName: isNonEmptyString(b.fullName) ? b.fullName.trim() : "",
    contact: isNonEmptyString(b.contact) ? b.contact.trim() : "",
    email: isNonEmptyString(b.email) ? b.email.trim() : "",
    dealership: isNonEmptyString(b.dealership) ? b.dealership.trim() : "",
    currentCrmApproach: isNonEmptyString(b.currentCrmApproach) ? b.currentCrmApproach.trim() : "",
    motivation: isNonEmptyString(b.motivation) ? b.motivation.trim() : "",
    submittedAt: isNonEmptyString(b.submittedAt) ? b.submittedAt.trim() : new Date().toISOString(),
    source: isNonEmptyString(b.source) ? b.source.trim() : "sensora-alpha-join",
    ...(typeof b.consentPrivacy === "boolean" ? { consentPrivacy: b.consentPrivacy } : {}),
    ...(typeof b.consentTerms === "boolean" ? { consentTerms: b.consentTerms } : {}),
    ...(typeof b.consentMarketing === "boolean" ? { consentMarketing: b.consentMarketing } : {}),
    ...(isNonEmptyString(b.consentedAt) ? { consentedAt: b.consentedAt.trim() } : {}),
    ...(isNonEmptyString(b.consentVersion) ? { consentVersion: b.consentVersion.trim() } : {}),
  };

  if (
    !payload.fullName ||
    !payload.contact ||
    !payload.email ||
    !payload.dealership ||
    !payload.currentCrmApproach ||
    !payload.motivation
  ) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const emailNorm = normalizeEmailForBetaAccess(payload.email);
    if (!emailNorm) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    const persisted = await upsertBetaApplicationFromJoin(payload);
    return NextResponse.json({ ok: true, persisted });
  } catch {
    return NextResponse.json({ ok: false, error: "persist_failed" }, { status: 500 });
  }
}
