import { OAuth2Client } from "google-auth-library";

import { MissingEnvError } from "@/lib/notify-errors";

const oauth2 = new OAuth2Client();

/** Firebase Auth ID 토큰 검증(서버 전용). `business-card-notify` 등 API Route에서 공통 사용. */
export async function verifyFirebaseIdToken(idToken: string): Promise<{ uid: string; email?: string }> {
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
