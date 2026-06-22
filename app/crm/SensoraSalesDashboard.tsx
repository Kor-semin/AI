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
  { key: "todayContacts", label: "오늘 연락할 고객", detail: "미응답 3명 · 예약 4건", tone: "text-[#F4F6F8]" },
  { key: "highPotential", label: "계약 가능성이 높은 고객", detail: "AI 우선순위 상위 18%", tone: "text-[#A93754]" },
  { key: "overdueFollowUps", label: "지연된 follow-up", detail: "24시간 이상 경과", tone: "text-[#D0A45D]" },
  { key: "recentConsultations", label: "최근 상담 요약", detail: "오늘 새 메모 6건", tone: "text-[#F4F6F8]" },
] as const;

export function SensoraSalesDashboard({
  todayContacts,
  highPotential,
  overdueFollowUps,
  recentConsultations,
  onNavigate,
}: SensoraSalesDashboardProps) {
  const values = { todayContacts, highPotential, overdueFollowUps, recentConsultations };

  return (
    <div id="crm-section-dashboard" className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <header className="flex min-h-[76px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#F4F6F8] sm:text-[28px]">Sales Workspace</h1>
          <p className="mt-1.5 text-xs text-[#7F8792]">오늘의 고객 접점과 팀 영업 흐름을 한눈에 확인하세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex h-10 items-center rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 text-[11px] font-medium tracking-[0.04em] text-[#B7BDC6]">2026. 06. 22&nbsp; MON</span>
          <button
            type="button"
            onClick={() => onNavigate("leadQueue")}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D5D8DC] bg-[#F4F6F8] px-4 text-xs font-semibold text-[#0A0B0D] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A263A]"
          >
            새 Lead 접수
          </button>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="영업 KPI 요약">
        {kpiMeta.map((item) => (
          <article key={item.key} className="min-h-[144px] rounded-2xl border border-[#2B3037] bg-[#14171B] p-4">
            <p className="text-[11px] font-medium leading-5 text-[#B7BDC6]">{item.label}</p>
            <p className={`mt-3 text-[32px] font-semibold leading-none tracking-[-0.04em] ${item.tone}`}>{values[item.key]}</p>
            <p className="mt-3 text-[10px] text-[#7F8792]">{item.detail}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[1.2fr_.85fr]">
        <section className="min-h-[380px] rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="ai-assistant-preview-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">AI Assistant</p>
              <h2 id="ai-assistant-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">오늘의 상담 인사이트</h2>
            </div>
            <span className="rounded-lg bg-[#2A151B] px-4 py-2 text-[10px] font-medium text-[#A93754]">검토 후 실행</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="min-h-[200px] rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4">
              <p className="text-xs font-semibold text-[#F4F6F8]">상담 요약</p>
              <p className="mt-3 text-[11px] leading-5 text-[#B7BDC6]">박민지 고객은 GV70 다크 그레이 트림에 관심이 많고 가족 동반 시승을 선호합니다.</p>
              <p className="mt-3 text-[10px] font-semibold text-[#A93754]">문자 초안 미리보기</p>
              <p className="mt-2 text-[10px] leading-5 text-[#7F8792]">“민지 고객님, 요청하신 GV70 시승을 토요일 오후로 준비해드릴까요?”</p>
            </div>
            <div className="min-h-[200px] rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4">
              <p className="text-xs font-semibold text-[#F4F6F8]">다음 행동 제안</p>
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#4E8A66]">Next best action</p>
              <ol className="mt-3 space-y-3 text-[11px] leading-5 text-[#B7BDC6]">
                <li><span className="mr-3 text-[#7F8792]">01</span>토요일 14:00 시승 일정 제안</li>
                <li><span className="mr-3 text-[#7F8792]">02</span>선호 트림 재고 2대 확인</li>
                <li><span className="mr-3 text-[#7F8792]">03</span>배우자 동반 여부 메시지 확인</li>
              </ol>
            </div>
          </div>

          <p className="mt-6 rounded-lg bg-[#1A1E23] px-4 py-2 text-[10px] leading-4 text-[#7F8792]">AI는 자동 저장하거나 자동 발송하지 않습니다. 담당자가 검토한 뒤 직접 실행합니다.</p>
        </section>

        <SensoraLeadQueueView compact />
      </div>

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[1.2fr_.85fr]">
        <SensoraInventoryView compact />
        <SensoraTeamView compact />
      </div>
    </div>
  );
}
