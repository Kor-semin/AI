"use client";

import type { ReactNode } from "react";

export type AiSecretarySectionProps = {
  children: ReactNode;
};

export function AiSecretarySection({ children }: AiSecretarySectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-50 lg:hidden">Sensora AI 비서</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-400 lg:hidden">상담 메모 분석과 발송 문자 초안입니다. 저장은 사용자가 확인합니다.</p>
      </div>
      {children}
    </div>
  );
}
