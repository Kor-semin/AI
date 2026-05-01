"use client";

import type { DemoConsultingResponse, DemoSalesStyle } from "@/app/components/concierge/aiDemoResponse";
import type { TranslationKey } from "@/lib/i18n";
import type { Customer } from "@/app/crm/types";

const WORKSPACE_AI_STYLE_KEYS: Record<DemoSalesStyle, TranslationKey> = {
  polite: "landing.aiDemo.salesStyle.polite",
  simple: "landing.aiDemo.salesStyle.simple",
  premium: "landing.aiDemo.salesStyle.premium",
  friendly: "landing.aiDemo.salesStyle.friendly",
  active: "landing.aiDemo.salesStyle.active",
};
const WORKSPACE_AI_STYLE_ORDER: DemoSalesStyle[] = ["polite", "simple", "premium", "friendly", "active"];

const SENSORA_FLOW_AI_BADGE =
  "inline-flex shrink-0 items-center rounded-full bg-[#E8EDF4] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#475569]";

export type CrmAiAssistantPanelProps = {
  t: (key: TranslationKey) => string;
  workspaceAiCoachTopics: string | null;
  workspaceAiBusy: boolean;
  selectedCustomerId: string | null;
  onCustomerIdChange: (id: string | null) => void;
  workspaceCustomerOptions: Customer[];
  workspaceSalesStyle: DemoSalesStyle;
  onWorkspaceSalesStyleChange: (v: DemoSalesStyle) => void;
  workspaceAiMemoDraft: string;
  onWorkspaceAiMemoDraftChange: (v: string) => void;
  memoDiffersFromFlowSnapshot: boolean;
  flowDraftMemo: string;
  flowDraftInsights: DemoConsultingResponse | null;
  onAnalyzeOrRefresh: () => void;
  onNewProposal: () => void;
  onRewriteSmsDraft: () => void;
  onCopySms: () => void;
  onSaveMemoToCrm: () => void;
  onCreateFollowUpFromInsights: () => void;
};

export function CrmAiAssistantPanel({
  t,
  workspaceAiCoachTopics,
  workspaceAiBusy,
  selectedCustomerId,
  onCustomerIdChange,
  workspaceCustomerOptions,
  workspaceSalesStyle,
  onWorkspaceSalesStyleChange,
  workspaceAiMemoDraft,
  onWorkspaceAiMemoDraftChange,
  memoDiffersFromFlowSnapshot,
  flowDraftMemo,
  flowDraftInsights,
  onAnalyzeOrRefresh,
  onNewProposal,
  onRewriteSmsDraft,
  onCopySms,
  onSaveMemoToCrm,
  onCreateFollowUpFromInsights,
}: CrmAiAssistantPanelProps) {
  const ft = flowDraftMemo.trim();
  const rewriteDisabled =
    !selectedCustomerId || !(ft.length > 0 ? true : workspaceAiMemoDraft.trim().length > 0);

  return (
    <section
      id="crm-ai-assistant"
      tabIndex={-1}
      className="scroll-mt-[max(7rem,calc(5rem+env(safe-area-inset-top,0px)))] rounded-[22px] border border-[#E5E7EB] bg-[#FAFBFC] px-5 py-5 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] sm:px-6"
      aria-labelledby="crm-ai-assistant-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF1F5] pb-4">
        <div className="min-w-0">
          <h2 id="crm-ai-assistant-title" className="text-[17px] font-semibold text-[#111827]">
            {t("crm.workspaceAi.title")}
          </h2>
          <p className="mt-1 max-w-[58ch] text-[13px] leading-relaxed text-[#6B7280]">
            {t("crm.workspaceAi.subtitle")}
          </p>
          <p className="mt-3 max-w-[72ch] rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC]/90 px-3 py-2 text-[11px] leading-snug text-[#64748B]">
            {t("crm.sensoraFlow.banner")}
          </p>
        </div>
        {workspaceAiBusy && selectedCustomerId ? (
          <span className="shrink-0 text-[12px] font-semibold text-[#64748B]" aria-live="polite">
            {t("crm.workspaceAi.analyzing")}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-[#374151]">{t("crm.workspaceAi.customerPickLabel")}</span>
            <select
              value={selectedCustomerId ?? ""}
              onChange={(e) => onCustomerIdChange(e.target.value ? e.target.value : null)}
              className="min-h-[44px] w-full rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-3 text-[14px] font-medium text-[#111827] outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]/55"
              aria-label={t("crm.workspaceAi.selectPlaceholder")}
            >
              <option value="">{t("crm.workspaceAi.selectPlaceholder")}</option>
              {workspaceCustomerOptions.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name}
                  {cust.interestedModel?.trim() ? ` · ${cust.interestedModel}` : ""}
                </option>
              ))}
            </select>
          </label>
          {!selectedCustomerId ? (
            <p className="rounded-[14px] border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-[13px] text-[#64748B]">
              {t("crm.workspaceAi.pickCustomer")}
            </p>
          ) : null}
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-[#374151]">{t("crm.workspaceAi.toneLabel")}</span>
            <select
              value={workspaceSalesStyle}
              onChange={(e) => onWorkspaceSalesStyleChange(e.target.value as DemoSalesStyle)}
              disabled={!selectedCustomerId}
              className="min-h-[44px] w-full rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-3 text-[14px] font-medium outline-none disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:opacity-65"
              aria-label={t("crm.workspaceAi.toneLabel")}
            >
              {WORKSPACE_AI_STYLE_ORDER.map((sid) => (
                <option key={sid} value={sid}>
                  {t(WORKSPACE_AI_STYLE_KEYS[sid])}
                </option>
              ))}
            </select>
          </label>
          <p className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-2 py-2 text-[11px] leading-snug text-[#64748B]">
            {t("crm.sensoraFlow.toneHintsReanalyze")}
          </p>
        </div>
        <div className="grid min-h-0 gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[13px] font-semibold text-[#374151]">{t("crm.workspaceAi.memoLabel")}</span>
            <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
              {t("crm.sensoraFlow.memoUserEditableHint")}
            </span>
          </div>
          <textarea
            value={workspaceAiMemoDraft}
            onChange={(e) => onWorkspaceAiMemoDraftChange(e.target.value)}
            disabled={!selectedCustomerId}
            rows={8}
            spellCheck={false}
            autoComplete="off"
            className="min-h-[180px] w-full resize-y rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] leading-relaxed text-[#111827] outline-none focus:border-[#94A3B8] disabled:cursor-not-allowed disabled:bg-[#F3F4F6]"
            placeholder=""
          />
          {memoDiffersFromFlowSnapshot && selectedCustomerId ? (
            <p className="rounded-[12px] border border-dashed border-amber-200/95 bg-[#FFFBEB] px-3 py-2 text-[12px] font-medium leading-snug text-[#92400E]">
              {t("crm.sensoraFlow.memoStaleHint")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex min-h-0 min-w-0 flex-col rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#64748B]">{t("crm.workspaceAi.consultSummaryHeading")}</div>
              <p className="mt-1 text-[10px] font-medium leading-snug text-[#94A3B8]">{t("crm.workspaceAi.consultSummaryLead")}</p>
            </div>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words whitespace-pre-line text-[14px] leading-relaxed text-[#111827]">
            {flowDraftInsights ? flowDraftInsights.summary : "—"}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col rounded-[14px] border border-[#E5E7EB] bg-[#FAFCFF] p-4 shadow-sm ring-1 ring-inset ring-[#E8EEF7]">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#475569]">{t("crm.workspaceAi.needsHeading")}</div>
              <p className="mt-1 text-[10px] font-medium leading-snug text-[#64748B]">{t("crm.workspaceAi.customerNeedsHelper")}</p>
            </div>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words text-[14px] leading-relaxed text-[#111827]">
            {workspaceAiCoachTopics ? (
              <p className="whitespace-pre-line font-medium text-[#0F172A]">{workspaceAiCoachTopics}</p>
            ) : flowDraftInsights ? (
              <p className="text-[13px] italic text-[#64748B]">{t("crm.workspaceAi.customerNeedsPlaceholder")}</p>
            ) : (
              <span className="text-[#94A3B8]">—</span>
            )}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#64748B]">{t("crm.workspaceAi.salesHeading")}</h3>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-snug text-[#94A3B8]">{t("crm.workspaceAi.nextActionLead")}</p>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words whitespace-pre-line text-[14px] leading-relaxed text-[#111827]">
            {flowDraftInsights ? flowDraftInsights.nextAction : "—"}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#64748B]">{t("crm.workspaceAi.smsHeading")}</h3>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-snug text-[#94A3B8]">{t("crm.workspaceAi.smsDraftLead")}</p>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words whitespace-pre-line text-[14px] leading-relaxed text-[#111827]">
            {flowDraftInsights ? flowDraftInsights.message : "—"}
          </div>
        </div>
      </div>

      {selectedCustomerId && !flowDraftInsights ? (
        <p className="mt-4 text-[12px] leading-snug text-[#64748B]">{t("crm.sensoraFlow.previewEmptyHint")}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#EEEFF3] pt-5">
        <button
          type="button"
          disabled={!selectedCustomerId || !workspaceAiMemoDraft.trim()}
          className="min-h-[44px] touch-manipulation rounded-[12px] bg-[#111827] px-4 text-[13px] font-semibold text-white hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onAnalyzeOrRefresh}
        >
          {t("crm.sensoraFlow.analyzeAgain")}
        </button>
        <button
          type="button"
          disabled={!selectedCustomerId || !workspaceAiMemoDraft.trim()}
          className="min-h-[44px] touch-manipulation rounded-[12px] border border-[#D1D5DB] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onNewProposal}
        >
          {t("crm.sensoraFlow.newProposal")}
        </button>
        <button
          type="button"
          disabled={rewriteDisabled}
          className="min-h-[44px] touch-manipulation rounded-[12px] border border-[#D1D5DB] bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#334155] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onRewriteSmsDraft}
        >
          {t("crm.sensoraFlow.rewriteSms")}
        </button>
      </div>

      <p className="mt-5 max-w-[68ch] text-[12px] leading-relaxed text-[#64748B]">{t("crm.sensoraFlow.appliedEditableHint")}</p>

      <div className="sticky bottom-1 z-[3] mt-6 flex w-full max-w-full min-w-0 flex-col gap-2 rounded-[14px] border border-[#E5E7EB] bg-[#FFFFFF]/96 px-3 py-3 shadow-[0_6px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-stretch">
        <button
          type="button"
          disabled={!selectedCustomerId || !flowDraftInsights || !flowDraftInsights.message.trim()}
          className="min-h-[44px] w-full min-w-0 shrink-0 touch-manipulation rounded-[12px] bg-[#111827] px-4 text-[13px] font-semibold text-white hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[8.5rem] sm:flex-1"
          onClick={onCopySms}
        >
          {t("crm.workspaceAi.copySms")}
        </button>
        <button
          type="button"
          disabled={!selectedCustomerId}
          className="min-h-[44px] w-full min-w-0 shrink-0 touch-manipulation rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[8.25rem] sm:flex-1"
          onClick={onSaveMemoToCrm}
        >
          {t("crm.workspaceAi.saveMemo")}
        </button>
        <button
          type="button"
          disabled={!selectedCustomerId || !flowDraftInsights?.nextAction?.trim()}
          className="min-h-[44px] w-full min-w-0 shrink-0 touch-manipulation rounded-[12px] border border-[#E5E7EB] bg-[#F3F4F6] px-4 text-[13px] font-semibold text-[#374151] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#E8EAED] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[8.75rem] sm:flex-1"
          onClick={onCreateFollowUpFromInsights}
        >
          {t("crm.workspaceAi.createFollowUp")}
        </button>
      </div>
    </section>
  );
}
