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

/** 제출 성공 시 `savedToBackend`: 엔드포인트로 POST 됐는지 여부. 알림 문구는 호출 측(i18n)에서 처리합니다. */
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

/**
 * 베타 신청 제출 (클라이언트 전용).
 *
 * - 엔드포인트 비어 있음: 원격 저장 없음 — `{ ok: true, savedToBackend: false }`
 * - 엔드포인트 있음: JSON POST — 성공 시 `savedToBackend: true`
 *
 * POST body에는 `submittedAt`(ISO)·`source`가 포함됩니다.
 * 이름·연락처 등은 콘솔에 출력하지 않으며, 실패 시 응답 본문도 로그하지 않습니다.
 */
export async function submitBetaSignup(payload: BetaSignupPayload): Promise<BetaSignupResult> {
  const endpoint = betaSignupEndpoint();

  try {
    if (typeof window === "undefined") {
      return { ok: false, error: "submitBetaSignup is client-only" };
    }

    if (!endpoint) {
      return { ok: true, savedToBackend: false };
    }

    const body = buildWireBody(payload);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      await res.text().catch(() => "");
      console.warn("[beta signup] POST failed", res.status);
      return { ok: false, error: `HTTP ${res.status}` };
    }

    return { ok: true, savedToBackend: true };
  } catch {
    console.warn("[beta signup] fetch error");
    return { ok: false, error: "network" };
  }
}
