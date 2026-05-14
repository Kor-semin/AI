import { NextResponse } from "next/server";

import { getAdminEmailSet, isAdminEmail, logBetaOpsAdminDenied } from "@/lib/adminEmails";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdTokenVerify";
import { isFirebaseAdminConfigured } from "@/lib/firebaseAdminApp";

export type BetaOpsAdminSession = { uid: string; email: string };

/** Firebase ID 토큰 + `ADMIN_EMAILS` 일치 여부. 실패 시 `NextResponse`(401/403/503). */
export async function requireBetaOpsAdmin(req: Request): Promise<BetaOpsAdminSession | NextResponse> {
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "server_misconfigured" }, { status: 503 });
  }

  let uid: string;
  let email: string | undefined;
  try {
    const v = await verifyFirebaseIdToken(idToken);
    uid = v.uid;
    email = v.email;
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const admins = getAdminEmailSet();
  if (!email || !isAdminEmail(email, admins)) {
    logBetaOpsAdminDenied(email, admins.size);
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  return { uid, email };
}
