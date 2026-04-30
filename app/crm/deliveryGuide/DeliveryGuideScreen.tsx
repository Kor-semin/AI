"use client";

import { useMemo, useState } from "react";

import type { Customer, DeliveryGuide } from "@/app/crm/types";
import { DeliveryGuideEditor } from "@/app/crm/deliveryGuide/DeliveryGuideEditor";
import { DeliveryGuidePreview } from "@/app/crm/deliveryGuide/DeliveryGuidePreview";
import { ensureGuide } from "@/app/crm/deliveryGuide/deliveryGuideUtils";

type Props = {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomerId: (id: string) => void;
  onUpsertCustomerGuide: (customerId: string, guide: DeliveryGuide) => void;
};

export function DeliveryGuideScreen({
  customers,
  selectedCustomerId,
  onSelectCustomerId,
  onUpsertCustomerGuide,
}: Props) {
  const customer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );
  const [previewReady, setPreviewReady] = useState(false);

  if (!customer) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--edge)] bg-[color:var(--paper)] p-5 text-sm text-zinc-600 dark:text-zinc-300">
        고객을 찾지 못했습니다.
      </div>
    );
  }

  const guide = customer.deliveryGuide;
  const safeGuide = ensureGuide(guide);

  return (
    <div className="grid gap-5">
      <header className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-base font-extrabold tracking-[-0.02em] text-[color:var(--foreground)]">
              AI 출고 안내서
            </div>
            <div className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
              사진과 견적 정보를 넣으면 고객에게 보낼 안내서 형태로 정리됩니다.
            </div>
          </div>
          <span className="crm-free-badge">미리보기</span>
        </div>

        <div className="mt-4 rounded-xl border border-amber-700/20 bg-amber-50/60 px-4 py-3 text-sm text-amber-950 dark:border-amber-300/15 dark:bg-amber-950/25 dark:text-amber-50">
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[color:var(--gold-ink)]">
            주의
          </div>
          <div className="mt-1 leading-relaxed">
            고객 개인정보와 금융정보가 포함될 수 있습니다. 공유 전 내용을 반드시 확인하세요.
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5">
        <div className="text-sm font-semibold text-[color:var(--foreground)]">고객 선택</div>
        <div className="mt-3 grid gap-2">
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setPreviewReady(false);
              onSelectCustomerId(e.target.value);
            }}
            className="w-full rounded-xl border border-[color:var(--edge)] bg-[color:var(--paper)] px-3 py-2 text-sm font-semibold outline-none focus:border-[color:var(--edge-strong)]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.phone?.trim() ? ` · ${c.phone}` : ""}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-zinc-600 dark:text-zinc-300">
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
      <section className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-[color:var(--foreground)]">안내서 미리보기</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
              버튼을 누르면 현재 입력값으로 문서 형태 미리보기가 표시됩니다.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="moleskine-ink-btn rounded-lg px-3 py-2 text-xs font-semibold"
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
              className="moleskine-ghost-btn rounded-lg px-3 py-2 text-xs font-semibold"
              onClick={() => alert("PDF 저장은 다음 단계에서 구현합니다.")}
            >
              PDF 저장 준비
            </button>
          </div>
        </div>

        {previewReady ? (
          <div className="mt-4">
            <DeliveryGuidePreview customer={customer} guide={guide ?? safeGuide} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--edge)] bg-[color:var(--paper-2)] p-4 text-sm text-zinc-600 dark:text-zinc-300">
            아직 미리보기가 없습니다. “안내서 미리보기 만들기”를 눌러 확인하세요.
          </div>
        )}
      </section>
    </div>
  );
}

