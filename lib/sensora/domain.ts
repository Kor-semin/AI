export type SensoraTimestamp = string;

export const SENSORA_ORGANIZATION_STATUSES = [
  "active",
  "inactive",
  "trial",
  "suspended",
] as const;

export type SensoraOrganizationStatus = (typeof SENSORA_ORGANIZATION_STATUSES)[number];

export type DealerGroup = {
  id: string;
  name: string;
  status: SensoraOrganizationStatus;
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};

export type Branch = {
  id: string;
  dealerGroupId: string;
  name: string;
  location?: string;
  status: SensoraOrganizationStatus;
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};

export type Team = {
  id: string;
  branchId: string;
  name: string;
  teamLeaderId?: string;
  status: SensoraOrganizationStatus;
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};

export const LEAD_SOURCES = [
  "showroom_call",
  "walk_in",
  "online_inquiry",
  "referral",
  "test_drive_request",
  "event",
  "unknown",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "new",
  "unassigned",
  "assigned",
  "contact_needed",
  "contacted",
  "in_consultation",
  "converted",
  "lost",
  "duplicate",
  "invalid",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type SensoraLead = {
  id: string;
  source: LeadSource;
  receivedAt: SensoraTimestamp;
  receivedBy?: string;
  assignedUserId?: string;
  assignedBy?: string;
  assignedAt?: SensoraTimestamp;
  customerName: string;
  phone?: string;
  interestedVehicle?: string;
  status: LeadStatus;
  convertedCustomerId?: string;
  memo?: string;
  branchId: string;
  teamId?: string;
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};

export const CUSTOMER_STATUSES = [
  "new",
  "contacted",
  "consulting",
  "quote_sent",
  "test_drive_scheduled",
  "contract_likely",
  "contracted",
  "delivered",
  "lost",
  "inactive",
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export type SensoraCustomer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  interestedVehicle?: string;
  status: CustomerStatus;
  assignedUserId: string;
  branchId: string;
  teamId?: string;
  sourceLeadId?: string;
  nextFollowUpAt?: SensoraTimestamp;
  probability?: number;
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};

export type SensoraConsultation = {
  id: string;
  customerId: string;
  userId: string;
  branchId: string;
  teamId?: string;
  memo: string;
  aiSummary?: string;
  customerNeeds?: string[];
  suggestedMessage?: string;
  nextAction?: string;
  createdAt: SensoraTimestamp;
  updatedAt: SensoraTimestamp;
};
