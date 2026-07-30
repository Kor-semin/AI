import { sensoraB2BSeedData } from "@/lib/sensora";

import { SensoraDataControl } from "./SensoraDataControl";
import { SensoraTextSizeControl } from "./SensoraTextSizeControl";
import { SensoraThemeControl } from "./SensoraThemeControl";

const previewProfile = sensoraB2BSeedData.users.find((user) => user.id === "user_team_leader") ?? sensoraB2BSeedData.users[0];

export function SensoraSettingsView() {
  return (
    <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Workspace Settings</p><h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.035em] text-[var(--s-text)]">설정</h1><p className="mt-1.5 text-[0.8125rem] text-[var(--s-text-3)]">조직 범위, 계정 상태와 데이터 운영 원칙을 읽기 전용으로 확인합니다.</p></div><span className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-2 text-xs text-[var(--s-text-2)]">Beta · 읽기 전용</span></header>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6 xl:col-span-2" aria-labelledby="display-settings-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Display</p><h2 id="display-settings-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">화면 표시</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--s-text)]">글자 배율</h3>
              <p className="mt-1 text-[0.8125rem] text-[var(--s-text-3)]">화면의 모든 글자 크기를 한 번에 조정합니다.</p>
              <SensoraTextSizeControl />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--s-text)]">화면 모드</h3>
              <p className="mt-1 text-[0.8125rem] text-[var(--s-text-3)]">다크·라이트 배경을 선택합니다.</p>
              <SensoraThemeControl />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6 xl:col-span-2" aria-labelledby="data-settings-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Data</p><h2 id="data-settings-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">고객 데이터</h2>
          <p className="mt-1 text-[0.8125rem] text-[var(--s-text-3)]">이 브라우저에 저장된 고객 데이터를 관리합니다.</p>
          <SensoraDataControl />
        </section>

        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="account-settings-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Account & Scope</p><h2 id="account-settings-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">내 계정과 소속</h2>
          <div className="mt-5 space-y-3">{[["계정", "김도윤 · 승인 계정"], ["소속 전시장", "서울 강남 전시장"], ["역할 / 권한", "Team Leader · team scope"], ["Workspace", previewProfile.defaultWorkspace], ["데이터 범위", "담당 팀 고객 · 상담 · follow-up"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-[0.8125rem]"><span className="text-[var(--s-text-3)]">{label}</span><span className="text-right text-[var(--s-text-2)]">{value}</span></div>)}</div>
          <p className="mt-4 rounded-lg bg-[var(--s-brand-tint)] px-4 py-3 text-xs leading-5 text-[var(--s-text-2)]">역할과 권한을 변경하는 기능은 연결하지 않았습니다.</p>
        </section>

        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="service-status-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Service Status</p><h2 id="service-status-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">서비스 연결 상태</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Firebase", "연결 상태 예시"], ["승인 계정", "Beta 승인 흐름 예시"], ["DMS / ERP", "연동 예정"], ["AI 기능", "초안 미리보기"]].map(([label, value]) => <div key={label} className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4"><p className="text-xs text-[var(--s-text-3)]">{label}</p><p className="mt-3 text-[0.8125rem] font-semibold text-[var(--s-text-2)]">{value}</p></div>)}</div>
          <div className="mt-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4"><p className="text-sm font-semibold text-[var(--s-text)]">Beta Preview 상태 예시</p><ul className="mt-3 space-y-2 text-[0.8125rem] text-[var(--s-text-2)]"><li>Lead / 재고 / 팀 현황 · 구조 확인 가능</li><li>저장 / 전송 / 권한 변경 · 미연결</li><li>외부 시스템 동기화 · 연동 예정</li></ul></div>
        </section>

        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="data-principles-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Data Principles</p><h2 id="data-principles-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">데이터 분리 원칙</h2>
          <div className="mt-5 space-y-3">{["사용자는 본인 또는 허용된 팀 범위만 확인합니다.", "고객·상담·follow-up 데이터는 조직 범위로 구분합니다.", "AI 초안은 담당자가 검토하기 전 저장하거나 발송하지 않습니다."].map((item, index) => <div key={item} className="flex gap-3 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-[0.8125rem] leading-6 text-[var(--s-text-2)]"><span className="text-[var(--s-brand-text)]">0{index + 1}</span><span>{item}</span></div>)}</div>
        </section>

        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="security-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Privacy & Security</p><h2 id="security-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">개인정보와 보안 안내</h2>
          <div className="mt-5 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4"><p className="text-sm font-semibold text-[var(--s-text)]">민감정보 비노출</p><p className="mt-3 text-[0.8125rem] leading-6 text-[var(--s-text-2)]">이 미리보기에는 실제 고객 연락처, 인증 정보, 프로젝트 식별자나 접근 키를 표시하지 않습니다.</p></div>
          <div className="mt-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4"><p className="text-sm font-semibold text-[var(--s-text)]">변경 작업 제한</p><p className="mt-3 text-[0.8125rem] leading-6 text-[var(--s-text-2)]">계정 설정, 권한 변경과 데이터 저장은 관리자 확인 이후 별도 업무 화면에서만 수행됩니다.</p></div>
        </section>
      </div>
    </div>
  );
}
