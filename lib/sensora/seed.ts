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
      name: "오세민",
      email: "sales@example.com",
      role: "sales_consultant",
      dealerGroupId: "dealer_group_demo",
      branchId: "branch_gangnam",
      teamId: "team_a",
      scopeId: "user_sales",
    }),
    makeProfile({
      id: "user_team_leader",
      name: "한지훈",
      email: "leader@example.com",
      role: "team_leader",
      dealerGroupId: "dealer_group_demo",
      branchId: "branch_gangnam",
      teamId: "team_a",
      scopeId: "team_a",
    }),
    makeProfile({
      id: "user_branch_manager",
      name: "윤도현",
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
      customerName: "최유진",
      phone: "010-0000-0000",
      interestedVehicle: "GLC 300 4MATIC",
      status: "assigned",
      memo: "월 납입금과 출고 가능 색상 확인 요청. 배우자와 상의 후 재연락 예정.",
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
      interestedVehicle: "Audi A6 45 TFSI Premium",
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
      memo: "A6 45 TFSI Premium 견적과 프로모션 조건을 비교함. 외장색은 글레이셔 화이트와 블랙 중 고민 중.",
      aiSummary: "고객은 월 납입금, 프로모션 조건, 출고 가능 색상을 우선 확인하고 있음.",
      customerNeeds: ["월 납입금", "프로모션 조건", "출고 가능 색상"],
      suggestedMessage: "검토용 초안입니다. 출고 가능 재고 확인 후 안내드리겠습니다.",
      nextAction: "재고와 금융 조건 확인 후 고객에게 직접 연락",
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
      purpose: "A6 출고 가능 색상과 금융 조건 안내",
      memo: "저장 성공 후에만 완료 처리해야 함.",
      createdAt: now,
      updatedAt: now,
    },
  ],
  inventoryUnits: [
    {
      id: "inventory_demo_1",
      branchId: "branch_gangnam",
      brand: "Mercedes-Benz",
      model: "GLC 300 4MATIC",
      trim: "Premium",
      exteriorColor: "옵시디언 블랙",
      interiorColor: "마키아토 베이지",
      optionSummary: "AMG Line, 파노라마 선루프, 드라이빙 어시스턴스",
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
