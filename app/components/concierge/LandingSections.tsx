"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { ImageSlot } from "./ImageSlot";
import { SAMPLE_CUSTOMERS } from "./sampleCustomers";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraGuide } from "@/app/components/concierge/SensoraGuide";
import { generateDemoConsultingResponse } from "@/app/components/concierge/aiDemoResponse";

/** 랜딩 교체용 이미지 경로 (`public/images`에 동일 파일명으로 두면 적용됩니다). */
export const LANDING_IMAGES = {
  hero: "/images/hero-classic-car.jpg",
  interior: "/images/vintage-car-interior.jpg",
  desk: "/images/concierge-desk.jpg",
  workspace: "/images/sales-dashboard-workspace.jpg",
} as const;

function SectionShell({
  id,
  kicker,
  title,
  subtitle,
  children,
}: {
  id?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-[1280px] px-4 py-14 sm:py-18">
      <div className="mb-8">
        {kicker ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold-2)]">
            {kicker}
          </div>
        ) : null}
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-[color:var(--ink-2)] sm:text-[15px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function HeroDashboardPreviewCard() {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] shadow-[0_20px_52px_rgba(17,19,24,0.12),0_2px_12px_rgba(17,19,24,0.05)]">
      <div className="relative border-b border-[color:var(--edge)] bg-[color:var(--paper-2)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
              대시보드 미리보기
            </div>
            <div className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">오늘의 영업 현황</div>
          </div>
          <span className="crm-free-badge shrink-0">Beta</span>
        </div>
      </div>

      <div className="relative space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { title: "오늘 연락할 고객", value: "5", hint: "우선 순위대로 정렬" },
            { title: "계약 가능성 높은 고객", value: "3", hint: "견적 검토 단계 포함" },
            { title: "후속 연락 필요", value: "7", hint: "48시간 내 액션" },
          ].map((m) => (
            <div
              key={m.title}
              className="rounded-xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/60 px-3 py-3"
            >
              <div className="text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-[color:var(--gold-2)]">
                {m.title}
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[color:var(--foreground)]">
                {m.value}
              </div>
              <div className="mt-1 text-[10px] text-[color:var(--ink-2)]">{m.hint}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/40 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-2)]">
            {t("crm.aiRecommendation")}
          </div>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-[color:var(--foreground)]">
            「지난 상담에서 승차감과 가족 이동이 핵심이었습니다. 오늘은 프리미엄 세단의 유지·보증을 짧게
            정리한 뒤, 금융 조건을 제안하면 응답률이 좋습니다.」
          </p>
        </div>

        <div className="rounded-xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/30 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-2)]">
            최근 상담 요약
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--ink-2)]">
            김민준 · 관심: 프리미엄 세단 · 예산 2,800~3,200만 원대 · 상태: 견적 검토 · 다음: 오후 금융 안내 발송
          </p>
        </div>

        <p className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--ink-2)]">
          샘플 UI · 실제 데이터와 다를 수 있습니다
        </p>
      </div>
    </div>
  );
}

export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-4 pb-16 pt-12 sm:pb-20 sm:pt-16">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:rgba(244,246,248,0.08)] bg-[color:var(--landing-hero-bg)] px-5 py-11 sm:rounded-[2rem] sm:px-8 sm:py-14 lg:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_72%_at_50%_-30%,rgba(168,176,186,0.14),transparent_55%),radial-gradient(900px_520px_at_100%_100%,rgba(55,61,71,0.45),transparent_58%),linear-gradient(180deg,#111318_0%,#161a20_50%,#12151a_100%)]"
        />

        {/* 배경 장식: 보조 이미지 — 차쿨 톤 마스크 */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[16%] top-[6%] hidden aspect-[5/4] h-[300px] w-[420px] overflow-hidden rounded-[1.75rem] opacity-[0.1] saturate-[0.75] lg:block xl:h-[340px]"
          style={{
            maskImage: "radial-gradient(ellipse 82% 78% at 68% 48%,black 55%,transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 82% 78% at 68% 48%,black 55%,transparent 100%)",
          }}
        >
          <div className="relative h-full scale-[1.06] blur-2xl [&_img]:!rounded-[2rem] [&_img]:!border-transparent [&_img]:!shadow-none">
            <ImageSlot
              src={LANDING_IMAGES.hero}
              alt=""
              tone="hero"
              className="!h-full !min-h-[320px]"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#111318]/80 via-transparent to-[#111318]/65" />
        </div>

        <div className="relative z-[1] grid gap-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(340px,420px)] lg:items-start xl:gap-14">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[color:var(--landing-hero-muted)] backdrop-blur-sm">
              {t("brand.name")} · Sense + Aura
            </div>

            <h1 className="mt-6 text-[1.65rem] font-semibold tracking-tight text-[color:var(--landing-hero-text)] sm:text-[2.6rem] sm:leading-[1.12] lg:text-[2.75rem]">
              {t("product.name")}
            </h1>

            <p className="mt-3 max-w-[40rem] text-sm font-medium leading-relaxed text-[#c5cad2] sm:text-[15px]">
              {t("brand.slogan")}
            </p>

            <p className="mt-5 max-w-[40rem] text-sm leading-relaxed text-[color:var(--landing-hero-muted)] sm:text-[15px]">
              {t("hero.description")} (Sales Concierge AI)
            </p>

            <div
              aria-hidden
              className="mt-7 h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/join" className="crm-ink-btn rounded-xl px-5 py-3 text-xs font-semibold">
                {t("cta.joinBeta")}
              </Link>
              <button
                type="button"
                className="crm-outline-light-btn rounded-xl px-5 py-3 text-xs font-semibold"
                onClick={() => {
                  const el = document.getElementById("ai-demo");
                  if (!el) return;
                  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
                  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                  window.setTimeout(() => {
                    const ta = document.getElementById("ai-demo-memo") as HTMLTextAreaElement | null;
                    ta?.focus();
                  }, reduce ? 0 : 120);
                }}
              >
                {t("cta.tryAIDemo")}
              </button>
            </div>

            <ul className="mt-8 space-y-2 text-[12px] leading-relaxed text-[#8b94a1] sm:text-[13px]">
              <li>상담·견적·후속까지 오늘 해야 할 우선 순위가 한 화면에 모입니다.</li>
              <li>요약과 제안은 상담 맥락을 따라가며 근거를 남깁니다.</li>
              <li>브랜드 로고 노출 없이 데모로 흐름을 먼저 확인할 수 있습니다.</li>
            </ul>
          </div>

          <div className="lg:sticky lg:top-[5.75rem]">
            <HeroDashboardPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AIDemoSection() {
  const { t } = useLanguage();
  const exampleText = t("landing.aiDemo.inputExample");
  const MANUAL_SENTINEL = "";
  const [memo, setMemo] = useState(exampleText);
  const [sampleId, setSampleId] = useState<string>(() => MANUAL_SENTINEL);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debouncedMemo, setDebouncedMemo] = useState(exampleText);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastExampleRef = useRef(exampleText);
  const skipTypingDebounceRef = useRef(false);

  function applySampleMemo(nextMemo: string) {
    setMemo(nextMemo);
    setDebouncedMemo(nextMemo);
    skipTypingDebounceRef.current = true;
    setIsAnalyzing(true);
    window.setTimeout(() => setIsAnalyzing(false), 420);
  }

  function syncSampleIdFromMemo(nextMemo: string) {
    const hit = SAMPLE_CUSTOMERS.find((c) => c.memo === nextMemo)?.id ?? MANUAL_SENTINEL;
    setSampleId(hit);
  }

  useEffect(() => {
    // If the user hasn't edited (still on the prior example), swap to the new locale example.
    const prevExample = lastExampleRef.current;

    let nextMemo = "";
    let nextDebouncedMemo = "";

    setMemo((prev) => {
      nextMemo = prev === prevExample ? exampleText : prev;
      return nextMemo;
    });
    setDebouncedMemo((prev) => {
      nextDebouncedMemo = prev === prevExample ? exampleText : prev;
      return nextDebouncedMemo;
    });

    // After React applies both updates above, remap sample selection vs manual entry.
    const resolvedMemo = nextMemo || nextDebouncedMemo;
    syncSampleIdFromMemo(resolvedMemo);

    lastExampleRef.current = exampleText;
  }, [exampleText]);

  useEffect(() => {
    if (skipTypingDebounceRef.current) {
      skipTypingDebounceRef.current = false;
      return;
    }
    setIsAnalyzing(true);
    let t2: number | undefined;
    const t1 = window.setTimeout(() => {
      setDebouncedMemo(memo);
      // Keep the "analyzing" state briefly visible, but don't stall UX.
      t2 = window.setTimeout(() => setIsAnalyzing(false), 420);
    }, 380);
    return () => {
      window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
    };
  }, [memo]);

  const response = useMemo(() => generateDemoConsultingResponse(debouncedMemo), [debouncedMemo]);

  return (
    <section id="ai-demo" className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-4 py-14 sm:py-18">
      <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-7 shadow-[0_12px_36px_rgba(17,19,24,0.08)]">
          <div className="text-[12px] font-semibold tracking-[-0.01em] text-[#475569]">{t("landing.aiDemo.sectionTitle")}</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
            {t("landing.aiDemo.sectionTitle")}
          </h2>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[color:var(--ink-2)]">
            {t("landing.aiDemo.sectionDesc")}
          </p>

          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
            <div className="text-[12px] font-semibold text-[#374151]">{t("landing.aiDemo.inputLabel")}</div>
            <div className="mt-1 text-[12px] font-medium leading-relaxed text-[#6B7280]">
              {t("landing.aiDemo.inputHint")}
            </div>
            <label className="mt-4 grid gap-1 md:grid-cols-[220px_minmax(0,1fr)] md:items-end md:gap-3">
              <div className="grid gap-1">
                <div className="text-[13px] font-semibold text-[#374151]">{t("landing.aiDemo.sampleCustomerLabel")}</div>
                <select
                  value={sampleId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    if (!nextId) {
                      setSampleId("");
                      applySampleMemo(exampleText);
                      return;
                    }
                    const cust = SAMPLE_CUSTOMERS.find((c) => c.id === nextId);
                    if (!cust) return;
                    setSampleId(nextId);
                    applySampleMemo(cust.memo);
                  }}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-[14px] font-medium text-[#111827] outline-none focus:border-[#94A3B8]"
                >
                  <option value="">{t("landing.aiDemo.sampleCustomerPlaceholder")}</option>
                  {SAMPLE_CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.interestedVehicle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[12px] font-medium leading-relaxed text-[#6B7280] md:pb-3">
                {t("landing.aiDemo.sampleDataNotice")}
              </div>
            </label>
            <textarea
              ref={textareaRef}
              id="ai-demo-memo"
              value={memo}
              onChange={(e) => {
                const v = e.target.value;
                setMemo(v);
                syncSampleIdFromMemo(v);
              }}
              placeholder={t("landing.aiDemo.inputExample")}
              rows={7}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="mt-3 w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#111827] outline-none focus:border-[#94A3B8]"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[12px] font-medium text-[#6B7280]">{t("landing.aiDemo.liveNotice")}</div>
              <button
                type="button"
                className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-[12px] font-semibold text-[#111827] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#E5E7EB]"
                onClick={() => {
                  setSampleId("");
                  applySampleMemo(exampleText);
                  textareaRef.current?.focus();
                  textareaRef.current?.setSelectionRange(0, exampleText.length);
                }}
              >
                {t("landing.aiDemo.resetExample")}
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/?view=app" className="crm-ink-btn rounded-xl px-5 py-3 text-xs font-semibold">
              {t("landing.aiDemo.applyCta")}
            </Link>
            <Link href="/join" className="crm-ghost-btn rounded-xl px-5 py-3 text-xs font-semibold">
              {t("cta.joinBeta")}
            </Link>
          </div>
        </div>

        <SensoraGuide status={isAnalyzing ? t("landing.aiDemo.status") : t("landing.aiDemo.readyStatus")}>
          {memo.trim().length === 0 ? (
            <div className="mb-4 rounded-2xl border border-white/60 bg-white/45 px-4 py-3 text-[13px] font-medium leading-relaxed text-[#334155] shadow-[0_12px_36px_rgba(15,23,42,0.12)] backdrop-blur-lg">
              {t("landing.aiDemo.emptyNotice")}
            </div>
          ) : null}

          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-lg motion-reduce:transform-none motion-reduce:animate-none [animation:sensora-float_5.5s_ease-in-out_infinite]">
              <div className="text-[12px] font-semibold text-[#334155]">{t("landing.aiDemo.summaryTitle")}</div>
              <div className="mt-3 text-[15px] leading-relaxed text-[#111827]">{response.summary}</div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-lg motion-reduce:transform-none motion-reduce:animate-none [animation:sensora-float_5.5s_ease-in-out_infinite] [animation-delay:-1.2s]">
              <div className="text-[12px] font-semibold text-[#334155]">{t("landing.aiDemo.nextActionTitle")}</div>
              <div className="mt-3 text-[15px] leading-relaxed text-[#111827]">{response.nextAction}</div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-lg motion-reduce:transform-none motion-reduce:animate-none [animation:sensora-float_5.5s_ease-in-out_infinite] [animation-delay:-2.1s]">
              <div className="text-[12px] font-semibold text-[#334155]">{t("landing.aiDemo.recommendedMessageTitle")}</div>
              <div className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[#111827]">
                {response.message}
              </div>
            </div>
          </div>

          <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-24 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_60%)] blur-2xl" />
        </SensoraGuide>
      </div>
    </section>
  );
}

export function CRMDemoSection() {
  const { t } = useLanguage();
  return (
    <SectionShell
      id="crm-demo"
      kicker="CRM Demo"
      title={t("landing.crmDemo.sectionTitle")}
      subtitle={t("landing.crmDemo.sectionDesc")}
    >
      <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="space-y-6">
          <HeroDashboardPreviewCard />
          <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 shadow-[0_12px_36px_rgba(17,19,24,0.06)]">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Customers (Sample)</div>
            <div className="mt-1 text-[12px] text-[color:var(--ink-2)]">
              고객명 / {t("common.interestedVehicle")} / {t("common.status")} / {t("crm.section.nextAction")}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--edge)]">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[color:var(--paper-2)]/75 text-[12px] font-semibold text-[color:var(--gold-ink)]">
                  <tr>
                    <th className="px-4 py-3">고객</th>
                    <th className="px-4 py-3">{t("common.interestedVehicle")}</th>
                    <th className="px-4 py-3">{t("common.status")}</th>
                    <th className="px-4 py-3">{t("crm.section.nextAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--edge)] bg-[color:var(--paper)]/30">
                  {SAMPLE_CUSTOMERS.slice(0, 4).map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-semibold text-[color:var(--foreground)]">{c.name}</td>
                      <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.interestedVehicle}</td>
                      <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.status}</td>
                      <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[color:var(--edge)] bg-[color:var(--paper)] p-6 shadow-[0_16px_44px_rgba(17,19,24,0.08)]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Pipeline (Sample)</div>
            <span className="crm-free-badge">Preview</span>
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--ink-2)]">
            신규 리드부터 출고까지 단계별 흐름을 한 화면에서 정리합니다.
          </p>
          <div className="mt-5 overflow-x-auto">
            <div className="grid min-w-[820px] grid-cols-6 gap-3">
              {["신규", "상담", "견적", "검토", "출고", "재구매"].map((s) => (
                <div key={s} className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/55 p-3">
                  <div className="text-[12px] font-semibold text-[color:var(--gold-ink)]">{s}</div>
                  <div className="mt-2 rounded-xl border border-[color:var(--edge)] bg-white px-3 py-2 text-[12px] font-semibold text-[color:var(--foreground)]">
                    샘플 카드
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/?view=app" className="crm-ink-btn rounded-xl px-5 py-3 text-xs font-semibold">
              {t("landing.crmDemo.startCta")}
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function FeatureSection() {
  const { t } = useLanguage();
  const items = [
    {
      title: t("landing.feature.profile.title"),
      desc: t("landing.feature.profile.desc"),
    },
    {
      title: t("landing.feature.followup.title"),
      desc: t("landing.feature.followup.desc"),
    },
    {
      title: t("landing.feature.memory.title"),
      desc: t("landing.feature.memory.desc"),
    },
    {
      title: t("landing.feature.delivery.title"),
      desc: t("landing.feature.delivery.desc"),
    },
  ];

  return (
    <SectionShell
      kicker="Features"
      title="고급 영업 루틴을 위한, 조용한 생산성"
      subtitle="고급스러운 SaaS 레이아웃으로 상담 기록과 후속 타이밍을 안정적으로 잡도록 설계했습니다."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 shadow-[0_12px_36px_rgba(17,19,24,0.07)] backdrop-blur-sm"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-2)]">
              Sensora
            </div>
            <div className="mt-3 text-base font-semibold tracking-tight text-[color:var(--foreground)]">
              {it.title}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--ink-2)]">{it.desc}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function DashboardPreview() {
  return (
    <SectionShell
      id="dashboard-preview"
      kicker="Dashboard"
      title="오늘의 흐름을 한 화면에"
      subtitle="상담 예정, 후속 연락, 계약 가능성, 출고 준비. ‘지금 해야 할 일’을 우선순위로 정리합니다."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 shadow-[0_12px_36px_rgba(17,19,24,0.06)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">영업 현황 보드</div>
            <span className="crm-free-badge">Preview</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { k: "오늘 상담 예정", v: "3" },
              { k: "후속 연락 필요", v: "5" },
              { k: "계약 가능성 높음", v: "2" },
              { k: "출고 예정", v: "1" },
            ].map((m) => (
              <div
                key={m.k}
                className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/75 px-4 py-3"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
                  {m.k}
                </div>
                <div className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">{m.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl">
            <ImageSlot
              src={LANDING_IMAGES.interior}
              alt=""
              tone="interior"
              className="h-[220px]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-5 shadow-[0_12px_36px_rgba(17,19,24,0.06)] backdrop-blur-sm">
          <div className="text-sm font-semibold text-[color:var(--foreground)]">Customers (Sample)</div>
          <div className="mt-1 text-[12px] text-[color:var(--ink-2)]">고객명 / 관심 차량 / 상태 / 다음 액션</div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--edge)]">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[color:var(--paper-2)]/75 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-2)]">
                <tr>
                  <th className="px-4 py-3">고객</th>
                  <th className="px-4 py-3">관심 차량</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">다음 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--edge)] bg-[color:var(--paper)]/30">
                {SAMPLE_CUSTOMERS.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold text-[color:var(--foreground)]">
                      {c.name}
                      <span
                        className={[
                          "ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em]",
                          "border-[color:var(--edge)] text-[color:var(--ink-2)]",
                        ].join(" ")}
                      >
                        {c.brand}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.interestedVehicle}</td>
                    <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.status}</td>
                    <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--ink-2)]">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-[#8a929e]" />
              오늘 할 일 우선순위
            </span>
            <span className="opacity-65">·</span>
            <span>샘플 데이터는 랜딩 프리뷰용입니다.</span>
          </div>

          <div className="mt-6 rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/40 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
              Customer workspace
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl">
              <ImageSlot
                src={LANDING_IMAGES.workspace}
                alt=""
                tone="profile"
                className="h-[180px] sm:h-[220px]"
              />
            </div>
            <div className="mt-3 text-[12px] text-[color:var(--ink-2)]">
              `LandingSections.tsx`의 <code className="rounded bg-black/35 px-1 py-px">LANDING_IMAGES.workspace</code> 경로에
              맞춰 `public/images`를 교체하세요. 로고가 보이는 사진은 사용하지 마세요.
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function AISecretaryPreview() {
  return (
    <SectionShell
      id="ai-secretary"
      kicker="AI Secretary"
      title="요약과 다음 연락 문구를 한 번에"
      subtitle="상담 내용을 정리하고, 품격 있는 후속 연락 문구를 제안합니다. 실제 브랜드명은 사용하지 않습니다."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/70 p-6 backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-2)]">
            Suggested follow-up
          </div>
          <div className="mt-4 text-sm font-semibold leading-relaxed text-[color:var(--foreground)]">
            “김민준 고객은 지난 상담에서 조용한 승차감과 가족 이동을 중요하게 언급했습니다. 오늘은{" "}
            <span className="font-semibold text-[color:var(--foreground)]">프리미엄 세단</span>의 장기 보유 가치와 금융 조건을 중심으로
            연락하는 것이 좋습니다.”
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
                Next action
              </div>
              <div className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                오늘 오후 금융 조건 안내
              </div>
              <div className="mt-2 text-[12px] leading-relaxed text-[color:var(--ink-2)]">
                고객의 우선순위(승차감/가족 이동)를 먼저 확인하고, 조건 제안을 간결하게.
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
                Message draft
              </div>
              <div className="mt-2 text-[12px] leading-relaxed text-[color:var(--ink-2)]">
                “민준 님, 지난번 말씀하신 승차감과 가족 이동 편의 기준으로 프리미엄 세단 옵션을 정리해
                드렸습니다. 오늘 오후 잠깐 통화 가능하실까요?”
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/?view=app#app" className="crm-ghost-btn rounded-xl px-4 py-2.5 text-xs font-semibold">
              CRM에서 바로 적용
            </Link>
            <a href="#pipeline" className="crm-ghost-btn rounded-xl px-4 py-2.5 text-xs font-semibold">
              파이프라인 보기
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-4 shadow-[0_10px_32px_rgba(17,19,24,0.06)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[color:var(--foreground)]">Secretary desk</div>
              <div className="mt-1 text-[12px] text-[color:var(--ink-2)]">이미지는 교체 가능한 슬롯입니다.</div>
            </div>
            <span className="crm-free-badge">Desk</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl">
            <ImageSlot src={LANDING_IMAGES.desk} alt="" tone="desk" className="h-[320px]" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function PipelinePreview() {
  const stages = ["신규 리드", "상담 중", "견적 전달", "계약 검토", "출고 완료", "재구매/소개 가능성"];
  const cards: Record<string, string[]> = {
    "신규 리드": ["박지훈 · 비즈니스 세단"],
    "상담 중": ["이서연 · 럭셔리 SUV"],
    "견적 전달": ["김민준 · 프리미엄 세단"],
    "계약 검토": ["최유진 · VIP 플래그십"],
    "출고 완료": [],
    "재구매/소개 가능성": [],
  };

  return (
    <SectionShell
      id="pipeline"
      kicker="Pipeline"
      title="영업 파이프라인을 ‘눈으로’ 관리"
      subtitle="한눈에 보이는 단계별 흐름. 신규 리드부터 재구매/소개 가능성까지 이어집니다."
    >
      <div className="overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-6 gap-4">
          {stages.map((s) => (
            <div
              key={s}
              className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] p-4 shadow-[0_6px_22px_rgba(17,19,24,0.05)]"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
                {s}
              </div>
              <div className="mt-3 grid gap-3">
                {(cards[s] ?? []).length ? (
                  cards[s].map((c) => (
                    <div
                      key={c}
                      className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)]/75 px-4 py-3 text-[12px] font-semibold text-[color:var(--foreground)]"
                    >
                      {c}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[color:var(--edge)] bg-[color:var(--paper-2)]/35 px-4 py-3 text-[11px] text-[color:var(--ink-2)]">
                    비어 있음
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function FinalBrandingSection() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-6">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-[color:rgba(244,246,248,0.1)] bg-[radial-gradient(1000px_640px_at_16%_12%,rgba(168,176,186,0.16),transparent_64%),radial-gradient(920px_560px_at_102%_28%,rgba(55,61,71,0.35),transparent_58%),linear-gradient(160deg,#111318_0%,#171b22_48%,#14171d_100%)] p-8 shadow-[0_24px_56px_rgba(17,19,24,0.18)] sm:p-12">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a8b0ba]">
          Sensora
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--landing-hero-text)] sm:text-3xl">
          좋은 영업은 기억에서 시작됩니다. 그러나 훌륭한 영업은 기록과 타이밍에서 완성됩니다.
        </h3>
        <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-[#c5cad2] sm:text-[15px]">
          Sensora는 뛰어난 감각과 AI 기술로, 작은 시작을 더 큰 가능성으로 확장하는 B2B AI SaaS 기업입니다. 첫 제품{" "}
          <span className="font-semibold text-[#dfe3ea]">Sensora Auto CRM</span>에 Sales Concierge AI 개념의 영업 지원
          경험을 담았습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/?view=app" className="crm-ink-btn rounded-xl px-5 py-3 text-xs font-semibold">
            고객관리 시작하기
          </Link>
          <Link href="/?view=app" className="crm-outline-light-btn rounded-xl px-5 py-3 text-xs font-semibold">
            AI 비서 체험하기
          </Link>
        </div>
      </div>
    </section>
  );
}

