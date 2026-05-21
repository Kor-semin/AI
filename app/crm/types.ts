import type { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import type { VehicleBrandId } from "./vehicleCatalog";

export type PipelineStage = (typeof DEALER_PIPELINE_STAGES)[number];
export type LeadSource = (typeof DEALER_LEAD_SOURCES)[number];

/** 금융 상품 구분(고객 카드에서 선택) */
export type PaymentType = "현금" | "할부" | "리스" | "장기렌트";

/** 신차 견적·금융 조건 정리(영업사원 입력, 검토용 문자 초안에 반영) */
export type FinanceProductMode = "리스" | "할부" | "현금" | "장기렌트" | "알 수 없음";

/** @deprecated 하위 호환: 단일 견적 메타. estimateAttachments 로 이전 권장 */
export type QuoteEstimateAttachmentMeta = {
  fileName: string;
  mimeType: string;
  uploadedAt: string;
};

/** 고객별 견적서 보관함 항목(원본은 Firebase Storage, Firestore에는 메타만) */
export type CustomerEstimateAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  storagePath?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt?: string;
};

export type FinanceConditionDraft = {
  productMode: FinanceProductMode;
  vehicleName?: string;
  vehicleTrim?: string;
  totalVehiclePrice?: string;
  promotionOrDiscount?: string;
  downPayment?: string;
  deposit?: string;
  contractMonths?: string;
  residualValue?: string;
  monthlyPayment?: string;
  maturityOptions?: string;
  /** 할부 금리(예: 4.9%) */
  interestRate?: string;
  /** 장기렌트 약정거리 */
  agreedDistance?: string;
  /** 장기렌트 보험 포함 여부 */
  insuranceIncluded?: string;
  /** 현금 구매 출고 가능 여부 */
  deliveryAvailability?: string;
  /** 현금 등록·부대비용 메모 */
  registrationFeesNote?: string;
  /** 고객이 중요하게 본 조건 등 자유 메모 */
  customerConditionNote?: string;
};

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

/** 대차·매입 견적 비교(원/만원 문자열 허용 — encar* 필드명은 기존 데이터 호환) */
export type MarketPriceSnapshot = {
  /** 최저 매입가 */
  encarMin?: string;
  /** 최고 매입가 */
  encarMax?: string;
  bobaeMin?: string;
  bobaeMax?: string;
  /** 견적 기준일(예: 2026-05-21) */
  asOf?: string;
  /** 견적처 메모(예: A상사 4,000 / B상사 4,180) */
  quoteSources?: string;
  /** 최종 안내가(예: 4,200만 원 전후) */
  guidePrice?: string;
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

  /** 입금 계좌 — 기본 빈값, 사용자 입력 */
  deliveryBankName?: string;
  deliveryAccountNumber?: string;
  deliveryAccountHolder?: string;
  deliveryPaymentNote?: string;

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
  /** 대차·매입 견적 비교 메모 */
  marketPrice?: MarketPriceSnapshot;
  /** 예산·비교차종 정리 메모 */
  comparisonNotes?: string;
  /** 대차·번호 이전 등 메모 */
  tradeInNotes?: string;
  /** 마지막 상담 메모 */
  memo?: string;
  /** 고객 성향/주의사항 메모 */
  personalityMemo?: string;

  /** AI 출고 안내서(미리보기 단계). */
  deliveryGuide?: DeliveryGuide;

  /** @deprecated estimateAttachments 사용 권장 */
  quoteEstimateAttachment?: QuoteEstimateAttachmentMeta | null;
  /** 고객별 견적서 보관함(Storage 경로·다운로드 URL 메타) */
  estimateAttachments?: CustomerEstimateAttachment[];
  /** 신차 견적·금융 조건 정리(검토용 문자 초안에 사용) */
  financeConditionDraft?: FinanceConditionDraft;
  /** 고객 니즈(다중 선택, 한글 라벨 그대로 저장) */
  customerPriorityNeeds?: string[];
  /** 문자 초안(금융)에 견적서 첨부 안내 문구 포함 */
  smsDraftIncludeEstimateWording?: boolean;
  /** 첨부 안내에 쓸 견적서. null/미설정=가장 최근, "__none__"=특정 파일 없음 */
  smsDraftEstimateAttachmentId?: string | null;
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
