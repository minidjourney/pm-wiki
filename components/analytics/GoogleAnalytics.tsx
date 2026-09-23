"use client";

import { Suspense, useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = "G-DT72L2RRJS";
const TITLE_WAIT_MS = 500;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function waitForDocumentTitle(timeoutMs: number): Promise<string> {
  const current = document.title?.trim() ?? "";
  if (current) return Promise.resolve(current);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (title: string) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timer);
      resolve(title);
    };

    const observer = new MutationObserver(() => {
      const title = document.title?.trim() ?? "";
      if (title) finish(title);
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
      finish(document.title?.trim() ?? "");
    }, timeoutMs);
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
    let cancelled = false;

    const sendPageView = async () => {
      if (lastSentKeyRef.current === navKey) return;

      const pageTitle = await waitForDocumentTitle(TITLE_WAIT_MS);
      if (cancelled) return;
      if (lastSentKeyRef.current === navKey) return;

      if (typeof window.gtag !== "function") return;

      lastSentKeyRef.current = navKey;
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_title: pageTitle || document.title,
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
