import { getAdSenseClientId, getAdSensePublisherId } from "@/lib/ads";

export async function GET() {
  const publisherId = getAdSensePublisherId();

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : `# Set NEXT_PUBLIC_ADSENSE_CLIENT_ID (ca-pub-XXXXXXXX) on Vercel, then redeploy.\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
