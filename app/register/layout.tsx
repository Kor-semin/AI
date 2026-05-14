import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영업 계정 등록",
  description:
    "Sensora Auto CRM 영업 계정 등록 페이지입니다. 입력 정보는 계정 확인과 베타 승인 안내용이며, 고객 연락처는 자동 수집되지 않습니다. 로그인과 명함 이미지는 사용자가 직접 제공합니다.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
