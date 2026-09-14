import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import {
  Battery,
  Gauge,
  Weight,
  Wrench,
  Zap,
  Plug,
  Activity,
  Timer,
  CircleDashed,
  Octagon,
  Ruler,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import {
  absoluteUrl,
  buildAnswerCapsuleEn,
  buildModelDescriptionEn,
  buildModelFaqsEn,
} from "@/lib/seo";
import {
  brandedModelTitle,
  displayModelNameWithoutBrand,
  pickLocalizedArray,
  pickLocalizedStringArray,
  pickLocalizedText,
} from "@/lib/locale";
import { uiCopy } from "@/lib/ui-copy";
import { EnModelView } from "./EnModelView";

export const revalidate = 300;

const getSupabase = () => createStaticClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("pm_models")
    .select(
      "model_name, model_name_en, manufacturer, one_line_summary, one_line_summary_en, used_price_min_usd, used_price_max_usd, original_price_usd, range_official, weight, image_url, category"
    )
    .eq("slug", slug)
    .single();
  if (!data) return { title: "Model not found - PM Wiki" };

  const title = `${brandedModelTitle(data, "en")} used price, specs & issues | PM Wiki`;
  const description = buildModelDescriptionEn(data);
  const url = absoluteUrl(`/en/models/${slug}`);
  const images = data.image_url ? [{ url: data.image_url }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: "Pumo Wiki",
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: data.image_url ? [data.image_url] : undefined,
    },
  };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data: model, error } = await supabase.from("pm_models").select("*").eq("slug", slug).single();

  if (error || !model) notFound();

  const displayName = displayModelNameWithoutBrand(model, "en");
  const t = uiCopy("en");
  const oneLineSummary = pickLocalizedText(
    model.one_line_summary_en,
    model.one_line_summary
  );
  const modelForSeo = { ...model, one_line_summary: oneLineSummary, model_name: displayName };
  const faqs = buildModelFaqsEn(modelForSeo, displayName);
  const answerCapsule = buildAnswerCapsuleEn(modelForSeo, displayName);

  const defects = pickLocalizedArray(model.chronic_defects_en, model.chronic_defects) as any[];
  const checklist = pickLocalizedArray(model.used_checklist_en, model.used_checklist) as any[];
  const pros = pickLocalizedStringArray(model.pros_en, model.pros);
  const cons = pickLocalizedStringArray(model.cons_en, model.cons);
  const brakeType = pickLocalizedText(model.brake_type_en, model.brake_type);
  const suspensionType = pickLocalizedText(model.suspension_type_en, model.suspension_type);
  const batteryCheckMethod = pickLocalizedText(
    model.battery_check_method_en,
    model.battery_check_method
  );
  const dimensions = pickLocalizedText(model.dimensions_en, model.dimensions);
  const chargerSpec = pickLocalizedText(model.charger_spec_en, model.charger_spec);

  const specCards: { label: string; value: string | number; icon: ReactElement }[] = [];
  if (model.release_year) specCards.push({ label: t.specs.releaseYear, value: t.yearSuffix(model.release_year), icon: <Calendar className="size-3.5" /> });
  if (model.max_speed) specCards.push({ label: t.specs.maxSpeed, value: `${model.max_speed}km/h`, icon: <Timer className="size-3.5" /> });
  if (model.range_official) specCards.push({ label: t.specs.rangeOfficial, value: `${model.range_official}km`, icon: <Gauge className="size-3.5" /> });
  if (model.motor_power_rated) specCards.push({ label: t.specs.motorRated, value: `${model.motor_power_rated}W`, icon: <Activity className="size-3.5" /> });
  if (model.motor_power_peak) specCards.push({ label: t.specs.motorPeak, value: `${model.motor_power_peak}W`, icon: <Zap className="size-3.5" /> });
  if (model.battery_wh) specCards.push({ label: t.specs.batteryWh, value: `${model.battery_wh}Wh`, icon: <Battery className="size-3.5" /> });
  if (model.nominal_voltage && model.battery_capacity) specCards.push({ label: t.specs.batteryDetail, value: `${model.nominal_voltage}V ${model.battery_capacity}Ah`, icon: <Plug className="size-3.5" /> });
  if (model.charge_time) specCards.push({ label: t.specs.chargeTime, value: t.hoursApprox(model.charge_time), icon: <Clock className="size-3.5" /> });
  if (model.max_load) specCards.push({ label: t.specs.maxLoad, value: `${model.max_load}kg`, icon: <User className="size-3.5" /> });
  if (model.weight) specCards.push({ label: t.specs.weight, value: `${model.weight}kg`, icon: <Weight className="size-3.5" /> });
  if (model.tire_size) specCards.push({ label: t.specs.tireSize, value: `${model.tire_size}″`, icon: <CircleDashed className="size-3.5" /> });
  if (brakeType) specCards.push({ label: t.specs.brake, value: brakeType, icon: <Octagon className="size-3.5" /> });
  if (suspensionType) specCards.push({ label: t.specs.suspension, value: suspensionType, icon: <Wrench className="size-3.5" /> });
  if (dimensions) specCards.push({ label: t.specs.dimensions, value: dimensions, icon: <Ruler className="size-3.5" /> });

  return (
    <EnModelView
      model={model}
      displayName={displayName}
      t={t}
      oneLineSummary={oneLineSummary}
      answerCapsule={answerCapsule}
      faqs={faqs}
      defects={defects}
      checklist={checklist}
      pros={pros}
      cons={cons}
      brakeType={brakeType}
      suspensionType={suspensionType}
      batteryCheckMethod={batteryCheckMethod}
      chargerSpec={chargerSpec}
      dimensions={dimensions}
      specCards={specCards}
    />
  );
}

export async function generateStaticParams() {
  const supabase = getSupabase();
  const { data } = await supabase.from("pm_models").select("slug").eq("status", "published");
  return (data ?? []).map((row) => ({ slug: row.slug }));
}
