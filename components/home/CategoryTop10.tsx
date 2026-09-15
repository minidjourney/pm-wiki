"use client";

import { useMemo, useState } from "react";
import type { PmCategory, PmModel } from "@/types/database";
import type { LocaleCode } from "@/lib/locale";
import { CATEGORY_LABELS } from "@/lib/locale";
import { uiCopy } from "@/lib/ui-copy";
import { pickTopByCategory } from "@/lib/retention";
import { ModelCard } from "@/components/home/ModelCard";

const CATS: Array<"all" | PmCategory> = ["all", "kickboard", "ebike", "scooter", "unicycle"];

export function CategoryTop10({
  models,
  locale = "ko",
}: {
  models: PmModel[];
  locale?: LocaleCode;
}) {
  const t = uiCopy(locale === "ja" ? "ja" : locale);
  const loc: LocaleCode = locale === "ja" ? "ko" : locale;
  const [cat, setCat] = useState<"all" | PmCategory>("all");

  const top = useMemo(
    () => pickTopByCategory(models, cat, { locale: loc, limit: 10 }),
    [models, cat, loc]
  );

  const labels = CATEGORY_LABELS[loc];

  return (
    <section className="space-y-4" aria-labelledby="category-top10-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="category-top10-heading" className="text-xl font-bold tracking-tight text-foreground">
            {t.top10Heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.interestIndexHint}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:bg-slate-800">
          {t.interestIndex}
        </span>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t.top10Heading}>
        {CATS.map((c) => {
          const selected = cat === c;
          const label = c === "all" ? labels.all : labels[c];
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setCat(c)}
              className={
                selected
                  ? "min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
                  : "min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-muted-foreground hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {top.length === 0 ? (
        <p className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-muted-foreground">
          {t.emptyCategory}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {top.map((model, i) => (
            <div key={model.id} className="relative">
              <span className="absolute left-2 top-2 z-20 flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-900/90 px-2 text-xs font-bold text-white">
                {i + 1}
              </span>
              <ModelCard model={model} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
