"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PmModel } from "@/types/database";
import { Gauge, Weight, Zap, GaugeCircle, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  displayModelName,
  getLocaleFromPath,
  localePath,
} from "@/lib/locale";
import { Badge } from "@/components/ui/badge";
import { calculateValueScore } from "@/lib/pm-score";
import { useCompareStore, MAX_COMPARE_COUNT } from "@/store/useCompareStore";

function formatPriceKrw(value: number | null) {
  if (value == null || value === 0) return "가격 정보 없음";
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만 원`;
  return `${value.toLocaleString()}원`;
}

function formatUsd(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** EN: researched USD only — never KRW / never FX. */
function enPriceBlock(model: PmModel): { label: string; value: string } {
  const min = model.used_price_min_usd;
  const max = model.used_price_max_usd;
  const hasUsed =
    min != null && max != null && Number(min) > 0 && Number(max) > 0;
  if (hasUsed) {
    return {
      label: "Used fair price",
      value: `${formatUsd(Number(min))}–${formatUsd(Number(max))}`,
    };
  }
  const orig = model.original_price_usd;
  if (orig != null && Number(orig) > 0) {
    return { label: "MSRP", value: formatUsd(Number(orig)) };
  }
  return { label: "Price", value: "Price TBD" };
}

interface ModelCardProps {
  model: PmModel;
}

export function ModelCard({ model }: ModelCardProps) {
  const locale = getLocaleFromPath(usePathname() ?? "/");
  const displayName = displayModelName(model, locale);
  const isEn = locale === "en";
  const add = useCompareStore((s) => s.add);
  const remove = useCompareStore((s) => s.remove);
  const has = useCompareStore((s) => s.has);
  const count = useCompareStore((s) => s.items.length);

  const categoryLabel =
    (CATEGORY_LABELS[locale] ?? CATEGORY_LABELS.ko)[model.category] ??
    model.category;
  const modelHref = localePath(`/models/${model.slug}`, locale);
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
        model_name: displayName,
        manufacturer: model.manufacturer,
      });
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm sm:p-4",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        "dark:border-slate-800 dark:bg-slate-900"
      )}
    >
      {/* 카드 링크 (비교 버튼과 중첩되지 않도록 별도 레이어) */}
      <Link
        href={modelHref}
        prefetch={true}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={isEn ? `${model.manufacturer} ${displayName} details` : `${model.manufacturer} ${displayName} 상세 보기`}
      />

      {/* 상단: 카테고리 뱃지 + 비교함 담기 + 가성비 + 단종 */}
      <div className="relative z-10 mb-2.5 flex items-start justify-between gap-2">
        <span className="pointer-events-none rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-slate-800">
          {categoryLabel}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={handleCompareClick}
            title={inCompare ? "비교함에서 제거" : "VS 비교함 담기"}
            aria-pressed={inCompare}
            className={cn(
              "relative z-10 inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors",
              inCompare
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-muted-foreground hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            )}
          >
            <Scale className="size-3.5" />
            <span>{inCompare ? "담김" : "VS"}</span>
          </button>
          {valueScore != null && (
            <Badge
              variant="default"
              className="pointer-events-none bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 text-[11px] text-white shadow-sm"
            >
              가성비 {valueScore}
            </Badge>
          )}
          {model.is_discontinued && (
            <span className="pointer-events-none rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-200">
              {isEn ? "Discontinued" : "단종"}
            </span>
          )}
        </div>
      </div>

      {/* 제목부 */}
      <div className="pointer-events-none relative z-10 mb-2.5">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {model.manufacturer}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[15px] font-bold leading-snug text-foreground group-hover:text-primary sm:text-base">
          {displayName}
          {model.sub_model && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {model.sub_model}
            </span>
          )}
        </h3>
      </div>

      {/* 가격부: EN = researched USD (or Price TBD); KO = KRW 신품가 */}
      {isEn ? (
        (() => {
          const en = enPriceBlock(model);
          const isTbd = en.value === "Price TBD";
          return (
            <div
              className={
                isTbd
                  ? "pointer-events-none relative z-10 mb-2.5 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800 sm:py-2"
                  : "pointer-events-none relative z-10 mb-2.5 rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-950/30 sm:py-2"
              }
            >
              <p className="text-[11px] text-muted-foreground">{en.label}</p>
              <p
                className={
                  isTbd
                    ? "text-base font-bold text-muted-foreground sm:text-lg"
                    : "text-base font-bold text-blue-600 sm:text-lg dark:text-blue-400"
                }
              >
                {en.value}
              </p>
            </div>
          );
        })()
      ) : hasPrice ? (
        <div className="pointer-events-none relative z-10 mb-2.5 rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-950/30 sm:py-2">
          <p className="text-[11px] text-muted-foreground">신품가</p>
          <p className="text-base font-bold text-blue-600 sm:text-lg dark:text-blue-400">
            {formatPriceKrw(model.original_price)}
          </p>
        </div>
      ) : (
        <div className="pointer-events-none relative z-10 mb-2.5 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800 sm:py-2">
          <p className="text-xs text-muted-foreground">가격 정보 없음</p>
        </div>
      )}

      {/* 스펙 요약 */}
      <div className="pointer-events-none relative z-10 mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
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
