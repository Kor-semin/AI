/** ADMIN_EMAILS 환경변수 파싱(쉼표·세미콜론 구분, 소문자 정규화). 서버 전용. */
export function parseAdminEmailsFromEnv(raw: string | undefined): Set<string> {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return new Set();
  const parts = s.split(/[,;]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
  return new Set(parts);
}

export function getAdminEmailSet(): Set<string> {
  return parseAdminEmailsFromEnv(process.env.ADMIN_EMAILS);
}

export function isAdminEmail(email: string | null | undefined, admins: Set<string>): boolean {
  if (!email || admins.size === 0) return false;
  return admins.has(email.trim().toLowerCase());
}
