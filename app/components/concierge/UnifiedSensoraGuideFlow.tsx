"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SensoraAnimatedMark } from "@/app/components/SensoraAnimatedMark";
import { useLanguage } from "@/app/components/i18n/LanguageProvider";
import { SensoraGuideDetailModal } from "@/app/components/concierge/SensoraGuideDetailModal";
import { SensoraGuideGallery } from "@/app/components/concierge/SensoraGuideGallery";
import {
  SENSORA_GUIDES,
  type SensoraGuideId,
} from "@/lib/sensoraGuide";
import type { CrmSection } from "@/app/crm/crmSectionTypes";

const JOIN_PATH = "/join" as const;
const REGISTER_PATH = "/register" as const;
const GUIDE_FLOW_GUIDES = SENSORA_GUIDES.filter((guide) => guide.id !== "sensora-guide-03" && guide.id !== "sensora-guide-05");
const DEFAULT_FLOW_GUIDE_ID: SensoraGuideId = "sensora-guide-01";

const WIZARD_LAST = 3;
const APP_PREVIEW_TABS = ["all", "customers", "ai", "followup", "delivery"] as const;

const glassInteractive =
  "sensora-glass-surface rounded-2xl transition-[border-color,box-shadow] duration-200 hover:border-sky-400/38 hover:shadow-[0_0_44px_-16px_rgba(56,189,248,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/38";

export type UnifiedSensoraGuideVariant = "dialog" | "notebook";
type AppPreviewGuideTone = "start" | "feature" | "flow" | "beta" | "memo" | "needs" | "sms" | "next";
type AppPreviewGuideCard = {
  id: AppPreviewGuideTone;
  tone: AppPreviewGuideTone;
  title: string;
  desc: string;
  detail: string;
  image: string;
  points: string[];
};
type AppPreviewCopy = {
  title: string;
  sub: string;
  eyebrow: string;
  cards: AppPreviewGuideCard[];
};
type AppPreviewTab = (typeof APP_PREVIEW_TABS)[number];
type AppPreviewCardTone = "customers" | "ai" | "followup" | "delivery";
type AppPreviewCard =
  | {
      id: AppPreviewCardTone;
      tone: AppPreviewCardTone;
      title: string;
      desc: string;
      action: string;
      kind: "section";
      section: CrmSection;
      targetPath: string;
      points: string[];
    }
  | {
      id: "delivery";
      tone: "delivery";
      title: string;
      desc: string;
      action: string;
      kind: "delivery";
      points: string[];
    };

const APP_PREVIEW_COPY = {
  ko: {
    title: "Sensora 화면 둘러보기",
    sub: "고객관리, AI 비서, 사후관리, 출고 안내를 선택해 확인해보세요.",
    eyebrow: "앱 화면 미리보기",
    cards: [
      {
        id: "start",
        tone: "start",
        title: "이용 시작 방법",
        desc: "베타 신청부터 승인, 계정 등록 후 사용까지의 흐름을 확인합니다.",
        detail:
          "Sensora는 베타 신청, 내부 확인, 영업 계정 등록을 거쳐 사용할 수 있도록 안내합니다. 실제 저장 기능은 승인된 사용 경로에서만 열리며, 고객 정보는 사용자가 확인한 뒤 다룹니다.",
        image: "/images/guides/sensora-guide-03.png",
        points: ["베타 신청", "승인 확인", "계정 등록"],
      },
      {
        id: "feature",
        tone: "feature",
        title: "기능 설명",
        desc: "핵심 업무 영역이 어떤 역할을 하는지 한 번에 봅니다.",
        detail:
          "기능 설명은 메뉴를 반복해서 보여주기보다 각 업무가 무엇을 돕는지 정리합니다. AI는 검토용 초안을 돕고, 최종 판단과 저장은 영업사원이 직접 합니다.",
        image: "/images/guides/sensora-app-menu-target.png",
        points: ["메뉴 역할", "검토용 초안", "사용자 확인"],
      },
      {
        id: "flow",
        tone: "flow",
        title: "실제 사용 흐름",
        desc: "상담 기록부터 고객 요약, 메시지, 일정까지 이어지는 흐름입니다.",
        detail:
          "상담 내용을 기록하면 니즈와 다음 행동을 다시 확인하기 쉬운 구조로 이어집니다. 이 미리보기는 흐름 안내이며, 고객 정보가 자동 저장되거나 자동 수집되는 동작은 포함하지 않습니다.",
        image: "/images/guides/sensora-preview-target.png",
        points: ["상담 기록", "요약 확인", "다음 행동"],
      },
      {
        id: "beta",
        tone: "beta",
        title: "베타 사용 안내",
        desc: "실제 저장과 계정 기능은 베타 승인 후 사용할 수 있습니다.",
        detail:
          "베타 기간에는 화면과 문구가 조정될 수 있습니다. 민감한 고객 정보는 승인된 경로와 사용자의 확인 흐름을 기준으로 다룹니다.",
        image: "/images/guides/sensora-current-app-screen.png",
        points: ["예시 화면", "승인 후 사용", "사용자 확인"],
      },
      {
        id: "memo",
        tone: "memo",
        title: "상담 정리 · 기록",
        desc: "고객과 나눈 대화와 관심 차량을 업무 화면에서 다시 확인합니다.",
        detail:
          "상담 메모는 고객 상황, 관심 차량, 예산, 구매 시점처럼 나중에 다시 볼 근거를 남기는 영역입니다. 기록은 사용자의 선택과 확인을 전제로 합니다.",
        image: "/images/guides/sensora-current-app-screen.png",
        points: ["상담 메모", "관심 차량", "기록 확인"],
      },
      {
        id: "needs",
        tone: "needs",
        title: "고객 니즈 요약",
        desc: "상담 메모를 바탕으로 고객이 중요하게 본 조건을 정리합니다.",
        detail:
          "고객 니즈 요약은 상담 내용을 더 쉽게 다시 읽기 위한 검토 보조입니다. 자동 판단으로 확정하지 않고, 영업사원이 내용을 확인하고 수정할 수 있는 흐름을 우선합니다.",
        image: "/images/guides/sensora-preview-target.png",
        points: ["조건 정리", "검토 보조", "수정 가능"],
      },
      {
        id: "sms",
        tone: "sms",
        title: "발송 문자",
        desc: "상담 맥락을 바탕으로 사용할 수 있는 문자 초안을 확인합니다.",
        detail:
          "발송 문자는 바로 전송되는 자동화가 아니라 검토용 초안입니다. 고객에게 보내기 전 표현과 사실관계는 영업사원이 직접 확인합니다.",
        image: "/images/guides/sensora-preview-target.png",
        points: ["문자 초안", "직접 확인", "복사 전 검토"],
      },
      {
        id: "next",
        tone: "next",
        title: "다음 연락",
        desc: "상담 이후 확인할 연락 시점과 실행 내용을 정리합니다.",
        detail:
          "다음 연락은 상담 이후 사용자가 확인해야 할 행동을 정리하는 영역입니다. AI가 알아서 연락한다는 의미가 아니라, 영업사원이 직접 판단하고 실행할 내용을 보기 쉽게 둡니다.",
        image: "/images/guides/sensora-current-app-screen.png",
        points: ["다음 연락", "일정 확인", "직접 실행"],
      },
    ],
  },
  en: {
    title: "Browse Sensora screens",
    sub: "Choose customer management, AI assistant, aftercare, or delivery guidance screens.",
    eyebrow: "App preview",
    cards: [
      {
        id: "start",
        tone: "start",
        title: "Getting started",
        desc: "Review the flow from beta request to approval and account registration.",
        detail:
          "Sensora guides users through beta request, internal review, and sales account registration. Real saving features open only in approved paths, and customer information is handled after user confirmation.",
        image: "/images/guides/sensora-guide-03.png",
        points: ["Beta request", "Approval check", "Account setup"],
      },
      {
        id: "feature",
        tone: "feature",
        title: "Feature overview",
        desc: "See how notes, CRM, aftercare, and delivery guidance fit together.",
        detail:
          "The feature overview explains what each work area supports without repeating the menu. AI supports review drafts; final decisions and saves remain with the salesperson.",
        image: "/images/guides/sensora-app-menu-target.png",
        points: ["Menu role", "Review draft", "User confirmation"],
      },
      {
        id: "flow",
        tone: "flow",
        title: "Usage flow",
        desc: "Follow the flow from notes to summaries, messages, and schedules.",
        detail:
          "Consultation notes lead into needs, follow-up context, and next actions. This is a preview flow, not automatic customer collection or automatic saving.",
        image: "/images/guides/sensora-preview-target.png",
        points: ["Notes", "Summary", "Next action"],
      },
      {
        id: "beta",
        tone: "beta",
        title: "Beta guide",
        desc: "Real saving and account features are available after beta approval.",
        detail:
          "During beta, screens and copy may change. Sensitive customer information is handled through approved paths and user confirmation.",
        image: "/images/guides/sensora-current-app-screen.png",
        points: ["Example screen", "Approval required", "User review"],
      },
      {
        id: "memo",
        tone: "memo",
        title: "Consultation notes",
        desc: "Review customer conversations and interested vehicles in context.",
        detail:
          "Consultation notes keep the facts a salesperson needs later: customer context, interested vehicles, budget, and purchase timing. Recording is based on user choice and confirmation.",
        image: "/images/guides/sensora-current-app-screen.png",
        points: ["Notes", "Vehicles", "Review"],
      },
      {
        id: "needs",
        tone: "needs",
        title: "Customer needs",
        desc: "Summarize what mattered most in the consultation notes.",
        detail:
          "Needs summaries help salespeople reread consultation context. They do not make automatic decisions; the salesperson reviews and edits the content.",
        image: "/images/guides/sensora-preview-target.png",
        points: ["Needs", "Review aid", "Editable"],
      },
      {
        id: "sms",
        tone: "sms",
        title: "Message draft",
        desc: "Review a draft message grounded in the consultation context.",
        detail:
          "Message drafts are not sent automatically. The salesperson checks wording and facts before using or copying the draft.",
        image: "/images/guides/sensora-preview-target.png",
        points: ["Draft", "Review", "Copy after check"],
      },
      {
        id: "next",
        tone: "next",
        title: "Next outreach",
        desc: "Keep next outreach and aftercare work visible.",
        detail:
          "Next outreach keeps user-reviewed actions visible after the consultation. It does not mean AI contacts customers automatically; the salesperson decides and acts.",
        image: "/images/guides/sensora-current-app-screen.png",
        points: ["Next touch", "Schedule", "Manual action"],
      },
    ],
  },
} satisfies Record<"ko" | "en", AppPreviewCopy>;

type Props = {
  /** 열릴 때 wizard·가이드 상태 초기화 */
  active: boolean;
  variant: UnifiedSensoraGuideVariant;
  /** 랜딩 등에서 '소개 중복'을 피하려면 true */
  skipIntro?: boolean;
  onClose: () => void;
  onSelectSection: (section: CrmSection) => void;
  onOpenTargetPath?: (targetPath: string, section: CrmSection) => void;
  sellerLoading?: boolean;
  className?: string;
};

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function IconChevronNavigate({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7 4l7 6-7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
    </svg>
  );
}

function IconArrowRightSoft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4.5 10h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.8 5.7L15.1 10l-4.3 4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppPreviewScreenBrowser({
  className,
  onSelectSection,
  onNavigateToAppRoute,
}: {
  className: string;
  onSelectSection: (section: CrmSection) => void;
  onNavigateToAppRoute?: (targetPath: string, section: CrmSection) => void;
}) {
  const { language, t } = useLanguage();
  const [deliveryPrepOpen, setDeliveryPrepOpen] = useState(false);
  const ko = language === "ko";
  const copy = ko
    ? {
        title: "Sensora 화면 둘러보기",
        sub: "고객관리, AI 비서, 사후관리, 출고 안내를 선택해 확인해보세요.",
        eyebrow: "앱 화면 미리보기",
        cards: [
          {
            id: "customers",
            tone: "customers",
            title: "고객관리",
            desc: "상담 메모와 관심 차량을 고객별로 정리합니다.",
            action: "고객관리 열기",
            kind: "section",
            section: "customers",
            targetPath: "/?view=app#customers",
            points: ["상담 메모", "관심 차량"],
          },
          {
            id: "ai",
            tone: "ai",
            title: "AI 비서",
            desc: "상담 내용을 바탕으로 검토용 초안을 제안합니다.",
            action: "AI 비서 열기",
            kind: "section",
            section: "ai",
            targetPath: "/?view=app#crm-ai-assistant",
            points: ["검토용 초안", "니즈 정리"],
          },
          {
            id: "followup",
            tone: "followup",
            title: "사후관리",
            desc: "다음 연락과 사후관리 일정을 놓치지 않도록 돕습니다.",
            action: "사후관리 열기",
            kind: "section",
            section: "followup",
            targetPath: "/?view=app#follow-up",
            points: ["다음 연락", "일정 관리"],
          },
          {
            id: "delivery",
            tone: "delivery",
            title: "출고 안내",
            desc: "반복되는 안내 문구를 더 정확하게 준비할 수 있도록 구성 중입니다.",
            action: "준비 중",
            kind: "delivery",
            points: ["안내 문구", "준비 항목"],
          },
        ] satisfies AppPreviewCard[],
      }
    : {
        title: "Browse Sensora screens",
        sub: "Choose customer management, AI assistant, aftercare, or delivery guidance screens.",
        eyebrow: "App preview",
        cards: [
          {
            id: "customers",
            tone: "customers",
            title: "Customers",
            desc: "Organize consultation notes and interested vehicles by customer.",
            action: "Open customers",
            kind: "section",
            section: "customers",
            targetPath: "/?view=app#customers",
            points: ["Notes", "Vehicles"],
          },
          {
            id: "ai",
            tone: "ai",
            title: "AI assistant",
            desc: "Suggest review-ready drafts grounded in consultation notes.",
            action: "Open AI assistant",
            kind: "section",
            section: "ai",
            targetPath: "/?view=app#crm-ai-assistant",
            points: ["Drafts", "Needs"],
          },
          {
            id: "followup",
            tone: "followup",
            title: "Aftercare",
            desc: "Keep next outreach and aftercare schedules from slipping.",
            action: "Open aftercare",
            kind: "section",
            section: "followup",
            targetPath: "/?view=app#follow-up",
            points: ["Next touch", "Schedule"],
          },
          {
            id: "delivery",
            tone: "delivery",
            title: "Delivery guidance",
            desc: "We are preparing clearer recurring delivery guidance templates.",
            action: "In preparation",
            kind: "delivery",
            points: ["Guidance", "Checklist"],
          },
        ] satisfies AppPreviewCard[],
      };

  const handleCardClick = (card: AppPreviewCard) => {
    if (card.kind === "delivery") {
      setDeliveryPrepOpen(true);
      return;
    }
    onNavigateToAppRoute?.(card.targetPath, card.section) ?? onSelectSection(card.section);
  };

  useEffect(() => {
    if (!deliveryPrepOpen || typeof document === "undefined") return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeliveryPrepOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [deliveryPrepOpen]);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`.trim()}>
      <div className="sensora-guide-preview-hide-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))]">
        <div className="mx-auto flex w-full max-w-[min(1180px,100%)] flex-col gap-5 px-0 pb-4 pt-2 sm:px-2 sm:pt-4 lg:gap-6">
          <section className="app-preview-tour-screen overflow-hidden rounded-[30px] border border-white/[0.12] bg-slate-900/72 text-slate-100 shadow-[0_36px_104px_-58px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.075)]">
            <div className="grid gap-5 border-b border-white/[0.09] bg-[linear-gradient(135deg,rgba(11,35,64,0.94)_0%,rgba(7,19,35,0.98)_58%,rgba(3,10,20,0.99)_100%)] px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,0.72fr)_auto] lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/72">{copy.eyebrow}</p>
                <h2 className="mt-3 max-w-[18ch] text-balance text-[clamp(2rem,5vw,4.1rem)] font-semibold leading-[1.02] tracking-[-0.055em]">{copy.title}</h2>
                <p className="mt-4 max-w-[40rem] text-[0.95rem] font-medium leading-relaxed text-slate-300 sm:text-[1.05rem]">{copy.sub}</p>
              </div>
              <Link
                href={JOIN_PATH}
                prefetch={false}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.055] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35"
              >
                {t("cta.joinBeta")}
              </Link>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 lg:grid-cols-2">
              {copy.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  className="app-preview-guide-card group grid min-h-[14.5rem] w-full cursor-pointer touch-manipulation gap-4 rounded-[26px] border border-white/[0.1] bg-white/[0.045] p-4 text-left shadow-[0_18px_54px_-38px_rgba(0,0,0,0.74),inset_0_1px_0_rgba(255,255,255,0.07)] transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-sky-300/28 hover:bg-white/[0.065] hover:shadow-[0_24px_64px_-40px_rgba(14,165,233,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  aria-label={`${card.title} · ${card.action}`}
                >
                  <span className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Sensora</span>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[0.68rem] font-semibold",
                        card.tone === "customers" ? "bg-sky-300/[0.12] text-sky-100" : card.tone === "ai" ? "bg-violet-300/[0.14] text-violet-100" : card.tone === "followup" ? "bg-emerald-300/[0.12] text-emerald-100" : "bg-slate-300/[0.12] text-slate-200",
                      ].join(" ")}
                    >
                      {card.title}
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span className="block text-[1.12rem] font-semibold leading-tight tracking-[-0.035em] text-slate-50 sm:text-[1.24rem]">{card.title}</span>
                    <span className="mt-2 block text-[0.88rem] leading-relaxed text-slate-400">{card.desc}</span>
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      {card.points.map((point) => (
                        <span key={`${card.id}-${point}`} className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[0.72rem] font-semibold text-slate-300">
                          {point}
                        </span>
                      ))}
                    </span>
                    <span className="mt-5 inline-flex min-h-10 items-center gap-1.5 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[0.84rem] font-semibold text-sky-100 transition group-hover:border-sky-300/22 group-hover:bg-sky-300/[0.07]">
                      {card.action}
                      <IconArrowRightSoft className="size-[0.95rem] shrink-0 opacity-80" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {deliveryPrepOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[478] cursor-default bg-black/[0.55] backdrop-blur-md"
            aria-label={t("landing.slides.deliveryPrep.dismiss")}
            onClick={() => setDeliveryPrepOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-preview-delivery-prep-title"
            className="fixed left-1/2 top-1/2 z-[479] w-[min(calc(100vw-28px),24rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/[0.13] bg-gradient-to-b from-[#0a1628]/99 to-[#050f18]/97 p-5 shadow-[0_36px_90px_-28px_rgba(0,0,0,0.78)]"
          >
            <h3 id="app-preview-delivery-prep-title" className="text-lg font-semibold tracking-tight text-slate-50">
              {t("landing.slides.deliveryPrep.title")}
            </h3>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-slate-300/[0.94]">{t("landing.slides.deliveryPrep.body")}</p>
            <button
              type="button"
              onClick={() => setDeliveryPrepOpen(false)}
              className="sensora-premium-primary-workspace mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              {t("landing.slides.deliveryPrep.dismiss")}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function UnifiedSensoraGuideFlow({
  active,
  variant,
  skipIntro = false,
  onClose,
  onSelectSection,
  onOpenTargetPath,
  sellerLoading = false,
  className = "",
}: Props) {
  const { t } = useLanguage();
  const minWizardStep = skipIntro ? 1 : 0;
  const [wizardStep, setWizardStep] = useState(minWizardStep);
  const [activeGuideId, setActiveGuideId] = useState<SensoraGuideId>(DEFAULT_FLOW_GUIDE_ID);
  const [guideDetailOpen, setGuideDetailOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    setWizardStep(minWizardStep);
    setActiveGuideId(DEFAULT_FLOW_GUIDE_ID);
    setGuideDetailOpen(false);
  }, [active, minWizardStep]);

  const goPrevGuide = useCallback(() => {
    const idx = GUIDE_FLOW_GUIDES.findIndex((g) => g.id === activeGuideId);
    const prev = (idx - 1 + GUIDE_FLOW_GUIDES.length) % GUIDE_FLOW_GUIDES.length;
    setActiveGuideId(GUIDE_FLOW_GUIDES[prev]?.id ?? DEFAULT_FLOW_GUIDE_ID);
  }, [activeGuideId]);

  const goNextGuide = useCallback(() => {
    const idx = GUIDE_FLOW_GUIDES.findIndex((g) => g.id === activeGuideId);
    const next = (idx + 1) % GUIDE_FLOW_GUIDES.length;
    setActiveGuideId(GUIDE_FLOW_GUIDES[next]?.id ?? DEFAULT_FLOW_GUIDE_ID);
  }, [activeGuideId]);

  const pillarEntries = useMemo(
    () =>
      [
        {
          titleKey: "preview.flow.step2.card.customersTitle" as const,
          descKey: "preview.flow.step2.card.customersDesc" as const,
          src: "/images/guides/sensora-guide-01.png",
          section: "customers" as CrmSection,
        },
        {
          titleKey: "preview.flow.step2.card.aiTitle" as const,
          descKey: "preview.flow.step2.card.aiDesc" as const,
          src: "/images/guides/sensora-guide-02.png",
          section: "ai" as CrmSection,
        },
        {
          titleKey: "preview.flow.step2.card.followTitle" as const,
          descKey: "preview.flow.step2.card.followDesc" as const,
          src: "/images/guides/sensora-guide-04.png",
          section: "followup" as CrmSection,
        },
      ] as const,
    [],
  );

  const kickerClass =
    variant === "notebook"
      ? "notebook-cover-cover-kicker-upper shrink-0 font-[family-name:var(--font-cover-serif)] text-[clamp(10px,2.4vw,12px)] font-semibold tracking-[0.22em]"
      : "text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-400/85 sm:text-[11px]";

  const titleClass =
    variant === "notebook"
      ? "text-balance font-semibold leading-[1.2] tracking-[-0.03em] text-[#F8FAFC]"
      : "text-balance font-semibold leading-[1.22] tracking-[-0.03em] text-slate-50";

  const bodyClass =
    variant === "notebook"
      ? "text-left text-[0.90625rem] leading-relaxed text-slate-200 sm:text-[0.9375rem] sm:leading-[1.62]"
      : "text-left text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]";

  const wizardPrev = () => setWizardStep((s) => Math.max(minWizardStep, s - 1));
  const wizardNext = () => setWizardStep((s) => Math.min(WIZARD_LAST, s + 1));

  const footerSecondaryLabel =
    wizardStep === WIZARD_LAST ? t("preview.toc.close") : t("preview.flow.footer.next");

  const onFooterPrimaryClick = () => {
    if (wizardStep < WIZARD_LAST) {
      wizardNext();
      return;
    }
    onClose();
  };

  if (!active) return null;

  if (skipIntro && variant === "dialog") {
    return <AppPreviewScreenBrowser className={className} onSelectSection={onSelectSection} onNavigateToAppRoute={onOpenTargetPath} />;
  }

  return (
    <>
      <SensoraGuideDetailModal
        open={guideDetailOpen}
        onClose={() => setGuideDetailOpen(false)}
        activeGuideId={activeGuideId}
        onActiveGuideChange={setActiveGuideId}
        overlayZClass="z-[470]"
        onGoToRelated={(section) => onSelectSection(section)}
      />

      <div className={`flex min-h-0 flex-1 flex-col ${className}`.trim()}>
        <div className="sensora-guide-preview-hide-scroll sensora-guide-toc-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] max-sm:pb-[max(7.5rem,calc(env(safe-area-inset-bottom,0px)+6.25rem))] sm:pb-10">
          <div className="mx-auto flex w-full max-w-[min(640px,100%)] flex-col px-1 sm:max-w-[min(720px,100%)]">
            {wizardStep === 0 ? (
              <div className={`flex flex-col ${variant === "notebook" ? "items-stretch px-1 pt-1 max-[420px]:px-1" : "items-center px-1 pt-1 text-center max-sm:px-0.5 sm:pt-3"}`}>
                <div
                  className={[
                    "relative mx-auto flex w-full max-w-[28rem] flex-col overflow-hidden rounded-[22px] border border-white/[0.13] px-[clamp(1.1rem,3.8vw,1.75rem)] py-[clamp(1.85rem,5.2vw,2.85rem)] text-center shadow-[0_42px_100px_-40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(56,189,248,0.045)_inset] backdrop-blur-xl",
                    variant === "notebook" ?
                      "bg-gradient-to-br from-[#0c1829]/94 via-[#070f18]/92 to-[#040a13]/93 ring-1 ring-inset ring-white/[0.05]"
                    : "bg-gradient-to-b from-white/[0.07] via-[#070f18]/88 to-[#020817]/93 ring-1 ring-inset ring-sky-400/[0.08]",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute inset-x-[-20%] top-[-30%] h-[72%] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(56,189,248,0.11),transparent_62%)]" aria-hidden />

                  <div className="relative flex flex-col items-center">
                    <div className="flex justify-center [--mark-glow:rgba(56,189,248,0.42)] motion-reduce:[--mark-glow:transparent]">
                      <div className="rounded-full p-[2px] shadow-[0_0_48px_-12px_var(--mark-glow)] ring-2 ring-white/[0.08]">
                        <div className="rounded-full bg-[#020817]/92 p-[3px]">
                          <SensoraAnimatedMark
                            size={variant === "notebook" ? 104 : 96}
                            animated
                            label={t("product.name")}
                            className="motion-reduce:opacity-[0.96]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mx-auto mb-6 mt-[1.375rem] h-px max-w-[5.5rem] bg-gradient-to-r from-transparent via-sky-400/35 to-transparent sm:mt-7 sm:max-w-[6.75rem]" aria-hidden />

                    <p className={kickerClass}>{t("guide.unified.header.kicker")}</p>

                    <h2 className={`${titleClass} mt-3 max-w-[22ch] text-[clamp(1.35rem,min(5vw+0.45rem,1.9rem),1.92rem)]`}>{t("guide.unified.intro.title")}</h2>

                    <div className={`mx-auto mt-5 w-full max-w-[34ch] space-y-[0.75em] ${bodyClass} ${variant === "dialog" ? "text-[0.84375rem] sm:text-[0.9375rem]" : ""}`}>
                      {splitLines(t("guide.unified.intro.body")).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>

                    <div className="mx-auto mt-[1.875rem] h-px w-full max-w-[13rem] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent sm:max-w-[16rem]" aria-hidden />

                    <div className="relative z-[1] mx-auto mt-7 flex w-full max-w-[20.5rem] flex-col gap-3 sm:mt-9">
                      <button
                        type="button"
                        onClick={() => wizardNext()}
                        className={`sensora-premium-primary-workspace min-h-[3.25rem] w-full shrink-0 rounded-2xl py-3.5 text-[0.94rem] font-semibold tracking-tight shadow-[0_0_40px_-10px_rgba(56,189,248,0.22)] touch-manipulation sm:min-h-[3.375rem]`}
                      >
                        {t("preview.flow.step1.startCta")}
                      </button>
                      <Link
                        href={REGISTER_PATH}
                        prefetch={false}
                        onClick={() => onClose()}
                        className={`${glassInteractive} flex min-h-[3.0625rem] w-full shrink-0 items-center justify-center rounded-2xl border border-white/[0.15] px-5 py-[0.7rem] text-center text-[0.875rem] font-semibold text-slate-100 transition hover:bg-white/[0.05] hover:text-white touch-manipulation sm:min-h-[3.1875rem] sm:text-[0.9rem]`}
                      >
                        {t("preview.flow.step1.registerCta")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {wizardStep === 1 ? (
              <div className="pt-2 text-center sm:pt-3">
                <p className={`${kickerClass} ${variant === "dialog" ? "text-sky-400/85" : ""}`}>{t("guide.unified.header.kicker")}</p>
                <h2 className={`${titleClass} mx-auto mt-2 max-w-[22ch] text-[clamp(1.25rem,min(4.5vw+0.55rem,1.85rem),1.85rem)]`}>{t("preview.flow.step2.headline")}</h2>
                <p className={`mx-auto mt-2 max-w-[40ch] text-xs leading-snug text-slate-400 sm:text-sm ${variant === "notebook" ? "text-slate-400" : ""}`}>
                  {t("preview.flow.step2.sub")}
                </p>
                <ul className="mx-auto mt-5 grid w-full max-w-[28rem] list-none gap-[0.7rem] p-0 text-left sm:mt-7 sm:gap-[0.85rem]" role="list">
                  {pillarEntries.map((row) => (
                    <li key={`${row.section}-${row.titleKey}`}>
                      <button
                        type="button"
                        onClick={() => onSelectSection(row.section)}
                        aria-label={`${t(row.titleKey)} · ${t("cta.openAppWorkspace")}`}
                        className={[
                          "notebook-cover-toc-pane sensora-notebook-toc-pane--visual sensora-guide-pillar-card group relative flex w-full touch-manipulation flex-col rounded-[15px] border border-white/[0.13] px-3 py-[0.7rem] text-left backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[220ms] ease-out hover:border-sky-400/[0.38] hover:shadow-[0_0_40px_-12px_rgba(56,189,248,0.16)] motion-reduce:transition-none motion-reduce:hover:shadow-none active:translate-y-[0.5px] active:brightness-[1.03] active:transition-none max-sm:rounded-[14px] sm:rounded-[17px] sm:px-[1.05rem] sm:py-3",
                          variant === "notebook" ?
                            "bg-gradient-to-br from-white/[0.06] via-[#0a1624]/80 to-transparent"
                          : "bg-gradient-to-br from-white/[0.06] via-[#030d18]/75 to-transparent",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/42",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative size-[3.625rem] shrink-0 overflow-hidden rounded-[11px] border border-white/[0.13] bg-[#030712]/95 ring-2 ring-transparent transition-[ring-color] duration-[220ms] group-hover:ring-sky-400/[0.2] group-active:scale-[0.99] motion-reduce:group-active:scale-100 sm:size-16">
                            <Image src={row.src} alt="" fill className="object-cover object-center opacity-[0.96]" sizes="76px" quality={100} />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/55 to-transparent" aria-hidden />
                          </div>
                          <div className="min-h-[3.5rem] flex-1 pr-10 sm:min-h-[4rem] sm:pr-11">
                            <p className={`text-[clamp(0.8925rem,2.65vw,0.98rem)] font-semibold leading-snug tracking-[-0.018em] ${variant === "notebook" ? "text-[#F8FAFC]" : "text-slate-50"} sm:text-[0.9575rem]`}>
                              {t(row.titleKey)}
                            </p>
                            <p className={`mt-1 max-w-[34ch] text-[10.75px] leading-[1.45] text-slate-400 max-sm:text-[11px] sm:mt-[0.325rem] sm:text-[0.8175rem] sm:leading-relaxed ${variant === "notebook" ? "text-[#94A3B8]" : ""}`}>
                              {t(row.descKey)}
                            </p>
                          </div>
                          <IconChevronNavigate className="pointer-events-none absolute right-3.5 top-1/2 size-[1.1rem] -translate-y-1/2 shrink-0 text-sky-300/82 transition-[transform,color] duration-[220ms] group-hover:translate-x-0.5 group-hover:text-sky-200 motion-reduce:group-hover:translate-x-0 sm:right-[1.175rem]" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {wizardStep === 2 ? (
              <div className="flex flex-col gap-2 pt-1 sm:gap-3 sm:pt-2">
                <div className="text-center">
                  <p className={`${kickerClass} ${variant === "dialog" ? "text-sky-400/85" : ""}`}>{t("guide.unified.flow.kicker")}</p>
                  <h2 className={`${titleClass} mx-auto mt-1 max-w-[30ch] text-[clamp(1.12rem,min(4vw+0.5rem,1.55rem),1.55rem)]`}>{t("guide.unified.flow.title")}</h2>
                  <p className="mx-auto mt-2 max-w-[44ch] text-xs leading-snug text-slate-400 sm:text-sm">{t("guide.unified.flow.lead")}</p>
                  <p className="mx-auto mt-2 max-w-[min(36rem,100%)] text-[11px] font-medium leading-snug text-sky-200/85 sm:text-xs" aria-hidden={false}>
                    {t("guide.unified.flow.rail")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.1] bg-white/[0.035] px-2 py-1.5 sm:px-3">
                  <button
                    type="button"
                    onClick={goPrevGuide}
                    className={`${glassInteractive} min-h-10 shrink-0 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-100 touch-manipulation sm:px-3 sm:text-sm`}
                  >
                    {t("guide.unified.guideNav.prev")}
                  </button>
                  <div className="flex flex-1 flex-wrap justify-center gap-1 px-0.5" aria-hidden>
                    {GUIDE_FLOW_GUIDES.map((g) => (
                      <span
                        key={g.id}
                        className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${g.id === activeGuideId ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.55)]" : "bg-slate-600/70 opacity-65"}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNextGuide}
                    className={`sensora-premium-primary-workspace min-h-10 shrink-0 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-50 touch-manipulation sm:px-3 sm:text-sm`}
                  >
                    {t("guide.unified.guideNav.next")}
                  </button>
                </div>

                <SensoraGuideGallery
                  guides={GUIDE_FLOW_GUIDES}
                  activeId={activeGuideId}
                  onSelectGuide={(id) => {
                    setActiveGuideId(id as SensoraGuideId);
                    setGuideDetailOpen(true);
                  }}
                  onExpandImage={() => setGuideDetailOpen(true)}
                  tapToExpandLabel={t("preview.guide.tapDetail")}
                  getTitle={(g) => t(g.titleKey)}
                  getDescription={(g) => t(g.descKey)}
                  hideThumbnailHeading
                />
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div className="flex flex-col gap-4 pt-1 sm:pt-2">
                <div className="text-center">
                  <p className={`${kickerClass} ${variant === "dialog" ? "text-sky-400/85" : ""}`}>{t("guide.unified.start.kicker")}</p>
                  <h2 className={`${titleClass} mx-auto mt-2 max-w-[24ch] text-[clamp(1.2rem,min(4.2vw+0.55rem),1.75rem)]`}>{t("guide.unified.start.title")}</h2>
                  <p className={`mx-auto mt-2 max-w-[42ch] text-xs leading-relaxed ${variant === "notebook" ? "text-slate-400" : "text-slate-400"} sm:text-sm`}>
                    {t("guide.unified.start.lead")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectSection("dashboard")}
                    className="sensora-premium-primary-workspace min-h-[3.125rem] w-full rounded-2xl py-3.5 text-[0.9375rem] font-semibold shadow-[0_0_48px_-12px_rgba(56,189,248,0.22)] touch-manipulation lg:py-4"
                  >
                    {t("preview.flow.step3.enterWorkspace")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSection("ai")}
                    className={`${glassInteractive} min-h-[3.125rem] w-full rounded-2xl py-3.5 text-[0.9375rem] font-semibold text-white hover:border-violet-400/40 touch-manipulation lg:py-4`}
                  >
                    {t("preview.flow.step3.enterAi")}
                  </button>
                </div>

                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  <Link
                    href={REGISTER_PATH}
                    prefetch={false}
                    onClick={() => {
                      onClose();
                    }}
                    className={`${glassInteractive} flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-white/[0.15] px-4 py-3 text-center text-[0.875rem] font-semibold text-slate-100 transition hover:bg-white/[0.05] hover:text-white touch-manipulation sm:min-h-[3.125rem] sm:text-[0.9rem]`}
                  >
                    {t("preview.flow.step1.registerCta")}
                  </Link>
                  <Link
                    href={JOIN_PATH}
                    prefetch={false}
                    onClick={() => {
                      onClose();
                    }}
                    className={`${glassInteractive} flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-sky-400/28 bg-white/[0.04] px-4 py-3 text-center text-[0.875rem] font-semibold text-sky-50/95 transition hover:border-sky-400/42 hover:bg-white/[0.07] touch-manipulation sm:min-h-[3.125rem] sm:text-[0.9rem]`}
                  >
                    {t("cta.joinBeta")}
                  </Link>
                </div>

                {sellerLoading ? <p className="text-center text-xs text-[#94A3B8]">{t("auth.checkingLogin")}</p> : null}

                <p className="text-center text-[10px] leading-relaxed text-slate-500 sm:text-[11px]" role="note">
                  {t("guide.unified.disclaimer")}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="sensora-guide-toc-footer shrink-0 border-t border-white/[0.1] bg-[#020817]/94 px-2 pt-2.5 pb-[max(0.875rem,calc(env(safe-area-inset-bottom,0px)+2.25rem))] shadow-[0_-10px_32px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-4 sm:pt-3 sm:pb-[max(0.875rem,calc(env(safe-area-inset-bottom,0px)+2rem))] lg:rounded-2xl lg:border lg:border-white/[0.1] lg:bg-[linear-gradient(180deg,rgba(56,189,248,0.035)_0%,rgba(15,26,43,0.42)_52%,rgba(8,17,31,0.62)_100%)] lg:px-5 lg:pt-3 lg:pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+1.25rem))] lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <div className="mx-auto flex w-full max-w-[min(720px,calc(100%-4px))] items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (wizardStep === 0) return;
                wizardPrev();
              }}
              disabled={wizardStep === 0}
              className="app-preview-guide-nav-btn min-h-[2.875rem] min-w-0 flex-1 rounded-xl border border-white/[0.12] bg-white/[0.052] px-2 py-2.5 text-[13px] font-semibold leading-snug text-slate-200 transition hover:border-sky-400/32 hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 disabled:pointer-events-none disabled:opacity-[0.38] touch-manipulation sm:min-h-11 sm:px-3 sm:text-sm"
            >
              {t("preview.flow.footer.prev")}
            </button>

            <div className="flex shrink-0 flex-wrap justify-center gap-1 px-0.5" aria-hidden>
              {Array.from({ length: WIZARD_LAST + 1 }, (_, i) => (
                <span
                  key={`wizard-dot-${i}`}
                  className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${wizardStep === i ? "scale-110 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.55)]" : "bg-slate-600/70 opacity-65"}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onFooterPrimaryClick}
              className={`app-preview-guide-nav-btn min-h-[2.875rem] min-w-0 flex-1 rounded-xl border px-2 py-2.5 text-[13px] font-semibold leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35 touch-manipulation sm:min-h-11 sm:px-3 sm:text-sm ${wizardStep === WIZARD_LAST ? "border-white/[0.14] bg-white/[0.06] text-slate-100 hover:bg-white/[0.09]" : "border-sky-400/42 bg-white/[0.065] text-sky-50 hover:border-sky-400/55 hover:bg-white/[0.085]"}`}
              aria-label={footerSecondaryLabel}
            >
              {footerSecondaryLabel}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
