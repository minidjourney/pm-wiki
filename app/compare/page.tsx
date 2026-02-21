"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCompareStore } from "@/store/useCompareStore";
import { calculateValueScore } from "@/lib/pm-score";
import type { PmModel } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function formatPrice(value: number | null) {
  if (value == null || value === 0) return "—";
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만 원`;
  return `${value.toLocaleString()}원`;
}

export default function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const slugs = items.map((i) => i.slug);
  const clear = useCompareStore((s) => s.clear);
  const [models, setModels] = useState<PmModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slugs.length === 0) {
      setLoading(false);
      setModels([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("pm_models")
      .select("*")
      .eq("status", "published")
      .in("slug", slugs)
      .then(({ data, error }) => {
        setLoading(false);
        if (!error && data) {
          const ordered = slugs.map(
            (slug) => (data as PmModel[]).find((m) => m.slug === slug)
          ).filter(Boolean) as PmModel[];
          setModels(ordered);
        } else {
          setModels([]);
        }
      });
  }, [slugs.join(",")]);

  if (slugs.length < 2) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-xl font-bold text-foreground">모델 비교</h1>
          <p className="mt-2 text-muted-foreground">
            비교하려면 홈에서 기기 카드의 &quot;VS 담기&quot;로 2개 이상 담아주세요.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">
              <ArrowLeft className="mr-2 size-4" />
              홈으로
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-center text-muted-foreground">비교 데이터 불러오는 중...</p>
      </main>
    );
  }

  function formatUsedRange(m: PmModel): string {
    const min = m.used_price_min;
    const max = m.used_price_max;
    if (min == null || max == null || min === 0) return "정보 없음";
    return `${(min / 10000).toFixed(0)}만 ~ ${(max / 10000).toFixed(0)}만 원`;
  }

  const rows: Array<{ label: string; key: string; get: (m: PmModel) => string | number }> = [
    { label: "모델명", key: "name", get: (m) => `${m.manufacturer} ${m.model_name}` },
    { label: "신품가", key: "op", get: (m) => formatPrice(m.original_price ?? null) },
    { label: "중고 적정 시세", key: "used_range", get: formatUsedRange },
    { label: "배터리 용량 (Wh)", key: "cap", get: (m) => m.battery_capacity ?? "—" },
    { label: "모터 출력 (W)", key: "motor", get: (m) => m.motor_power_peak ?? "—" },
    { label: "무게 (kg)", key: "weight", get: (m) => m.weight ?? "—" },
    { label: "현실 주행거리 (km)", key: "range", get: (m) => m.range_real_80kg ?? "—" },
    {
      label: "퍼모위키 스코어",
      key: "score",
      get: (m) => {
        const s = calculateValueScore(m);
        return s != null ? `${s}점` : "—";
      },
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-1 size-4" />
              홈
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            스펙 비교
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => clear()}>
          비교함 비우기
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] font-semibold">스펙</TableHead>
              {models.map((m) => (
                <TableHead key={m.id} className="min-w-[160px] font-semibold">
                  <Link
                    href={`/models/${m.slug}`}
                    className="text-primary hover:underline"
                  >
                    {m.manufacturer} {m.model_name}
                  </Link>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="font-medium text-muted-foreground">
                  {row.label}
                </TableCell>
                {models.map((m) => (
                  <TableCell key={m.id}>{String(row.get(m))}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
