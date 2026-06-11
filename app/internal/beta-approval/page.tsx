"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { getFirebaseAuth, isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";
import { useAuth } from "@/app/crm/useAuth";
import {
  betaApprovalStatusLabel,
  formatBetaApprovalSubmittedAt,
  isSuspiciousBetaApplicant,
  maskBetaApprovalEmail,
  maskBetaApprovalPhone,
  type BetaApprovalApplicant,
  type BetaApprovalStatus,
} from "@/lib/internalBetaApproval";

type StatusFilter = "all" | BetaApprovalStatus;

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "pending", label: "승인 대기" },
  { key: "approved", label: "승인 완료" },
  { key: "rejected", label: "반려" },
];

function statusBadgeClass(status: BetaApprovalStatus): string {
  if (status === "approved") return "border-emerald-300/25 bg-emerald-300/[0.1] text-emerald-100";
  if (status === "rejected") return "border-rose-300/25 bg-rose-300/[0.1] text-rose-100";
  return "border-amber-300/25 bg-amber-300/[0.1] text-amber-100";
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth().currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function ApplicantActions({
  applicant,
  disabled,
  onDetail,
  onAction,
}: {
  applicant: BetaApprovalApplicant;
  disabled: boolean;
  onDetail: (applicant: BetaApprovalApplicant) => void;
  onAction: (applicant: BetaApprovalApplicant, action: "approve" | "reject") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onDetail(applicant)}
        className="min-h-10 rounded-xl border border-white/[0.14] bg-white/[0.055] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.09]"
      >
        상세보기
      </button>
      <button
        type="button"
        disabled={disabled || applicant.status === "approved"}
        onClick={() => onAction(applicant, "approve")}
        className="min-h-10 rounded-xl border border-emerald-300/25 bg-emerald-300/[0.12] px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/[0.18] disabled:cursor-not-allowed disabled:opacity-45"
      >
        승인하기
      </button>
      <button
        type="button"
        disabled={disabled || applicant.status === "rejected"}
        onClick={() => onAction(applicant, "reject")}
        className="min-h-10 rounded-xl border border-rose-300/25 bg-rose-300/[0.12] px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/[0.18] disabled:cursor-not-allowed disabled:opacity-45"
      >
        반려하기
      </button>
    </div>
  );
}

function ApplicantCard({
  applicant,
  disabled,
  onDetail,
  onAction,
}: {
  applicant: BetaApprovalApplicant;
  disabled: boolean;
  onDetail: (applicant: BetaApprovalApplicant) => void;
  onAction: (applicant: BetaApprovalApplicant, action: "approve" | "reject") => void;
}) {
  const suspicious = isSuspiciousBetaApplicant(applicant);
  return (
    <article className="rounded-[22px] border border-white/[0.11] bg-slate-950/70 p-4 shadow-[0_20px_52px_-34px_rgba(0,0,0,0.75)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold tracking-tight text-slate-50">{applicant.fullName || "이름 없음"}</h2>
            {suspicious ? (
              <span className="rounded-full border border-orange-300/25 bg-orange-300/[0.12] px-2 py-0.5 text-[11px] font-bold text-orange-100">
                검토 필요
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-medium text-slate-400">{applicant.dealership || "소속 미입력"}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{applicant.jobRole || "직무 미입력"}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(applicant.status)}`}>
          {betaApprovalStatusLabel(applicant.status)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-xs font-semibold text-slate-500">이메일</dt>
          <dd className="mt-1 break-all font-medium text-slate-200">{maskBetaApprovalEmail(applicant.email)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">연락처</dt>
          <dd className="mt-1 font-medium text-slate-200">{maskBetaApprovalPhone(applicant.contact)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">현재 고객관리 방식</dt>
          <dd className="mt-1 line-clamp-3 leading-relaxed text-slate-300">{applicant.currentCrmApproach || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">사용 목적</dt>
          <dd className="mt-1 line-clamp-3 leading-relaxed text-slate-300">{applicant.usePurpose || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">신청일</dt>
          <dd className="mt-1 font-medium text-slate-300">{formatBetaApprovalSubmittedAt(applicant.submittedAt)}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-white/[0.09] pt-4">
        <ApplicantActions applicant={applicant} disabled={disabled} onDetail={onDetail} onAction={onAction} />
      </div>
    </article>
  );
}

function InternalBetaApprovalContent() {
  const { auth, authError, signIn, signOut } = useAuth();
  const searchParams = useSearchParams();
  const mode = searchParams.get("v") === "firestore" ? "firestore" : "firestore";
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [applicants, setApplicants] = useState<BetaApprovalApplicant[]>([]);
  const [selected, setSelected] = useState<BetaApprovalApplicant | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? applicants : applicants.filter((applicant) => applicant.status === filter)),
    [applicants, filter],
  );

  const loadApplicants = useCallback(async () => {
    if (auth.status !== "signed-in") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/internal/beta-approval", {
        headers: await authHeaders(),
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; applicants?: BetaApprovalApplicant[]; error?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "목록을 불러오지 못했습니다.");
      setApplicants(Array.isArray(data.applicants) ? data.applicants : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [auth.status]);

  useEffect(() => {
    void loadApplicants();
  }, [loadApplicants]);

  const handleAction = useCallback(
    async (applicant: BetaApprovalApplicant, action: "approve" | "reject") => {
      const label = action === "approve" ? "승인" : "반려";
      if (!window.confirm(`${applicant.fullName || applicant.email} 신청을 ${label}할까요?\n서버에서 관리자 이메일을 다시 검증한 뒤 처리됩니다.`)) return;
      setSavingId(applicant.id);
      setError(null);
      try {
        const res = await fetch(`/api/internal/beta-approval/${encodeURIComponent(applicant.id)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(await authHeaders()),
          },
          body: JSON.stringify({ action }),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; status?: BetaApprovalStatus } | null;
        if (!res.ok || !data?.ok || !data.status) throw new Error(data?.error || "상태 변경에 실패했습니다.");
        setApplicants((prev) => prev.map((item) => (item.id === applicant.id ? { ...item, status: data.status! } : item)));
        setSelected((prev) => (prev?.id === applicant.id ? { ...prev, status: data.status! } : prev));
      } catch (e) {
        setError(e instanceof Error ? e.message : "상태 변경에 실패했습니다.");
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  return (
    <main className="min-h-[100dvh] bg-[#020817] px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(820px_420px_at_12%_-10%,rgba(56,189,248,0.14),transparent_58%),radial-gradient(780px_420px_at_100%_0%,rgba(139,92,246,0.1),transparent_56%)]" />

      <div className="relative z-[1] mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="rounded-[26px] border border-white/[0.11] bg-slate-950/72 px-5 py-5 shadow-[0_28px_78px_-44px_rgba(0,0,0,0.82)] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300/85">Internal · {mode}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">베타 신청 승인 관리</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
                목록에서는 이메일과 연락처를 마스킹합니다. 전체 개인정보는 상세보기에서만 확인하고, 승인/반려는 서버 API가 관리자 이메일을 다시 검증한 뒤 Firestore에 반영합니다.
              </p>
              <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">
                관리자 이메일 목록은 코드에 하드코딩하지 않고 <span className="font-semibold text-slate-300">BETA_APPROVAL_ADMIN_EMAILS</span> 환경변수로만 관리합니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/?view=landing" className="min-h-10 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200">
                랜딩으로
              </Link>
              {auth.status === "signed-in" ? (
                <button type="button" onClick={() => void signOut()} className="min-h-10 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200">
                  로그아웃
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {!isFirebaseConfigured() ? (
          <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-5 py-4 text-sm leading-relaxed text-amber-100">
            Firebase 설정이 없어 관리자 로그인을 진행할 수 없습니다. NEXT_PUBLIC_FIREBASE_* 환경변수를 설정한 뒤 사용하세요.
          </section>
        ) : !isGoogleAuthEnabled() ? (
          <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-5 py-4 text-sm leading-relaxed text-amber-100">
            현재 Google 로그인 기능이 꺼져 있어 내부 승인 페이지 접근이 차단됩니다.
          </section>
        ) : auth.status === "loading" ? (
          <section className="rounded-2xl border border-white/[0.1] bg-slate-950/60 px-5 py-10 text-center text-sm text-slate-400">관리자 로그인 상태를 확인하는 중입니다…</section>
        ) : auth.status !== "signed-in" ? (
          <section className="rounded-2xl border border-white/[0.1] bg-slate-950/60 px-5 py-8 text-center">
            <h2 className="text-lg font-semibold text-slate-50">관리자 로그인이 필요합니다</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              클라이언트 화면에서만 막지 않고, 목록 조회와 승인/반려 API에서도 관리자 이메일을 다시 검증합니다.
            </p>
            {authError ? <p className="mt-3 text-sm font-medium text-rose-200">{authError}</p> : null}
            <button
              type="button"
              onClick={() => void signIn()}
              className="mt-5 min-h-11 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950"
            >
              Google 관리자 로그인
            </button>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-white/[0.11] bg-slate-950/66 p-3 shadow-[0_22px_60px_-40px_rgba(0,0,0,0.8)]">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="베타 신청 상태 필터">
                {FILTERS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    className={[
                      "min-h-10 rounded-xl px-4 py-2 text-sm font-bold transition",
                      filter === item.key ? "bg-sky-300 text-slate-950" : "border border-white/[0.1] bg-white/[0.045] text-slate-300",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void loadApplicants()}
                  disabled={loading}
                  className="ml-auto min-h-10 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 disabled:opacity-50"
                >
                  {loading ? "불러오는 중…" : "새로고침"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-sky-300/14 bg-sky-300/[0.07] px-5 py-4 text-sm leading-relaxed text-sky-100">
              승인/반려 버튼을 누르면 서버에서 Firebase 로그인 토큰과 관리자 이메일을 다시 확인한 뒤 처리합니다. Firestore rules는 직접 클라이언트 접근도 관리자 커스텀 클레임 기준으로 제한합니다.
            </section>

            {error ? (
              <section className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] px-5 py-4 text-sm leading-relaxed text-rose-100">
                {error}
              </section>
            ) : null}

            <section className="grid gap-3 sm:hidden">
              {filtered.map((applicant) => (
                <ApplicantCard
                  key={applicant.id}
                  applicant={applicant}
                  disabled={savingId === applicant.id}
                  onDetail={setSelected}
                  onAction={handleAction}
                />
              ))}
              {!loading && filtered.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.1] bg-slate-950/55 px-5 py-10 text-center text-sm text-slate-400">표시할 신청자가 없습니다.</div>
              ) : null}
            </section>

            <section className="hidden overflow-hidden rounded-[24px] border border-white/[0.11] bg-slate-950/66 shadow-[0_28px_78px_-46px_rgba(0,0,0,0.82)] sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1060px] border-collapse text-left text-sm">
                  <thead className="bg-white/[0.045] text-xs uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">신청자</th>
                      <th className="px-4 py-3">연락처</th>
                      <th className="px-4 py-3">소속/직무</th>
                      <th className="px-4 py-3">목적/관리 방식</th>
                      <th className="px-4 py-3">상태</th>
                      <th className="px-4 py-3">신청일</th>
                      <th className="px-4 py-3">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {filtered.map((applicant) => {
                      const suspicious = isSuspiciousBetaApplicant(applicant);
                      return (
                        <tr key={applicant.id} className="align-top">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-50">{applicant.fullName || "이름 없음"}</div>
                            {suspicious ? (
                              <div className="mt-1 inline-flex rounded-full border border-orange-300/25 bg-orange-300/[0.12] px-2 py-0.5 text-[11px] font-bold text-orange-100">
                                검토 필요
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-4">
                            <div className="break-all text-slate-300">{maskBetaApprovalEmail(applicant.email)}</div>
                            <div className="mt-1 text-slate-500">{maskBetaApprovalPhone(applicant.contact)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="max-w-[14rem] text-slate-300">{applicant.dealership || "—"}</div>
                            <div className="mt-1 text-slate-500">{applicant.jobRole || "—"}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="max-w-[18rem] line-clamp-2 text-slate-300">{applicant.usePurpose || "—"}</div>
                            <div className="mt-1 max-w-[18rem] line-clamp-2 text-slate-500">{applicant.currentCrmApproach || "—"}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(applicant.status)}`}>
                              {betaApprovalStatusLabel(applicant.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-400">{formatBetaApprovalSubmittedAt(applicant.submittedAt)}</td>
                          <td className="px-4 py-4">
                            <ApplicantActions applicant={applicant} disabled={savingId === applicant.id} onDetail={setSelected} onAction={handleAction} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      {selected ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-label="상세 닫기"
            onClick={() => setSelected(null)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="beta-approval-detail-title"
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(92dvh,calc(100svh-1rem))] w-[min(calc(100vw-28px),42rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[26px] border border-white/[0.13] bg-[#07111f] shadow-[0_38px_90px_-30px_rgba(0,0,0,0.82)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.09] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300/80">상세보기</p>
                <h2 id="beta-approval-detail-title" className="mt-1 text-xl font-semibold text-slate-50">{selected.fullName || "이름 없음"}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="min-h-10 rounded-xl border border-white/[0.12] px-3 py-2 text-xs font-bold text-slate-200">
                닫기
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ["이메일", selected.email || "—"],
                  ["연락처", selected.contact || "—"],
                  ["소속/브랜드", selected.dealership || "—"],
                  ["직무", selected.jobRole || "—"],
                  ["사용 목적", selected.usePurpose || "—"],
                  ["현재 고객관리 방식", selected.currentCrmApproach || "—"],
                  ["상태", betaApprovalStatusLabel(selected.status)],
                  ["신청일", formatBetaApprovalSubmittedAt(selected.submittedAt)],
                  ["소스", selected.source || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 py-3">
                    <dt className="text-xs font-bold text-slate-500">{label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words font-medium leading-relaxed text-slate-100">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-xs leading-relaxed text-amber-100">
                개인정보 전체 값은 상세보기에서만 노출됩니다. 외부 공유나 콘솔 로그에 전체 값을 남기지 마세요.
              </div>
            </div>
            <div className="border-t border-white/[0.09] px-5 py-4">
              <ApplicantActions applicant={selected} disabled={savingId === selected.id} onDetail={setSelected} onAction={handleAction} />
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default function InternalBetaApprovalPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center bg-[#020817] px-4 text-sm text-slate-400">
          내부 승인 화면을 불러오는 중입니다…
        </main>
      }
    >
      <InternalBetaApprovalContent />
    </Suspense>
  );
}
