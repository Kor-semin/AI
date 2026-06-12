/**
 * Sensora Auto CRM — 베타 신청 페이로드.
 * Firestore betaSignups 컬렉션 또는 Google Apps Script 웹 앱 등으로 POST할 때 필드명을 그대로 맞추면 됩니다.
 */
export type BetaSignupPayload = {
  fullName: string;
  contact: string;
  email: string;
  dealership: string;
  jobRole: string;
  usePurpose: string;
  currentCrmApproach: string;
};

/** 폼 입력 + 서버/시트로 함께 보내는 메타(클라이언트에서만 조합). */
export type BetaSignupWireBody = BetaSignupPayload & {
  submittedAt: string;
  source: string;
};

/** 제출 성공 시 저장 위치 플래그. 알림 문구는 호출 측(i18n)에서 처리합니다. */
export type BetaSignupResult =
  | {
      ok: true;
      savedToBackend: boolean;
      savedToFirestore: boolean;
      savedToWebhook: boolean;
      savedLocally: boolean;
      submittedAt: string;
    }
  | { ok: false; error: string };

const BETA_SIGNUP_SOURCE = "sensora-alpha-join";
const LOCAL_BETA_SIGNUP_KEY = "sensora.betaSignup.localSubmissions.v1";

function betaSignupEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT;
  return typeof raw === "string" ? raw.trim() : "";
}

function betaSignupFirestoreCollection(): string {
  const raw = process.env.NEXT_PUBLIC_BETA_SIGNUP_FIRESTORE_COLLECTION;
  return (typeof raw === "string" ? raw.trim() : "") || "betaSignups";
}

function buildWireBody(payload: BetaSignupPayload): BetaSignupWireBody {
  return {
    ...payload,
    submittedAt: new Date().toISOString(),
    source: BETA_SIGNUP_SOURCE,
  };
}

export function betaSignupStorageMode(): "firestore" | "remote" | "local-demo" {
  if (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  ) {
    return "firestore";
  }
  return betaSignupEndpoint() ? "remote" : "local-demo";
}

function saveLocalBetaSignup(body: BetaSignupWireBody): boolean {
  try {
    const raw = window.localStorage.getItem(LOCAL_BETA_SIGNUP_KEY);
    const prev = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(prev) ? prev : [];
    list.push(body);
    window.localStorage.setItem(LOCAL_BETA_SIGNUP_KEY, JSON.stringify(list.slice(-20)));
    return true;
  } catch {
    return false;
  }
}

async function saveFirestoreBetaSignup(body: BetaSignupWireBody): Promise<boolean> {
  const { isFirebaseConfigured, getFirebaseDb } = await import("@/app/firebase/client");
  if (!isFirebaseConfigured()) return false;

  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
  const db = getFirebaseDb();
  await addDoc(collection(db, betaSignupFirestoreCollection()), {
    ...body,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return true;
}

/**
 * 베타 신청 제출 (클라이언트 전용).
 *
 * - Firebase public env 있음: Firestore `betaSignups`(기본) 컬렉션에 create.
 * - Firebase 미설정 + 엔드포인트 있음: Google Apps Script 웹훅 호환 POST.
 * - 둘 다 비어 있음: 브라우저 localStorage 데모 저장.
 * - 엔드포인트 있음: `no-cors` + `text/plain` 로 JSON 문자열 POST (Google Apps Script 웹 앱 호환).
 *   `no-cors`에서는 응답 상태를 읽을 수 없으므로 **fetch 가 reject 되지 않으면** 접수 성공으로 봅니다.
 *
 * body에는 폼 필드 + `submittedAt`(ISO) + `source` 포함. 개인정보는 로그하지 않습니다.
 */
export async function submitBetaSignup(payload: BetaSignupPayload): Promise<BetaSignupResult> {
  const endpoint = betaSignupEndpoint();

  try {
    if (typeof window === "undefined") {
      return { ok: false, error: "submitBetaSignup is client-only" };
    }

    const payloadWithMeta = buildWireBody(payload);

    const savedToFirestore = await saveFirestoreBetaSignup(payloadWithMeta);
    if (savedToFirestore) {
      return {
        ok: true,
        savedToBackend: true,
        savedToFirestore: true,
        savedToWebhook: false,
        savedLocally: false,
        submittedAt: payloadWithMeta.submittedAt,
      };
    }

    if (!endpoint) {
      const savedLocally = saveLocalBetaSignup(payloadWithMeta);
      return {
        ok: true,
        savedToBackend: false,
        savedToFirestore: false,
        savedToWebhook: false,
        savedLocally,
        submittedAt: payloadWithMeta.submittedAt,
      };
    }

    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadWithMeta),
    });

    return {
      ok: true,
      savedToBackend: true,
      savedToFirestore: false,
      savedToWebhook: true,
      savedLocally: false,
      submittedAt: payloadWithMeta.submittedAt,
    };
  } catch {
    console.warn("[beta signup] request failed");
    return { ok: false, error: "network" };
  }
}
