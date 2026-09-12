import Script from "next/script";
import { getAdSenseClientId } from "@/lib/ads";

/**
 * Root-layout only: beforeInteractive injects a real <script> into initial HTML
 * so AdSense ownership crawlers can see the client id without running JS.
 */
export function AdSenseScript() {
  const client = getAdSenseClientId();
  if (!client) return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
