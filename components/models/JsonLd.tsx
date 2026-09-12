import { SITE_URL } from "@/lib/site";
import { absoluteUrl, type FaqItem } from "@/lib/seo";

function additionalProperties(model: any) {
  const props: { "@type": "PropertyValue"; name: string; value: string }[] = [];
  const push = (name: string, value: unknown, suffix = "") => {
    if (value == null || value === "") return;
    props.push({ "@type": "PropertyValue", name, value: `${value}${suffix}` });
  };
  push("공식 주행거리", model.range_official, "km");
  push("최고 속도", model.max_speed, "km/h");
  push("정격 출력", model.motor_power_rated, "W");
  push("최대 출력", model.motor_power_peak, "W");
  push("배터리", model.battery_wh, "Wh");
  if (model.nominal_voltage && model.battery_capacity) {
    push("배터리 상세", `${model.nominal_voltage}V ${model.battery_capacity}Ah`);
  }
  push("무게", model.weight, "kg");
  push("최대 하중", model.max_load, "kg");
  push("타이어", model.tire_size, "인치");
  push("브레이크", model.brake_type);
  push("서스펜션", model.suspension_type);
  push("출시 연도", model.release_year);
  if (model.pm_score != null) push("퍼모 스코어", model.pm_score);
  return props;
}

export function JsonLd({
  model,
  faqs,
}: {
  model: any;
  faqs: FaqItem[];
}) {
  const validUntilYear = new Date().getFullYear() + 1;
  const pageUrl = absoluteUrl(`/models/${model.slug}`);
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const webpageId = `${pageUrl}#webpage`;
  const productId = `${pageUrl}#product`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: "퍼모위키",
      url: SITE_URL,
      description:
        "퍼스널 모빌리티 중고 시세·스펙·고질병·직거래 체크리스트 정보 사이트",
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_URL,
      name: "퍼모위키",
      inLanguage: "ko-KR",
      publisher: { "@id": orgId },
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: pageUrl,
      name: `${model.manufacturer} ${model.model_name} 중고 시세·스펙`,
      isPartOf: { "@id": websiteId },
      about: { "@id": productId },
      inLanguage: "ko-KR",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "홈",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: model.model_name,
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "Product",
      "@id": productId,
      name: `${model.manufacturer} ${model.model_name}`,
      image: model.image_url ? [model.image_url] : undefined,
      description:
        model.one_line_summary ||
        `${model.model_name} 상세 스펙 및 중고 시세`,
      sku: model.slug,
      brand: {
        "@type": "Brand",
        name: model.manufacturer,
      },
      category: model.category,
      additionalProperty: additionalProperties(model),
      ...(model.used_price_min &&
        model.used_price_max && {
          offers: {
            "@type": "AggregateOffer",
            url: pageUrl,
            priceCurrency: "KRW",
            lowPrice: model.used_price_min,
            highPrice: model.used_price_max,
            offerCount: 1,
            itemCondition: "https://schema.org/UsedCondition",
            availability: model.is_discontinued
              ? "https://schema.org/Discontinued"
              : "https://schema.org/InStock",
            priceValidUntil: `${validUntilYear}-12-31`,
            seller: { "@id": orgId },
          },
        }),
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
