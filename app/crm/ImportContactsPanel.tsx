"use client";

import type { Customer } from "@/app/crm/types";
import { CONTACT_SYNC_SOURCES } from "@/app/crm/contactSyncSources";
import { detectDuplicateForImport, type DuplicateInfo } from "@/app/crm/contactImport/detectDuplicateContacts";
import {
  dedupeImportBatch,
  normalizeImportedContact,
  phoneMatchKey,
  type NormalizedImportedContact,
} from "@/app/crm/contactImport/normalizeImportedContact";
import { parseCsvContactsText } from "@/app/crm/contactImport/parseCsvContacts";
import { parseVcfContactsText } from "@/app/crm/contactImport/parseVcfContacts";
import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";

/** 2차 확장: Google People API OAuth 동기화 — 이번 배포 범위에서는 CSV/vCard 내보내기만 지원 */

export type ImportContactsCommitPayload = {
  creates: Customer[];
  merges: { customerId: string; memoAppend: string }[];
};

export type ImportContactsPanelProps = {
  open: boolean;
  onClose: () => void;
  existingCustomers: Customer[];
  onCommit: (payload: ImportContactsCommitPayload) => void;
  makeId: (prefix: string) => string;
  buildCustomer: (draft: NormalizedImportedContact) => Customer;
  showToast: (msg: string) => void;
  /** CSV/VCF 연락처 파일 준비 방법 안내(모달 등) — 오버레이 클릭 전파 방지는 호출부·클릭 핸들러에서 처리 */
  onOpenFileGuide?: () => void;
};

type HubTab = "device" | "paste" | "file" | "google" | "iphone";

type PreviewRow = {
  key: string;
  draft: NormalizedImportedContact;
  duplicate: DuplicateInfo;
  include: boolean;
  resolution: "add_new" | "skip" | "merge_memo";
};

const IMPORT_PRIVACY_POINTS = [
  "Sensora는 사용자가 직접 선택한 연락처만 가져옵니다.",
  "가져온 정보는 저장 전 사용자가 확인할 수 있습니다.",
  "AI는 고객 정보를 임의로 수정하거나 덮어쓰지 않습니다.",
] as const;

function tryParseImportRawText(text: string): NormalizedImportedContact[] {
  const t = text.trim();
  if (!t) return [];
  if (/BEGIN:VCARD/i.test(t)) return parseVcfContactsText(t);
  const fromTable = parseCsvContactsText(t);
  return fromTable;
}

function iosLike(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

export function contactPickerSupported(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    contacts?: { select: (props: string[], opts?: { multiple?: boolean }) => Promise<unknown[]> };
  };
  return (
    "contacts" in navigator &&
    typeof nav.contacts?.select === "function" &&
    "ContactsManager" in window
  );
}

function appendImportMemo(existing: string | undefined, appended: string): string {
  const a = (existing ?? "").trim();
  const b = (appended ?? "").trim();
  if (!b) return a;
  if (!a) return b;
  return `${a}\n\n— 주소록 가져오기·메모 추가(원문 유지) —\n${b}`;
}

function dupLabel(d: DuplicateInfo): string {
  if (d.kind === "none") return "—";
  if (d.kind === "exact_phone") return `중복(전화 동일): ${d.label}`;
  return `잠재 중복(이름·무전화): ${d.label}${d.otherMatches ? ` 외 ${d.otherMatches}건` : ""}`;
}

function describeResolution(r: PreviewRow): string {
  if (r.resolution === "skip") return "건너뛰기";
  if (r.resolution === "merge_memo") return "메모만 기존 고객에 병합";
  return r.duplicate.kind === "none" ? "신규 저장" : "신규로 추가(중복 검토 필요)";
}

export function ImportContactsPanel({
  open,
  onClose,
  existingCustomers,
  onCommit,
  makeId,
  buildCustomer,
  showToast,
  onOpenFileGuide,
}: ImportContactsPanelProps) {
  const [tab, setTab] = useState<HubTab>("device");
  const [pasteText, setPasteText] = useState("");
  const [staging, setStaging] = useState<NormalizedImportedContact[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickerOk = useMemo(() => contactPickerSupported(), [open]);
  const onIos = useMemo(() => iosLike(), [open]);

  const resetAll = useCallback(() => {
    setPasteText("");
    setStaging([]);
    setPreviewRows(null);
    setTab("device");
  }, []);

  const appendParsed = useCallback(
    (rows: NormalizedImportedContact[]) => {
      if (rows.length === 0) {
        showToast("인식된 연락처가 없습니다.");
        return;
      }
      setStaging((prev) => [...prev, ...rows]);
      setPreviewRows(null);
      showToast(`${rows.length}건을 가져오기 목록에 추가했습니다. 미리보기를 진행해 주세요.`);
    },
    [showToast],
  );

  const runDuplicateScan = useCallback(() => {
    const canonical = dedupeImportBatch(staging);
    if (canonical.length === 0) {
      showToast("먼저 가져올 연락처를 추가해 주세요.");
      return;
    }
    const rows: PreviewRow[] = canonical.map((draft, idx) => {
      const dup = detectDuplicateForImport(draft, existingCustomers);
      const include = dup.kind !== "exact_phone";
      const resolution: PreviewRow["resolution"] =
        dup.kind === "exact_phone" ? "skip"
        : "add_new";
      return {
        key: `${idx}:${draft.name}:${phoneMatchKey(draft.phone) ?? "np"}:${idx}`,
        draft,
        duplicate: dup,
        include,
        resolution,
      };
    });
    setPreviewRows(rows);
    showToast(`미리보기 ${rows.length}건 · 전화번호 기준 중복은 기본값으로 저장에서 제외됩니다.`);
  }, [existingCustomers, staging, showToast]);

  const pickDeviceContacts = useCallback(async () => {
    const nav = navigator as Navigator & {
      contacts?: { select: (props: string[], opts?: { multiple?: boolean }) => Promise<unknown[]> };
    };
    if (!pickerOk || !nav.contacts?.select) {
      showToast("이 환경에서는 휴대폰 연락처 선택 API를 사용할 수 없습니다.");
      return;
    }

    try {
      const contacts = await nav.contacts.select(["name", "tel", "email"], { multiple: true });
      const rows: NormalizedImportedContact[] = [];
      for (const raw of contacts) {
        const c = raw as { name?: string[]; tel?: string[]; email?: string[] };
        const name = Array.isArray(c.name) ? c.name.join(" ").trim() : "";
        const tel = Array.isArray(c.tel) ? (c.tel[0] ?? "").trim()
          : typeof c.tel === "string"
            ? c.tel
            : "";
        const email = Array.isArray(c.email) ? (c.email[0] ?? "").trim()
          : typeof c.email === "string"
            ? c.email
            : "";
        if (!name && !tel && !email) continue;
        rows.push(
          normalizeImportedContact({
            name: name || (tel ? "(이름없음)" : "이름 미입력"),
            phone: tel || undefined,
            email: email || undefined,
          }),
        );
      }
      appendParsed(rows);
    } catch {
      showToast("연락처 선택이 취소되었거나 허용되지 않았습니다.");
    }
  }, [appendParsed, pickerOk, showToast]);

  const ingestPaste = useCallback(() => {
    appendParsed(tryParseImportRawText(pasteText));
  }, [appendParsed, pasteText]);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        if (!text.trim()) {
          showToast("파일 내용이 비어 있습니다.");
          return;
        }
        appendParsed(tryParseImportRawText(text));
      };
      reader.onerror = () => showToast("파일을 읽지 못했습니다.");
      reader.readAsText(f, "UTF-8");
    },
    [appendParsed, showToast],
  );

  const updatePreviewRow = useCallback((key: string, patch: Partial<Pick<PreviewRow, "include" | "resolution">>) => {
    setPreviewRows((prev) =>
      prev?.map((r) => {
        if (r.key !== key) return r;
        const next = { ...r, ...patch };
        if (patch.resolution === "skip") next.include = false;
        if (patch.resolution === "add_new" || patch.resolution === "merge_memo") next.include = true;
        if (patch.include === false) next.resolution = "skip";
        return next;
      }) ?? null,
    );
  }, []);

  const commit = useCallback(() => {
    if (!previewRows || previewRows.length === 0) {
      showToast("미리보기를 먼저 실행해 주세요.");
      return;
    }

    const creates: Customer[] = [];
    const merges: { customerId: string; memoAppend: string }[] = [];
    let skipped = 0;

    for (const row of previewRows) {
      if (!row.include) {
        skipped++;
        continue;
      }

      if (row.resolution === "merge_memo") {
        const targetId =
          row.duplicate.kind === "exact_phone" || row.duplicate.kind === "potential_name_no_phone"
            ? row.duplicate.customerId
            : null;
        if (!targetId || !(row.draft.memoRaw ?? "").trim()) {
          skipped++;
          continue;
        }
        merges.push({ customerId: targetId, memoAppend: row.draft.memoRaw!.trim() });
        continue;
      }

      if (row.resolution === "skip") {
        skipped++;
        continue;
      }

      if (row.resolution === "add_new") {
        if (row.duplicate.kind === "exact_phone") {
          skipped++;
          continue;
        }
        creates.push(buildCustomer(row.draft));
      }
    }

    if (creates.length === 0 && merges.length === 0) {
      showToast("저장할 항목이 없습니다. 체크박스와 처리 방식을 확인해 주세요.");
      return;
    }

    onCommit({ creates, merges });
    resetAll();
    onClose();
  }, [buildCustomer, onClose, onCommit, previewRows, resetAll, showToast]);

  if (!open) return null;

  const tabBtn = (id: HubTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={[
        "min-h-[44px] touch-manipulation rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition",
        tab === id
          ? "border-[#111827] bg-[#111827] text-white"
          : "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:bg-[#F3F4F6]",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pb-[max(2.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] pt-[max(2rem,calc(env(safe-area-inset-top,0px)+1rem))] sm:pb-10 sm:pt-12"
      onClick={() => onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-contacts-title"
        className="my-auto w-full max-w-4xl rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-xl sm:p-6"
        onClick={(ev) => ev.stopPropagation()}
      >
        <h2 id="import-contacts-title" className="text-lg font-bold text-[#111827]">
          주소록 가져오기
        </h2>
        <div className="mt-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3 text-[12px] leading-relaxed text-[#475569]">
          <p className="font-semibold text-[#334155]">개인정보·연락처 처리 안내</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] text-[#475569]">
            {IMPORT_PRIVACY_POINTS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-2 border-t border-[#E2E8F0] pt-2 text-[11px] text-[#64748B]">
            붙여넣기·파일 업로드는 사용자가 직접 넣은 내용만 반영됩니다. 기존 고객 카드는 전화번호 동일 여부 등을 미리보기에서
            확인한 뒤에만 병합·추가됩니다.
          </p>
        </div>

        {onOpenFileGuide ? (
          <div className="mt-3">
            <button
              type="button"
              className="min-h-[44px] w-full touch-manipulation rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-[13px] font-semibold text-[#1E40AF] hover:bg-[#F8FAFC]"
              onClick={(ev) => {
                ev.stopPropagation();
                onOpenFileGuide();
              }}
            >
              연락처 파일 만드는 방법 보기
            </button>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {tabBtn("device", "휴대폰 선택")}
          {tabBtn("paste", "붙여넣기")}
          {tabBtn("file", "파일")}
          {tabBtn("google", "Google 안내")}
          {tabBtn("iphone", "iPhone 안내")}
        </div>

        <div className="mt-4 min-h-[120px] rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4 text-[13px] text-[#374151]">
          {tab === "device" ? (
            <div className="space-y-3">
              <p className="text-[12px] leading-relaxed text-[#64748B]">
                Android(Chrome 등)에서만 지원될 수 있는 Contact Picker API입니다. 사용자가 직접 고른 연락처만
                가져옵니다. 주소록 전체에 자동 접근하지 않습니다.
              </p>
              {onIos ? (
                <p className="text-[12px] font-semibold text-[#B45309]">
                  iPhone Safari에서는 이 API를 기대하기 어렵습니다. «iPhone 안내» 탭의 .vcf 업로드를 사용해 주세요.
                </p>
              ) : null}
              <button
                type="button"
                disabled={!pickerOk || onIos}
                className="min-h-[44px] rounded-xl bg-[#111827] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-[#9CA3AF] touch-manipulation"
                onClick={() => void pickDeviceContacts()}
              >
                휴대폰 연락처에서 선택
              </button>
              {!pickerOk ? (
                <p className="text-[12px] text-[#6B7280]">
                  이 브라우저는 Contact Picker를 지원하지 않습니다. 붙여넣기 또는 파일 업로드를 이용해 주세요.
                </p>
              ) : null}
            </div>
          ) : null}

          {tab === "paste" ? (
            <div className="space-y-2">
              <p className="text-[12px] text-[#64748B]">
                CSV(구글 내보내기 등), 줄 단위(이름+전화), 또는 vCard 전체 블록을 붙여넣을 수 있습니다. 원문 메모는
                그대로 보존됩니다.
              </p>
              {onOpenFileGuide ? (
                <button
                  type="button"
                  className="min-h-[40px] w-full max-w-[100%] touch-manipulation text-left text-[13px] font-semibold text-[#2563EB] underline decoration-[#BFDBFE] underline-offset-2 hover:text-[#1D4ED8]"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onOpenFileGuide();
                  }}
                >
                  연락처 파일 만드는 방법 보기
                </button>
              ) : null}
              <textarea
                value={pasteText}
                onChange={(ev) => setPasteText(ev.target.value)}
                rows={10}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#94A3B8]"
                placeholder={`CSV 첫 줄에 헤더가 있거나, 한 줄당 한 명\n홍길동\t010-1234-5678\t메모\n또는 BEGIN:VCARD ... END:VCARD`}
              />
              <button
                type="button"
                className="min-h-[44px] rounded-xl border border-[#111827] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#111827] touch-manipulation"
                onClick={() => ingestPaste()}
              >
                목록에 추가 (파싱)
              </button>
            </div>
          ) : null}

          {tab === "file" ? (
            <div className="space-y-3">
              <p className="text-[12px] text-[#64748B]">
                `.csv`, `.txt`, `.vcf` 업로드. 아이폰에서 공유한 vCard 또는 Google 내보내기 CSV를 사용할 수 있습니다.
              </p>
              {onOpenFileGuide ? (
                <button
                  type="button"
                  className="min-h-[40px] w-full max-w-[100%] touch-manipulation text-left text-[13px] font-semibold text-[#2563EB] underline decoration-[#BFDBFE] underline-offset-2 hover:text-[#1D4ED8]"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onOpenFileGuide();
                  }}
                >
                  연락처 파일 만드는 방법 보기
                </button>
              ) : null}
              <button
                type="button"
                className="min-h-[44px] rounded-xl bg-[#111827] px-5 py-2.5 text-[14px] font-semibold text-white touch-manipulation"
                onClick={() => fileInputRef.current?.click()}
              >
                파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.vcf,.vcard,text/plain,text/vcard,text/csv,text/tab-separated-values"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          ) : null}

          {tab === "google" ? (
            <div className="space-y-3">
              <p className="text-[12px] leading-relaxed text-[#475569]">
                Google Contacts에서 CSV 또는 vCard로 내보낸 뒤 여기 업로드하거나 내용을 붙여넣으세요.
                표준 헤더(예: Name, Phone 1 - Value, E-mail 1 - Value, Notes)를 인식합니다.
              </p>
              <details className="rounded-lg border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-[12px] text-[#64748B]">
                <summary className="cursor-pointer font-semibold text-[#334155]">
                  2차 확장 예정 · Google People API (OAuth)
                </summary>
                <p className="mt-2">
                  로그인·동기화 기반 연동은 별도 OAuth와 스코프 설계 후 추가합니다. 자동 주소록 수집은 하지 않습니다.
                </p>
              </details>
              <div className="flex flex-wrap gap-2">
                {CONTACT_SYNC_SOURCES.filter((s) => s.id === "google").map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#1D4ED8] hover:bg-[#F8FAFC]"
                  >
                    Google 연락처 열기 →
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "iphone" ? (
            <div className="space-y-3 text-[13px] leading-relaxed">
              <p>
                아이폰 연락처 앱에서 연락처를 공유하거나 내보낸 <strong>.vcf</strong> 파일을 업로드하세요. 이름·전화·이메일·메모
                노트를 가능한 범위에서 반영합니다(원문 보존, AI 수정 없음).
              </p>
              <button
                type="button"
                className="min-h-[44px] rounded-xl bg-[#111827] px-5 py-2.5 text-[14px] font-semibold text-white touch-manipulation"
                onClick={() => {
                  setTab("file");
                  window.setTimeout(() => fileInputRef.current?.click(), 0);
                }}
              >
                .vcf 파일 선택
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E5E7EB] pt-4">
          <div className="text-[13px] font-semibold text-[#111827]">
            가져오기 큐 <span className="tabular-nums text-[#64748B]">({staging.length})</span>
          </div>
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#374151] touch-manipulation"
            onClick={() => {
              setStaging([]);
              setPreviewRows(null);
            }}
          >
            큐 비우기
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-xl bg-[#1D4ED8] px-5 py-2 text-[14px] font-semibold text-white touch-manipulation"
            onClick={() => runDuplicateScan()}
          >
            미리보기·중복 검사
          </button>
        </div>

        {previewRows && previewRows.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="min-w-[720px] w-full border-collapse text-left text-[12px]">
              <thead className="bg-[#F1F5F9] text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                <tr>
                  <th className="border-b border-[#E5E7EB] px-2 py-2">저장</th>
                  <th className="border-b border-[#E5E7EB] px-2 py-2">이름</th>
                  <th className="border-b border-[#E5E7EB] px-2 py-2">전화</th>
                  <th className="border-b border-[#E5E7EB] px-2 py-2">이메일</th>
                  <th className="border-b border-[#E5E7EB] px-2 py-2">관심/메모 요약 표시</th>
                  <th className="border-b border-[#E5E7EB] px-2 py-2">중복</th>
                  <th className="border-b border-[#E5E7EB] px-2 py-2">처리</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.key} className="hover:bg-[#FAFBFC]">
                    <td className="border-b border-[#F1F5F9] px-2 py-2 align-top">
                      <input
                        type="checkbox"
                        className="h-5 w-5 touch-manipulation"
                        checked={row.include}
                        onChange={(ev) => {
                          const on = ev.target.checked;
                          const res: PreviewRow["resolution"] =
                            !on ? "skip"
                            : row.duplicate.kind === "exact_phone"
                              ? (row.draft.memoRaw ?? "").trim() ? "merge_memo"
                              : "skip"
                            : "add_new";
                          updatePreviewRow(row.key, { include: on, resolution: res });
                        }}
                      />
                    </td>
                    <td className="border-b border-[#F1F5F9] px-2 py-2 align-top font-medium text-[#111827]">
                      {row.draft.name}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-2 py-2 align-top">
                      {row.draft.phone ?? "—"}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-2 py-2 align-top break-all">{row.draft.email ?? "—"}</td>
                    <td className="border-b border-[#F1F5F9] px-2 py-2 align-top text-[11px] text-[#475569]">
                      {row.draft.interestedModelHint ?
                        <>
                          <div className="font-semibold text-[#334155]">관심/조직:</div>
                          <div className="line-clamp-2">{row.draft.interestedModelHint}</div>
                        </>
                      : null}
                      {row.draft.memoRaw ? (
                        <>
                          <div className={row.draft.interestedModelHint ? "mt-2 font-semibold" : "font-semibold"}>
                            메모 (원문):
                          </div>
                          <pre className="mt-1 max-h-24 whitespace-pre-wrap break-words font-sans">{row.draft.memoRaw}</pre>
                        </>
                      ) : (
                        !row.draft.interestedModelHint && "—"
                      )}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-2 py-2 align-top text-[11px] text-[#92400E]">
                      {dupLabel(row.duplicate)}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-2 py-2 align-top">
                      <select
                        value={row.resolution}
                        className="min-h-[44px] w-full max-w-[11rem] rounded-lg border border-[#E5E7EB] bg-white px-2 py-2 text-[12px] font-medium touch-manipulation"
                        onChange={(ev) => {
                          const v = ev.target.value as PreviewRow["resolution"];
                          updatePreviewRow(row.key, {
                            resolution: v,
                            include: v !== "skip",
                          });
                        }}
                      >
                        <option value="add_new" disabled={row.duplicate.kind === "exact_phone"}>
                          신규로 추가
                        </option>
                        <option value="skip">중복 건너뛰기</option>
                        <option
                          value="merge_memo"
                          disabled={
                            row.duplicate.kind === "none" ||
                            !(row.draft.memoRaw ?? "").trim()
                          }
                        >
                          기존 고객 메모 병합
                        </option>
                      </select>
                      <div className="mt-1 text-[10px] text-[#94A3B8]">{describeResolution(row)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#E5E7EB] pt-4">
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation"
            onClick={() => {
              resetAll();
              onClose();
            }}
          >
            닫기
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-xl bg-[#111827] px-6 py-2.5 text-[14px] font-semibold text-white touch-manipulation"
            onClick={() => commit()}
            disabled={!previewRows?.length}
          >
            최종 확인 후 저장
          </button>
        </div>
      </div>
    </div>
  );
}
