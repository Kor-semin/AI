import type { CRMState, Customer, MessageTemplate } from "./types";
import { migrateCRMState } from "./migrate";

function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function seedState(): CRMState {
  const t0 = nowIso();

  const kim: Customer = {
    id: makeId("cus"),
    createdAt: t0,
    updatedAt: t0,
    name: "김민수",
    phone: "010-1234-5678",
    leadSource: "SNS(유튜브·인스타)",
    stage: "신규 문의",
    vehicleBrand: "기아",
    interestedModel: "쏘렌토 · 소렌토 하이브리드",
    budget: "3,800만원까지 협상",
    memo: "가족용 7인승. 주말 통화 선호.",
  };

  const lee: Customer = {
    id: makeId("cus"),
    createdAt: t0,
    updatedAt: t0,
    name: "이서연",
    phone: "010-9876-5432",
    leadSource: "지인·소개",
    stage: "상담 완료",
    vehicleBrand: "현대",
    interestedModel: "아반떼 / 아반떼 N",
    memo: "첫차 · 보험/할부 질문 많음.",
  };

  const customers: Customer[] = [kim, lee];

  const templates: MessageTemplate[] = [
    {
      id: makeId("tpl"),
      title: "첫 인사/상담 예약",
      body:
        "안녕하세요 {고객명}님. {내이름}입니다.\n문의 주셔서 감사합니다. 브랜드·관심 차종 확인 후 시승/견적 일정 안내 드리겠습니다.\n통화 가능하신 시간 알려 주세요.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "견적 발송 후 팔로업",
      body:
        "{고객명}님, 견적 보냈습니다.\n옵션/프로모션/납기 더 필요하시면 말씀 주세요.\n오늘·내일 중 짧게 통화 괜찮으실까요?",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "시승·매장 방문 안내",
      body:
        "{고객명}님, {내이름}입니다.\n시승은 면허 지참 부탁드립니다. 원하시는 코스(시내/고속) 알려 주시면 준비해 두겠습니다.\n방문 예정 시각만 회신 부탁드립니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "할부 조건 확인",
      body:
        "{고객명}님, 할부는 선납·기간·월납 중 어떤 걸 먼저 맞추면 편하실까요?\n대략 범위만 알려 주시면 견적을 2안으로 정리해 드리겠습니다. {내이름} 드림.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "리스·장기렌트 안내",
      body:
        "{고객명}님, 리스/장기렌트는 약정거리·보증금·인수 옵션에 따라 월납이 달라집니다.\n주행 패턴(연간 km)만 알려 주시면 조건 비교표로 보내드릴게요. {내이름}",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "현금·즉시 출고",
      body:
        "{고객명}님, 현금/즉시 출고 가능 재고 먼저 확인했습니다.\n색상·옵션 타협 가능하시면 말씀 주세요. {내이름}이 바로 맞춰보겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "중고 매입·대차 문의",
      body:
        "{고객명}님, 차량번호·연식·주행거리·사고유무 알려 주시면 대략 감가 안내 드릴게요.\n방문 견적도 가능합니다. {내이름}",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "계약 전 체크리스트",
      body:
        "{고객명}님, 계약 전에 명의·등록지·출고일·보험 가입 시점만 확인하면 됩니다.\n서류 준비 도와드릴게요. {내이름}",
      updatedAt: t0,
    },
  ];

  return migrateCRMState({
    version: 1,
    customers,
    nextActions: [
      {
        id: makeId("act"),
        customerId: kim.id,
        createdAt: t0,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
        title: "견적 조건 확인 후 연락",
      },
      {
        id: makeId("act"),
        customerId: lee.id,
        createdAt: t0,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
        title: "시승 일정 조율 및 카탈로그 안내",
      },
    ],
    events: [
      {
        id: makeId("evt"),
        customerId: lee.id,
        startAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        title: "매장 방문 · 시승 안내",
        notes: "면허·운전 패턴 확인, 금융 조건 간단히",
      },
    ],
    templates,
  });
}
