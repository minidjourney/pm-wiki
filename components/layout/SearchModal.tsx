"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, Bike, Zap, Circle, CircleDot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { PmModel } from "@/types/database";
import type { ChronicDefect } from "@/types/database";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  kickboard: "전동킥보드",
  ebike: "전기자전거",
  scooter: "스쿠터",
  unicycle: "전동 외발휠",
};

function getCategoryIcon(category: string) {
  switch (category) {
    case "ebike":
      return <Bike className="size-4 shrink-0 text-slate-400" />;
    case "kickboard":
      return <Zap className="size-4 shrink-0 text-slate-400" />;
    case "scooter":
      return <Circle className="size-4 shrink-0 text-slate-400" />;
    case "unicycle":
      return <CircleDot className="size-4 shrink-0 text-slate-400" />;
    default:
      return <Search className="size-4 shrink-0 text-slate-400" />;
  }
}

function getSearchableText(model: PmModel): string {
  const defects = (model.chronic_defects ?? []) as ChronicDefect[];
  const defectText = defects.map((d) => d.issue).join(" ");
  return [
    model.model_name,
    model.manufacturer,
    model.sub_model ?? "",
    defectText,
  ]
    .filter(Boolean)
    .join(" ");
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [models, setModels] = useState<PmModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setModels([]);
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("pm_models")
      .select("*")
      .eq("status", "published")
      .then(({ data, error }) => {
        setLoading(false);
        if (!error && data) setModels((data as PmModel[]) ?? []);
      });
  }, [open]);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    router.push(`/models/${slug}`);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="기기 검색"
      description="모델명, 제조사, 고질병 키워드로 검색하세요."
      className="max-w-2xl"
    >
      <CommandInput placeholder="모델명, 제조사, 고질병 검색..." />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">목록 불러오는 중...</p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-foreground">검색 결과가 없습니다</p>
              <p className="mt-1 text-xs text-muted-foreground">
                다른 키워드로 시도해 보세요.
              </p>
            </div>
          )}
        </CommandEmpty>
        <CommandGroup heading="모델">
          {models.slice(0, 30).map((m) => (
            <CommandItem
              key={m.id}
              value={getSearchableText(m)}
              onSelect={() => handleSelect(m.slug)}
              className="cursor-pointer py-3"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {getCategoryIcon(m.category ?? "")}
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {m.model_name}
                      {m.sub_model ? ` ${m.sub_model}` : ""}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {m.manufacturer}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {(m as { pm_score?: number }).pm_score != null && (
                    <span className="flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Trophy className="size-3" />
                      {(m as { pm_score?: number }).pm_score}점
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {CATEGORY_LABEL[m.category ?? ""] ?? m.category ?? "—"}
                  </span>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
