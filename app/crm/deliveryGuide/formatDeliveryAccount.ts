import type { DeliveryGuide } from "@/app/crm/types";

export function deliveryAccountEntered(g: DeliveryGuide | undefined): boolean {
  const b = (g?.deliveryBankName ?? "").trim();
  const n = (g?.deliveryAccountNumber ?? "").trim();
  const h = (g?.deliveryAccountHolder ?? "").trim();
  return !!(b || n || h || (g?.deliveryPaymentNote ?? "").trim());
}

export function formatDeliveryAccountShareText(customerName: string, g: DeliveryGuide): string {
  const bank = (g.deliveryBankName ?? "").trim();
  const num = (g.deliveryAccountNumber ?? "").trim();
  const holder = (g.deliveryAccountHolder ?? "").trim();
  const note = (g.deliveryPaymentNote ?? "").trim();
  const lines = [
    "【입금 계좌 안내】",
    `고객: ${customerName}`,
    bank ? `은행: ${bank}` : "",
    num ? `계좌번호: ${num}` : "",
    holder ? `예금주: ${holder}` : "",
    note ? `\n안내:\n${note}` : "",
  ].filter(Boolean);
  return lines.join("\n").trim();
}
