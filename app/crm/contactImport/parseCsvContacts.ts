/**
 * Google 연락처 내보내기 CSV · 일반 CSV/TSV · 줄 단위 붙여넣기를 파싱합니다.
 * AI 변형 없음 — 컬럼 매핑만 수행합니다.
 */

import { normalizeImportedContact, type NormalizedImportedContact } from "./normalizeImportedContact";

function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function sniffDelimiter(headerLine: string): string {
  const tab = (headerLine.match(/\t/g) ?? []).length;
  const comma = (headerLine.match(/,/g) ?? []).length;
  if (tab > comma) return "\t";
  return ",";
}

function normHeader(h: string): string {
  return h.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function indexMap(headers: string[]): Map<string, number> {
  const m = new Map<string, number>();
  headers.forEach((h, i) => m.set(normHeader(h), i));
  return m;
}

function cell(row: string[], idx: number | undefined): string {
  if (idx == null || idx < 0 || idx >= row.length) return "";
  return row[idx]!.trim();
}

/** Google Contacts CSV 전형적 헤더 감지 */
function looksLikeGoogleExport(headers: string[]): boolean {
  const h = headers.map(normHeader);
  return (
    h.some((x) => x.includes("phone 1 - value") || x === "phone 1 - value") ||
    (h.includes("given name") && h.includes("family name"))
  );
}

function parseGoogleRow(row: string[], map: Map<string, number>): NormalizedImportedContact | null {
  const nameFull = cell(row, map.get("name"));
  const given = cell(row, map.get("given name"));
  const family = cell(row, map.get("family name"));
  const name =
    nameFull || [family, given].filter(Boolean).join(" ").trim() || given || family || "";

  const phone =
    cell(row, map.get("phone 1 - value")) ||
    cell(row, map.get("phone 1 – value")) ||
    cell(row, map.get("phone 1")) ||
    cell(row, map.get("phone"));

  const email =
    cell(row, map.get("e-mail 1 - value")) ||
    cell(row, map.get("e-mail 1 – value")) ||
    cell(row, map.get("e-mail 1")) ||
    cell(row, map.get("email 1 - value")) ||
    cell(row, map.get("email"));

  const notes = cell(row, map.get("notes")) || cell(row, map.get("note"));
  const org = cell(row, map.get("organization 1 - name")) || cell(row, map.get("organization"));

  if (!name && !phone && !email && !notes) return null;

  return normalizeImportedContact({
    name: name || (phone ? "(이름없음)" : "이름 미입력"),
    phone: phone || undefined,
    email: email || undefined,
    memoRaw: notes || undefined,
    interestedModelHint: org || undefined,
  });
}

function findColumnIndex(headers: string[], matchers: Array<string | RegExp>): number | undefined {
  const mapped = headers.map(normHeader);
  for (let i = 0; i < mapped.length; i++) {
    const h = mapped[i]!;
    for (const m of matchers) {
      if (typeof m === "string") {
        if (h === m || h.includes(m)) return i;
      } else if (m.test(h)) return i;
    }
  }
  return undefined;
}

/** 첫 줄이 헤더인 일반 CSV(이름/전화/이메일/메모 등 키워드 매칭) */
function parseGenericCsvRows(lines: string[], delimiter: string): NormalizedImportedContact[] {
  if (lines.length < 2) return [];
  const headerCells = splitCsvLine(lines[0]!, delimiter);
  const out: NormalizedImportedContact[] = [];

  const ni = findColumnIndex(headerCells, [
    "name",
    "full name",
    "display name",
    "이름",
    "고객명",
    "성명",
    /^customer\s*name$/,
  ]);
  const pi = findColumnIndex(headerCells, [
    "phone",
    "mobile",
    "tel",
    "전화",
    "휴대폰",
    /^phone\s*\d*/,
    /^e\.164/,
  ]);
  const ei = findColumnIndex(headerCells, ["e-mail", "email", "메일"]);
  const oti = findColumnIndex(headerCells, ["notes", "note", "메모", "비고"]);
  const ogi = findColumnIndex(headerCells, ["organization", "회사", "소속"]);

  if (ni == null && pi == null && ei == null) return [];

  for (let i = 1; i < lines.length; i++) {
    const ln = lines[i]!.trim();
    if (!ln) continue;
    const cells = splitCsvLine(ln, delimiter);
    const name = ni != null ? cell(cells, ni) : "";
    let phone = pi != null ? cell(cells, pi) : "";
    const email = ei != null ? cell(cells, ei) : "";
    const memo = oti != null ? cell(cells, oti) : "";
    const org = ogi != null ? cell(cells, ogi) : "";
    /** Phone N - Value 패턴 헤더: 첫 전화 칼럼만 잡았으면 빈 행 대비 추가 스캔은 생략(MVP) */
    if (!phone && pi != null && cells.some((c) => /\d{8,}/.test(c.replace(/\D/g, ""))))
      phone = cells.find((c) => /\d{8,}/.test(c.replace(/\D/g, ""))) ?? "";
    if (!name && !phone && !email && !memo) continue;
    out.push(
      normalizeImportedContact({
        name: name || (phone ? "(이름없음)" : "이름 미입력"),
        phone: phone || undefined,
        email: email || undefined,
        memoRaw: memo || undefined,
        interestedModelHint: org || undefined,
      }),
    );
  }
  return out;
}

/** 탭/쉼표 한 줄당 한 명(이름 전화 [,메모]) */
function parseLooseLines(raw: string): NormalizedImportedContact[] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  const out: NormalizedImportedContact[] = [];

  for (const line of lines) {
    /** CSV 한 줄 시도 */
    const delim = sniffDelimiter(line);
    const parts = splitCsvLine(line, delim === "\t" ? "\t" : delim);
    if (parts.length >= 2) {
      const phoneLike = parts.find((p) => /\d[\d\s+.()-]{7,}\d/.test(p));
      const namePart = parts.find((p) => p && p !== phoneLike && !/^[\d\s+.()-]+$/.test(p)) ?? parts[0]!;
      out.push(
        normalizeImportedContact({
          name: (namePart || "(이름없음)").slice(0, 80),
          phone: phoneLike,
          email: parts.find((p) => p.includes("@")),
          memoRaw: parts.slice(2).filter((p) => p && p !== phoneLike && !p.includes("@")).join(" ") || undefined,
        }),
      );
      continue;
    }

    /** 공백으로만 구분된 경우 마지막 토큰을 전화로 시도 */
    const tokens = line.split(/\s+/).filter(Boolean);
    if (tokens.length >= 2) {
      const last = tokens[tokens.length - 1]!;
      if (/\d{8,}/.test(last.replace(/\D/g, ""))) {
        out.push(
          normalizeImportedContact({
            name: tokens.slice(0, -1).join(" ").slice(0, 80),
            phone: last,
          }),
        );
        continue;
      }
    }
  }

  return out;
}

export function parseCsvContactsText(raw: string): NormalizedImportedContact[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const lines = trimmed.split(/\r?\n/).map((l) => l.trimEnd());
  const firstNonEmpty = lines.find((l) => l.trim());
  if (!firstNonEmpty) return [];

  const delim = sniffDelimiter(firstNonEmpty);
  const headers = splitCsvLine(lines[0]!.trim(), delim);

  if (looksLikeGoogleExport(headers)) {
    const map = indexMap(headers);
    const rows: NormalizedImportedContact[] = [];
    for (let i = 1; i < lines.length; i++) {
      const ln = lines[i]!.trim();
      if (!ln) continue;
      const row = splitCsvLine(ln, delim);
      const parsed = parseGoogleRow(row, map);
      if (parsed) rows.push(parsed);
    }
    return rows;
  }

  const genericTry = parseGenericCsvRows(lines, delim);
  if (genericTry.length > 0) return genericTry;

  return parseLooseLines(trimmed);
}
