import type { Metadata } from "next";
import { SetHtmlLang } from "@/components/layout/SetHtmlLang";
import { SITE_URL } from "@/lib/site";
import { hreflangLanguages } from "@/lib/locale";

export const metadata: Metadata = {
  title: {
    default: "Pumo Wiki | Personal Mobility Used Prices & Specs",
    template: "%s | Pumo Wiki",
  },
  description:
    "Compare e-kickboards, e-bikes, and unicycles — used prices, specs, and known issues. Pumo Wiki.",
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: hreflangLanguages("/", "/en"),
  },
  openGraph: {
    locale: "en_US",
    url: `${SITE_URL}/en`,
    siteName: "Pumo Wiki",
  },
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SetHtmlLang lang="en" />
      {children}
    </>
  );
}
