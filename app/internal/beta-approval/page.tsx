"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { useAuth } from "@/app/crm/useAuth";
import { getFirebaseAuth } from "@/app/firebase/client";
import { maskEmailForBetaDisplay } from "@/lib/betaAccess";

type BetaAppRow = {
  fullName: string;
  email: string;
  contact: string;
  dealership: string;
  currentCrmApproach: string;
  motivation: string;
  submittedAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected";
};

const MSG_LIST_500 = "신청자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
const MSG_TOKEN = "관리자 인증 토큰을 확인하지 못했습니다. 다시 로그인해 주세요.";

async function authorizationHeader(): Promise<string | null> {
  const a = getFirebaseAuth();
  if (typeof a.authStateReady === "function") {
    await a.authStateReady();
  }
  const u = a.currentUser;
  if (!u) return null;
  try {
    const token = await u.getIdToken(true);
    if (!token) return null;
    return `Bearer ${token}`;
  } catch {
    return null;
  }
}

function formatWhen(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

type Screen =
  | "signed_out"
  | "token_error"
  | "admin_loading"
  | "forbidden"
  | "misconfigured"
  | "list_error"
  | "ready";

export default function InternalBetaApprovalPage() {
  const { auth, signOut } = useAuth();
  const [rows, setRows] = useState<BetaAppRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [screen, setScreen] = useState<Screen>("signed_out");
  const [flash, setFlash] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const loadGen = useRef(0);

  const load = useCallback(async (kind: "initial" | "reload") => {
    const gen = ++loadGen.current;

    if (kind === "initial") {
      setLoadErr(null);
      setScreen("admin_loading");
    } else {
      setListLoading(true);
    }

    const authz = await authorizationHeader();
    if (gen !== loadGen.current) return;

    if (!authz) {
      setRows([]);
      setLoadErr(null);
      setScreen("token_error");
      if (kind === "reload") setListLoading(false);
      return;
    }

    const res = await fetch("/api/internal/beta-applications", {
      headers: { Authorization: authz },
      cache: "no-store",
    });
    if (gen !== loadGen.current) return;

    if (res.status === 401) {
      setRows([]);
      setLoadErr(null);
      setScreen("token_error");
      if (kind === "reload") setListLoading(false);
      return;
    }
    if (res.status === 403) {
      setRows([]);
      setLoadErr(null);
      setScreen("forbidden");
      if (kind === "reload") setListLoading(false);
      return;
    }
    if (res.status === 503) {
      setRows([]);
      setLoadErr(null);
      setScreen("misconfigured");
      if (kind === "reload") setListLoading(false);
      return;
    }
    if (res.status === 500) {
      setLoadErr(MSG_LIST_500);
      setRows([]);
      setScreen("list_error");
      if (kind === "reload") setListLoading(false);
      return;
    }
    if (!res.ok) {
      setLoadErr(MSG_LIST_500);
      setRows([]);
      setScreen("list_error");
      if (kind === "reload") setListLoading(false);
      return;
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      setLoadErr(MSG_LIST_500);
      setRows([]);
      setScreen("list_error");
      if (kind === "reload") setListLoading(false);
      return;
    }
    if (gen !== loadGen.current) return;

    const rec = data as { ok?: unknown; items?: unknown };
    if (rec.ok !== true || !Array.isArray(rec.items)) {
      setLoadErr(MSG_LIST_500);
      setRows([]);
      setScreen("list_error");
      if (kind === "reload") setListLoading(false);
      return;
    }
    setRows(rec.items as BetaAppRow[]);
    setLoadErr(null);
    setScreen("ready");
    if (kind === "reload") setListLoading(false);
  }, []);

  useEffect(() => {
    if (auth.status === "loading") {
      return;
    }
    if (auth.status === "signed-out") {
      loadGen.current += 1;
      setRows([]);
      setLoadErr(null);
      setListLoading(false);
      setScreen("signed_out");
      return;
    }
    if (auth.status === "signed-in") {
      setScreen("admin_loading");
      void load("initial");
    }
  }, [auth.status, auth.status === "signed-in" ? auth.uid : null, load]);

  const runAction = useCallback(
    async (subpath: "approve" | "reject" | "pending", email: string) => {
      const authz = await authorizationHeader();
      if (!authz) {
        setScreen("token_error");
        return;
      }
      setRowBusy(email);
      setFlash(null);
      try {
        const res = await fetch(`/api/internal/beta-applications/${subpath}`, {
          method: "POST",
          headers: { Authorization: authz, "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) return;
        if (subpath === "approve") setFlash("베타 사용 승인이 완료되었습니다.");
        else if (subpath === "reject") setFlash("베타 신청이 반려 상태로 변경되었습니다.");
        else setFlash("신청 상태를 대기로 되돌렸습니다.");
        await load("reload");
      } finally {
        setRowBusy(null);
      }
    },
    [load],
  );

  const showAuthLoading = auth.status === "loading";
  const showSignedOut = auth.status === "signed-out" && screen === "signed_out";
  const showTokenError = auth.status === "signed-in" && screen === "token_error";
  const showAdminLoading = auth.status === "signed-in" && screen === "admin_loading";
  const showForbidden = auth.status === "signed-in" && screen === "forbidden";
  const showMisconfigured = auth.status === "signed-in" && screen === "misconfigured";
  const showListError = auth.status === "signed-in" && screen === "list_error";
  const showReady = auth.status === "signed-in" && screen === "ready";

  return (
    <div className="relative flex min-h-[100dvh] min-h-[100svh] flex-col overflow-x-hidden text-slate-100">
      <InspirationalBackdrop />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[0] bg-[radial-gradient(780px_440px_at_10%_-4%,rgba(56,189,248,0.095),transparent_56%),radial-gradient(680px_420px_at_100%_4%,rgba(139,92,246,0.078),transparent_54%),radial-gradient(520px_360px_at_50%_96%,rgba(30,27,75,0.06),transparent_58%)] opacity-[0.97]"
      />

      <header className="relative z-10 border-b border-white/[0.09] bg-[#050a14]/94 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Internal</p>
            <h1 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">Sensora 베타 승인 관리</h1>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">대표자 전용 내부 승인 페이지입니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/?view=landing"
              className="inline-flex touch-manipulation items-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-sky-400/28 hover:bg-white/[0.08]"
            >
              홈
            </Link>
            {auth.status === "signed-in" ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex touch-manipulation items-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/[0.18]"
              >
                로그아웃
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-[max(1rem,calc(env(safe-area-inset-left,1rem)))] py-8 pr-[max(1rem,calc(env(safe-area-inset-right,1rem)))]">
        <div className="mx-auto w-full max-w-6xl">
          {flash ? (
            <p
              className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100"
              role="status"
            >
              {flash}
            </p>
          ) : null}

          {showAuthLoading ? (
            <p className="rounded-2xl border border-white/[0.08] bg-slate-950/50 px-6 py-10 text-center text-sm text-slate-400">
              로그인 상태를 확인하고 있습니다.
            </p>
          ) : null}

          {showSignedOut ? (
            <div className="sensora-premium-card rounded-2xl border border-white/[0.1] bg-[#050f1a]/75 px-6 py-10 text-center backdrop-blur-md sm:px-10">
              <p className="text-base text-slate-200">이 페이지를 보려면 Google 로그인이 필요합니다.</p>
              <Link
                href="/login?next=/internal/beta-approval"
                prefetch={false}
                className="sensora-premium-primary-workspace mt-6 inline-flex min-h-12 items-center justify-center rounded-xl px-8 text-sm font-semibold touch-manipulation"
              >
                로그인으로 이동
              </Link>
            </div>
          ) : null}

          {showTokenError ? (
            <div className="sensora-premium-card rounded-2xl border border-white/[0.1] bg-[#050f1a]/75 px-6 py-10 text-center backdrop-blur-md sm:px-10">
              <p className="text-base leading-relaxed text-slate-200">{MSG_TOKEN}</p>
              <Link
                href="/login?next=/internal/beta-approval"
                prefetch={false}
                className="sensora-premium-primary-workspace mt-6 inline-flex min-h-12 items-center justify-center rounded-xl px-8 text-sm font-semibold touch-manipulation"
              >
                로그인으로 이동
              </Link>
            </div>
          ) : null}

          {showAdminLoading ? (
            <p className="rounded-2xl border border-white/[0.08] bg-slate-950/50 px-6 py-10 text-center text-sm text-slate-400">
              관리자 권한을 확인하고 있습니다.
            </p>
          ) : null}

          {showForbidden ? (
            <div className="sensora-premium-card rounded-2xl border border-white/[0.1] bg-[#050f1a]/75 px-6 py-10 text-center backdrop-blur-md sm:px-10">
              <p className="text-base leading-relaxed text-slate-200">이 페이지는 Sensora 내부 운영자만 접근할 수 있습니다.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                현재 로그인된 Google 계정이 관리자 목록에 포함되어 있는지 확인해 주세요.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Vercel의 ADMIN_EMAILS 값과 현재 로그인 이메일이 정확히 일치해야 합니다.
              </p>
              <p className="mt-5 rounded-xl border border-white/[0.08] bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                현재 로그인된 Google 계정:{" "}
                <span className="font-mono font-medium text-slate-100">
                  {maskEmailForBetaDisplay(auth.status === "signed-in" ? auth.email : null)}
                </span>
              </p>
            </div>
          ) : null}

          {showMisconfigured ? (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-950/30 px-6 py-8 text-sm text-amber-100">
              서버에 Firestore 관리자 설정(<code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">FIREBASE_SERVICE_ACCOUNT_JSON</code>)이
              없어 목록을 불러올 수 없습니다. 배포 환경 변수를 확인해 주세요.
            </div>
          ) : null}

          {showListError && loadErr ? (
            <p className="rounded-2xl border border-red-500/25 bg-red-950/35 px-6 py-10 text-center text-sm text-red-100" role="alert">
              {loadErr}
            </p>
          ) : null}

          {showReady && listLoading ? (
            <p className="rounded-2xl border border-white/[0.08] bg-slate-950/50 px-6 py-10 text-center text-sm text-slate-400">
              신청 목록을 불러오는 중…
            </p>
          ) : null}

          {showReady && !listLoading ? (
            <>
              {loadErr ? (
                <p className="mb-6 rounded-xl border border-red-500/25 bg-red-950/35 px-4 py-3 text-sm text-red-100" role="alert">
                  {loadErr}
                </p>
              ) : null}

              {!loadErr && rows.length === 0 ? (
                <p className="rounded-2xl border border-white/[0.08] bg-slate-950/50 px-6 py-12 text-center text-sm text-slate-400">
                  현재 확인할 베타 신청자가 없습니다.
                </p>
              ) : null}

              {rows.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-white/[0.1] bg-[#050f1a]/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
                  <table className="min-w-[920px] w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">이름</th>
                        <th className="px-4 py-3">이메일</th>
                        <th className="px-4 py-3">연락처</th>
                        <th className="px-4 py-3">소속</th>
                        <th className="px-4 py-3">고객관리 방식</th>
                        <th className="px-4 py-3">사용 이유</th>
                        <th className="px-4 py-3">신청일</th>
                        <th className="px-4 py-3">상태</th>
                        <th className="px-4 py-3">처리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.email} className="border-b border-white/[0.06] align-top text-slate-200 last:border-0">
                          <td className="max-w-[9rem] px-4 py-3 font-medium text-slate-100">{r.fullName}</td>
                          <td className="max-w-[11rem] break-all px-4 py-3 font-mono text-xs text-slate-300">{r.email}</td>
                          <td className="max-w-[8rem] px-4 py-3 text-slate-300">{r.contact}</td>
                          <td className="max-w-[10rem] px-4 py-3 text-slate-300">{r.dealership}</td>
                          <td className="max-w-[14rem] px-4 py-3 text-xs leading-relaxed text-slate-400">{r.currentCrmApproach}</td>
                          <td className="max-w-[14rem] px-4 py-3 text-xs leading-relaxed text-slate-400">{r.motivation}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">{formatWhen(r.submittedAt)}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                r.status === "approved"
                                  ? "bg-emerald-500/15 text-emerald-200"
                                  : r.status === "rejected"
                                    ? "bg-red-500/15 text-red-200"
                                    : "bg-slate-500/15 text-slate-300",
                              ].join(" ")}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <button
                                type="button"
                                disabled={rowBusy === r.email || r.status === "approved"}
                                onClick={() => void runAction("approve", r.email)}
                                className="rounded-lg bg-emerald-600/90 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                승인
                              </button>
                              <button
                                type="button"
                                disabled={rowBusy === r.email || r.status === "rejected"}
                                onClick={() => void runAction("reject", r.email)}
                                className="rounded-lg border border-red-500/35 bg-red-950/40 px-2.5 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                반려
                              </button>
                              <button
                                type="button"
                                disabled={rowBusy === r.email || r.status === "pending"}
                                onClick={() => void runAction("pending", r.email)}
                                className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                대기 유지
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-600">
                승인·반려는 서버에서 관리자 이메일을 다시 검증합니다. 신청 이메일과 Google 로그인 이메일이 같을 때만 워크스페이스가 열립니다.
              </p>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
