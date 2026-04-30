import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영업 계정 등록",
  description: "Google 로그인 및 영업 명함 접수 후 승인 시 CRM 이용이 시작됩니다.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
