"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_SENSORA_WORKSPACE_ID,
  getSensoraCustomerPersistenceMessage,
  listSensoraCustomers,
  sensoraB2BSeedData,
  type SensoraCustomer,
  type SensoraStoredCustomer,
} from "@/lib/sensora";

const baseCustomer = sensoraB2BSeedData.customers[0];

const previewCustomers: SensoraCustomer[] = [
  { ...baseCustomer, id: "customer_preview_1", name: "박민지", interestedVehicle: "Genesis GV70 2.5T AWD", status: "test_drive_scheduled", probability: 78, nextFollowUpAt: "2026-06-22T14:00:00.000Z" },
  { ...baseCustomer, id: "customer_preview_2", name: "김태훈", interestedVehicle: "BMW X5 xDrive40i", status: "quote_sent", probability: 66, nextFollowUpAt: "2026-06-22T16:30:00.000Z" },
  { ...baseCustomer, id: "customer_preview_3", name: "이수현", interestedVehicle: "Mercedes-Benz E300", status: "contract_likely", probability: 84, nextFollowUpAt: "2026-06-23T10:00:00.000Z" },
  { ...baseCustomer, id: "customer_preview_4", name: "정유진", interestedVehicle: "Audi A6 45 TFSI", status: "consulting", probability: 45, nextFollowUpAt: "2026-06-24T11:00:00.000Z" },
];

const statusLabels: Record<SensoraCustomer["status"], string> = {
  new: "신규",
  contacted: "연락 완료",
  consulting: "상담 진행",
  quote_sent: "견적 전달",
  test_drive_scheduled: "시승 예정",
  contract_likely: "계약 유력",
  contracted: "계약 완료",
  delivered: "출고 완료",
  lost: "보류",
  inactive: "비활성",
};

function maskPhone(phone: string): string {
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

export function SensoraCustomerView() {
  const [storedCustomers, setStoredCustomers] = useState<SensoraStoredCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const customers = await listSensoraCustomers(DEFAULT_SENSORA_WORKSPACE_ID);
        if (active) setStoredCustomers(customers);
      } catch (error) {
        if (active) setLoadError(getSensoraCustomerPersistenceMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B0D] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Customer Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] text-[#F4F6F8]">고객관리</h1>
          <p className="mt-1.5 text-xs text-[#7F8792]">직접 전환한 Customer와 Demo data를 구분해 확인합니다.</p>
        </div>
        <span className="rounded-lg border border-[#355542] bg-[#17221B] px-4 py-2 text-[10px] text-[#79A78B]">Firestore Customer 조회</span>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="고객관리 요약">
        {[
          ["Firestore 고객", String(storedCustomers.length), "본인이 전환한 Customer"],
          ["Demo 고객", String(previewCustomers.length), "화면 구조 참고용"],
          ["자동 발송", "0", "문자 발송 연결 안 됨"],
          ["자동 Follow-up", "0", "자동 생성 연결 안 됨"],
        ].map(([label, value, detail]) => (
          <article key={label} className="min-h-[120px] rounded-2xl border border-[#2B3037] bg-[#14171B] p-4">
            <p className="text-[11px] text-[#B7BDC6]">{label}</p>
            <p className="mt-3 text-[28px] font-semibold leading-none text-[#F4F6F8]">{value}</p>
            <p className="mt-3 text-[10px] text-[#7F8792]">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="stored-customer-list-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4E8A66]">Live data</p>
            <h2 id="stored-customer-list-title" className="mt-2 text-lg font-semibold text-[#F4F6F8]">Firestore Customer</h2>
          </div>
          <span className="rounded-full border border-[#2B3037] bg-[#101216] px-3 py-1.5 text-[10px] text-[#B7BDC6]">{storedCustomers.length}명</span>
        </div>

        {loading ? <p className="mt-5 rounded-lg bg-[#101216] px-4 py-5 text-sm text-[#B7BDC6]" role="status">Customer를 불러오는 중입니다…</p> : null}
        {!loading && loadError ? <p className="mt-5 rounded-lg border border-[#6E3442] bg-[#25151A] px-4 py-4 text-sm text-[#E2A8B6]" role="alert">{loadError}</p> : null}
        {!loading && !loadError && storedCustomers.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-[#343A43] bg-[#101216] px-4 py-8 text-center text-sm text-[#7F8792]">아직 전환된 Customer가 없습니다</p>
        ) : null}
        {!loading && storedCustomers.length > 0 ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {storedCustomers.map((customer) => (
              <article key={customer.id} className="rounded-xl border border-[#2B3037] bg-[#101216] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#F4F6F8]">{customer.name}</h3>
                      <span className="rounded-full bg-[#1C2520] px-2 py-1 text-[10px] text-[#79A78B]">{statusLabels[customer.status]}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#C5CAD1]">{maskPhone(customer.phone)}</p>
                  </div>
                  <time className="text-[10px] text-[#656D78]" dateTime={customer.createdAt}>{formatCreatedAt(customer.createdAt)}</time>
                </div>
                <p className="mt-4 text-sm font-medium text-[#D3D7DD]">{customer.interestedVehicle}</p>
                <p className="mt-2 text-xs leading-5 text-[#7F8792]">{customer.memo || "전환된 Lead의 메모가 없습니다."}</p>
                <p className="mt-3 break-all border-t border-[#2B3037] pt-3 font-mono text-[10px] text-[#656D78]">Lead · {customer.leadId}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-[#343A43] bg-[#101216] p-5 sm:p-6" aria-labelledby="demo-customer-list-title">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7F8792]">Demo data</p>
            <h2 id="demo-customer-list-title" className="mt-2 text-lg font-semibold text-[#D3D7DD]">고객관리 화면 참고 데이터</h2>
          </div>
          <span className="text-[10px] text-[#656D78]">Firestore에 저장되지 않음</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {previewCustomers.map((customer) => (
            <article key={customer.id} className="rounded-lg border border-[#2B3037] bg-[#14171B] p-4">
              <p className="text-sm font-semibold text-[#D3D7DD]">{customer.name}</p>
              <p className="mt-2 truncate text-xs text-[#8D949E]">{customer.interestedVehicle}</p>
              <p className="mt-3 text-[10px] text-[#656D78]">{statusLabels[customer.status]} · 계약 가능성 {customer.probability}%</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
