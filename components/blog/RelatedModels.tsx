import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculateValueScore } from "@/lib/pm-score";
import type { PmModel } from "@/types/database";
import { Badge } from "@/components/ui/badge";

interface RelatedModelsProps {
  slugs: string[];
}

function formatPrice(value: number | null) {
  if (value == null || value === 0) return "—";
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만 원`;
  return `${value.toLocaleString()}원`;
}

function formatUsedRange(m: PmModel): string {
  const min = m.used_price_min;
  const max = m.used_price_max;
  if (min == null || max == null || min === 0) return "정보 없음";
  return `${(min / 10000).toFixed(0)}만 ~ ${(max / 10000).toFixed(0)}만 원`;
}

export async function RelatedModels({ slugs }: RelatedModelsProps) {
  if (!slugs?.length) return null;

  const supabase = await createClient();
  const { data: models } = await supabase
    .from("pm_models")
    .select("*")
    .eq("status", "published")
    .in("slug", slugs);

  const list = (models ?? []) as PmModel[];
  if (list.length === 0) return null;

  return (
    <section className="mt-12 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
        관련 기기
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => {
          const score = calculateValueScore(m);
          return (
            <Link
              key={m.id}
              href={`/models/${m.slug}`}
              prefetch={true}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:border-slate-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {m.manufacturer}
              </p>
              <p className="font-semibold text-foreground">{m.model_name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  신품 {formatPrice(m.original_price ?? null)}
                </span>
                <span className="text-muted-foreground">
                  중고 {formatUsedRange(m)}
                </span>
              </div>
              {score != null && (
                <Badge
                  variant="secondary"
                  className="mt-2 w-fit bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                >
                  ⚡ 가성비 {score}점
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
