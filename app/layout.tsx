import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "킥보드·전기자전거·외발휠 중고 적정가, 스펙, 고질병, 직거래 체크리스트를 한곳에서. 퍼모위키.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "퍼모위키 | 퍼스널 모빌리티 중고 시세·스펙",
    template: "%s | 퍼모위키",
  },
  description: siteDescription,
  applicationName: "퍼모위키",
  keywords: [
    "퍼스널 모빌리티",
    "전동킥보드 중고",
    "전기자전거 중고",
    "중고 시세",
    "고질병",
    "퍼모위키",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "퍼모위키",
    title: "퍼모위키 | 퍼스널 모빌리티 중고 시세·스펙",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "퍼모위키 | 퍼스널 모빌리티 중고 시세·스펙",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "OMiYAuXHSu_D00cqwCqpxUGrS6UCgfhnA_B7z9MU95A",
    other: {
      "naver-site-verification": ["157fb14cd8ec9a9a55cd63e06182cf172969eabc"],
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "퍼모위키",
      url: SITE_URL,
      description: siteDescription,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "퍼모위키",
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
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
        <AdSenseScript />
        <Header />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
