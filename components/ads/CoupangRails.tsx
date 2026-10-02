import type { ReactNode } from "react";
import { CoupangPartnersSlot } from "@/components/ads/CoupangPartnersSlot";

type Props = {
  /** Stable seed (model slug / guide id) — A/B first-assign / SSR fallback only. */
  seed: string;
  children: ReactNode;
  /**
   * Max width of the center content column.
   * Model pages use ~2xl; guides use ~3xl.
   */
  contentMaxClassName?: string;
  /**
   * When false, only render children (no rails).
   * CTO can gate via A/B / flags without touching offer URLs.
   */
  showRails?: boolean;
  className?: string;
};

/**
 * Desktop gutter wrapper: left + right Coupang rails beside main content.
 * Semantic DOM: primary content first, then rails as siblings (CSS `order`
 * restores left | content | right visually on lg+). Rails are lg+ only.
 * Gutter width ~216px for portrait Coupang banners (240×480).
 * Reuses #46 `placement` / `data-coupang-placement` API; does not invent A/B logic.
 * Tracking AF0520396 unchanged (set in CoupangPartnersSlot / lib/coupang).
 */
export function CoupangRails({
  seed,
  children,
  contentMaxClassName = "max-w-2xl",
  showRails = true,
  className,
}: Props) {
  return (
    <div
      className={`mx-auto flex w-full max-w-[78rem] justify-center gap-4 px-2 sm:px-4 ${
        className ?? ""
      }`}
    >
      {/* Primary content first in source order for screen readers / AI extractors */}
      <div
        className={`min-w-0 w-full ${contentMaxClassName} ${
          showRails ? "order-2" : ""
        }`}
      >
        {children}
      </div>

      {showRails ? (
        <aside
          className="order-1 hidden w-[216px] shrink-0 lg:block"
          aria-label="쿠팡 파트너스 좌측"
          data-coupang-rail="left"
        >
          <div className="sticky top-24">
            <CoupangPartnersSlot seed={seed} placement="rail-left" />
          </div>
        </aside>
      ) : null}

      {showRails ? (
        <aside
          className="order-3 hidden w-[216px] shrink-0 lg:block"
          aria-label="쿠팡 파트너스 우측"
          data-coupang-rail="right"
        >
          <div className="sticky top-24">
            <CoupangPartnersSlot seed={seed} placement="rail-right" />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
