import type { PmCategory, PmModel, RankingSignalScores } from "@/types/database";
import type { LocaleCode } from "@/lib/locale";
import { pickTopByCategory } from "@/lib/retention";

/** 카드가 실제로 읽는 값만 전달한다. 상세 설명·배열은 상세 페이지에 남긴다. */
export type ModelCardData = Pick<
  PmModel,
  | "id"
  | "slug"
  | "category"
  | "manufacturer"
  | "model_name"
  | "model_name_en"
  | "sub_model"
  | "original_price"
  | "used_price_min_usd"
  | "used_price_max_usd"
  | "original_price_usd"
  | "range_real_80kg"
  | "weight"
  | "motor_power_peak"
  | "max_speed"
  | "battery_capacity"
  | "is_discontinued"
>;

export type HomeCategory = "all" | PmCategory;
export type HomeTopByCategory = Record<HomeCategory, ModelCardData[]>;

export function toModelCard(model: PmModel): ModelCardData {
  return {
    id: model.id,
    slug: model.slug,
    category: model.category,
    manufacturer: model.manufacturer,
    model_name: model.model_name,
    model_name_en: model.model_name_en,
    sub_model: model.sub_model,
    original_price: model.original_price,
    used_price_min_usd: model.used_price_min_usd,
    used_price_max_usd: model.used_price_max_usd,
    original_price_usd: model.original_price_usd,
    range_real_80kg: model.range_real_80kg,
    weight: model.weight,
    motor_power_peak: model.motor_power_peak,
    max_speed: model.max_speed,
    battery_capacity: model.battery_capacity,
    is_discontinued: model.is_discontinued,
  };
}

export function buildHomePayload(
  models: PmModel[],
  locale: LocaleCode,
  signalsByModelId: Record<string, RankingSignalScores | null | undefined>
) {
  // 기존 정렬 함수·전체 입력·안정 정렬 순서를 그대로 사용한다.
  const categories: HomeCategory[] = ["all", "kickboard", "ebike", "scooter", "unicycle"];
  const topByCategory = {} as HomeTopByCategory;
  for (const category of categories) {
    topByCategory[category] = pickTopByCategory(models, category, {
      locale,
      limit: 10,
      signalsByModelId,
    }).map(toModelCard);
  }
  return { models: models.map(toModelCard), topByCategory };
}
