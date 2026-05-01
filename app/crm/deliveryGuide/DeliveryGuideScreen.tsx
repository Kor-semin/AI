"use client";

import { useMemo, useState } from "react";

import type { Customer, DeliveryGuide } from "@/app/crm/types";
import { DeliveryGuideEditor } from "@/app/crm/deliveryGuide/DeliveryGuideEditor";
import { DeliveryGuidePreview } from "@/app/crm/deliveryGuide/DeliveryGuidePreview";
import { ensureGuide } from "@/app/crm/deliveryGuide/deliveryGuideUtils";
import { formatDeliveryGuideShareText } from "@/app/crm/deliveryGuide/formatDeliveryGuideShare";

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 폴백 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.readOnly = true;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.left = "0";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

type Props = {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomerId: (id: string) => void;
  onUpsertCustomerGuide: (customerId: string, guide: DeliveryGuide) => void;
  /** 복사 결과·준비 중 안내 등 */
  onNotify?: (message: string) => void;
};

export function DeliveryGuideScreen({
  customers,
  selectedCustomerId,
  onSelectCustomerId,
  onUpsertCustomerGuide,
  onNotify,
}: Props) {
  const customer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );
  const [previewReady, setPreviewReady] = useState(false);

  if (!customer) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FFFFFF] p-5 text-sm text-[#6B7280]">
        고객을 찾지 못했습니다.
      </div>
    );
  }

  const guide = customer.deliveryGuide;
  const safeGuide = ensureGuide(guide);

  return (
    <div className="grid gap-5">
      <header className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-base font-extrabold tracking-[-0.02em] text-[#111827]">
              AI 출고 안내서
            </div>
            <div className="mt-1 text-sm leading-relaxed text-[#374151]">
              사진과 견적 정보를 넣으면 고객에게 보낼 안내서 형태로 정리됩니다.
            </div>
          </div>
          <span className="crm-free-badge">미리보기</span>
        </div>

        <div className="mt-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#334155]">
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">
            주의
          </div>
          <div className="mt-1 leading-relaxed text-[#475569]">
            고객 개인정보와 금융정보가 포함될 수 있습니다. 공유 전 내용을 반드시 확인하세요.
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5">
        <div className="text-sm font-semibold text-[#111827]">고객 선택</div>
        <div className="mt-3 grid gap-2">
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setPreviewReady(false);
              onSelectCustomerId(e.target.value);
            }}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 text-sm font-semibold outline-none focus:border-[#94A3B8]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.phone?.trim() ? ` · ${c.phone}` : ""}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-[#6B7280]">
            선택한 고객의 안내서 내용은 고객 카드에 저장됩니다.
          </div>
        </div>
      </section>

      {/* 입력 영역들 */}
      <DeliveryGuideEditor
        customer={customer}
        guide={guide}
        showHeader={false}
        onChange={(next) => onUpsertCustomerGuide(customer.id, next)}
      />

      {/* 미리보기 영역 */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-[#111827]">안내서 미리보기</div>
            <div className="mt-1 text-xs text-[#6B7280]">
              버튼을 누르면 현재 입력값으로 문서 형태 미리보기가 표시됩니다.
            </div>
          </div>
          <div className="flex max-w-full min-w-0 flex-wrap gap-2">
            <button
              type="button"
              className="crm-ink-btn min-h-[44px] shrink-0 rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation"
              onClick={() => {
                // 가이드가 비어있다면 생성해둔 뒤 미리보기 활성화
                if (!guide) onUpsertCustomerGuide(customer.id, safeGuide);
                setPreviewReady(true);
              }}
            >
              안내서 미리보기 만들기
            </button>
            <button
              type="button"
              className="crm-ghost-btn min-h-[44px] shrink-0 rounded-lg px-3 py-2 text-xs font-semibold touch-manipulation"
              onClick={() => {
                const text = formatDeliveryGuideShareText(customer, guide ?? safeGuide);
                void copyTextToClipboard(text).then((ok) => {
                  onNotify?.(ok ? "안내서 요약 텍스트를 복사했습니다." : "복사에 실패했습니다. 텍스트 영역에서 길게 눌러 복사해 주세요.");
                });
              }}
            >
              안내서 텍스트 복사
            </button>
            <button
              type="button"
              title="준비 중인 기능입니다"
              className="crm-ghost-btn min-h-[44px] shrink-0 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#64748B] touch-manipulation hover:bg-[#F8FAFC]"
              onClick={() => onNotify?.("PDF 저장은 준비 중인 기능입니다.")}
            >
              PDF 저장(준비 중)
            </button>
          </div>
        </div>

        {previewReady ? (
          <div className="mt-4">
            <DeliveryGuidePreview customer={customer} guide={guide ?? safeGuide} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]">
            아직 미리보기가 없습니다. “안내서 미리보기 만들기”를 눌러 확인하세요.
          </div>
        )}
      </section>
    </div>
  );
}

