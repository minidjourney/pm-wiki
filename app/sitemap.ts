import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/url";
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { listGuides } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { listPublishedModels, modelSitemapEntries } from "@/lib/published-models";

// Rebuild hourly so newly published models appear without a redeploy. If a
// rebuild throws, Next keeps serving the last successful sitemap.
export const revalidate = 3600;

const getSupabase = () =>
  createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const guideEntries: MetadataRoute.Sitemap = listGuides().flatMap((g) => [
    {
      url: `${baseUrl}/guides/${g.slug}`,
      lastModified: new Date(g.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/en/guides/${g.slug}`,
      lastModified: new Date(g.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ]);

  // No lastModified here: the build time is not a content change date.
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en`,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/guides`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/guides`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...guideEntries,
  ];

  // Throws on any read problem: a partial sitemap must not be served as a
  // successful one (one unpaged query silently dropped 229 models).
  const models = await listPublishedModels(getSupabase());
  return [...staticUrls, ...modelSitemapEntries(baseUrl, models)];
}
