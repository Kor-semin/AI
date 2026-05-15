import { NextResponse } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebaseAdminApp";
import { setBetaApplicationStatus } from "@/lib/betaApplicationsServer";
import { requireBetaOpsAdmin } from "@/lib/internalBetaAdminAuth";
import { normalizeEmailForBetaAccess } from "@/lib/betaEmailNormalize";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
  const gate = await requireBetaOpsAdmin(req);
  if (gate instanceof NextResponse) return gate;

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "server_misconfigured" }, { status: 503 });
  }

  let email = "";
  try {
    const body: unknown = await req.json();
    if (body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string") {
      email = normalizeEmailForBetaAccess((body as { email: string }).email);
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  const ok = await setBetaApplicationStatus(email, "approved", { adminEmail: gate.email });
  if (!ok) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
