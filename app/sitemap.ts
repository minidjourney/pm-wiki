import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://pmwiki.kr"; // 실제 도메인으로 변경 필요
  const supabase = getSupabase();

  // 1. DB에서 퍼블리싱된 모델 슬러그 가져오기
  const { data: models } = await supabase
    .from("pm_models")
    .select("slug, updated_at")
    .eq("status", "published");

  // 2. 동적 모델 상세 페이지 URL 생성
  const modelUrls = (models ?? []).map((model) => ({
    url: `${baseUrl}/models/${model.slug}`,
    lastModified: model.updated_at ? new Date(model.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 3. 정적 페이지 (메인, 블로그 등)
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

  return [...staticUrls, ...modelUrls];
}
