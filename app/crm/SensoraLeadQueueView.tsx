"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { isFirebaseConfigured } from "@/app/firebase/client";
import {
  createSensoraLead,
  DEFAULT_SENSORA_WORKSPACE_ID,
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
  "mt-2 w-full rounded-lg border border-[#343A43] bg-[#101216] px-3 py-2.5 text-sm text-[#F4F6F8] outline-none transition placeholder:text-[#656D78] focus:border-[#8B3A4D] focus:ring-2 focus:ring-[#7A263A]/20 disabled:cursor-not-allowed disabled:opacity-60";

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
      className="min-h-[380px] min-w-0 max-w-full rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6"
      aria-labelledby="lead-preview-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Lead Intake</p>
          <h2 id="lead-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">
            신규 Lead 접수
          </h2>
        </div>
        <span className="rounded-lg bg-[#2A151B] px-4 py-2 text-[10px] font-medium text-[#A93754]">
          Demo data
        </span>
      </div>

      <dl className="mt-9 grid min-h-[150px] grid-cols-[68px_1fr] content-center gap-x-4 gap-y-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] p-4 text-[11px]">
        <dt className="text-[#7F8792]">접수 채널</dt>
        <dd className="text-[#B7BDC6]">전시장 전화 · 직접 방문</dd>
        <dt className="text-[#7F8792]">온라인 문의</dt>
        <dd className="text-[#B7BDC6]">웹 폼 유입</dd>
        <dt className="text-[#7F8792]">저장 방식</dt>
        <dd className="text-[#B7BDC6]">사용자 직접 입력 후 저장</dd>
        <dt className="text-[#7F8792]">현재 단계</dt>
        <dd className="text-[#B7BDC6]">Lead 접수 Beta</dd>
      </dl>

      <div className="mt-6 rounded-lg border border-[#2B3037] bg-[#101216] p-4">
        <p className="text-xs font-semibold text-[#D3D7DD]">Firestore 저장 기능은 Lead 접수 메뉴에서 사용합니다.</p>
        <p className="mt-2 text-[10px] leading-4 text-[#7F8792]">고객 전환·담당자 배정·문자 발송은 연결되어 있지 않습니다.</p>
      </div>
    </section>
  );
}

function SavedLeadList({ leads, loading, loadError, onRetry }: {
  leads: SensoraStoredLead[];
  loading: boolean;
  loadError: string;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="saved-leads-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4E8A66]">Live data</p>
          <h2 id="saved-leads-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">Firestore 저장 데이터</h2>
          <p className="mt-1 text-xs text-[#7F8792]">Demo data와 분리된 실제 Lead 목록입니다.</p>
        </div>
        <span className="rounded-full border border-[#2B3037] bg-[#101216] px-3 py-1.5 text-[10px] text-[#B7BDC6]">
          {leads.length}건
        </span>
      </div>

      {loading ? (
        <p className="mt-6 rounded-lg border border-[#2B3037] bg-[#101216] px-4 py-5 text-sm text-[#B7BDC6]" role="status">
          저장된 Lead를 불러오는 중입니다…
        </p>
      ) : null}

      {!loading && loadError ? (
        <div className="mt-6 rounded-lg border border-[#6E3442] bg-[#25151A] p-4" role="alert">
          <p className="text-sm text-[#E2A8B6]">{loadError}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {loadError.includes("로그인") ? (
              <Link href="/login" className="rounded-lg bg-[#7A263A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#8D3047]">
                승인 계정으로 로그인
              </Link>
            ) : null}
            <button type="button" onClick={onRetry} className="rounded-lg border border-[#6E3442] px-3 py-2 text-xs font-medium text-[#F1C6D0] hover:bg-[#321B22]">
              다시 조회
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !loadError && leads.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-[#343A43] bg-[#101216] px-4 py-8 text-center text-sm text-[#7F8792]">
          아직 저장된 Lead가 없습니다
        </p>
      ) : null}

      {!loading && leads.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {leads.map((lead) => (
            <article key={lead.id} className="grid gap-4 rounded-xl border border-[#2B3037] bg-[#101216] p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[#F4F6F8]">{lead.customerName}</h3>
                  <span className="rounded-full bg-[#1C2520] px-2 py-1 text-[10px] font-medium text-[#79A78B]">{statusLabels[lead.status]}</span>
                </div>
                <p className="mt-2 text-sm text-[#C5CAD1]">{maskSensoraLeadPhone(lead.phone)}</p>
                <p className="mt-1 truncate text-xs text-[#7F8792]">{summarizeMemo(lead.memo)}</p>
              </div>
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium text-[#D3D7DD]">{lead.interestedVehicle}</p>
                <p className="mt-1 text-[#7F8792]">{sourceLabels[lead.source]}</p>
              </div>
              <time className="text-[11px] text-[#7F8792]" dateTime={lead.createdAt}>{formatCreatedAt(lead.createdAt)}</time>
            </article>
          ))}
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
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

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

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
      <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="lead-form-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#2A151B] px-2.5 py-1 text-[10px] font-semibold text-[#C2667D]">Lead 접수 Beta</span>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${firebaseConfigured ? "border-[#355542] bg-[#17221B] text-[#79A78B]" : "border-[#6E3442] bg-[#25151A] text-[#E2A8B6]"}`}>
                {firebaseConfigured ? "Firestore 저장 연결" : "Firebase 설정 필요"}
              </span>
            </div>
            <h1 id="lead-form-title" className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[#F4F6F8]">신규 Lead 직접 등록</h1>
            <p className="mt-2 text-xs leading-5 text-[#8D949E]">고객 전환·담당자 배정·문자 발송은 아직 연결되어 있지 않습니다.</p>
          </div>
          <span className="rounded-lg border border-[#2B3037] bg-[#101216] px-3 py-2 text-[10px] text-[#7F8792]">Beta workspace</span>
        </div>

        <div className="mt-5 rounded-lg border border-[#3B414A] bg-[#101216] p-4 text-xs leading-5 text-[#B7BDC6]">
          <p>Lead 저장은 사용자가 직접 입력 후 저장할 때만 실행됩니다.</p>
          <p className="mt-1">고객 전환, 담당자 배정, 문자 발송은 아직 연결되어 있지 않습니다.</p>
        </div>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <label className="text-xs font-medium text-[#B7BDC6]">
            고객명 <span className="text-[#C2667D]">*</span>
            <input value={form.customerName} onChange={(event) => updateField("customerName", event.target.value)} className={inputClass} placeholder="예: 김도윤" autoComplete="name" required />
          </label>
          <label className="text-xs font-medium text-[#B7BDC6]">
            연락처 <span className="text-[#C2667D]">*</span>
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={inputClass} placeholder="예: 010-1234-5678" inputMode="tel" autoComplete="tel" required />
          </label>
          <label className="text-xs font-medium text-[#B7BDC6]">
            유입 경로 <span className="text-[#C2667D]">*</span>
            <select value={form.source} onChange={(event) => updateField("source", event.target.value as LeadFormState["source"])} className={inputClass} required>
              <option value="">유입 경로 선택</option>
              {Object.entries(sourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-[#B7BDC6]">
            관심 차량 <span className="text-[#C2667D]">*</span>
            <input value={form.interestedVehicle} onChange={(event) => updateField("interestedVehicle", event.target.value)} className={inputClass} placeholder="예: GV80 3.5T AWD" required />
          </label>
          <label className="text-xs font-medium text-[#B7BDC6]">
            구매 시기
            <input value={form.purchaseTiming} onChange={(event) => updateField("purchaseTiming", event.target.value)} className={inputClass} placeholder="예: 3개월 이내" />
          </label>
          <label className="text-xs font-medium text-[#B7BDC6]">
            선호 연락 시간
            <input value={form.preferredContactTime} onChange={(event) => updateField("preferredContactTime", event.target.value)} className={inputClass} placeholder="예: 평일 오후 6시 이후" />
          </label>
          <label className="text-xs font-medium text-[#B7BDC6] sm:col-span-2">
            상담 메모
            <textarea value={form.memo} onChange={(event) => updateField("memo", event.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="고객이 직접 전달한 요청과 확인할 사항을 입력하세요." />
          </label>

          <div className="sm:col-span-2" aria-live="polite">
            {notice ? (
              <p className={`mb-3 rounded-lg border px-4 py-3 text-sm ${notice.tone === "success" ? "border-[#355542] bg-[#17221B] text-[#9CC7AB]" : "border-[#6E3442] bg-[#25151A] text-[#E2A8B6]"}`} role={notice.tone === "error" ? "alert" : "status"}>
                {notice.message}
              </p>
            ) : null}
            <button type="submit" disabled={!canSubmit || saving} className="w-full rounded-lg bg-[#7A263A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8D3047] disabled:cursor-not-allowed disabled:bg-[#343A43] disabled:text-[#7F8792]">
              {saving ? "Firestore에 저장 중…" : "Lead 저장"}
            </button>
            <p className="mt-2 text-center text-[10px] text-[#656D78]">필수값을 입력하고 버튼을 눌러야만 저장됩니다.</p>
          </div>
        </form>
      </section>

      <div className="grid content-start gap-5">
        <SavedLeadList leads={leads} loading={loading} loadError={loadError} onRetry={() => void loadLeads()} />

        <section className="rounded-2xl border border-dashed border-[#343A43] bg-[#101216] p-5" aria-labelledby="demo-leads-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7F8792]">Demo data</p>
              <h2 id="demo-leads-title" className="mt-1 text-sm font-semibold text-[#D3D7DD]">화면 흐름 참고 데이터</h2>
            </div>
            <span className="text-[10px] text-[#656D78]">Firestore에 저장되지 않음</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {previewLeads.map((lead) => (
              <div key={lead.id} className="min-w-0 rounded-lg border border-[#2B3037] bg-[#14171B] p-3">
                <p className="truncate text-xs font-medium text-[#B7BDC6]">{lead.customerName}</p>
                <p className="mt-1 truncate text-[10px] text-[#656D78]">{lead.interestedVehicle}</p>
                <p className="mt-2 text-[10px] text-[#8D949E]">{sourceLabels[lead.source]} · {lead.assignedUserId ? userLabels[lead.assignedUserId] ?? "담당자 확인" : "미배정"}</p>
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
