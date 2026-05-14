"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { CrmSection } from "@/app/crm/crmSectionTypes";

export type MobileLandingFeatureKey = "customers" | "consulting" | "followup" | "ai" | "delivery";

type Props = {
  feature: MobileLandingFeatureKey | null;
  onClose: () => void;
  /** 워크스페이스(앱 뷰)로 진입 — 미리보기 닫은 뒤 호출 */
  onEnterWorkspace: (section: CrmSection) => void;
};

const panel =
  "rounded-2xl border border-white/[0.1] bg-[#050f1a]/85 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";
const ghostInput =
  "w-full rounded-xl border border-white/[0.12] bg-[#020817]/80 px-3 py-2.5 text-left text-[13px] text-slate-300 placeholder:text-slate-600 outline-none focus:border-sky-400/35";
const miniLabel = "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500";

function workspaceSectionFor(feature: Exclude<MobileLandingFeatureKey, "delivery">): CrmSection {
  switch (feature) {
    case "customers":
      return "customers";
    case "consulting":
      return "consulting";
    case "followup":
      return "followup";
    case "ai":
      return "ai";
    default:
      return "dashboard";
  }
}

export function MobileFeaturePreview({ feature, onClose, onEnterWorkspace }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!feature || typeof document === "undefined") return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [feature]);

  if (!feature) return null;

  const enterWorkspaceThenClose = () => {
    if (feature === "delivery") {
      onClose();
      router.push("/delivery");
      return;
    }
    onClose();
    onEnterWorkspace(workspaceSectionFor(feature));
  };

  const goDeliveryPage = () => {
    onClose();
    router.push("/delivery");
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex flex-col bg-[linear-gradient(180deg,#050a14_0%,#020617_42%,#030712_100%)] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-feature-preview-title"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#050a14]/95 px-3 pb-3 pt-[max(10px,calc(env(safe-area-inset-top,0px)+8px))] backdrop-blur-md">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[13px] font-semibold text-slate-200 transition active:scale-[0.98] touch-manipulation"
        >
          ← 뒤로
        </button>
        <div className="min-w-0 flex-1 pr-1">
          <p className={`${miniLabel} text-sky-400/75`}>기능 미리보기</p>
          <h1 id="mobile-feature-preview-title" className="truncate text-[1.05rem] font-semibold tracking-tight text-slate-50">
            {feature === "customers" && "고객관리"}
            {feature === "consulting" && "상담 메모"}
            {feature === "followup" && "사후관리"}
            {feature === "delivery" && "출고 안내"}
            {feature === "ai" && "AI 비서"}
          </h1>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(7.5rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))] pt-4">
        {feature === "customers" ? (
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            <p className="text-[14px] leading-relaxed text-slate-400 [word-break:keep-all]">
              고객별 상담 내용, 관심 차량, 연락 상태를 한 흐름으로 정리합니다.
            </p>
            <div className={panel}>
              <p className={miniLabel}>고객 이름</p>
              <div className="mt-1.5 rounded-xl border border-dashed border-white/[0.14] bg-[#020817]/60 px-3 py-2.5 text-[13px] text-slate-500">예: 김○○ 고객님</div>
            </div>
            <div className={panel}>
              <p className={miniLabel}>관심 차량 메모</p>
              <div className="mt-1.5 rounded-xl border border-dashed border-white/[0.14] bg-[#020817]/60 px-3 py-2.5 text-[13px] leading-snug text-slate-500 [word-break:keep-all]">
                예: SUV · 하이브리드 · 4천만 원대
              </div>
            </div>
            <div className={panel}>
              <p className={miniLabel}>상담 상태</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["견적", "시승 예정", "계약 검토"].map((x) => (
                  <span key={x} className="rounded-lg border border-white/[0.1] bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-100/90">
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <button type="button" className={`${ghostInput} text-center font-semibold text-slate-200`}>
              고객 정보 정리하기
            </button>
          </div>
        ) : null}

        {feature === "consulting" ? (
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            <p className="text-[14px] leading-relaxed text-slate-400 [word-break:keep-all]">
              상담 중 남긴 내용을 다시 확인하고, 중요한 포인트를 놓치지 않게 돕습니다.
            </p>
            <div className={panel}>
              <p className={miniLabel}>상담 메모</p>
              <textarea readOnly className={`${ghostInput} mt-1.5 min-h-[5.5rem] resize-none text-[13px] leading-relaxed`} placeholder="고객님께서 말씀하신 조건을 짧게 남겨 둡니다." />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className={panel}>
                <p className={miniLabel}>고객 니즈</p>
                <p className="mt-1 text-[12px] text-slate-400">가족용·연비</p>
              </div>
              <div className={panel}>
                <p className={miniLabel}>예산</p>
                <p className="mt-1 text-[12px] text-slate-400">3~4천만 원</p>
              </div>
              <div className={panel}>
                <p className={miniLabel}>다음 연락</p>
                <p className="mt-1 text-[12px] text-slate-400">금요일 오후</p>
              </div>
            </div>
            <button type="button" className={`${ghostInput} text-center font-semibold text-slate-200`}>
              메모 정리하기
            </button>
          </div>
        ) : null}

        {feature === "followup" ? (
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            <p className="text-[14px] leading-relaxed text-slate-400 [word-break:keep-all]">
              다음 연락과 출고 전 안내를 놓치지 않도록 정리합니다.
            </p>
            <div className={panel}>
              <p className="text-[12px] font-semibold text-slate-200">다음 연락 예정</p>
              <p className="mt-1 text-[12px] text-slate-500">내일 14:00 · 견적 안내 전화</p>
            </div>
            <div className={panel}>
              <p className="text-[12px] font-semibold text-slate-200">출고 전 안내</p>
              <p className="mt-1 text-[12px] text-slate-500">필요 서류·방문 시간을 한 번에 확인합니다.</p>
            </div>
            <div className={panel}>
              <p className="text-[12px] font-semibold text-slate-200">계약 후 체크</p>
              <ul className="mt-2 space-y-1.5 text-[12px] text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="size-3.5 rounded border border-emerald-400/40 bg-emerald-500/15" /> 보험 가입 안내
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-3.5 rounded border border-white/15" /> 번호판 준비
                </li>
              </ul>
            </div>
            <button type="button" className={`${ghostInput} text-center font-semibold text-slate-200`}>
              사후관리 일정 보기
            </button>
          </div>
        ) : null}

        {feature === "delivery" ? (
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            <p className="text-[14px] leading-relaxed text-slate-400 [word-break:keep-all]">
              반복되는 출고 안내 문구를 더 정확하게 준비합니다.
            </p>
            <div className={panel}>
              <p className="text-[12px] font-semibold text-slate-200">출고 전 준비물</p>
              <p className="mt-1 text-[12px] text-slate-500">신분증·잔금·보험 증권 등</p>
            </div>
            <div className={panel}>
              <p className="text-[12px] font-semibold text-slate-200">방문 시간 안내</p>
              <p className="mt-1 text-[12px] text-slate-500">혼잡을 줄이기 위해 방문 시간을 안내합니다.</p>
            </div>
            <div className={panel}>
              <p className="text-[12px] font-semibold text-slate-200">차량 인수 안내</p>
              <p className="mt-1 text-[12px] text-slate-500">인수 시 확인할 포인트를 짧게 정리합니다.</p>
            </div>
            <button type="button" onClick={goDeliveryPage} className={`${ghostInput} text-center font-semibold text-slate-200`}>
              출고 안내 문구 보기
            </button>
          </div>
        ) : null}

        {feature === "ai" ? (
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            <p className="text-[14px] leading-relaxed text-slate-400 [word-break:keep-all]">
              상담 내용을 바탕으로 <span className="text-slate-300">검토용 초안</span>과 다음 행동을 제안합니다. 최종 판단과 발송은 항상 영업사원이 합니다.
            </p>
            <div className={panel}>
              <p className={miniLabel}>상담 내용 (예시)</p>
              <div className="mt-1.5 rounded-xl border border-dashed border-white/[0.14] bg-[#020817]/60 px-3 py-2.5 text-[12px] leading-relaxed text-slate-500 [word-break:keep-all]">
                고객님께서 시승 일정과 옵션 구성을 문의하셨습니다.
              </div>
            </div>
            <div className={panel}>
              <p className={miniLabel}>정리 요약 (검토용)</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400 [word-break:keep-all]">
                시승 가능 일자 2안 · 옵션별 가격 차이를 짧게 요약한 초안입니다. 보내기 전에 꼭 확인해 주세요.
              </p>
            </div>
            <div className={panel}>
              <p className={miniLabel}>문자 초안 (검토용)</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400 [word-break:keep-all]">
                “안녕하세요, 말씀 주신 옵션 기준으로 견적 초안을 정리해 두었습니다. 확인 후 편하실 때 연락 주세요.”
              </p>
            </div>
            <button type="button" className={`${ghostInput} text-center font-semibold text-slate-200`}>
              초안 확인하기
            </button>
          </div>
        ) : null}
      </div>

      <footer className="shrink-0 border-t border-white/[0.1] bg-[#050a14]/96 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <button
            type="button"
            onClick={enterWorkspaceThenClose}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-sky-500/25 px-4 text-[13px] font-semibold text-sky-100 ring-1 ring-sky-400/35 transition active:scale-[0.99] touch-manipulation"
          >
            {feature === "delivery" ? "출고 안내에서 계속하기" : "워크스페이스에서 사용하기"}
          </button>
          <Link
            href="/join"
            prefetch={false}
            onClick={onClose}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] text-[13px] font-semibold text-slate-100 transition active:scale-[0.99] touch-manipulation"
          >
            베타 신청하기
          </Link>
        </div>
      </footer>
    </div>
  );
}
