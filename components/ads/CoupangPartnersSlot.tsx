import {
  COUPANG_DISCLOSURE,
  getCoupangBannerImage,
  getCoupangBannerLink,
  getCoupangTextLink,
  isCoupangPartnersEnabled,
} from "@/lib/coupang";

type Props = {
  className?: string;
  /** Show Coupang-provided image banner (helps channel-approval screenshots). */
  showBanner?: boolean;
};

/**
 * KO-only Coupang Partners unit: optional image banner + text link + required disclosure.
 * Mount only under Korean routes (`app/models`, `app/guides`) — never `/en` or `/ja`.
 */
export function CoupangPartnersSlot({ className, showBanner = true }: Props) {
  if (!isCoupangPartnersEnabled()) return null;

  const textHref = getCoupangTextLink();
  const bannerHref = getCoupangBannerLink();
  const bannerSrc = getCoupangBannerImage();

  return (
    <aside
      className={`w-full overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${
        className ?? ""
      }`}
      data-coupang-slot
      aria-label="쿠팡 파트너스 추천"
    >
      {showBanner ? (
        <a
          href={bannerHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          referrerPolicy="unsafe-url"
          className="flex min-h-[240px] items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- affiliate CDN; avoid next/image remote allowlist */}
          <img
            src={bannerSrc}
            alt="쿠팡 파트너스 추천 상품"
            width={120}
            height={240}
            className="mx-auto h-auto max-h-[240px] w-auto"
            loading="lazy"
          />
        </a>
      ) : null}

      <p className="mt-2 text-center text-sm">
        <a
          href={textHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          referrerPolicy="unsafe-url"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          쿠팡에서 관련 용품 보기
        </a>
      </p>

      <p className="mt-1.5 text-center text-[11px] leading-snug text-muted-foreground md:text-xs">
        {COUPANG_DISCLOSURE}
      </p>
    </aside>
  );
}
