"use client";

import { InspirationalBackdrop } from "@/app/components/InspirationalBackdrop";
import { NotebookCover } from "@/app/components/NotebookCover";
import { CRMApp } from "@/app/crm/CRMApp";
import { useAuth } from "@/app/crm/useAuth";
import { isFirebaseConfigured } from "@/app/firebase/client";

export default function Home() {
  const { auth, authError, signIn, signOut } = useAuth();
  const firebaseReady = isFirebaseConfigured();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden text-zinc-950 dark:text-zinc-50">
      <InspirationalBackdrop />
      <NotebookCover />

      <header className="sticky top-0 z-20 border-b border-[color:var(--edge)] bg-[color:var(--paper)]/82 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            <div className="text-sm font-semibold tracking-tight">자동차 컨설턴트 전용 수첩</div>
            <div className="hidden text-xs text-zinc-600 dark:text-zinc-300 sm:block">
              매장 상담에 맞춘 디자인 · 손글씨 감각
            </div>
          </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="moleskine-ghost-btn rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("crm-show-notebook-cover"));
            }}
          >
            표지
          </button>
          <div className="hidden text-[11px] text-zinc-500 dark:text-zinc-400 sm:block">
            auth: {auth.status}
          </div>
          {auth.status === "loading" ? (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">로그인 확인 중…</div>
          ) : auth.status === "signed-in" ? (
            <>
              <div className="hidden text-xs text-zinc-600 dark:text-zinc-300 sm:block">
                {auth.name ?? auth.email ?? auth.uid}
              </div>
              <button
                className="moleskine-ghost-btn rounded-lg px-3 py-2 text-xs font-semibold"
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
                  "moleskine-ink-btn rounded-lg px-3 py-2 text-xs font-semibold",
                  firebaseReady ? "" : "opacity-50",
                ].join(" ")}
                onClick={async () => {
                  try {
                    await signIn();
                  } catch (e) {
                    alert(e instanceof Error ? e.message : String(e));
                  }
                }}
                disabled={!firebaseReady}
              >
                Google 로그인
              </button>
            </>
          )}
        </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 px-4 py-5">
        <div className="moleskine-card w-full overflow-hidden rounded-2xl">
          <CRMApp
            uid={auth.status === "signed-in" ? auth.uid : null}
            sellerDisplayName={
              auth.status === "signed-in"
                ? auth.name?.trim() || auth.email?.split("@")[0] || ""
                : ""
            }
          />
        </div>
      </main>
    </div>
  );
}
