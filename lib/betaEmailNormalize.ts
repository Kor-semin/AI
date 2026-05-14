/** 베타 신청·승인 조회에서 이메일을 동일하게 맞추기 위한 정규화(서버/클라이언트 공용). */
export function normalizeEmailForBetaAccess(email: string): string {
  return email.trim().toLowerCase();
}
