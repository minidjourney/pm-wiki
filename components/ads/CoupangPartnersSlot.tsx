import {
  COUPANG_DISCLOSURE,
  isCoupangPartnersEnabled,
  pickCoupangOffer,
} from "@/lib/coupang";

type Props = {
  className?: string;
  /** Show Coupang-provided image banner (helps channel-approval screenshots). */
  showBanner?: boolean;
  /** Stable rotation seed (model slug / guide id). */
  seed?: string;
};

/**
 * KO-only Coupang Partners unit: image banner + text link + required disclosure.
 * Mount only under Korean routes (`app/models`, `app/guides`) — never `/en` or `/ja`.
 */
export function CoupangPartnersSlot({
  className,
  showBanner = true,
  seed,
}: Props) {
  if (!isCoupangPartnersEnabled()) return null;

  const offer = pickCoupangOffer(seed);

  return (
    <aside
      className={`w-full overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${
        className ?? ""
      }`}
      data-coupang-slot
      data-coupang-tracking={process.env.NEXT_PUBLIC_COUPANG_TRACKING_CODE || "AF0520396"}
      aria-label="쿠팡 파트너스 추천"
    >
      {showBanner ? (
        <a
          href={offer.bannerHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          referrerPolicy="unsafe-url"
          className="flex min-h-[240px] items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- affiliate CDN; avoid next/image remote allowlist */}
          <img
            src={offer.bannerSrc}
            alt={offer.bannerAlt}
            width={120}
            height={240}
            className="mx-auto h-auto max-h-[240px] w-auto"
            loading="lazy"
          />
        </a>
      ) : null}

      <p className="mt-2 text-center text-sm">
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

      <p className="mt-1.5 text-center text-[11px] leading-snug text-muted-foreground md:text-xs">
        {COUPANG_DISCLOSURE}
      </p>
    </aside>
  );
}
