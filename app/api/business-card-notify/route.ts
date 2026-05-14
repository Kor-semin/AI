import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { verifyFirebaseIdToken } from "@/lib/firebaseIdTokenVerify";
import { MissingEnvError } from "@/lib/notify-errors";

export const runtime = "nodejs";

const DEFAULT_NOTIFY_TO = "tadow420@naver.com";

function storagePathMatchesSeller(storagePath: string, uid: string): boolean {
  if (!uid || storagePath.includes("..") || /\0/.test(storagePath)) return false;
  const prefix = `seller-cards/${uid}/`;
  if (!storagePath.startsWith(prefix)) return false;
  return storagePath.slice(prefix.length).trim().length > 0;
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
