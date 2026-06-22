import { sensoraB2BSeedData, type InventoryUnit } from "@/lib/sensora";

const baseUnit = sensoraB2BSeedData.inventoryUnits[0];

const previewInventory: InventoryUnit[] = [
  baseUnit,
  {
    ...baseUnit,
    id: "inventory_preview_2",
    brand: "BMW",
    model: "520i",
    trim: "M Sport",
    exteriorColor: "Black Sapphire",
    interiorColor: "Cognac",
    stockStatus: "in_transit",
  },
  {
    ...baseUnit,
    id: "inventory_preview_3",
    brand: "Audi",
    model: "A6 45 TFSI",
    trim: "Premium",
    exteriorColor: "Firmament Blue",
    interiorColor: "Black",
    stockStatus: "display",
  },
];

const statusLabels: Record<InventoryUnit["stockStatus"], { label: string; tone: string }> = {
  available: { label: "출고 가능", tone: "border-[#4E8A66]/40 bg-[#4E8A66]/10 text-[#73A887]" },
  reserved: { label: "예약 확인", tone: "border-[#B48A48]/40 bg-[#B48A48]/10 text-[#D0A45D]" },
  contracted: { label: "계약 진행", tone: "border-[#7A263A]/50 bg-[#2A151B] text-[#C98293]" },
  in_transit: { label: "입고 예정", tone: "border-[#2B3037] bg-[#1A1E23] text-[#B7BDC6]" },
  display: { label: "전시 차량", tone: "border-[#2B3037] bg-[#1A1E23] text-[#B7BDC6]" },
  demo: { label: "시승 차량", tone: "border-[#2B3037] bg-[#1A1E23] text-[#B7BDC6]" },
  sold: { label: "판매 완료", tone: "border-[#2B3037] bg-[#1A1E23] text-[#7F8792]" },
  unavailable: { label: "확인 필요", tone: "border-[#B48A48]/40 bg-[#B48A48]/10 text-[#D0A45D]" },
};

export function SensoraInventoryView({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section className="min-h-[583px] rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby="inventory-preview-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A93754]">Inventory</p>
            <h2 id="inventory-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">재고 관리 미리보기</h2>
          </div>
          <span className="rounded-lg bg-[#2A151B] px-4 py-2 text-[10px] font-medium text-[#A93754]">DMS / ERP 연동 예정</span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[.65fr_1.35fr_1.2fr_.9fr] gap-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 py-3 text-[10px] text-[#7F8792]">
              <span>브랜드</span><span>모델 / 트림</span><span>외장색 / 내장색</span><span>재고 상태</span>
            </div>
            <div className="mt-4 space-y-4">
              {previewInventory.map((unit) => {
                const status = statusLabels[unit.stockStatus];
                return (
                  <div key={unit.id} className="grid min-h-[104px] grid-cols-[.65fr_1.35fr_1.2fr_.9fr] items-center gap-4 rounded-lg border border-[#2B3037] bg-[#1A1E23] px-4 text-[11px]">
                    <span className="font-medium text-[#B7BDC6]">{unit.brand}</span>
                    <span className="text-[#B7BDC6]">{unit.model} · {unit.trim || "-"}</span>
                    <span className="text-[#7F8792]">{unit.exteriorColor || "-"} / {unit.interiorColor || "-"}</span>
                    <span className={`font-medium ${status.tone.split(" ").find((token) => token.startsWith("text-")) ?? "text-[#B7BDC6]"}`}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-6 text-[10px] leading-4 text-[#7F8792]">※ DMS/ERP 연동 전까지 재고 상태는 CRM에서 수동 확인됩니다.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#2B3037] bg-[#14171B] p-5 sm:p-6" aria-labelledby={compact ? "inventory-preview-title" : "inventory-view-title"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A263A]">Inventory</p>
          <h2 id={compact ? "inventory-preview-title" : "inventory-view-title"} className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#F4F6F8]">재고 관리</h2>
          <p className="mt-1 text-xs leading-5 text-[#7F8792]">차량 사양과 현재 재고 상태를 빠르게 비교합니다.</p>
        </div>
        <span className="rounded-full border border-[#7A263A]/50 bg-[#2A151B] px-2.5 py-1 text-[10px] text-[#C98293]">DMS/ERP 연동 예정</span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[.8fr_1.25fr_.9fr_1fr_1fr_.8fr] gap-3 border-b border-[#2B3037] px-3 pb-2 text-[10px] uppercase tracking-[0.1em] text-[#7F8792]">
            <span>브랜드</span><span>모델</span><span>트림</span><span>외장색</span><span>내장색</span><span>재고 상태</span>
          </div>
          {previewInventory.map((unit) => {
            const status = statusLabels[unit.stockStatus];
            return (
              <div key={unit.id} className="grid grid-cols-[.8fr_1.25fr_.9fr_1fr_1fr_.8fr] items-center gap-3 border-b border-[#2B3037]/70 px-3 py-3.5 text-xs last:border-0">
                <span className="font-medium text-[#F4F6F8]">{unit.brand}</span>
                <span className="text-[#B7BDC6]">{unit.model}</span>
                <span className="text-[#B7BDC6]">{unit.trim || "-"}</span>
                <span className="truncate text-[#7F8792]">{unit.exteriorColor || "-"}</span>
                <span className="truncate text-[#7F8792]">{unit.interiorColor || "-"}</span>
                <span className={`w-fit rounded-full border px-2 py-1 text-[10px] font-medium ${status.tone}`}>{status.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-[#7F8792]">현재 화면은 구조 확인용입니다. 외부 DMS/ERP 데이터 동기화 및 상태 변경 기능은 연결하지 않았습니다.</p>
    </section>
  );
}
