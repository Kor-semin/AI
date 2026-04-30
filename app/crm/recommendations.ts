import type { Customer } from "./types";

/** "3,800만원" · "3800만" · "38000000" 등 → 원(대략) */
export function parseMoneyToKrw(text: string | undefined): number | null {
  if (!text) return null;
  const raw = text.replace(/\s/g, "").trim();
  if (!raw) return null;

  const man = raw.match(/([\d,.]+)\s*만\s*원?/i) ?? raw.match(/([\d,.]+)\s*만/i);
  if (man) {
    const n = parseFloat(man[1]!.replace(/,/g, ""));
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n * 10_000);
  }

  const won = raw.match(/([\d,.]+)\s*원/i);
  if (won) {
    const n = parseInt(won[1]!.replace(/,/g, ""), 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  const digitsOnly = /^[\d,]+$/.test(raw);
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  // 숫자만(단위 없음): 100만 미만은 '만원', 100만 이상은 '원'으로 간주
  if (digitsOnly) {
    if (n >= 1_000_000) return n;
    if (n >= 100) return Math.round(n * 10_000);
    return Math.round(n * 10_000);
  }
  if (n >= 10_000_000) return n;
  return Math.round(n * 10_000);
}

export type BudgetModelPick = { label: string; note?: string };

/** 예산 구간별 대표 비교 후보(참고용 룰셋, 실제 시세 아님) */
export function recommendModelsByBudget(budgetWon: number): BudgetModelPick[] {
  if (!Number.isFinite(budgetWon) || budgetWon <= 0) return [];

  const w = budgetWon;
  const tier = (() => {
    if (w < 18_000_000) return 1;
    if (w < 28_000_000) return 2;
    if (w < 40_000_000) return 3;
    if (w < 55_000_000) return 4;
    if (w < 75_000_000) return 5;
    if (w < 100_000_000) return 6;
    return 7;
  })();

  const picks: Record<number, BudgetModelPick[]> = {
    1: [
      { label: "캐스퍼 · 모닝 · 레이", note: "첫차·출퇴근" },
      { label: "아반떼(구형) · K3(구형)", note: "실속 세단" },
    ],
    2: [
      { label: "아반떼 · K3 · 벨로스터 N(구형)", note: "준중형" },
      { label: "셀토스 · 코나 · 티볼리", note: "소형 SUV" },
    ],
    3: [
      { label: "쏘나타 · K5 · SM6", note: "중형 세단" },
      { label: "스포티지 · 투싼 · 셀토스 상위", note: "패밀리 SUV" },
    ],
    4: [
      { label: "그랜저 · K8 · G70(구형)", note: "중대형" },
      { label: "쏘렌토 · 싼타페 · 팰리세이드(구형)", note: "7인승 후보" },
    ],
    5: [
      { label: "그랜저(신형) · G80(구형) · K9(구형)", note: "프리미엄 세단" },
      { label: "팰리세이드 · GV80(구형)", note: "대형 SUV" },
    ],
    6: [
      { label: "GV80 · G90(구형) · EQE(수입)", note: "고가 세단/SUV" },
      { label: "카니발 하이리무진 · 대형 RV", note: "RV 니즈" },
    ],
    7: [
      { label: "수입 프리미엄(독3사) · 전기 플래그십", note: "옵션·대기·보증 확인" },
      { label: "법인/리스 위주 상품", note: "세금·잔가 구조 점검" },
    ],
  };

  return picks[tier] ?? [];
}

export function formatKrwShort(won: number): string {
  if (!Number.isFinite(won)) return "";
  if (won >= 100_000_000) return `${Math.round(won / 100_000_000)}억`;
  if (won >= 10_000) return `${Math.round(won / 10_000)}만`;
  return `${won.toLocaleString("ko-KR")}원`;
}

function normalizeUsedCarModel(raw: string): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  // "A · B" 또는 "A / B" 같은 후보 묶음이면 첫 후보만 사용
  const first = t.split(/[·/|,]/)[0]?.trim() ?? t;
  // 괄호 정보는 남겨도 되지만 엔카 검색에서 노이즈가 되기 쉬워 제거
  const cleaned = first.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  // 흔한 표기 보정(검색 정확도용)
  const s = cleaned
    .replace(/e\s*class/gi, "E클래스")
    .replace(/e\s*클래스/gi, "E클래스")
    .replace(/c\s*class/gi, "C클래스")
    .replace(/c\s*클래스/gi, "C클래스")
    .replace(/s\s*class/gi, "S클래스")
    .replace(/s\s*클래스/gi, "S클래스")
    .replace(/a\s*class/gi, "A클래스")
    .replace(/a\s*클래스/gi, "A클래스");
  return s.replace(/\s+/g, " ").trim();
}

function normalizeMileageKm(raw: string): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  // "12만" → "120000", "120,000" → "120000"
  const man = t.match(/([\d,.]+)\s*만/i);
  if (man) {
    const n = parseFloat(man[1]!.replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return String(Math.round(n * 10_000));
  }
  const digits = t.replace(/[^\d]/g, "");
  return digits || t;
}

function normalizeTrim(raw: string): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  return t
    .replace(/\([^)]*\)/g, "")
    .replace(/[·|/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildUsedCarSearchQuery(
  c: Pick<Customer, "vehicleBrand" | "interestedModel" | "usedCar">,
): string {
  const brand =
    (c.usedCar?.brand ?? "").trim() ||
    (c.vehicleBrand && c.vehicleBrand !== "기타" ? c.vehicleBrand : "");
  const model = normalizeUsedCarModel((c.usedCar?.model ?? "").trim() || (c.interestedModel ?? ""));
  const y = (c.usedCar?.year ?? "").trim();
  const km = normalizeMileageKm(c.usedCar?.mileageKm ?? "");
  const acc = c.usedCar?.accident && c.usedCar.accident !== "미상" ? c.usedCar.accident : "";
  const grade = normalizeTrim(c.usedCar?.trim ?? ""); // UI에서는 "등급"으로 사용
  const parts = [y, brand, model, grade, km ? `${km}km` : "", acc].filter(Boolean);
  const q = parts.join(" ").trim();
  return q || model || brand || "중고차";
}

/** SK엔카(모바일) 검색 — 키워드 기반(시세 자동 수집 아님) */
export function encarSearchUrl(query: string): string {
  const q = query.trim() || "중고차";
  return `https://m.encar.com/dc/dc_carsearchlist.do?carType=kor&keyword=${encodeURIComponent(q)}`;
}

/** 보배드림 중고차 목록 검색(키워드 기반) */
export function bobaeSearchUrl(query: string): string {
  const q = query.trim() || "중고차";
  return `https://www.bobaedream.co.kr/mycar/mycar_list.php?gubun=K&order=11&search_kwd=${encodeURIComponent(q)}`;
}

export function summarizeMarketVsBudget(opts: {
  budgetWon: number | null;
  encarMin?: string;
  encarMax?: string;
}): string[] {
  const lines: string[] = [];
  const b = opts.budgetWon;

  const e1 = parseMoneyToKrw(opts.encarMin);
  const e2 = parseMoneyToKrw(opts.encarMax);

  const mid = (a: number | null, c: number | null): number | null => {
    if (a != null && c != null) return Math.round((a + c) / 2);
    if (a != null) return a;
    if (c != null) return c;
    return null;
  };

  const encMid = mid(e1, e2);

  if (encMid != null) {
    lines.push(`엔카 기준 대략 ${formatKrwShort(encMid)} 전후로 보시면 됩니다(직접 확인 값).`);
  }

  if (b != null && b > 0) {
    if (encMid != null) {
      if (encMid <= b * 1.05) lines.push("엔카 시세는 예산 안에 들어오는 편으로 보입니다.");
      else if (encMid <= b * 1.15) lines.push("엔카 시세는 예산 대비 약간 높을 수 있어요. 옵션·연식·사고로 협상 여지를 보세요.");
      else lines.push("엔카 시세가 예산보다 높게 잡혀 있습니다. 차종 변경 또는 예산 재확인이 필요할 수 있어요.");
    }
  }

  if (lines.length === 0) {
    lines.push("엔카 시세(최소~최대)를 입력하면 예산 대비 한 줄 요약을 만들어 드립니다.");
  }

  return lines;
}
