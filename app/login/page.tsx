"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { SensoraSymbol } from "@/app/crm/SensoraSymbol";
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  getFirebaseAuth,
  getFirebaseDb,
  isFirebaseConfigured,
} from "@/app/firebase/client";

function firebaseErrorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
}

function authErrorMessage(error: unknown): string {
  const code = firebaseErrorCode(error);

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
  return "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function sellerProfileErrorMessage(error: unknown): string {
  const code = firebaseErrorCode(error);

  if (code.includes("permission-denied")) {
    return "판매자 승인 프로필을 읽을 권한이 없습니다. Firestore sellerProfiles self-read rules 배포 상태를 확인해 주세요.";
  }
  if (code.includes("unavailable") || code.includes("network")) {
    return "판매자 승인 상태를 확인할 수 없습니다. 네트워크 상태를 확인한 뒤 다시 로그인해 주세요.";
  }
  return "판매자 승인 상태 확인에 실패했습니다. 잠시 후 다시 로그인해 주세요.";
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
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      try {
        const sellerProfile = await getDoc(
          doc(getFirebaseDb(), "sellerProfiles", credential.user.uid),
        );

        if (!sellerProfile.exists()) {
          await firebaseSignOut(auth);
          setError(
            "판매자 승인 프로필이 없습니다. Sensora 운영 담당자에게 승인을 요청해 주세요.",
          );
          return;
        }

        if (sellerProfile.data().approvalStatus !== "approved") {
          await firebaseSignOut(auth);
          setError(
            "판매자 계정 승인이 아직 완료되지 않았습니다. 승인 후 다시 로그인해 주세요.",
          );
          return;
        }
      } catch (sellerProfileError) {
        await firebaseSignOut(auth);
        setError(sellerProfileErrorMessage(sellerProfileError));
        return;
      }

      router.replace("/sensora/workspace");
    } catch (loginError) {
      setError(authErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--s-bg)] px-4 py-10 text-[var(--s-text)]">
      <section className="w-full max-w-md rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-6 shadow-[0_30px_90px_-48px_rgba(0,0,0,0.9)] sm:p-8" aria-labelledby="login-title">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#F5EEE4]">
            <SensoraSymbol className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.08em]">SENSORA</p>
            <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--s-text-3)]">Auto CRM</p>
          </div>
        </div>

        <div className="mt-8">
          <span className="rounded-full border border-[var(--s-ok-border)] bg-[var(--s-ok-tint)] px-2.5 py-1 text-[10px] font-medium text-[var(--s-ok-text)]">Firebase Auth</span>
          <h1 id="login-title" className="mt-4 text-2xl font-semibold tracking-[-0.03em]">승인 계정 로그인</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--s-text-4)]">승인된 판매자 계정으로 로그인하면 본인이 저장한 Lead를 조회하고 새 Lead를 직접 저장할 수 있습니다.</p>
        </div>

        {!firebaseConfigured ? (
          <div className="mt-6 rounded-lg border border-[var(--s-err-border)] bg-[var(--s-err-tint)] px-4 py-3 text-sm leading-6 text-[var(--s-err-text)]" role="alert">
            Firebase 설정이 없습니다. `.env.local`의 NEXT_PUBLIC_FIREBASE_* 값을 확인하고 개발 서버를 다시 시작해 주세요.
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
          <label className="text-xs font-medium text-[var(--s-text-2)]">
            이메일
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-3 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              placeholder="approved@example.com"
              required
            />
          </label>
          <label className="text-xs font-medium text-[var(--s-text-2)]">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-3 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]"
              placeholder="비밀번호 입력"
              required
            />
          </label>

          <div aria-live="polite">
            {error ? <p className="mb-3 rounded-lg border border-[var(--s-err-border)] bg-[var(--s-err-tint)] px-4 py-3 text-sm leading-6 text-[var(--s-err-text)]" role="alert">{error}</p> : null}
            <button type="submit" disabled={!canSubmit} className="w-full rounded-lg bg-[var(--s-brand)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--s-brand-hover)] disabled:cursor-not-allowed disabled:bg-[var(--s-border-2)] disabled:text-[var(--s-text-3)]">
              {submitting ? "승인 상태 확인 중…" : "이메일로 로그인"}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-lg border border-[var(--s-border)] bg-[var(--s-deep)] px-4 py-3 text-xs leading-5 text-[var(--s-text-4)]">
          로그인만으로 권한이 열리지 않습니다. Firestore의 <code>sellerProfiles/{"{uid}"}</code> 문서가 존재하고 <code>approvalStatus</code>가 <code>approved</code>여야 합니다.
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link href="/sensora" className="text-[var(--s-text-4)] hover:text-[var(--s-text-emph)]">Sensora 소개로</Link>
          <Link href="/register" className="font-medium text-[var(--s-brand-text)] hover:text-[var(--s-brand-hover)]">베타 등록 흐름 확인</Link>
        </div>
      </section>
    </main>
  );
}
