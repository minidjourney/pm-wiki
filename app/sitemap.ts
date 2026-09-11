import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
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

    const modelUrls = (models ?? []).map((model) => ({
      url: `${baseUrl}/models/${model.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticUrls, ...modelUrls];
  } catch (err) {
    console.error("[sitemap] unexpected error:", err);
    return staticUrls;
  }
}
