import type { ReactElement } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
import {
  Battery,
  Gauge,
  Weight,
  Wrench,
  CircleAlert,
  ListChecks,
  DollarSign,
  Zap,
  Calendar,
  Ruler,
  Plug,
  Bluetooth,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { PriceChart } from "@/components/models/PriceChart";
import { UsedMarketSearch } from "@/components/models/UsedMarketSearch";
import { ChecklistAccordion } from "@/components/models/ChecklistAccordion";
import { RecommendationWidget } from "@/components/models/RecommendationWidget";
import type { PmCategory, PmModelSummary } from "@/types/database";

type Props = { params: Promise<{ slug: string }> };

const CATEGORY_LABEL: Record<PmCategory, string> = {
  kickboard: "전동킥보드",
  ebike: "전기자전거",
  scooter: "스쿠터",
  unicycle: "전동 외발휠",
};

const SUMMARY_FIELDS =
  "id,slug,model_name,manufacturer,used_price_a,range_real_80kg,weight";

function formatPrice(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만 원`;
  return `${value.toLocaleString()}원`;
}

/** 추천용 유사 모델 조회 (실패 시 빈 배열, 예외 처리 필수) */
async function fetchSimilarModels(
  currentId: string,
  usedPriceA: number | null,
  rangeReal: number | null,
  weight: number | null
): Promise<{
  byPrice: PmModelSummary[];
  byRange: PmModelSummary[];
  byWeight: PmModelSummary[];
}> {
  const supabase = await createClient();
  const out = {
    byPrice: [] as PmModelSummary[],
    byRange: [] as PmModelSummary[],
    byWeight: [] as PmModelSummary[],
  };

  try {
    if (usedPriceA != null && usedPriceA > 0) {
      const low = Math.max(0, usedPriceA - 100000);
      const high = usedPriceA + 100000;
      const { data } = await supabase
        .from("pm_models")
        .select(SUMMARY_FIELDS)
        .eq("status", "published")
        .neq("id", currentId)
        .gte("used_price_a", low)
        .lte("used_price_a", high)
        .limit(6);
      if (data?.length) out.byPrice = data as PmModelSummary[];
    }
  } catch {
    /* ignore */
  }

  try {
    if (rangeReal != null && rangeReal > 0) {
      const low = Math.max(0, rangeReal - 10);
      const high = rangeReal + 10;
      const { data } = await supabase
        .from("pm_models")
        .select(SUMMARY_FIELDS)
        .eq("status", "published")
        .neq("id", currentId)
        .gte("range_real_80kg", low)
        .lte("range_real_80kg", high)
        .limit(6);
      if (data?.length) out.byRange = data as PmModelSummary[];
    }
  } catch {
    /* ignore */
  }

  try {
    if (weight != null && weight > 0) {
      const { data } = await supabase
        .from("pm_models")
        .select(SUMMARY_FIELDS)
        .eq("status", "published")
        .neq("id", currentId)
        .lt("weight", weight)
        .order("weight", { ascending: true })
        .limit(6);
      if (data?.length) out.byWeight = data as PmModelSummary[];
    }
  } catch {
    /* ignore */
  }

  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("pm_models")
    .select("model_name")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) return { title: "모델 없음 - PM Wiki" };
  return {
    title: `${data.model_name} 중고 거래 적정가 및 고질병 정리 - PM Wiki`,
    description: `${data.model_name} 적정 중고가, 고질병, 직거래 체크리스트 정보`,
  };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: model, error } = await supabase
    .from("pm_models")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !model) notFound();

  const oneLineSummary =
    (model.one_line_summary as string | null) ?? undefined;
  const defects = (model.chronic_defects ?? []) as Array<{
    issue: string;
    frequency: string;
    repair_cost: string | number;
    prevention: string;
  }>;
  const checklist = (model.used_checklist ?? []) as Array<{
    step: number;
    part: string;
    check_action: string;
    warning_point: string;
  }>;
  const pros = (model.pros ?? []) as string[];
  const cons = (model.cons ?? []) as string[];
  const safetyRules = (model.safety_rules ?? []) as string[];

  const similar = await fetchSimilarModels(
    model.id,
    model.used_price_a ?? null,
    model.range_real_80kg ?? null,
    model.weight ?? null
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: model.model_name,
    description:
      model.one_line_summary ?? `${model.model_name} 중고 적정가 및 고질병 정리`,
    brand: { "@type": "Brand", name: model.manufacturer },
    category: CATEGORY_LABEL[model.category as PmCategory] ?? model.category,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "KRW",
      lowPrice: model.used_price_a,
      highPrice: model.original_price,
    },
  };

  const specCards: { label: string; value: string | number; icon: ReactElement }[] = [];
  if (model.range_real_80kg != null)
    specCards.push({
      label: "현실 주행거리",
      value: `${model.range_real_80kg}km`,
      icon: <Gauge className="size-3.5" />,
    });
  if (model.battery_replace_cost != null && model.battery_replace_cost > 0)
    specCards.push({
      label: "배터리 교체비",
      value: formatPrice(model.battery_replace_cost),
      icon: <Battery className="size-3.5" />,
    });
  if (model.weight != null)
    specCards.push({
      label: "무게",
      value: `${model.weight}kg`,
      icon: <Weight className="size-3.5" />,
    });
  if (model.tire_size != null && model.tire_size > 0)
    specCards.push({
      label: "타이어",
      value: `${model.tire_size}인치`,
      icon: <Ruler className="size-3.5" />,
    });
  if (model.battery_voltage != null && model.battery_voltage > 0)
    specCards.push({
      label: "배터리 전압",
      value: `${model.battery_voltage}V`,
      icon: <Battery className="size-3.5" />,
    });
  if (model.suspension_type)
    specCards.push({
      label: "서스펜션",
      value: model.suspension_type,
      icon: <Wrench className="size-3.5" />,
    });
  if (model.motor_power_peak != null && model.motor_power_peak > 0)
    specCards.push({
      label: "모터 출력(피크)",
      value: `${model.motor_power_peak}W`,
      icon: <Zap className="size-3.5" />,
    });
  if (model.battery_capacity != null && model.battery_capacity > 0)
    specCards.push({
      label: "배터리 용량",
      value: `${model.battery_capacity}Wh`,
      icon: <Battery className="size-3.5" />,
    });
  if (model.range_official != null && model.range_official > 0)
    specCards.push({
      label: "공인 주행거리",
      value: `${model.range_official}km`,
      icon: <Gauge className="size-3.5" />,
    });
  if (model.max_speed != null && model.max_speed > 0)
    specCards.push({
      label: "최고 속도",
      value: `${model.max_speed}km/h`,
      icon: <Gauge className="size-3.5" />,
    });
  if (model.brake_type)
    specCards.push({
      label: "브레이크",
      value: model.brake_type,
      icon: <CircleAlert className="size-3.5" />,
    });
  if (model.release_year != null && model.release_year > 0)
    specCards.push({
      label: "출시 연도",
      value: `${model.release_year}년`,
      icon: <Calendar className="size-3.5" />,
    });
  if (model.dimensions)
    specCards.push({
      label: "치수",
      value: model.dimensions,
      icon: <Ruler className="size-3.5" />,
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-slate-50/80 pb-12 md:max-w-2xl md:mx-auto">
        {/* Hero: manufacturer, model_name, sub_model, 뱃지, 퍼모위키 코멘트 */}
        <section className="border-b border-slate-100 bg-white px-4 pt-6 pb-6">
          <p className="text-sm font-medium text-muted-foreground">
            {model.manufacturer}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {model.model_name}
            {model.sub_model && (
              <span className="ml-1.5 text-xl font-normal text-muted-foreground md:text-2xl">
                {model.sub_model}
              </span>
            )}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {CATEGORY_LABEL[model.category as PmCategory] ?? model.category}
            </span>
            {model.is_discontinued && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                단종
              </span>
            )}
          </div>
          {/* 퍼모위키 코멘트 (에디터 추천) */}
          {oneLineSummary && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/80 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  퍼모위키 코멘트
                </span>
              </div>
              <p className="text-base font-medium leading-relaxed text-foreground">
                {oneLineSummary}
              </p>
            </div>
          )}
        </section>

        {model.image_url && (
          <div className="px-4 pt-6">
            <div className="relative overflow-hidden rounded-xl shadow-md">
              <Image
                src={model.image_url}
                alt={model.model_name}
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        )}

        <div className="space-y-6 px-4 pt-6">
          {/* 시세 분석 */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                시세 분석
              </h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              신품가와 중고 시세 범위(최저~최고)
            </p>
            <PriceChart
              originalPrice={model.original_price ?? 0}
              usedPriceMin={model.used_price_min ?? null}
              usedPriceMax={model.used_price_max ?? null}
            />
          </section>

          {/* 실시간 매물 검색 */}
          <UsedMarketSearch modelName={model.model_name} />

          {/* 핵심 스펙 그리드 (확장) */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">
              핵심 스펙
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specCards.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {s.icon}
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 장점(Pros) & 단점(Cons) */}
          {(pros.length > 0 || cons.length > 0) && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">
                장점 · 단점
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pros.length > 0 && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                    <div className="mb-2 flex items-center gap-2">
                      <ThumbsUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        장점
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-emerald-800 dark:text-emerald-200">
                      {pros.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-emerald-500">·</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                    <div className="mb-2 flex items-center gap-2">
                      <ThumbsDown className="size-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                        단점
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-red-800 dark:text-red-200">
                      {cons.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-red-500">·</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 기기 사용 및 충전 팁 */}
          {(model.charger_spec ||
            model.bluetooth_enabled != null ||
            model.battery_check_method) && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Plug className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  기기 사용 및 충전 팁
                </h2>
              </div>
              <div className="space-y-3">
                {model.charger_spec && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      충전기 스펙
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {model.charger_spec}
                    </p>
                  </div>
                )}
                {model.bluetooth_enabled != null && (
                  <div className="flex items-center gap-2">
                    <Bluetooth className="size-4 text-muted-foreground" />
                    <span
                      className={
                        model.bluetooth_enabled
                          ? "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                          : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {model.bluetooth_enabled ? "블루투스 지원" : "블루투스 미지원"}
                    </span>
                  </div>
                )}
                {model.battery_check_method && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      배터리 상태 확인 방법
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {model.battery_check_method}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 안전 규정 (경찰청 기준) */}
          {safetyRules.length > 0 && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  안전 규정 (경찰청 기준)
                </h2>
              </div>
              <ul className="space-y-2">
                {safetyRules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-lg border border-amber-100 bg-amber-50/50 py-2.5 pl-3 pr-3 text-sm text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-100"
                  >
                    <span className="mt-0.5 shrink-0 text-amber-500">▸</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 고질병 · 주의사항 (세련된 경고창) */}
          {defects.length > 0 && (
            <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm dark:border-red-900/30">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  고질병 · 주의사항
                </h2>
              </div>
              <ul className="space-y-3">
                {defects.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-red-200/80 bg-red-50/80 p-4 shadow-sm dark:border-red-800/50 dark:bg-red-950/40"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-1 shrink-0 rounded-full bg-red-200/80 px-2 py-0.5 text-xs font-semibold text-red-900 dark:bg-red-800/80 dark:text-red-100">
                        주의
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-red-900 dark:text-red-100">
                          {d.issue}
                        </p>
                        {d.frequency && (
                          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                            발생 빈도: {d.frequency}
                          </p>
                        )}
                        {d.repair_cost != null && d.repair_cost !== "" && (
                          <p className="mt-2 text-base font-bold text-red-900 dark:text-red-100">
                            예상 수리비: {String(d.repair_cost)}
                          </p>
                        )}
                        {d.prevention && (
                          <p className="mt-2 text-xs text-red-700/90 dark:text-red-300/90">
                            예방: {d.prevention}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 현장 직거래 체크리스트 */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ListChecks className="size-4 text-muted-foreground" />
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                현장 직거래 체크리스트
              </h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              거래 시 꼭 확인할 부위와 점검 방법
            </p>
            <ChecklistAccordion items={checklist} />
          </section>

          {/* 자동 추천 비교 위젯 */}
          <div className="space-y-6">
            {similar.byPrice.length > 0 && (
              <RecommendationWidget
                title="비슷한 가격대 모델 (±10만 원)"
                items={similar.byPrice}
                currentSlug={slug}
              />
            )}
            {similar.byRange.length > 0 && (
              <RecommendationWidget
                title="비슷한 주행거리 모델 (±10km)"
                items={similar.byRange}
                currentSlug={slug}
              />
            )}
            {similar.byWeight.length > 0 && (
              <RecommendationWidget
                title="더 가벼운 모델"
                items={similar.byWeight}
                currentSlug={slug}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pm_models")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((row: { slug: string }) => ({ slug: row.slug }));
}
