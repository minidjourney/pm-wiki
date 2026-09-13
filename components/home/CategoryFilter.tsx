"use client";

import type { PmCategory } from "@/types/database";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Locale } from "@/lib/i18n";

interface CategoryFilterProps {
  selected: "all" | PmCategory;
  onSelect: (category: "all" | PmCategory) => void;
  locale?: Locale;
}

export function CategoryFilter({
  selected,
  onSelect,
  locale = "ko",
}: CategoryFilterProps) {
  const labels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.ko;
  const categories: Array<{ value: "all" | PmCategory; label: string }> = [
    { value: "all", label: labels.all },
    { value: "kickboard", label: labels.kickboard },
    { value: "ebike", label: labels.ebike },
    { value: "scooter", label: labels.scooter },
    { value: "unicycle", label: labels.unicycle },
  ];

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={locale === "en" ? "Category filter" : "카테고리 필터"}
    >
      {categories.map((cat) => (
        <button
          key={cat.value}
          type="button"
          role="tab"
          aria-selected={selected === cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            "min-h-11 rounded-full px-4 text-sm font-medium transition-all",
            "hover:scale-105 active:scale-95",
            selected === cat.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-slate-100 text-muted-foreground hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
