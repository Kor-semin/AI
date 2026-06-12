import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function uidFromArgs(args: string[]): string {
  const inline = args.find((arg) => arg.startsWith("--uid="));
  if (inline) return inline.slice("--uid=".length).trim();

  const uidFlagIndex = args.indexOf("--uid");
  if (uidFlagIndex >= 0) return (args[uidFlagIndex + 1] || "").trim();

  return "";
}

function serviceAccountFromEnv(): Record<string, string> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) throw new Error("missing_service_account");
  return JSON.parse(raw.replace(/\\n/g, "\n")) as Record<string, string>;
}

async function main() {
  const uid = uidFromArgs(process.argv.slice(2));
  if (!uid) {
    console.error("사용법: npx tsx scripts/set-beta-admin-claim.ts --uid=FIREBASE_AUTH_UID");
    process.exitCode = 1;
    return;
  }

  console.log("확인: FIREBASE_SERVICE_ACCOUNT_JSON을 사용해 지정 UID에 betaAdmin 권한을 설정합니다.");
  console.log("주의: UID, 관리자 이메일, 서비스 계정 JSON 내용은 로그에 출력하지 않습니다.");

  try {
    if (getApps().length === 0) {
      initializeApp({ credential: cert(serviceAccountFromEnv()) });
    }

    const auth = getAuth();
    const user = await auth.getUser(uid);
    await auth.setCustomUserClaims(uid, {
      ...(user.customClaims || {}),
      betaAdmin: true,
    });

    console.log("성공: betaAdmin custom claim 설정 완료");
  } catch {
    console.error("실패: betaAdmin custom claim 설정 실패");
    process.exitCode = 1;
  }
}

void main();
