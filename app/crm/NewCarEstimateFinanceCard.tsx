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
import { normalizeKoreanVehicleSpelling } from "@/app/crm/customerContextDraft";
import {
  CUSTOMER_PRIORITY_OPTIONS,
  defaultFinanceDraft,
  financeFieldLabel,
  financeFieldPlaceholder,
  financeFieldsForMode,
  sortedEstimateAttachments,
  type FinanceFieldId,
} from "@/app/crm/newCarEstimateDraft";

const FINANCE_MODES: FinanceProductMode[] = ["리스", "할부", "현금", "장기렌트", "알 수 없음"];

const FINANCE_INPUT_CLASS =
  "sensora-premium-input rounded-xl border border-white/[0.12] bg-slate-950/55 px-3 py-2 text-[14px] text-slate-100";
const FINANCE_LABEL_CLASS = "text-[12px] font-semibold text-slate-400";

function financeHintKey(mode: FinanceProductMode): TranslationKey {
  if (mode === "리스") return "crm.newCar.leaseHintBullets";
  if (mode === "할부") return "crm.newCar.loanHintBullets";
  if (mode === "장기렌트") return "crm.newCar.longRentHintBullets";
  if (mode === "현금") return "crm.newCar.cashHintBullets";
  if (mode === "알 수 없음") return "crm.newCar.unknownModeHint";
  return "crm.newCar.otherModeHint";
}

function FinanceDraftField({
  field,
  mode,
  draft,
  onChange,
}: {
  field: FinanceFieldId;
  mode: FinanceProductMode;
  draft: FinanceConditionDraft;
  onChange: (patch: Partial<FinanceConditionDraft>) => void;
}) {
  const value = (draft[field] as string | undefined) ?? "";
  const label = financeFieldLabel(field, mode);
  const placeholder = financeFieldPlaceholder(field, mode);
  const isNote = field === "customerConditionNote";

  if (isNote) {
    return (
      <label className="grid gap-1 sm:col-span-2">
        <span className={FINANCE_LABEL_CLASS}>{label}</span>
        <textarea
          value={value}
          onChange={(e) => onChange({ customerConditionNote: e.target.value })}
          rows={3}
          className={`${FINANCE_INPUT_CLASS} min-h-[80px] resize-y`}
          placeholder={placeholder}
        />
      </label>
    );
  }

  return (
    <label className="grid gap-1">
      <span className={FINANCE_LABEL_CLASS}>{label}</span>
      <input
        value={value}
        onChange={(e) => {
          const next =
            field === "vehicleName" || field === "vehicleTrim"
              ? normalizeKoreanVehicleSpelling(e.target.value)
              : e.target.value;
          onChange({ [field]: next } as Partial<FinanceConditionDraft>);
        }}
        className={FINANCE_INPUT_CLASS}
        placeholder={placeholder}
      />
    </label>
  );
}

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

      <section
        id="crm-finance-condition-section"
        className="crm-finance-condition-form scroll-mt-24 rounded-[22px] border border-white/[0.1] bg-slate-950/45 px-5 py-4 sm:p-5"
      >
        <header>
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-50">{t("crm.newCar.financeFormTitle")}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{t("crm.newCar.financeFormLead")}</p>
        </header>

        <div className="mt-4 space-y-5 border-t border-white/[0.07] pt-4">
          <div>
            <div className={FINANCE_LABEL_CLASS}>{t("crm.newCar.financeModeLabel")}</div>
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

          <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 px-3 py-2.5 text-[12px] leading-relaxed text-slate-400">
            <p>{t(financeHintKey(draft.productMode))}</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {financeFieldsForMode(draft.productMode).map((field) => (
              <FinanceDraftField key={field} field={field} mode={draft.productMode} draft={draft} onChange={setDraft} />
            ))}
          </div>

          <section className="space-y-2.5 rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 py-3 sm:px-4">
            <h3 className="text-[14px] font-semibold text-slate-100">{t("crm.newCar.prioritySectionTitle")}</h3>
            <p className="text-[12px] leading-relaxed text-slate-500">{t("crm.newCar.priorityReflectHint")}</p>
            <div className="crm-finance-priority-grid">
              {CUSTOMER_PRIORITY_OPTIONS.map((opt) => {
                const on = (customer.customerPriorityNeeds ?? []).includes(opt);
                return (
                  <label
                    key={opt}
                    className="crm-finance-priority-chip flex cursor-pointer items-start gap-2 rounded-lg border border-white/[0.08] bg-slate-950/40 text-slate-200 hover:bg-white/[0.04]"
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleNeed(opt)} className="mt-0.5 shrink-0" />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <p className="text-[11px] leading-relaxed text-slate-500">{t("crm.newCar.disclaimerAiReview")}</p>
        </div>
      </section>
    </div>
  );
}
