import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { listBetaApplicationsFromDb } from "@/lib/betaApplicationsServer";
import { getFirebaseAdminApp } from "@/lib/firebaseAdminApp";
import { requireBetaOpsAdmin } from "@/lib/internalBetaAdminAuth";

export const runtime = "nodejs";

function isFirestorePermissionDenied(error: unknown): boolean {
  const e = error as { code?: number | string; message?: string };
  const code = e?.code;
  if (code === 7 || code === "PERMISSION_DENIED" || code === "permission-denied") return true;
  const msg = typeof e?.message === "string" ? e.message : String(error ?? "");
  return /PERMISSION_DENIED|permission-denied|insufficient permissions/i.test(msg);
}

export async function GET(req: Request): Promise<NextResponse> {
  const gate = await requireBetaOpsAdmin(req);
  if (gate instanceof NextResponse) return gate;

  let db: ReturnType<typeof getFirestore>;
  try {
    db = getFirestore(getFirebaseAdminApp());
  } catch (error) {
    console.error("[internal/beta-applications] firebase admin init failed", error);
    return NextResponse.json({ ok: false, error: "server_misconfigured" }, { status: 503 });
  }

  try {
    const items = await listBetaApplicationsFromDb(db);
    return NextResponse.json({ ok: true, items, applications: items });
  } catch (error) {
    if (isFirestorePermissionDenied(error)) {
      console.error("[internal/beta-applications] firestore permission denied", error);
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    console.error("[internal/beta-applications] failed", error);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 });
  }
}
