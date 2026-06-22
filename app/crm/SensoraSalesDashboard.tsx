import type { CrmSection } from "./crmSectionTypes";
import { SensoraInventoryView } from "./SensoraInventoryView";
import { SensoraLeadQueueView } from "./SensoraLeadQueueView";
import { SensoraTeamView } from "./SensoraTeamView";

type SensoraSalesDashboardProps = {
  todayContacts: number;
  highPotential: number;
  overdueFollowUps: number;
  recentConsultations: number;
  sellerName?: string;
  onNavigate: (section: CrmSection) => void;
};

const kpiMeta = [
  { key: "todayContacts", label: "오늘 연락할 고객", detail: "우선 연락 목록", tone: "text-[#F4F6F8]" },
  { key: "highPotential", label: "계약 가능성이 높은 고객", detail: "구매 신호 기반", tone: "text-[#73A887]" },
  { key: "overdueFollowUps", label: "지연된 follow-up", detail: "확인이 필요한 일정", tone: "text-[#D0A45D]" },
  { key: "recentConsultations", label: "최근 상담 요약", detail: "최근 7일 업데이트", tone: "text-[#C98293]" },
] as const;

export function SensoraSalesDashboard({
  todayContacts,
  highPotential,
  overdueFollowUps,
  recentConsultations,
  sellerName,
  onNavigate,
}: SensoraSalesDashboardProps) {
  const values = { todayContacts, highPotential, overdueFollowUps, recentConsultations };

  return (
    <div id="crm-section-dashboard" className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-col gap-5 border-b border-[#2B3037] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7A263A]">Sensora Sales Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#F4F6F8] sm:text-[28px]">대시보드</h1>
          <p className="mt-2 text-xs text-[#7F8792]">2026년 6월 22일 월요일 · {sellerName?.trim() || "영업 담당자"}님의 업무 요약</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("leadQueue")}
          className="inline-flex h-8 w-fit items-center justify-center rounded-lg border border-[#3A4048] bg-[#1A1E23] px-3.5 text-xs font-medium text-[#F4F6F8] transition-colors hover:border-[#7A263A] hover:bg-[#2A151B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A263A]"
        >
          New Lead · 미리보기
        </button>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="영업 KPI 요약">
        {kpiMeta.map((item) => (
          <article key={item.key} className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium leading-5 text-[#B7BDC6]">{item.label}</p>
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#7A263A]" />
            </div>
            <p className={`mt-5 text-[30px] font-semibold leading-none tracking-[-0.04em] ${item.tone}`}>{values[item.key]}</p>
            <p className="mt-2 text-[10px] text-[#7F8792]">{item.detail}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="ai-assistant-preview-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A263A]">AI Assistant</p>
              <h2 id="ai-assistant-preview-title" className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">AI 비서</h2>
              <p className="mt-1 text-xs leading-5 text-[#7F8792]">상담 맥락을 검토하고 다음 행동과 문자 초안을 제안합니다.</p>
            </div>
            <span className="rounded-full border border-[#7A263A]/50 bg-[#2A151B] px-2.5 py-1 text-[10px] text-[#C98293]">초안 미리보기</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[#2B3037] bg-[#0D0F12] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7F8792]">상담 요약</p>
              <p className="mt-3 text-xs leading-5 text-[#B7BDC6]">고객은 GLC 300 4MATIC의 출고 가능 시점과 금융 조건을 우선 확인했습니다. 블랙 외장과 베이지 내장을 선호합니다.</p>
            </div>
            <div className="rounded-lg border border-[#2B3037] bg-[#0D0F12] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7F8792]">다음 행동 제안</p>
              <ol className="mt-3 space-y-2 text-xs leading-5 text-[#B7BDC6]">
                <li><span className="mr-2 text-[#7A263A]">01</span>재고 가능 여부 확인</li>
                <li><span className="mr-2 text-[#7A263A]">02</span>금융 조건 비교 안내</li>
                <li><span className="mr-2 text-[#7A263A]">03</span>오늘 오후 직접 연락</li>
              </ol>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7F8792]">문자 초안 미리보기</p>
              <span className="text-[10px] text-[#7F8792]">발송되지 않음</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#F4F6F8]">안녕하세요. 문의하신 GLC 300 4MATIC의 재고 및 금융 조건을 확인해 안내드리겠습니다. 편하신 통화 시간을 알려주세요.</p>
          </div>

          <p className="mt-4 rounded-lg border border-[#7A263A]/40 bg-[#2A151B] px-4 py-3 text-[11px] leading-5 text-[#C98293]">AI는 상담 내용을 자동 저장하거나 문자를 자동 발송하지 않습니다. 영업사원이 반드시 검토한 뒤 직접 실행합니다.</p>
        </section>

        <SensoraLeadQueueView compact />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <SensoraInventoryView compact />
        <SensoraTeamView compact />
      </div>
    </div>
  );
}
