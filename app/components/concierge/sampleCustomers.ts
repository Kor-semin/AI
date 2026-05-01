export type SampleCustomer = {
  id: string;
  name: string;
  phone: string;
  brand: string;
  interestedVehicle: string;
  status: string;
  potential: number;
  budget: string;
  purchaseTiming: string;
  nextAction: string;
  memo: string;
};

export const SAMPLE_CUSTOMERS: SampleCustomer[] = [
  {
    id: "CUST-001",
    name: "김민준",
    phone: "010-1234-5678",
    brand: "Mercedes-Benz",
    interestedVehicle: "E-Class",
    status: "견적 상담",
    potential: 82,
    budget: "8,000만 원대",
    purchaseTiming: "1개월 이내",
    nextAction: "리스 조건과 월 납입금 안내",
    memo: "조용한 승차감과 가족 이동을 중요하게 생각함. 기존 차량은 중고 매각 검토 중.",
  },
  {
    id: "CUST-002",
    name: "이서연",
    phone: "010-2456-9012",
    brand: "BMW",
    interestedVehicle: "X5",
    status: "시승 완료",
    potential: 74,
    budget: "1억 초반",
    purchaseTiming: "3개월 이내",
    nextAction: "시승 후 느낀 점 확인 및 프로모션 안내",
    memo: "아이 등하원과 주말 가족 여행 목적. SUV 공간감과 안전 사양을 중요하게 봄.",
  },
  {
    id: "CUST-003",
    name: "박지훈",
    phone: "010-3377-8821",
    brand: "Genesis",
    interestedVehicle: "G80",
    status: "신규 상담",
    potential: 58,
    budget: "7,000만 원대",
    purchaseTiming: "검토 중",
    nextAction: "예산 범위와 구매 시기 재확인",
    memo: "법인 차량 가능성 있음. 세단을 선호하지만 유지비와 세제 혜택도 함께 검토 중.",
  },
  {
    id: "CUST-004",
    name: "최유진",
    phone: "010-9088-1142",
    brand: "Mercedes-Benz",
    interestedVehicle: "GLE",
    status: "재방문 예정",
    potential: 88,
    budget: "1억 2천만 원대",
    purchaseTiming: "2주 이내",
    nextAction: "재방문 일정 확정 및 색상/옵션 준비",
    memo: "화이트 외장과 베이지 인테리어 선호. 남편과 함께 재방문 예정.",
  },
  {
    id: "CUST-005",
    name: "정우성",
    phone: "010-6612-3450",
    brand: "Porsche",
    interestedVehicle: "Cayenne",
    status: "계약 검토",
    potential: 91,
    budget: "1억 5천만 원 이상",
    purchaseTiming: "즉시 가능",
    nextAction: "재고 가능 색상과 출고 일정 안내",
    memo: "출고 가능 일정이 가장 중요함. 타 브랜드 SUV와 비교 중이며 빠른 출고를 원함.",
  },
  {
    id: "CUST-006",
    name: "한지아",
    phone: "010-7744-2901",
    brand: "MINI",
    interestedVehicle: "MINI Countryman",
    status: "상담 완료",
    potential: 63,
    budget: "5,000만 원대",
    purchaseTiming: "6개월 이내",
    nextAction: "월 납입금 예시와 유지비 안내",
    memo: "첫 수입차 구매 예정. 디자인과 주차 편의성을 중요하게 생각함.",
  },
  {
    id: "CUST-007",
    name: "윤태호",
    phone: "010-8841-7002",
    brand: "Audi",
    interestedVehicle: "A6",
    status: "다음 연락 필요",
    potential: 69,
    budget: "7,000만~8,000만 원",
    purchaseTiming: "2개월 이내",
    nextAction: "경쟁 차종 비교표와 금융 조건 전달",
    memo: "E-Class, 5 Series와 비교 중. 정숙성과 할인 조건에 관심이 많음.",
  },
  {
    id: "CUST-008",
    name: "서민아",
    phone: "010-4920-1833",
    brand: "Volvo",
    interestedVehicle: "XC60",
    status: "출고 예정",
    potential: 96,
    budget: "7,000만 원대",
    purchaseTiming: "계약 완료",
    nextAction: "출고 안내서 전달 및 보험 가입 확인",
    memo: "안전 사양을 가장 중요하게 생각함. 출고 전 블랙박스와 틴팅 안내 필요.",
  },
];

