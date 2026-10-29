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
  if (!guide) return { title: "가이드 없음" };

  const title = guide.title.ko;
  const description = guide.description.ko;
  const url = absoluteUrl(`/guides/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: hreflangLanguages(`/guides/${slug}`, `/en/guides/${slug}`),
    },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      url,
      siteName: "퍼모위키",
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

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideArticle guide={guide} locale="ko" />;
}
