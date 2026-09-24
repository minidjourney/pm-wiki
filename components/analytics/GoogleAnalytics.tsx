"use client";

import { Suspense, useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = "G-DT72L2RRJS";
const TITLE_WAIT_MS = 1500;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Wait for a usable document.title.
 * - Soft nav: prefer a title that changed from the value at navigation start.
 * - Returns null if still empty after timeout (caller must skip page_view).
 */
function waitForDocumentTitle(
  timeoutMs: number,
  titleAtNavStart: string
): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (title: string | null) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timer);
      const trimmed = title?.trim() ?? "";
      resolve(trimmed.length > 0 ? trimmed : null);
    };

    const readTitle = () => document.title?.trim() ?? "";

    const observer = new MutationObserver(() => {
      const title = readTitle();
      if (!title) return;
      // Soft nav: title updated to the new page.
      if (title !== titleAtNavStart) {
        finish(title);
        return;
      }
      // Hard load / first paint: empty → non-empty.
      if (!titleAtNavStart && title) {
        finish(title);
      }
    });

    const titleEl = document.querySelector("title");
    if (titleEl) {
      observer.observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    } else {
      observer.observe(document.head, { childList: true, subtree: true });
    }

    const timer = window.setTimeout(() => {
      const title = readTitle();
      // Accept non-empty even if unchanged (SSR already set correct title).
      finish(title || null);
    }, timeoutMs);

    // Fast path: already have a title and it differs from nav-start (rare),
    // or nav-start was empty and title is now set.
    const immediate = readTitle();
    if (immediate && (!titleAtNavStart || immediate !== titleAtNavStart)) {
      // Defer one frame so Next metadata can still win on soft nav.
      requestAnimationFrame(() => {
        const next = readTitle();
        if (next && next !== titleAtNavStart) finish(next);
      });
    }
  });
}

function GoogleAnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSentKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const search = searchParams?.toString() ?? "";
    const pagePath = search ? `${pathname}?${search}` : pathname;
    const navKey = pagePath;
    const titleAtNavStart = document.title?.trim() ?? "";
    let cancelled = false;

    const sendPageView = async () => {
      if (lastSentKeyRef.current === navKey) return;

      const pageTitle = await waitForDocumentTitle(
        TITLE_WAIT_MS,
        titleAtNavStart
      );
      if (cancelled) return;
      if (lastSentKeyRef.current === navKey) return;

      // Never send empty title — that becomes GA `(not set)` / `(설정 안함)`.
      if (!pageTitle) return;
      if (typeof window.gtag !== "function") return;

      lastSentKeyRef.current = navKey;
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_title: pageTitle,
        page_location: window.location.href,
      });
    };

    void sendPageView();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageViews />
      </Suspense>
    </>
  );
}
