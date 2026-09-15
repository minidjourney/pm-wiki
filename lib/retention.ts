/**
 * Retention helpers: similar models + category TOP ranking (proxy scores).
 * Label as interest/popularity — never "sales rate".
 */
import type { LocaleCode } from "@/lib/locale";
import type { PmCategory, PmModel } from "@/types/database";

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function batteryWh(m: PmModel): number | null {
  const direct = num((m as { battery_wh?: number | null }).battery_wh);
  if (direct != null && direct > 0) return direct;
  const v = num((m as { nominal_voltage?: number | null }).nominal_voltage);
  const ah = num(m.battery_capacity);
  if (v != null && ah != null && v > 0 && ah > 0) return v * ah;
  return null;
}

function voltage(m: PmModel): number | null {
  return (
    num((m as { nominal_voltage?: number | null }).nominal_voltage) ??
    num((m as { battery_voltage?: number | null }).battery_voltage)
  );
}

function priceAnchor(m: PmModel, locale: LocaleCode): number | null {
  if (locale === "en") {
    const min = num(m.used_price_min_usd);
    const max = num(m.used_price_max_usd);
    if (min != null && max != null && min > 0 && max > 0) return (min + max) / 2;
    const msrp = num(m.original_price_usd);
    if (msrp != null && msrp > 0) return msrp;
    return null;
  }
  const min = num(m.used_price_min);
  const max = num(m.used_price_max);
  if (min != null && max != null && min > 0 && max > 0) return (min + max) / 2;
  const msrp = num(m.original_price);
  if (msrp != null && msrp > 0) return msrp;
  return null;
}

function hasPriceBand(m: PmModel, locale: LocaleCode): boolean {
  return priceAnchor(m, locale) != null;
}

/** Temporary popularity proxy until ranking_signals / events exist. */
export function interestScore(m: PmModel, locale: LocaleCode): number {
  const pm = num((m as { pm_score?: number | null }).pm_score) ?? 0;
  let score = pm;
  if (hasPriceBand(m, locale)) score += 8;
  const wh = batteryWh(m);
  if (wh != null) score += 4;
  if (m.one_line_summary || (locale === "en" && m.one_line_summary_en)) score += 2;
  return score;
}

type Scored = { model: PmModel; score: number };

/**
 * Same category → Wh±25% → price±25% → voltage band → same brand max 2.
 */
export function pickSimilarModels(
  current: PmModel,
  pool: PmModel[],
  opts?: { locale?: LocaleCode; limit?: number }
): PmModel[] {
  const locale = opts?.locale ?? "ko";
  const limit = opts?.limit ?? 5;
  const curWh = batteryWh(current);
  const curPrice = priceAnchor(current, locale);
  const curV = voltage(current);

  const candidates = pool.filter(
    (m) =>
      m.id !== current.id &&
      m.slug !== current.slug &&
      m.category === current.category &&
      m.status === "published"
  );

  const scored: Scored[] = candidates.map((model) => {
    let score = 0;
    const wh = batteryWh(model);
    if (curWh != null && wh != null) {
      const ratio = Math.abs(wh - curWh) / curWh;
      if (ratio <= 0.25) score += 40 - ratio * 80;
      else score -= 20;
    }
    const price = priceAnchor(model, locale);
    if (curPrice != null && price != null) {
      const ratio = Math.abs(price - curPrice) / curPrice;
      if (ratio <= 0.25) score += 30 - ratio * 60;
      else score -= 15;
    }
    const v = voltage(model);
    if (curV != null && v != null) {
      const dv = Math.abs(v - curV);
      if (dv === 0) score += 20;
      else if (dv <= 12) score += 10;
    }
    if (model.manufacturer === current.manufacturer) score += 5;
    score += interestScore(model, locale) * 0.15;
    return { model, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const picked: PmModel[] = [];
  let sameBrand = 0;
  for (const row of scored) {
    if (picked.length >= limit) break;
    const same = row.model.manufacturer === current.manufacturer;
    if (same && sameBrand >= 2) continue;
    picked.push(row.model);
    if (same) sameBrand += 1;
  }
  return picked;
}

export function pickTopByCategory(
  pool: PmModel[],
  category: PmCategory | "all",
  opts?: { locale?: LocaleCode; limit?: number }
): PmModel[] {
  const locale = opts?.locale ?? "ko";
  const limit = opts?.limit ?? 10;
  const filtered =
    category === "all" ? pool : pool.filter((m) => m.category === category);
  return [...filtered]
    .sort((a, b) => interestScore(b, locale) - interestScore(a, locale))
    .slice(0, limit);
}
