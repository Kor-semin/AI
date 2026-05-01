"use client";

import type { ReactNode } from "react";

export type FollowUpSectionProps = {
  children: ReactNode;
};

export function FollowUpSection({ children }: FollowUpSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[20px] font-semibold text-[#111827]">사후관리 · 다음 연락</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          오늘 연락과 이번 주 일정은 아래 목록과 상단 미니 캘린더(고객 화면)에서 함께 확인합니다. 고객 메모의「주말 통화」「평일
          저녁」등은 문자·비서 카드 작성 시 반영합니다.
        </p>
      </div>
      {children}
    </div>
  );
}
