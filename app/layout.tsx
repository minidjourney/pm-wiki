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
    google: "OMiYAuXHSu_D00cqwCqpxUGrS6UCgfhnA_B7z9MU95A",
    other: {
      "naver-site-verification": ["157fb14cd8ec9a9a55cd63e06182cf172969eabc"],
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
          src="https://www.googletagmanager.com/gtag/js?id=G-DT72L2RRJS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DT72L2RRJS');
          `}
        </Script>
        <Header />
        {children}
      </body>
    </html>
  );
}
