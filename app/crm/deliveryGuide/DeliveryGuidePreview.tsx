"use client";

import type { Customer, DeliveryGuide } from "@/app/crm/types";

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  } catch {
    return iso;
  }
}

function pick(v?: string): string {
  const t = (v ?? "").trim();
  return t ? t : "-";
}

export function DeliveryGuidePreview({ customer, guide }: { customer: Customer; guide: DeliveryGuide }) {
  const services = guide.services ?? {};
  const pricing = guide.pricing ?? {};
  const images = guide.images ?? [];

  const pageShell =
    "rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-[0_18px_42px_-26px_rgba(15,23,42,0.25)] print:shadow-none";

  const pageTitle = "text-sm font-extrabold tracking-[-0.02em] text-[#111827]";
  const pageMeta = "mt-1 text-[11px] font-semibold text-[#6B7280]";
  const h2 = "text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]";
  const grid = "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2";

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-sm font-extrabold text-[#111827]">안내서 미리보기</div>
            <div className="mt-1 text-xs text-[#6B7280]">
              고객에게 공유하기 전, 문서 형태로 어떻게 보이는지 확인합니다. (PDF/공유는 다음 단계)
            </div>
          </div>
          <span className="crm-free-badge">문서 미리보기</span>
        </div>
      </div>

      {/* Page 1 */}
      <section className={pageShell} aria-label="출고 안내서 1페이지">
        <div className={pageTitle}>AI 출고 안내서</div>
        <div className={pageMeta}>
          고객: {customer.name} · 모델: {pick(guide.modelName ?? customer.interestedModel)}
        </div>

        <div className="mt-5">
          <div className={h2}>1페이지 · 고객 기본 정보</div>
          <div className={grid}>
            <KV label="고객명" value={customer.name} />
            <KV label="연락처" value={pick(customer.phone)} />
            <KV label="계약일" value={formatDate(guide.contractDate)} />
            <KV label="출고 예정일" value={formatDate(guide.deliveryEtaDate)} />
            <KV label="모델명" value={pick(guide.modelName ?? customer.interestedModel)} />
            <KV label="연식" value={pick(guide.modelYear)} />
            <KV label="외장 색상" value={pick(guide.exteriorColor)} />
            <KV label="내장 색상" value={pick(guide.interiorColor)} />
            <KV label="출고 장소" value={pick(guide.deliveryPlace)} />
            <KV label="서비스 품목 요약" value={serviceSummary(services)} wide />
          </div>
        </div>
      </section>

      {/* Page 2 */}
      <section className={pageShell} aria-label="출고 안내서 2페이지">
        <div className={pageTitle}>서비스 품목 안내</div>
        <div className={pageMeta}>시공/장착 품목을 고객이 보기 쉽게 정리합니다.</div>
        <div className="mt-5">
          <div className={h2}>2페이지 · 서비스 품목</div>
          <div className={grid}>
            <KV label="선팅 브랜드" value={pick(services.tintBrand)} />
            <KV label="추천 선팅 등급" value={pick(services.tintGrade)} />
            <KV label="블랙박스" value={pick(services.blackbox)} />
            <KV label="하이패스" value={pick(services.hipass)} />
            <KV label="유리막" value={pick(services.glassCoating)} />
            <KV label="PPF" value={pick(services.ppf)} />
            <KV label="사은품" value={pick(services.gifts)} wide />
          </div>
        </div>
      </section>

      {/* Page 3 */}
      <section className={pageShell} aria-label="출고 안내서 3페이지">
        <div className={pageTitle}>시공 예시 이미지</div>
        <div className={pageMeta}>업로드한 이미지들을 카드 형태로 보여줍니다.</div>

        <div className="mt-5">
          <div className={h2}>3페이지 · 이미지</div>
          {images.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {images.map((img) => (
                <figure
                  key={img.id}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- dataUrl 미리보기 */}
                  <img src={img.dataUrl} alt="" className="h-44 w-full object-cover" />
                  <figcaption className="p-3 text-xs text-[#374151]">
                    <div className="font-semibold text-[#111827]">
                      {pick(img.caption)}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FFFFFF] p-4 text-xs text-[#6B7280]">
              아직 업로드된 이미지가 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* Page 4 */}
      <section className={pageShell} aria-label="출고 안내서 4페이지">
        <div className={pageTitle}>가격/금융 요약</div>
        <div className={pageMeta}>가격·할인·금융 정보를 한 페이지로 정리합니다.</div>
        <div className="mt-5">
          <div className={h2}>4페이지 · 가격/금융</div>
          <div className={grid}>
            <KV label="차량가격" value={pick(pricing.vehiclePrice)} />
            <KV label="옵션비용" value={pick(pricing.optionsPrice)} />
            <KV label="할인금액" value={pick(pricing.discount)} />
            <KV label="최종 적용 가격" value={pick(pricing.finalPrice)} />
            <KV label="금융사" value={pick(pricing.financeCompany)} />
            <KV label="월 납입금" value={pick(pricing.monthlyPayment)} />
            <KV label="초기부담금" value={pick(pricing.upfrontPayment)} />
          </div>
        </div>
      </section>
    </div>
  );
}

function serviceSummary(s: Record<string, string | undefined>): string {
  const parts: string[] = [];
  if (s.tintBrand || s.tintGrade) parts.push(`선팅 ${[s.tintBrand, s.tintGrade].filter(Boolean).join(" / ")}`);
  if (s.blackbox) parts.push(`블랙박스 ${s.blackbox}`);
  if (s.hipass) parts.push(`하이패스 ${s.hipass}`);
  if (s.glassCoating) parts.push(`유리막 ${s.glassCoating}`);
  if (s.ppf) parts.push(`PPF ${s.ppf}`);
  if (s.gifts) parts.push(`사은품 ${s.gifts}`);
  return parts.length ? parts.join(" · ") : "-";
}

function KV({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#6B7280]">
        {label}
      </div>
      <div className="mt-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm font-semibold text-[#111827]">
        {value}
      </div>
    </div>
  );
}

