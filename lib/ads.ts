/** Google AdSense helpers. Set NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXX */

export function getAdSenseClientId(): string | null {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  if (!raw) return null;
  if (raw.startsWith("ca-pub-")) return raw;
  if (/^\d+$/.test(raw)) return `ca-pub-${raw}`;
  return null;
}

/** ads.txt용 pub-XXXXXXXX */
export function getAdSensePublisherId(): string | null {
  const client = getAdSenseClientId();
  if (!client) return null;
  return client.replace(/^ca-/, "");
}

export function isAdSenseEnabled(): boolean {
  return Boolean(getAdSenseClientId());
}

export type AdSlotId = "home-mid" | "model-mid" | "model-bottom";

export function getAdSlotUnitId(slot: AdSlotId): string | null {
  const map: Record<AdSlotId, string | undefined> = {
    "home-mid": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID,
    "model-mid": process.env.NEXT_PUBLIC_ADSENSE_SLOT_MODEL_MID,
    "model-bottom": process.env.NEXT_PUBLIC_ADSENSE_SLOT_MODEL_BOTTOM,
  };
  const value = map[slot]?.trim();
  return value || null;
}
