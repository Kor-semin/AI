"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import type { CrmSection } from "@/app/crm/crmSectionTypes";
import { SENSORA_GUIDES } from "@/lib/sensoraGuide";

/** 랜딩 보조 이미지 에셋 경로(@/public 기준). README 등에서 참고합니다. */
export const LANDING_SHOWROOM_IMAGE_PATHS = {
  hero: "/images/hero-classic-car.jpg",
  interior: "/images/vintage-car-interior.jpg",
  desk: "/images/concierge-desk.jpg",
  workspace: "/images/sales-dashboard-workspace.jpg",
} as const;

export {
  SENSORA_GUIDE_IMAGES,
  SENSORA_TIP_CARD_INITIAL_INDEX,
  sensoraGuideImageSources,
} from "@/app/components/concierge/sensoraGuideImages";

const JOIN_PATH = "/join" as const;
const SLIDE_COUNT = 4;

function thumbGuideImage(guideId: "sensora-guide-01" | "sensora-guide-02" | "sensora-guide-04") {
  return SENSORA_GUIDES.find((g) => g.id === guideId)?.image ?? "/images/guides/sensora-guide-01.png";
}

const entPrimaryBtn =
  "landing-enterprise-btn-primary inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-2.5 text-[0.8625rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9375rem] lg:min-h-[3.125rem] lg:text-[1rem]";

const entGhostBtn =
  "landing-enterprise-btn-secondary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[0.8375rem] font-semibold tracking-tight touch-manipulation sm:min-h-[3rem] sm:py-3 sm:text-[0.9625rem] lg:min-h-[3.125rem]";

type LandingMenuWorkspaceRow = {
  key: string;
  target: "workspace";
  section: CrmSection;
  thumbGuideId: "sensora-guide-01" | "sensora-guide-02" | "sensora-guide-04";
  titleKey: "landing.showroom.serviceMenu.customersTitle" | "landing.showroom.serviceMenu.aiTitle" | "landing.showroom.serviceMenu.aftercareTitle";
  descKey:
    | "landing.showroom.serviceMenu.customersDesc"
    | "landing.showroom.serviceMenu.aiDesc"
    | "landing.showroom.serviceMenu.aftercareDesc";
};

type LandingMenuDeliveryRow = {
  key: string;
  target: "delivery";
  titleKey: "landing.showroom.serviceMenu.deliveryTitle";
  descKey: "landing.showroom.serviceMenu.deliveryDesc";
};

type LandingMenuRow = LandingMenuWorkspaceRow | LandingMenuDeliveryRow;

const MENU_ITEMS: LandingMenuRow[] = [
  {
    key: "customers",
    target: "workspace",
    section: "customers",
    thumbGuideId: "sensora-guide-01",
    titleKey: "landing.showroom.serviceMenu.customersTitle",
    descKey: "landing.showroom.serviceMenu.customersDesc",
  },
  {
    key: "ai",
    target: "workspace",
    section: "ai",
    thumbGuideId: "sensora-guide-02",
    titleKey: "landing.showroom.serviceMenu.aiTitle",
    descKey: "landing.showroom.serviceMenu.aiDesc",
  },
  {
    key: "followup",
    target: "workspace",
    section: "followup",
    thumbGuideId: "sensora-guide-04",
    titleKey: "landing.showroom.serviceMenu.aftercareTitle",
    descKey: "landing.showroom.serviceMenu.aftercareDesc",
  },
  {
    key: "delivery",
    target: "delivery",
    titleKey: "landing.showroom.serviceMenu.deliveryTitle",
    descKey: "landing.showroom.serviceMenu.deliveryDesc",
  },
];

type LandingGuideCard = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  image: string;
  points: string[];
  style: {
    left: string;
    top: string;
    width: string;
    height: string;
    borderRadius: string;
  };
};

const LANDING_GUIDE_CARDS: LandingGuideCard[] = [
  {
    id: "tip-start",
    title: "상담 내용 분산",
    desc: "상담 내용이 카톡, 문자, 메모장에 흩어집니다.",
    detail:
      "상담이 끝난 뒤 기록 위치가 갈라지면 예산, 비교 차량, 고객 고민을 다시 찾는 데 시간이 걸립니다. Sensora는 상담 메모를 한 흐름으로 정리해 다음 확인 지점을 놓치지 않도록 돕습니다.",
    image: "/images/guides/sensora-guide-03.png",
    points: ["카톡", "문자", "메모장"],
    style: { left: "27.1%", top: "65.9%", width: "15.5%", height: "15.1%", borderRadius: "16px" },
  },
  {
    id: "tip-feature",
    title: "고객 조건 흐려짐",
    desc: "고객이 말한 예산·비교차량·고민이 며칠 뒤 흐려집니다.",
    detail:
      "상담 직후에는 분명했던 조건도 시간이 지나면 흐려집니다. 고객 니즈 요약은 다시 연락하기 전 핵심 조건을 짧게 확인하기 위한 검토 보조입니다.",
    image: "/images/guides/sensora-app-menu-target.png",
    points: ["예산", "비교 차량", "고민"],
    style: { left: "43.9%", top: "65.9%", width: "15.5%", height: "15.1%", borderRadius: "16px" },
  },
  {
    id: "tip-flow",
    title: "문자 follow-up 부담",
    desc: "문자 follow-up을 보내야 하는데 말투와 내용을 매번 새로 고민합니다.",
    detail:
      "고객마다 조건과 온도가 달라 문자를 매번 새로 쓰기 어렵습니다. Sensora는 상담 맥락을 바탕으로 복사해 다듬기 쉬운 검토용 문자 초안을 제안합니다.",
    image: "/images/guides/sensora-preview-target.png",
    points: ["말투", "내용", "복사 전 검토"],
    style: { left: "60.8%", top: "65.9%", width: "15.5%", height: "15.1%", borderRadius: "16px" },
  },
  {
    id: "tip-beta",
    title: "연락 타이밍 이탈",
    desc: "다음 연락 타이밍을 놓치면 고객은 다른 영업사원에게 넘어갑니다.",
    detail:
      "놓친 고객은 대부분 상담 직후가 아니라 후속 연락에서 사라집니다. 다음 연락 목적과 확인할 내용을 정리해, 사용자가 직접 판단하고 실행할 수 있게 둡니다.",
    image: "/images/guides/sensora-current-app-screen.png",
    points: ["타이밍", "연락 목적", "직접 실행"],
    style: { left: "77.6%", top: "65.9%", width: "15.5%", height: "15.1%", borderRadius: "16px" },
  },
  {
    id: "flow-memo",
    title: "고객 니즈 요약",
    desc: "상담 메모만 넣으면 고객이 중요하게 본 조건을 정리합니다.",
    detail:
      "고객 상황, 관심 차량, 예산, 구매 시점처럼 다시 연락할 때 필요한 근거를 짧게 묶습니다. 자동 판단으로 확정하지 않고 영업사원이 확인하고 수정할 수 있습니다.",
    image: "/images/guides/sensora-current-app-screen.png",
    points: ["관심 차량", "예산", "구매 시점"],
    style: { left: "10.3%", top: "88.3%", width: "17.4%", height: "9.7%", borderRadius: "15px" },
  },
  {
    id: "flow-needs",
    title: "문자 초안 생성",
    desc: "상담 맥락을 바탕으로 짧고 실제적인 문자 초안을 만듭니다.",
    detail:
      "초안은 바로 발송되지 않습니다. 고객에게 보내기 전 표현, 조건, 사실관계는 영업사원이 직접 확인하고 필요한 부분만 복사해 사용합니다.",
    image: "/images/guides/sensora-preview-target.png",
    points: ["검토용 초안", "직접 복사", "자동 발송 없음"],
    style: { left: "31%", top: "88.3%", width: "17.4%", height: "9.7%", borderRadius: "15px" },
  },
  {
    id: "flow-sms",
    title: "다음 연락 목적 추천",
    desc: "다음 연락에서 확인할 목적과 실행 내용을 정리합니다.",
    detail:
      "견적 조건 재확인, 출고 가능 여부 안내, 비교 차량 질문처럼 다음 연락에서 놓치면 안 되는 목적을 보여줍니다. AI가 대신 연락하지 않고 사용자가 직접 실행합니다.",
    image: "/images/guides/sensora-preview-target.png",
    points: ["연락 목적", "확인 항목", "직접 실행"],
    style: { left: "51.6%", top: "88.3%", width: "17.4%", height: "9.7%", borderRadius: "15px" },
  },
  {
    id: "flow-next",
    title: "확인 후 고객 기록 저장",
    desc: "요약과 주의할 응대 포인트를 확인한 뒤 고객 기록에 남깁니다.",
    detail:
      "고객 정보는 자동으로 수집하거나 임의 저장하지 않습니다. AI 결과는 사용자가 확인한 뒤 저장하고, 수정이 필요한 표현은 영업사원이 직접 고칩니다.",
    image: "/images/guides/sensora-current-app-screen.png",
    points: ["응대 포인트", "사용자 확인", "자동 저장 없음"],
    style: { left: "72.3%", top: "88.3%", width: "19%", height: "9.7%", borderRadius: "15px" },
  },
];

const PHILOSOPHY_LINE_KEYS = [
  "landing.slides.philosophy.line1",
  "landing.slides.philosophy.line2",
  "landing.slides.philosophy.line3",
  "landing.slides.philosophy.line4",
] as const;

function IconPlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.75 11.08V9.92c0-.6.323-1.15.839-1.424l5.62-3.068a1.583 1.583 0 012.541 1.424v8.088a1.584 1.584 0 01-2.541 1.424l-5.62-3.069a1.583 1.583 0 01-.839-1.423z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7.65 14.42 12.41 10 7.65 5.58"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDeliveryThumb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 17h8v3h-2.5M13 17V9h8v8"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 17H3v-7l4-6h6v13zM9 22a1.5 1.5 0 1 0 .001-3.001A1.5 1.5 0 0 0 9 22zm10 0a1.5 1.5 0 1 0 .001-3.001A1.5 1.5 0 0 0 19 22zM6 10h7"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  slideIndex: number;
  onSlideChange: (index: number) => void;
  onOpenAppWorkspace: () => void;
  onEnterWorkspaceSection: (section: CrmSection) => void;
};

export function LandingShowroom({
  slideIndex,
  onSlideChange,
  onOpenAppWorkspace,
  onEnterWorkspaceSection,
}: Props) {
  const { t } = useLanguage();
  const safeSlide = ((slideIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
  const [deliveryPrepOpen, setDeliveryPrepOpen] = useState(false);
  const [activeGuideCard, setActiveGuideCard] = useState<LandingGuideCard | null>(null);

  const goSlide = useCallback(
    (i: number) => {
      onSlideChange(((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    },
    [onSlideChange],
  );

  useEffect(() => {
    const el = typeof document !== "undefined" ? document.getElementById("sensora-landing-slide-deck") : null;
    if (!el) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (deliveryPrepOpen || activeGuideCard) return;
      if (e.key === "ArrowRight" && safeSlide < SLIDE_COUNT - 1) {
        e.preventDefault();
        goSlide(safeSlide + 1);
      }
      if (e.key === "ArrowLeft" && safeSlide > 0) {
        e.preventDefault();
        goSlide(safeSlide - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeGuideCard, deliveryPrepOpen, goSlide, safeSlide]);

  useEffect(() => {
    if ((!deliveryPrepOpen && !activeGuideCard) || typeof document === "undefined") return undefined;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeliveryPrepOpen(false);
      if (e.key === "Escape") setActiveGuideCard(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [activeGuideCard, deliveryPrepOpen]);

  useEffect(() => {
    if ((!deliveryPrepOpen && !activeGuideCard) || typeof document === "undefined") return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeGuideCard, deliveryPrepOpen]);

  const handleMenuNavigate = useCallback(
    (row: LandingMenuRow) => {
      if (row.target === "delivery") {
        setDeliveryPrepOpen(true);
        return;
      }
      onEnterWorkspaceSection(row.section);
    },
    [onEnterWorkspaceSection],
  );

  const dockSafe = "pb-[max(10px,calc(env(safe-area-inset-bottom,0px)+8px))] pt-2";

  return (
    <div
      id="sensora-landing-slide-deck"
      className="sensora-landing-slide-deck relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#020817]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_82%_52%_at_52%_8%,rgba(56,189,248,0.1),transparent_55%),radial-gradient(ellipse_58%_42%_at_96%_18%,rgba(139,92,246,0.08),transparent_52%),linear-gradient(180deg,#050f1e_0%,#020817_45%,#030b16_100%)]"
      />

      {deliveryPrepOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[282] cursor-default bg-black/[0.55] backdrop-blur-md"
            aria-label={t("landing.slides.deliveryPrep.dismiss")}
            onClick={() => setDeliveryPrepOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-delivery-prep-title"
            className="fixed left-[50%] top-[42%] z-[284] w-[min(calc(100vw-28px),22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.13] bg-gradient-to-b from-[#0a1628]/99 to-[#050f18]/97 p-5 shadow-[0_36px_80px_-28px_rgba(0,0,0,0.75)]"
          >
            <h3 id="landing-delivery-prep-title" className="text-base font-semibold tracking-tight text-slate-50">
              {t("landing.slides.deliveryPrep.title")}
            </h3>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-slate-300/[0.92]">{t("landing.slides.deliveryPrep.body")}</p>
            <button
              type="button"
              onClick={() => setDeliveryPrepOpen(false)}
              className={`${entPrimaryBtn} mt-6 w-full justify-center`}
            >
              {t("landing.slides.deliveryPrep.dismiss")}
            </button>
          </div>
        </>
      ) : null}

      {activeGuideCard ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[282] cursor-default bg-black/[0.58] backdrop-blur-md"
            aria-label={t("landing.showroom.tip.closeOverlay")}
            onClick={() => setActiveGuideCard(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-guide03-card-title"
            className="fixed left-1/2 top-1/2 z-[284] flex max-h-[min(92dvh,calc(100svh-1rem))] w-[min(calc(100vw-28px),58rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-white/[0.13] bg-gradient-to-b from-[#0a1628]/99 to-[#050f18]/97 shadow-[0_36px_90px_-28px_rgba(0,0,0,0.78)]"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300/76">확대 안내</p>
                <h3 id="landing-guide03-card-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
                  {activeGuideCard.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuideCard(null)}
                className="min-h-10 shrink-0 cursor-pointer rounded-xl border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-sky-300/28 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation"
              >
                {t("preview.toc.close")}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-start">
                <div className="relative min-h-[min(48dvh,360px)] overflow-hidden rounded-2xl border border-white/[0.11] bg-[#020817]">
                  <Image src={activeGuideCard.image} alt="" fill className="object-contain object-center" sizes="(max-width: 1024px) calc(100vw - 56px), 560px" quality={100} />
                </div>
                <div>
                  <p className="text-[0.94rem] font-semibold leading-relaxed text-sky-50">{activeGuideCard.desc}</p>
                  <p className="mt-4 text-[0.9rem] leading-relaxed text-slate-300">{activeGuideCard.detail}</p>
                  <ul className="mt-5 grid gap-2">
                    {activeGuideCard.points.map((point) => (
                      <li key={`${activeGuideCard.id}-${point}`} className="flex items-center gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3 py-2.5 text-[0.84rem] font-semibold text-slate-200">
                        <span className="size-2 rounded-full bg-sky-300/78" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden px-4 pt-2 sm:px-6 sm:pt-3 lg:pt-2 xl:pt-3">
          {/* 0 — 첫 슬라이드 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto overflow-x-hidden pb-2 sm:inset-x-6",
              safeSlide === 0 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 0}
          >
            <div className="landing-guide03-hero-shell mx-auto flex h-full w-full items-center justify-center">
              <div className="landing-guide03-hero-frame relative w-full max-w-[1440px] overflow-hidden">
                <Image
                  src="/images/guides/sensora-guide-03.png"
                  alt="Sensora Auto CRM 랜딩 첫 화면"
                  width={1672}
                  height={941}
                  priority
                  quality={100}
                  className="landing-guide03-hero-image block w-full select-none"
                  style={{ height: "auto" }}
                  sizes="(max-width: 1440px) 100vw, 1440px"
                />

                <div className="landing-guide03-mobile-copy" aria-label="Sensora 모바일 랜딩 핵심 안내">
                  <p className="landing-guide03-mobile-kicker">자동차 영업 업무용</p>
                  <h1>상담은 했는데, 다음 연락이 밀리고 있다면.</h1>
                  <p>
                    상담 메모를 넣으면 고객 니즈, 문자 초안, 다음 연락 포인트까지 정리합니다.
                  </p>
                  <p className="landing-guide03-mobile-trust">
                    자동 저장·자동 발송 없이, 확인 후 직접 저장하고 복사합니다.
                  </p>
                  <div className="landing-guide03-mobile-actions">
                    <Link href={JOIN_PATH} prefetch={false}>
                      {t("cta.joinBeta")}
                    </Link>
                    <button type="button" onClick={onOpenAppWorkspace}>
                      {t("cta.tryAppExperience")}
                    </button>
                  </div>
                </div>

                <Link href="/?view=landing" prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--brand" aria-label="Sensora Auto CRM 랜딩으로 이동">
                  <span className="sr-only">Sensora Auto CRM</span>
                </Link>
                <Link href={JOIN_PATH} prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--nav-join" aria-label={t("cta.joinBeta")}>
                  <span className="sr-only">{t("cta.joinBeta")}</span>
                </Link>
                <button type="button" onClick={onOpenAppWorkspace} className="landing-guide03-hotspot landing-guide03-hotspot--nav-preview" aria-label={t("cta.tryAppExperience")}>
                  <span className="sr-only">{t("cta.tryAppExperience")}</span>
                </button>

                <Link href={JOIN_PATH} prefetch={false} className="landing-guide03-hotspot landing-guide03-hotspot--hero-join" aria-label={t("cta.joinBeta")}>
                  <span className="sr-only">{t("cta.joinBeta")}</span>
                </Link>
                <button type="button" onClick={onOpenAppWorkspace} className="landing-guide03-hotspot landing-guide03-hotspot--hero-preview" aria-label={t("cta.tryAppExperience")}>
                  <span className="sr-only">{t("cta.tryAppExperience")}</span>
                </button>

                {LANDING_GUIDE_CARDS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveGuideCard(card)}
                    style={card.style}
                    className="landing-guide03-hotspot landing-guide03-hotspot--guide-card"
                    aria-label={`${card.title} · ${t("landing.showroom.concept.tapToExpand")}`}
                  >
                    <span className="sr-only">{card.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 1 — 핵심 업무 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 1 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 1}
          >
            <div className="mx-auto flex w-full max-w-[720px] flex-col pb-1 lg:max-w-[800px]">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-sky-400/88 sm:text-[11px]">
                {t("landing.slides.menu.kicker")}
              </p>
              <h2 className="mt-2 text-center text-[clamp(1.35rem,calc(0.85rem+2.1vw),1.85rem)] font-semibold tracking-[-0.032em] text-slate-50">
                {t("landing.showroom.serviceMenu.sectionTitle")}
              </h2>
              <p className="mx-auto mt-1.5 max-w-[40ch] text-center text-[0.8125rem] leading-snug text-slate-400/95 sm:mt-2 sm:text-[0.8375rem]">
                {t("landing.slides.menu.enterpriseSub")}
              </p>
              <div className="mt-5 flex w-full flex-col gap-2 sm:mt-6 sm:gap-2.5">
                {MENU_ITEMS.map((row) => (
                  <button
                    key={row.key}
                    type="button"
                    aria-label={
                      row.target === "delivery"
                        ? `${t(row.titleKey)} · ${t("landing.slides.menu.deliveryPrepAria")}`
                        : `${t(row.titleKey)} · ${t("landing.slides.menu.enterWorkspaceAria")}`
                    }
                    onClick={() => handleMenuNavigate(row)}
                    className="landing-slide-menu-row group flex min-h-[4rem] w-full items-center gap-3 rounded-xl border border-white/[0.1] bg-[#050f1a]/88 px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-[border-color,background-color] hover:border-sky-400/28 hover:bg-[#071425]/95 active:scale-[0.996] touch-manipulation sm:min-h-[4.375rem] sm:gap-4 sm:px-4 sm:py-3"
                  >
                    {row.target === "workspace" ? (
                      <div className="relative h-[2.75rem] w-[3.7rem] shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#020617] sm:h-[3rem] sm:w-[4.1rem]">
                        <Image
                          src={thumbGuideImage(row.thumbGuideId)}
                          alt=""
                          fill
                          className="object-cover object-center opacity-[0.9]"
                          sizes="72px"
                          quality={92}
                        />
                      </div>
                    ) : (
                      <div className="flex size-[2.75rem] shrink-0 items-center justify-center rounded-lg border border-dashed border-sky-400/22 bg-[#081422]/92 text-sky-300/82 sm:size-[3rem]">
                        <IconDeliveryThumb className="size-[1.35rem]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[1.03rem] font-semibold leading-tight tracking-[-0.02em] text-slate-50 sm:text-[1.1rem]">
                        {t(row.titleKey)}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[0.765rem] leading-snug text-slate-400/92 sm:text-[0.8rem]">{t(row.descKey)}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-sky-200/88">
                      <span className="max-w-[6.5rem] text-right text-[11px] font-semibold leading-tight text-sky-100/88 sm:max-w-none sm:text-[12px]">
                        {row.target === "delivery" ? t("landing.slides.menu.actionDeliveryStatus") : t("landing.slides.menu.actionGoWorkspace")}
                      </span>
                      <IconChevron className="size-[1.05rem] shrink-0 opacity-88 transition group-hover:translate-x-0.5 sm:size-[1.1rem]" />
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-5">
                <button
                  type="button"
                  onClick={() => goSlide(2)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.04] px-7 py-2.5 text-[13px] font-semibold text-slate-100 transition hover:border-sky-400/28 hover:bg-white/[0.07] touch-manipulation"
                >
                  {t("landing.slides.menu.nextPhilosophy")}
                </button>
                <button
                  type="button"
                  onClick={() => goSlide(0)}
                  className="text-[13px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation"
                >
                  {t("landing.slides.nav.prev")}
                </button>
              </div>
            </div>
          </div>

          {/* 2 — 운영 원칙 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 2 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 2}
          >
            <div className="mx-auto flex w-full max-w-[560px] flex-col items-center sm:max-w-[600px] lg:max-w-[640px]">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/78 sm:text-[11px]">{t("landing.slides.philosophy.kicker")}</p>
              <h2 className="mt-4 max-w-[18ch] text-center text-[clamp(1.28rem,calc(0.7rem+2.35vw),1.92rem)] font-semibold leading-[1.12] tracking-[-0.034em] text-slate-50 [word-break:keep-all] sm:max-w-[22ch]">
                {t("landing.slides.philosophy.title")}
              </h2>
              <ul className="mt-8 w-full border-t border-white/[0.08] sm:mt-10">
                {PHILOSOPHY_LINE_KEYS.map((lineKey) => (
                  <li key={lineKey} className="border-b border-white/[0.08] py-[1.05rem] sm:py-[1.2rem]">
                    <p className="border-l-[3px] border-sky-400/45 pl-4 text-left text-[0.9rem] font-medium leading-snug text-slate-200/93 sm:pl-[1.125rem] sm:text-[0.9575rem] sm:leading-[1.42]">
                      {t(lineKey)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <button type="button" onClick={() => goSlide(3)} className={`${entPrimaryBtn} min-h-[3rem] px-8`}>
                  {t("landing.slides.philosophy.nextCta")}
                </button>
                <button
                  type="button"
                  onClick={() => goSlide(1)}
                  className="text-[13px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation"
                >
                  {t("landing.slides.nav.prev")}
                </button>
              </div>
            </div>
          </div>

          {/* 3 — 전환 */}
          <div
            className={[
              "sensora-landing-slide-panel sensora-landing-slide-panel--dock-pad absolute inset-x-4 inset-y-0 flex flex-col overflow-y-auto pb-2 sm:inset-x-6",
              safeSlide === 3 ? "pointer-events-auto z-[2] opacity-100" : "pointer-events-none z-0 opacity-0",
            ].join(" ")}
            aria-hidden={safeSlide !== 3}
          >
            <div className="mx-auto flex w-full max-w-[440px] flex-col items-center text-center sm:max-w-[460px]">
              <h2 className="max-w-[24ch] text-[clamp(1.2rem,calc(0.82rem+1.85vw),1.65rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-slate-50 [word-break:keep-all] sm:max-w-[26ch]">
                {t("landing.slides.actions.closingHeadline")}
              </h2>
              <p className="mt-4 max-w-[38ch] text-[0.88rem] leading-relaxed text-slate-400 sm:text-[0.94rem]">
                {t("landing.showroom.announcement.body")}
              </p>
              <div className="landing-slide-actions-cta-cluster mx-auto mt-9 flex w-full max-w-[22rem] flex-col items-stretch gap-2.5 sm:mt-10 sm:max-w-[24rem]">
                <Link href={JOIN_PATH} prefetch={false} className={`${entPrimaryBtn} w-full justify-center`}>
                  {t("cta.joinBeta")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAppWorkspace();
                  }}
                  className={`${entGhostBtn} w-full justify-center gap-2 border border-white/[0.12]`}
                >
                  <IconPlay className="size-[1.05rem] shrink-0 opacity-95" />
                  {t("landing.slides.actions.browseAppCta")}
                </button>
                <Link href="/register" prefetch={false} className={`${entGhostBtn} w-full justify-center border border-violet-300/[0.2]`}>
                  {t("auth.salesRegistration")}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => goSlide(2)}
                className="mt-8 text-[12px] font-semibold text-slate-500 underline-offset-[3px] hover:text-slate-300 hover:underline touch-manipulation sm:text-[13px]"
              >
                {t("landing.slides.actions.backToPhilosophy")}
              </button>
            </div>
          </div>
        </div>

        <nav
          className={`landing-slide-nav-dock relative z-[5] shrink-0 border-t border-white/[0.09] bg-[#020817]/94 backdrop-blur-md ${dockSafe}`}
          aria-label={t("landing.slides.dotNav")}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-3 sm:px-4">
            <button
              type="button"
              disabled={safeSlide <= 0}
              onClick={() => goSlide(safeSlide - 1)}
              className="min-h-10 min-w-[4.25rem] rounded-xl border border-white/[0.1] bg-white/[0.035] px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation sm:text-sm"
            >
              {t("landing.slides.nav.prev")}
            </button>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {Array.from({ length: SLIDE_COUNT }, (_, i) => (
                <button
                  key={`dot-${String(i)}`}
                  type="button"
                  aria-current={safeSlide === i ? "step" : undefined}
                  aria-label={`${String(i + 1)} / ${String(SLIDE_COUNT)}`}
                  onClick={() => goSlide(i)}
                  className={[
                    "size-2.5 shrink-0 rounded-full transition sm:size-3",
                    safeSlide === i ? "scale-[1.06] bg-sky-400 landing-enterprise-slide-dot-active" : "bg-slate-600/82 hover:bg-slate-500",
                  ].join(" ")}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={safeSlide >= SLIDE_COUNT - 1}
              onClick={() => goSlide(safeSlide + 1)}
              className="min-h-10 min-w-[4.25rem] rounded-xl border border-white/[0.1] bg-white/[0.035] px-3 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation sm:text-sm"
            >
              {t("landing.slides.nav.next")}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
