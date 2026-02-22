// components/models/JsonLd.tsx
// import type { PmModel } from "@/types/database";

export function JsonLd({ model }: { model: any }) {
  const validUntilYear = new Date().getFullYear() + 1;

  // JSON 배열 데이터를 문자열로 안전하게 변환 (에러 방지 핵심)
  const formatArrayToText = (data: any) => {
    if (!data || !Array.isArray(data)) return "정보가 업데이트 중입니다.";
    return data.map((item) => (typeof item === 'object' ? item.issue : item)).join(", ");
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${model.manufacturer} ${model.model_name}`,
    image: model.image_url ? [model.image_url] : [],
    description: model.one_line_summary || `${model.model_name} 상세 스펙 및 중고 시세`,
    sku: model.slug,
    brand: {
      "@type": "Brand",
      name: model.manufacturer,
    },
    ...(model.used_price_min && model.used_price_max && {
      offers: {
        "@type": "AggregateOffer",
        url: `https://peomowiki.com/models/${model.slug}`,
        priceCurrency: "KRW",
        lowPrice: model.used_price_min,
        highPrice: model.used_price_max,
        offerCount: 1,
        itemCondition: "https://schema.org/UsedCondition",
        priceValidUntil: `${validUntilYear}-12-31`,
      },
    }),
    ...(model.pm_score && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: model.pm_score,
        bestRating: "100", // 우리 서비스는 100점 만점이므로 수정
        reviewCount: 1,
      },
    }),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${model.model_name}의 고질병 및 주의사항은 무엇인가요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: formatArrayToText(model.chronic_defects),
        },
      },
      {
        "@type": "Question",
        name: `중고로 ${model.model_name} 구매 시 체크리스트는?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: formatArrayToText(model.used_checklist),
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}