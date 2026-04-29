import type { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import type { VehicleBrandId } from "./vehicleCatalog";

export type PipelineStage = (typeof DEALER_PIPELINE_STAGES)[number];
export type LeadSource = (typeof DEALER_LEAD_SOURCES)[number];

export type Customer = {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO

  name: string;
  phone?: string;
  email?: string;

  leadSource: LeadSource;
  stage: PipelineStage;

  /** 브랜드(예: 현대 · 기아) — 선택 후 차종 목록과 연결 */
  vehicleBrand?: VehicleBrandId;
  /** 관심 모델/차종(브랜드별 목록 선택 또는 기타 브랜드 시 자유 입력) */
  interestedModel?: string;
  /** 예산·월납 가능 범위 등 */
  budget?: string;
  /** 트림·색상·오토옵션 등 */
  trimOrOptions?: string;
  /** 금융(현금/할부/리스) 메모 */
  paymentNotes?: string;
  /** 대차·번호 이전 등 메모 */
  tradeInNotes?: string;
  memo?: string;
};

export type NextAction = {
  id: string;
  customerId: string;
  createdAt: string; // ISO
  dueAt?: string; // ISO
  title: string;
  doneAt?: string; // ISO
};

export type CalendarEvent = {
  id: string;
  customerId?: string;
  startAt: string; // ISO
  endAt?: string; // ISO
  title: string;
  notes?: string;
};

export type MessageTemplate = {
  id: string;
  title: string;
  body: string;
  updatedAt: string; // ISO
};

export type CRMState = {
  version: 1;
  customers: Customer[];
  nextActions: NextAction[];
  events: CalendarEvent[];
  templates: MessageTemplate[];
};

export type SyncMode = "local" | "cloud";

export type SyncStatus =
  | { mode: SyncMode; status: "idle" }
  | { mode: SyncMode; status: "syncing" }
  | { mode: SyncMode; status: "error"; message: string };
