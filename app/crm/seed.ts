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
      title: "중고 매입·대차 문의",
      body:
        "{고객명}님, 안녕하세요.\n차량 매입 또는 대차 안내를 위해 차량번호, 연식, 주행거리, 사고 유무를 알려주시면 대략적인 감가 범위를 먼저 확인해드리겠습니다.\n필요하시면 방문 견적도 함께 안내드리겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "첫 인사·상담 예약",
      body:
        "{고객명}님, 안녕하세요.\n문의 주셔서 감사합니다.\n\n관심 있으신 브랜드와 차종을 확인한 뒤, 시승 가능 일정과 견적 상담을 도와드리겠습니다.\n편하신 통화 가능 시간 알려주시면 맞춰서 연락드리겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "견적 발송 후 팔로업",
      body:
        "{고객명}님, 요청하신 견적 안내드렸습니다.\n\n옵션, 프로모션, 출고 가능 일정 중 추가로 확인하고 싶으신 부분이 있으시면 편하게 말씀 주세요.\n오늘이나 내일 중 짧게 통화 가능하신 시간도 함께 알려주시면 자세히 안내드리겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "시승·매장 방문 안내",
      body:
        "{고객명}님, 안녕하세요.\n시승 시에는 운전면허증 지참 부탁드립니다.\n\n원하시는 시승 코스가 있으시면 미리 말씀 주세요.\n방문 예정 시간에 맞춰 차량과 상담 자료를 준비해두겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "할부 조건 확인",
      body:
        "{고객명}님, 할부 조건은 선납금, 이용 기간, 월 납입금 기준에 따라 달라질 수 있습니다.\n\n우선 가장 중요하게 맞추고 싶은 기준이 월 납입금인지, 초기 비용인지 알려주시면 조건을 2가지 안으로 정리해드리겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "리스·장기렌트 안내",
      body:
        "{고객명}님, 리스와 장기렌트는 약정거리, 보증금, 인수 여부에 따라 월 납입금이 달라집니다.\n\n평소 주행 패턴이나 연간 예상 주행거리를 알려주시면 조건별로 비교해서 안내드리겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "현금·즉시 출고",
      body:
        "{고객명}님, 현재 즉시 출고 가능 재고를 먼저 확인해보겠습니다.\n\n희망하시는 색상과 옵션에서 조정 가능한 부분이 있으시면 말씀 주세요.\n가능한 조건을 빠르게 맞춰서 안내드리겠습니다.",
      updatedAt: t0,
    },
    {
      id: makeId("tpl"),
      title: "계약 전 체크리스트",
      body:
        "{고객명}님, 계약 전에는 명의, 등록 지역, 출고 희망일, 보험 가입 시점을 먼저 확인하면 됩니다.\n\n필요 서류와 진행 순서는 제가 정리해서 안내드릴 테니, 편하실 때 하나씩 확인해주시면 됩니다.",
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
