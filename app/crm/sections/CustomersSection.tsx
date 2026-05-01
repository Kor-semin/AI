"use client";

import type { ReactNode } from "react";

export type CustomersSectionProps = {
  children: ReactNode;
};

export function CustomersSection({ children }: CustomersSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="lg:hidden">
        <h2 className="text-[18px] font-semibold text-[#111827]">고객 목록 · 상세</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          검색과 추가 버튼은 상단에 있습니다. 출고 안내 등은 고객 선택 후 이용하세요.
        </p>
      </div>
      {children}
    </div>
  );
}
