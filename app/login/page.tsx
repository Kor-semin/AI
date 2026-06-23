"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { getFirebaseAuth, isFirebaseConfigured } from "@/app/firebase/client";
import {
  DEFAULT_SENSORA_WORKSPACE_ID,
  listSensoraLeads,
  SensoraLeadPersistenceError,
} from "@/lib/sensora";

function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "이메일 또는 비밀번호를 확인해 주세요.";
  }
  if (code.includes("user-disabled")) {
    return "사용이 중지된 계정입니다. Sensora 운영 담당자에게 문의해 주세요.";
  }
  if (code.includes("too-many-requests")) {
    return "로그인 시도가 많아 잠시 차단되었습니다. 잠시 후 다시 시도해 주세요.";
  }
  if (code.includes("operation-not-allowed")) {
    return "Firebase Authentication에서 이메일/비밀번호 로그인 제공자를 활성화해 주세요.";
  }
  if (code.includes("network-request-failed")) {
    return "Firebase Auth에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.";
  }
  if (error instanceof SensoraLeadPersistenceError) {
    return error.message;
  }
  return "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

export default function LoginPage() {
  const router = useRouter();
  const firebaseConfigured = isFirebaseConfigured();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = firebaseConfigured && email.trim().length > 3 && password.length > 0 && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    const auth = getFirebaseAuth();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);

      try {
        await listSensoraLeads(DEFAULT_SENSORA_WORKSPACE_ID);
      } catch (leadAccessError) {
        if (
          leadAccessError instanceof SensoraLeadPersistenceError &&
          leadAccessError.code === "permission-denied"
        ) {
          await firebaseSignOut(auth);
          setError(
            "로그인은 성공했지만 승인된 판매자 계정이 아닙니다. sellerProfiles 승인 상태를 확인해 주세요.",
          );
          return;
        }
        throw leadAccessError;
      }

      router.replace("/sensora/workspace");
    } catch (loginError) {
      setError(authErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0B0D] px-4 py-10 text-[#F4F6F8]">
      <section className="w-full max-w-md rounded-2xl border border-[#2B3037] bg-[#14171B] p-6 shadow-[0_30px_90px_-48px_rgba(0,0,0,0.9)] sm:p-8" aria-labelledby="login-title">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#7A263A] text-base font-semibold">S</span>
          <div>
            <p className="text-sm font-semibold tracking-[0.08em]">SENSORA</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#7F8792]">Auto CRM</p>
          </div>
        </div>

        <div className="mt-8">
          <span className="rounded-full border border-[#355542] bg-[#17221B] px-2.5 py-1 text-[10px] font-medium text-[#79A78B]">Firebase Auth</span>
          <h1 id="login-title" className="mt-4 text-2xl font-semibold tracking-[-0.03em]">승인 계정 로그인</h1>
          <p className="mt-2 text-sm leading-6 text-[#8D949E]">승인된 판매자 계정으로 로그인하면 본인이 저장한 Lead를 조회하고 새 Lead를 직접 저장할 수 있습니다.</p>
        </div>

        {!firebaseConfigured ? (
          <div className="mt-6 rounded-lg border border-[#6E3442] bg-[#25151A] px-4 py-3 text-sm leading-6 text-[#E2A8B6]" role="alert">
            Firebase 설정이 없습니다. `.env.local`의 NEXT_PUBLIC_FIREBASE_* 값을 확인하고 개발 서버를 다시 시작해 주세요.
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
          <label className="text-xs font-medium text-[#B7BDC6]">
            이메일
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-[#343A43] bg-[#101216] px-3 py-3 text-sm text-[#F4F6F8] outline-none placeholder:text-[#656D78] focus:border-[#8B3A4D] focus:ring-2 focus:ring-[#7A263A]/20"
              placeholder="approved@example.com"
              required
            />
          </label>
          <label className="text-xs font-medium text-[#B7BDC6]">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-[#343A43] bg-[#101216] px-3 py-3 text-sm text-[#F4F6F8] outline-none placeholder:text-[#656D78] focus:border-[#8B3A4D] focus:ring-2 focus:ring-[#7A263A]/20"
              placeholder="비밀번호 입력"
              required
            />
          </label>

          <div aria-live="polite">
            {error ? <p className="mb-3 rounded-lg border border-[#6E3442] bg-[#25151A] px-4 py-3 text-sm leading-6 text-[#E2A8B6]" role="alert">{error}</p> : null}
            <button type="submit" disabled={!canSubmit} className="w-full rounded-lg bg-[#7A263A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8D3047] disabled:cursor-not-allowed disabled:bg-[#343A43] disabled:text-[#7F8792]">
              {submitting ? "승인 상태 확인 중…" : "이메일로 로그인"}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-lg border border-[#2B3037] bg-[#101216] px-4 py-3 text-xs leading-5 text-[#8D949E]">
          로그인만으로 권한이 열리지 않습니다. Firestore의 <code>sellerProfiles/{"{uid}"}</code> 문서가 존재하고 <code>approvalStatus</code>가 <code>approved</code>여야 합니다.
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link href="/sensora" className="text-[#8D949E] hover:text-[#D3D7DD]">Sensora 소개로</Link>
          <Link href="/register" className="font-medium text-[#C2667D] hover:text-[#D27A90]">베타 등록 흐름 확인</Link>
        </div>
      </section>
    </main>
  );
}
