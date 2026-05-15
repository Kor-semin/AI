"use client";

import { useCallback, useRef, useState } from "react";

import type { TranslationKey } from "@/lib/i18n";
import type {
  Customer,
  EstimateDocumentExtraction,
  FinanceConditionDraft,
  FinanceProductMode,
  QuoteEstimateAttachmentMeta,
} from "@/app/crm/types";
import {
  CUSTOMER_PRIORITY_OPTIONS,
  defaultFinanceDraft,
  mergeExtractionIntoFinanceDraft,
} from "@/app/crm/newCarEstimateDraft";

const FINANCE_MODES: FinanceProductMode[] = ["리스", "할부", "현금", "장기렌트", "알 수 없음"];

const ACCEPT_MIME = new Set(["application/pdf", "image/png", "image/jpeg"]);
const ACCEPT_EXT = /\.(pdf|png|jpg|jpeg)$/i;

function formatMimeLabel(mime: string): string {
  if (mime === "application/pdf") return "PDF";
  if (mime === "image/png") return "PNG";
  if (mime === "image/jpeg") return "JPG";
  return mime;
}

function ftLabelKey(ft: EstimateDocumentExtraction["financeType"]): TranslationKey {
  const m: Record<EstimateDocumentExtraction["financeType"], TranslationKey> = {
    lease: "crm.newCar.ft.lease",
    loan: "crm.newCar.ft.loan",
    cash: "crm.newCar.ft.cash",
    long_rent: "crm.newCar.ft.long_rent",
    unknown: "crm.newCar.ft.unknown",
  };
  return m[ft] ?? "crm.newCar.ft.unknown";
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isImageFile(file: File): boolean {
  if (file.type === "image/png" || file.type === "image/jpeg") return true;
  return /\.(png|jpg|jpeg)$/i.test(file.name);
}

type AnalyzePhase = "idle" | "loading" | "success" | "error";

type Props = {
  customer: Customer;
  onPatch: (patch: Partial<Customer>) => void;
  t: (key: TranslationKey) => string;
};

export function NewCarEstimateFinanceCard({ customer, onPatch, t }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const draft = customer.financeConditionDraft ?? defaultFinanceDraft();
  const att = customer.quoteEstimateAttachment;

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [analyzePhase, setAnalyzePhase] = useState<AnalyzePhase>("idle");
  const [analyzeCode, setAnalyzeCode] = useState<string | null>(null);
  const [extractionPreview, setExtractionPreview] = useState<EstimateDocumentExtraction | null>(null);

  const setDraft = (patch: Partial<FinanceConditionDraft>) => {
    onPatch({ financeConditionDraft: { ...draft, ...patch } });
  };

  const toggleNeed = (label: string) => {
    const cur = new Set(customer.customerPriorityNeeds ?? []);
    if (cur.has(label)) cur.delete(label);
    else cur.add(label);
    onPatch({ customerPriorityNeeds: Array.from(cur) });
  };

  const resetAnalysisUi = useCallback(() => {
    setAnalyzePhase("idle");
    setAnalyzeCode(null);
    setExtractionPreview(null);
  }, []);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mime = file.type || "application/octet-stream";
    const okMime = ACCEPT_MIME.has(mime) || ACCEPT_EXT.test(file.name);
    if (!okMime) {
      window.alert(t("crm.newCar.estimateFileTypeError"));
      e.target.value = "";
      return;
    }
    const meta: QuoteEstimateAttachmentMeta = {
      fileName: file.name,
      mimeType: ACCEPT_MIME.has(mime) ? mime : mime || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
    };
    setPendingFile(file);
    resetAnalysisUi();
    onPatch({ quoteEstimateAttachment: meta });
    e.target.value = "";
  };

  const analyzeWithAi = useCallback(async () => {
    if (!pendingFile) return;
    if (isPdfFile(pendingFile)) {
      setAnalyzePhase("error");
      setAnalyzeCode("PDF_NOT_SUPPORTED");
      setExtractionPreview(null);
      return;
    }
    if (!isImageFile(pendingFile)) {
      setAnalyzePhase("error");
      setAnalyzeCode("UNSUPPORTED_TYPE");
      setExtractionPreview(null);
      return;
    }

    setAnalyzePhase("loading");
    setAnalyzeCode(null);
    setExtractionPreview(null);

    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      const res = await fetch("/api/estimate/analyze", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        extraction?: EstimateDocumentExtraction;
      };

      if (!data.ok) {
        setAnalyzePhase("error");
        setAnalyzeCode(data.code ?? "UNKNOWN");
        return;
      }
      if (!data.extraction) {
        setAnalyzePhase("error");
        setAnalyzeCode("PARSE_ERROR");
        return;
      }
      setExtractionPreview(data.extraction);
      setAnalyzePhase("success");
    } catch {
      setAnalyzePhase("error");
      setAnalyzeCode("NETWORK");
    }
  }, [pendingFile]);

  const applyExtraction = () => {
    if (!extractionPreview) return;
    onPatch({
      financeConditionDraft: mergeExtractionIntoFinanceDraft(draft, extractionPreview),
    });
    setExtractionPreview(null);
    setAnalyzePhase("idle");
    setAnalyzeCode(null);
  };

  const dismissExtraction = () => {
    setExtractionPreview(null);
    setAnalyzePhase("idle");
    setAnalyzeCode(null);
  };

  const removeAttachment = () => {
    setPendingFile(null);
    resetAnalysisUi();
    onPatch({ quoteEstimateAttachment: null });
  };

  const errorMessage = (() => {
    if (analyzePhase !== "error" || !analyzeCode) return null;
    switch (analyzeCode) {
      case "MISSING_AI_CONFIG":
        return t("crm.newCar.aiConfigIncomplete");
      case "PDF_NOT_SUPPORTED":
        return t("crm.newCar.pdfReadNotSupported");
      case "FILE_TOO_LARGE":
        return t("crm.newCar.fileTooLarge");
      default:
        return t("crm.newCar.aiReadFail");
    }
  })();

  const showAiButton = Boolean(pendingFile && att && isImageFile(pendingFile) && !isPdfFile(pendingFile));

  return (
    <details
      open
      className="scroll-mt-24 rounded-[22px] border border-sky-400/18 bg-gradient-to-b from-slate-950/75 to-[#07111f]/80 px-5 py-4 shadow-[0_22px_48px_-26px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm sm:p-5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 outline-none transition hover:bg-slate-950/40 focus-visible:ring-2 focus-visible:ring-sky-400/35 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold tracking-tight text-slate-50">{t("crm.newCar.cardTitle")}</div>
          <div className="mt-1 text-[13px] leading-relaxed text-slate-400">{t("crm.newCar.cardLead")}</div>
        </div>
        <span className="shrink-0 rounded-full border border-white/[0.11] bg-white/[0.07] px-3 py-1 text-[12px] font-semibold text-slate-300">
          {t("crm.newCar.detailsToggle")}
        </span>
      </summary>

      <div className="mt-4 space-y-6 border-t border-white/[0.08] pt-5">
        <section className="space-y-3">
          <h3 className="text-[14px] font-semibold text-slate-100">{t("crm.newCar.estimateTitle")}</h3>
          <p className="text-[13px] leading-relaxed text-slate-400">{t("crm.newCar.estimateDesc")}</p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="hidden"
            onChange={onPickFile}
          />
          <button
            type="button"
            className="sensora-premium-primary-workspace min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-semibold touch-manipulation"
            onClick={() => fileRef.current?.click()}
          >
            {t("crm.newCar.estimatePickFile")}
          </button>
          {att ? (
            <div className="rounded-xl border border-white/[0.11] bg-slate-950/55 px-4 py-3 text-[13px] text-slate-300">
              <div className="font-medium text-slate-100">{att.fileName}</div>
              <div className="mt-1 text-[12px] text-slate-400">
                {t("crm.newCar.estimateMetaFormat")}: {formatMimeLabel(att.mimeType)} · {t("crm.newCar.estimateMetaUploaded")}:{" "}
                {new Date(att.uploadedAt).toLocaleString("ko-KR")}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/[0.12] bg-slate-950/55 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:bg-white/[0.06]"
                  onClick={() => fileRef.current?.click()}
                >
                  {t("crm.newCar.estimateReplace")}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-400/25 bg-red-950/25 px-3 py-1.5 text-[12px] font-semibold text-red-100/95 hover:bg-red-950/40"
                  onClick={removeAttachment}
                >
                  {t("crm.newCar.estimateRemove")}
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-2 rounded-xl border border-amber-400/22 bg-amber-950/15 px-3 py-3 text-[12px] leading-relaxed text-amber-100/90">
            <p>{t("crm.newCar.disclaimerSensitive")}</p>
            <p>{t("crm.newCar.disclaimerAiReview")}</p>
            <p>{t("crm.newCar.disclaimerNoAutoSend")}</p>
          </div>

          {pendingFile && isPdfFile(pendingFile) ? (
            <p className="rounded-xl border border-sky-400/20 bg-sky-950/20 px-3 py-2 text-[12px] leading-relaxed text-sky-100/90">
              {t("crm.newCar.pdfReadNotSupported")}
            </p>
          ) : null}

          {showAiButton ? (
            <div className="space-y-3">
              <p className="rounded-xl border border-amber-400/22 bg-amber-950/15 px-3 py-2 text-[12px] leading-relaxed text-amber-100/90">
                {t("crm.newCar.extractAccuracyWarning")}
              </p>
              <button
                type="button"
                disabled={analyzePhase === "loading"}
                className="sensora-premium-primary-workspace min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-semibold touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void analyzeWithAi()}
              >
                {t("crm.newCar.aiReadButton")}
              </button>
            </div>
          ) : null}

          {analyzePhase === "loading" ? (
            <p className="text-[13px] font-medium text-slate-300">{t("crm.newCar.aiReading")}</p>
          ) : null}

          {analyzePhase === "error" && errorMessage ? (
            <p className="rounded-xl border border-red-400/25 bg-red-950/20 px-3 py-2 text-[12px] leading-relaxed text-red-100/95">{errorMessage}</p>
          ) : null}

          {analyzePhase === "success" && extractionPreview ? (
            <div className="rounded-[16px] border border-emerald-400/25 bg-emerald-950/15 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h4 className="text-[14px] font-semibold text-emerald-50">{t("crm.newCar.extractPreviewTitle")}</h4>
              <p className="mt-2 text-[12px] leading-relaxed text-emerald-100/85">{t("crm.newCar.extractPreviewLead")}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-amber-100/90">{t("crm.newCar.extractAccuracyWarning")}</p>

              <dl className="mt-4 space-y-2 divide-y divide-white/[0.06] text-[13px]">
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.vehicleName")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.vehicleName.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.trim")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.trim.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.financeType")}</dt>
                  <dd className="text-right text-slate-100">{t(ftLabelKey(extractionPreview.financeType))}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.totalVehiclePrice")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.totalVehiclePrice.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.promotion")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.promotion.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.prepayment")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.prepayment.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.deposit")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.deposit.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.termMonths")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.termMonths.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.residualValue")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.residualValue.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.monthlyPayment")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.monthlyPayment.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.endOption")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.endOption.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.memo")}</dt>
                  <dd className="text-right text-slate-100">{extractionPreview.memo.trim() || "—"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-2">
                  <dt className="text-slate-400">{t("crm.newCar.extractLabel.reviewFlag")}</dt>
                  <dd className="text-right text-slate-100">
                    {extractionPreview.needsReview ? t("crm.newCar.extractNeedsReviewYes") : t("crm.newCar.extractNeedsReviewNo")}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="sensora-premium-primary-workspace min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-semibold touch-manipulation"
                  onClick={applyExtraction}
                >
                  {t("crm.newCar.applyExtracted")}
                </button>
                <button
                  type="button"
                  className="sensora-dark-ghost-btn min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-semibold touch-manipulation"
                  onClick={dismissExtraction}
                >
                  {t("crm.newCar.dismissExtracted")}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <h3 className="text-[14px] font-semibold text-slate-100">{t("crm.newCar.financeFormTitle")}</h3>
          <div>
            <div className="text-[12px] font-semibold text-slate-300">{t("crm.newCar.financeModeLabel")}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {FINANCE_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={[
                    "rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                    draft.productMode === m
                      ? "border-sky-400/45 bg-sky-500/12 text-slate-50"
                      : "border-white/[0.11] bg-slate-950/55 text-slate-300 hover:bg-white/[0.08]",
                  ].join(" ")}
                  onClick={() => setDraft({ productMode: m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.1] bg-slate-950/45 px-3 py-3 text-[12px] leading-relaxed text-slate-400">
            {draft.productMode === "리스" ? (
              <p className="whitespace-pre-line">{t("crm.newCar.leaseHintBullets")}</p>
            ) : draft.productMode === "할부" ? (
              <p className="whitespace-pre-line">{t("crm.newCar.loanHintBullets")}</p>
            ) : draft.productMode === "알 수 없음" ? (
              <p className="whitespace-pre-line">{t("crm.newCar.unknownModeHint")}</p>
            ) : (
              <p>{t("crm.newCar.otherModeHint")}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">차량명</span>
              <input
                value={draft.vehicleName ?? ""}
                onChange={(e) => setDraft({ vehicleName: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="예: 그랜저 하이브리드"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">트림</span>
              <input
                value={draft.vehicleTrim ?? ""}
                onChange={(e) => setDraft({ vehicleTrim: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="예: 캘리그래피"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">총 차량가</span>
              <input
                value={draft.totalVehiclePrice ?? ""}
                onChange={(e) => setDraft({ totalVehiclePrice: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="예: 4,200만원"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">프로모션/할인</span>
              <input
                value={draft.promotionOrDiscount ?? ""}
                onChange={(e) => setDraft({ promotionOrDiscount: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="예: 출고 지원금"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">선납금</span>
              <input
                value={draft.downPayment ?? ""}
                onChange={(e) => setDraft({ downPayment: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">보증금</span>
              <input
                value={draft.deposit ?? ""}
                onChange={(e) => setDraft({ deposit: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">계약기간</span>
              <input
                value={draft.contractMonths ?? ""}
                onChange={(e) => setDraft({ contractMonths: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="예: 48개월"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">잔존가치</span>
              <input
                value={draft.residualValue ?? ""}
                onChange={(e) => setDraft({ residualValue: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[12px] font-semibold text-slate-400">월 납입금</span>
              <input
                value={draft.monthlyPayment ?? ""}
                onChange={(e) => setDraft({ monthlyPayment: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="견적서 기준 참고"
              />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-[12px] font-semibold text-slate-400">만기 선택지</span>
              <input
                value={draft.maturityOptions ?? ""}
                onChange={(e) => setDraft({ maturityOptions: e.target.value })}
                className="sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="예: 인수/반납 검토"
              />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-[12px] font-semibold text-slate-400">고객이 중요하게 본 조건</span>
              <textarea
                value={draft.customerConditionNote ?? ""}
                onChange={(e) => setDraft({ customerConditionNote: e.target.value })}
                rows={2}
                className="sensora-premium-input min-h-[72px] resize-y rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100"
                placeholder="예: 월 납입 부담, 초기비용, 출고 시점"
              />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[14px] font-semibold text-slate-100">{t("crm.newCar.prioritySectionTitle")}</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CUSTOMER_PRIORITY_OPTIONS.map((opt) => {
              const on = (customer.customerPriorityNeeds ?? []).includes(opt);
              return (
                <label
                  key={opt}
                  className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/[0.1] bg-slate-950/45 px-3 py-2.5 text-[13px] text-slate-200 hover:bg-white/[0.04]"
                >
                  <input type="checkbox" checked={on} onChange={() => toggleNeed(opt)} className="mt-0.5" />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </details>
  );
}
