"use client";

import Link from "next/link";
import type { PmModelSummary } from "@/types/database";
import { ChevronRight } from "lucide-react";

function formatPrice(value: number | null) {
  if (value == null) return "—";
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만 원`;
  return `${value.toLocaleString()}원`;
}

interface RecommendationWidgetProps {
  title: string;
  items: PmModelSummary[];
  currentSlug: string;
}

export function RecommendationWidget({
  title,
  items,
  currentSlug,
}: RecommendationWidgetProps) {
  const list = items.filter((m) => m.slug !== currentSlug).slice(0, 10);
  if (list.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-thin [-webkit-overflow-scrolling:touch]">
        {list.map((m) => (
          <Link
            key={m.id}
            href={`/models/${m.slug}`}
            className="flex w-[160px] shrink-0 flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:border-slate-200 hover:bg-slate-100/80"
          >
            <span className="text-xs text-muted-foreground">{m.manufacturer}</span>
            <span className="font-semibold text-foreground line-clamp-2">
              {m.model_name}
            </span>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0 text-xs text-muted-foreground">
              {m.used_price_a != null && (
                <span>{formatPrice(m.used_price_a)}</span>
              )}
              {m.range_real_80kg != null && (
                <span>{m.range_real_80kg}km</span>
              )}
              {m.weight != null && <span>{m.weight}kg</span>}
            </div>
            <span className="mt-1 inline-flex items-center text-xs text-primary">
              보기 <ChevronRight className="size-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
