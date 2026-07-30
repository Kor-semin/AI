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
  available: { label: "출고 가능", tone: "border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] text-[var(--s-ok-text)]" },
  reserved: { label: "예약 확인", tone: "border-[var(--s-warn-border)] bg-[var(--s-warn-tint)] text-[var(--s-warn-text)]" },
  contracted: { label: "계약 진행", tone: "border-[var(--s-brand-border)] bg-[var(--s-brand-tint)] text-[var(--s-brand-text)]" },
  in_transit: { label: "입고 예정", tone: "border-[var(--s-border)] bg-[var(--s-inner)] text-[var(--s-text-2)]" },
  display: { label: "전시 차량", tone: "border-[var(--s-border)] bg-[var(--s-inner)] text-[var(--s-text-2)]" },
  demo: { label: "시승 차량", tone: "border-[var(--s-border)] bg-[var(--s-inner)] text-[var(--s-text-2)]" },
  sold: { label: "판매 완료", tone: "border-[var(--s-border)] bg-[var(--s-inner)] text-[var(--s-text-3)]" },
  unavailable: { label: "확인 필요", tone: "border-[var(--s-warn-border)] bg-[var(--s-warn-tint)] text-[var(--s-warn-text)]" },
};

export function SensoraInventoryView({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section className="min-h-[583px] min-w-0 max-w-full rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="inventory-preview-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Inventory</p>
            <h2 id="inventory-preview-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[var(--s-text)]">재고 관리 미리보기</h2>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <span className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-3 py-2 text-xs text-[var(--s-text-2)]">Demo data · Read-only</span>
            <span className="rounded-lg bg-[var(--s-brand-tint)] px-3 py-2 text-xs font-medium text-[var(--s-brand-text)]">DMS / ERP 연동 예정</span>
          </div>
        </div>

        <div className="mt-6 max-w-full overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[.65fr_1.35fr_1.2fr_.9fr] gap-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-xs text-[var(--s-text-3)]">
              <span>브랜드</span><span>모델 / 트림</span><span>외장색 / 내장색</span><span>재고 상태</span>
            </div>
            <div className="mt-4 space-y-4">
              {previewInventory.map((unit) => {
                const status = statusLabels[unit.stockStatus];
                return (
                  <div key={unit.id} className="grid min-h-[104px] grid-cols-[.65fr_1.35fr_1.2fr_.9fr] items-center gap-4 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 text-[0.8125rem]">
                    <span className="font-medium text-[var(--s-text-2)]">{unit.brand}</span>
                    <span className="text-[var(--s-text-2)]">{unit.model} · {unit.trim || "-"}</span>
                    <span className="text-[var(--s-text-3)]">{unit.exteriorColor || "-"} / {unit.interiorColor || "-"}</span>
                    <span className={`font-medium ${status.tone.split(" ").find((token) => token.startsWith("text-")) ?? "text-[var(--s-text-2)]"}`}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-5 text-[var(--s-text-3)]">Demo data · 실제 운영 데이터가 아닙니다. DMS/ERP 연동과 예약·판매 완료 처리 기능은 연결하지 않았습니다.</p>
      </section>
    );
  }

  return (
    <section className="min-w-0 max-w-full rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby={compact ? "inventory-preview-title" : "inventory-view-title"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">Inventory</p>
          <h2 id={compact ? "inventory-preview-title" : "inventory-view-title"} className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--s-text)]">재고 관리</h2>
          <p className="mt-1 text-[0.8125rem] leading-5 text-[var(--s-text-3)]">차량 사양과 현재 재고 상태를 빠르게 비교합니다.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="rounded-full border border-[var(--s-border)] bg-[var(--s-inner)] px-2.5 py-1 text-xs text-[var(--s-text-2)]">재고 관리 Read-only Preview</span>
          <span className="rounded-full border border-[var(--s-brand-border)] bg-[var(--s-brand-tint)] px-2.5 py-1 text-xs text-[var(--s-brand-text)]">DMS/ERP 연동 예정</span>
        </div>
      </div>

      <div className="mt-5 max-w-full overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[.8fr_1.25fr_.9fr_1fr_1fr_.8fr] gap-3 border-b border-[var(--s-border)] px-3 pb-2 text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--s-text-3)]">
            <span>브랜드</span><span>모델</span><span>트림</span><span>외장색</span><span>내장색</span><span>재고 상태</span>
          </div>
          {previewInventory.map((unit) => {
            const status = statusLabels[unit.stockStatus];
            return (
              <div key={unit.id} className="grid grid-cols-[.8fr_1.25fr_.9fr_1fr_1fr_.8fr] items-center gap-3 border-b border-[var(--s-border)] px-3 py-3.5 text-[0.8125rem] last:border-0">
                <span className="font-medium text-[var(--s-text)]">{unit.brand}</span>
                <span className="text-[var(--s-text-2)]">{unit.model}</span>
                <span className="text-[var(--s-text-2)]">{unit.trim || "-"}</span>
                <span className="truncate text-[var(--s-text-3)]">{unit.exteriorColor || "-"}</span>
                <span className="truncate text-[var(--s-text-3)]">{unit.interiorColor || "-"}</span>
                <span className={`w-fit rounded-full border px-2 py-1 text-xs font-medium ${status.tone}`}>{status.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-[0.8125rem] leading-6 text-[var(--s-text-3)]">현재 화면은 예시 데이터 구조를 확인하는 읽기 전용 미리보기입니다. 외부 DMS/ERP 동기화와 예약·판매 완료·상태 변경 기능은 연결하지 않았습니다.</p>
    </section>
  );
}
