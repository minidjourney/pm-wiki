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
 * Rails are lg+ only (hidden on mobile) — mobile keeps inline + optional bottom.
 * Reuses #46 `placement` / `data-coupang-placement` API; does not invent A/B logic.
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
      className={`mx-auto flex w-full max-w-[74rem] justify-center gap-4 px-2 sm:px-4 ${
        className ?? ""
      }`}
    >
      {showRails ? (
        <aside
          className="hidden w-[168px] shrink-0 lg:block"
          aria-label="쿠팡 파트너스 좌측"
          data-coupang-rail="left"
        >
          <div className="sticky top-24">
            <CoupangPartnersSlot seed={seed} placement="rail-left" />
          </div>
        </aside>
      ) : null}

      <div className={`min-w-0 w-full ${contentMaxClassName}`}>{children}</div>

      {showRails ? (
        <aside
          className="hidden w-[168px] shrink-0 lg:block"
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
