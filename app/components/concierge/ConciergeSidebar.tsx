"use client";

import { useLanguage } from "@/app/components/i18n/LanguageProvider";

type SidebarEntry =
  | { label: string; tab: "customers" | "next"; hint: string; hash?: string }
  | { label: string; hint: string; href: string };

const MENU: SidebarEntry[] = [
  { label: "Dashboard", tab: "customers", hint: "요약" },
  { label: "Customers", tab: "customers", hint: "고객 목록" },
  { label: "Consulting Notes", tab: "customers", hint: "상담" },
  { label: "AI Secretary", tab: "customers", hint: "패널", hash: "crm-ai-assistant" },
  { label: "Pipeline", tab: "customers", hint: "단계" },
  { label: "Vehicle Match", tab: "customers", hint: "차량" },
  { label: "Follow-up", tab: "next", hint: "후속" },
  { label: "Settings", href: "/register", hint: "설정" },
];

export function ConciergeSidebar() {
  const { t } = useLanguage();
  return (
    <aside className="hidden w-[260px] shrink-0 lg:block">
      <div className="sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col rounded-[22px] border border-[#374151] bg-[#111827] pb-6 pt-5 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="border-b border-[#1F2937] px-5 pb-5">
          <div className="text-[12px] font-semibold tracking-[0.08em] text-[#CBD5E1]">
            {t("header.workspace")}
          </div>
          <div className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-[#F9FAFB]">
            {t("product.name")}
          </div>
          <div className="mt-1.5 text-[13px] font-medium leading-snug text-[#CBD5E1]/90">
            Sales Concierge AI 스타일 영업 보조 · B2B AI SaaS
          </div>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3" aria-label="CRM 주 메뉴">
          {MENU.map((m) => {
            const href =
              "href" in m
                ? m.href
                : (() => {
                    const tabParam = m.tab === "next" ? "next" : "customers";
                    const hash =
                      m.hash ??
                      (m.tab === "next" ? "crm-workspace-next" : "crm-main");
                    return `/?view=app&tab=${tabParam}#${hash}`;
                  })();
            return (
              <a
                key={m.label}
                href={href}
                className="group flex min-h-[44px] touch-manipulation items-center justify-between gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-[#F3F4F6] outline-none ring-offset-2 ring-offset-[#111827] hover:bg-[#1F2937] hover:text-white focus-visible:ring-2 focus-visible:ring-[#94A3B8]"
              >
                <span>{m.label}</span>
                <span className="text-[12px] font-medium text-[#CBD5E1]/80 group-hover:text-[#E2E8F0]">
                  {m.hint}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
