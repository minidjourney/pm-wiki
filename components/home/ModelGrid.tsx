"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PmModel, PmCategory } from "@/types/database";
import { CategoryFilter } from "./CategoryFilter";
import { ModelCard } from "./ModelCard";

const PAGE_SIZE = 24;

const VALID_CATEGORIES: PmCategory[] = [
  "kickboard",
  "ebike",
  "scooter",
  "unicycle",
];

function parseCategory(
  value: string | null
): "all" | PmCategory {
  if (value && VALID_CATEGORIES.includes(value as PmCategory)) {
    return value as PmCategory;
  }
  return "all";
}

interface ModelGridProps {
  models: PmModel[];
}

export function ModelGrid({ models }: ModelGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = parseCategory(searchParams.get("category"));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  const setSelectedCategory = (category: "all" | PmCategory) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filteredModels = useMemo(() => {
    if (selectedCategory === "all") return models;
    return models.filter((m) => m.category === selectedCategory);
  }, [models, selectedCategory]);

  const visibleModels = filteredModels.slice(0, visibleCount);
  const hasMore = visibleCount < filteredModels.length;
  const remaining = filteredModels.length - visibleCount;

  return (
    <div className="space-y-5 sm:space-y-6">
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      {filteredModels.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {visibleModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
          {hasMore && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-sm text-muted-foreground">
                {filteredModels.length}개 중 {visibleModels.length}개 표시 중
              </p>
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="min-h-11 min-w-[8rem] rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                더 보기 ({remaining}개 남음)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-100 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-muted-foreground">
            선택한 카테고리에 해당하는 기기가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
