import { SiteDocument } from "@/components/layout/SiteDocument";

export { siteMetadata as metadata } from "@/components/layout/SiteDocument";

export default function KoreanLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="ko">{children}</SiteDocument>;
}
