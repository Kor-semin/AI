/**
 * 사용자가 업로드/붙여넣은 vCard 텍스트만 파싱합니다. 폴더드 라인 처리.
 */

import { normalizeImportedContact, type NormalizedImportedContact } from "./normalizeImportedContact";

/** vCard 줄 접기 해제(DEFLATE folded lines per RFC 6350) */
function unfoldVCard(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function splitCards(unfolded: string): string[] {
  const t = unfolded.trim();
  if (!/BEGIN:VCARD/i.test(t)) return [];

  const parts = t.split(/BEGIN:VCARD/gi).slice(1);
  return parts.map((p) => `BEGIN:VCARD${p}`.trim());
}

/** KEY[:params]:VALUE (첫 번째 콜론 분리) */
function getProps(block: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx < 1) continue;
    const head = line.slice(0, idx).trim();
    let val = line.slice(idx + 1);
    const keyUpper = head.split(";")[0]!.trim().toUpperCase();
    if (keyUpper === "BEGIN" || keyUpper === "END" || keyUpper === "VERSION") continue;
    val = val.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/;;/g, ";");
    const arr = map.get(keyUpper) ?? [];
    arr.push(val.trim());
    map.set(keyUpper, arr);
  }
  return map;
}

function firstTel(props: Map<string, string[]>): string | undefined {
  const keys = [...props.keys()].filter((k) => k === "TEL" || k.startsWith("TEL."));
  const vals: string[] = [];
  for (const k of keys) vals.push(...(props.get(k) ?? []));
  if (vals.length === 0) return undefined;
  const preferred =
    vals.find((v) => /CELL|MOBILE|IPHONE/i.test(v)) ?? vals.find((v) => !/FAX/i.test(v)) ?? vals[0] ?? "";
  return preferred.replace(/^tel:/i, "").trim() || undefined;
}

function firstEmail(props: Map<string, string[]>): string | undefined {
  const keys = [...props.keys()].filter((k) => k === "EMAIL" || k.startsWith("EMAIL."));
  const vals: string[] = [];
  for (const k of keys) vals.push(...(props.get(k) ?? []));
  const v = vals.find(Boolean);
  return v?.trim();
}

function firstNote(props: Map<string, string[]>): string | undefined {
  const keys = [...props.keys()].filter((k) => k === "NOTE" || k.startsWith("NOTE."));
  const vals: string[] = [];
  for (const k of keys) vals.push(...(props.get(k) ?? []));
  const joined = vals.join("\n\n").trim();
  return joined || undefined;
}

function displayName(props: Map<string, string[]>): string {
  const fn = props.get("FN")?.[0]?.trim();
  if (fn) return fn;
  const n = props.get("N")?.[0];
  if (n) {
    const semi = n.split(";").map((x) => x.trim());
    const family = semi[0] ?? "";
    const given = semi[1] ?? "";
    const cand = `${family}${given ? ` ${given}` : ""}`.trim();
    if (cand) return cand;
  }
  return "";
}

/** .vcf / 붙여넣기 vCard */
export function parseVcfContactsText(raw: string): NormalizedImportedContact[] {
  const unfolded = unfoldVCard(raw);
  const blocks = splitCards(unfolded);
  const out: NormalizedImportedContact[] = [];

  for (const block of blocks) {
    const props = getProps(block);
    const name = displayName(props) || "이름 미입력";
    const telRaw = firstTel(props);
    const email = firstEmail(props);
    const memo = firstNote(props);
    out.push(
      normalizeImportedContact({
        name,
        phone: telRaw,
        email,
        memoRaw: memo,
      }),
    );
  }

  return out;
}
