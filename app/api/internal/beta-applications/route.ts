import { NextResponse } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebaseAdminApp";
import { listBetaApplications } from "@/lib/betaApplicationsServer";
import { requireBetaOpsAdmin } from "@/lib/internalBetaAdminAuth";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<NextResponse> {
  const gate = await requireBetaOpsAdmin(req);
  if (gate instanceof NextResponse) return gate;

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "server_misconfigured" }, { status: 503 });
  }

  try {
    const items = await listBetaApplications();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 });
  }
}
