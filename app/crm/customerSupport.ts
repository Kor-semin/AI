export const SUPPORT_EMAIL = "semin9602@naver.com";

export const SUPPORT_PHONE_DISPLAY = "010-5353-0486";

export const SUPPORT_PHONE_TEL = "tel:+821053530486";

export function buildSupportMailto(subject: string, body?: string): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (body?.trim()) params.set("body", body);
  const q = params.toString();
  return `mailto:${SUPPORT_EMAIL}${q ? `?${q}` : ""}`;
}
