"use client";

import Link from "next/link";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { NotebookCover } from "@/app/components/NotebookCover";
import { CRMApp } from "@/app/crm/CRMApp";
import { useAuth } from "@/app/crm/useAuth";
import { sellerCanUseApp, useSellerProfile } from "@/app/crm/useSellerProfile";
import { isFirebaseConfigured, isGoogleAuthEnabled } from "@/app/firebase/client";

export default function Home() {
  const { auth, authError, signIn, signOut } = useAuth();
  const firebaseReady = isFirebaseConfigured();
  const googleAuthEnabled = isGoogleAuthEnabled();
  const seller = useSellerProfile(auth.status === "signed-in" ? auth.uid : null);

  const sellerSignedIn = firebaseReady && auth.status === "signed-in";

  /** Google 등 로그인 후 명함 검토까지 본 문서(CRM 동기화) 접근 제한(SMS 과금 회피 경로 포함) */
  const sellerApproved = sellerCanUseApp(seller.profile);
  const sellerLoading = sellerSignedIn && seller.loading;
  const sellerGateBlock =
    sellerSignedIn && !seller.loading && !seller.error && !sellerApproved;

  const crmUid =
    auth.status === "signed-in" && !(sellerLoading || sellerGateBlock) ? auth.uid : null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden text-zinc-950 dark:text-zinc-50">
      <InspirationalBackdrop />
      <NotebookCover />

      <header className="sticky top-0 z-20 border-b border-[color:var(--edge)] bg-[color:var(--paper)]/82 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            <div className="text-sm font-semibold tracking-tight">자동차 영업 AI 비서</div>
            <div className="hidden text-xs text-zinc-600 dark:text-zinc-300 sm:block">
              고객관리부터 출고 안내, 상담 기록, 다음 할 일까지 한 번에 정리하는 영업 파트너
            </div>
            <span className="crm-free-badge hidden sm:inline-flex">무료 사용</span>
          </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="crm-ghost-btn rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("crm-show-notebook-cover"));
            }}
          >
            표지
          </button>
          <Link
            href="/join"
            className="crm-ghost-btn hidden rounded-lg px-2.5 py-1.5 text-[11px] font-medium sm:inline-flex"
          >
            영업 계정 등록
          </Link>
          {auth.status === "loading" ? (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">로그인 확인 중…</div>
          ) : auth.status === "signed-in" ? (
            <>
              <div className="hidden text-xs text-zinc-600 dark:text-zinc-300 sm:block">
                {auth.name ?? auth.email ?? auth.uid}
              </div>
              <button
                className="crm-ghost-btn rounded-lg px-3 py-2 text-xs font-semibold"
                onClick={signOut}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              {authError ? (
                <div className="max-w-[520px] text-xs text-red-700 dark:text-red-300">
                  로그인 오류: {authError}
                </div>
              ) : null}
              <button
                className={[
                  "crm-ink-btn rounded-lg px-3 py-2 text-xs font-semibold",
                  firebaseReady && googleAuthEnabled ? "" : "opacity-50",
                ].join(" ")}
                onClick={async () => {
                  try {
                    await signIn();
                  } catch (e) {
                    alert(e instanceof Error ? e.message : String(e));
                  }
                }}
                disabled={!firebaseReady || !googleAuthEnabled}
              >
                {googleAuthEnabled ? "Google로 시작하기" : "영업 시작하기"}
              </button>
            </>
          )}
        </div>
        </div>
      </header>

      <main
        id="crm-main"
        tabIndex={-1}
        className="crm-main-shell relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 px-4 py-5 outline-none"
        aria-label="수첩 본문"
      >
        <div className="crm-card relative w-full overflow-hidden rounded-2xl">
          {sellerLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center px-6 py-16 text-sm text-zinc-600 dark:text-zinc-300">
              영업 계정 상태를 확인하는 중…
            </div>
          ) : null}

          {!sellerLoading && seller.error ? (
            <div className="rounded-2xl border border-red-600/35 bg-red-500/12 px-5 py-4 text-sm leading-relaxed text-red-950 dark:bg-red-500/14 dark:text-red-50">
              <p className="font-semibold">판매자 프로필 불러오기 실패</p>
              <p className="mt-1">{seller.error}</p>
              <p className="mt-3 text-[11px] opacity-95">
                Firestore <code className="rounded bg-black/10 px-1 py-px">sellerProfiles/{"{uid}"}</code>
                에 대한 읽기 권한이 있는지 확인해 주세요.
              </p>
            </div>
          ) : null}

          {!sellerLoading && sellerGateBlock ? (
            <div className="flex flex-col gap-6 px-6 py-14 text-center sm:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                  영업 전용
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  아직 확인(승인) 전입니다
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {seller.profile?.approvalStatus === "rejected"
                    ? (seller.profile.rejectReason?.trim()
                        ? `사유: ${seller.profile.rejectReason}`
                        : "등록 정보를 다시 확인한 뒤 다시 접수할 수 있습니다.")
                    : seller.profile?.approvalStatus === "pending"
                      ? "제출해 주신 명함을 확인 중입니다. 승인이 완료되면 자동으로 열립니다."
                      : "Google 로그인 후 명함 이미지를 제출하면 승인 요청이 접수됩니다."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/join"
                  className="crm-ink-btn rounded-xl px-5 py-3 text-xs font-semibold"
                >
                  등록 계속하기
                </Link>
                <button
                  type="button"
                  className="crm-ghost-btn rounded-xl px-4 py-2.5 text-xs font-semibold"
                  onClick={() => signOut()}
                >
                  다른 Google 계정으로
                </button>
              </div>
              <Link href="/toc" className="text-[11px] font-medium text-zinc-600 underline underline-offset-2 dark:text-zinc-300">
                기능 소개(목차)만 보기
              </Link>
            </div>
          ) : null}

          {!sellerLoading && !sellerGateBlock ? (
            <CRMApp
              uid={crmUid}
              sellerDisplayName={
                auth.status === "signed-in"
                  ? auth.name?.trim() || auth.email?.split("@")[0] || ""
                  : ""
              }
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
