import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Market Lab",
  description:
    "개인용 코인 리서치·분석 노트 MVP. 투자 자문이 아니며 자동매매·주문 기능은 없습니다.",
};

export default function MarketLabLayout({ children }: { children: ReactNode }) {
  return children;
}
