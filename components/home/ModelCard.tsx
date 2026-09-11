"use client";

import Link from "next/link";
import type { PmModel } from "@/types/database";
import { Gauge, Weight, Zap, GaugeCircle, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { calculateValueScore } from "@/lib/pm-score";
import { useCompareStore, MAX_COMPARE_COUNT } from "@/store/useCompareStore";

const CATEGORY_LABEL: Record<string, string> = {
  kickboard: "전동킥보드",
  ebike: "전기자전거",
  scooter: "전동스쿠터",
  unicycle: "전동 외발휠",
};

function formatPrice(value: number | null) {
  if (value == null || value === 0) return "가격 정보 없음";
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만 원`;
  return `${value.toLocaleString()}원`;
}

interface ModelCardProps {
  model: PmModel;
}

export function ModelCard({ model }: ModelCardProps) {
  const add = useCompareStore((s) => s.add);
  const remove = useCompareStore((s) => s.remove);
  const has = useCompareStore((s) => s.has);
  const count = useCompareStore((s) => s.items.length);

  const categoryLabel = CATEGORY_LABEL[model.category] ?? model.category;
  const hasPrice = model.original_price != null && model.original_price > 0;
  const hasRange = model.range_real_80kg != null && model.range_real_80kg > 0;
  const hasWeight = model.weight != null && model.weight > 0;
  const hasPowerOrSpeed =
    (model.motor_power_peak != null && model.motor_power_peak > 0) ||
    (model.max_speed != null && model.max_speed > 0);

  const valueScore = calculateValueScore(model);
  const inCompare = has(model.slug);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      remove(model.slug);
    } else {
      if (count >= MAX_COMPARE_COUNT) return;
      add({
        slug: model.slug,
        model_name: model.model_name,
        manufacturer: model.manufacturer,
      });
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        "dark:border-slate-800 dark:bg-slate-900"
      )}
    >
      {/* 카드 링크 (비교 버튼과 중첩되지 않도록 별도 레이어) */}
      <Link
        href={`/models/${model.slug}`}
        prefetch={true}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`${model.manufacturer} ${model.model_name} 상세 보기`}
      />

      {/* 상단: 카테고리 뱇지 + 비교함 담기 + 가성비 + 단종 */}
      <div className="relative z-10 mb-3 flex items-start justify-between gap-2">
        <span className="pointer-events-none rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-slate-800">
          {categoryLabel}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCompareClick}
            title={inCompare ? "비교함에서 제거" : "VS 비교함 담기"}
            aria-pressed={inCompare}
            className={cn(
              "relative z-10 flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
              inCompare
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-muted-foreground hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            )}
          >
            <Scale className="size-3.5" />
            {inCompare ? "담김" : "VS 담기"}
          </button>
          {valueScore != null && (
            <Badge
              variant="default"
              className="pointer-events-none bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
            >
              ⚡가성비 {valueScore}점
            </Badge>
          )}
          {model.is_discontinued && (
            <span className="pointer-events-none rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-200">
              단종
            </span>
          )}
        </div>
      </div>

      {/* 제목부 */}
      <div className="pointer-events-none relative z-10 mb-3">
        <p className="text-xs font-medium text-muted-foreground">
          {model.manufacturer}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
          {model.model_name}
          {model.sub_model && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {model.sub_model}
            </span>
          )}
        </h3>
      </div>

      {/* 가격부: 신품가 */}
      {hasPrice ? (
        <div className="pointer-events-none relative z-10 mb-3 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
          <p className="text-xs text-muted-foreground">신품가</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(model.original_price)}
          </p>
        </div>
      ) : (
        <div className="pointer-events-none relative z-10 mb-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
          <p className="text-xs text-muted-foreground">가격 정보 없음</p>
        </div>
      )}

      {/* 스펙 요약 */}
      <div className="pointer-events-none relative z-10 mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {hasRange && (
          <div className="flex items-center gap-1.5">
            <Gauge className="size-3.5 shrink-0" />
            <span className="font-medium">{model.range_real_80kg}km</span>
          </div>
        )}
        {hasWeight && (
          <div className="flex items-center gap-1.5">
            <Weight className="size-3.5 shrink-0" />
            <span className="font-medium">{model.weight}kg</span>
          </div>
        )}
        {hasPowerOrSpeed && (
          <div className="flex items-center gap-1.5">
            {model.motor_power_peak != null && model.motor_power_peak > 0 ? (
              <>
                <Zap className="size-3.5 shrink-0" />
                <span className="font-medium">{model.motor_power_peak}W</span>
              </>
            ) : model.max_speed != null && model.max_speed > 0 ? (
              <>
                <GaugeCircle className="size-3.5 shrink-0" />
                <span className="font-medium">{model.max_speed}km/h</span>
              </>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
