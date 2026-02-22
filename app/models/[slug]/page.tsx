import type { ReactElement } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import {
  Battery,
  Gauge,
  Weight,
  Wrench,
  CircleAlert,
  ListChecks,
  DollarSign,
  Zap,
  Plug,
  Bluetooth,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Sparkles,
  Clock,
  User,
  Smartphone,
  Activity,
  Timer,
  CircleDashed,
  Octagon,
  Ruler,
  Calendar,
} from "lucide-react";
import { PriceChart } from "@/components/models/PriceChart";
import { UsedMarketSearch } from "@/components/models/UsedMarketSearch";
import { ChecklistAccordion } from "@/components/models/ChecklistAccordion";
import { RecommendationWidget } from "@/components/models/RecommendationWidget";
import { JsonLd } from "@/components/models/JsonLd";
import type { PmCategory } from "@/types/database";

export const revalidate = 3600;

const getSupabase = () => createStaticClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = { params: Promise<{ slug: string }> };

const CATEGORY_LABEL: Record<string, string> = {
  kickboard: "전동킥보드",
  ebike: "전기자전거",
  scooter: "스쿠터",
  unicycle: "전동 외발휠",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data } = await supabase.from("pm_models").select("model_name").eq("slug", slug).single();
  if (!data) return { title: "모델 없음 - PM Wiki" };
  return { title: `${data.model_name} 중고 거래 적정가 및 상세 스펙 - PM Wiki` };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data: model, error } = await supabase.from("pm_models").select("*").eq("slug", slug).single();

  if (error || !model) notFound();

  const defects = (Array.isArray(model.chronic_defects) ? model.chronic_defects : []) as any[];
  const checklist = (Array.isArray(model.used_checklist) ? model.used_checklist : []) as any[];
  const pros = (Array.isArray(model.pros) ? model.pros : []) as string[];
  const cons = (Array.isArray(model.cons) ? model.cons : []) as string[];

  const specCards: { label: string; value: string | number; icon: ReactElement }[] = [];
  if (model.release_year) specCards.push({ label: "출시 연도", value: `${model.release_year}년`, icon: <Calendar className="size-3.5" /> });
  if (model.max_speed) specCards.push({ label: "최고 속도", value: `${model.max_speed}km/h`, icon: <Timer className="size-3.5" /> });
  if (model.range_official) specCards.push({ label: "공식 주행거리", value: `${model.range_official}km`, icon: <Gauge className="size-3.5" /> });
  if (model.motor_power_rated) specCards.push({ label: "정격 출력", value: `${model.motor_power_rated}W`, icon: <Activity className="size-3.5" /> });
  if (model.motor_power_peak) specCards.push({ label: "최대 출력", value: `${model.motor_power_peak}W`, icon: <Zap className="size-3.5" /> });
  if (model.battery_wh) specCards.push({ label: "배터리 전력량", value: `${model.battery_wh}Wh`, icon: <Battery className="size-3.5" /> });
  if (model.nominal_voltage && model.battery_capacity) specCards.push({ label: "배터리 상세", value: `${model.nominal_voltage}V ${model.battery_capacity}Ah`, icon: <Plug className="size-3.5" /> });
  if (model.charge_time) specCards.push({ label: "충전 소요시간", value: `약 ${model.charge_time}시간`, icon: <Clock className="size-3.5" /> });
  if (model.max_load) specCards.push({ label: "최대 하중", value: `${model.max_load}kg`, icon: <User className="size-3.5" /> });
  if (model.weight) specCards.push({ label: "기체 무게", value: `${model.weight}kg`, icon: <Weight className="size-3.5" /> });
  if (model.tire_size) specCards.push({ label: "타이어 크기", value: `${model.tire_size}인치`, icon: <CircleDashed className="size-3.5" /> });
  if (model.brake_type) specCards.push({ label: "브레이크", value: model.brake_type, icon: <Octagon className="size-3.5" /> });
  if (model.suspension_type) specCards.push({ label: "서스펜션", value: model.suspension_type, icon: <Wrench className="size-3.5" /> });
  if (model.dimensions) specCards.push({ label: "기체 크기", value: model.dimensions, icon: <Ruler className="size-3.5" /> });

  return (
    <>
      <JsonLd model={model} />
      <main className="min-h-screen bg-slate-50/80 pb-12 md:max-w-2xl md:mx-auto">
        <section className="border-b border-slate-100 bg-white px-4 pt-6 pb-6">
          <p className="text-sm font-medium text-muted-foreground">{model.manufacturer}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {model.model_name}
            {model.sub_model && <span className="ml-1.5 text-xl font-normal text-muted-foreground">{model.sub_model}</span>}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {CATEGORY_LABEL[model.category] || model.category}
            </span>
            {model.is_discontinued && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">단종</span>
            )}
          </div>
          {model.one_line_summary && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/80 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="size-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">전문가 코멘트</span>
              </div>
              <p className="text-base font-medium leading-relaxed text-foreground">{model.one_line_summary}</p>
            </div>
          )}
        </section>

        {model.image_url && !model.image_url.includes('placeholder') && (
          <div className="px-4 pt-6">
            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/50 p-8 shadow-inner dark:from-slate-800/50 dark:to-slate-900/50">
              {/* 뒷배경 은은한 빛 효과 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4/5 w-4/5 rounded-full bg-white/60 blur-3xl dark:bg-blue-900/20"></div>
              </div>
              {/* 실제 이미지 */}
              <div className="relative z-10 w-full max-w-[280px] drop-shadow-2xl sm:max-w-[340px]">
                <Image
                  src={model.image_url}
                  alt={model.model_name}
                  width={800}
                  height={800}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 px-4 pt-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">시세 분석</h2>
            </div>
            <PriceChart originalPrice={model.original_price ?? 0} usedPriceMin={model.used_price_min} usedPriceMax={model.used_price_max} />
          </section>

          <UsedMarketSearch modelName={model.model_name} />

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">핵심 스펙</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specCards.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {s.icon}
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          {(model.charger_spec || model.app_integration_available != null || model.battery_check_method) && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Plug className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">기기 사용 및 관리 팁</h2>
              </div>
              <div className="space-y-3">
                {model.app_integration_available != null && (
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <span className={model.app_integration_available ? "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800" : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"}>
                      {model.app_integration_available ? "정품 스마트폰 앱 연동 지원" : "전용 앱 미지원"}
                    </span>
                  </div>
                )}
                {model.charger_spec && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">권장 충전기 스펙</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{model.charger_spec}</p>
                  </div>
                )}
                {model.battery_check_method && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">배터리 상태 확인 방법</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{model.battery_check_method}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {(pros.length > 0 || cons.length > 0) && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">장점 · 단점</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pros.length > 0 && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2"><ThumbsUp className="size-4 text-emerald-600" /><span className="text-sm font-semibold">장점</span></div>
                    <ul className="space-y-1.5 text-sm text-emerald-800">{pros.map((p: string, i: number) => <li key={i}>· {p}</li>)}</ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2"><ThumbsDown className="size-4 text-red-600" /><span className="text-sm font-semibold">단점</span></div>
                    <ul className="space-y-1.5 text-sm text-red-800">{cons.map((c: string, i: number) => <li key={i}>· {c}</li>)}</ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {defects.length > 0 && (
            <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2"><AlertTriangle className="size-4 text-red-600" /><h2 className="text-base font-semibold text-foreground">고질병 · 주의사항</h2></div>
              <ul className="space-y-3">
                {defects.map((d: any, i: number) => {
                  const defectText = typeof d === 'object' && d !== null ? d.issue : d;
                  return (
                    <li key={i} className="rounded-xl border border-red-200/80 bg-red-50/80 p-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-900">주의</span>
                        <p className="text-sm font-medium leading-relaxed text-red-950">{defectText}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {checklist.length > 0 && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2"><ListChecks className="size-4 text-muted-foreground" /><h2 className="text-base font-semibold text-foreground">현장 직거래 체크리스트</h2></div>
              <ChecklistAccordion items={checklist} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export async function generateStaticParams() {
  const supabase = getSupabase();
  const { data } = await supabase.from("pm_models").select("slug").eq("status", "published");
  return (data ?? []).map((row) => ({ slug: row.slug }));
}
