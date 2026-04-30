/**
 * Sales Concierge AI — 베타 신청 페이로드.
 * 서버 저장 시 동일 형태를 API Route / Supabase / Apps Script 등에 그대로 전달하면 됩니다.
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

/**
 * 베타 신청 제출.
 *
 * 교체 예시:
 * - `await fetch("/api/beta-signup", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } })`
 * - Supabase: `await supabase.from("beta_signups").insert(payload)`
 */
export async function submitBetaSignup(payload: BetaSignupPayload): Promise<BetaSignupResult> {
  await Promise.resolve();

  try {
    if (typeof window !== "undefined") {
      // 서버 컴포넌트에서는 호출하지 마세요 (window 없음).
      console.info("[Sales Concierge AI · beta signup]", payload);
      window.alert(
        "베타 신청 폼을 제출했습니다.\n\n(데모 단계 — 아직 서버에 저장되지 않습니다.)",
      );
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
