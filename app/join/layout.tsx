import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "베타 신청",
  description:
    "Sensora Auto CRM 베타 프로그램 신청. Sensora는 B2B AI SaaS 기업이며, 영업 지원 경험은 Sales Concierge AI 개념을 참고합니다.",
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
