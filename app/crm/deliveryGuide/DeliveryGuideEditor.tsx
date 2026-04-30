"use client";

import { useMemo, useRef, useState } from "react";

import type {
  Customer,
  DeliveryGuide,
  DeliveryGuideImage,
  DeliveryGuidePricing,
  DeliveryGuideServiceItems,
} from "@/app/crm/types";
import {
  addImages,
  ensureGuide,
  nowIso,
  removeImage,
  upsertGuide,
} from "@/app/crm/deliveryGuide/deliveryGuideUtils";

type Props = {
  customer: Customer;
  guide: DeliveryGuide | undefined;
  onChange: (next: DeliveryGuide) => void;
  /** 상단 설명/메타 영역 표시 여부 (기본 true) */
  showHeader?: boolean;
};

function parseDateOnlyToIso(v: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function isoToDateOnlyInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export function DeliveryGuideEditor({ customer, guide, onChange, showHeader = true }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const current = useMemo(() => ensureGuide(guide), [guide]);

  const updateServices = (patch: Partial<DeliveryGuideServiceItems>) => {
    onChange(
      upsertGuide(guide, {
        services: { ...(current.services ?? {}), ...patch },
      }),
    );
  };

  const updatePricing = (patch: Partial<DeliveryGuidePricing>) => {
    onChange(
      upsertGuide(guide, {
        pricing: { ...(current.pricing ?? {}), ...patch },
      }),
    );
  };

  const addUploadedFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const list = Array.from(files).slice(0, 12);
      const imgs: DeliveryGuideImage[] = [];
      for (const f of list) {
        const dataUrl = await fileToDataUrl(f);
        imgs.push({ id: makeId("img"), dataUrl, caption: "" });
      }
      onChange(addImages(guide, imgs));
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-5">
      {showHeader ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-[#111827]">
                안내서 입력
              </div>
              <div className="mt-1 text-xs text-[#6B7280]">
                입력한 내용을 바탕으로 안내서 미리보기를 생성합니다.
              </div>
            </div>
            <div className="text-[11px] font-semibold text-[#6B7280]">
              마지막 수정: {new Date(current.updatedAt || nowIso()).toLocaleString("ko-KR")}
            </div>
          </div>
        </div>
      ) : null}

      <Section title="1) 고객 기본 정보">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadOnlyField label="고객명" value={customer.name} />
          <ReadOnlyField label="연락처" value={customer.phone ?? "-"} />
          <DateField
            label="계약일"
            valueIso={current.contractDate}
            onChangeIso={(iso) => onChange(upsertGuide(guide, { contractDate: iso }))}
          />
          <DateField
            label="출고 예정일"
            valueIso={current.deliveryEtaDate}
            onChangeIso={(iso) => onChange(upsertGuide(guide, { deliveryEtaDate: iso }))}
          />
          <TextField
            label="모델명"
            value={current.modelName ?? customer.interestedModel ?? ""}
            placeholder="예: 디 올 뉴 그랜저 하이브리드"
            onChange={(v) => onChange(upsertGuide(guide, { modelName: v }))}
          />
          <TextField
            label="연식"
            value={current.modelYear ?? ""}
            placeholder="예: 2026"
            onChange={(v) => onChange(upsertGuide(guide, { modelYear: v }))}
          />
          <TextField
            label="외장 색상"
            value={current.exteriorColor ?? ""}
            placeholder="예: 어비스 블랙"
            onChange={(v) => onChange(upsertGuide(guide, { exteriorColor: v }))}
          />
          <TextField
            label="내장 색상"
            value={current.interiorColor ?? ""}
            placeholder="예: 베이지"
            onChange={(v) => onChange(upsertGuide(guide, { interiorColor: v }))}
          />
          <TextField
            label="출고 장소"
            value={current.deliveryPlace ?? ""}
            placeholder="예: OO전시장 / OO탁송장"
            onChange={(v) => onChange(upsertGuide(guide, { deliveryPlace: v }))}
          />
        </div>
      </Section>

      <Section title="2) 서비스 품목 안내">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="선팅 브랜드"
            value={current.services?.tintBrand ?? ""}
            placeholder="예: 3M / 루마 / 브이쿨"
            onChange={(v) => updateServices({ tintBrand: v })}
          />
          <TextField
            label="추천 선팅 등급"
            value={current.services?.tintGrade ?? ""}
            placeholder="예: 전면 30 / 측후면 15"
            onChange={(v) => updateServices({ tintGrade: v })}
          />
          <TextField
            label="블랙박스"
            value={current.services?.blackbox ?? ""}
            placeholder="예: 2채널 / 모델명"
            onChange={(v) => updateServices({ blackbox: v })}
          />
          <TextField
            label="하이패스"
            value={current.services?.hipass ?? ""}
            placeholder="예: 룸미러형"
            onChange={(v) => updateServices({ hipass: v })}
          />
          <TextField
            label="유리막"
            value={current.services?.glassCoating ?? ""}
            placeholder="예: 포함 / 미포함 / 브랜드"
            onChange={(v) => updateServices({ glassCoating: v })}
          />
          <TextField
            label="PPF"
            value={current.services?.ppf ?? ""}
            placeholder="예: 도어엣지/헤드램프"
            onChange={(v) => updateServices({ ppf: v })}
          />
        </div>
        <div className="mt-3">
          <TextArea
            label="사은품"
            value={current.services?.gifts ?? ""}
            placeholder="예: 코일매트, 차량용 방향제, 세차 쿠폰"
            onChange={(v) => updateServices({ gifts: v })}
          />
        </div>
      </Section>

      <Section title="3) 시공 예시 이미지 (여러 장 업로드)">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="crm-ink-btn rounded-lg px-3 py-2 text-xs font-semibold"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            {busy ? "업로드 중…" : "이미지 추가"}
          </button>
          <div className="text-[11px] text-[#6B7280]">
            차량/선팅/견적/서비스 품목 사진 등을 여러 장 넣을 수 있어요. (최대 24장)
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void addUploadedFiles(e.target.files)}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(current.images ?? []).map((img) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- dataUrl 미리보기 */}
              <img src={img.dataUrl} alt="" className="h-44 w-full object-cover" />
              <div className="grid gap-2 p-3">
                <TextField
                  label="설명"
                  value={img.caption ?? ""}
                  placeholder="예: 선팅 농도 예시 / 서비스 품목 사진"
                  onChange={(v) => {
                    const nextImages = (current.images ?? []).map((x) =>
                      x.id === img.id ? { ...x, caption: v } : x,
                    );
                    onChange(upsertGuide(guide, { images: nextImages }));
                  }}
                />
                <button
                  type="button"
                  className="crm-ghost-btn rounded-lg px-3 py-2 text-xs font-semibold"
                  onClick={() => onChange(removeImage(guide, img.id))}
                >
                  이미지 제거
                </button>
              </div>
            </div>
          ))}
          {(current.images ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FFFFFF] p-4 text-xs text-[#6B7280]">
              아직 이미지가 없습니다. 위의 “이미지 추가”로 여러 장 업로드해 주세요.
            </div>
          ) : null}
        </div>
      </Section>

      <Section title="4) 가격/금융 요약">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="차량가격"
            value={current.pricing?.vehiclePrice ?? ""}
            placeholder="예: 52,300,000"
            onChange={(v) => updatePricing({ vehiclePrice: v })}
          />
          <TextField
            label="옵션비용"
            value={current.pricing?.optionsPrice ?? ""}
            placeholder="예: 2,100,000"
            onChange={(v) => updatePricing({ optionsPrice: v })}
          />
          <TextField
            label="할인금액"
            value={current.pricing?.discount ?? ""}
            placeholder="예: -1,500,000"
            onChange={(v) => updatePricing({ discount: v })}
          />
          <TextField
            label="최종 적용 가격"
            value={current.pricing?.finalPrice ?? ""}
            placeholder="예: 52,900,000"
            onChange={(v) => updatePricing({ finalPrice: v })}
          />
          <TextField
            label="금융사"
            value={current.pricing?.financeCompany ?? ""}
            placeholder="예: 현대캐피탈"
            onChange={(v) => updatePricing({ financeCompany: v })}
          />
          <TextField
            label="월 납입금"
            value={current.pricing?.monthlyPayment ?? ""}
            placeholder="예: 780,000"
            onChange={(v) => updatePricing({ monthlyPayment: v })}
          />
          <TextField
            label="초기부담금"
            value={current.pricing?.upfrontPayment ?? ""}
            placeholder="예: 5,000,000"
            onChange={(v) => updatePricing({ upfrontPayment: v })}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5">
      <div className="text-sm font-semibold text-[#111827]">{title}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <div className="text-xs font-semibold text-[#374151]">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#94A3B8]"
      />
    </label>
  );
}

function DateField({
  label,
  valueIso,
  onChangeIso,
}: {
  label: string;
  valueIso?: string;
  onChangeIso: (iso: string | undefined) => void;
}) {
  return (
    <label className="grid gap-1">
      <div className="text-xs font-semibold text-[#374151]">{label}</div>
      <input
        type="date"
        value={isoToDateOnlyInput(valueIso)}
        onChange={(e) => onChangeIso(parseDateOnlyToIso(e.target.value))}
        className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#94A3B8]"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <div className="text-xs font-semibold text-[#374151]">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[92px] w-full resize-y rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 text-sm outline-none focus:border-[#94A3B8]"
      />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-semibold text-[#374151]">{label}</div>
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827]">
        {value}
      </div>
    </div>
  );
}

