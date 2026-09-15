/**
 * Retention helpers: similar models + category TOP ranking (proxy scores).
 * Label as interest/popularity — never "sales rate".
 *
 * Prefer `ranking_signals` (COO-weighted) when present; else pm_score proxy.
 */
import type { LocaleCode } from "@/lib/locale";
import type {
  PmCategory,
  PmModel,
  RankingSignalScores,
} from "@/types/database";

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

/** COO brief weights — KO leans marketplace/demand/AS; EN leans marketplace/demand/reviews. */
const KO_WEIGHTS: Record<
  keyof Omit<RankingSignalScores, "review_score">,
  number
> = {
  marketplace_score: 0.35,
  demand_score: 0.25,
  pv_score: 0.15,
  ctr_score: 0.1,
  as_bonus: 0.15,
};

const EN_WEIGHTS: Record<
  keyof Omit<RankingSignalScores, "as_bonus">,
  number
> = {
  marketplace_score: 0.3,
  demand_score: 0.25,
  pv_score: 0.15,
  ctr_score: 0.1,
  review_score: 0.2,
};

function hasAnyRankingSignal(signal: RankingSignalScores): boolean {
  return (
    num(signal.marketplace_score) != null ||
    num(signal.demand_score) != null ||
    num(signal.pv_score) != null ||
    num(signal.ctr_score) != null ||
    num(signal.as_bonus) != null ||
    num(signal.review_score) != null
  );
}

/**
 * Weighted average over present signal fields (renormalized).
 * Returns null when no usable signal values exist.
 */
export function scoreFromRankingSignals(
  signal: RankingSignalScores,
  locale: LocaleCode
): number | null {
  if (!hasAnyRankingSignal(signal)) return null;

  const weights =
    locale === "en"
      ? (EN_WEIGHTS as Record<string, number>)
      : (KO_WEIGHTS as Record<string, number>);

  let weighted = 0;
  let weightSum = 0;
  for (const [key, w] of Object.entries(weights)) {
    const v = num(signal[key as keyof RankingSignalScores]);
    if (v == null) continue;
    weighted += v * w;
    weightSum += w;
  }
  if (weightSum <= 0) return null;
  return weighted / weightSum;
}

/** pm_score + content completeness proxy (pre-signals fallback). */
function interestScoreProxy(m: PmModel, locale: LocaleCode): number {
  const pm = num((m as { pm_score?: number | null }).pm_score) ?? 0;
  let score = pm;
  if (hasPriceBand(m, locale)) score += 8;
  const wh = batteryWh(m);
  if (wh != null) score += 4;
  if (m.one_line_summary || (locale === "en" && m.one_line_summary_en)) score += 2;
  return score;
}

export type InterestScoreOpts = {
  /** ranking_signals row for this model+locale when available */
  signal?: RankingSignalScores | null;
};

/**
 * Interest / popularity score for TOP10 + similar ranking.
 * Prefers COO-weighted `ranking_signals` when any field is present;
 * otherwise falls back to pm_score proxy.
 */
export function interestScore(
  m: PmModel,
  locale: LocaleCode,
  opts?: InterestScoreOpts
): number {
  if (opts?.signal) {
    const fromSignals = scoreFromRankingSignals(opts.signal, locale);
    // Signaled models outrank proxy until scores are calibrated.
    if (fromSignals != null) return 1000 + fromSignals;
  }
  return interestScoreProxy(m, locale);
}

type Scored = { model: PmModel; score: number };

export type RetentionPickOpts = {
  locale?: LocaleCode;
  limit?: number;
  /** Optional map of model_id → ranking_signals scores for the active locale */
  signalsByModelId?: Record<string, RankingSignalScores | null | undefined>;
};

/**
 * Same category → Wh±25% → price±25% → voltage band → same brand max 2.
 */
export function pickSimilarModels(
  current: PmModel,
  pool: PmModel[],
  opts?: RetentionPickOpts
): PmModel[] {
  const locale = opts?.locale ?? "ko";
  const limit = opts?.limit ?? 5;
  const signals = opts?.signalsByModelId;
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
    score +=
      interestScore(model, locale, { signal: signals?.[model.id] }) * 0.15;
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
  opts?: RetentionPickOpts
): PmModel[] {
  const locale = opts?.locale ?? "ko";
  const limit = opts?.limit ?? 10;
  const signals = opts?.signalsByModelId;
  const filtered =
    category === "all" ? pool : pool.filter((m) => m.category === category);
  return [...filtered]
    .sort(
      (a, b) =>
        interestScore(b, locale, { signal: signals?.[b.id] }) -
        interestScore(a, locale, { signal: signals?.[a.id] })
    )
    .slice(0, limit);
}
