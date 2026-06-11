import { NextResponse } from "next/server";

import {
  listBetaApprovalApplicants,
  requireBetaApprovalAdmin,
} from "@/lib/server/internalBetaApprovalServer";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<NextResponse> {
  const admin = await requireBetaApprovalAdmin(req);
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.message }, { status: admin.status });
  }

  try {
    const applicants = await listBetaApprovalApplicants();
    return NextResponse.json({ ok: true, applicants });
  } catch {
    return NextResponse.json(
      { ok: false, error: "베타 신청 목록을 불러오지 못했습니다. Firestore 서비스 계정과 컬렉션 설정을 확인해 주세요." },
      { status: 500 },
    );
  }
}
