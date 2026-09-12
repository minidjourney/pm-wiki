"use client";

import Script from "next/script";
import { getAdSenseClientId } from "@/lib/ads";

/** Loads AdSense only when NEXT_PUBLIC_ADSENSE_CLIENT_ID is set. */
export function AdSenseScript() {
  const client = getAdSenseClientId();
  if (!client) return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
