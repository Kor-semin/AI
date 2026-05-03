"use client";

import type { Customer } from "@/app/crm/types";
import { detectDuplicateForImport, type DuplicateInfo } from "@/app/crm/contactImport/detectDuplicateContacts";
import {
  dedupeImportBatch,
  normalizeImportedContact,
  phoneMatchKey,
  type NormalizedImportedContact,
} from "@/app/crm/contactImport/normalizeImportedContact";
import { parseCsvContactsText } from "@/app/crm/contactImport/parseCsvContacts";
import { parseVcfContactsText } from "@/app/crm/contactImport/parseVcfContacts";
import { ContactExportLinksModal, type ContactExportLinksVariant } from "@/app/crm/ContactExportLinksModal";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

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

const importGuideButtonClass =
  "inline-flex min-h-[40px] w-full max-w-full touch-manipulation items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[12px] font-semibold text-[#334155] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#F8FAFC] sm:w-auto sm:min-w-[12rem]";

/** 모바일: 탭을 한 줄 스크롤 칩 형태로, 데스크톱: 기존 감각 유지 */
const importTabRailClass =
  "-mx-0.5 mt-3 flex flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain px-0.5 pb-1 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] sm:mx-0 sm:mt-4 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0 [&::-webkit-scrollbar]:hidden";

const exportLinksOpenerPrimary =
  "inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center rounded-xl bg-[#111827] px-5 py-3 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1E293B] sm:w-auto";

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

/** 일반 노트북·데스크톱 Chrome 등: 피커 제공 대상 외 UX로 안내 분기 */
function isLikelyDesktopBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return false;
  return true;
}

/** Android 모바일 크롬 등: Contact Picker를 실제 진입점으로 제공 */
function canOfferNativeContactPicker(): boolean {
  return contactPickerSupported() && !iosLike() && !isLikelyDesktopBrowser();
}

const HUB_TAB_LABELS: Record<HubTab, string> = {
  device: "연락처 선택",
  paste: "붙여넣기",
  file: "파일",
  google: "Google 안내",
  iphone: "iPhone 안내",
};

function hubTabsOrderedFor(profile: {
  nativePick: boolean;
  ios: boolean;
  desktop: boolean;
}): HubTab[] {
  if (profile.nativePick) return ["device", "paste", "file", "google"];
  if (profile.ios) return ["iphone", "file", "paste", "google"];
  if (profile.desktop) return ["google", "paste", "file", "iphone"];
  /** Android 등 모바일이나 피커 미지원: 파일·붙여넣기 우선 */
  return ["paste", "file", "google", "iphone"];
}

function defaultHubTab(profile: {
  nativePick: boolean;
  ios: boolean;
  desktop: boolean;
}): HubTab {
  return hubTabsOrderedFor(profile)[0]!;
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
  const [tab, setTab] = useState<HubTab>("paste");
  const [pasteText, setPasteText] = useState("");
  const [staging, setStaging] = useState<NormalizedImportedContact[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[] | null>(null);
  const [exportLinksVariant, setExportLinksVariant] = useState<ContactExportLinksVariant | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoNativePickerTriggeredRef = useRef(false);

  const pickerOk = useMemo(() => contactPickerSupported(), [open]);
  const onIos = useMemo(() => iosLike(), [open]);
  const desktopUa = useMemo(() => isLikelyDesktopBrowser(), [open]);
  const nativePick = useMemo(() => canOfferNativeContactPicker(), [open]);

  const hubProfile = useMemo(
    () => ({ nativePick, ios: onIos, desktop: desktopUa }),
    [nativePick, onIos, desktopUa],
  );

  const hubTabsOrdered = useMemo(() => hubTabsOrderedFor(hubProfile), [hubProfile]);

  const resolveDefaultHubTab = useCallback(() => defaultHubTab(hubProfile), [hubProfile]);

  useEffect(() => {
    if (!open) return;
    setTab(resolveDefaultHubTab());
  }, [open, resolveDefaultHubTab]);

  useEffect(() => {
    if (!open) return;
    if (hubTabsOrdered.includes(tab)) return;
    setTab(resolveDefaultHubTab());
  }, [open, hubTabsOrdered, resolveDefaultHubTab, tab]);

  useEffect(() => {
    if (!open) setExportLinksVariant(null);
  }, [open]);

  const resetAll = useCallback(() => {
    setPasteText("");
    setStaging([]);
    setPreviewRows(null);
    setTab(resolveDefaultHubTab());
  }, [resolveDefaultHubTab]);

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
    if (!nativePick || !pickerOk || !nav.contacts?.select) {
      showToast("이 환경에서는 휴대폰 연락처 선택을 사용할 수 없습니다.");
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
            name: name || (tel ? "이름 없음" : "이름 미입력"),
            phone: tel || undefined,
            email: email || undefined,
          }),
        );
      }
      appendParsed(rows);
    } catch {
      showToast("연락처 선택이 취소되었거나 허용되지 않았습니다.");
    }
  }, [appendParsed, nativePick, pickerOk, showToast]);

  /** 지원 브라우저: 패널이 열리면 연락처 선택(피커)를 즉시 띄움 — 사용자가 고른 사람만 목록 반영 */
  useEffect(() => {
    if (!open) {
      autoNativePickerTriggeredRef.current = false;
      return;
    }
    if (!nativePick || tab !== "device") return;
    if (autoNativePickerTriggeredRef.current) return;
    autoNativePickerTriggeredRef.current = true;
    const timer = window.setTimeout(() => {
      void pickDeviceContacts();
    }, 240);
    return () => window.clearTimeout(timer);
  }, [open, nativePick, tab, pickDeviceContacts]);

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
      showToast("저장할 항목이 없습니다. 체크박스와 저장 방식을 확인해 주세요.");
      return;
    }

    onCommit({ creates, merges });
    resetAll();
    onClose();
  }, [buildCustomer, onClose, onCommit, previewRows, resetAll, showToast]);

  if (!open) return null;

  const renderHubTabBtn = (id: HubTab) => {
    const label = HUB_TAB_LABELS[id];
    return (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={tab === id}
        onClick={() => setTab(id)}
        className={[
          "shrink-0 snap-start touch-manipulation rounded-full border px-3 py-1.5 text-[12px] font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-[#CBD5E1] sm:min-h-[44px] sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-[13px] sm:font-semibold",
          tab === id
            ? "border-[#111827] bg-[#111827] text-white shadow-sm ring-2 ring-[#111827]/10 ring-offset-1 ring-offset-white"
            : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/[0.56] backdrop-blur-[2px] px-3 pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+0.85rem))] pt-[max(2.75rem,calc(env(safe-area-inset-top,0px)+0.65rem))] max-[480px]:[scrollbar-width:none] max-[480px]:[-ms-overflow-style:none] max-[480px]:[&::-webkit-scrollbar]:hidden sm:px-4 sm:pb-10 sm:pt-12"
      onClick={() => onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-contacts-title"
        className="my-auto flex w-full max-w-4xl flex-col rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 shadow-xl max-[480px]:min-h-0 max-[480px]:max-h-[min(94dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.25rem))] max-[480px]:overflow-y-auto max-[480px]:[scrollbar-width:thin] sm:max-h-none sm:overflow-visible sm:p-6"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="import-contacts-title" className="min-w-0 flex-1 text-lg font-bold leading-snug text-[#111827]">
            주소록 가져오기
          </h2>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9] focus-visible:ring-2 focus-visible:ring-[#CBD5E1] max-sm:-mr-1 sm:hidden"
            aria-label="닫기"
            onClick={() => {
              resetAll();
              onClose();
            }}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
        <div className="mt-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] leading-relaxed text-[#475569] sm:py-3">
          <p className="font-semibold text-[#334155]">개인정보·연락처 처리 안내</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] leading-snug text-[#475569] sm:hidden">
            <li>iPhone·Google·Galaxy(Samsung) 연락처에서 준비한 파일을 올 수 있습니다.</li>
            <li>
              저장 전 미리보기에서 확인합니다. 선택한 항목만 저장되며 기존 고객 정보는 자동으로 덮어쓰지 않습니다.
            </li>
            <li>Sensora는 고객 정보를 임의로 수집하거나 자동 저장하지 않습니다.</li>
          </ul>
          <div className="mt-1.5 hidden space-y-1.5 text-[13px] leading-snug sm:mt-2 sm:block sm:leading-relaxed">
            <p className="text-[#475569]">
              iPhone, Google 연락처, Galaxy/Samsung 연락처에서 연락처 파일을 준비한 뒤 업로드할 수 있습니다.
            </p>
            <p className="text-[#334155]">
              저장 전 미리보기에서 확인한 뒤, 선택한 항목만 저장됩니다.
            </p>
            <p className="text-[#334155]">
              Sensora는 고객 정보를 임의로 수집하거나 자동 저장하지 않습니다.
            </p>
            <p className="text-[#334155]">기존 고객 정보는 자동으로 덮어쓰지 않습니다.</p>
          </div>
          <p className="mt-2 border-t border-[#E2E8F0] pt-2 text-[11px] leading-snug text-[#64748B] sm:mt-2">
            붙여넣기·파일·휴대폰에서 고른 연락처도 본인이 넣은 내용만 목록에 반영됩니다.
          </p>
        </div>

        {onIos ? (
          <div className="mt-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] leading-snug text-[#475569]">
            iPhone에서는 연락처 파일을 준비한 뒤 업로드하는 방식을 권장합니다.
          </div>
        ) : null}

        {onOpenFileGuide ? (
          <div
            className={[
              "mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
              onIos ? "max-sm:mt-2" : "",
            ].join(" ")}
          >
            <button
              type="button"
              className={
                onIos ?
                  "inline-flex min-h-[44px] w-full max-w-full touch-manipulation items-center justify-center rounded-xl border border-[#111827] bg-[#111827] px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#1E293B] sm:w-auto sm:min-w-[12rem]"
                : importGuideButtonClass
              }
              onClick={(ev) => {
                ev.stopPropagation();
                onOpenFileGuide();
              }}
            >
              연락처 파일 준비 방법 보기
            </button>
            {onIos ? (
              <button
                type="button"
                className="inline-flex min-h-[40px] w-full touch-manipulation items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-[12px] font-semibold text-[#374151] hover:bg-[#F8FAFC] sm:w-auto sm:min-w-[10rem]"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setTab("iphone");
                }}
              >
                iPhone 안내 보기
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={importTabRailClass} role="tablist" aria-label="가져오기 방법">
          {hubTabsOrdered.map((id) => renderHubTabBtn(id))}
        </div>

        {desktopUa && !nativePick ? (
          <p className="mt-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] leading-snug text-[#475569]">
            PC에서는 Google 연락처에서 CSV 또는 vCard 파일을 내보낸 뒤 업로드하거나, 연락처 내용을 붙여넣어 주세요.
          </p>
        ) : null}

        <div className="mt-4 min-h-[120px] rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4 text-[13px] text-[#374151]">
          {tab === "device" && nativePick ? (
            <div className="space-y-3">
              <p className="text-[12px] leading-relaxed text-[#64748B]">
                브라우저에서 연락처 목록 중 직접 고른 사람만 가져오기 목록에 담습니다. 서버가 주소록 전체를 읽지 않습니다.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-[12px] leading-snug text-[#475569]">
                <li>선택한 연락처만 가져옵니다.</li>
                <li>전체 주소록을 자동으로 열람하지 않습니다.</li>
                <li>저장 전 미리보기에서 확인합니다.</li>
                <li>기존 고객 정보는 자동으로 덮어쓰지 않습니다.</li>
              </ul>
              <button
                type="button"
                className="min-h-[48px] w-full touch-manipulation rounded-xl bg-[#111827] px-5 py-3 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1E293B] sm:w-auto sm:min-h-[44px] sm:py-2.5"
                onClick={() => void pickDeviceContacts()}
              >
                휴대폰 연락처에서 선택
              </button>
              <p className="text-[11px] leading-snug text-[#64748B]">
                선택한 연락처만 가져옵니다. 전체 주소록을 자동으로 열람하지 않습니다.
              </p>
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
                  className="min-h-[40px] max-w-full touch-manipulation text-left text-[12px] font-semibold text-[#334155] underline decoration-[#CBD5E1] underline-offset-2 hover:text-[#0F172A]"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onOpenFileGuide();
                  }}
                >
                  연락처 파일 준비 방법 보기
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
                목록에 추가
              </button>
            </div>
          ) : null}

          {tab === "file" ? (
            <div className="space-y-3">
              <p className="text-[12px] text-[#64748B]">
                .csv, .txt, .vcf 파일을 업로드할 수 있습니다. iPhone에서 만든 vCard나 Google 연락처에서 내보낸 CSV 파일을
                사용할 수 있습니다.
              </p>
              {onOpenFileGuide ? (
                <button
                  type="button"
                  className="min-h-[40px] max-w-full touch-manipulation text-left text-[12px] font-semibold text-[#334155] underline decoration-[#CBD5E1] underline-offset-2 hover:text-[#0F172A]"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onOpenFileGuide();
                  }}
                >
                  파일 준비 방법
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
                Google 연락처에서 선택한 뒤 CSV 또는 vCard로 내보내 주세요. 내보낸 파일을 이 화면에서 파일로 올리거나 내용만
                붙여 넣으면 됩니다. 이름·전화 등 흔한 열 이름은 읽히는 편입니다.
              </p>
              <button
                type="button"
                className={exportLinksOpenerPrimary}
                onClick={() => setExportLinksVariant("google")}
              >
                Google 연락처·파일 준비 안내 열기
              </button>
              {onOpenFileGuide ? (
                <button
                  type="button"
                  className="min-h-[40px] max-w-full touch-manipulation text-left text-[12px] font-semibold text-[#334155] underline decoration-[#CBD5E1] underline-offset-2 hover:text-[#0F172A]"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onOpenFileGuide();
                  }}
                >
                  연락처 파일 준비 방법 보기
                </button>
              ) : null}
              <details className="rounded-lg border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-[12px] text-[#64748B]">
                <summary className="cursor-pointer font-semibold text-[#334155]">
                  2차 확장 예정 · Google People API (OAuth)
                </summary>
                <p className="mt-2">
                  로그인 후 연결하는 형태의 연동은 별도 OAuth와 스코프 설계 후 검토합니다. 자동 주소록 수집은 하지 않습니다.
                </p>
              </details>
            </div>
          ) : null}

          {tab === "iphone" ? (
            <div className="space-y-3 text-[13px] leading-relaxed">
              <p>
                iCloud 연락처에서 vCard 파일로 내보낸 뒤 업로드해 주세요. 기기에서 공유·내보낸 <strong>.vcf</strong> 파일도
                올릴 수 있습니다. 이름·전화·이메일·메모 노트는 가능한 범위에서 반영합니다(원문 유지).
              </p>
              <button
                type="button"
                className={exportLinksOpenerPrimary}
                onClick={() => setExportLinksVariant("icloud")}
              >
                iCloud·vCard 준비 안내 열기
              </button>
              {onOpenFileGuide ? (
                <button
                  type="button"
                  className="min-h-[40px] max-w-full touch-manipulation text-left text-[12px] font-semibold text-[#334155] underline decoration-[#CBD5E1] underline-offset-2 hover:text-[#0F172A]"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onOpenFileGuide();
                  }}
                >
                  연락처 파일 준비 방법 보기
                </button>
              ) : null}
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

        <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:space-y-0 sm:pt-4">
          <div className="flex items-center justify-between gap-3 sm:flex-1 sm:justify-start">
            <div className="text-[12px] font-semibold text-[#111827] sm:text-[13px]">
              가져올 연락처 <span className="tabular-nums text-[#64748B]">({staging.length})</span>
            </div>
            <button
              type="button"
              className="shrink-0 touch-manipulation rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-[#64748B] underline underline-offset-2 hover:text-[#374151] sm:border-[#E5E7EB] sm:bg-white sm:px-3 sm:py-2 sm:text-[13px] sm:font-semibold sm:no-underline sm:text-[#374151]"
              onClick={() => {
                setStaging([]);
                setPreviewRows(null);
              }}
            >
              목록 비우기
            </button>
          </div>
          <button
            type="button"
            className="w-full touch-manipulation rounded-xl bg-[#1D4ED8] px-5 py-3 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1E40AF] sm:w-auto sm:min-h-[44px] sm:py-2"
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
                  <th className="border-b border-[#E5E7EB] px-1.5 py-1.5 sm:px-2 sm:py-2">저장</th>
                  <th className="border-b border-[#E5E7EB] px-1.5 py-1.5 sm:px-2 sm:py-2">이름</th>
                  <th className="border-b border-[#E5E7EB] px-1.5 py-1.5 sm:px-2 sm:py-2">전화</th>
                  <th className="border-b border-[#E5E7EB] px-1.5 py-1.5 sm:px-2 sm:py-2">이메일</th>
                  <th className="border-b border-[#E5E7EB] px-1.5 py-1.5 normal-case sm:px-2 sm:py-2">관심·메모</th>
                  <th className="border-b border-[#E5E7EB] px-1.5 py-1.5 sm:px-2 sm:py-2">중복</th>
                  <th className="border-b border-[#E5E7EB] px-1.5 py-1.5 normal-case sm:px-2 sm:py-2">저장 방식</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.key} className="hover:bg-[#FAFBFC]">
                    <td className="border-b border-[#F1F5F9] px-1.5 py-1.5 align-top sm:px-2 sm:py-2">
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
                    <td className="border-b border-[#F1F5F9] px-1.5 py-1.5 align-top font-medium text-[#111827] sm:px-2 sm:py-2">
                      {row.draft.name}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-1.5 py-1.5 align-top sm:px-2 sm:py-2">
                      {row.draft.phone ?? "—"}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-1.5 py-1.5 align-top break-all sm:px-2 sm:py-2">
                      {row.draft.email ?? "—"}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-1.5 py-1.5 align-top text-[11px] text-[#475569] sm:px-2 sm:py-2">
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
                    <td className="border-b border-[#F1F5F9] px-1.5 py-1.5 align-top text-[11px] text-[#92400E] sm:px-2 sm:py-2">
                      {dupLabel(row.duplicate)}
                    </td>
                    <td className="border-b border-[#F1F5F9] px-1.5 py-1.5 align-top sm:px-2 sm:py-2">
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

        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-[#E5E7EB] pt-3 pb-[max(0rem,env(safe-area-inset-bottom))] max-sm:border-t-[#EBEEF4] sm:mt-5 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2 sm:pt-4">
          <button
            type="button"
            className="hidden min-h-[44px] rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-[14px] font-semibold text-[#374151] touch-manipulation sm:inline-flex sm:items-center sm:justify-center"
            onClick={() => {
              resetAll();
              onClose();
            }}
          >
            닫기
          </button>
          <button
            type="button"
            className="min-h-[48px] w-full touch-manipulation rounded-xl bg-[#111827] px-6 py-3 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#CBD5E1] sm:w-auto sm:min-h-[44px] sm:py-2.5 sm:text-[14px]"
            onClick={() => commit()}
            disabled={!previewRows?.length}
          >
            최종 확인 후 저장
          </button>
        </div>
      </div>
    </div>
    <ContactExportLinksModal
      open={exportLinksVariant != null}
      variant={exportLinksVariant}
      onClose={() => setExportLinksVariant(null)}
    />
    </>
  );
}
