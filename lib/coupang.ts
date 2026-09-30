/** Coupang Partners (KO locale only). Public affiliate URLs + required disclosure. */

export const COUPANG_DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

const DEFAULT_TRACKING_CODE = "AF0520396";

/** Sticky A/B cookie: per-user variant assignment (~30d). */
export const COUPANG_AB_COOKIE = "pmwiki_coupang_ab";
export const COUPANG_AB_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

/** Future placement chrome keys — UI handled by design; today only sets data attrs. */
export type CoupangPlacement = "inline" | "rail-left" | "rail-right" | "bottom";

/** 1차 승인·노출용: 충전기/소모품 위주 2~3개 (순환). */
export type CoupangOffer = {
  textHref: string;
  bannerHref: string;
  bannerSrc: string;
  bannerAlt: string;
  /** Legacy secondary label; prefer `ctaLabel` for the primary button. */
  textLabel: string;
  /** Short benefit hook under the title (CTR). Optional for CTO category sets. */
  benefitLine?: string;
  /** Primary CTA button copy. Defaults to "쿠팡에서 보기" in the slot UI. */
  ctaLabel?: string;
};

export const COUPANG_OFFERS: CoupangOffer[] = [
  {
    textHref: "https://link.coupang.com/a/hpxf2XvAHY",
    bannerHref: "https://link.coupang.com/a/hpxgtxeVIz",
    bannerSrc:
      "https://image3.coupangcdn.com/image/affiliate/banner/d8db1ecba903922cf6872b9f816ae774@2x.jpg",
    bannerAlt: "전동킥보드·전기자전거 배터리 충전기 (48V용)",
    textLabel: "쿠팡에서 보기",
    benefitLine: "48V 호환 · 배터리 충전",
    ctaLabel: "쿠팡에서 보기",
  },
  {
    textHref: "https://link.coupang.com/a/hpxhNWAC1Q",
    bannerHref: "https://link.coupang.com/a/hpxh99Ql8S",
    bannerSrc:
      "https://img1c.coupangcdn.com/image/affiliate/banner/f0566bd26410bf202f721b7c586ff0b3@2x.jpg",
    bannerAlt: "전동킥보드·전기자전거 멀티 전압 충전기",
    textLabel: "쿠팡에서 보기",
    benefitLine: "멀티 전압 · 폭넓은 호환",
    ctaLabel: "쿠팡에서 보기",
  },
  {
    textHref: "https://link.coupang.com/a/hpxiNstbKC",
    bannerHref: "https://link.coupang.com/a/hpxiYzPhQW",
    bannerSrc:
      "https://image7.coupangcdn.com/image/affiliate/banner/2a670e40718663d33230b6f92f0a06a3@2x.jpg",
    bannerAlt: "나인봇·세그웨이용 배터리 충전기",
    textLabel: "쿠팡에서 보기",
    benefitLine: "나인봇·세그웨이 전용",
    ctaLabel: "쿠팡에서 보기",
  },
];

/**
 * A/B offer sets. Each charger offer is its own sticky variant (equal weight).
 * Raise `weight` later to bias traffic toward efficient creatives — we only choose
 * which offer set to show; Coupang's own recommendation logic is untouched.
 */
export type CoupangVariant = {
  id: string;
  weight: number;
  /** Appended as `subId` on outbound Partners links for reporting. */
  subId: string;
  offers: CoupangOffer[];
};

export const COUPANG_VARIANTS: CoupangVariant[] = [
  {
    id: "charger-48v",
    weight: 1,
    subId: "ab_charger_48v",
    offers: [COUPANG_OFFERS[0]!],
  },
  {
    id: "charger-multi",
    weight: 1,
    subId: "ab_charger_multi",
    offers: [COUPANG_OFFERS[1]!],
  },
  {
    id: "charger-ninebot",
    weight: 1,
    subId: "ab_charger_ninebot",
    offers: [COUPANG_OFFERS[2]!],
  },
];

export function getCoupangTrackingCode(): string {
  return process.env.NEXT_PUBLIC_COUPANG_TRACKING_CODE?.trim() || DEFAULT_TRACKING_CODE;
}

function hashString(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function positiveWeightVariants(): CoupangVariant[] {
  const list = COUPANG_VARIANTS.filter((v) => v.weight > 0);
  if (list.length === 0) {
    throw new Error("COUPANG_VARIANTS has no positive-weight entries");
  }
  return list;
}

function pickByTicket(list: CoupangVariant[], ticket: number): CoupangVariant {
  const total = list.reduce((sum, v) => sum + v.weight, 0);
  let t = ((ticket % total) + total) % total;
  let cursor = 0;
  for (const v of list) {
    cursor += v.weight;
    if (t < cursor) return v;
  }
  return list[list.length - 1]!;
}

export function getCoupangVariantById(id: string): CoupangVariant | undefined {
  return COUPANG_VARIANTS.find((v) => v.id === id);
}

/**
 * Weighted pick.
 * - `random: true` → Math.random (client first-assign only)
 * - else seed hash, or UTC-day bucket (SSR-safe, no hydration flicker)
 */
export function pickWeightedCoupangVariant(
  seed?: string,
  opts?: { random?: boolean },
): CoupangVariant {
  const list = positiveWeightVariants();
  const total = list.reduce((sum, v) => sum + v.weight, 0);

  if (opts?.random) {
    return pickByTicket(list, Math.floor(Math.random() * total));
  }
  if (seed && seed.length > 0) {
    return pickByTicket(list, hashString(seed));
  }
  const day = Math.floor(Date.now() / 86_400_000);
  return pickByTicket(list, day);
}

export type PickCoupangVariantInput = {
  /** Raw value of `pmwiki_coupang_ab` when present. */
  cookie?: string | null;
  /** Optional seed for SSR / first-paint fallback (slug alone is NOT user-sticky). */
  seed?: string;
  /** When true and cookie misses, use Math.random for a fresh sticky assign. */
  random?: boolean;
};

export type PickCoupangVariantResult = {
  variant: CoupangVariant;
  offer: CoupangOffer;
  fromCookie: boolean;
  /** Caller should persist `variant.id` when true (new assign or refresh). */
  shouldSetCookie: boolean;
};

/**
 * Sticky per-user variant: cookie wins if it matches a known id;
 * otherwise weighted pick (random on client first-assign, else seed/day).
 */
export function pickCoupangVariant({
  cookie,
  seed,
  random = false,
}: PickCoupangVariantInput = {}): PickCoupangVariantResult {
  const trimmed = cookie?.trim();
  if (trimmed) {
    const known = getCoupangVariantById(trimmed);
    if (known) {
      const offer = known.offers[0] ?? pickCoupangOffer(seed);
      return {
        variant: known,
        offer,
        fromCookie: true,
        shouldSetCookie: true, // refresh max-age
      };
    }
  }

  const variant = pickWeightedCoupangVariant(seed, { random });
  const offer = variant.offers[0] ?? pickCoupangOffer(seed);
  return {
    variant,
    offer,
    fromCookie: false,
    shouldSetCookie: true,
  };
}

/** Append / overwrite `subId` on a Coupang Partners URL. */
export function appendCoupangSubId(href: string, subId: string): string {
  if (!subId) return href;
  try {
    const url = new URL(href);
    url.searchParams.set("subId", subId);
    return url.toString();
  } catch {
    const sep = href.includes("?") ? "&" : "?";
    return `${href}${sep}subId=${encodeURIComponent(subId)}`;
  }
}

/** Clone an offer with subId stamped on outbound hrefs. */
export function offerWithSubId(offer: CoupangOffer, subId: string): CoupangOffer {
  return {
    ...offer,
    textHref: appendCoupangSubId(offer.textHref, subId),
    bannerHref: appendCoupangSubId(offer.bannerHref, subId),
  };
}

/** Read sticky A/B cookie (browser only). */
export function readCoupangAbCookie(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${COUPANG_AB_COOKIE}=`;
  const hit = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix));
  if (!hit) return null;
  return decodeURIComponent(hit.slice(prefix.length)) || null;
}

/** Persist sticky A/B variant id (~30d, Lax, path=/). */
export function writeCoupangAbCookie(variantId: string): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COUPANG_AB_COOKIE}=${encodeURIComponent(variantId)}; Max-Age=${COUPANG_AB_COOKIE_MAX_AGE_SEC}; Path=/; SameSite=Lax${secure}`;
}

/** Stable pick for SSR (no hydration flicker). Optional seed = slug / guide id. */
export function pickCoupangOffer(seed?: string): CoupangOffer {
  const list = COUPANG_OFFERS;
  if (list.length === 0) {
    throw new Error("COUPANG_OFFERS is empty");
  }
  if (seed && seed.length > 0) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return list[h % list.length]!;
  }
  const day = Math.floor(Date.now() / 86_400_000);
  return list[day % list.length]!;
}

export function isCoupangPartnersEnabled(): boolean {
  return Boolean(getCoupangTrackingCode() && COUPANG_OFFERS.length > 0);
}
