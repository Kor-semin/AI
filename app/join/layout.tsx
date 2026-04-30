import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "베타 신청",
  description:
    "Sales Concierge AI 베타 프로그램 신청 — 자동차 영업사원을 위한 AI 고객관리 비서.",
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
