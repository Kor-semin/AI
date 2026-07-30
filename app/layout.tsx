import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/app/components/i18n/LanguageProvider";
import { PwaInstallHint } from "@/app/components/PwaInstallHint";
import { TextSizeProvider } from "@/app/components/TextSizeProvider";
import { TEXT_SIZE_STORAGE_KEY } from "@/lib/textSizePreference";
import { THEME_STORAGE_KEY } from "@/lib/themePreference";

// 배율 규격: "100"|"120"|"150". 구버전 저장값(small/medium/large)은 가장 가까운 배율로 이관.
// 화면 모드: "dark"(기본) | "light". 첫 페인트 전에 적용해 깜빡임을 막습니다.
const TEXT_SIZE_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(TEXT_SIZE_STORAGE_KEY)};var r=localStorage.getItem(k);var x=r==="100"||r==="120"||r==="150"?r:r==="large"?"120":"100";document.documentElement.setAttribute("data-text-size",x);var tk=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(tk);document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){}})();`;

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
    default: "Sensora Auto CRM",
    template: "%s · Sensora Auto CRM",
  },
  description:
    "Sensora Auto CRM은 자동차 영업사원을 위한 고객 상담·일정 정리 도구입니다. 상담 기록과 다음 연락·문자 초안 등을 한 흐름에서 다룹니다.",
  appleWebApp: {
    capable: true,
    title: "Sensora Auto CRM",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192-v4.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512-v4.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon-v4.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2A0405" },
    { media: "(prefers-color-scheme: dark)", color: "#2A0405" },
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
      data-text-size="100"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${coverSerif.variable} ${coverSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_BOOT_SCRIPT }} suppressHydrationWarning />
      </head>
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <TextSizeProvider>
            {children}
            <PwaInstallHint />
          </TextSizeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
