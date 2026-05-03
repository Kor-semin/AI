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

export type BetaSignupResult = { ok: true } | { ok: false; error: string };

function betaSignupEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT;
  return typeof raw === "string" ? raw.trim() : "";
}

/**
 * 베타 신청 제출.
 *
 * - `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT`가 비어 있으면: 데모용 `alert`만 (서버 전송 없음).
 * - 값이 있으면: 해당 URL로 JSON `POST` (Google Sheet용 Apps Script 웹 앱 URL 등).
 *
 * 이름·연락처·이메일 등은 콘솔에 출력하지 않습니다.
 */
export async function submitBetaSignup(payload: BetaSignupPayload): Promise<BetaSignupResult> {
  const endpoint = betaSignupEndpoint();

  try {
    if (typeof window === "undefined") {
      return { ok: false, error: "submitBetaSignup is client-only" };
    }

    if (!endpoint) {
      window.alert("베타 신청 폼을 제출했습니다.\n\n(데모 단계 — 아직 서버에 저장되지 않습니다.)");
      return { ok: true };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      await res.text().catch(() => "");
      console.warn("[beta signup] POST failed", res.status);
      window.alert("신청 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return { ok: false, error: `HTTP ${res.status}` };
    }

    window.alert("베타 신청이 접수되었습니다.");
    return { ok: true };
  } catch (e) {
    console.warn("[beta signup] fetch error");
    if (typeof window !== "undefined") {
      window.alert("신청 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
