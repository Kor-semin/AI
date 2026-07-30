import type { Metadata } from "next";

import { SensoraSymbol } from "@/app/crm/SensoraSymbol";

/**
 * 영업사원 개인 카탈로그 — 공개 페이지 (BETA).
 *
 * 프리미엄 브랜드 카탈로그의 구성(히어로 → 프로필 → CTA → 라인업 세분화)을 따르되,
 * 상표·저작권 검토 전이므로 제조사 명칭·로고·실차 사진은 쓰지 않고
 * 직접 그린 중립 실루엣과 BETA 표기로 "이런 구조로 나온다"를 보여줍니다.
 * 고객 대상 페이지이므로 워크스페이스 테마와 무관하게 다크 럭셔리 톤으로 고정합니다.
 */

type CardSearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick(params: Record<string, string | string[] | undefined>, key: string, max = 80): string {
  const value = params[key];
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, max);
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function smsHref(phone: string, body: string): string {
  return `sms:${phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(body)}`;
}

export async function generateMetadata({ searchParams }: { searchParams: CardSearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const name = pick(params, "name") || "영업 담당자";
  return {
    title: `${name} · 전 차종 상담 카탈로그`,
    description: `${name} 컨설턴트의 차량 상담 카탈로그입니다.`,
    robots: { index: false }, // 개인 링크 — 검색 노출 제외
  };
}

/** 라인업 세분화 — 중립 실루엣(직접 작성한 SVG), 제조사 무관 */
const LINEUPS: { id: string; label: string; desc: string; variant: CarVariant }[] = [
  { id: "sedan", label: "세단", desc: "출퇴근·비즈니스 중심", variant: "sedan" },
  { id: "suv", label: "SUV", desc: "패밀리·레저 중심", variant: "suv" },
  { id: "ev", label: "전기차", desc: "충전 환경·보조금 상담", variant: "ev" },
  { id: "performance", label: "퍼포먼스", desc: "고성능·스페셜 모델", variant: "performance" },
];

type CarVariant = "sedan" | "suv" | "ev" | "performance";

const CAR_PATHS: Record<CarVariant, string> = {
  sedan:
    "M15 60 L20 48 Q24 42 34 41 L60 39 Q78 26 100 26 L118 27 Q136 29 146 40 L168 43 Q180 45 182 52 L183 60 Z",
  suv: "M15 60 L18 44 Q20 38 30 37 L52 35 Q60 24 80 23 L128 23 Q140 24 146 34 L170 38 Q181 41 182 50 L183 60 Z",
  ev: "M12 60 Q14 46 30 42 Q55 24 95 24 Q140 25 160 42 Q180 47 184 56 L184 60 Z",
  performance:
    "M10 60 L14 50 Q18 45 32 44 L62 42 Q80 32 104 32 L128 33 Q150 36 162 45 L178 48 Q186 51 187 57 L187 60 Z",
};

function CarArt({ variant, hero = false }: { variant: CarVariant; hero?: boolean }) {
  const gid = `sky-${variant}${hero ? "-hero" : ""}`;
  return (
    <svg viewBox="0 0 200 96" className="block w-full" aria-hidden focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hero ? "#3A060F" : "#241014"} />
          <stop offset="1" stopColor="#0B0507" />
        </linearGradient>
      </defs>
      <rect width="200" height="96" fill={`url(#${gid})`} />
      {/* 행성 실루엣 — 연출 배경 */}
      <circle cx="150" cy="30" r="26" fill="#DD8D92" opacity={hero ? 0.14 : 0.08} />
      <line x1="0" y1="60" x2="200" y2="60" stroke="#DD8D92" strokeOpacity="0.25" strokeWidth="0.6" />
      {/* 차체 실루엣 */}
      <path d={CAR_PATHS[variant]} fill="#0A0405" stroke="#DD8D92" strokeOpacity="0.55" strokeWidth="1" />
      <circle cx="45" cy="60" r="8" fill="#0A0405" stroke="#DD8D92" strokeOpacity="0.5" />
      <circle cx="152" cy="60" r="8" fill="#0A0405" stroke="#DD8D92" strokeOpacity="0.5" />
      {/* 반사 */}
      <g transform="translate(0 120) scale(1 -1)" opacity="0.14">
        <path d={CAR_PATHS[variant]} fill="#DD8D92" />
      </g>
    </svg>
  );
}

export default async function SensoraCardPage({ searchParams }: { searchParams: CardSearchParams }) {
  const params = await searchParams;
  const name = pick(params, "name") || "영업 담당자";
  const title = pick(params, "title");
  const showroom = pick(params, "showroom");
  const phone = pick(params, "phone");
  const tagline = pick(params, "tagline");
  const address = pick(params, "address", 120);

  const subtitle = [title, showroom].filter(Boolean).join(" | ");

  return (
    <main className="min-h-screen bg-[#050607] px-4 py-10 text-[#F4F0EE]">
      <article className="mx-auto w-full max-w-2xl">
        {/* ── 히어로 ── */}
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">전 차종 상담 카탈로그</h1>
          <p className="mt-3 text-sm text-[#C9B4B7]">
            세단 · SUV · 전기차 · 퍼포먼스 <span className="mx-1 text-[#6E5F63]">|</span> {LINEUPS.length}개 라인업
          </p>
          <p className="mx-auto mt-3 w-fit rounded-full border border-[#DD8D92]/40 bg-[#2A0405] px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-[#DD8D92]">
            BETA · 차종 상세 목록 준비 중
          </p>
        </header>

        <figure className="relative mt-7 overflow-hidden rounded-2xl border border-[#DD8D92]/15">
          <CarArt variant="ev" hero />
          <figcaption className="absolute left-4 top-3 text-left">
            <span className="block font-serif text-lg text-[#F4F0EE]">The Next Consultation</span>
            <span className="mt-0.5 block text-[0.625rem] tracking-[0.14em] text-[#C9B4B7]">SENSORA BETA PREVIEW</span>
          </figcaption>
          <p className="absolute bottom-2.5 left-4 text-[0.625rem] leading-4 text-[#9d8286]">
            연출된 예시 이미지입니다 · 특정 제조사·실제 차량과 무관합니다
          </p>
        </figure>

        {/* ── 프로필 ── */}
        <section className="mt-9 text-center" aria-label="담당 컨설턴트">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#F5EEE4]">
            <SensoraSymbol className="size-8" />
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em]">{name}</h2>
          {subtitle ? <p className="mt-2 text-sm text-[#C9B4B7]">{subtitle}</p> : null}
          {tagline ? <p className="mt-2 text-sm leading-7 text-[#E8C9CC]">“{tagline}”</p> : null}
          {phone ? <p className="mt-2 text-sm text-[#C9B4B7]">M {phone}</p> : null}
          {address ? <p className="mt-1 text-sm text-[#9d8286]">{address}</p> : null}
        </section>

        {/* ── CTA ── */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <a
            href="#lineup"
            className="rounded-full bg-[#F4F0EE] px-4 py-3.5 text-center text-sm font-bold text-[#0A0405] transition-opacity hover:opacity-90"
          >
            카탈로그 보기
          </a>
          {phone ? (
            <a
              href={telHref(phone)}
              className="rounded-full border border-[#DD8D92] px-4 py-3.5 text-center text-sm font-bold text-[#DD8D92] transition-colors hover:bg-[#2A0405]"
            >
              전화 상담
            </a>
          ) : (
            <span className="rounded-full border border-[#6E5F63] px-4 py-3.5 text-center text-sm font-bold text-[#6E5F63]">연락처 준비 중</span>
          )}
        </div>

        {/* ── 라인업 선택 ── */}
        <section id="lineup" className="mt-12" aria-labelledby="lineup-title">
          <div className="flex items-center gap-2.5">
            <span className="h-6 w-1 rounded-full bg-[#820229]" aria-hidden />
            <h2 id="lineup-title" className="text-xl font-bold tracking-[-0.01em]">라인업 선택</h2>
          </div>
          <p className="mt-2 pl-3.5 text-sm text-[#C9B4B7]">
            {phone ? "카테고리를 탭하면 해당 라인업 상담 문자가 준비됩니다" : "관심 라인업을 상담에서 알려주세요"}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {LINEUPS.map((lineup) => {
              const inner = (
                <>
                  <div className="overflow-hidden">
                    <CarArt variant={lineup.variant} />
                  </div>
                  <div className="border-t border-[#DD8D92]/15 bg-[#0D0709] p-4">
                    <p className="text-lg font-bold text-[#F4F0EE]">{lineup.label}</p>
                    <p className="mt-1 text-[0.8125rem] text-[#C9B4B7]">{lineup.desc}</p>
                    <p className="mt-2.5 text-[0.8125rem] font-semibold text-[#DD8D92]">
                      {phone ? `${lineup.label} 상담 문의 →` : "상담으로 안내 →"}
                    </p>
                  </div>
                </>
              );
              const className =
                "block overflow-hidden rounded-2xl border border-[#DD8D92]/15 transition-colors hover:border-[#DD8D92]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD8D92]/50";
              return phone ? (
                <a key={lineup.id} href={smsHref(phone, `${name} 컨설턴트님, ${lineup.label} 라인업 상담 문의드립니다.`)} className={className}>
                  {inner}
                </a>
              ) : (
                <div key={lineup.id} className={className}>{inner}</div>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-5 text-[#9d8286]">
            BETA 기간에는 차종별 상세 페이지 대신 담당 컨설턴트가 직접 조건을 비교해 안내드립니다.
            제조사 공식 이미지·가격표는 제휴 검토 후 제공됩니다.
          </p>
        </section>

        {/* ── 상담 원칙 ── */}
        <section className="mt-10" aria-labelledby="card-principles-title">
          <div className="flex items-center gap-2.5">
            <span className="h-6 w-1 rounded-full bg-[#820229]" aria-hidden />
            <h2 id="card-principles-title" className="text-xl font-bold tracking-[-0.01em]">상담에서 지키는 것</h2>
          </div>
          <ul className="mt-4 grid gap-2.5 pl-3.5 text-[0.8125rem] leading-6 text-[#C9B4B7]">
            <li className="flex gap-2.5"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#C5626D]" />문의 내용을 확인한 뒤 직접 연락드립니다. 자동 발송은 하지 않습니다.</li>
            <li className="flex gap-2.5"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#C5626D]" />상담 내용은 다음 상담 준비 목적으로만 기록합니다.</li>
            <li className="flex gap-2.5"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#C5626D]" />급하게 결정하시도록 재촉하지 않습니다.</li>
          </ul>
        </section>

        <footer className="mt-12 border-t border-[#DD8D92]/15 pt-5 text-center">
          <p className="text-xs text-[#9d8286]">
            이 페이지는 <span className="font-semibold text-[#DD8D92]">Sensora Auto CRM</span>으로 만들었습니다 · BETA
          </p>
        </footer>
      </article>
    </main>
  );
}
