"use client";

import { useRef, useState } from "react";

import type { TranslationKey } from "@/lib/i18n";
import type { Customer, CustomerEstimateAttachment, FinanceConditionDraft, FinanceProductMode } from "@/app/crm/types";
import {
  deleteCustomerEstimateStorageObject,
  refreshCustomerEstimateDownloadUrl,
  uploadCustomerEstimateFile,
} from "@/app/crm/storage";
import { makeId } from "@/app/crm/seed";
import { CUSTOMER_PRIORITY_OPTIONS, defaultFinanceDraft, sortedEstimateAttachments } from "@/app/crm/newCarEstimateDraft";

const FINANCE_MODES: FinanceProductMode[] = ["리스", "할부", "현금", "장기렌트", "알 수 없음"];

const ACCEPT_MIME = new Set(["application/pdf", "image/png", "image/jpeg"]);
const ACCEPT_EXT = /\.(pdf|png|jpg|jpeg)$/i;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

function formatMimeLabel(mime: string): string {
  if (mime === "application/pdf") return "PDF";
  if (mime === "image/png") return "PNG";
  if (mime === "image/jpeg") return "JPG";
  return mime;
}

function formatBytes(n: number): string {
  if (n == null || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  uid?: string | null;
  customer: Customer;
  onPatch: (patch: Partial<Customer>) => void;
  onRequireLogin: () => void;
  t: (key: TranslationKey) => string;
};

export function NewCarEstimateFinanceCard({ uid, customer, onPatch, onRequireLogin, t }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const draft = customer.financeConditionDraft ?? defaultFinanceDraft();
  const list = sortedEstimateAttachments(customer);

  const setDraft = (patch: Partial<FinanceConditionDraft>) => {
    onPatch({ financeConditionDraft: { ...draft, ...patch } });
  };

  const toggleNeed = (label: string) => {
    const cur = new Set(customer.customerPriorityNeeds ?? []);
    if (cur.has(label)) cur.delete(label);
    else cur.add(label);
    onPatch({ customerPriorityNeeds: Array.from(cur) });
  };

  const resolveUrl = async (att: CustomerEstimateAttachment): Promise<string | null> => {
    if (att.downloadUrl) return att.downloadUrl;
    if (!att.storagePath) return null;
    try {
      return await refreshCustomerEstimateDownloadUrl(att.storagePath);
    } catch {
      return null;
    }
  };

  const openAttachment = async (att: CustomerEstimateAttachment) => {
    const u = await resolveUrl(att);
    if (u) window.open(u, "_blank", "noopener,noreferrer");
    else window.alert(t("crm.newCar.uploadFailed"));
  };

  const downloadAttachment = async (att: CustomerEstimateAttachment) => {
    const u = await resolveUrl(att);
    if (!u) {
      window.alert(t("crm.newCar.uploadFailed"));
      return;
    }
    const a = document.createElement("a");
    a.href = u;
    a.download = att.fileName || "estimate";
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const shareAttachment = async (att: CustomerEstimateAttachment) => {
    const u = await resolveUrl(att);
    if (!u) {
      window.alert(t("crm.newCar.shareUnavailable"));
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({ title: att.fileName, text: att.fileName, url: u });
        return;
      }
    } catch {
      /* user cancel or unsupported */
    }
    window.alert(t("crm.newCar.shareUnavailable"));
  };

  const removeAttachment = async (att: CustomerEstimateAttachment) => {
    if (att.storagePath) {
      try {
        await deleteCustomerEstimateStorageObject(att.storagePath);
      } catch {
        /* Storage rules or network — still remove from CRM list */
      }
    }
    const next = (customer.estimateAttachments ?? []).filter((a) => a.id !== att.id);
    const patch: Partial<Customer> = { estimateAttachments: next };
    if (customer.smsDraftEstimateAttachmentId === att.id) {
      patch.smsDraftEstimateAttachmentId = null;
    }
    onPatch(patch);
  };

  const pickAddOrReplace = () => {
    if (!uid) {
      onRequireLogin();
      return;
    }
    fileRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!uid) {
      onRequireLogin();
      return;
    }
    const mime = file.type || "application/octet-stream";
    if (!ACCEPT_MIME.has(mime) && !ACCEPT_EXT.test(file.name)) {
      window.alert(t("crm.newCar.estimateFileTypeError"));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      window.alert(t("crm.newCar.uploadFailed"));
      return;
    }

    setBusy(true);
    try {
      const id = makeId("est");
      const { storagePath, downloadUrl } = await uploadCustomerEstimateFile(uid, customer.id, file, id);
      const rec: CustomerEstimateAttachment = {
        id,
        fileName: file.name,
        contentType: ACCEPT_MIME.has(mime) ? mime : mime || "application/octet-stream",
        size: file.size,
        storagePath,
        downloadUrl,
        createdAt: new Date().toISOString(),
      };

      let base = [...(customer.estimateAttachments ?? [])];
      if (replaceId) {
        const old = base.find((a) => a.id === replaceId);
        if (old?.storagePath) {
          try {
            await deleteCustomerEstimateStorageObject(old.storagePath);
          } catch {
            /* ignore */
          }
        }
        base = base.filter((a) => a.id !== replaceId);
        setReplaceId(null);
      }
      onPatch({ estimateAttachments: [...base, rec], quoteEstimateAttachment: null });
    } catch {
      window.alert(t("crm.newCar.uploadFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <details
        id="crm-estimate-vault-section"
        className="scroll-mt-24 rounded-[22px] border border-white/[0.1] bg-slate-950/45 px-5 py-4 sm:p-5"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 outline-none transition hover:bg-slate-950/40 focus-visible:ring-2 focus-visible:ring-sky-400/35 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight text-slate-50">{t("crm.newCar.vaultTitle")}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-slate-500">{t("crm.newCar.vaultDesc")}</div>
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-[12px] font-semibold text-slate-400">
            {t("crm.newCar.detailsToggle")}
          </span>
        </summary>

        <div className="mt-4 space-y-4 border-t border-white/[0.07] pt-4">
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" className="hidden" onChange={(e) => void onFileChange(e)} />

          <button
            type="button"
            disabled={busy}
            className="sensora-premium-primary-workspace min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-semibold touch-manipulation disabled:opacity-50"
            onClick={() => {
              setReplaceId(null);
              pickAddOrReplace();
            }}
          >
            {t("crm.newCar.vaultAddButton")}
          </button>

          <div className="rounded-xl border border-amber-400/14 bg-amber-950/10 px-3 py-2.5 text-[12px] leading-relaxed text-amber-50/88">
            <p>{t("crm.newCar.disclaimerSensitive")}</p>
            <p className="mt-1.5 text-[11px] text-slate-500">{t("crm.newCar.disclaimerNoAutoSend")}</p>
          </div>

          {!uid ? <p className="text-[12px] text-slate-500">{t("crm.newCar.uploadNeedsLogin")}</p> : null}

          <div className="space-y-3">
            {list.length === 0 ? (
              <p className="text-[14px] text-slate-500">등록된 견적서 파일이 없습니다. 필요할 때 PDF·이미지를 추가해 주세요.</p>
            ) : (
              list.map((att) => (
                <div
                  key={att.id}
                  className="rounded-xl border border-white/[0.1] bg-slate-950/50 px-4 py-3 text-[13px] text-slate-300"
                >
                  <div className="font-medium text-slate-100">{att.fileName}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-slate-500">
                    <span>
                      {t("crm.newCar.estimateMetaFormat")}: {formatMimeLabel(att.contentType)}
                    </span>
                    <span>
                      {t("crm.newCar.estimateMetaUploaded")}: {new Date(att.createdAt).toLocaleString("ko-KR")}
                    </span>
                    <span>
                      {t("crm.newCar.vaultFileSize")}: {formatBytes(att.size)}
                    </span>
                    {!att.storagePath ? (
                      <span className="text-amber-200/80">({t("crm.newCar.uploadNeedsLogin")})</span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-white/[0.1] bg-slate-950/55 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:bg-white/[0.06]"
                      onClick={() => void openAttachment(att)}
                    >
                      {t("crm.newCar.vaultOpen")}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/[0.1] bg-slate-950/55 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:bg-white/[0.06]"
                      onClick={() => void downloadAttachment(att)}
                    >
                      {t("crm.newCar.vaultDownload")}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/[0.1] bg-slate-950/55 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:bg-white/[0.06]"
                      onClick={() => void shareAttachment(att)}
                    >
                      {t("crm.newCar.vaultShare")}
                    </button>
                    <button
                      type="button"
                      disabled={!uid || busy}
                      className="rounded-lg border border-white/[0.1] bg-slate-950/55 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:bg-white/[0.06] disabled:opacity-45"
                      onClick={() => {
                        setReplaceId(att.id);
                        pickAddOrReplace();
                      }}
                    >
                      {t("crm.newCar.estimateReplace")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-lg border border-red-400/22 bg-red-950/22 px-3 py-1.5 text-[12px] font-semibold text-red-100/95 hover:bg-red-950/35"
                      onClick={() => void removeAttachment(att)}
                    >
                      {t("crm.newCar.estimateRemove")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <details className="rounded-lg border border-white/[0.06] bg-slate-950/30 px-3 py-2">
            <summary className="cursor-pointer text-[11px] font-semibold text-slate-500">저장·삭제 안내</summary>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{t("crm.newCar.disclaimerVault")}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{t("crm.newCar.disclaimerVaultSecondary")}</p>
          </details>
        </div>
      </details>

      <details className="scroll-mt-24 rounded-[22px] border border-white/[0.1] bg-slate-950/45 px-5 py-4 sm:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 outline-none transition hover:bg-slate-950/40 focus-visible:ring-2 focus-visible:ring-sky-400/35 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight text-slate-50">{t("crm.newCar.financeCardTitle")}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-slate-500">{t("crm.newCar.cardLead")}</div>
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-[12px] font-semibold text-slate-400">
            {t("crm.newCar.detailsToggle")}
          </span>
        </summary>

        <div className="mt-4 space-y-6 border-t border-white/[0.07] pt-5">
          <p className="text-[12px] leading-relaxed text-slate-500">{t("crm.newCar.disclaimerAiReview")}</p>

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

          <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 px-3 py-3 text-[12px] leading-relaxed text-slate-400">
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

          <section className="space-y-3">
            <h3 className="text-[14px] font-semibold text-slate-100">{t("crm.newCar.prioritySectionTitle")}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CUSTOMER_PRIORITY_OPTIONS.map((opt) => {
                const on = (customer.customerPriorityNeeds ?? []).includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/[0.08] bg-slate-950/40 px-3 py-2.5 text-[13px] text-slate-200 hover:bg-white/[0.04]"
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
    </div>
  );
}
