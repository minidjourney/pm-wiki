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

interface PriceChartProps {
  originalPrice: number;
  usedPriceMin: number | null;
  usedPriceMax: number | null;
  locale?: "ko" | "en";
}

export function PriceChart({
  originalPrice,
  usedPriceMin,
  usedPriceMax,
  locale = "ko",
}: PriceChartProps) {
  const isEn = locale === "en";
  const hasUsed =
    usedPriceMin != null &&
    usedPriceMax != null &&
    usedPriceMin > 0 &&
    usedPriceMax > 0;

  const chartData: ChartDataItem[] = [
    {
      category: isEn ? "MSRP" : "신품가",
      price: originalPrice,
      label: isEn
        ? `₩${Math.round(originalPrice).toLocaleString("en-US")}`
        : `${(originalPrice / 10000).toFixed(0)}만 원`,
      fill: "#f97316",
    },
    ...(hasUsed
      ? [
          {
            category: isEn ? "Used fair price" : "중고 적정가",
            price: usedPriceMax,
            label: isEn
              ? `₩${Math.round(usedPriceMin!).toLocaleString("en-US")}–₩${Math.round(usedPriceMax).toLocaleString("en-US")}`
              : `${(usedPriceMin! / 10000).toFixed(0)}만 ~ ${(usedPriceMax / 10000).toFixed(0)}만 원`,
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
