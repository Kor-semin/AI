/**
 * 가져오기 파이프라인 공통 타입 및 전화번호 정규화(저장 형식 비교용).
 * AI 요약 없음 · 원문은 memoRaw 로만 연결합니다.
 */

export type NormalizedImportedContact = {
  name: string;
  phone?: string;
  /** 표시용(하이픈 등) — 가능하면 한국 휴대폰 형태 */
  phoneDisplay?: string;
  email?: string;
  /** 소스에서 온 메모 그대로 */
  memoRaw?: string;
  /** CSV 등에서 뽑은 차량/조직 힌트(직접 매핑, AI 아님) */
  interestedModelHint?: string;
};

const KR_MOBILE = /^01[016789]\d{7,8}$/;

export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** 비교·중복 판단용 키(국내 휴대폰은 0으로 시작하는 10~11자리로 통일) */
export function phoneMatchKey(phone: string | undefined): string | null {
  if (!phone) return null;
  let d = digitsOnly(phone);
  if (d.startsWith("82") && d.length >= 10) d = `0${d.slice(2)}`;
  if (d.length < 9) return null;
  if (KR_MOBILE.test(d)) return d;
  return d.length >= 8 ? d : null;
}

/** 고객 카드에 넣을 표시용 전화(가능 시 010-0000-0000) */
export function formatKrPhoneDisplay(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  const d = phoneMatchKey(phone);
  if (!d || !KR_MOBILE.test(d)) return phone.trim() || undefined;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone.trim();
}

export function normalizeImportedContact(input: {
  name: string;
  phone?: string;
  email?: string;
  memoRaw?: string;
  interestedModelHint?: string;
}): NormalizedImportedContact {
  const name = (input.name ?? "").trim().slice(0, 80) || "이름 미입력";
  const email = (input.email ?? "").trim() || undefined;
  const memoRaw = (input.memoRaw ?? "").trim() || undefined;
  const interestedModelHint = (input.interestedModelHint ?? "").trim() || undefined;
  const display = formatKrPhoneDisplay(input.phone);
  return {
    name,
    phone: display,
    phoneDisplay: display,
    email,
    memoRaw,
    interestedModelHint,
  };
}

/** 같은 가져오기 배치 안에서 전화 키 기준 병합(메모는 줄바꿈으로 이어 붙임, 원문 유지) */
export function dedupeImportBatch(rows: NormalizedImportedContact[]): NormalizedImportedContact[] {
  const byPhone = new Map<string, NormalizedImportedContact>();
  const noPhone: NormalizedImportedContact[] = [];

  for (const r of rows) {
    const k = phoneMatchKey(r.phone);
    if (!k) {
      noPhone.push(r);
      continue;
    }
    const prev = byPhone.get(k);
    if (!prev) {
      byPhone.set(k, { ...r });
    } else {
      byPhone.set(k, {
        ...prev,
        name: prev.name || r.name,
        email: prev.email || r.email,
        memoRaw: [prev.memoRaw, r.memoRaw].filter(Boolean).join("\n") || undefined,
        interestedModelHint: prev.interestedModelHint || r.interestedModelHint,
      });
    }
  }

  const nameOnlyDedup = new Map<string, NormalizedImportedContact>();
  for (const r of noPhone) {
    const nk = `n:${r.name.trim().toLowerCase()}`;
    const prev = nameOnlyDedup.get(nk);
    if (!prev) nameOnlyDedup.set(nk, { ...r });
    else {
      nameOnlyDedup.set(nk, {
        ...prev,
        memoRaw: [prev.memoRaw, r.memoRaw].filter(Boolean).join("\n") || undefined,
        interestedModelHint: prev.interestedModelHint || r.interestedModelHint,
      });
    }
  }

  return [...byPhone.values(), ...nameOnlyDedup.values()];
}
