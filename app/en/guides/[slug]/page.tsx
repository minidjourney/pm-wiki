import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getGuide, listGuides } from "@/lib/guides";
import { hreflangLanguages } from "@/lib/locale";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title.en,
    description: guide.description.en,
    alternates: {
      canonical: `${SITE_URL}/en/guides/${slug}`,
      languages: hreflangLanguages(
        `/guides/${slug}`,
        `/en/guides/${slug}`
      ),
    },
  };
}

export default async function EnGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} locale="en" />;
}
