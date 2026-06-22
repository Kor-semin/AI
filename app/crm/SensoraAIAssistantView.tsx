export function SensoraAIAssistantView() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">AI Assistant</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-[#F4F6F8]">AI 비서</h1><p className="mt-1.5 text-xs text-[#7F8792]">상담 맥락을 바탕으로 영업사원이 검토할 요약과 초안을 제안합니다.</p></div>
        <span className="rounded-lg bg-[#2A151B] px-4 py-2 text-[10px] text-[#A93754]">사용자 검토 필수</span>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="AI 비서 요약">
        {[["검토할 상담", "6", "오늘 업데이트"], ["문자 초안", "4", "발송되지 않음"], ["추천 follow-up", "7", "담당자 확인 필요"], ["주의 알림", "2", "지연 일정 포함"]].map(([label, value, detail]) => <article key={label} className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-4"><p className="text-[11px] text-[#B7BDC6]">{label}</p><p className="mt-3 text-[28px] font-semibold text-[#F4F6F8]">{value}</p><p className="mt-2 text-[10px] text-[#7F8792]">{detail}</p></article>)}
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="ai-summary-title">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Selected Consultation</p><h2 id="ai-summary-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">박민지 고객 상담 요약</h2></div><span className="rounded-lg border border-[#2B3037] bg-[#1A1E23] px-3 py-2 text-[10px] text-[#B7BDC6]">GV70 · 상담 진행</span></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs font-semibold text-[#F4F6F8]">상담 요약</p><p className="mt-3 text-[11px] leading-5 text-[#B7BDC6]">다크 그레이 트림, 토요일 가족 동반 시승, 선수금 30% 조건을 우선 검토 중입니다.</p></div>
            <div className="rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs font-semibold text-[#F4F6F8]">위험 / 누락 알림</p><ul className="mt-3 space-y-3 text-[11px] text-[#B7BDC6]"><li className="text-[#B48A48]">시승 희망 시간이 확정되지 않음</li><li>배우자 동반 여부 재확인 필요</li><li>즉시 출고 재고 확인 필요</li></ul></div>
          </div>
          <div className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><div className="flex items-center justify-between gap-4"><p className="text-xs font-semibold text-[#F4F6F8]">문자 초안</p><span className="text-[10px] text-[#7F8792]">발송되지 않음</span></div><p className="mt-3 text-[11px] leading-5 text-[#B7BDC6]">안녕하세요. 요청하신 GV70 재고와 금융 조건을 확인했습니다. 토요일 오후 가족 동반 시승으로 안내드릴까요?</p></div>
          <p className="mt-4 rounded-lg bg-[#2A151B] px-4 py-3 text-[10px] leading-4 text-[#7F8792]">AI는 고객 정보를 자동 변경하거나 초안을 자동 저장·발송하지 않습니다.</p>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Next Best Action</p><h2 className="mt-2 text-lg font-semibold text-[#F4F6F8]">다음 행동 제안</h2><ol className="mt-5 space-y-3">{["시승 가능 시간 2개 제안", "선호 트림 재고 확인", "금융 조건 비교표 미리보기"].map((item, index) => <li key={item} className="rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-[11px] text-[#B7BDC6]"><span className="mr-3 text-[#A93754]">0{index + 1}</span>{item}</li>)}</ol></section>
          <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Follow-up</p><h2 className="mt-2 text-lg font-semibold text-[#F4F6F8]">추천 일정</h2><div className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs text-[#F4F6F8]">오늘 16:30 · 시승 일정 확인</p><p className="mt-2 text-[10px] text-[#7F8792]">구조 확인용 추천이며 실제 일정은 생성되지 않습니다.</p></div></section>
        </aside>
      </div>
    </div>
  );
}
