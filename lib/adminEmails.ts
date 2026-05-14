/** 서버 로그용 마스킹(전체 이메일·allowlist 내용 노출 금지). */
export function maskEmailForServerLog(raw: string | null | undefined): string {
  const s = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!s) return "—";
  const at = s.lastIndexOf("@");
  if (at <= 0 || at === s.length - 1) return "***";
  const local = s.slice(0, at);
  const domain = s.slice(at + 1);
  if (!local.length) return `***@${domain}`;
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

let loggedAdminEmailsEmpty = false;

/** Vercel/로컬에서 흔한 전체 값 따옴표 한 겹 제거. */
function normalizeAdminEmailsEnvRaw(raw: string | undefined): string {
  if (typeof raw !== "string") return "";
  let s = raw.trim();
  if (s.length >= 2) {
    const q0 = s[0];
    const q1 = s[s.length - 1];
    if ((q0 === '"' && q1 === '"') || (q0 === "'" && q1 === "'")) {
      s = s.slice(1, -1).trim();
    }
  }
  return s;
}

/** ADMIN_EMAILS 환경변수 파싱(쉼표·세미콜론·줄바꿈 구분, trim, toLowerCase). 서버 전용. */
export function parseAdminEmailsFromEnv(raw: string | undefined): Set<string> {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return new Set();
  const parts = s
    .split(/[,;\n\r]+/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  return new Set(parts);
}

export function getAdminEmailSet(): Set<string> {
  const normalized = normalizeAdminEmailsEnvRaw(process.env.ADMIN_EMAILS);
  const set = parseAdminEmailsFromEnv(normalized);
  if (set.size === 0 && !loggedAdminEmailsEmpty) {
    loggedAdminEmailsEmpty = true;
    console.error("[adminEmails] ADMIN_EMAILS empty");
  }
  return set;
}

export function isAdminEmail(email: string | null | undefined, admins: Set<string>): boolean {
  if (!email || admins.size === 0) return false;
  return admins.has(email.trim().toLowerCase());
}

/** 403 직전 서버 진단용(민감 목록 미노출, 사용자 이메일은 마스킹). */
export function logBetaOpsAdminDenied(userEmail: string | null | undefined, allowlistSize: number): void {
  console.error("[adminEmails] beta ops denied", {
    maskedEmail: maskEmailForServerLog(userEmail ?? ""),
    allowlistSize,
  });
}
