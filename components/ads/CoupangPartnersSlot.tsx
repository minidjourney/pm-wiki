import {
  COUPANG_DISCLOSURE,
  isCoupangPartnersEnabled,
  pickCoupangOffer,
} from "@/lib/coupang";

type Props = {
  className?: string;
  /** Show Coupang-provided product image (helps channel-approval screenshots). */
  showBanner?: boolean;
  /** Stable rotation seed (model slug / guide id). */
  seed?: string;
  /**
   * Layout chrome:
   * - embedded — inside another card (model price band); no outer border
   * - section — guide rhythm matching RelatedModels (border-t + heading)
   * - card — standalone rounded card (default)
   */
  variant?: "embedded" | "section" | "card";
};

/**
 * KO-only Coupang Partners unit: section-toned product row + required disclosure.
 * Mount only under Korean routes (`app/models`, `app/guides`) — never `/en` or `/ja`.
 */
export function CoupangPartnersSlot({
  className,
  showBanner = true,
  seed,
  variant = "card",
}: Props) {
  if (!isCoupangPartnersEnabled()) return null;

  const offer = pickCoupangOffer(seed);
  const tracking =
    process.env.NEXT_PUBLIC_COUPANG_TRACKING_CODE || "AF0520396";
  const headingId = "coupang-partners-heading";

  const productRow = (
    <a
      href={offer.bannerHref}
      target="_blank"
      rel="noopener noreferrer sponsored"
      referrerPolicy="unsafe-url"
      className="flex min-h-[96px] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
    >
      {showBanner ? (
        // eslint-disable-next-line @next/next/no-img-element -- affiliate CDN; avoid next/image remote allowlist
        <img
          src={offer.bannerSrc}
          alt={offer.bannerAlt}
          width={80}
          height={80}
          className="size-20 shrink-0 rounded-lg bg-white object-contain p-1 dark:bg-slate-950"
          loading="lazy"
        />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {offer.bannerAlt}
        </span>
        <span className="mt-1.5 inline-flex text-sm font-semibold text-blue-600 dark:text-blue-400">
          {offer.textLabel}
        </span>
      </span>
    </a>
  );

  const textLink = (
    <p className="mt-2 text-center text-xs sm:text-left">
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
    <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
      {COUPANG_DISCLOSURE}
    </p>
  );

  const heading = (
    <h2 id={headingId} className="mb-3 text-base font-semibold text-foreground">
      관련 소모품·충전기
    </h2>
  );

  const body = (
    <>
      {heading}
      {productRow}
      {textLink}
      {disclosure}
    </>
  );

  if (variant === "embedded") {
    return (
      <div
        className={className}
        data-coupang-slot
        data-coupang-tracking={tracking}
        aria-labelledby={headingId}
      >
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
        data-coupang-slot
        data-coupang-tracking={tracking}
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
      data-coupang-slot
      data-coupang-tracking={tracking}
      aria-labelledby={headingId}
    >
      {body}
    </aside>
  );
}
