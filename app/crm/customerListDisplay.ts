import type { Customer, NextAction } from "./types";
import {
  extractPreferredVehicleModel,
  inferVehicleBrandForModel,
  normalizeInterestVehicle,
  polishNextActionForDisplay,
} from "./customerContextDraft";

const BRAND_ONLY_RE =
  /^(?:Mercedes[\s-]*Benz|Mercedes-Benz|메르세데스|벤츠|BMW|Audi|아우디|폭스바겐|Volkswagen|렉서스|Lexus|제네시스|Genesis|현대|기아)$/i;

const GENERIC_NEXT_ACTION_RE = /^(?:다음\s*할\s*일|다음\s*연락|연락\s*하기|—|-)$/i;

function clampText(s: string, max = 80) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function shortVehicleLabel(c: Customer): string {
  const full = formatCustomerInterestVehicle(c);
  if (!full) return "";
  const stripped = full
    .replace(/Mercedes[\s-]*Benz\s*/gi, "")
    .replace(/메르세데스[\s-]*벤츠\s*/g, "")
    .trim();
  const token = (stripped || full).split(/\s+/)[0] ?? "";
  return token.length > 24 ? `${token.slice(0, 23)}…` : token;
}

/** 고객 카드·상세의 관심 차량 한 줄(모델명 우선 · 메모에서 GLC 등 복구). */
export function formatCustomerInterestVehicle(c: Customer): string {
  const memo = c.memo ?? "";
  const model =
    normalizeInterestVehicle(memo, c.interestedModel) ?? extractPreferredVehicleModel(memo);

  if (model) {
    const inferredBrand = inferVehicleBrandForModel(model);
    const storedBrand = c.vehicleBrand?.trim();
    if (storedBrand && inferredBrand && storedBrand === inferredBrand) {
      return `${storedBrand} ${model}`;
    }
    return model;
  }

  const im = c.interestedModel?.trim();
  if (im && !BRAND_ONLY_RE.test(im)) {
    const brand = c.vehicleBrand?.trim();
    if (brand && !im.toLowerCase().includes(brand.toLowerCase())) {
      return `${brand} ${im}`;
    }
    return im;
  }

  const brand = c.vehicleBrand?.trim();
  if (brand && BRAND_ONLY_RE.test(brand)) {
    const fromMemo = extractPreferredVehicleModel(memo);
    if (fromMemo) return fromMemo;
  }

  const parts = [c.vehicleBrand, c.interestedModel].filter(Boolean).map((p) => String(p).trim());
  return parts.join(" ").trim();
}

/** 고객 리스트 카드용 한 줄 AI 요약. */
export function buildCustomerListCardSummary(c: Customer): string {
  const veh = shortVehicleLabel(c);
  const fd = c.financeConditionDraft?.productMode;
  const needs = c.customerPriorityNeeds ?? [];
  const parts: string[] = [];

  if (veh) parts.push(`${veh} 관심`);
  if (fd === "리스") parts.push("리스 조건 검토");
  else if (fd === "할부") parts.push("할부 조건 검토");
  else if (fd === "장기렌트") parts.push("장기렌트 조건 검토");
  else if (fd === "현금") parts.push("출고·현금 조건 확인");
  else if (c.stage?.trim() && c.stage !== "미상담") parts.push(c.stage.trim());

  if (needs.includes("월 납입금 부담 최소화")) parts.push("월 납입 부담 최소화");
  if (needs.includes("빠른 출고")) parts.push("출고 일정 확인");

  if (parts.length >= 2) return clampText(parts.slice(0, 3).join(" · "), 72);

  const memoLine =
    (c.memo ?? "")
      .split(/\n+/)
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("[")) ?? "";
  if (parts.length === 1) return clampText(parts[0], 72);
  if (memoLine) return clampText(memoLine, 72);
  return "상담·견적 정리 중";
}

/** 고객 카드 다음 행동 라벨(과도하게 긴 AI 문구 축약). 빈 값은 빈 문자열. */
export function formatCustomerNextActionLabel(raw: string): string {
  const t = raw.trim();
  if (!t || t === "—" || t === "-") return "";
  const polished = polishNextActionForDisplay(t);
  if (!polished) return "";
  return clampText(polished, 56);
}

export function isGenericNextActionTitle(title: string): boolean {
  const t = title.trim();
  return !t || GENERIC_NEXT_ACTION_RE.test(t);
}

/** 할 일 목록 표시용 제목(반복되는 「다음 할 일」 대체). */
export function resolveNextActionListTitle(
  action: Pick<NextAction, "title">,
  customer?: Customer | null,
): string {
  const raw = action.title?.trim() ?? "";
  if (!isGenericNextActionTitle(raw)) {
    return polishNextActionForDisplay(raw) || raw;
  }
  if (!customer) return "연락·조건 확인";

  const name = customer.name?.trim();
  const fd = customer.financeConditionDraft?.productMode;
  const needs = customer.customerPriorityNeeds ?? [];

  let task = "연락·후속 확인";
  if (fd === "리스") task = "리스·출고 확인";
  else if (fd === "할부") task = "할부·견적 확인";
  else if (fd === "장기렌트") task = "장기렌트 조건 확인";
  else if (needs.includes("빠른 출고")) task = "출고 일정 확인";
  else if (needs.includes("월 납입금 부담 최소화")) task = "월 납입·조건 확인";
  else if (/시승/i.test(customer.memo ?? "")) task = "시승 일정 확인";

  return name ? `${name} · ${task}` : task;
}

/** 미완료 우선 · 기한 순 정렬. */
export function sortNextActionsForWorkspace(actions: NextAction[]): NextAction[] {
  return [...actions].sort((a, b) => {
    const ad = a.doneAt ? 1 : 0;
    const bd = b.doneAt ? 1 : 0;
    if (ad !== bd) return ad - bd;
    return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
  });
}

export function partitionNextActions(actions: NextAction[]): {
  pending: NextAction[];
  done: NextAction[];
} {
  const sorted = sortNextActionsForWorkspace(actions);
  return {
    pending: sorted.filter((a) => !a.doneAt),
    done: sorted.filter((a) => Boolean(a.doneAt)),
  };
}

/** 새 할 일 기본 기한 — 영업 시간대(저장 로직과 별도, 생성 시점만). */
export function defaultNextActionDueIso(): string {
  const d = new Date();
  const h = d.getHours();
  if (h < 11) {
    d.setHours(10, 30, 0, 0);
  } else if (h < 16) {
    d.setHours(14, 0, 0, 0);
  } else if (h < 19) {
    d.setHours(16, 30, 0, 0);
  } else {
    d.setDate(d.getDate() + 1);
    d.setHours(10, 30, 0, 0);
  }
  return d.toISOString();
}

function crmDisplayLocalDate(iso: string): Date | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const display = new Date(d);
  const hour = display.getHours();
  if (hour >= 5 && hour < 8) {
    const slots: Array<[number, number]> = [
      [10, 30],
      [14, 0],
      [16, 30],
    ];
    const [hh, mm] = slots[(display.getDate() + display.getMonth()) % slots.length]!;
    display.setHours(hh, mm, 0, 0);
  }
  return display;
}

/** CRM 일정·할 일 표시용 시각(저장값 변경 없음 · 새벽 시각만 영업 시간으로 보정). */
export function formatCrmDisplayDateTime(iso?: string): string {
  if (!iso) return "";
  try {
    const display = crmDisplayLocalDate(iso);
    if (!display) return iso;
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(display);
  } catch {
    return iso;
  }
}

/** 미니 캘린더 등 — 시·분만 표시. */
export function formatCrmDisplayTimeOnly(iso?: string): string {
  if (!iso) return "";
  try {
    const display = crmDisplayLocalDate(iso);
    if (!display) return "";
    return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(display);
  } catch {
    return "";
  }
}

/** 데모·예시 데이터 기반 AI 요약 (실제 AI 연동 없음) */
export function getDemoAiSummaryLine(c: Customer): string {
  return buildCustomerListCardSummary(c);
}
