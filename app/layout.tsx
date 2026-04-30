import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** 표지 전용: 제목 명조·글귀 명돋 (비즈니스·숙독에 맞춤) */
const coverSerif = Noto_Serif_KR({
  variable: "--font-cover-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const coverSans = Noto_Sans_KR({
  variable: "--font-cover-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sales Concierge AI",
    template: "%s · Sales Concierge AI",
  },
  description:
    "고급 자동차 영업사원을 위한 프리미엄 고객관리 시스템. 상담 이력, 관심 차량, 구매 가능성, 후속 연락까지 AI가 정리하고 제안합니다.",
  appleWebApp: {
    capable: true,
    title: "Sales Concierge AI",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f4" },
    { media: "(prefers-color-scheme: dark)", color: "#eef1f4" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${coverSerif.variable} ${coverSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
