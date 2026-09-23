import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { listGuides } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...guideEntries,
  ];

  try {
    const supabase = getSupabase();
    const { data: models, error } = await supabase
      .from("pm_models")
      .select("slug")
      .eq("status", "published");

    if (error) {
      console.error("[sitemap] failed to load pm_models:", error.message);
      return staticUrls;
    }

    const modelUrls = (models ?? []).flatMap((model) => [
      {
        url: `${baseUrl}/models/${model.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/models/${model.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      },
    ]);

    return [...staticUrls, ...modelUrls];
  } catch (err) {
    console.error("[sitemap] unexpected error:", err);
    return staticUrls;
  }
}
