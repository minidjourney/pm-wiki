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
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-all",
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
