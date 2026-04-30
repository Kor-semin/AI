import { OAuth2Client } from "google-auth-library";
import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { MissingEnvError } from "@/lib/notify-errors";

export const runtime = "nodejs";

const oauth2 = new OAuth2Client();

const DEFAULT_NOTIFY_TO = "tadow420@naver.com";

function storagePathMatchesSeller(storagePath: string, uid: string): boolean {
  if (!uid || storagePath.includes("..") || /\0/.test(storagePath)) return false;
  const prefix = `seller-cards/${uid}/`;
  if (!storagePath.startsWith(prefix)) return false;
  return storagePath.slice(prefix.length).trim().length > 0;
}

async function verifyFirebaseIdToken(idToken: string): Promise<{ uid: string; email?: string }> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new MissingEnvError("NEXT_PUBLIC_FIREBASE_PROJECT_ID (서버에서 ID 토큰 검증용)");
  }

  const ticket = await oauth2.verifyIdToken({
    idToken,
    audience: projectId,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) throw new Error("Invalid identity token payload");

  const issuer = `https://securetoken.google.com/${projectId}`;
  if (payload.iss !== issuer) {
    throw new Error("Token issuer mismatch");
  }

  return { uid: payload.sub, email: payload.email ?? undefined };
}

function buildTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || typeof pass !== "string" || pass.length === 0) {
    throw new MissingEnvError("SMTP_HOST, SMTP_USER, SMTP_PASS (명함 접수 알림 메일)");
  }

  const portRaw = process.env.SMTP_PORT?.trim();
  const port = Math.max(1, parseInt(portRaw || "587", 10));
  const secure =
    process.env.SMTP_SECURE?.trim().toLowerCase() === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    if (!idToken) {
      return NextResponse.json({ error: "Authorization Bearer token required" }, { status: 401 });
    }

    const body = (await req.json()) as { storagePath?: string };
    const storagePath = typeof body.storagePath === "string" ? body.storagePath.trim() : "";
    if (!storagePath) {
      return NextResponse.json({ error: "storagePath required" }, { status: 400 });
    }

    const { uid, email } = await verifyFirebaseIdToken(idToken);

    if (!storagePathMatchesSeller(storagePath, uid)) {
      return NextResponse.json({ error: "Invalid storage path for this user" }, { status: 403 });
    }

    const notifyTo = process.env.BUSINESS_CARD_NOTIFY_TO?.trim() || DEFAULT_NOTIFY_TO;
    const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || notifyTo;

    const bucket =
      process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

    const subject = `[수첩] 영업 명함 접수 — ${email || uid}`;
    const text = [
      "영업 명함 이미지가 업로드되었습니다.",
      "",
      `판매자 UID: ${uid}`,
      email ? `Google 계정: ${email}` : "(이메일 없음)",
      `Storage 객체 경로: ${storagePath}`,
      bucket ? `버킷 이름: ${bucket} (Firebase 콘솔 → Storage 에서 해당 경로로 확인 가능)` : "",
      "",
      `알림 시각(UTC): ${new Date().toISOString()}`,
    ]
      .filter((line) => line !== "")
      .join("\n");

    const transporter = buildTransporter();
    await transporter.sendMail({
      from,
      to: notifyTo,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof MissingEnvError) {
      return NextResponse.json({ error: e.message, skipped: true }, { status: 503 });
    }
    console.error("[business-card-notify]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "notify failed" },
      { status: 500 },
    );
  }
}
