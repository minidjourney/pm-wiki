"use client";

import { Suspense, useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = "G-DT72L2RRJS";
/** Soft-nav: wait for Next metadata title to settle. */
const SOFT_NAV_TITLE_WAIT_MS = 1500;
/** Hard landing: keep first hit fast so session source/medium can attach. */
const FIRST_HIT_TITLE_WAIT_MS = 300;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    pmwikiGaReady?: boolean;
  }
}

/** 측정 주소만 정리한다. 인라인 초기화에서도 쓰므로 외부 값에 의존하지 않는다. */
function analyticsUrl(value: string): string {
  const url = new URL(value);
  const category = url.searchParams.get("category");
  url.search = "";
  url.hash = "";
  if (
    (url.pathname === "/" || url.pathname === "/en") &&
    category &&
    ["all", "kickboard", "ebike", "scooter", "unicycle"].includes(category)
  ) {
    url.searchParams.set("category", category);
  }
  return url.href;
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
  const lastQueuedKeyRef = useRef<string | null>(null);
  const pendingPageViewsRef = useRef<
    Array<{ page_path: string; page_title: string; page_location: string }>
  >([]);

  useEffect(() => {
    const search = searchParams?.toString() ?? "";
    const navKey = search ? `${pathname}?${search}` : pathname;
    const pageLocation = analyticsUrl(window.location.href);
    const location = new URL(pageLocation);
    const pagePath = location.pathname + location.search;
    const titleAtNavStart = document.title?.trim() ?? "";
    let cancelled = false;

    const flushPending = () => {
      if (!window.pmwikiGaReady || typeof window.gtag !== "function") return;
      while (pendingPageViewsRef.current.length > 0) {
        const page = pendingPageViewsRef.current.shift()!;
        window.gtag("event", "page_view", page);
      }
    };

    const queuePageView = async () => {
      if (lastQueuedKeyRef.current === navKey) return;

      const isFirstHit = lastQueuedKeyRef.current === null;
      let pageTitle: string | null;

      if (isFirstHit) {
        // First hit: fire ASAP so GA can attach session source/medium.
        // Long title waits here are a common cause of Session source `(not set)`.
        const immediate = document.title?.trim() ?? "";
        if (immediate) {
          pageTitle = immediate;
        } else {
          pageTitle = await waitForDocumentTitle(
            FIRST_HIT_TITLE_WAIT_MS,
            titleAtNavStart
          );
        }
      } else {
        pageTitle = await waitForDocumentTitle(
          SOFT_NAV_TITLE_WAIT_MS,
          titleAtNavStart
        );
      }

      if (cancelled) return;
      if (lastQueuedKeyRef.current === navKey) return;

      // Never send empty title — that becomes GA `(not set)` / `(설정 안함)`.
      if (!pageTitle) return;

      lastQueuedKeyRef.current = navKey;
      pendingPageViewsRef.current.push({
        page_path: pagePath,
        page_title: pageTitle,
        page_location: pageLocation,
      });
      flushPending();
    };

    // 먼저 구독한 뒤 준비 상태를 읽어 어느 실행 순서에서도 놓치지 않는다.
    window.addEventListener("pmwiki:ga-ready", flushPending);
    flushPending();
    void queuePageView();

    return () => {
      cancelled = true;
      window.removeEventListener("pmwiki:ga-ready", flushPending);
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
          const analyticsUrl = ${analyticsUrl.toString()};
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            page_location: analyticsUrl(window.location.href),
            page_referrer: document.referrer ? analyticsUrl(document.referrer) : ''
          });
          window.pmwikiGaReady = true;
          window.dispatchEvent(new Event('pmwiki:ga-ready'));
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageViews />
      </Suspense>
    </>
  );
}
