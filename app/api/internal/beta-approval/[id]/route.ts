import { NextResponse } from "next/server";

import {
  requireBetaApprovalAdmin,
  updateBetaApprovalApplicantStatus,
} from "@/lib/server/internalBetaApprovalServer";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireBetaApprovalAdmin(req);
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.message }, { status: admin.status });
  }

  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
  const action = typeof body?.action === "string" ? body.action : "";
  const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : null;

  if (!id || !nextStatus) {
    return NextResponse.json({ ok: false, error: "Invalid approval action." }, { status: 400 });
  }

  try {
    await updateBetaApprovalApplicantStatus(id, nextStatus, admin.email);
    return NextResponse.json({ ok: true, status: nextStatus });
  } catch {
    return NextResponse.json(
      { ok: false, error: "승인 상태를 변경하지 못했습니다. 관리자 권한과 Firestore 설정을 확인해 주세요." },
      { status: 500 },
    );
  }
}
