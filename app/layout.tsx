import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PM Wiki - 퍼스널 모빌리티 중고 거래 정보",
  description: "킥보드·전동킥보드·전기자전거 적정 중고가, 고질병, 직거래 체크리스트",
  verification: {
    google: "pTILOViGpUSjnK32INYRp7sbanSMSHnOQT_22p063zo",
    other: {
      "naver-site-verification": "76706624c3a9d7aa796f0b329cd485ccfd7592e1",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X31H85Y071"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X31H85Y071');
          `}
        </Script>
        <Header />
        {children}
      </body>
    </html>
  );
}
