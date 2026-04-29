/** 붙여넣기 문자열에서 사람을 추려냅니다. vCard · 한 줄 형식 등 */

export type ParsedRow = { name: string; phone?: string; memo?: string };

function normalizePhoneDigits(d: string): string | undefined {
  let x = d.replace(/\D/g, "");
  if (x.startsWith("82") && x.length >= 10) x = `0${x.slice(2)}`;
  if (!/^01[016789]\d{7,8}$/.test(x)) return undefined;
  if (x.length === 11) return `${x.slice(0, 3)}-${x.slice(3, 7)}-${x.slice(7)}`;
  if (x.length === 10) return `${x.slice(0, 3)}-${x.slice(3, 6)}-${x.slice(6)}`;
  return undefined;
}

function grabPhone(raw: string): { phone?: string; rest: string } {
  const m = raw.match(/\b01[016789][\s.-]*\d{3,4}[\s.-]*\d{4}\b/);
  if (!m) return { rest: raw };
  const p = normalizePhoneDigits(m[0]);
  const rest = raw.replace(m[0], " ").replace(/\s+/g, " ").trim();
  return { phone: p, rest };
}

function parseOneLine(line: string): ParsedRow | null {
  const t = line.trim();
  if (!t || t.startsWith("#")) return null;

  let { phone, rest } = grabPhone(t);
  let parts = rest.split(/[\t,|／/]+/).map((s) => s.trim()).filter(Boolean);
  let name = parts[0] ?? "";
  let memoParts = parts.slice(1);

  if (!phone && memoParts.length) {
    const last = memoParts[memoParts.length - 1]!;
    const trial = normalizePhoneDigits(last);
    if (trial) {
      phone = trial;
      name = memoParts.slice(0, -1).join(" ").trim();
      memoParts = [];
    }
  }

  let memo = memoParts.join(" ").trim() || undefined;
  if (!name) name = memo?.split(/\s+/)[0] ?? "";
  if (!name) name = phone ? "(전화번호만)" : "이름 미입력";

  if (!phone && (!memo || memo.length < 2)) return null;

  return { name: name.slice(0, 42), phone, memo };
}

function parseVcardBlock(block: string): ParsedRow | null {
  const fn = /^FN(?:;[^:]+)?:([^\r\n]*)/mi.exec(block);
  let telRaw = /^TEL(?:;[^:]+)*:([\d+\s.-]+)/im.exec(block);
  let noteRaw = /^NOTE(?:;[^\r\n]*)?:([\s\S]*?)(?=^[A-Za-z])/m.exec(block);
  if (!noteRaw) noteRaw = /^NOTE(?:[^\r\n]*):([\s\S]*)$/mi.exec(block);

  const name = fn?.[1]?.replace(/;/g, " ").trim() || "";
  const phone = telRaw?.[1] ? normalizePhoneDigits(telRaw[1]) : undefined;
  const memo = noteRaw?.[1]?.replace(/\n\\n/g, "\n").replace(/^\s+/, "").trim() || undefined;

  if (!phone && !memo && !name) return null;
  return { name: name.slice(0, 42) || "이름 미입력", phone, memo };
}

export function parseContactPaste(raw: string): ParsedRow[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (/BEGIN:VCARD/i.test(trimmed)) {
    const parts = trimmed.split(/BEGIN:VCARD/gi).slice(1);
    const out: ParsedRow[] = [];
    for (const chunk of parts) {
      const blockEnd = chunk.split(/END:VCARD/i)[0] ?? chunk;
      const row = parseVcardBlock(`BEGIN:VCARD${blockEnd}END:VCARD`);
      if (row) out.push(row);
    }
    return out;
  }

  const out: ParsedRow[] = [];
  for (const ln of trimmed.split(/\r?\n/)) {
    const row = parseOneLine(ln);
    if (row) out.push(row);
  }
  return out;
}
