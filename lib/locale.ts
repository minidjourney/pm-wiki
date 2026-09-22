/**
 * Shared locale helpers: path mapping, display names, hreflang, category labels.
 * Guides/blog/models keep their path when switching KO → EN.
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

  // code === "en" — catalog, models, guides, blog
  if (rest === "/") return "/en";
  if (
    rest.startsWith("/models/") ||
    rest === "/guides" ||
    rest.startsWith("/guides/") ||
    rest === "/blog" ||
    rest.startsWith("/blog/")
  ) {
    return `/en${rest}`;
  }
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

function brandTokens(value: string): string[] {
  return value
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** KO↔EN brand aliases for overlap / prefix stripping (Hangul + Latin). */
const BRAND_TOKEN_ALIASES: Record<string, string[]> = {
  ninebot: ["ninebot", "나인봇"],
  "나인봇": ["ninebot", "나인봇"],
  segway: ["segway", "세그웨이"],
  "세그웨이": ["segway", "세그웨이"],
  xiaomi: ["xiaomi", "샤오미"],
  "샤오미": ["xiaomi", "샤오미"],
  dualtron: ["dualtron", "듀얼트론"],
  "듀얼트론": ["dualtron", "듀얼트론"],
};

function brandTokenKeys(token: string): string[] {
  const raw = token.toLowerCase();
  return BRAND_TOKEN_ALIASES[raw] ?? BRAND_TOKEN_ALIASES[token] ?? [raw];
}

function brandTokensOverlap(
  left: string[],
  right: string[]
): boolean {
  if (left.length !== right.length) return false;
  return left.every((lt, i) => {
    const a = new Set(brandTokenKeys(lt));
    return brandTokenKeys(right[i]).some((k) => a.has(k));
  });
}

/** Strip leading manufacturer (full or token/alias overlap) from a display name. */
export function displayModelNameWithoutBrand(
  model: NamedModel,
  locale: LocaleCode = "ko"
): string {
  const name = displayModelName(model, locale).trim();
  const mfr = model.manufacturer?.trim();
  if (!mfr) return name;

  const fullStrip = name
    .replace(new RegExp(`^${escapeRegExp(mfr)}\\s+`, "i"), "")
    .trim();
  if (fullStrip !== name) return fullStrip || name;

  const mfrAliasSet = new Set(brandTokens(mfr).flatMap(brandTokenKeys));
  const parts = brandTokens(name);
  let i = 0;
  while (i < parts.length) {
    if (brandTokenKeys(parts[i]).some((k) => mfrAliasSet.has(k))) {
      i += 1;
      continue;
    }
    break;
  }
  if (i > 0) {
    const stripped = parts.slice(i).join(" ").trim();
    return stripped || name;
  }
  return name;
}

/**
 * Title / OG label: manufacturer once — including partial overlaps like
 * manufacturer "세그웨이 나인봇" + name "나인봇 맥스 G2".
 */
export function brandedModelTitle(
  model: NamedModel,
  locale: LocaleCode = "ko"
): string {
  const name = displayModelName(model, locale).trim();
  const mfr = model.manufacturer?.trim();
  if (!mfr) return name;
  if (name.toLowerCase().startsWith(mfr.toLowerCase())) return name;

  const mfrParts = brandTokens(mfr);
  const nameParts = brandTokens(name);

  // Full brand already leading the name (token/alias match) → keep name.
  if (
    nameParts.length >= mfrParts.length &&
    brandTokensOverlap(mfrParts, nameParts.slice(0, mfrParts.length))
  ) {
    return name;
  }

  // Partial overlap: manufacturer "세그웨이 나인봇" + name "나인봇 맥스 G2"
  let overlap = 0;
  const max = Math.min(mfrParts.length, nameParts.length);
  for (let k = 1; k <= max; k += 1) {
    if (brandTokensOverlap(mfrParts.slice(-k), nameParts.slice(0, k))) {
      overlap = k;
    }
  }
  if (overlap > 0) {
    const mfrHead = mfrParts.slice(0, -overlap).join(" ");
    return mfrHead ? `${mfrHead} ${name}` : name;
  }

  return `${mfr} ${name}`;
}

export const CATEGORY_LABELS: Record<LocaleCode, Record<string, string>> = {
  ko: {
    all: "전체",
    kickboard: "전동킵보드",
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
 * Hide sub_model in H1/cards/search when the display name (or related EN/KO
 * names) already covers it — including Hangul display + Latin sub_model.
 */
export function shouldShowSubModel(
  displayName: string,
  subModel?: string | null,
  relatedNames: Array<string | null | undefined> = []
): boolean {
  const sub = subModel?.trim();
  if (!sub) return false;

  const haystacks = [displayName, ...relatedNames]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s));

  const subLower = sub.toLowerCase();
  for (const h of haystacks) {
    if (h.toLowerCase().includes(subLower)) return false;
  }

  const compact = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "");
  const subCompact = compact(sub);
  if (subCompact) {
    for (const h of haystacks) {
      if (compact(h).includes(subCompact)) return false;
    }
  }

  // Latin/digit tokens (e.g. "Max G2", "X7 Pro") against KO display + related EN names.
  // Soft style words (Max/Pro/Plus) are ignored when a harder model-code token matches.
  // Hangul style words (맥스/프로/…) count as covering Latin soft tokens.
  const significant =
    sub.match(/[A-Za-z0-9]+/g)?.map((t) => t.toLowerCase()).filter((t) => t.length >= 2) ??
    [];
  if (significant.length > 0) {
    const soft = new Set([
      "pro",
      "max",
      "plus",
      "lite",
      "mini",
      "se",
      "ev",
      "s",
      "r",
    ]);
    const softHangul: Record<string, string[]> = {
      max: ["맥스"],
      pro: ["프로"],
      plus: ["플러스"],
      lite: ["라이트"],
      mini: ["미니"],
    };
    const hard = significant.filter((t) => !soft.has(t) || /\d/.test(t));
    const tokensToCheck = hard.length > 0 ? hard : significant;
    const combinedTokens = new Set(
      haystacks.flatMap((h) =>
        (h.match(/[A-Za-z0-9]+/g) ?? []).map((t) => t.toLowerCase())
      )
    );
    const combinedLatin = haystacks
      .map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, ""))
      .join("");
    const combinedHangul = haystacks.join("");
    const tokenCovered = (t: string) => {
      if (combinedTokens.has(t) || combinedLatin.includes(t)) return true;
      const hangul = softHangul[t];
      return Boolean(hangul?.some((h) => combinedHangul.includes(h)));
    };
    if (tokensToCheck.every(tokenCovered)) {
      return false;
    }
  }

  return true;
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

/** Preference cookie set by LanguageSwitcher; middleware never overrides it. */
export const LOCALE_COOKIE_NAME = "pmwiki_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type AutoLocaleCode = "ko" | "en";

/** English-majority / English-official regions (ISO 3166-1 alpha-2). */
export const ENGLISH_SPEAKING_REGIONS = new Set([
  "US",
  "GB",
  "CA",
  "AU",
  "NZ",
  "IE",
  "ZA",
  "SG",
  "PH",
  "IN",
  "HK",
]);

/**
 * Parse Accept-Language → ko | en | null (no strong preference).
 * Matches `en` / `en-*` and `ko` / `ko-*`. Highest-q among ko/en wins.
 */
export function detectLocaleFromAcceptLanguage(
  header: string | null | undefined
): AutoLocaleCode | null {
  if (!header) return null;
  const languages = header
    .toLowerCase()
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = rawTag.trim();
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const quality = qParam ? Number.parseFloat(qParam.split("=")[1] ?? "1") : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of languages) {
    if (tag === "ko" || tag.startsWith("ko-")) return "ko";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return null;
}

/**
 * Auto-locale without cookie:
 * 1) Accept-Language ko* → KO; en* → EN
 * 2) Else country KR → KO; English-speaking region → EN
 * 3) Default KO
 */
export function detectPreferredAutoLocale(opts: {
  acceptLanguage?: string | null;
  country?: string | null;
}): AutoLocaleCode {
  const fromLang = detectLocaleFromAcceptLanguage(opts.acceptLanguage);
  if (fromLang) return fromLang;

  const country = opts.country?.trim().toUpperCase();
  if (country === "KR") return "ko";
  if (country && ENGLISH_SPEAKING_REGIONS.has(country)) return "en";
  return "ko";
}

/** Client-side helper: persist LanguageSwitcher choice. */
export function setLocaleCookie(code: LocaleCode) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${code};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
}

/** Read LanguageSwitcher preference (client only). */
export function getLocaleCookie(): LocaleCode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );
  const value = match?.[1];
  if (value === "ko" || value === "en" || value === "ja") return value;
  return null;
}

/**
 * UI locale for client chrome.
 * Prefixed `/en` / `/ja` win; shared routes like `/compare` honor the cookie.
 */
export function resolveClientLocale(pathname: string): LocaleCode {
  const fromPath = getLocaleFromPath(pathname);
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ja" || pathname.startsWith("/ja/")) return "ja";
  if (pathname === "/compare" || pathname.startsWith("/compare/")) {
    return getLocaleCookie() ?? fromPath;
  }
  return fromPath;
}
