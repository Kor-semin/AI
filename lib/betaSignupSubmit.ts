/**
 * Sensora Auto CRM — 베타 신청 페이로드.
 * Google Apps Script 웹 앱 등으로 POST할 때 필드명을 그대로 맞추면 됩니다.
 */
export type BetaSignupPayload = {
  fullName: string;
  contact: string;
  email: string;
  dealership: string;
  currentCrmApproach: string;
  motivation: string;
};

/** 폼 입력 + 서버/시트로 함께 보내는 메타(클라이언트에서만 조합). */
export type BetaSignupWireBody = BetaSignupPayload & {
  submittedAt: string;
  source: string;
};

/** 제출 성공 시 `savedToBackend`: 서버(Firestore) 또는 웹훅으로 저장됐는지 여부. 알림 문구는 호출 측(i18n)에서 처리합니다. */
export type BetaSignupResult =
  | { ok: true; savedToBackend: boolean }
  | { ok: false; error: string };

const BETA_SIGNUP_SOURCE = "sensora-alpha-join";

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

async function persistBetaSignupToServer(payloadWithMeta: BetaSignupWireBody): Promise<boolean> {
  try {
    const res = await fetch("/api/beta-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadWithMeta),
    });
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok || !data || typeof data !== "object") {
      return false;
    }
    return (data as { persisted?: unknown }).persisted === true;
  } catch {
    return false;
  }
}

/**
 * 베타 신청 제출 (클라이언트 전용).
 *
 * - `/api/beta-signup`: 서버에 `FIREBASE_SERVICE_ACCOUNT_JSON` 이 있으면 Firestore `betaApplications` 에 저장(기본 pending).
 * - `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT` 가 있으면 기존 웹훅(Google Apps Script 등)으로도 전송합니다.
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
    const serverPersisted = await persistBetaSignupToServer(payloadWithMeta);

    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payloadWithMeta),
        });
        return { ok: true, savedToBackend: true };
      } catch {
        console.warn("[beta signup] webhook request failed");
        if (serverPersisted) {
          return { ok: true, savedToBackend: true };
        }
        return { ok: false, error: "network" };
      }
    }

    return { ok: true, savedToBackend: serverPersisted };
  } catch {
    console.warn("[beta signup] submit failed");
    return { ok: false, error: "network" };
  }
}
