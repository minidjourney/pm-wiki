"use client";

import { useState, useMemo } from "react";
import type { PmModel, PmCategory } from "@/types/database";
import { CategoryFilter } from "./CategoryFilter";
import { ModelCard } from "./ModelCard";

interface ModelGridProps {
  models: PmModel[];
}

export function ModelGrid({ models }: ModelGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | PmCategory>("all");

  const filteredModels = useMemo(() => {
    if (selectedCategory === "all") return models;
    return models.filter((m) => m.category === selectedCategory);
  }, [models, selectedCategory]);

  return (
    <div className="space-y-6">
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
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
