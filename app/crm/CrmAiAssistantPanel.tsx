"use client";

import { useMemo } from "react";

import type { DemoConsultingResponse, DemoSalesStyle } from "@/app/components/concierge/aiDemoResponse";
import type { TranslationKey } from "@/lib/i18n";
import type { Customer, CustomerEstimateAttachment } from "@/app/crm/types";
import { refreshCustomerEstimateDownloadUrl } from "@/app/crm/storage";
import { resolveSmsDraftEstimateAttachment, sortedEstimateAttachments } from "@/app/crm/newCarEstimateDraft";

const WORKSPACE_AI_STYLE_KEYS: Record<DemoSalesStyle, TranslationKey> = {
  polite: "landing.aiDemo.salesStyle.polite",
  simple: "landing.aiDemo.salesStyle.simple",
  premium: "landing.aiDemo.salesStyle.premium",
  friendly: "landing.aiDemo.salesStyle.friendly",
  active: "landing.aiDemo.salesStyle.active",
};
const WORKSPACE_AI_STYLE_ORDER: DemoSalesStyle[] = ["polite", "simple", "premium", "friendly", "active"];

const SENSORA_FLOW_AI_BADGE =
  "inline-flex shrink-0 items-center rounded-full border border-sky-400/28 bg-gradient-to-r from-sky-500/18 to-violet-500/12 px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.11em] text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";

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
  newCarFinanceSmsPreview: string;
  onCopyNewCarFinanceSms: () => void;
  selectedCustomer: Customer | null;
  onPatchSelectedCustomer: (patch: Partial<Customer>) => void;
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
  newCarFinanceSmsPreview,
  onCopyNewCarFinanceSms,
  selectedCustomer,
  onPatchSelectedCustomer,
}: CrmAiAssistantPanelProps) {
  const ft = flowDraftMemo.trim();
  const rewriteDisabled =
    !selectedCustomerId || !(ft.length > 0 ? true : workspaceAiMemoDraft.trim().length > 0);

  const estimateList = useMemo(
    () => (selectedCustomer ? sortedEstimateAttachments(selectedCustomer) : []),
    [selectedCustomer],
  );
  const pickedEstimate = useMemo(
    () => (selectedCustomer ? resolveSmsDraftEstimateAttachment(selectedCustomer) : null),
    [selectedCustomer],
  );

  const resolveEstimateUrl = async (att: CustomerEstimateAttachment) => {
    if (att.downloadUrl) return att.downloadUrl;
    if (!att.storagePath) return null;
    try {
      return await refreshCustomerEstimateDownloadUrl(att.storagePath);
    } catch {
      return null;
    }
  };

  const inputCls =
    "sensora-premium-input min-h-[46px] w-full rounded-[14px] px-3.5 py-3 text-[15px] font-medium";

  const insightTileCls =
    "sensora-premium-card flex min-h-0 min-w-0 flex-col rounded-[16px] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

  return (
    <section
      id="crm-ai-assistant"
      tabIndex={-1}
      className="sensora-premium-card scroll-mt-[max(7rem,calc(5rem+env(safe-area-inset-top,0px)))] rounded-[22px] px-5 py-5 sm:px-6"
      aria-labelledby="crm-ai-assistant-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.1] pb-4">
        <div className="min-w-0">
          <h2 id="crm-ai-assistant-title" className="text-[18px] font-semibold tracking-tight text-slate-50">
            {t("crm.workspaceAi.title")}
          </h2>
          <p className="mt-1.5 max-w-[58ch] text-[14px] leading-relaxed text-slate-400">
            {t("crm.workspaceAi.subtitle")}
          </p>
          <p className="mt-3 max-w-[72ch] rounded-[12px] border border-white/[0.1] bg-[#020817]/52 px-3 py-2 text-[11px] leading-snug text-slate-400">
            {t("crm.sensoraFlow.banner")}
          </p>
        </div>
        {workspaceAiBusy && selectedCustomerId ? (
          <span className="shrink-0 text-[12px] font-semibold text-slate-400" aria-live="polite">
            {t("crm.workspaceAi.analyzing")}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-slate-300">{t("crm.workspaceAi.customerPickLabel")}</span>
            <select
              value={selectedCustomerId ?? ""}
              onChange={(e) => onCustomerIdChange(e.target.value ? e.target.value : null)}
              className={`${inputCls} cursor-pointer`}
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
            <p className="rounded-[14px] border border-dashed border-white/[0.14] bg-slate-950/35 px-3 py-2 text-[13px] text-slate-400">
              {t("crm.workspaceAi.pickCustomer")}
            </p>
          ) : null}
          <label className="grid gap-1.5">
            <span className="text-[12px] font-semibold text-slate-300">{t("crm.workspaceAi.toneLabel")}</span>
            <select
              value={workspaceSalesStyle}
              onChange={(e) => onWorkspaceSalesStyleChange(e.target.value as DemoSalesStyle)}
              disabled={!selectedCustomerId}
              className={`${inputCls} cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-950/25 disabled:opacity-60`}
              aria-label={t("crm.workspaceAi.toneLabel")}
            >
              {WORKSPACE_AI_STYLE_ORDER.map((sid) => (
                <option key={sid} value={sid}>
                  {t(WORKSPACE_AI_STYLE_KEYS[sid])}
                </option>
              ))}
            </select>
          </label>
          <p className="rounded-[12px] border border-dashed border-white/[0.1] bg-[#020817]/40 px-2 py-2 text-[11px] leading-snug text-slate-500">
            {t("crm.sensoraFlow.toneHintsReanalyze")}
          </p>
        </div>
        <div className="grid min-h-0 gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[13px] font-semibold text-slate-200">{t("crm.workspaceAi.memoLabel")}</span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-slate-300">
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
            className={`${inputCls} min-h-[180px] w-full resize-y leading-relaxed disabled:cursor-not-allowed disabled:opacity-55`}
            placeholder=""
          />
          {memoDiffersFromFlowSnapshot && selectedCustomerId ? (
            <p className="rounded-[12px] border border-dashed border-amber-400/35 bg-amber-950/25 px-3 py-2 text-[12px] font-medium leading-snug text-amber-100/95">
              {t("crm.sensoraFlow.memoStaleHint")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={`${insightTileCls}`}>
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                {t("crm.workspaceAi.consultSummaryHeading")}
              </div>
              <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">
                {t("crm.workspaceAi.consultSummaryLead")}
              </p>
            </div>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words whitespace-pre-line text-[14px] leading-relaxed text-slate-100">
            {flowDraftInsights ? flowDraftInsights.summary : "—"}
          </div>
        </div>

        <div className={`${insightTileCls} border-sky-400/15 bg-gradient-to-br from-sky-950/25 via-slate-950/45 to-violet-950/15 ring-1 ring-inset ring-sky-400/08`}>
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                {t("crm.workspaceAi.needsHeading")}
              </div>
              <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">{t("crm.workspaceAi.customerNeedsHelper")}</p>
            </div>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words text-[14px] leading-relaxed text-slate-100">
            {workspaceAiCoachTopics ? (
              <p className="whitespace-pre-line font-medium text-slate-50">{workspaceAiCoachTopics}</p>
            ) : flowDraftInsights ? (
              <p className="text-[13px] italic text-slate-500">{t("crm.workspaceAi.customerNeedsPlaceholder")}</p>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
        </div>

        <div className={`${insightTileCls}`}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
              {t("crm.workspaceAi.salesHeading")}
            </h3>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">{t("crm.workspaceAi.nextActionLead")}</p>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words whitespace-pre-line text-[14px] leading-relaxed text-slate-100">
            {flowDraftInsights ? flowDraftInsights.nextAction : "—"}
          </div>
        </div>

        <div className={`${insightTileCls}`}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">{t("crm.workspaceAi.smsHeading")}</h3>
            <span className={SENSORA_FLOW_AI_BADGE}>{t("crm.sensoraFlow.aiSuggestionBadge")}</span>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">{t("crm.workspaceAi.smsDraftLead")}</p>
          <div className="mt-3 max-h-[min(220px,42vh)] min-h-[88px] flex-1 overflow-y-auto break-words whitespace-pre-line text-[15px] leading-[1.65] text-slate-100">
            {flowDraftInsights ? flowDraftInsights.message : "—"}
          </div>
        </div>

        <div className={`${insightTileCls} sm:col-span-2 border-emerald-400/12 ring-1 ring-inset ring-emerald-400/08`}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
              {t("crm.workspaceAi.newCarFinanceHeading")}
            </h3>
            <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              {t("crm.sensoraFlow.aiSuggestionBadge")}
            </span>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500">{t("crm.workspaceAi.newCarFinanceLead")}</p>
          <div className="mt-3 max-h-[min(260px,48vh)] min-h-[88px] flex-1 overflow-y-auto break-words whitespace-pre-line text-[15px] leading-[1.65] text-slate-100">
            {newCarFinanceSmsPreview.trim() ? newCarFinanceSmsPreview : t("crm.workspaceAi.newCarFinanceEmpty")}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{t("crm.workspaceAi.estimateAttachShortNote")}</p>
        </div>

        {selectedCustomerId && selectedCustomer ? (
          <div className={`${insightTileCls} sm:col-span-2 border-white/[0.08] bg-slate-950/35`}>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
              {t("crm.workspaceAi.estimateSmsOptionsTitle")}
            </h3>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-[13px] text-slate-200">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean(selectedCustomer.smsDraftIncludeEstimateWording)}
                onChange={(e) => onPatchSelectedCustomer({ smsDraftIncludeEstimateWording: e.target.checked })}
              />
              <span>{t("crm.newCar.smsAttachIncludeLabel")}</span>
            </label>
            <label className="mt-3 grid gap-1.5">
              <span className="text-[12px] font-semibold text-slate-400">{t("crm.newCar.smsAttachPickLabel")}</span>
              <select
                disabled={!selectedCustomer.smsDraftIncludeEstimateWording}
                className={`${inputCls} cursor-pointer disabled:cursor-not-allowed disabled:opacity-45`}
                value={
                  selectedCustomer.smsDraftEstimateAttachmentId === "__none__"
                    ? "__none__"
                    : selectedCustomer.smsDraftEstimateAttachmentId ?? ""
                }
                onChange={(e) => {
                  const v = e.target.value;
                  onPatchSelectedCustomer({
                    smsDraftEstimateAttachmentId: v === "" ? null : v,
                  });
                }}
              >
                <option value="">{t("crm.newCar.smsAttachOptionLatest")}</option>
                {estimateList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fileName}
                  </option>
                ))}
                <option value="__none__">{t("crm.newCar.smsAttachOptionNone")}</option>
              </select>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!pickedEstimate || (!pickedEstimate.downloadUrl && !pickedEstimate.storagePath)}
                className="sensora-dark-ghost-btn min-h-[40px] rounded-xl px-3 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => {
                  if (!pickedEstimate) return;
                  void (async () => {
                    const u = await resolveEstimateUrl(pickedEstimate);
                    if (u) window.open(u, "_blank", "noopener,noreferrer");
                    else window.alert(t("crm.newCar.shareUnavailable"));
                  })();
                }}
              >
                {t("crm.workspaceAi.estimateOpen")}
              </button>
              <button
                type="button"
                disabled={!pickedEstimate || (!pickedEstimate.downloadUrl && !pickedEstimate.storagePath)}
                className="sensora-dark-ghost-btn min-h-[40px] rounded-xl px-3 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => {
                  if (!pickedEstimate) return;
                  void (async () => {
                    const u = await resolveEstimateUrl(pickedEstimate);
                    if (!u) {
                      window.alert(t("crm.newCar.shareUnavailable"));
                      return;
                    }
                    const a = document.createElement("a");
                    a.href = u;
                    a.download = pickedEstimate.fileName || "estimate";
                    a.rel = "noopener noreferrer";
                    a.target = "_blank";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  })();
                }}
              >
                {t("crm.workspaceAi.estimateDownload")}
              </button>
              <button
                type="button"
                disabled={!pickedEstimate || (!pickedEstimate.downloadUrl && !pickedEstimate.storagePath)}
                className="sensora-dark-ghost-btn min-h-[40px] rounded-xl px-3 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => {
                  if (!pickedEstimate) return;
                  void (async () => {
                    const u = await resolveEstimateUrl(pickedEstimate);
                    if (!u) {
                      window.alert(t("crm.newCar.shareUnavailable"));
                      return;
                    }
                    try {
                      if (navigator.share) {
                        await navigator.share({ title: pickedEstimate.fileName, url: u });
                        return;
                      }
                    } catch {
                      /* cancelled */
                    }
                    window.alert(t("crm.newCar.shareUnavailable"));
                  })();
                }}
              >
                {t("crm.workspaceAi.estimateShare")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedCustomerId && !flowDraftInsights ? (
        <p className="mt-4 text-[12px] leading-snug text-slate-500">{t("crm.sensoraFlow.previewEmptyHint")}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/[0.09] pt-5">
        <button
          type="button"
          disabled={!selectedCustomerId || !workspaceAiMemoDraft.trim()}
          className="sensora-premium-primary-workspace min-h-[44px] touch-manipulation rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onAnalyzeOrRefresh}
        >
          {t("crm.sensoraFlow.analyzeAgain")}
        </button>
        <button
          type="button"
          disabled={!selectedCustomerId || !workspaceAiMemoDraft.trim()}
          className="sensora-dark-ghost-btn min-h-[44px] touch-manipulation rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onNewProposal}
        >
          {t("crm.sensoraFlow.newProposal")}
        </button>
        <button
          type="button"
          disabled={rewriteDisabled}
          className="sensora-dark-ghost-btn min-h-[44px] touch-manipulation rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onRewriteSmsDraft}
        >
          {t("crm.sensoraFlow.rewriteSms")}
        </button>
      </div>

      <p className="mt-5 max-w-[68ch] text-[12px] leading-relaxed text-slate-500">{t("crm.sensoraFlow.appliedEditableHint")}</p>

      <div className="sticky bottom-1 z-[3] mt-6 flex w-full max-w-full min-w-0 flex-col gap-2 rounded-[14px] border border-white/[0.11] bg-[#07111f]/88 px-3 py-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-md sm:flex-row sm:flex-wrap sm:items-stretch">
        <button
          type="button"
          disabled={!selectedCustomerId || !flowDraftInsights || !flowDraftInsights.message.trim()}
          className="sensora-premium-primary-workspace min-h-[44px] w-full min-w-0 shrink-0 touch-manipulation rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[8.5rem] sm:flex-1"
          onClick={onCopySms}
        >
          {t("crm.workspaceAi.copySms")}
        </button>
        <button
          type="button"
          disabled={!selectedCustomerId || !newCarFinanceSmsPreview.trim()}
          className="sensora-dark-ghost-btn min-h-[44px] w-full min-w-0 shrink-0 touch-manipulation rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[9rem] sm:flex-1"
          onClick={onCopyNewCarFinanceSms}
        >
          {t("crm.workspaceAi.copyNewCarFinance")}
        </button>
        <button
          type="button"
          disabled={!selectedCustomerId}
          className="sensora-dark-ghost-btn min-h-[44px] w-full min-w-0 shrink-0 touch-manipulation rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[8.25rem] sm:flex-1"
          onClick={onSaveMemoToCrm}
        >
          {t("crm.workspaceAi.saveMemo")}
        </button>
        <button
          type="button"
          disabled={!selectedCustomerId || !flowDraftInsights?.nextAction?.trim()}
          className="sensora-dark-ghost-btn min-h-[44px] w-full min-w-0 shrink-0 touch-manipulation rounded-xl px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[8.75rem] sm:flex-1"
          onClick={onCreateFollowUpFromInsights}
        >
          {t("crm.workspaceAi.createFollowUp")}
        </button>
      </div>
    </section>
  );
}
