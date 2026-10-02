import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { PmModel } from "@/types/database";

interface RelatedModelsProps {
  slugs: string[];
}

function formatPrice(value: number | null) {
  if (value == null || value === 0) return "가격 정보 없음";
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만 원`;
  return `${value.toLocaleString()}원`;
}

/**
 * Related-model rail — visual tone matches SimilarModelsRail
 * (horizontal snap scroll, image / ImageOff, name clamp, price).
 * Shared by guides and blog.
 * Soft-fails when Supabase is unavailable (e.g. egress 402) — never crashes the page.
 * Links always point at `/models/{slug}` when rows resolve.
 */
export async function RelatedModels({ slugs }: RelatedModelsProps) {
  if (!slugs?.length) return null;

  let models: PmModel[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pm_models")
      .select("*")
      .eq("status", "published")
      .in("slug", slugs);
    if (error) {
      // Quota / network / schema errors — hide rail, keep guide usable
      return null;
    }
    models = (data ?? []) as PmModel[];
  } catch {
    return null;
  }

  const bySlug = new Map(models.map((m) => [m.slug, m]));
  // Preserve author-specified order when possible; skip slugs with no published row
  const list = slugs
    .map((s) => bySlug.get(s))
    .filter((m): m is PmModel => Boolean(m));
  if (list.length === 0) return null;

  return (
    <section
      className="mt-12 border-t border-slate-100 pt-6 dark:border-slate-800"
      aria-labelledby="related-models-heading"
    >
      <h2
        id="related-models-heading"
        className="mb-3 text-base font-semibold text-foreground"
      >
        관련 기기
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory [scrollbar-width:thin]">
        {list.map((model) => {
          const img =
            model.image_url && !model.image_url.includes("placeholder")
              ? model.image_url
              : null;
          return (
            <Link
              key={model.id}
              href={`/models/${model.slug}`}
              prefetch={true}
              className="snap-start shrink-0 w-[10rem] rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 shadow-sm transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
            >
              <div className="relative mb-2 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-100 to-slate-200/60 dark:from-slate-800 dark:to-slate-900/80">
                {img ? (
                  <Image
                    src={img}
                    alt={model.model_name}
                    width={160}
                    height={160}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span
                    className="flex items-center justify-center text-muted-foreground"
                    aria-hidden="true"
                    title="이미지 없음"
                  >
                    <ImageOff className="size-6 opacity-40" strokeWidth={1.5} />
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                {model.model_name}
              </p>
              <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                {formatPrice(model.original_price ?? null)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
