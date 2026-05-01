import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영업 계정 등록",
  description:
    "Sensora Auto CRM 영업 계정 등록입니다. Google 로그인과 명함 제출 후 승인되면 업무 워크스페이스를 이용할 수 있습니다.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
