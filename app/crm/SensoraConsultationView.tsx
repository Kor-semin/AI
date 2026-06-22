import { sensoraB2BSeedData } from "@/lib/sensora";

const previewConsultation = sensoraB2BSeedData.consultations[0];

export function SensoraConsultationView() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Consultation Notes</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-[#F4F6F8]">상담 메모</h1><p className="mt-1.5 text-xs text-[#7F8792]">상담 내용을 정리하고 AI 요약과 다음 행동을 미리 확인합니다.</p></div>
        <span className="rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-2 text-[10px] text-[#B7BDC6]">저장 기능 미연결</span>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">{["박민지 고객", "Genesis GV70", "상담 진행", `Preview ID · ${previewConsultation.id}`].map((label) => <span key={label} className="rounded-full border border-[#2B3037] bg-[#14171B] px-3 py-2 text-[10px] text-[#B7BDC6]">{label}</span>)}</div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="consultation-memo-title">
          <div className="flex items-center justify-between gap-4"><h2 id="consultation-memo-title" className="text-lg font-semibold text-[#F4F6F8]">상담 메모 미리보기</h2><span className="text-[10px] text-[#7F8792]">읽기 전용 예시</span></div>
          <div role="note" aria-label="상담 메모 미리보기" className="mt-5 min-h-[240px] w-full cursor-default select-text rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4 text-sm leading-7 text-[#B7BDC6]">
            고객은 GV70 다크 그레이 외장과 블랙 내장을 선호함. 배우자와 함께 토요일 오후 시승 희망. 선수금 30%, 월 납입금 범위를 우선 비교하고 싶어 함. 즉시 출고 가능 재고와 프로모션 조건 확인 필요.
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-[10px] text-[#7F8792]">예산 / 월 납입금</p><p className="mt-2 text-xs font-medium text-[#F4F6F8]">선수금 30% · 월 110만원대</p></div>
            <div className="rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-[10px] text-[#7F8792]">관심 차량</p><p className="mt-2 text-xs font-medium text-[#F4F6F8]">GV70 2.5T AWD · Sport</p></div>
          </div>
          <p className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-[10px] leading-4 text-[#7F8792]">AI는 자동 저장하지 않습니다. 실제 저장 기능은 연결되어 있지 않습니다.</p>
        </section>

        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="consultation-ai-title">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">AI Preview</p><h2 id="consultation-ai-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">AI 상담 요약</h2></div><span className="rounded-lg bg-[#2A151B] px-3 py-2 text-[10px] text-[#A93754]">미리보기</span></div>
          <div className="mt-6 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs font-semibold text-[#F4F6F8]">고객 인사이트</p><p className="mt-3 text-[11px] leading-5 text-[#B7BDC6]">가족 의사결정이 중요한 고객이며, 차량 사양보다 출고 시점과 월 납입금 범위를 우선 비교합니다.</p><div className="mt-4 flex flex-wrap gap-2">{["가족 동반", "출고 우선", "금융 비교", "토요일 시승"].map((item) => <span key={item} className="rounded-full bg-[#0D0F12] px-3 py-1.5 text-[9px] text-[#B7BDC6]">{item}</span>)}</div></div>
          <div className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs font-semibold text-[#F4F6F8]">다음 행동 제안</p><ol className="mt-4 space-y-3 text-[11px] text-[#B7BDC6]"><li>01 · 토요일 14:00 시승 일정 제안</li><li>02 · 즉시 출고 가능 재고 확인</li><li>03 · 선수금별 월 납입금 비교 안내</li></ol></div>
          <div className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-[10px] text-[#7F8792]">문자 초안 미리보기</p><p className="mt-2 text-[11px] leading-5 text-[#F4F6F8]">“요청하신 GV70 시승과 금융 조건을 확인했습니다. 토요일 오후 일정으로 안내드릴까요?”</p></div>
        </section>
      </div>
    </div>
  );
}
