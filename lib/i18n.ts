import { SITE_URL } from "@/lib/site";

export type Locale = "ko" | "en" | "ja";

export const LOCALES = ["ko", "en", "ja"] as const;

/** Display name: EN prefers model_name_en, falls back to model_name. */
export function getModelDisplayName(
  model: { model_name: string; model_name_en?: string | null },
  locale: Locale = "ko"
): string {
  if (locale === "en") {
    const en = model.model_name_en?.trim();
    if (en) return en;
  }
  return model.model_name;
}

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ja" || pathname.startsWith("/ja/")) return "ja";
  return "ko";
}

/** Strip /en or /ja prefix → content path (always starts with /). */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en" || pathname === "/ja") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  if (pathname.startsWith("/ja/")) return pathname.slice(3) || "/";
  return pathname || "/";
}

/**
 * Map path between locales.
 * Supports `/`↔`/en` and `/models/x`↔`/en/models/x`.
 * JA remains stub-only (`/ja`). Unknown EN paths fall back to `/en`.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  if (target === "ja") return "/ja";

  const contentPath = stripLocalePrefix(pathname);

  if (target === "en") {
    if (contentPath === "/") return "/en";
    if (contentPath.startsWith("/models/")) return `/en${contentPath}`;
    return "/en";
  }

  // target === "ko"
  return contentPath || "/";
}

/** Prefix a content path for a locale (e.g. `/models/x` + en → `/en/models/x`). */
export function localePath(contentPath: string, locale: Locale): string {
  const path = contentPath.startsWith("/") ? contentPath : `/${contentPath}`;
  if (locale === "en") {
    if (path === "/") return "/en";
    return `/en${path}`;
  }
  if (locale === "ja") return "/ja";
  return path;
}

/** Keep `?category=` (and other query) when switching locales. */
export function withSearchParams(
  path: string,
  searchParams: URLSearchParams | { get: (k: string) => string | null; toString: () => string }
): string {
  const category = searchParams.get("category");
  // Prefer preserving category on catalog pages; otherwise preserve full query if present
  const isCatalog = path === "/" || path === "/en";
  if (isCatalog && category) {
    return `${path}?category=${encodeURIComponent(category)}`;
  }
  const qs = typeof searchParams.toString === "function" ? searchParams.toString() : "";
  if (!isCatalog && qs) return `${path}?${qs}`;
  if (isCatalog && qs) {
    // still allow category-only or full qs on catalog
    return `${path}?${qs}`;
  }
  return path;
}

export function hreflangLanguages(koPath: string, enPath: string): Record<string, string> {
  const ko = koPath.startsWith("http") ? koPath : `${SITE_URL}${koPath === "/" ? "" : koPath}`;
  const en = enPath.startsWith("http") ? enPath : `${SITE_URL}${enPath}`;
  return {
    ko,
    en,
    "x-default": ko,
  };
}

export const CATEGORY_LABELS: Record<
  Locale,
  Record<string, string>
> = {
  ko: {
    all: "전체",
    kickboard: "전동킥보드",
    ebike: "전기자전거",
    scooter: "전동스쿠터",
    unicycle: "전동 외발휠",
  },
  en: {
    all: "All",
    kickboard: "E-Kickboard",
    ebike: "E-Bike",
    scooter: "E-Scooter",
    unicycle: "E-Unicycle",
  },
  ja: {
    all: "すべて",
    kickboard: "電動キックボード",
    ebike: "電動自転車",
    scooter: "電動スクーター",
    unicycle: "電動一輪車",
  },
};
