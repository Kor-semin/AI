import type { SensoraTimestamp } from "./domain";

export const FOLLOWUP_STATUSES = [
  "scheduled",
  "due_today",
  "overdue",
  "completed",
  "cancelled",
  "rescheduled",
] as const;

export type FollowUpStatus = (typeof FOLLOWUP_STATUSES)[number];

export type SensoraFollowUp = {
  id: string;
  customerId: string;
  userId: string;
  branchId: string;
  teamId?: string;
  dueDate: SensoraTimestamp;
  status: FollowUpStatus;
  purpose: string;
  memo?: string;
  completedAt?: SensoraTimestamp;
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};

export type FollowUpDisplayStatus = "completed" | "cancelled" | "overdue" | "due_today" | "scheduled";
export type FollowUpPriorityLabel = "완료" | "취소" | "오늘 예정" | "지연" | "예정";

function toLocalDateStart(value: Date | SensoraTimestamp): Date {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isClosedFollowUp(status: FollowUpStatus): boolean {
  return status === "completed" || status === "cancelled";
}

export function isFollowUpDueToday(
  followUp: Pick<SensoraFollowUp, "dueDate" | "status">,
  today: Date = new Date(),
): boolean {
  if (isClosedFollowUp(followUp.status)) {
    return false;
  }

  return toLocalDateStart(followUp.dueDate).getTime() === toLocalDateStart(today).getTime();
}

export function isFollowUpOverdue(
  followUp: Pick<SensoraFollowUp, "dueDate" | "status">,
  today: Date = new Date(),
): boolean {
  if (isClosedFollowUp(followUp.status)) {
    return false;
  }

  return toLocalDateStart(followUp.dueDate).getTime() < toLocalDateStart(today).getTime();
}

export function getFollowUpDelayDays(
  followUp: Pick<SensoraFollowUp, "dueDate" | "status">,
  today: Date = new Date(),
): number {
  if (!isFollowUpOverdue(followUp, today)) {
    return 0;
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffMs = toLocalDateStart(today).getTime() - toLocalDateStart(followUp.dueDate).getTime();
  return Math.floor(diffMs / oneDayMs);
}

export function getFollowUpDisplayStatus(
  followUp: Pick<SensoraFollowUp, "dueDate" | "status">,
  today: Date = new Date(),
): FollowUpDisplayStatus {
  if (followUp.status === "completed") {
    return "completed";
  }

  if (followUp.status === "cancelled") {
    return "cancelled";
  }

  if (isFollowUpOverdue(followUp, today)) {
    return "overdue";
  }

  if (isFollowUpDueToday(followUp, today)) {
    return "due_today";
  }

  return "scheduled";
}

export function getFollowUpPriorityLabel(
  followUp: Pick<SensoraFollowUp, "dueDate" | "status">,
  today: Date = new Date(),
): FollowUpPriorityLabel {
  const displayStatus = getFollowUpDisplayStatus(followUp, today);

  if (displayStatus === "completed") {
    return "완료";
  }

  if (displayStatus === "cancelled") {
    return "취소";
  }

  if (displayStatus === "due_today") {
    return "오늘 예정";
  }

  if (displayStatus === "overdue") {
    return "지연";
  }

  return "예정";
}
