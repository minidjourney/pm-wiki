/** Coupang Partners (KO locale only). Public affiliate URLs + required disclosure. */

export const COUPANG_DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

const DEFAULT_TRACKING_CODE = "AF0520396";

/** Sticky A/B cookie: per-user variant assignment (~30d). */
export const COUPANG_AB_COOKIE = "pmwiki_coupang_ab";
export const COUPANG_AB_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

/** Placement chrome keys. Also offsets which creative a slot renders. */
export type CoupangPlacement = "inline" | "rail-left" | "rail-right" | "bottom";

/**
 * Product family for a Partners creative.
 * Add a union member when a new set is introduced. Only `charger` has real
 * link.coupang.com URLs today.
 */
export type CoupangCategory = "charger" | "helmet" | "consumable";

/** 1차 승인·노출용: 충전기 3개. 헬멧·소모품은 실링크가 오면 세트에 추가. */
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
  /** Which set this creative belongs to. Omitted offers are treated as charger. */
  category?: CoupangCategory;
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
    category: "charger",
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
    category: "charger",
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
    category: "charger",
  },
];

/**
 * Category pools keyed for expansion.
 *
 * Paste real Partners links (text + banner href + Coupang CDN banner) from
 * COO/user into `helmet` (헬멧·보호구) or `consumable` (타이어·튜브·소모품).
 * Do not invent link.coupang.com or banner CDN URLs.
 *
 * Empty arrays fall back to the charger pool inside `resolveOfferPool`.
 */
export const COUPANG_OFFER_SETS: Record<CoupangCategory, readonly CoupangOffer[]> = {
  charger: COUPANG_OFFERS,
  helmet: [],
  consumable: [],
};

/**
 * Intended category per slot. Until helmet/consumable have real links, those
 * slots fall back to the charger rotation with `PLACEMENT_OFFSET` so
 * inline ≠ rail-left ≠ bottom on one page.
 */
export const COUPANG_PLACEMENT_CATEGORY: Record<CoupangPlacement, CoupangCategory> = {
  inline: "charger",
  "rail-left": "helmet",
  "rail-right": "consumable",
  bottom: "consumable",
};

/**
 * Offset into the active pool. Same seed shifts every slot together;
 * the offset keeps them apart.
 *
 * With only the 3 charger creatives, offset 3 aliases inline (mod 3) so
 * rail-right matches the in-flow unit until a 4th offer or a non-empty
 * helmet/consumable set exists. inline (0), rail-left (1) and bottom (2)
 * stay distinct — the pairs that render together on mobile, plus the gutters.
 */
const PLACEMENT_OFFSET: Record<CoupangPlacement, number> = {
  inline: 0,
  "rail-left": 1,
  "rail-right": 3,
  bottom: 2,
};

/**
 * A/B offer sets. Cookie still assigns one sticky variant (weights + subId).
 * `offers` is a rotation pool of the real charger creatives, hero first, so
 * placements can cycle distinct banners without a second affiliate link.
 * Raise `weight` later to bias traffic toward efficient creatives — we only
 * choose which offer set to show; Coupang's own recommendation logic is untouched.
 */
export type CoupangVariant = {
  id: string;
  weight: number;
  /** Appended as `subId` on outbound Partners links for reporting. */
  subId: string;
  offers: CoupangOffer[];
};

function rotateOffers(start: number): CoupangOffer[] {
  const list = COUPANG_OFFERS;
  const n = list.length;
  if (n === 0) return [];
  const s = ((start % n) + n) % n;
  return [...list.slice(s), ...list.slice(0, s)];
}

export const COUPANG_VARIANTS: CoupangVariant[] = [
  {
    id: "charger-48v",
    weight: 1,
    subId: "ab_charger_48v",
    offers: rotateOffers(0),
  },
  {
    id: "charger-multi",
    weight: 1,
    subId: "ab_charger_multi",
    offers: rotateOffers(1),
  },
  {
    id: "charger-ninebot",
    weight: 1,
    subId: "ab_charger_ninebot",
    offers: rotateOffers(2),
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

export function normalizeCoupangPlacement(
  placement?: string | null,
): CoupangPlacement {
  if (
    placement === "inline" ||
    placement === "rail-left" ||
    placement === "rail-right" ||
    placement === "bottom"
  ) {
    return placement;
  }
  return "inline";
}

/**
 * Pool for a slot. A non-empty category set wins (future helmet/tire links).
 * An empty set falls back to this variant's charger rotation (hero first).
 */
export function resolveOfferPool(
  variant: CoupangVariant,
  placement: CoupangPlacement | string = "inline",
): readonly CoupangOffer[] {
  const place = normalizeCoupangPlacement(placement);
  const category = COUPANG_PLACEMENT_CATEGORY[place];
  const categoryOffers = COUPANG_OFFER_SETS[category];
  if (categoryOffers.length > 0) return categoryOffers;
  if (variant.offers.length > 0) return variant.offers;
  return COUPANG_OFFER_SETS.charger;
}

/**
 * Creative for one slot.
 * Sticky variant supplies subId + rotation hero; `placement` offsets into the
 * pool so one page can show up to 3 distinct charger creatives. Hashing `seed`
 * rotates the whole page together (SSR-stable). Offsets keep inline, rail-left,
 * and bottom on different creatives when the pool has at least 3 offers.
 */
export function pickOfferForPlacement(
  variant: CoupangVariant,
  placement: CoupangPlacement | string = "inline",
  seed?: string,
): CoupangOffer {
  const place = normalizeCoupangPlacement(placement);
  const category = COUPANG_PLACEMENT_CATEGORY[place];
  const categoryOffers = COUPANG_OFFER_SETS[category];
  const usingCategorySet = categoryOffers.length > 0;
  const pool = usingCategorySet
    ? categoryOffers
    : variant.offers.length > 0
      ? variant.offers
      : COUPANG_OFFER_SETS.charger;
  if (pool.length === 0) {
    throw new Error("Coupang offer pool is empty");
  }
  const seedHash = seed && seed.length > 0 ? hashString(seed) : 0;
  // Variant rotation already encodes A/B on the charger fallback pool.
  // A real category set is shared, so mix the variant id in as well.
  const variantBias = usingCategorySet ? hashString(variant.id) : 0;
  const index =
    (seedHash + variantBias + PLACEMENT_OFFSET[place]) % pool.length;
  return pool[index]!;
}

export type PickCoupangVariantInput = {
  /** Raw value of `pmwiki_coupang_ab` when present. */
  cookie?: string | null;
  /** Optional seed for SSR / first-paint fallback (slug alone is NOT user-sticky). */
  seed?: string;
  /** When true and cookie misses, use Math.random for a fresh sticky assign. */
  random?: boolean;
  /** Slot key. Offsets the creative inside the variant pool. */
  placement?: CoupangPlacement | string;
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
 * The offer itself is placement-aware (`pickOfferForPlacement`).
 */
export function pickCoupangVariant({
  cookie,
  seed,
  random = false,
  placement = "inline",
}: PickCoupangVariantInput = {}): PickCoupangVariantResult {
  const trimmed = cookie?.trim();
  if (trimmed) {
    const known = getCoupangVariantById(trimmed);
    if (known) {
      return {
        variant: known,
        offer: pickOfferForPlacement(known, placement, seed),
        fromCookie: true,
        shouldSetCookie: true, // refresh max-age
      };
    }
  }

  const variant = pickWeightedCoupangVariant(seed, { random });
  return {
    variant,
    offer: pickOfferForPlacement(variant, placement, seed),
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
