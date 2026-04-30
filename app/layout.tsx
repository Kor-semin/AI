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
    "고객 상담, 시승 일정, 출고 준비, 재구매 타이밍까지. 고급 자동차 영업사원의 하루를 놓치지 않도록 정리해주는 프리미엄 영업 컨시어지.",
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
    { media: "(prefers-color-scheme: light)", color: "#0b0b0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0a" },
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
