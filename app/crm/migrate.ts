import { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import type { CRMState, Customer, LeadSource, PaymentType, PipelineStage, UsedCarAccident } from "./types";

const stageFromLegacy: Record<string, PipelineStage> = {
  신규: "신규 문의",
  상담중: "상담 완료",
  견적: "견적 발송",
  계약: "계약 검토",
  출고: "출고 대기",
  사후관리: "사후관리",
  // 기존 문자열 stage 호환
  "문의·리드": "신규 문의",
  "시승·상담": "상담 완료",
  "견적·금융": "견적 발송",
  "계약 진행": "계약 검토",
  "출고 준비": "출고 대기",
  "관계유지(AS·추천)": "사후관리",
};

const leadFromLegacy: Record<string, LeadSource> = {
  유튜브: "SNS(유튜브·인스타)",
  블로그: "홈페이지·온라인문의",
  인스타: "SNS(유튜브·인스타)",
  광고: "광고(GDN 등)",
  네이버: "네이버(플레이스·검색)",
  지인소개: "지인·소개",
};

const canonStage = new Set<string>(DEALER_PIPELINE_STAGES);
const canonLead = new Set<string>(DEALER_LEAD_SOURCES);

const canonPayment = new Set<string>(["현금", "할부", "리스", "장기렌트"]);
const canonAccident = new Set<string>(["무사고", "단순교환", "사고", "미상"]);

function migrateStage(raw: string): PipelineStage {
  const fromLegacy = stageFromLegacy[raw];
  if (fromLegacy) return fromLegacy;
  if (canonStage.has(raw)) return raw as PipelineStage;
  return "신규 문의";
}

function migrateLead(raw: string): LeadSource {
  const fromLegacy = leadFromLegacy[raw];
  if (fromLegacy) return fromLegacy;
  if (canonLead.has(raw)) return raw as LeadSource;
  return "기타";
}

function migrateCustomer(c: Customer): Customer {
  let usedCar = c.usedCar;
  if (usedCar?.accident) {
    const a = String(usedCar.accident);
    const accident: UsedCarAccident | undefined = canonAccident.has(a)
      ? (a as UsedCarAccident)
      : "미상";
    usedCar = { ...usedCar, accident };
  }
  if (usedCar?.brand && String(usedCar.brand).trim() === "폭스바겠") {
    usedCar = { ...usedCar, brand: "폭스바겐" };
  }

  let estimateAttachments = c.estimateAttachments;
  if (c.quoteEstimateAttachment && (!estimateAttachments || estimateAttachments.length === 0)) {
    const q = c.quoteEstimateAttachment;
    estimateAttachments = [
      {
        id: `legacy_${q.uploadedAt.replace(/[:.]/g, "-")}`,
        fileName: q.fileName,
        contentType: q.mimeType,
        size: 0,
        createdAt: q.uploadedAt,
      },
    ];
  }

  const next: Customer = {
    ...c,
    stage: migrateStage(String(c.stage)),
    leadSource: migrateLead(String(c.leadSource)),
    usedCar,
    ...(String(c.vehicleBrand ?? "") === "폭스바겠" ? { vehicleBrand: "폭스바겐" } : {}),
    ...(estimateAttachments ? { estimateAttachments } : {}),
  };
  delete next.paymentType;
  if (typeof c.paymentType === "string" && canonPayment.has(c.paymentType)) {
    next.paymentType = c.paymentType as PaymentType;
  }
  return next;
}

export function migrateCRMState(state: CRMState): CRMState {
  return {
    ...state,
    customers: state.customers.map(migrateCustomer),
  };
}
