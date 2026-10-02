import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { getGuide, listGuides } from "@/lib/guides";
import { hreflangLanguages } from "@/lib/locale";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };

  const title = guide.title.en;
  const description = guide.description.en;
  const url = absoluteUrl(`/en/guides/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: hreflangLanguages(`/guides/${slug}`, `/en/guides/${slug}`),
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      url,
      siteName: "Pumo Wiki",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function EnGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} locale="en" />;
}
