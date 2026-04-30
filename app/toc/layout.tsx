import type { ReactNode } from "react";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";

const tocSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

/** 목차 헤드라인 전용 명조 (--font-toc-serif) */
const tocSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  variable: "--font-toc-serif",
});

export default function TocLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={`${tocSans.className} ${tocSerif.variable}`}>{children}</div>
  );
}
