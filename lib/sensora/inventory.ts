import type { SensoraTimestamp } from "./domain";

export const INVENTORY_STATUSES = [
  "available",
  "reserved",
  "contracted",
  "in_transit",
  "display",
  "demo",
  "sold",
  "unavailable",
] as const;

export type InventoryStatus = (typeof INVENTORY_STATUSES)[number];
export type InventoryIntegrationStatus = "manual" | "csv_ready" | "integration_planned";
export type InventoryStatusTone = "positive" | "notice" | "neutral" | "warning" | "muted";

export type InventoryUnit = {
  id: string;
  branchId: string;
  brand: string;
  model: string;
  trim?: string;
  exteriorColor?: string;
  interiorColor?: string;
  optionSummary?: string;
  vin?: string;
  stockStatus: InventoryStatus;
  integrationStatus?: InventoryIntegrationStatus;
  updatedBy: string;
  updatedAt: SensoraTimestamp;
  memo?: string;
};

const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  available: "예약 가능",
  reserved: "예약 중",
  contracted: "계약 진행",
  in_transit: "입고 예정",
  display: "전시 차량",
  demo: "시승 차량",
  sold: "판매 완료",
  unavailable: "사용 불가",
};

const INVENTORY_STATUS_TONES: Record<InventoryStatus, InventoryStatusTone> = {
  available: "positive",
  reserved: "notice",
  contracted: "notice",
  in_transit: "neutral",
  display: "neutral",
  demo: "neutral",
  sold: "muted",
  unavailable: "warning",
};

export function getInventoryStatusLabel(status: InventoryStatus): string {
  return INVENTORY_STATUS_LABELS[status];
}

export function getInventoryStatusTone(status: InventoryStatus): InventoryStatusTone {
  return INVENTORY_STATUS_TONES[status];
}

export function canReserveInventoryUnit(
  unit: Pick<InventoryUnit, "stockStatus">,
): boolean {
  return unit.stockStatus === "available" || unit.stockStatus === "display" || unit.stockStatus === "demo";
}

export function canMarkInventoryAsSold(
  unit: Pick<InventoryUnit, "stockStatus">,
): boolean {
  return unit.stockStatus === "reserved" || unit.stockStatus === "contracted";
}
