import type { SensoraTimestamp } from "./domain";

export const USER_ROLES = [
  "sales_consultant",
  "team_leader",
  "branch_manager",
  "executive",
  "sensora_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SCOPE_TYPES = [
  "user",
  "team",
  "branch",
  "dealer_group",
  "global",
  "multi_branch",
] as const;

export type ScopeType = (typeof SCOPE_TYPES)[number];

export const WORKSPACES = ["sales", "manager", "console"] as const;

export type Workspace = (typeof WORKSPACES)[number];

export type SensoraUserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dealerGroupId?: string;
  branchId?: string;
  branchIds?: string[];
  teamId?: string;
  scopeType: ScopeType;
  scopeId?: string;
  defaultWorkspace: Workspace;
  availableWorkspaces: Workspace[];
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};

const DEFAULT_WORKSPACE_BY_ROLE: Record<UserRole, Workspace> = {
  sales_consultant: "sales",
  team_leader: "sales",
  branch_manager: "manager",
  executive: "manager",
  sensora_admin: "console",
};

const AVAILABLE_WORKSPACES_BY_ROLE: Record<UserRole, Workspace[]> = {
  sales_consultant: ["sales"],
  team_leader: ["sales"],
  branch_manager: ["manager"],
  executive: ["manager"],
  sensora_admin: ["console", "manager", "sales"],
};

const DEFAULT_SCOPE_BY_ROLE: Record<UserRole, ScopeType> = {
  sales_consultant: "user",
  team_leader: "team",
  branch_manager: "branch",
  executive: "dealer_group",
  sensora_admin: "global",
};

export function getDefaultWorkspaceForRole(role: UserRole): Workspace {
  return DEFAULT_WORKSPACE_BY_ROLE[role];
}

export function getAvailableWorkspacesForRole(role: UserRole): Workspace[] {
  return [...AVAILABLE_WORKSPACES_BY_ROLE[role]];
}

export function getDefaultScopeTypeForRole(role: UserRole): ScopeType {
  return DEFAULT_SCOPE_BY_ROLE[role];
}

export function canAccessSalesWorkspace(profile: Pick<SensoraUserProfile, "availableWorkspaces">): boolean {
  return profile.availableWorkspaces.includes("sales");
}

export function canAccessManagerWorkspace(profile: Pick<SensoraUserProfile, "availableWorkspaces">): boolean {
  return profile.availableWorkspaces.includes("manager");
}

export function canAccessConsoleWorkspace(profile: Pick<SensoraUserProfile, "availableWorkspaces">): boolean {
  return profile.availableWorkspaces.includes("console");
}

export function canViewTeamData(
  profile: Pick<
    SensoraUserProfile,
    "role" | "scopeType" | "scopeId" | "teamId" | "branchId" | "branchIds" | "dealerGroupId"
  >,
  target: string | { teamId: string; branchId?: string; dealerGroupId?: string },
): boolean {
  const teamId = typeof target === "string" ? target : target.teamId;
  const branchId = typeof target === "string" ? undefined : target.branchId;
  const dealerGroupId = typeof target === "string" ? undefined : target.dealerGroupId;

  if (profile.role === "sensora_admin" || profile.scopeType === "global") {
    return true;
  }

  if (profile.scopeType === "team") {
    return profile.scopeId === teamId || profile.teamId === teamId;
  }

  if (profile.scopeType === "branch") {
    return Boolean(branchId && (profile.scopeId === branchId || profile.branchId === branchId));
  }

  if (profile.scopeType === "multi_branch") {
    return Boolean(branchId && profile.branchIds?.includes(branchId));
  }

  if (profile.scopeType === "dealer_group") {
    return Boolean(dealerGroupId && (profile.scopeId === dealerGroupId || profile.dealerGroupId === dealerGroupId));
  }

  return false;
}

export function canViewBranchData(
  profile: Pick<SensoraUserProfile, "role" | "scopeType" | "scopeId" | "branchId" | "branchIds" | "dealerGroupId">,
  target: string | { branchId: string; dealerGroupId?: string },
): boolean {
  const branchId = typeof target === "string" ? target : target.branchId;
  const dealerGroupId = typeof target === "string" ? undefined : target.dealerGroupId;

  if (profile.role === "sensora_admin" || profile.scopeType === "global") {
    return true;
  }

  if (profile.scopeType === "branch") {
    return profile.scopeId === branchId || profile.branchId === branchId;
  }

  if (profile.scopeType === "multi_branch") {
    return profile.branchIds?.includes(branchId) ?? false;
  }

  if (profile.scopeType === "dealer_group") {
    return Boolean(dealerGroupId && (profile.scopeId === dealerGroupId || profile.dealerGroupId === dealerGroupId));
  }

  return false;
}

export function canViewDealerGroupData(
  profile: Pick<SensoraUserProfile, "role" | "scopeType" | "scopeId" | "dealerGroupId">,
  dealerGroupId: string,
): boolean {
  if (profile.role === "sensora_admin" || profile.scopeType === "global") {
    return true;
  }

  if (profile.scopeType === "dealer_group") {
    return profile.scopeId === dealerGroupId || profile.dealerGroupId === dealerGroupId;
  }

  return false;
}
