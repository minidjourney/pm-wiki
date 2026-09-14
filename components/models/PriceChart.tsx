"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataItem {
  category: string;
  price: number;
  label: string;
  fill: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
}) {
  if (!active || !payload?.length) return null;
  const { category, label } = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{category}</p>
      <p className="mt-1 font-semibold tabular-nums text-foreground">{label}</p>
    </div>
  );
}

function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

interface PriceChartProps {
  /** KO MSRP (KRW). Ignored on EN when USD fields are used. */
  originalPrice: number;
  usedPriceMin: number | null;
  usedPriceMax: number | null;
  locale?: "ko" | "en";
  /** Researched EN-market USD (no FX). */
  originalPriceUsd?: number | null;
  usedPriceMinUsd?: number | null;
  usedPriceMaxUsd?: number | null;
}

export function PriceChart({
  originalPrice,
  usedPriceMin,
  usedPriceMax,
  locale = "ko",
  originalPriceUsd = null,
  usedPriceMinUsd = null,
  usedPriceMaxUsd = null,
}: PriceChartProps) {
  const isEn = locale === "en";

  if (isEn) {
    const hasUsedUsd =
      usedPriceMinUsd != null &&
      usedPriceMaxUsd != null &&
      usedPriceMinUsd > 0 &&
      usedPriceMaxUsd > 0;
    const hasOrigUsd = originalPriceUsd != null && originalPriceUsd > 0;

    if (!hasUsedUsd && !hasOrigUsd) {
      return (
        <div className="flex h-[240px] w-full items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-muted-foreground dark:bg-slate-900/40">
          Price TBD
        </div>
      );
    }

    const chartData: ChartDataItem[] = [
      ...(hasOrigUsd
        ? [
            {
              category: "MSRP",
              price: originalPriceUsd!,
              label: formatUsd(originalPriceUsd!),
              fill: "#f97316",
            },
          ]
        : []),
      ...(hasUsedUsd
        ? [
            {
              category: "Used fair price",
              price: usedPriceMaxUsd!,
              label: `${formatUsd(usedPriceMinUsd!)}–${formatUsd(usedPriceMaxUsd!)}`,
              fill: "#0f766e",
            },
          ]
        : []),
    ];

    const maxPrice = Math.max(...chartData.map((d) => d.price), 1);

    return (
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 28, right: 12, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              domain={[0, maxPrice * 1.1]}
              tickFormatter={(v) => `$${Math.round(Number(v)).toLocaleString("en-US")}`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="price" radius={[4, 4, 0, 0]} maxBarSize={80}>
              <LabelList dataKey="label" position="top" className="text-xs font-medium" />
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // KO — KRW only (unchanged)
  const hasUsed =
    usedPriceMin != null &&
    usedPriceMax != null &&
    usedPriceMin > 0 &&
    usedPriceMax > 0;

  const chartData: ChartDataItem[] = [
    {
      category: "신품가",
      price: originalPrice,
      label: `${(originalPrice / 10000).toFixed(0)}만 원`,
      fill: "#f97316",
    },
    ...(hasUsed
      ? [
          {
            category: "중고 적정가",
            price: usedPriceMax,
            label: `${(usedPriceMin! / 10000).toFixed(0)}만 ~ ${(usedPriceMax / 10000).toFixed(0)}만 원`,
            fill: "#0f766e",
          },
        ]
      : []),
  ];

  const maxPrice = Math.max(
    originalPrice,
    ...chartData.map((d) => d.price)
  );

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 28, right: 12, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            domain={[0, maxPrice * 1.1]}
            tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="price" radius={[4, 4, 0, 0]} maxBarSize={80}>
            <LabelList dataKey="label" position="top" className="text-xs font-medium" />
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
