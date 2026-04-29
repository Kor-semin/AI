import { DEALER_LEAD_SOURCES, DEALER_PIPELINE_STAGES } from "./constants";
import type { CRMState, Customer, LeadSource, PipelineStage } from "./types";

const stageFromLegacy: Record<string, PipelineStage> = {
  신규: "문의·리드",
  상담중: "시승·상담",
  견적: "견적·금융",
  계약: "계약 진행",
  출고: "출고 준비",
  사후관리: "관계유지(AS·추천)",
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

function migrateStage(raw: string): PipelineStage {
  const fromLegacy = stageFromLegacy[raw];
  if (fromLegacy) return fromLegacy;
  if (canonStage.has(raw)) return raw as PipelineStage;
  return "문의·리드";
}

function migrateLead(raw: string): LeadSource {
  const fromLegacy = leadFromLegacy[raw];
  if (fromLegacy) return fromLegacy;
  if (canonLead.has(raw)) return raw as LeadSource;
  return "기타";
}

function migrateCustomer(c: Customer): Customer {
  return {
    ...c,
    stage: migrateStage(String(c.stage)),
    leadSource: migrateLead(String(c.leadSource)),
  };
}

export function migrateCRMState(state: CRMState): CRMState {
  return {
    ...state,
    customers: state.customers.map(migrateCustomer),
  };
}
