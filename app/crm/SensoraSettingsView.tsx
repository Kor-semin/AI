import { sensoraB2BSeedData } from "@/lib/sensora";

const previewProfile = sensoraB2BSeedData.users.find((user) => user.id === "user_team_leader") ?? sensoraB2BSeedData.users[0];

export function SensoraSettingsView() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Workspace Settings</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-[#F4F6F8]">설정</h1><p className="mt-1.5 text-xs text-[#7F8792]">조직 범위, 계정 상태와 데이터 운영 원칙을 읽기 전용으로 확인합니다.</p></div><span className="rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-2 text-[10px] text-[#B7BDC6]">Beta · 읽기 전용</span></header>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="account-settings-title">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Account & Scope</p><h2 id="account-settings-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">내 계정과 소속</h2>
          <div className="mt-5 space-y-3">{[["계정", "김도윤 · 승인 계정"], ["소속 전시장", "서울 강남 전시장"], ["역할 / 권한", "Team Leader · team scope"], ["Workspace", previewProfile.defaultWorkspace], ["데이터 범위", "담당 팀 고객 · 상담 · follow-up"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-[11px]"><span className="text-[#7F8792]">{label}</span><span className="text-right text-[#B7BDC6]">{value}</span></div>)}</div>
          <p className="mt-4 rounded-lg bg-[#2A151B] px-4 py-3 text-[10px] leading-4 text-[#7F8792]">역할과 권한을 변경하는 기능은 연결하지 않았습니다.</p>
        </section>

        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="service-status-title">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Service Status</p><h2 id="service-status-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">서비스 연결 상태</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Firebase", "구성 확인됨"], ["승인 계정", "Beta 승인"], ["DMS / ERP", "연동 예정"], ["AI 기능", "초안 미리보기"]].map(([label, value], index) => <div key={label} className="rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-[10px] text-[#7F8792]">{label}</p><p className={`mt-3 text-xs font-semibold ${index < 2 ? "text-[#4E8A66]" : "text-[#B7BDC6]"}`}>{value}</p></div>)}</div>
          <div className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs font-semibold text-[#F4F6F8]">Beta 기능 상태</p><ul className="mt-3 space-y-2 text-[11px] text-[#B7BDC6]"><li>Lead / 재고 / 팀 현황 · 구조 확인 가능</li><li>저장 / 전송 / 권한 변경 · 미연결</li><li>외부 시스템 동기화 · 연동 예정</li></ul></div>
        </section>

        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="data-principles-title">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Data Principles</p><h2 id="data-principles-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">데이터 분리 원칙</h2>
          <div className="mt-5 space-y-3">{["사용자는 본인 또는 허용된 팀 범위만 확인합니다.", "고객·상담·follow-up 데이터는 조직 범위로 구분합니다.", "AI 초안은 담당자가 검토하기 전 저장하거나 발송하지 않습니다."].map((item, index) => <div key={item} className="flex gap-3 rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-[11px] leading-5 text-[#B7BDC6]"><span className="text-[#A93754]">0{index + 1}</span><span>{item}</span></div>)}</div>
        </section>

        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="security-title">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Privacy & Security</p><h2 id="security-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">개인정보와 보안 안내</h2>
          <div className="mt-5 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs font-semibold text-[#F4F6F8]">민감정보 비노출</p><p className="mt-3 text-[11px] leading-5 text-[#B7BDC6]">이 미리보기에는 실제 고객 연락처, 인증 정보, 프로젝트 식별자나 접근 키를 표시하지 않습니다.</p></div>
          <div className="mt-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4"><p className="text-xs font-semibold text-[#F4F6F8]">변경 작업 제한</p><p className="mt-3 text-[11px] leading-5 text-[#B7BDC6]">계정 설정, 권한 변경과 데이터 저장은 관리자 확인 이후 별도 업무 화면에서만 수행됩니다.</p></div>
        </section>
      </div>
    </div>
  );
}
