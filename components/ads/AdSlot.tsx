"use client";

import { useEffect, useRef } from "react";
import {
  getAdSenseClientId,
  getAdSlotUnitId,
  type AdSlotId,
} from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface AdSlotProps {
  slot: AdSlotId;
  className?: string;
  format?: string;
}

/**
 * Renders an AdSense unit when client + slot env vars are set.
 * Without env, renders nothing (safe for staging).
 */
export function AdSlot({ slot, className, format = "auto" }: AdSlotProps) {
  const client = getAdSenseClientId();
  const unitId = getAdSlotUnitId(slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !unitId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // ignore if script not ready
    }
  }, [client, unitId]);

  if (!client || !unitId) return null;

  return (
    <div className={className} data-ad-slot={slot}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={unitId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
