/**
 * Pure locale/URL routing helpers shared by middleware, LanguageSwitcher and
 * metadata. No runtime imports so they can be tested with plain `node --test`.
 */

export type RoutingLocale = "ko" | "en";

/**
 * Content paths that have a real `/en` route in this app.
 * Blog has no `/en/blog` route — mapping it produced a 404.
 */
export function hasEnglishRoute(koPath: string): boolean {
  return (
    koPath.startsWith("/models/") ||
    koPath === "/guides" ||
    koPath.startsWith("/guides/")
  );
}

/**
 * 첫 화면만 언어를 자동 선택한다. 명시적인 본문 주소는 보존한다.
 * Returns null when the request should stay on its URL.
 */
export function autoLocaleRedirectPath(
  preferred: RoutingLocale,
  pathname: string
): string | null {
  if (preferred === "en" && (pathname === "/" || pathname === "")) {
    return "/en";
  }
  if (preferred === "ko" && (pathname === "/en" || pathname === "/en/")) {
    return "/";
  }
  return null;
}

/**
 * Search, AI-search and link-preview agents keep the URL they request
 * (no KO↔EN bounce). Lower-case substrings of the User-Agent.
 * AI agents: OpenAI (OAI-SearchBot, ChatGPT-User, GPTBot),
 * Perplexity (PerplexityBot, Perplexity-User),
 * Anthropic (ClaudeBot, Claude-SearchBot, Claude-User).
 */
export const CRAWLER_UA_MARKERS: readonly string[] = [
  "googlebot",
  "google-inspectiontool",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandex",
  "applebot",
  "naver",
  "yeti",
  "daumoa",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "bytespider",
  "petalbot",
  "semrushbot",
  "ahrefsbot",
  "gptbot",
  "claudebot",
  "oai-searchbot",
  "chatgpt-user",
  "perplexitybot",
  "perplexity-user",
  "claude-searchbot",
  "claude-user",
];

export function isSearchCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_MARKERS.some((marker) => ua.includes(marker));
}

/**
 * Route params may arrive percent-encoded (e.g. `Xiaomi%20Electric…`).
 * Decode once; keep the raw value when it is not valid percent-encoding.
 * No published slug contains a literal `%` (checked 2026-10-29), so a second
 * decode of an already-decoded value is a no-op.
 */
export function decodeSlugParam(raw: string): string {
  if (!raw.includes("%")) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** URL path for a model page; the slug is encoded as one path segment. */
export function modelPath(slug: string, locale: RoutingLocale): string {
  const segment = encodeURIComponent(slug);
  return locale === "en" ? `/en/models/${segment}` : `/models/${segment}`;
}
