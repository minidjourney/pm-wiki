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
  locale = "ko",
}: {
  model: any;
  faqs: FaqItem[];
  locale?: "ko" | "en";
}) {
  const isEn = locale === "en";
  const validUntilYear = new Date().getFullYear() + 1;
  const pageUrl = absoluteUrl(
    isEn ? `/en/models/${model.slug}` : `/models/${model.slug}`
  );
  const homeUrl = isEn ? absoluteUrl("/en") : SITE_URL;
  const orgId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const webpageId = `${pageUrl}#webpage`;
  const productId = `${pageUrl}#product`;

  const usedMin = isEn ? model.used_price_min_usd : model.used_price_min;
  const usedMax = isEn ? model.used_price_max_usd : model.used_price_max;
  const hasUsedOffer =
    usedMin != null &&
    usedMax != null &&
    Number(usedMin) > 0 &&
    Number(usedMax) > 0;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: isEn ? "Pumo Wiki" : "퍼모위키",
      url: SITE_URL,
      description: isEn
        ? "Personal mobility used prices, specs, known issues, and buying checklists"
        : "퍼스널 모빌리티 중고 시세·스펙·고질병·직거래 체크리스트 정보 사이트",
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: SITE_URL,
      name: isEn ? "Pumo Wiki" : "퍼모위키",
      inLanguage: isEn ? "en-US" : "ko-KR",
      publisher: { "@id": orgId },
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: pageUrl,
      name: isEn
        ? `${model.manufacturer} ${model.model_name} used price & specs`
        : `${model.manufacturer} ${model.model_name} 중고 시세·스펙`,
      isPartOf: { "@id": websiteId },
      about: { "@id": productId },
      inLanguage: isEn ? "en-US" : "ko-KR",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isEn ? "Home" : "홈",
          item: homeUrl,
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
        (isEn
          ? `${model.model_name} specs and used fair price`
          : `${model.model_name} 상세 스펙 및 중고 시세`),
      sku: model.slug,
      brand: {
        "@type": "Brand",
        name: model.manufacturer,
      },
      category: model.category,
      additionalProperty: additionalProperties(model),
      ...(hasUsedOffer
        ? {
            offers: {
              "@type": "AggregateOffer",
              url: pageUrl,
              priceCurrency: isEn ? "USD" : "KRW",
              lowPrice: usedMin,
              highPrice: usedMax,
              offerCount: 1,
              itemCondition: "https://schema.org/UsedCondition",
              availability: model.is_discontinued
                ? "https://schema.org/Discontinued"
                : "https://schema.org/InStock",
              priceValidUntil: `${validUntilYear}-12-31`,
              seller: { "@id": orgId },
            },
          }
        : {}),
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
