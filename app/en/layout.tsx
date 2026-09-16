import type { Metadata } from "next";
import { SetHtmlLang } from "@/components/layout/SetHtmlLang";
import { SITE_URL } from "@/lib/site";
import { hreflangLanguages } from "@/lib/locale";

/**
 * Nested title.template overrides the root Korean "%s | 퍼모위키" for deeper
 * `/en/*` segments (e.g. model pages). Same-level `app/en/page.tsx` cannot use
 * this template (Next.js applies the parent layout's template there) — that
 * page sets `title.absolute` instead.
 */
export const metadata: Metadata = {
  title: {
    default: "Personal Mobility Used Prices & Specs | Pumo Wiki",
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
