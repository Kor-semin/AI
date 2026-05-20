/** 베타 고객센터 문의 이메일(공식 주소 확정 전 임시 표기) */
export const SUPPORT_EMAIL = "support@sensora.kr";

export function buildSupportMailto(subject: string, body?: string): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (body?.trim()) params.set("body", body);
  const q = params.toString();
  return `mailto:${SUPPORT_EMAIL}${q ? `?${q}` : ""}`;
}
