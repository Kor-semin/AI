import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영업 계정 등록",
  description:
    "Sensora Auto CRM — Google 로그인 및 영업 명함 접수 후 승인 시 워크스페이스가 열립니다. B2B AI SaaS Sensora.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
