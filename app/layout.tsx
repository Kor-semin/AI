import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/app/components/i18n/LanguageProvider";
import { PwaInstallHint } from "@/app/components/PwaInstallHint";
import { TextSizeProvider } from "@/app/components/TextSizeProvider";
import { TEXT_SIZE_STORAGE_KEY } from "@/lib/textSizePreference";
import { THEME_STORAGE_KEY } from "@/lib/themePreference";
import { ThemeProvider } from "@/app/components/ThemeProvider";

const TEXT_SIZE_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(TEXT_SIZE_STORAGE_KEY)};var r=localStorage.getItem(k);var x=r==="small"||r==="large"?r:"medium";document.documentElement.setAttribute("data-text-size",x);}catch(e){}})();`;

const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:null;if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark";}})();`;

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
      { url: "/icons/icon-192-v3.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512-v3.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon-v3.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#111827" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
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
      data-text-size="medium"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${coverSerif.variable} ${coverSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_BOOT_SCRIPT }} suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} suppressHydrationWarning />
      </head>
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <ThemeProvider>
            <TextSizeProvider>
              {children}
              <PwaInstallHint />
            </TextSizeProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
