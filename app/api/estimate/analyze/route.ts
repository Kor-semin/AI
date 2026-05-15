import { NextResponse } from "next/server";

import type { EstimateDocumentExtraction, EstimateFinanceTypeKey } from "@/app/crm/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024;

const EXTRACTION_JSON_KEYS = `{
  "vehicleName": "",
  "trim": "",
  "financeType": "lease",
  "totalVehiclePrice": "",
  "promotion": "",
  "prepayment": "",
  "deposit": "",
  "termMonths": "",
  "residualValue": "",
  "monthlyPayment": "",
  "endOption": "",
  "memo": "",
  "needsReview": true
}`;

function isPdf(mime: string, name: string): boolean {
  return mime === "application/pdf" || /\.pdf$/i.test(name);
}

function isAllowedImage(mime: string, name: string): boolean {
  if (mime === "image/png" || mime === "image/jpeg") return true;
  return /\.(png|jpg|jpeg)$/i.test(name);
}

function normalizeFinanceType(v: unknown): EstimateFinanceTypeKey {
  const s = String(v ?? "unknown").toLowerCase().trim();
  if (s === "lease" || s === "loan" || s === "cash" || s === "long_rent" || s === "unknown") return s;
  return "unknown";
}

function normalizeExtraction(raw: Record<string, unknown>): EstimateDocumentExtraction {
  return {
    vehicleName: String(raw.vehicleName ?? ""),
    trim: String(raw.trim ?? ""),
    financeType: normalizeFinanceType(raw.financeType),
    totalVehiclePrice: String(raw.totalVehiclePrice ?? ""),
    promotion: String(raw.promotion ?? ""),
    prepayment: String(raw.prepayment ?? ""),
    deposit: String(raw.deposit ?? ""),
    termMonths: String(raw.termMonths ?? ""),
    residualValue: String(raw.residualValue ?? ""),
    monthlyPayment: String(raw.monthlyPayment ?? ""),
    endOption: String(raw.endOption ?? ""),
    memo: String(raw.memo ?? ""),
    needsReview: Boolean(raw.needsReview),
  };
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const v = JSON.parse(unfenced) as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ ok: false, code: "MISSING_AI_CONFIG" }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, code: "NO_FILE" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, code: "FILE_TOO_LARGE" }, { status: 413 });
    }

    const mime = file.type || "application/octet-stream";
    const name = file.name || "";

    if (isPdf(mime, name)) {
      return NextResponse.json({ ok: false, code: "PDF_NOT_SUPPORTED" }, { status: 200 });
    }

    if (!isAllowedImage(mime, name)) {
      return NextResponse.json({ ok: false, code: "UNSUPPORTED_TYPE" }, { status: 415 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = buf.toString("base64");
    const imageMime = mime === "image/png" || mime === "image/jpeg" ? mime : "image/jpeg";
    const dataUrl = `data:${imageMime};base64,${b64}`;

    const instructions = [
      "You are extracting fields from a Korean new-car vehicle quotation image.",
      "Return ONLY one JSON object (no markdown) with exactly these keys and string or boolean types:",
      EXTRACTION_JSON_KEYS,
      'financeType must be one of: "lease","loan","cash","long_rent","unknown".',
      "needsReview must be true if any important number is unclear or partially occluded.",
      "Use empty strings for unknown text fields. Do not invent exact amounts if unreadable.",
      "Do not output guarantees like approval, lowest price, or final confirmation.",
    ].join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract structured finance fields from the attached Korean automotive quotation image. Output valid JSON only.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: instructions },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 1200,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("[estimate/analyze] upstream_http", res.status);
      }
      return NextResponse.json({ ok: false, code: "UPSTREAM_ERROR" }, { status: 502 });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      if (process.env.NODE_ENV === "development") {
        console.error("[estimate/analyze] empty_content");
      }
      return NextResponse.json({ ok: false, code: "PARSE_ERROR" }, { status: 502 });
    }

    const parsed = parseJsonObject(content);
    if (!parsed) {
      if (process.env.NODE_ENV === "development") {
        console.error("[estimate/analyze] json_parse");
      }
      return NextResponse.json({ ok: false, code: "PARSE_ERROR" }, { status: 502 });
    }

    const extraction = normalizeExtraction(parsed);
    return NextResponse.json({ ok: true, extraction });
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.error("[estimate/analyze] unexpected");
    }
    return NextResponse.json({ ok: false, code: "UNEXPECTED" }, { status: 500 });
  }
}
