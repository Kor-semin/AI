import type { ActivityLog } from "./activity-log";
import type { Branch, DealerGroup, SensoraConsultation, SensoraCustomer, SensoraLead, Team } from "./domain";
import type { SensoraFollowUp } from "./followups";
import type { InventoryUnit } from "./inventory";
import {
  getAvailableWorkspacesForRole,
  getDefaultScopeTypeForRole,
  getDefaultWorkspaceForRole,
  type SensoraUserProfile,
} from "./roles";

const now = "2026-06-22T00:00:00.000Z";

export type SensoraB2BSeedData = {
  dealerGroups: DealerGroup[];
  branches: Branch[];
  teams: Team[];
  users: SensoraUserProfile[];
  leads: SensoraLead[];
  customers: SensoraCustomer[];
  consultations: SensoraConsultation[];
  followUps: SensoraFollowUp[];
  inventoryUnits: InventoryUnit[];
  activityLogs: ActivityLog[];
};

function makeProfile(
  profile: Omit<SensoraUserProfile, "defaultWorkspace" | "availableWorkspaces" | "scopeType" | "createdAt" | "updatedAt">,
): SensoraUserProfile {
  return {
    ...profile,
    scopeType: getDefaultScopeTypeForRole(profile.role),
    defaultWorkspace: getDefaultWorkspaceForRole(profile.role),
    availableWorkspaces: getAvailableWorkspacesForRole(profile.role),
    createdAt: now,
    updatedAt: now,
  };
}

export const sensoraB2BSeedData: SensoraB2BSeedData = {
  dealerGroups: [
    {
      id: "dealer_group_demo",
      name: "데모 딜러 그룹",
      status: "trial",
      createdAt: now,
      updatedAt: now,
    },
  ],
  branches: [
    {
      id: "branch_gangnam",
      dealerGroupId: "dealer_group_demo",
      name: "강남 전시장",
      location: "서울 강남",
      status: "trial",
      createdAt: now,
      updatedAt: now,
    },
  ],
  teams: [
    {
      id: "team_a",
      branchId: "branch_gangnam",
      name: "A팀",
      teamLeaderId: "user_team_leader",
      status: "trial",
      createdAt: now,
      updatedAt: now,
    },
  ],
  users: [
    makeProfile({
      id: "user_sales",
      name: "김세일",
      email: "sales@example.com",
      role: "sales_consultant",
      dealerGroupId: "dealer_group_demo",
      branchId: "branch_gangnam",
      teamId: "team_a",
      scopeId: "user_sales",
    }),
    makeProfile({
      id: "user_team_leader",
      name: "박팀장",
      email: "leader@example.com",
      role: "team_leader",
      dealerGroupId: "dealer_group_demo",
      branchId: "branch_gangnam",
      teamId: "team_a",
      scopeId: "team_a",
    }),
    makeProfile({
      id: "user_branch_manager",
      name: "이지점",
      email: "manager@example.com",
      role: "branch_manager",
      dealerGroupId: "dealer_group_demo",
      branchId: "branch_gangnam",
      scopeId: "branch_gangnam",
    }),
  ],
  leads: [
    {
      id: "lead_demo_1",
      source: "showroom_call",
      receivedAt: now,
      receivedBy: "user_team_leader",
      assignedUserId: "user_sales",
      assignedBy: "user_team_leader",
      assignedAt: now,
      customerName: "최민준",
      phone: "010-0000-0000",
      interestedVehicle: "중형 SUV",
      status: "assigned",
      memo: "전시장 전화 문의. 주말 시승 가능 여부 확인 필요.",
      branchId: "branch_gangnam",
      teamId: "team_a",
      createdAt: now,
      updatedAt: now,
    },
  ],
  customers: [
    {
      id: "customer_demo_1",
      name: "정서윤",
      phone: "010-1111-1111",
      interestedVehicle: "전기 SUV",
      status: "consulting",
      assignedUserId: "user_sales",
      branchId: "branch_gangnam",
      teamId: "team_a",
      nextFollowUpAt: "2026-06-23T01:00:00.000Z",
      probability: 45,
      createdAt: now,
      updatedAt: now,
    },
  ],
  consultations: [
    {
      id: "consultation_demo_1",
      customerId: "customer_demo_1",
      userId: "user_sales",
      branchId: "branch_gangnam",
      teamId: "team_a",
      memo: "전기차 보조금, 충전 환경, 즉시 출고 가능 여부를 확인함.",
      aiSummary: "고객은 전기 SUV와 출고 가능 시점을 우선 확인하고 있음.",
      customerNeeds: ["전기 SUV", "출고 일정", "충전 환경"],
      suggestedMessage: "검토용 초안입니다. 출고 가능 재고 확인 후 안내드리겠습니다.",
      nextAction: "재고 확인 후 고객에게 직접 연락",
      createdAt: now,
      updatedAt: now,
    },
  ],
  followUps: [
    {
      id: "followup_demo_1",
      customerId: "customer_demo_1",
      userId: "user_sales",
      branchId: "branch_gangnam",
      teamId: "team_a",
      dueDate: "2026-06-23T01:00:00.000Z",
      status: "scheduled",
      purpose: "전기 SUV 재고 확인 결과 안내",
      memo: "저장 성공 후에만 완료 처리해야 함.",
      createdAt: now,
      updatedAt: now,
    },
  ],
  inventoryUnits: [
    {
      id: "inventory_demo_1",
      branchId: "branch_gangnam",
      brand: "현대",
      model: "아이오닉 5",
      trim: "롱레인지",
      exteriorColor: "화이트",
      interiorColor: "그레이",
      optionSummary: "컴포트 패키지",
      vin: "DEMO-VIN-0001",
      stockStatus: "available",
      integrationStatus: "integration_planned",
      updatedBy: "user_branch_manager",
      updatedAt: now,
      memo: "향후 DMS/ERP 연동 가능성을 표시만 하는 데모 데이터.",
    },
  ],
  activityLogs: [
    {
      id: "activity_demo_1",
      actorUserId: "user_team_leader",
      action: "lead_assigned",
      targetType: "lead",
      targetId: "lead_demo_1",
      before: { assignedUserId: undefined },
      after: { assignedUserId: "user_sales" },
      branchId: "branch_gangnam",
      teamId: "team_a",
      createdAt: now,
    },
  ],
};
