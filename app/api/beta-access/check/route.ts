import { NextResponse } from "next/server";

const UPSTREAM_MS = 12_000;
const ALLOWED_STATUS = new Set(["approved", "pending", "rejected", "not_found"]);

export async function POST(req: Request): Promise<NextResponse> {
  let emailNorm = "";

  try {
    const body: unknown = await req.json().catch(() => null);
    if (body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string") {
      emailNorm = String((body as { email: string }).email).trim().toLowerCase();
    }
  } catch {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }

  if (!emailNorm) {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }

  const endpoint = process.env.BETA_ACCESS_ENDPOINT?.trim();
  if (!endpoint) {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set("action", "checkAccess");
    url.searchParams.set("email", emailNorm);
    const secret = process.env.BETA_ACCESS_SECRET?.trim();
    if (secret) url.searchParams.set("key", secret);

    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), UPSTREAM_MS);
    const upstream = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: ctl.signal,
    });
    clearTimeout(t);

    if (!upstream.ok) {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(await upstream.text()) as unknown;
    } catch {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    const rec = parsed as Record<string, unknown>;
    const okRaw = rec.ok === true;
    let statusRaw = typeof rec.status === "string" ? rec.status.trim().toLowerCase() : "";

    if (!okRaw || !ALLOWED_STATUS.has(statusRaw)) {
      return NextResponse.json({ ok: false, approved: false, status: "error" });
    }

    const approved = statusRaw === "approved";

    return NextResponse.json({
      ok: true,
      approved,
      status: statusRaw,
    });
  } catch {
    return NextResponse.json({ ok: false, approved: false, status: "error" });
  }
}
