/**
 * Shared locale helpers: path mapping, display names, hreflang, category labels.
 */

import { SITE_URL } from "@/lib/site";

export const LOCALES = [
  { code: "ko", label: "한국어", shortLabel: "한" },
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "ja", label: "日本語", shortLabel: "日" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export function getLocaleFromPath(pathname: string): LocaleCode {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ja" || pathname.startsWith("/ja/")) return "ja";
  return "ko";
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en" || pathname === "/ja") return "/";
  if (pathname.startsWith("/en/") || pathname.startsWith("/ja/")) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
}

/**
 * Map path between locales.
 * EN is live for `/` and `/models/*` → `/en`, `/en/models/*`.
 * JA remains stub-only (`/ja`).
 */
export function hrefForLocale(code: LocaleCode, pathname: string): string {
  const rest = stripLocalePrefix(pathname);

  if (code === "ko") return rest || "/";

  if (code === "ja") return "/ja";

  // code === "en" — real catalog + model routes
  if (rest === "/") return "/en";
  if (rest.startsWith("/models/")) return `/en${rest}`;
  return "/en";
}

/** Prefix a content path for a locale (`/models/x` + en → `/en/models/x`). */
export function localePath(contentPath: string, locale: LocaleCode): string {
  const path = contentPath.startsWith("/") ? contentPath : `/${contentPath}`;
  if (locale === "en") {
    if (path === "/") return "/en";
    return `/en${path}`;
  }
  if (locale === "ja") return "/ja";
  return path;
}

/** Keep `?category=` when switching locales on catalog pages. */
export function withSearchParams(
  path: string,
  searchParams: { get: (k: string) => string | null; toString?: () => string }
): string {
  const category = searchParams.get("category");
  const isCatalog = path === "/" || path === "/en";
  if (isCatalog && category) {
    return `${path}?category=${encodeURIComponent(category)}`;
  }
  const qs =
    typeof searchParams.toString === "function" ? searchParams.toString() : "";
  if (!isCatalog && qs) return `${path}?${qs}`;
  if (isCatalog && qs) return `${path}?${qs}`;
  return path;
}

export function hreflangLanguages(
  koPath: string,
  enPath: string
): Record<string, string> {
  const ko = koPath.startsWith("http")
    ? koPath
    : `${SITE_URL}${koPath === "/" ? "" : koPath}`;
  const en = enPath.startsWith("http") ? enPath : `${SITE_URL}${enPath}`;
  return {
    ko,
    en,
    "x-default": ko,
  };
}

/** Korean UI uses model_name; English routes prefer model_name_en. */
export function displayModelName(
  model: { model_name: string; model_name_en?: string | null },
  locale: LocaleCode = "ko"
): string {
  if (locale === "en") {
    const en = model.model_name_en?.trim();
    if (en) return en;
  }
  return model.model_name;
}

type NamedModel = {
  model_name: string;
  model_name_en?: string | null;
  manufacturer?: string | null;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strip leading manufacturer when the display name already includes it. */
export function displayModelNameWithoutBrand(
  model: NamedModel,
  locale: LocaleCode = "ko"
): string {
  const name = displayModelName(model, locale).trim();
  const mfr = model.manufacturer?.trim();
  if (!mfr) return name;
  const stripped = name
    .replace(new RegExp(`^${escapeRegExp(mfr)}\\s+`, "i"), "")
    .trim();
  return stripped || name;
}

/** Title / OG label: manufacturer once, even if model_name_en already includes it. */
export function brandedModelTitle(
  model: NamedModel,
  locale: LocaleCode = "ko"
): string {
  const name = displayModelName(model, locale).trim();
  const mfr = model.manufacturer?.trim();
  if (!mfr) return name;
  if (name.toLowerCase().startsWith(mfr.toLowerCase())) return name;
  return `${mfr} ${name}`;
}

export const CATEGORY_LABELS: Record<LocaleCode, Record<string, string>> = {
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

/** Prefer EN text when non-empty; otherwise KO. */
export function pickLocalizedText(
  en: string | null | undefined,
  ko: string | null | undefined
): string | null {
  const e = en?.trim();
  if (e) return e;
  const k = ko?.trim();
  return k || null;
}

/** Prefer EN string[] when non-empty; otherwise KO. Same jsonb shape. */
export function pickLocalizedStringArray(
  en: unknown,
  ko: unknown
): string[] {
  const asStrings = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  };
  const enArr = asStrings(en);
  if (enArr.length) return enArr;
  return asStrings(ko);
}

/**
 * Prefer EN array when non-empty; otherwise KO.
 * Preserves element shapes (objects or mixed) for chronic_defects / used_checklist.
 * Does not filter or reshape items — callers keep existing render/SEO adapters.
 */
export function pickLocalizedArray<T = unknown>(
  en: unknown,
  ko: unknown
): T[] {
  const asArray = (v: unknown): T[] =>
    Array.isArray(v) && v.length > 0 ? (v as T[]) : [];
  const enArr = asArray(en);
  if (enArr.length) return enArr;
  return asArray(ko);
}
