"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COUPANG_DISCLOSURE,
  isCoupangPartnersEnabled,
  offerWithSubId,
  pickCoupangVariant,
  readCoupangAbCookie,
  writeCoupangAbCookie,
  type CoupangPlacement,
  type CoupangVariant,
  type CoupangOffer,
} from "@/lib/coupang";

type Props = {
  className?: string;
  /** Show Coupang-provided product image (helps channel-approval screenshots). */
  showBanner?: boolean;
  /** Stable rotation seed (model slug / guide id) — first-assign / SSR fallback only. */
  seed?: string;
  /**
   * Layout chrome (inline defaults):
   * - embedded — inside another card (model price band); no outer border
   * - section — guide rhythm matching RelatedModels (border-t + heading)
   * - card — standalone rounded card (default)
   *
   * Ignored when `placement` is rail-* or bottom (those set their own chrome).
   */
  variant?: "embedded" | "section" | "card";
  /**
   * Placement chrome/sizing only — does not change A/B, URLs, or tracking.
   * - inline — existing in-flow mounts (mobile + desktop)
   * - rail-left / rail-right — narrow sticky gutters (desktop lg+/xl via CoupangRails)
   * - bottom — after Related (border-t section tone)
   *
   * Sets `data-coupang-placement` (from #46). A/B cookie/weights stay in lib/coupang.
   */
  placement?: CoupangPlacement | (string & {});
};

type Resolved = {
  variant: CoupangVariant;
  offer: CoupangOffer;
};

/**
 * KO-only Coupang Partners unit: section-toned product row + required disclosure.
 * Mount only under Korean routes (`app/models`, `app/guides`) — never `/en` or `/ja`.
 *
 * A/B: sticky cookie `pmwiki_coupang_ab` picks a weighted offer-set variant;
 * outbound links get that variant's `subId`. Tracking AF0520396 unchanged.
 *
 * Banner assets from Coupang CDN are 240×480 portrait JPEGs — slots use
 * portrait aspect boxes (not square) so object-contain does not shrink to a
 * near-blank strip.
 */
export function CoupangPartnersSlot({
  className,
  showBanner = true,
  seed,
  variant = "card",
  placement = "inline",
}: Props) {
  // SSR / first paint: deterministic seed|day pick (not user-sticky).
  // Client mount: cookie wins, else weighted random + set sticky cookie.
  const initial = useMemo(() => {
    const picked = pickCoupangVariant({ seed });
    return {
      variant: picked.variant,
      offer: offerWithSubId(picked.offer, picked.variant.subId),
    } satisfies Resolved;
  }, [seed]);

  const [resolved, setResolved] = useState<Resolved>(initial);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!isCoupangPartnersEnabled()) return;
    const cookie = readCoupangAbCookie();
    const picked = pickCoupangVariant({
      cookie,
      seed,
      random: !cookie?.trim(),
    });
    if (picked.shouldSetCookie) {
      writeCoupangAbCookie(picked.variant.id);
    }
    setResolved({
      variant: picked.variant,
      offer: offerWithSubId(picked.offer, picked.variant.subId),
    });
    setImgFailed(false);
  }, [seed]);

  if (!isCoupangPartnersEnabled()) return null;

  const { offer, variant: abVariant } = resolved;
  const tracking =
    process.env.NEXT_PUBLIC_COUPANG_TRACKING_CODE || "AF0520396";
  const placementKey = String(placement || "inline");
  const isRail =
    placementKey === "rail-left" || placementKey === "rail-right";
  const isBottom = placementKey === "bottom";
  const isInline = placementKey === "inline";
  // Above-fold mobile (inline) + bottom CTA: eager so lazy never skips.
  const imgLoading = isInline || isBottom ? "eager" : "lazy";
  const headingId = `coupang-partners-heading-${placementKey}`;

  const slotAttrs = {
    "data-coupang-slot": true,
    "data-coupang-tracking": tracking,
    "data-coupang-variant": abVariant.id,
    "data-coupang-placement": placementKey,
    "data-coupang-subid": abVariant.subId,
  } as const;

  const heading = (
    <h2
      id={headingId}
      className={
        isRail
          ? "mb-2 text-sm font-semibold leading-snug text-foreground"
          : "mb-3 text-lg font-semibold text-foreground"
      }
    >
      관련 소모품·충전기
    </h2>
  );

  // Portrait banner box: Coupang CDN assets are 240×480 (1:2).
  // Rails fill most of the ~216px gutter; inline/bottom use ~120×240.
  const railImgBox =
    "h-[360px] w-full min-h-[360px] min-w-0 max-w-[192px] shrink-0 rounded-lg bg-white object-contain p-1 dark:bg-slate-950";
  const inlineImgBox =
    "h-[240px] w-[120px] min-h-[240px] min-w-[120px] shrink-0 rounded-lg bg-white object-contain p-1 dark:bg-slate-950";
  const placeholderRail =
    "flex h-[360px] w-full min-h-[360px] max-w-[192px] shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900";
  const placeholderInline =
    "flex h-[240px] w-[120px] min-h-[240px] min-w-[120px] shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900";

  const bannerImg = showBanner ? (
    imgFailed ? (
      <span
        className={isRail ? placeholderRail : placeholderInline}
        aria-hidden
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- affiliate CDN; avoid next/image remote allowlist
      <img
        src={offer.bannerSrc}
        alt={offer.bannerAlt}
        width={isRail ? 192 : 120}
        height={isRail ? 384 : 240}
        className={isRail ? railImgBox : inlineImgBox}
        loading={imgLoading}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
      />
    )
  ) : null;

  const productRow = isRail ? (
    <a
      href={offer.bannerHref}
      target="_blank"
      rel="noopener noreferrer sponsored"
      referrerPolicy="unsafe-url"
      className="flex flex-col items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
    >
      {bannerImg}
      <span className="min-w-0 text-center">
        <span className="line-clamp-3 text-xs font-medium leading-snug text-foreground">
          {offer.bannerAlt}
        </span>
        <span className="mt-2 inline-flex text-xs font-semibold text-blue-600 dark:text-blue-400">
          {offer.textLabel}
        </span>
      </span>
    </a>
  ) : (
    <a
      href={offer.bannerHref}
      target="_blank"
      rel="noopener noreferrer sponsored"
      referrerPolicy="unsafe-url"
      className="flex min-h-[256px] items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
    >
      {bannerImg}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-3 text-base font-medium leading-snug text-foreground">
          {offer.bannerAlt}
        </span>
        <span className="mt-2 inline-flex text-base font-semibold text-blue-600 dark:text-blue-400">
          {offer.textLabel}
        </span>
      </span>
    </a>
  );

  const textLink = (
    <p
      className={
        isRail
          ? "mt-2 text-center text-[11px]"
          : "mt-2.5 text-center text-sm sm:text-left"
      }
    >
      <a
        href={offer.textHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
        referrerPolicy="unsafe-url"
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {offer.textLabel}
      </a>
    </p>
  );

  const disclosure = (
    <p
      className={
        isRail
          ? "mt-2 text-[10px] leading-snug text-muted-foreground"
          : "mt-2.5 text-[11px] leading-snug text-muted-foreground"
      }
    >
      {COUPANG_DISCLOSURE}
    </p>
  );

  const body = (
    <>
      {heading}
      {productRow}
      {textLink}
      {disclosure}
    </>
  );

  // Placement chrome takes precedence over variant for rail/bottom.
  if (isRail) {
    return (
      <aside
        className={`w-full max-w-[216px] rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${
          className ?? ""
        }`}
        {...slotAttrs}
        aria-labelledby={headingId}
      >
        {body}
      </aside>
    );
  }

  if (isBottom || (placementKey === "inline" && variant === "section")) {
    return (
      <section
        className={`mt-12 border-t border-slate-100 pt-6 dark:border-slate-800 ${
          className ?? ""
        }`}
        {...slotAttrs}
        aria-labelledby={headingId}
      >
        {body}
      </section>
    );
  }

  if (placementKey === "inline" && variant === "embedded") {
    return (
      <div className={className} {...slotAttrs} aria-labelledby={headingId}>
        {body}
      </div>
    );
  }

  if (variant === "embedded") {
    return (
      <div className={className} {...slotAttrs} aria-labelledby={headingId}>
        {body}
      </div>
    );
  }

  if (variant === "section") {
    return (
      <section
        className={`mt-12 border-t border-slate-100 pt-6 dark:border-slate-800 ${
          className ?? ""
        }`}
        {...slotAttrs}
        aria-labelledby={headingId}
      >
        {body}
      </section>
    );
  }

  return (
    <aside
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${
        className ?? ""
      }`}
      {...slotAttrs}
      aria-labelledby={headingId}
    >
      {body}
    </aside>
  );
}
