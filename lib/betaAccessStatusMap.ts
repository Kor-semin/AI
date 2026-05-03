/**
 * Maps Google Sheet / Apps Script `status` to API clients’ canonical codes.
 * Sheet 운영 값: 승인 대기 · 승인 완료 · 승인 거절 (+ 빈 칸 시 not_found 처리는 upstream 권장).
 * 레거시 영문 값(pending 등) 호환 유지.
 */
export type CanonicalBetaAccessClientStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "not_found";

export function mapUpstreamBetaStatusToCanonical(
  statusRaw: unknown,
): CanonicalBetaAccessClientStatus | "error_parse" {
  if (statusRaw === undefined || statusRaw === null) {
    return "not_found";
  }
  if (typeof statusRaw !== "string") {
    return "error_parse";
  }
  const s = statusRaw.trim();
  if (!s) {
    return "not_found";
  }

  const lower = s.toLowerCase();
  if (lower === "not_found") {
    return "not_found";
  }
  if (lower === "approved" || s === "승인 완료") {
    return "approved";
  }
  if (lower === "pending" || s === "승인 대기") {
    return "pending";
  }
  if (lower === "rejected" || s === "승인 거절") {
    return "rejected";
  }

  return "error_parse";
}
