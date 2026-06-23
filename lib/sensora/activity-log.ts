import type { SensoraTimestamp } from "./domain";

export const ACTIVITY_ACTIONS = [
  "lead_created",
  "lead_assigned",
  "lead_converted_to_customer",
  "consultation_created",
  "followup_created",
  "followup_completed",
  "followup_rescheduled",
  "inventory_status_changed",
  "user_role_changed",
] as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ACTIVITY_TARGET_TYPES = [
  "lead",
  "customer",
  "consultation",
  "followup",
  "inventory_unit",
  "user",
  "team",
  "branch",
  "dealer_group",
] as const;

export type ActivityTargetType = (typeof ACTIVITY_TARGET_TYPES)[number];

export type ActivityLogChangeSet = Record<string, unknown>;

export type ActivityLog = {
  id: string;
  workspaceId?: string;
  actorUserId: string;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  leadId?: string;
  customerId?: string;
  before?: ActivityLogChangeSet;
  after?: ActivityLogChangeSet;
  branchId?: string;
  teamId?: string;
  createdAt: SensoraTimestamp;
};
