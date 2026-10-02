import type { Guide } from "@/lib/guides";
import { absoluteUrl, type FaqItem } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Props = {
  guide: Guide;
  locale: "ko" | "en";
  faqs: FaqItem[];
  /** ISO date (YYYY-MM-DD) from frontmatter `updated` when present. */
  dateModified?: string;
};

/**
 * Guide-page Article (+ FAQPage when on-page FAQ exists).
 * Root Organization/WebSite JSON-LD stays in app/layout.tsx.
 */
export function GuideJsonLd({ guide, locale, faqs, dateModified }: Props) {
  const isEn = locale === "en";
  const title = isEn ? guide.title.en : guide.title.ko;
  const description = isEn ? guide.description.en : guide.description.ko;
  const pagePath = isEn ? `/en/guides/${guide.slug}` : `/guides/${guide.slug}`;
  const pageUrl = absoluteUrl(pagePath);
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const webpageId = `${pageUrl}#webpage`;
  const articleId = `${pageUrl}#article`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: pageUrl,
      name: title,
      description,
      isPartOf: { "@id": websiteId },
      inLanguage: isEn ? "en-US" : "ko-KR",
      primaryEntityOfPage: { "@id": articleId },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isEn ? "Home" : "홈",
          item: isEn ? absoluteUrl("/en") : SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: isEn ? "Guides" : "가이드",
          item: isEn ? absoluteUrl("/en/guides") : absoluteUrl("/guides"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "Article",
      "@id": articleId,
      headline: title,
      description,
      datePublished: guide.publishedAt,
      dateModified: dateModified || guide.publishedAt,
      inLanguage: isEn ? "en-US" : "ko-KR",
      mainEntityOfPage: { "@id": webpageId },
      author: { "@id": orgId },
      publisher: { "@id": orgId },
      isPartOf: { "@id": websiteId },
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
      isPartOf: { "@id": webpageId },
    });
  }

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
