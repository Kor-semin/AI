import { sensoraB2BSeedData, type SensoraCustomer } from "@/lib/sensora";

const baseCustomer = sensoraB2BSeedData.customers[0];

const previewCustomers: SensoraCustomer[] = [
  { ...baseCustomer, id: "customer_preview_1", name: "박민지", interestedVehicle: "Genesis GV70 2.5T AWD", status: "test_drive_scheduled", probability: 78, nextFollowUpAt: "2026-06-22T14:00:00.000Z" },
  { ...baseCustomer, id: "customer_preview_2", name: "김태훈", interestedVehicle: "BMW X5 xDrive40i", status: "quote_sent", probability: 66, nextFollowUpAt: "2026-06-22T16:30:00.000Z" },
  { ...baseCustomer, id: "customer_preview_3", name: "이수현", interestedVehicle: "Mercedes-Benz E300", status: "contract_likely", probability: 84, nextFollowUpAt: "2026-06-23T10:00:00.000Z" },
  { ...baseCustomer, id: "customer_preview_4", name: "정유진", interestedVehicle: "Audi A6 45 TFSI", status: "consulting", probability: 45, nextFollowUpAt: "2026-06-24T11:00:00.000Z" },
];

const statusLabels: Record<SensoraCustomer["status"], string> = {
  new: "신규",
  contacted: "연락 완료",
  consulting: "상담 진행",
  quote_sent: "견적 전달",
  test_drive_scheduled: "시승 예정",
  contract_likely: "계약 유력",
  contracted: "계약 완료",
  delivered: "출고 완료",
  lost: "보류",
  inactive: "비활성",
};

export function SensoraCustomerView() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Customer Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-[#F4F6F8]">고객관리</h1>
          <p className="mt-1.5 text-xs text-[#7F8792]">담당 고객의 관심 차량, 상담 상태와 다음 연락 계획을 확인합니다.</p>
        </div>
        <span className="rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-2 text-[10px] text-[#B7BDC6]">읽기 전용 미리보기</span>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="고객관리 요약">
        {[["담당 고객", "24", "활성 고객 기준"], ["오늘 연락", "12", "미응답 3명"], ["계약 유력", "7", "가능성 70% 이상"], ["지연 follow-up", "4", "24시간 이상 경과"]].map(([label, value, detail]) => (
          <article key={label} className="min-h-[120px] rounded-2xl border border-[#2B3037] bg-[#14171B] p-4">
            <p className="text-[11px] text-[#B7BDC6]">{label}</p>
            <p className="mt-3 text-[28px] font-semibold leading-none text-[#F4F6F8]">{value}</p>
            <p className="mt-3 text-[10px] text-[#7F8792]">{detail}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.45fr_.75fr]">
        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="customer-list-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="customer-list-title" className="text-lg font-semibold text-[#F4F6F8]">고객 목록</h2>
            <span className="text-[10px] text-[#7F8792]">Customer · {previewCustomers.length}명 표시</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[.8fr_1.35fr_.8fr_1fr_.75fr_1.4fr_.75fr] gap-3 rounded-lg bg-[#1A1E23] px-4 py-3 text-[10px] text-[#7F8792]">
                <span>고객명</span><span>관심 차량</span><span>상태</span><span>다음 연락일</span><span>계약 가능성</span><span>최근 상담 요약</span><span>담당자</span>
              </div>
              <div className="mt-3 space-y-2">
                {previewCustomers.map((customer, index) => (
                  <div key={customer.id} className={`grid min-h-[72px] grid-cols-[.8fr_1.35fr_.8fr_1fr_.75fr_1.4fr_.75fr] items-center gap-3 rounded-lg border px-4 text-[11px] ${index === 0 ? "border-[#7A263A] bg-[#2A151B]" : "border-[#2B3037] bg-[#1A1E23]"}`}>
                    <span className="font-semibold text-[#F4F6F8]">{customer.name}</span>
                    <span className="text-[#B7BDC6]">{customer.interestedVehicle}</span>
                    <span className="text-[#B7BDC6]">{statusLabels[customer.status]}</span>
                    <span className="text-[#7F8792]">{index < 2 ? "오늘" : index === 2 ? "내일" : "6월 24일"}</span>
                    <span className={customer.probability && customer.probability >= 70 ? "font-semibold text-[#4E8A66]" : "text-[#B7BDC6]"}>{customer.probability}%</span>
                    <span className="truncate text-[#7F8792]">{index === 0 ? "가족 동반 시승 선호" : index === 1 ? "금융 조건 비교 요청" : index === 2 ? "재고 및 출고일 확인" : "프로모션 조건 검토"}</span>
                    <span className="text-[#B7BDC6]">김도윤</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="customer-detail-title">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Selected Customer</p>
          <h2 id="customer-detail-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">박민지 고객</h2>
          <p className="mt-1 text-xs text-[#7F8792]">Genesis GV70 2.5T AWD</p>
          <div className="mt-6 space-y-3">
            {[["상태", "시승 예정"], ["다음 연락", "오늘 14:00"], ["계약 가능성", "78%"], ["담당 영업사원", "김도윤 매니저"]].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-[11px]"><span className="text-[#7F8792]">{label}</span><span className="text-[#B7BDC6]">{value}</span></div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4">
            <p className="text-xs font-semibold text-[#F4F6F8]">최근 상담 요약</p>
            <p className="mt-3 text-[11px] leading-5 text-[#B7BDC6]">다크 그레이 트림과 가족 동반 시승을 선호하며, 토요일 오후 일정 확인이 필요합니다.</p>
          </div>
          <p className="mt-4 rounded-lg bg-[#2A151B] px-4 py-3 text-[10px] leading-4 text-[#7F8792]">구조 확인용 화면입니다. 고객 정보 저장이나 상태 변경 기능은 연결하지 않았습니다.</p>
        </aside>
      </div>
    </div>
  );
}
