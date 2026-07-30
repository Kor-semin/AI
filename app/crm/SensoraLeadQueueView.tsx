"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { isFirebaseConfigured } from "@/app/firebase/client";
import {
  convertSensoraLeadToCustomer,
  createSensoraLead,
  DEFAULT_SENSORA_WORKSPACE_ID,
  getSensoraCustomerPersistenceMessage,
  getSensoraLeadPersistenceMessage,
  listSensoraLeads,
  sensoraB2BSeedData,
  type LeadSource,
  type SensoraLead,
  type SensoraStoredLead,
} from "@/lib/sensora";

const sourceLabels: Record<LeadSource, string> = {
  showroom_call: "전시장 전화",
  walk_in: "직접 방문",
  online_inquiry: "온라인 문의",
  referral: "고객 추천",
  test_drive_request: "시승 문의",
  event: "이벤트",
  unknown: "기타",
};

const statusLabels: Record<SensoraLead["status"], string> = {
  new: "신규",
  unassigned: "미배정",
  assigned: "배정됨",
  contact_needed: "연락 필요",
  contacted: "연락 완료",
  in_consultation: "상담 중",
  converted: "전환 완료",
  lost: "보류",
  duplicate: "중복 확인",
  invalid: "정보 확인",
};

const baseLead = sensoraB2BSeedData.leads[0];

const previewLeads: SensoraLead[] = [
  baseLead,
  {
    ...baseLead,
    id: "lead_preview_walk_in",
    source: "walk_in",
    customerName: "김도현",
    interestedVehicle: "BMW 520i M Sport",
    assignedUserId: "user_team_leader",
    status: "contact_needed",
  },
  {
    ...baseLead,
    id: "lead_preview_online",
    source: "online_inquiry",
    customerName: "이서연",
    interestedVehicle: "Audi A6 45 TFSI",
    assignedUserId: undefined,
    status: "unassigned",
  },
];

const userLabels: Record<string, string> = {
  user_sales: "오세민",
  user_team_leader: "최서윤",
  user_branch_manager: "윤도현",
};

type LeadFormState = {
  customerName: string;
  phone: string;
  source: "" | LeadSource;
  interestedVehicle: string;
  purchaseTiming: string;
  preferredContactTime: string;
  memo: string;
};

type Notice = { tone: "success" | "error"; message: string } | null;

const EMPTY_FORM: LeadFormState = {
  customerName: "",
  phone: "",
  source: "",
  interestedVehicle: "",
  purchaseTiming: "",
  preferredContactTime: "",
  memo: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none transition placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)] disabled:cursor-not-allowed disabled:opacity-60";

export function maskSensoraLeadPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "연락처 확인 필요";

  const prefixLength = digits.length === 10 ? 3 : Math.max(2, digits.length - 8);
  const middleLength = Math.max(3, digits.length - prefixLength - 4);
  return `${digits.slice(0, prefixLength)}-${"*".repeat(middleLength)}-${digits.slice(-4)}`;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "생성일 확인 필요";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function summarizeMemo(memo?: string): string {
  if (!memo) return "메모 없음";
  return memo.length > 54 ? `${memo.slice(0, 54)}…` : memo;
}

function LeadPreview() {
  return (
    <section
      className="min-h-[380px] min-w-0 max-w-full rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6"
      aria-labelledby="lead-preview-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Lead Intake</p>
          <h2 id="lead-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[var(--s-text)]">
            신규 Lead 접수
          </h2>
        </div>
        <span className="rounded-lg bg-[var(--s-brand-tint)] px-4 py-2 text-xs font-medium text-[var(--s-brand-text)]">
          Demo data
        </span>
      </div>

      <dl className="mt-9 grid min-h-[150px] grid-cols-[84px_1fr] content-center gap-x-4 gap-y-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4 text-[0.8125rem]">
        <dt className="text-[var(--s-text-3)]">접수 채널</dt>
        <dd className="text-[var(--s-text-2)]">전시장 전화 · 직접 방문</dd>
        <dt className="text-[var(--s-text-3)]">온라인 문의</dt>
        <dd className="text-[var(--s-text-2)]">웹 폼 유입</dd>
        <dt className="text-[var(--s-text-3)]">저장 방식</dt>
        <dd className="text-[var(--s-text-2)]">사용자 직접 입력 후 저장</dd>
        <dt className="text-[var(--s-text-3)]">현재 단계</dt>
        <dd className="text-[var(--s-text-2)]">Lead 접수 Beta</dd>
      </dl>

      <div className="mt-6 rounded-lg border border-[var(--s-border)] bg-[var(--s-deep)] p-4">
        <p className="text-sm font-semibold text-[var(--s-text-emph)]">Firestore 저장 기능은 Lead 접수 메뉴에서 사용합니다.</p>
        <p className="mt-2 text-xs leading-5 text-[var(--s-text-3)]">저장된 Lead는 사용자가 확인한 뒤 Customer로 전환할 수 있습니다.</p>
      </div>
    </section>
  );
}

function SavedLeadList({
  leads,
  loading,
  loadError,
  conversionNotice,
  selectedLeadId,
  conversionLeadId,
  convertingLeadId,
  onRetry,
  onToggleDetail,
  onRequestConversion,
  onCancelConversion,
  onConfirmConversion,
}: {
  leads: SensoraStoredLead[];
  loading: boolean;
  loadError: string;
  conversionNotice: Notice;
  selectedLeadId: string | null;
  conversionLeadId: string | null;
  convertingLeadId: string | null;
  onRetry: () => void;
  onToggleDetail: (leadId: string) => void;
  onRequestConversion: (leadId: string) => void;
  onCancelConversion: () => void;
  onConfirmConversion: (lead: SensoraStoredLead) => void;
}) {
  return (
    <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="saved-leads-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-ok-text)]">Live data</p>
          <h2 id="saved-leads-title" className="mt-2 text-lg font-semibold text-[var(--s-text)]">Firestore 저장 데이터</h2>
          <p className="mt-1 text-[0.8125rem] text-[var(--s-text-3)]">Demo data와 분리된 실제 Lead 목록입니다.</p>
        </div>
        <span className="rounded-full border border-[var(--s-border)] bg-[var(--s-deep)] px-3 py-1.5 text-xs text-[var(--s-text-2)]">
          {leads.length}건
        </span>
      </div>

      {conversionNotice ? (
        <p
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${conversionNotice.tone === "success" ? "border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] text-[var(--s-ok-text)]" : "border-[var(--s-err-border)] bg-[var(--s-err-tint)] text-[var(--s-err-text)]"}`}
          role={conversionNotice.tone === "error" ? "alert" : "status"}
        >
          {conversionNotice.message}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 rounded-lg border border-[var(--s-border)] bg-[var(--s-deep)] px-4 py-5 text-sm text-[var(--s-text-2)]" role="status">
          저장된 Lead를 불러오는 중입니다…
        </p>
      ) : null}

      {!loading && loadError ? (
        <div className="mt-6 rounded-lg border border-[var(--s-err-border)] bg-[var(--s-err-tint)] p-4" role="alert">
          <p className="text-sm text-[var(--s-err-text)]">{loadError}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {loadError.includes("로그인") ? (
              <Link href="/login" className="rounded-lg bg-[var(--s-brand)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--s-brand-hover)]">
                승인 계정으로 로그인
              </Link>
            ) : null}
            <button type="button" onClick={onRetry} className="rounded-lg border border-[var(--s-err-border)] px-3 py-2 text-xs font-medium text-[var(--s-err-text)] hover:bg-[var(--s-err-tint)]">
              다시 조회
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !loadError && leads.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] px-4 py-8 text-center text-sm text-[var(--s-text-3)]">
          아직 저장된 Lead가 없습니다
        </p>
      ) : null}

      {!loading && leads.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {leads.map((lead) => {
            const detailOpen = selectedLeadId === lead.id;
            const conversionOpen = conversionLeadId === lead.id;
            const converted = lead.status === "converted" || Boolean(lead.convertedCustomerId);
            const converting = convertingLeadId === lead.id;

            return (
              <article key={lead.id} className="rounded-xl border border-[var(--s-border)] bg-[var(--s-deep)] p-4">
                <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--s-text)]">{lead.customerName}</h3>
                      <span className="rounded-full bg-[var(--s-ok-tint)] px-2 py-1 text-xs font-medium text-[var(--s-ok-text)]">{statusLabels[lead.status]}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--s-text-2)]">{maskSensoraLeadPhone(lead.phone)}</p>
                    <p className="mt-1 truncate text-xs text-[var(--s-text-3)]">{summarizeMemo(lead.memo)}</p>
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="truncate font-medium text-[var(--s-text-emph)]">{lead.interestedVehicle}</p>
                    <p className="mt-1 text-[var(--s-text-3)]">{sourceLabels[lead.source]}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:max-w-[210px] md:justify-end">
                    <time className="w-full text-xs text-[var(--s-text-3)] md:text-right" dateTime={lead.createdAt}>{formatCreatedAt(lead.createdAt)}</time>
                    <button
                      type="button"
                      onClick={() => onToggleDetail(lead.id)}
                      className="rounded-lg border border-[var(--s-border-2)] px-3 py-2 text-xs font-medium text-[var(--s-text-2)] hover:bg-[var(--s-inner)]"
                      aria-expanded={detailOpen}
                    >
                      {detailOpen ? "상세 닫기" : "상세 보기"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestConversion(lead.id)}
                      disabled={converted || converting}
                      className="rounded-lg bg-[var(--s-brand)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--s-brand-hover)] disabled:cursor-not-allowed disabled:bg-[var(--s-border-2)] disabled:text-[var(--s-text-4)]"
                    >
                      {converted ? "전환 완료" : converting ? "전환 중…" : "고객으로 전환"}
                    </button>
                  </div>
                </div>

                {detailOpen ? (
                  <dl className="mt-4 grid gap-3 border-t border-[var(--s-border)] pt-4 text-xs sm:grid-cols-2">
                    <div><dt className="text-[var(--s-text-5)]">고객명</dt><dd className="mt-1 text-[var(--s-text-emph)]">{lead.customerName}</dd></div>
                    <div><dt className="text-[var(--s-text-5)]">연락처</dt><dd className="mt-1 text-[var(--s-text-emph)]">{maskSensoraLeadPhone(lead.phone)}</dd></div>
                    <div><dt className="text-[var(--s-text-5)]">구매 시기</dt><dd className="mt-1 text-[var(--s-text-emph)]">{lead.purchaseTiming || "미입력"}</dd></div>
                    <div><dt className="text-[var(--s-text-5)]">선호 연락 시간</dt><dd className="mt-1 text-[var(--s-text-emph)]">{lead.preferredContactTime || "미입력"}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-[var(--s-text-5)]">상담 메모</dt><dd className="mt-1 whitespace-pre-wrap leading-5 text-[var(--s-text-emph)]">{lead.memo || "메모 없음"}</dd></div>
                    {lead.convertedCustomerId ? (
                      <div className="sm:col-span-2"><dt className="text-[var(--s-text-5)]">Customer ID</dt><dd className="mt-1 break-all font-mono text-[var(--s-ok-text)]">{lead.convertedCustomerId}</dd></div>
                    ) : null}
                  </dl>
                ) : null}

                {conversionOpen && !converted ? (
                  <div className="mt-4 rounded-lg border border-[var(--s-warn-border)] bg-[var(--s-warn-tint)] p-4" role="region" aria-label="Customer 전환 확인">
                    <p className="text-sm font-semibold text-[var(--s-warn-text-strong)]">이 Lead를 고객관리 대상으로 전환합니다.</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--s-warn-text-soft)]">문자 발송, 담당자 자동 배정, Follow-up 자동 생성은 아직 실행되지 않습니다.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => onConfirmConversion(lead)} disabled={converting} className="rounded-lg bg-[var(--s-brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--s-brand-hover)] disabled:cursor-not-allowed disabled:bg-[var(--s-border-2)]">
                        {converting ? "Transaction 실행 중…" : "전환 실행"}
                      </button>
                      <button type="button" onClick={onCancelConversion} disabled={converting} className="rounded-lg border border-[var(--s-warn-border)] px-4 py-2 text-xs text-[var(--s-warn-text-soft)] hover:bg-[var(--s-warn-tint)] disabled:opacity-50">
                        취소
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function LeadPersistenceView() {
  const firebaseConfigured = isFirebaseConfigured();
  const [form, setForm] = useState<LeadFormState>(EMPTY_FORM);
  const [leads, setLeads] = useState<SensoraStoredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [conversionLeadId, setConversionLeadId] = useState<string | null>(null);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [conversionNotice, setConversionNotice] = useState<Notice>(null);

  const canSubmit = Boolean(
    form.customerName.trim() &&
      form.phone.trim() &&
      form.source &&
      form.interestedVehicle.trim(),
  );

  const updateField = <K extends keyof LeadFormState>(field: K, value: LeadFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (notice) setNotice(null);
  };

  const loadLeads = async () => {
    setLoading(true);
    setLoadError("");
    try {
      setLeads(await listSensoraLeads(DEFAULT_SENSORA_WORKSPACE_ID));
    } catch (error) {
      setLoadError(getSensoraLeadPersistenceMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const storedLeads = await listSensoraLeads(DEFAULT_SENSORA_WORKSPACE_ID);
        if (active) setLeads(storedLeads);
      } catch (error) {
        if (active) setLoadError(getSensoraLeadPersistenceMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || saving || !form.source) return;

    setSaving(true);
    setNotice(null);

    try {
      const savedLead = await createSensoraLead({
        workspaceId: DEFAULT_SENSORA_WORKSPACE_ID,
        customerName: form.customerName,
        phone: form.phone,
        source: form.source,
        interestedVehicle: form.interestedVehicle,
        purchaseTiming: form.purchaseTiming,
        preferredContactTime: form.preferredContactTime,
        memo: form.memo,
      });
      setLeads((current) => [savedLead, ...current.filter((lead) => lead.id !== savedLead.id)]);
      setLoadError("");
      setForm(EMPTY_FORM);
      setNotice({ tone: "success", message: "Lead가 Firestore에 저장되었습니다." });
    } catch (error) {
      setNotice({ tone: "error", message: getSensoraLeadPersistenceMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleConvertLead = async (lead: SensoraStoredLead) => {
    if (convertingLeadId || lead.status === "converted" || lead.convertedCustomerId) return;

    setConvertingLeadId(lead.id);
    setConversionNotice(null);
    try {
      const result = await convertSensoraLeadToCustomer({
        workspaceId: DEFAULT_SENSORA_WORKSPACE_ID,
        leadId: lead.id,
      });
      setLeads((current) => current.map((item) => (
        item.id === lead.id
          ? {
              ...item,
              status: result.lead.status,
              convertedCustomerId: result.lead.convertedCustomerId,
              updatedAt: result.lead.updatedAt,
            }
          : item
      )));
      setSelectedLeadId(lead.id);
      setConversionLeadId(null);
      setConversionNotice({
        tone: "success",
        message: `${result.customer.name} Customer가 생성되고 Lead 전환 상태가 저장되었습니다.`,
      });
    } catch (error) {
      setConversionNotice({
        tone: "error",
        message: getSensoraCustomerPersistenceMessage(error),
      });
    } finally {
      setConvertingLeadId(null);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
      <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="lead-form-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--s-brand-tint)] px-2.5 py-1 text-xs font-semibold text-[var(--s-brand-text)]">Lead 접수 Beta</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${firebaseConfigured ? "border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] text-[var(--s-ok-text)]" : "border-[var(--s-err-border)] bg-[var(--s-err-tint)] text-[var(--s-err-text)]"}`}>
                {firebaseConfigured ? "Firestore 저장 연결" : "Firebase 설정 필요"}
              </span>
            </div>
            <h1 id="lead-form-title" className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[var(--s-text)]">신규 Lead 직접 등록</h1>
            <p className="mt-2 text-[0.8125rem] leading-6 text-[var(--s-text-4)]">저장된 Lead의 Customer 전환은 사용자가 직접 확인하고 실행합니다.</p>
          </div>
          <span className="rounded-lg border border-[var(--s-border)] bg-[var(--s-deep)] px-3 py-2 text-xs text-[var(--s-text-3)]">Beta workspace</span>
        </div>

        <div className="mt-5 rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] p-4 text-[0.8125rem] leading-6 text-[var(--s-text-2)]">
          <p>Lead 저장은 사용자가 직접 입력 후 저장할 때만 실행됩니다.</p>
          <p className="mt-1">Customer 전환은 수동 실행이며 담당자 자동 배정, 문자 발송, Follow-up 자동 생성은 실행되지 않습니다.</p>
        </div>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            고객명 <span className="text-[var(--s-brand-text)]">*</span>
            <input value={form.customerName} onChange={(event) => updateField("customerName", event.target.value)} className={inputClass} placeholder="예: 김도윤" autoComplete="name" required />
          </label>
          <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            연락처 <span className="text-[var(--s-brand-text)]">*</span>
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={inputClass} placeholder="예: 010-1234-5678" inputMode="tel" autoComplete="tel" required />
          </label>
          <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            유입 경로 <span className="text-[var(--s-brand-text)]">*</span>
            <select value={form.source} onChange={(event) => updateField("source", event.target.value as LeadFormState["source"])} className={inputClass} required>
              <option value="">유입 경로 선택</option>
              {Object.entries(sourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            관심 차량 <span className="text-[var(--s-brand-text)]">*</span>
            <input value={form.interestedVehicle} onChange={(event) => updateField("interestedVehicle", event.target.value)} className={inputClass} placeholder="예: GV80 3.5T AWD" required />
          </label>
          <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            구매 시기
            <input value={form.purchaseTiming} onChange={(event) => updateField("purchaseTiming", event.target.value)} className={inputClass} placeholder="예: 3개월 이내" />
          </label>
          <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
            선호 연락 시간
            <input value={form.preferredContactTime} onChange={(event) => updateField("preferredContactTime", event.target.value)} className={inputClass} placeholder="예: 평일 오후 6시 이후" />
          </label>
          <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)] sm:col-span-2">
            상담 메모
            <textarea value={form.memo} onChange={(event) => updateField("memo", event.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="고객이 직접 전달한 요청과 확인할 사항을 입력하세요." />
          </label>

          <div className="sm:col-span-2" aria-live="polite">
            {notice ? (
              <p className={`mb-3 rounded-lg border px-4 py-3 text-sm ${notice.tone === "success" ? "border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] text-[var(--s-ok-text)]" : "border-[var(--s-err-border)] bg-[var(--s-err-tint)] text-[var(--s-err-text)]"}`} role={notice.tone === "error" ? "alert" : "status"}>
                {notice.message}
              </p>
            ) : null}
            <button type="submit" disabled={!canSubmit || saving} className="w-full rounded-lg bg-[var(--s-brand)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--s-brand-hover)] disabled:cursor-not-allowed disabled:bg-[var(--s-border-2)] disabled:text-[var(--s-text-3)]">
              {saving ? "Firestore에 저장 중…" : "Lead 저장"}
            </button>
            <p className="mt-2 text-center text-xs text-[var(--s-text-4)]">필수값을 입력하고 버튼을 눌러야만 저장됩니다.</p>
          </div>
        </form>
      </section>

      <div className="grid content-start gap-5">
        <SavedLeadList
          leads={leads}
          loading={loading}
          loadError={loadError}
          conversionNotice={conversionNotice}
          selectedLeadId={selectedLeadId}
          conversionLeadId={conversionLeadId}
          convertingLeadId={convertingLeadId}
          onRetry={() => void loadLeads()}
          onToggleDetail={(leadId) => setSelectedLeadId((current) => current === leadId ? null : leadId)}
          onRequestConversion={(leadId) => {
            setSelectedLeadId(leadId);
            setConversionLeadId(leadId);
            setConversionNotice(null);
          }}
          onCancelConversion={() => setConversionLeadId(null)}
          onConfirmConversion={(lead) => void handleConvertLead(lead)}
        />

        <section className="rounded-2xl border border-dashed border-[var(--s-border-2)] bg-[var(--s-deep)] p-5" aria-labelledby="demo-leads-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-text-3)]">Demo data</p>
              <h2 id="demo-leads-title" className="mt-1 text-sm font-semibold text-[var(--s-text-emph)]">화면 흐름 참고 데이터</h2>
            </div>
            <span className="text-xs text-[var(--s-text-4)]">Firestore에 저장되지 않음</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {previewLeads.map((lead) => (
              <div key={lead.id} className="min-w-0 rounded-lg border border-[var(--s-border)] bg-[var(--s-card)] p-3">
                <p className="truncate text-[0.8125rem] font-medium text-[var(--s-text-2)]">{lead.customerName}</p>
                <p className="mt-1 truncate text-xs text-[var(--s-text-4)]">{lead.interestedVehicle}</p>
                <p className="mt-2 text-xs text-[var(--s-text-4)]">{sourceLabels[lead.source]} · {lead.assignedUserId ? userLabels[lead.assignedUserId] ?? "담당자 확인" : "미배정"}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function SensoraLeadQueueView({ compact = false }: { compact?: boolean }) {
  return compact ? <LeadPreview /> : <LeadPersistenceView />;
}
