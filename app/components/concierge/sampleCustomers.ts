export type SampleCustomer = {
  name: string;
  vehicle: string;
  status: string;
  nextAction: string;
  priority: "High" | "Medium" | "Low";
};

export const SAMPLE_CUSTOMERS: SampleCustomer[] = [
  {
    name: "김민준",
    vehicle: "프리미엄 세단",
    status: "견적 검토",
    nextAction: "오늘 오후 금융 조건 안내",
    priority: "High",
  },
  {
    name: "이서연",
    vehicle: "럭셔리 SUV",
    status: "시승 완료",
    nextAction: "내일 오전 재방문 일정 확인",
    priority: "Medium",
  },
  {
    name: "박지훈",
    vehicle: "비즈니스 세단",
    status: "신규 상담",
    nextAction: "예산과 구매 시기 확인",
    priority: "Medium",
  },
  {
    name: "최유진",
    vehicle: "VIP 플래그십",
    status: "재방문 예정",
    nextAction: "프라이빗 상담 준비",
    priority: "High",
  },
];

