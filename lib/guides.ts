import type { LocaleCode } from "@/lib/locale";

export type GuideSection = {
  id: string;
  title: { ko: string; en: string };
  paragraphs: { ko: string[]; en: string[] };
  checklist?: { ko: string[]; en: string[] };
};

export type Guide = {
  slug: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  publishedAt: string;
  /** Markdown body under repo root (KO editorial). */
  markdownPath?: string;
  /** Model slugs for RelatedModels rail. */
  relatedModelSlugs: string[];
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: "used-electric-kickboard-checklist",
    title: {
      ko: "중고 전동킥보드 살 때 체크리스트",
      en: "Used Electric Kickboard Buying Checklist",
    },
    description: {
      ko: "당근·중고나라 직거래 기준으로 배터리 Wh·제조일·공유킥 출신·시승·레드플래그를 순서대로 확인하는 구매 가이드. 시세는 모델 페이지 밴드로 대조하세요.",
      en: "A practical used e-kickboard buying checklist — battery Wh & age, shared-fleet origins, test ride, red flags, and how to read pmwiki price bands.",
    },
    publishedAt: "2026-09-21",
    markdownPath: "content/guides/used-electric-kickboard-checklist.md",
    relatedModelSlugs: [
      "ninebot-max-g2",
      "ninebot-max-g30-36v-15ah",
      "dualtron-mini-special-52v-21ah",
      "dualtron-togo-pro-48v-15ah",
      "xiaomi-electric-scooter-4-ultra-46-8v-12ah",
    ],
    sections: [],
  },
];

export function listGuides(): Guide[] {
  return GUIDES;
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function guidePath(slug: string, locale: LocaleCode = "ko"): string {
  const base = `/guides/${slug}`;
  return locale === "en" ? `/en${base}` : base;
}

export function guidesIndexPath(locale: LocaleCode = "ko"): string {
  return locale === "en" ? "/en/guides" : "/guides";
}
