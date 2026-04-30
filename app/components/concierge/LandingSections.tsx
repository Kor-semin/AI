"use client";

import Link from "next/link";

import { ImageSlot } from "./ImageSlot";
import { SAMPLE_CUSTOMERS } from "./sampleCustomers";

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

export function HeroSection({ onEnter }: { onEnter: () => void }) {
  const filmstrip = [
    {
      src: "/images/interior.png",
      label: "Vintage cabin",
      href: "#dashboard-preview",
    },
    {
      src: "/images/desk.png",
      label: "Secretary desk",
      href: "#ai-secretary",
    },
    {
      src: "/images/profile-workspace.png",
      label: "Workspace",
      href: "#dashboard-preview",
    },
  ] as const;

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-12 sm:pb-20 sm:pt-16">
      <div className="relative min-h-[min(88vh,720px)] overflow-hidden rounded-[2rem] border border-[color:var(--edge)] shadow-[0_34px_90px_rgba(0,0,0,0.68)]">
        <div className="pointer-events-none absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-classic-car.png"
            alt=""
            className="h-full w-full object-cover object-[58%_44%] sm:object-[64%_40%]"
          />
        </div>
        {/* 읽기 쉬운 왼쪽·하단 어둠 + 가벼운 골드 광택 */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0b0b0a]/97 via-[#0b0b0a]/78 to-[#0b0b0a]/12 sm:via-[#0b0b0a]/55 sm:to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0a]/92 via-transparent to-[#0b0b0a]/45" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/55 to-transparent sm:inset-x-14" />

        <div className="relative z-10 flex min-h-[min(88vh,720px)] flex-col justify-between gap-12 px-6 py-10 sm:px-11 sm:py-14 lg:flex-row lg:items-end">
          <div className="flex max-w-xl flex-col justify-center lg:justify-center lg:self-center lg:pb-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--edge)] bg-black/38 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[color:var(--gold)] backdrop-blur-md">
              SALES CONCIERGE AI · 오토 세일즈 AI 비서
            </div>
            <h1 className="mt-5 max-w-[16ch] text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl lg:max-w-none">
              고객을 기억하는 자동차 영업 AI 비서
            </h1>
            <p className="mt-5 max-w-[62ch] text-sm leading-relaxed text-[color:var(--foreground)]/82 sm:text-[15px]">
              고급 자동차 영업사원을 위한 프리미엄 고객관리 시스템. 상담 이력, 관심 차량, 구매 가능성,
              후속 연락까지 AI가 정리하고 제안합니다.
            </p>

            <div
              aria-hidden
              className="mt-7 h-px w-full max-w-sm bg-gradient-to-r from-transparent via-[color:var(--gold)]/55 to-transparent"
            />

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="crm-ink-btn rounded-xl px-5 py-3 text-xs font-semibold"
                onClick={onEnter}
              >
                고객관리 시작하기
              </button>
              <a href="#ai-secretary" className="crm-ghost-btn rounded-xl px-5 py-3 text-xs font-semibold">
                AI 비서 체험하기
              </a>
            </div>

            <div className="mt-10 rounded-2xl border border-[color:var(--edge)] bg-black/42 p-5 backdrop-blur-md">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-2)]">
                Concierge note
              </div>
              <div className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">
                고객을 기억하고, 다음 행동을 제안하고, 영업의 흐름을 관리합니다.
              </div>
              <div className="mt-2 text-[12px] leading-relaxed text-[color:var(--foreground)]/70">
                클래식카·프라이빗 라운지 톤. 과한 연출 없이 깊은 기록과 타이밍을 우선합니다.
              </div>
            </div>
          </div>

          <div className="grid w-full max-w-xl shrink-0 grid-cols-3 gap-3 self-end sm:gap-4 lg:max-w-md">
            {[
              { k: "오늘 상담", v: "3" },
              { k: "후속 연락", v: "5" },
              { k: "우선순위", v: "High" },
            ].map((m) => (
              <div
                key={m.k}
                className="rounded-2xl border border-[color:var(--edge)] bg-black/52 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(199,164,106,0.08)] backdrop-blur-md"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-2)] sm:text-[11px]">
                  {m.k}
                </div>
                <div className="mt-2 text-lg font-semibold tabular-nums text-[color:var(--foreground)]">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 나머지 씬(인테리어·데스크·워크스페이스) 프리뷰 필름스트립 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {filmstrip.map((f) => (
          <a
            key={f.src}
            href={f.href}
            className="group overflow-hidden rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/40 shadow-[0_18px_46px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:border-[color:var(--gold)]/55 hover:[transform:translateY(-3px)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.src}
                alt=""
                className="h-full w-full object-cover transition duration-[220ms] group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0b0a]/88 to-transparent p-4 pt-14">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)]">
                  {f.label}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function FeatureSection() {
  const items = [
    {
      title: "고객 프로필 자동 정리",
      desc: "상담 메모·관심 포인트·예산·성향을 카드로 정리해 다음 대화를 빠르게 이어갑니다.",
    },
    {
      title: "후속 연락 제안",
      desc: "상담 흐름과 단계에 맞춰, 오늘 해야 할 연락과 톤을 제안합니다.",
    },
    {
      title: "차량 추천 메모리",
      desc: "고객이 중요하게 보는 기준을 기억해, 비교 포인트를 상담 기록에 남깁니다.",
    },
    {
      title: "출고 후 관리",
      desc: "인도/등록/사후관리까지 체크리스트로 정리해 ‘다음 행동’을 놓치지 않습니다.",
    },
  ];

  return (
    <SectionShell
      kicker="Features"
      title="고급 영업 루틴을 위한, 조용한 생산성"
      subtitle="클래식카·프라이빗 라운지 톤의 프리미엄 세일즈 컨시어지. 과시보다 깊은 기록과 타이밍을 우선합니다."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/70 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.45)] backdrop-blur"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-2)]">
              Concierge
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
        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/70 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[color:var(--foreground)]">Concierge Board</div>
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
            <ImageSlot src="/images/interior.png" alt="" tone="interior" className="h-[220px]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/70 p-5 backdrop-blur">
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
                  <tr key={c.name}>
                    <td className="px-4 py-3 font-semibold text-[color:var(--foreground)]">
                      {c.name}
                      <span
                        className={[
                          "ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em]",
                          c.priority === "High"
                            ? "border-[rgba(199,164,106,0.55)] text-[color:var(--gold)]"
                            : "border-[color:var(--edge)] text-[color:var(--ink-2)]",
                        ].join(" ")}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.vehicle}</td>
                    <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.status}</td>
                    <td className="px-4 py-3 text-[color:var(--ink-2)]">{c.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--ink-2)]">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-[color:var(--gold)]" />
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
                src="/images/profile-workspace.png"
                alt=""
                tone="profile"
                className="h-[180px] sm:h-[220px]"
              />
            </div>
            <div className="mt-3 text-[12px] text-[color:var(--ink-2)]">
              `/public/images/profile-workspace.png`로 교체할 수 있습니다. 로고가 보이는 사진은 사용하지 마세요.
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
            <span className="text-[color:var(--gold)]">프리미엄 세단</span>의 장기 보유 가치와 금융 조건을 중심으로
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

        <div className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/70 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[color:var(--foreground)]">Secretary desk</div>
              <div className="mt-1 text-[12px] text-[color:var(--ink-2)]">이미지는 교체 가능한 슬롯입니다.</div>
            </div>
            <span className="crm-free-badge">Desk</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl">
            <ImageSlot src="/images/desk.png" alt="" tone="desk" className="h-[320px]" />
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
            <div key={s} className="rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)]/60 p-4">
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
      <div className="relative overflow-hidden rounded-[2.25rem] border border-[color:var(--edge)] bg-[radial-gradient(1100px_680px_at_18%_10%,rgba(199,164,106,0.18),transparent_64%),radial-gradient(980px_720px_at_108%_18%,rgba(232,220,200,0.06),transparent_62%),linear-gradient(160deg,#0b0b0a_0%,#15120f_46%,#0f0e0c_100%)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.62)] sm:p-12">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold-2)]">
          Sales Concierge AI
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-3xl">
          좋은 영업은 기억에서 시작됩니다. 그러나 훌륭한 영업은 기록과 타이밍에서 완성됩니다.
        </h3>
        <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-[color:var(--ink-2)] sm:text-[15px]">
          Sales Concierge AI는 자동차 영업사원이 고객을 더 깊이 이해하고, 더 정확한 타이밍에, 더 품격 있게
          응대할 수 있도록 설계된 고객관리 앱입니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/?view=app#app" className="crm-ink-btn rounded-xl px-5 py-3 text-xs font-semibold">
            고객관리 시작하기
          </Link>
          <a href="#ai-secretary" className="crm-ghost-btn rounded-xl px-5 py-3 text-xs font-semibold">
            AI 비서 체험하기
          </a>
        </div>
      </div>
    </section>
  );
}

