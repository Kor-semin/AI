import type { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import type { VehicleBrandId } from "./vehicleCatalog";

export type PipelineStage = (typeof DEALER_PIPELINE_STAGES)[number];
export type LeadSource = (typeof DEALER_LEAD_SOURCES)[number];

/** 금융 상품 구분(고객 카드에서 선택) */
export type PaymentType = "현금" | "할부" | "리스" | "장기렌트";

/** 중고차 정리(연식·키로·사고 등) */
export type UsedCarAccident = "무사고" | "단순교환" | "사고" | "미상";

export type UsedCarInfo = {
  /** 중고차 조회용 브랜드(수입 포함) */
  brand?: string;
  /** 중고차 조회용 차종(검색에 쓰는 대표 명칭) */
  model?: string;
  year?: string;
  mileageKm?: string;
  accident?: UsedCarAccident;
  trim?: string;
  notes?: string;
};

/** 엔카·보배 등에서 본인이 적어 둔 시세 범위(원 단위 문자열 허용) */
export type MarketPriceSnapshot = {
  encarMin?: string;
  encarMax?: string;
  bobaeMin?: string;
  bobaeMax?: string;
  /** 기준일(예: 2026-04-29) — 자유 입력 */
  asOf?: string;
};

export type DeliveryGuideServiceItems = {
  tintBrand?: string;
  tintGrade?: string;
  blackbox?: string;
  hipass?: string;
  glassCoating?: string;
  ppf?: string;
  gifts?: string;
};

export type DeliveryGuidePricing = {
  vehiclePrice?: string;
  optionsPrice?: string;
  discount?: string;
  finalPrice?: string;
  financeCompany?: string;
  monthlyPayment?: string;
  upfrontPayment?: string;
};

export type DeliveryGuideImage = {
  id: string;
  /** 로컬 미리보기용. (주의) localStorage 용량 이슈가 있어 MVP 범위로만 사용 */
  dataUrl: string;
  caption?: string;
};

export type DeliveryGuide = {
  /** 마지막 수정 시각(ISO) */
  updatedAt: string;

  contractDate?: string; // ISO (date)
  deliveryEtaDate?: string; // ISO (date)
  modelName?: string;
  modelYear?: string;
  exteriorColor?: string;
  interiorColor?: string;
  deliveryPlace?: string;

  services?: DeliveryGuideServiceItems;
  pricing?: DeliveryGuidePricing;
  images?: DeliveryGuideImage[];
};

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
  /** 비교 중인 차량(자유 입력: 쉼표/줄바꿈 허용) */
  compareVehicles?: string;
  /** 예산·월납 가능 범위 등 */
  budget?: string;
  /** 구매 예정 시기(자유 입력: 이번달/3개월/연말 등) */
  purchaseTiming?: string;
  /** 다음 연락 예정일(ISO) — NextAction과 별개로 고객 카드에 표시용 */
  nextContactAt?: string;
  /** 트림·색상·오토옵션 등 */
  trimOrOptions?: string;
  /** 금융(현금/할부/리스) 메모 */
  paymentNotes?: string;
  /** 금융 상품 선택 */
  paymentType?: PaymentType;
  /** 중고차 매입·비교용 정리 */
  usedCar?: UsedCarInfo;
  /** 시세 메모(엔카·보배 등) */
  marketPrice?: MarketPriceSnapshot;
  /** 예산·비교차종·시세 정리 메모 */
  comparisonNotes?: string;
  /** 대차·번호 이전 등 메모 */
  tradeInNotes?: string;
  /** 마지막 상담 메모 */
  memo?: string;
  /** 고객 성향/주의사항 메모 */
  personalityMemo?: string;

  /** AI 출고 안내서(미리보기 단계). */
  deliveryGuide?: DeliveryGuide;
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
