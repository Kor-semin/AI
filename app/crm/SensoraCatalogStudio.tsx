"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * 내 카탈로그 스튜디오 — 영업사원 정보를 입력하면 고객에게 보낼 수 있는
 * 개인 카탈로그(디지털 명함) 링크를 만들어 줍니다.
 *
 * 브랜드 중립 원칙: 제조사 로고·차량 이미지·금융 조건은 시스템이 자동으로 넣지 않습니다.
 * (상표·저작권·금융광고 규제 검토 전까지는 영업사원 본인 정보만 다룹니다)
 */

type CatalogProfile = {
  name: string;
  title: string;
  showroom: string;
  phone: string;
  tagline: string;
};

const EMPTY_PROFILE: CatalogProfile = { name: "", title: "", showroom: "", phone: "", tagline: "" };
const PROFILE_KEY = "sensora:catalogProfile";

/* 같은 탭 구독용 초소형 스토어 (테마 컨트롤과 동일 패턴) */
let profileCache: CatalogProfile | null = null;
const listeners = new Set<() => void>();

function readProfile(): CatalogProfile {
  if (profileCache) return profileCache;
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    profileCache = raw ? { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<CatalogProfile>) } : EMPTY_PROFILE;
  } catch {
    profileCache = EMPTY_PROFILE;
  }
  return profileCache;
}

function writeProfile(profile: CatalogProfile): void {
  profileCache = profile;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}

function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function buildCardUrl(profile: CatalogProfile): string {
  const params = new URLSearchParams();
  params.set("name", profile.name.trim());
  if (profile.title.trim()) params.set("title", profile.title.trim());
  if (profile.showroom.trim()) params.set("showroom", profile.showroom.trim());
  if (profile.phone.trim()) params.set("phone", profile.phone.trim());
  if (profile.tagline.trim()) params.set("tagline", profile.tagline.trim());
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/sensora/card?${params.toString()}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 폴백 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

const inputClass =
  "mt-2 w-full rounded-lg border border-[var(--s-border-2)] bg-[var(--s-deep)] px-3 py-2.5 text-sm text-[var(--s-text)] outline-none placeholder:text-[var(--s-text-5)] focus:border-[var(--s-brand-hover)] focus:ring-2 focus:ring-[var(--s-brand-ring)]";

export function SensoraCatalogStudio({ sellerName }: { sellerName?: string }) {
  const saved = useSyncExternalStore(subscribeProfile, readProfile, () => EMPTY_PROFILE);
  const [draft, setDraft] = useState<CatalogProfile | null>(null);
  const [notice, setNotice] = useState<string>("");

  // 저장본이 있으면 그것을, 없으면 셸의 사용자 이름을 초기값으로
  const form = draft ?? (saved.name ? saved : { ...EMPTY_PROFILE, name: sellerName ?? "" });
  const canGenerate = form.name.trim().length > 0;
  const cardUrl = canGenerate ? buildCardUrl(form) : "";

  const update = (field: keyof CatalogProfile, value: string) => {
    setDraft({ ...form, [field]: value });
    if (notice) setNotice("");
  };

  const handleSave = () => {
    if (!canGenerate) {
      setNotice("이름을 입력해 주세요.");
      return;
    }
    writeProfile(form);
    setNotice("카탈로그 정보가 이 브라우저에 저장되었습니다.");
  };

  const handleCopy = async () => {
    if (!canGenerate) {
      setNotice("이름을 입력하면 링크가 만들어집니다.");
      return;
    }
    const ok = await copyText(cardUrl);
    setNotice(ok ? "카탈로그 링크가 복사되었습니다. 고객에게 문자·카카오톡으로 보내 보세요." : "복사에 실패했습니다. 링크를 직접 선택해 복사해 주세요.");
  };

  return (
    <div className="min-h-screen bg-[var(--s-bg)] p-5 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-brand-text)]">My Catalog</p>
          <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.035em] text-[var(--s-text)]">내 카탈로그</h1>
          <p className="mt-1.5 text-[0.8125rem] text-[var(--s-text-3)]">이름만 넣으면 고객에게 보낼 수 있는 개인 카탈로그 링크가 만들어집니다.</p>
        </div>
        <span className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-2 text-xs text-[var(--s-text-2)]">브랜드 중립 · 내 정보만 사용</span>
      </header>

      <div aria-live="polite">
        {notice ? (
          <p className="mt-5 rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] px-4 py-3 text-[0.8125rem] text-[var(--s-text-2)]" role="status">{notice}</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* 입력 */}
        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="catalog-form-title">
          <h2 id="catalog-form-title" className="text-lg font-semibold text-[var(--s-text)]">카탈로그 정보</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
              이름 <span className="text-[var(--s-brand-text)]">*</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="예: 김도윤" className={inputClass} />
            </label>
            <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
              직함
              <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="예: 수석 컨설턴트" className={inputClass} />
            </label>
            <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
              소속 전시장
              <input value={form.showroom} onChange={(e) => update("showroom", e.target.value)} placeholder="예: 서울 강남 전시장" className={inputClass} />
            </label>
            <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)]">
              연락처
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="예: 010-1234-5678" inputMode="tel" className={inputClass} />
            </label>
            <label className="text-[0.8125rem] font-medium text-[var(--s-text-2)] sm:col-span-2">
              한 줄 소개
              <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="예: 조건 비교부터 출고까지, 급하지 않게 도와드립니다." className={inputClass} />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={handleSave} className="rounded-lg bg-[var(--s-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]">
              정보 저장
            </button>
            <button type="button" onClick={handleCopy} className="rounded-lg border border-[var(--s-border-2)] px-4 py-2.5 text-sm font-medium text-[var(--s-text-2)] transition-colors hover:border-[var(--s-brand-border-soft)] hover:text-[var(--s-text)]">
              링크 복사
            </button>
            {canGenerate ? (
              <a href={cardUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[var(--s-border-2)] px-4 py-2.5 text-sm font-medium text-[var(--s-text-2)] transition-colors hover:border-[var(--s-brand-border-soft)] hover:text-[var(--s-text)]">
                새 탭에서 미리보기
              </a>
            ) : null}
          </div>

          {canGenerate ? (
            <p className="mt-4 break-all rounded-lg border border-[var(--s-border)] bg-[var(--s-deep)] px-4 py-3 font-mono text-xs leading-5 text-[var(--s-text-4)]">{cardUrl}</p>
          ) : null}

          <p className="mt-4 rounded-lg bg-[var(--s-brand-tint)] px-4 py-3 text-xs leading-5 text-[var(--s-text-2)]">
            제조사 로고·차량 사진·할부 조건은 넣지 않습니다. 상표·저작권과 금융광고 규제 검토가 끝나기 전까지는
            영업사원 본인 정보만으로 구성합니다.
          </p>
        </section>

        {/* 미리보기 */}
        <section className="rounded-2xl border border-[var(--s-border)] bg-[var(--s-card)] p-5 sm:p-6" aria-labelledby="catalog-preview-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="catalog-preview-title" className="text-lg font-semibold text-[var(--s-text)]">미리보기</h2>
            <span className="text-xs text-[var(--s-text-3)]">고객에게 보이는 모습</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--s-border)]">
            <div className="bg-[#2A0405] px-6 py-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#F5EEE4]">
                <svg viewBox="0 0 32 32" className="size-9" aria-hidden>
                  <path d="M3 16 30 2.4 30 7.4Z" fill="#820229" />
                  <path d="M3 16 30 8.6 30 12.9Z" fill="#A22B43" />
                  <path d="M3 16 30 14.1 30 17.9Z" fill="#DD8D92" />
                  <path d="M3 16 30 19.1 30 23.4Z" fill="#C5626D" />
                  <path d="M3 16 30 24.6 30 29.6Z" fill="#820229" />
                </svg>
              </span>
              <p className="mt-4 text-xl font-bold text-white">{form.name.trim() || "이름을 입력하세요"}</p>
              <p className="mt-1 text-sm text-[#DD8D92]">
                {[form.title.trim(), form.showroom.trim()].filter(Boolean).join(" · ") || "직함 · 소속 전시장"}
              </p>
              {form.tagline.trim() ? <p className="mt-3 text-sm leading-6 text-[#E8C9CC]">“{form.tagline.trim()}”</p> : null}
            </div>
            <div className="grid grid-cols-2 gap-2 bg-[var(--s-inner)] p-4">
              <span className="rounded-lg bg-[#820229] px-3 py-2.5 text-center text-sm font-semibold text-white">전화 상담</span>
              <span className="rounded-lg border border-[var(--s-border-2)] bg-[var(--s-card)] px-3 py-2.5 text-center text-sm font-medium text-[var(--s-text-2)]">문자 남기기</span>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--s-text-4)]">
            링크는 입력한 정보로 즉시 만들어지며 서버에 별도로 게시되지 않습니다. 링크를 받은 사람만 열 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
