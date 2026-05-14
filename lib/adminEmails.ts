/** 서버 로그·진단 API 응답용 마스킹(전체 이메일·allowlist 내용 노출 금지). */
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

/** `ADMIN_EMAILS` 원문이 비어 있지 않은지(공백만 제외). 파싱 성공 여부와 무관. */
export function hasAdminEmailsEnv(): boolean {
  const raw = process.env.ADMIN_EMAILS;
  return typeof raw === "string" && raw.trim().length > 0;
}

/** 항목 단위로 감싼 따옴표 제거(`"a@b.com"` 등). */
function stripQuotedEmailEntry(part: string): string {
  let p = part.trim();
  for (let i = 0; i < 5; i++) {
    if (p.length < 2) break;
    const a = p[0];
    const b = p[p.length - 1];
    if ((a === '"' && b === '"') || (a === "'" && b === "'")) {
      p = p.slice(1, -1).trim();
    } else {
      break;
    }
  }
  return p;
}

/** 전체 env 값 바깥쪽 따옴표를 여러 겹까지 제거. */
function normalizeAdminEmailsEnvRaw(raw: string | undefined): string {
  if (typeof raw !== "string") return "";
  let s = raw.trim();
  for (let i = 0; i < 5; i++) {
    if (s.length < 2) break;
    const q0 = s[0];
    const q1 = s[s.length - 1];
    if ((q0 === '"' && q1 === '"') || (q0 === "'" && q1 === "'")) {
      s = s.slice(1, -1).trim();
    } else {
      break;
    }
  }
  return s;
}

/**
 * ADMIN_EMAILS 환경변수 파싱.
 * - 쉼표, 세미콜론, 줄바꿈으로 분리
 * - 각 항목 trim + toLowerCase + 빈 값 제거
 * - 항목별 바깥 따옴표 1겹 이상 제거
 */
export function parseAdminEmailsFromEnv(raw: string | undefined): Set<string> {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return new Set();
  const parts = s
    .split(/[,;\n\r]+/)
    .map((p) => stripQuotedEmailEntry(p))
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

/** 403 직전 서버 진단용(민감 목록·원문 미노출). */
export function logBetaOpsAdminDenied(
  userEmail: string | null | undefined,
  allowlistSize: number,
  hasAdminEmailsEnvValue: boolean,
): void {
  console.error("[adminEmails] beta ops denied", {
    maskedEmail: maskEmailForServerLog(userEmail ?? ""),
    allowlistSize,
    hasAdminEmailsEnv: hasAdminEmailsEnvValue,
  });
}
