export type BetaApprovalStatus = "pending" | "approved" | "rejected";

export type BetaApprovalApplicant = {
  id: string;
  fullName: string;
  contact: string;
  email: string;
  dealership: string;
  jobRole: string;
  usePurpose: string;
  currentCrmApproach: string;
  status: BetaApprovalStatus;
  submittedAt: string;
  source: string;
  reviewNote?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
};

export const BETA_APPROVAL_STATUSES: BetaApprovalStatus[] = ["pending", "approved", "rejected"];

export function normalizeBetaApprovalStatus(raw: unknown): BetaApprovalStatus {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "approved" || v === "승인 완료" || v === "승인") return "approved";
  if (v === "rejected" || v === "reject" || v === "반려" || v === "승인 거절" || v === "거절") return "rejected";
  return "pending";
}

export function betaApprovalStatusLabel(status: BetaApprovalStatus): string {
  if (status === "approved") return "승인 완료";
  if (status === "rejected") return "반려";
  return "승인 대기";
}

export function maskBetaApprovalPhone(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 11) return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
  if (digits.length >= 8) return `${digits.slice(0, 3)}-****-${digits.slice(-2)}`;
  return `${digits.slice(0, Math.min(3, digits.length))}-****`;
}

export function maskBetaApprovalEmail(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at <= 0 || at === value.length - 1) return value ? "***" : "—";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const prefix = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${prefix}***@${domain}`;
}

export function isSuspiciousBetaApplicant(applicant: Pick<BetaApprovalApplicant, "fullName" | "email">): boolean {
  const name = applicant.fullName.trim();
  const email = applicant.email.trim();
  return name === "." || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatBetaApprovalSubmittedAt(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
