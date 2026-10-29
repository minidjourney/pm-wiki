import { SiteDocument } from "@/components/layout/SiteDocument";

export { siteMetadata as metadata } from "@/components/layout/SiteDocument";

export default function JapaneseLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="ja">{children}</SiteDocument>;
}
