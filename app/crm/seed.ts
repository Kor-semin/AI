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
    stage: "문의·리드",
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
    stage: "시승·상담",
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
        title: "전화: 시승·옵션 니즈 정리",
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
