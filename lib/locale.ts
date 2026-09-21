/**
 * Shared locale helpers for the language switcher and display names.
 * CTO owns /en route trees, hreflang, and sitemap — this file only
 * maps paths and picks model_name vs model_name_en for the UI.
 */

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
 * Locale href that stays compatible with today's /en /ja stubs
 * and with future nested /en/... routes from CTO.
 *
 * - Korean always returns the unprefixed path.
 * - Switching between en/ja preserves the rest of the path.
 * - From Korean content pages, EN/JA go to the locale root so
 *   stub pages do not 404 before nested routes exist.
 * - Guides/blog/models keep their path when switching KO → EN.
 */
export function hrefForLocale(code: LocaleCode, pathname: string): string {
  const current = getLocaleFromPath(pathname);
  const rest = stripLocalePrefix(pathname);

  if (code === "ko") return rest || "/";

  if (current !== "ko") {
    return rest === "/" ? `/${code}` : `/${code}${rest}`;
  }

  if (
    rest.startsWith("/models/") ||
    rest === "/guides" ||
    rest.startsWith("/guides/") ||
    rest === "/blog" ||
    rest.startsWith("/blog/")
  ) {
    if (code === "ja") return "/ja";
    return `/${code}${rest}`;
  }

  return `/${code}`;
}

/** Compact hreflang map for Metadata.alternates.languages (path values). */
export function hreflangLanguages(
  koPath: string,
  enPath: string
): Record<string, string> {
  return {
    ko: koPath,
    en: enPath,
    "x-default": koPath,
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
