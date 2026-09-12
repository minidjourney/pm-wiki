import { getAdSenseClientId } from "@/lib/ads";

/**
 * Server-rendered AdSense loader in raw HTML so crawlers see the script
 * without executing client JS (required for site ownership checks).
 */
export function AdSenseScript() {
  const client = getAdSenseClientId();
  if (!client) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
