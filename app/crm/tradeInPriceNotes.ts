import type { Customer } from "./types";
import { formatKrwShort, parseMoneyToKrw } from "./recommendations";

function fmtLabel(text?: string): string {
  return text?.trim() ?? "";
}

function formatMoneyLabel(text?: string): string {
  const raw = fmtLabel(text);
  if (!raw) return "";
  const won = parseMoneyToKrw(raw);
  if (won != null && won > 0) return formatKrwShort(won);
  return raw;
}

export function hasTradeInPriceInput(c: Customer): boolean {
  const mp = c.marketPrice;
  const uc = c.usedCar;
  return Boolean(
    mp?.encarMin?.trim() ||
      mp?.encarMax?.trim() ||
      mp?.quoteSources?.trim() ||
      mp?.guidePrice?.trim() ||
      uc?.model?.trim() ||
      uc?.year?.trim() ||
      uc?.mileageKm?.trim(),
  );
}

/** 중고차 가격 정리 섹션 — 화면 요약 불릿 */
export function summarizeTradeInPriceNotes(c: Customer): string[] {
  const mp = c.marketPrice;
  const minRaw = fmtLabel(mp?.encarMin);
  const maxRaw = fmtLabel(mp?.encarMax);
  const guide = fmtLabel(mp?.guidePrice);
  const sources = fmtLabel(mp?.quoteSources);
  const lines: string[] = [];

  const minWon = parseMoneyToKrw(minRaw);
  const maxWon = parseMoneyToKrw(maxRaw);

  if (minRaw && maxRaw) {
    const minL = minWon != null ? formatKrwShort(minWon) : minRaw;
    const maxL = maxWon != null ? formatKrwShort(maxWon) : maxRaw;
    lines.push(`확인된 매입 견적 범위는 ${minL} ~ ${maxL} 수준입니다.`);
  } else if (minRaw) {
    lines.push(`확인된 매입 하한은 ${formatMoneyLabel(minRaw) || minRaw} 수준입니다.`);
  } else if (maxRaw) {
    lines.push(`확인된 매입 상한은 ${formatMoneyLabel(maxRaw) || maxRaw} 수준입니다.`);
  }

  if (guide) {
    lines.push(`고객 안내 기준가는 ${formatMoneyLabel(guide) || guide} 전후로 정리할 수 있습니다.`);
  }

  if (sources) {
    lines.push(`견적처: ${sources.length > 80 ? `${sources.slice(0, 79)}…` : sources}`);
  }

  if (lines.length) {
    lines.push("실제 매입가는 차량 상태·현장 확인에 따라 달라질 수 있어 최종 견적 전 다시 확인이 필요합니다.");
    return lines;
  }

  return ["매입가 범위를 입력하면 고객에게 안내할 대차 기준 금액을 정리해 드립니다."];
}

/** 견적·문자 초안에 붙일 중고차 매입가 참고 문단 */
export function buildTradeInPriceSmsParagraphs(c: Customer): string[] {
  const mp = c.marketPrice;
  const minRaw = fmtLabel(mp?.encarMin);
  const maxRaw = fmtLabel(mp?.encarMax);
  if (!minRaw && !maxRaw && !mp?.guidePrice?.trim()) return [];

  const lines: string[] = [];
  const vehicle =
    fmtLabel(c.usedCar?.model) ||
    [c.usedCar?.brand, c.usedCar?.model].filter(Boolean).join(" ").trim();

  if (vehicle) {
    lines.push(`${vehicle} 차량은 현재 확인된 매입 견적 기준으로 정리하고 있습니다.`);
  } else {
    lines.push("고객님 차량은 현재 확인된 매입 견적 기준으로 정리하고 있습니다.");
  }

  if (minRaw && maxRaw) {
    const minL = formatMoneyLabel(minRaw) || minRaw;
    const maxL = formatMoneyLabel(maxRaw) || maxRaw;
    lines.push(`최저 ${minL}에서 최고 ${maxL} 수준으로 확인됩니다.`);
  } else if (minRaw) {
    lines.push(`최저 ${formatMoneyLabel(minRaw) || minRaw} 수준으로 확인됩니다.`);
  } else if (maxRaw) {
    lines.push(`최고 ${formatMoneyLabel(maxRaw) || maxRaw} 수준으로 확인됩니다.`);
  }

  lines.push(
    "여러 견적처 기준으로는 최고 제시가를 우선 참고하되, 실제 매입가는 차량 상태와 현장 확인에 따라 달라질 수 있습니다.",
  );

  const guide = fmtLabel(mp?.guidePrice);
  if (guide) {
    lines.push(`안내 기준은 ${formatMoneyLabel(guide) || guide} 전후로 맞춰 설명드리겠습니다.`);
  }

  lines.push("신차 조건과 함께 대차 기준 금액까지 반영해 전체 부담 금액을 다시 정리해드리겠습니다.");

  return lines;
}
