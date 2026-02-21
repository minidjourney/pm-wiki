"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
          {loading ? "불러오는 중..." : "검색 결과가 없습니다."}
        </CommandEmpty>
        <CommandGroup heading="모델">
          {models.slice(0, 30).map((m) => (
            <CommandItem
              key={m.id}
              value={getSearchableText(m)}
              onSelect={() => handleSelect(m.slug)}
              className="cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {m.manufacturer} {m.model_name}
                  {m.sub_model ? ` ${m.sub_model}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">{m.slug}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
