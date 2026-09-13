"use client";

import type { PmCategory } from "@/types/database";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<{ value: "all" | PmCategory; label: string }> = [
  { value: "all", label: "전체" },
  { value: "kickboard", label: "전동킥보드" },
  { value: "ebike", label: "전기자전거" },
  { value: "scooter", label: "전동스쿠터" },
  { value: "unicycle", label: "전동 외발휠" },
];

interface CategoryFilterProps {
  selected: "all" | PmCategory;
  onSelect: (category: "all" | PmCategory) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      role="tablist"
      aria-label="카테고리 필터"
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          role="tab"
          aria-selected={selected === cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            "min-h-11 shrink-0 snap-start rounded-full px-4 text-sm font-medium transition-all",
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
