/**
 * 워크스페이스 예시 고객 20명 — "실제로 편집 가능한" 시드 데이터.
 *
 * 기존 데모 데이터와 다른 점: 이 고객들은 화면 장식이 아니라 localStorage에 실제로 저장됩니다.
 * 따라서 대시보드 KPI → 고객 카드 → 상담 메모 → 저장까지 하나의 흐름으로 검증할 수 있습니다.
 * 사용자가 설정에서 초기화할 수 있고, 한 번 시딩한 뒤에는 다시 넣지 않습니다.
 */
import type { Customer, NextAction } from "./types";

export const SEED_VERSION = "sensora-seed-v1";

type SeedSpec = {
  key: string;
  name: string;
  phone: string;
  model: string;
  stage: Customer["stage"];
  leadSource: Customer["leadSource"];
  budget?: string;
  purchaseTiming?: string;
  compareVehicles?: string;
  memo: string;
  personalityMemo?: string;
  /** 오늘 연락 대상 분류 */
  todayContact?: { kind: "no_answer" | "reserved" | "planned"; label: string };
  /** 지연된 follow-up (시간 단위 경과) */
  overdue?: { hours: number; purpose: string };
  /** 최근 상담 메모 시각 */
  consultedAt?: { label: string; isToday: boolean };
};

export const SEED_SPECS: SeedSpec[] = [
  {
    key: "park_minji", name: "박민지", phone: "010-4821-7734", model: "Genesis GV70 2.5T AWD",
    stage: "시승 예정", leadSource: "전화·매장방문", budget: "5,200만 원 내외", purchaseTiming: "12월 전 출고",
    compareVehicles: "BMW X3, Volvo XC60",
    memo: "다크 그레이 외장 + 블랙 내장 선호. 배우자가 승차감을 가장 중요하게 봄. 토요일 오후 가족 동반 시승 희망. 주 2회 장거리 출장으로 정숙성 확인 필요.",
    personalityMemo: "결정 전 배우자와 상의하는 편. 재촉하면 역효과.",
    todayContact: { kind: "reserved", label: "예약 14:00 · 가족 동반 시승" },
    consultedAt: { label: "오늘 10:12", isToday: true },
  },
  {
    key: "kim_taehun", name: "김태훈", phone: "010-9034-2216", model: "BMW X5 xDrive40i",
    stage: "견적 발송", leadSource: "홈페이지·온라인문의", budget: "월 120만 원 이하", purchaseTiming: "3개월 이내",
    compareVehicles: "GV80, Audi Q7",
    memo: "리스와 할부 조건 비교를 요청. 리스 잔가 조건 재확인 필요. 오전에는 통화 어려움.",
    todayContact: { kind: "no_answer", label: "미응답 2회 · 오전 재시도" },
    overdue: { hours: 26, purpose: "금융 조건(리스·할부 비교) 안내" },
    consultedAt: { label: "오늘 09:40", isToday: true },
  },
  {
    key: "lee_suhyeon", name: "이수현", phone: "010-2277-8153", model: "Mercedes-Benz E300",
    stage: "계약 검토", leadSource: "지인·소개", budget: "7,000만 원", purchaseTiming: "이번 달",
    memo: "색상 확정(옵시디언 블랙). 출고 시점만 남은 상태 — 11월 말 가능 여부 확인 필요.",
    todayContact: { kind: "reserved", label: "예약 16:30 · 계약 조건 확정 통화" },
    consultedAt: { label: "어제 17:20", isToday: false },
  },
  {
    key: "jung_yujin", name: "정유진", phone: "010-5510-3382", model: "Audi A6 45 TFSI",
    stage: "상담 완료", leadSource: "네이버(플레이스·검색)",
    memo: "첫 상담만 진행. 예산 범위를 아직 정하지 못한 상태. 점심시간에는 연락 어려움.",
    todayContact: { kind: "no_answer", label: "미응답 1회 · 점심시간 피해서 재시도" },
  },
  {
    key: "choi_junho", name: "최준호", phone: "010-7789-0412", model: "현대 그랜저 하이브리드",
    stage: "견적 발송", leadSource: "리스·렌트·플릿", budget: "4,500만 원", purchaseTiming: "2개월 이내",
    memo: "법인 명의 구매 검토 중. 하이브리드 세제 혜택 자료 요청받음.",
    todayContact: { kind: "planned", label: "재통화 약속 · 보조금 안내" },
    consultedAt: { label: "오늘 11:05", isToday: true },
  },
  {
    key: "han_seoyeon", name: "한서연", phone: "010-3345-6690", model: "현대 팰리세이드",
    stage: "견적 발송", leadSource: "전화·매장방문", budget: "5,000만 원대", purchaseTiming: "다음 달",
    memo: "7인승 필수 조건. 캘리그래피 트림과 일반 트림 가격 차이 문의.",
    todayContact: { kind: "reserved", label: "예약 11:00 · 견적 설명" },
    consultedAt: { label: "오늘 11:32", isToday: true },
  },
  {
    key: "oh_jihun", name: "오지훈", phone: "010-8123-9945", model: "기아 카니발",
    stage: "신규 문의", leadSource: "홈페이지·온라인문의",
    memo: "온라인 문의로 접수. 아직 통화 전이며 관심 트림 미확인.",
    todayContact: { kind: "planned", label: "첫 연락 · 온라인 문의 응대" },
  },
  {
    key: "kang_mina", name: "강민아", phone: "010-6621-4478", model: "현대 아반떼",
    stage: "상담 완료", leadSource: "SNS(유튜브·인스타)", budget: "3,000만 원 이하",
    memo: "전화를 잘 받지 않아 문자 안내로 전환 검토 필요. 첫차 구매.",
    todayContact: { kind: "no_answer", label: "미응답 3회 · 문자 안내로 전환 검토" },
  },
  {
    key: "yun_seongho", name: "윤성호", phone: "010-9988-1102", model: "기아 쏘렌토 하이브리드",
    stage: "시승 예정", leadSource: "재방문·기존고객", purchaseTiming: "즉시 출고 희망",
    memo: "대기 기간이 핵심 관건. 즉시 출고 가능한 색상 목록 요청받음.",
    todayContact: { kind: "reserved", label: "예약 15:00 · 시승 차량 준비" },
    consultedAt: { label: "어제 16:05", isToday: false },
  },
  {
    key: "im_haneul", name: "임하늘", phone: "010-4456-7810", model: "현대 투싼",
    stage: "상담 완료", leadSource: "카카오", budget: "월 60만 원 수준",
    memo: "첫차 구매. 파노라마 선루프 포함 시 월 납입금 변화 문의.",
    todayContact: { kind: "planned", label: "옵션 구성 회신" },
    consultedAt: { label: "오늘 13:48", isToday: true },
  },
  {
    key: "seo_doyun", name: "서도윤", phone: "010-2210-8834", model: "Genesis GV80 3.5T",
    stage: "계약 검토", leadSource: "지인·소개", budget: "9,000만 원", purchaseTiming: "이번 달",
    memo: "3.5T 6인승으로 사실상 확정 분위기. 기존 차량 대차 견적만 남음.",
    todayContact: { kind: "planned", label: "계약서 초안 안내" },
    consultedAt: { label: "오늘 13:05", isToday: true },
  },
  {
    key: "mun_chaewon", name: "문채원", phone: "010-7712-5533", model: "기아 스포티지",
    stage: "견적 발송", leadSource: "광고(GDN 등)",
    memo: "이번 달 프로모션 마감 전 안내 필요. 하이브리드와 가솔린 사이에서 고민 중.",
    todayContact: { kind: "planned", label: "프로모션 마감 전 안내" },
  },
  {
    key: "bae_sanghyun", name: "배상현", phone: "010-3098-6642", model: "기아 K8",
    stage: "미상담", leadSource: "중고 매입 문의",
    memo: "상담 후 연락이 끊긴 상태. 재상담 의사 확인 필요.",
    overdue: { hours: 30, purpose: "재상담 의사 확인" },
  },
  {
    key: "no_eunji", name: "노은지", phone: "010-5567-2201", model: "폭스바겐 티구안",
    stage: "상담 완료", leadSource: "네이버(플레이스·검색)", compareVehicles: "기아 스포티지",
    memo: "시승 완료. 경쟁 모델(스포티지)과 유지비 비교 자료 요청받음.",
    overdue: { hours: 49, purpose: "시승 후 소감 follow-up" },
    consultedAt: { label: "어제 15:10", isToday: false },
  },
  {
    key: "jo_hyunwoo", name: "조현우", phone: "010-8845-3319", model: "현대 쏘나타",
    stage: "견적 발송", leadSource: "전화·매장방문",
    memo: "견적 유효기간 재안내 필요. 예산을 다시 검토하겠다고 함.",
    overdue: { hours: 25, purpose: "견적 유효기간 재안내" },
  },
  {
    key: "shin_jiwoo", name: "신지우", phone: "010-3321-7756", model: "Tesla Model Y",
    stage: "상담 완료", leadSource: "SNS(유튜브·인스타)", budget: "6,000만 원",
    memo: "아파트 충전 설치 가능 여부를 먼저 확인 중. 보조금 일정 문의.",
    consultedAt: { label: "어제 14:22", isToday: false },
  },
  {
    key: "hwang_areum", name: "황아름", phone: "010-6678-2214", model: "Volvo XC60",
    stage: "시승 예정", leadSource: "지인·소개", purchaseTiming: "3개월 이내",
    memo: "안전 사양을 최우선으로 봄. 아이 카시트 장착 편의성 확인 요청.",
    todayContact: { kind: "planned", label: "시승 일정 후보 2개 제안" },
  },
  {
    key: "song_taeyang", name: "송태양", phone: "010-9912-4408", model: "기아 EV6",
    stage: "출고 대기", leadSource: "재방문·기존고객",
    memo: "계약 완료 후 출고 대기 중. 출고 전 점검 일정과 서류 안내 필요.",
    consultedAt: { label: "어제 11:40", isToday: false },
  },
  {
    key: "ku_soyeon", name: "구소연", phone: "010-2245-9930", model: "현대 아이오닉 5",
    stage: "사후관리", leadSource: "재방문·기존고객",
    memo: "출고 완료 고객. 첫 정기 점검 안내 예정. 지인 소개 가능성 언급함.",
  },
  {
    key: "jang_minsu", name: "장민수", phone: "010-7734-1182", model: "BMW 520i M Sport",
    stage: "연락처 가져옴", leadSource: "주소록 가져오기",
    memo: "주소록에서 가져온 연락처. 아직 상담 이력 없음.",
  },
];

export const HIGH_POTENTIAL_THRESHOLD = 70;

/** 시드 스펙 → 실제 Customer 레코드 */
export function buildSeedCustomers(now: Date): Customer[] {
  return SEED_SPECS.map((spec, index) => {
    // 최근에 등록된 고객이 위에 오도록 index만큼 과거로 배치
    const created = new Date(now.getTime() - (index + 1) * 36 * 60 * 1000).toISOString();
    return {
      id: `seed_${spec.key}`,
      createdAt: created,
      updatedAt: created,
      name: spec.name,
      phone: spec.phone,
      leadSource: spec.leadSource,
      stage: spec.stage,
      interestedModel: spec.model,
      compareVehicles: spec.compareVehicles,
      budget: spec.budget,
      purchaseTiming: spec.purchaseTiming,
      memo: spec.memo,
      personalityMemo: spec.personalityMemo,
    };
  });
}

/** 지연 follow-up이 있는 고객에 대해 다음 연락 항목도 함께 만듭니다. */
export function buildSeedNextActions(now: Date): NextAction[] {
  return SEED_SPECS.filter((spec) => spec.overdue).map((spec) => ({
    id: `seed_action_${spec.key}`,
    customerId: `seed_${spec.key}`,
    createdAt: new Date(now.getTime() - (spec.overdue?.hours ?? 24) * 60 * 60 * 1000).toISOString(),
    dueAt: new Date(now.getTime() - (spec.overdue?.hours ?? 24) * 60 * 60 * 1000).toISOString(),
    title: spec.overdue?.purpose ?? "다음 연락",
  }));
}

/** 고객 id → KPI 판정용 메타 (시드 고객에만 존재) */
export const SEED_META = new Map(
  SEED_SPECS.map((spec) => [
    `seed_${spec.key}`,
    {
      todayContact: spec.todayContact,
      overdue: spec.overdue,
      consultedAt: spec.consultedAt,
    },
  ]),
);
