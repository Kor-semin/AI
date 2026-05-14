import { NextResponse } from "next/server";

import {
  getAdminEmailSet,
  hasAdminEmailsEnv,
  isAdminEmail,
  maskEmailForServerLog,
} from "@/lib/adminEmails";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdTokenVerify";
import { isFirebaseAdminConfigured } from "@/lib/firebaseAdminApp";

export const runtime = "nodejs";

export type AdminDiagnosticsResponse = {
  ok: true;
  tokenEmailMasked: string;
  hasAdminEmailsEnv: boolean;
  adminAllowlistSize: number;
  isAdmin: boolean;
};

/**
 * 내부 진단: Bearer Firebase ID 토큰 기준으로 ADMIN_EMAILS 적용 여부를 민감정보 없이 반환합니다.
 * ADMIN_EMAILS 원문·전체 목록은 응답하지 않습니다.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "server_misconfigured" }, { status: 503 });
  }

  let email: string | undefined;
  try {
    const v = await verifyFirebaseIdToken(idToken);
    email = v.email;
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const hasEnv = hasAdminEmailsEnv();
  const admins = getAdminEmailSet();
  const adminAllowlistSize = admins.size;
  const isAdmin = Boolean(email && isAdminEmail(email, admins));

  const body: AdminDiagnosticsResponse = {
    ok: true,
    tokenEmailMasked: maskEmailForServerLog(email ?? ""),
    hasAdminEmailsEnv: hasEnv,
    adminAllowlistSize,
    isAdmin,
  };

  return NextResponse.json(body);
}
