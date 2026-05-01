import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "베타 신청",
  description:
    "Sensora Auto CRM 베타 신청 페이지입니다. 자동차 영업 현장에서 상담·고객·일정을 정리하는 도구를 준비 중입니다.",
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
