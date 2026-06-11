/**
 * Sensora Auto CRM — 베타 신청 페이로드.
 * Google Apps Script 웹 앱 등으로 POST할 때 필드명을 그대로 맞추면 됩니다.
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

/** 제출 성공 시 `savedToBackend`: 엔드포인트로 POST 됐는지 여부. 알림 문구는 호출 측(i18n)에서 처리합니다. */
export type BetaSignupResult =
  | { ok: true; savedToBackend: boolean; savedLocally: boolean; submittedAt: string }
  | { ok: false; error: string };

const BETA_SIGNUP_SOURCE = "sensora-alpha-join";
const LOCAL_BETA_SIGNUP_KEY = "sensora.betaSignup.localSubmissions.v1";

function betaSignupEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT;
  return typeof raw === "string" ? raw.trim() : "";
}

function buildWireBody(payload: BetaSignupPayload): BetaSignupWireBody {
  return {
    ...payload,
    submittedAt: new Date().toISOString(),
    source: BETA_SIGNUP_SOURCE,
  };
}

export function betaSignupStorageMode(): "remote" | "local-demo" {
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

/**
 * 베타 신청 제출 (클라이언트 전용).
 *
 * - 엔드포인트 비어 있음: 브라우저 localStorage 데모 저장 — `{ ok: true, savedToBackend: false }`
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

    if (!endpoint) {
      const savedLocally = saveLocalBetaSignup(payloadWithMeta);
      return { ok: true, savedToBackend: false, savedLocally, submittedAt: payloadWithMeta.submittedAt };
    }

    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadWithMeta),
    });

    return { ok: true, savedToBackend: true, savedLocally: false, submittedAt: payloadWithMeta.submittedAt };
  } catch {
    console.warn("[beta signup] webhook request failed");
    return { ok: false, error: "network" };
  }
}
