"use client";

import { CRMApp } from "@/app/crm/CRMApp";
import { useAuth } from "@/app/crm/useAuth";
import { isFirebaseConfigured } from "@/app/firebase/client";

export default function Home() {
  const { auth, authError, signIn, signOut } = useAuth();
  const firebaseReady = isFirebaseConfigured();

  return (
    <div className="moleskine-bg flex min-h-screen flex-col text-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-[color:var(--edge)] bg-[color:var(--paper)]/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            <div className="text-sm font-semibold tracking-tight">고객관리</div>
            <div className="hidden text-xs text-zinc-600 dark:text-zinc-300 sm:block">
              Moleskine style · paper + ink
            </div>
          </div>
        <div className="flex items-center gap-2">
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

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 px-4 py-5">
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
