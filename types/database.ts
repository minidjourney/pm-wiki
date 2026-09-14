/**
 * PM-Wiki Supabase DB 스키마 기반 TypeScript 타입
 * 확장 스키마 반영 (one_line_summary, pros/cons, 하드웨어 팁, 안전 규정, 추천 위젯 등)
 */

export type PmCategory = "kickboard" | "ebike" | "scooter" | "unicycle";
export type PmStatus = "draft" | "published";

export interface ChronicDefect {
  issue: string;
  frequency: string;
  repair_cost: string | number;
  prevention: string;
}

export interface UsedChecklistItem {
  step: number;
  part: string;
  check_action: string;
  warning_point: string;
}

export interface AffiliateLink {
  type: string;
  name: string;
  url: string;
}

export interface PmModel {
  id: string;
  status: PmStatus;
  category: PmCategory;
  manufacturer: string;
  /** 한국어 노출명 (UI / SEO / JSON-LD) */
  model_name: string;
  /** 영문 원본명 (en 라우트·내부용) */
  model_name_en?: string | null;
  slug: string;
  /** 모델 대표 이미지 URL */
  image_url?: string | null;
  /** 선택: 서브 모델명 (예: 프로, 라이트) */
  sub_model?: string | null;
  /** 한 줄 총평 (Hero 강조용) */
  one_line_summary?: string | null;
  /** English one-line summary (/en); fallback to one_line_summary */
  one_line_summary_en?: string | null;
  original_price: number;
  used_price_s: number;
  used_price_a: number;
  /** 중고 시세 최저가 */
  used_price_min?: number | null;
  /** 중고 시세 최고가 */
  used_price_max?: number | null;
  battery_replace_cost: number;
  tire_size: number;
  suspension_type: string;
  /** English suspension label (/en); fallback to suspension_type */
  suspension_type_en?: string | null;
  battery_voltage: number;
  weight: number;
  range_real_80kg: number;
  chronic_defects: ChronicDefect[];
  /** English chronic defects (/en); same jsonb shape; fallback to chronic_defects */
  chronic_defects_en?: ChronicDefect[] | null;
  used_checklist: UsedChecklistItem[];
  /** English used checklist (/en); same jsonb shape; fallback to used_checklist */
  used_checklist_en?: UsedChecklistItem[] | null;
  affiliate_links: AffiliateLink[];
  // 확장 스펙
  motor_power_peak?: number | null;
  battery_capacity?: number | null;
  range_official?: number | null;
  max_speed?: number | null;
  brake_type?: string | null;
  /** English brake label (/en); fallback to brake_type */
  brake_type_en?: string | null;
  is_discontinued?: boolean | null;
  release_year?: number | null;
  dimensions?: string | null;
  // 장단점
  pros?: string[] | null;
  cons?: string[] | null;
  /** English pros (/en); same shape as pros; fallback to pros */
  pros_en?: string[] | null;
  /** English cons (/en); same shape as cons; fallback to cons */
  cons_en?: string[] | null;
  // 하드웨어 팁
  charger_spec?: string | null;
  bluetooth_enabled?: boolean | null;
  battery_check_method?: string | null;
  /** English battery check method (/en); fallback to battery_check_method */
  battery_check_method_en?: string | null;
  // 안전 규정 (경찰청 기준 등)
  safety_rules?: string[] | null;
  /** English safety rules (/en); same shape as safety_rules; fallback to safety_rules */
  safety_rules_en?: string[] | null;
}

/** 추천 위젯 / 목록용 최소 필드 */
export interface PmModelSummary {
  id: string;
  slug: string;
  model_name: string;
  model_name_en?: string | null;
  manufacturer: string;
  used_price_a: number | null;
  range_real_80kg: number | null;
  weight: number | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail_url: string;
  related_models: string[];
  created_at?: string | null;
}
