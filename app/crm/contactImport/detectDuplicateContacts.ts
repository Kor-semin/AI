import type { Customer } from "@/app/crm/types";
import type { NormalizedImportedContact } from "./normalizeImportedContact";
import { digitsOnly, phoneMatchKey } from "./normalizeImportedContact";

export type DuplicateKind = "none" | "exact_phone" | "potential_name_no_phone";

export type DuplicateInfo =
  | { kind: "none" }
  | { kind: "exact_phone"; customerId: string; label: string }
  | {
      kind: "potential_name_no_phone";
      customerId: string;
      label: string;
      /** 이름만 같고 완전 일치 고객이 여럿이면 목록 제공 */
      otherMatches?: number;
    };

function namesLooselyEqual(a: string, b: string): boolean {
  const na = a.trim().toLowerCase().replace(/\s+/g, "");
  const nb = b.trim().toLowerCase().replace(/\s+/g, "");
  if (!na || !nb) return false;
  return na === nb;
}

/** 기존 CRM 고객과의 중복 분류 — 자동 덮어쓰기에는 사용하지 않고 UI 안내 전용 */
export function detectDuplicateForImport(row: NormalizedImportedContact, existing: Customer[]): DuplicateInfo {
  const incomingKey = phoneMatchKey(row.phone);

  if (incomingKey) {
    for (const c of existing) {
      const ck = phoneMatchKey(c.phone);
      if (ck && ck === incomingKey) {
        return { kind: "exact_phone", customerId: c.id, label: `${c.name} (${c.phone ?? "번호 없음"})` };
      }
    }
  }

  /** 가져온 행에 비교 가능한 번호가 없을 때만 이름 동일 → 잠재 중복 안내 */
  const importDial = digitsOnly(row.phone ?? "");
  if (importDial.length >= 8) return { kind: "none" };

  const trimmedName = row.name.trim();
  if (!trimmedName || trimmedName === "이름 미입력") return { kind: "none" };

  const hits = existing.filter((c) => namesLooselyEqual(c.name, trimmedName));

  if (hits.length >= 1) {
    const primary = hits[0]!;
    return {
      kind: "potential_name_no_phone",
      customerId: primary.id,
      label: `${primary.name} (${primary.phone ?? "전화번호 없음"})`,
      otherMatches: hits.length > 1 ? hits.length - 1 : undefined,
    };
  }

  return { kind: "none" };
}
