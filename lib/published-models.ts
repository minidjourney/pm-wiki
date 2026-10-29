/**
 * Every published model (id, slug, updated_at) past the gateway row cap.
 *
 * The public gateway (PostgREST `db-max-rows`) returns at most 1,000 rows per
 * request, and a single unordered query silently stopped at 1,000 of 1,229
 * published models. This reads with keyset pagination on the primary key
 * (`order=id.asc`, `id=gt.<last id>`) until an empty page, and fails loudly
 * instead of returning a partial list.
 *
 * Each request is its own READ COMMITTED transaction, so this is not a single
 * snapshot: the exact count is checked before and after, and the whole read is
 * retried once when a publish/unpublish happened in between.
 *
 * Runtime-import free (the client arrives as an argument) so the logic can be
 * tested with plain `node --test`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type PublishedModelRow = {
  id: string;
  slug: string;
  updated_at: string | null;
};

export type ModelPageFetcher = (
  afterId: string | null,
  pageSize: number
) => Promise<unknown>;
export type ModelCountFetcher = () => Promise<number>;

export const MODEL_PAGE_SIZE = 1000;
const MAX_PAGES = 100;

export async function collectPublishedModels(
  fetchPage: ModelPageFetcher,
  fetchCount: ModelCountFetcher,
  opts: { pageSize?: number; maxPages?: number; attempts?: number } = {}
): Promise<PublishedModelRow[]> {
  const pageSize = opts.pageSize ?? MODEL_PAGE_SIZE;
  const maxPages = opts.maxPages ?? MAX_PAGES;
  const attempts = opts.attempts ?? 2;
  let problem = "no attempt";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const before = await fetchCount();
    const rows = await readAllPages(fetchPage, pageSize, maxPages);
    const after = await fetchCount();
    if (rows.length === before && rows.length === after) return rows;
    problem = `count mismatch (before ${before}, read ${rows.length}, after ${after})`;
  }
  throw new Error(`[published-models] ${problem}`);
}

async function readAllPages(
  fetchPage: ModelPageFetcher,
  pageSize: number,
  maxPages: number
): Promise<PublishedModelRow[]> {
  const rows: PublishedModelRow[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  let cursor: string | null = null;

  for (let page = 0; page < maxPages; page += 1) {
    const batch = await fetchPage(cursor, pageSize);
    if (!Array.isArray(batch)) {
      throw new Error("[published-models] page is not a list");
    }
    // A short page is not the end: the server cap may be below pageSize.
    if (batch.length === 0) return rows;
    if (batch.length > pageSize) {
      throw new Error("[published-models] page larger than requested");
    }

    for (const raw of batch) {
      const row = raw as Partial<PublishedModelRow> | null;
      const id = row?.id;
      const slug = row?.slug;
      if (typeof id !== "string" || !id || typeof slug !== "string" || !slug) {
        throw new Error("[published-models] invalid id or slug");
      }
      const key = id.toLowerCase();
      if (cursor !== null && !(key > cursor)) {
        throw new Error("[published-models] rows not in ascending id order");
      }
      if (seenIds.has(key) || seenSlugs.has(slug)) {
        throw new Error("[published-models] duplicate id or slug");
      }
      seenIds.add(key);
      seenSlugs.add(slug);
      const updated = row?.updated_at;
      rows.push({
        id,
        slug,
        updated_at: typeof updated === "string" && updated ? updated : null,
      });
      cursor = key;
    }
  }
  throw new Error("[published-models] too many pages");
}

/** Supabase adapter used by sitemap.ts. */
export async function listPublishedModels(
  supabase: SupabaseClient
): Promise<PublishedModelRow[]> {
  const fetchPage: ModelPageFetcher = async (afterId, pageSize) => {
    let query = supabase
      .from("pm_models")
      .select("id,slug,updated_at")
      .eq("status", "published");
    if (afterId !== null) query = query.gt("id", afterId);
    const { data, error } = await query
      .order("id", { ascending: true })
      .limit(pageSize);
    if (error) {
      throw new Error(`[published-models] page failed: ${error.message}`);
    }
    return data;
  };

  const fetchCount: ModelCountFetcher = async () => {
    const { count, error } = await supabase
      .from("pm_models")
      .select("id", { count: "exact" })
      .eq("status", "published")
      .limit(1);
    if (error || typeof count !== "number") {
      throw new Error(
        `[published-models] count failed: ${error?.message ?? "missing count"}`
      );
    }
    return count;
  };

  return collectPublishedModels(fetchPage, fetchCount);
}

/** Valid ISO date string for sitemap `lastModified`, else undefined. */
export function sitemapLastModified(value: string | null): string | undefined {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : undefined;
}

/** Korean + English sitemap entries for each published model. */
export function modelSitemapEntries(
  baseUrl: string,
  rows: readonly PublishedModelRow[]
): Array<{
  url: string;
  lastModified?: string;
  changeFrequency: "weekly";
  priority: number;
}> {
  return rows.flatMap((row) => {
    const segment = encodeURIComponent(row.slug);
    const lastModified = sitemapLastModified(row.updated_at);
    const dated = lastModified ? { lastModified } : {};
    return [
      {
        url: `${baseUrl}/models/${segment}`,
        ...dated,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/models/${segment}`,
        ...dated,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      },
    ];
  });
}
