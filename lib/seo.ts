import { SITE_URL } from "@/lib/site";
import { brandedModelTitle, pickLocalizedArray } from "@/lib/locale";

export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatKrw(n: number | null | undefined): string | null {
  if (n == null || Number.isNaN(Number(n))) return null;
  return `${Math.round(Number(n)).toLocaleString("ko-KR")}원`;
}

export function formatUsd(n: number | null | undefined): string | null {
  if (n == null || Number.isNaN(Number(n)) || Number(n) <= 0) return null;
  return `$${Math.round(Number(n)).toLocaleString("en-US")}`;
}

export function buildModelDescription(model: {
  manufacturer?: string | null;
  model_name?: string | null;
  one_line_summary?: string | null;
  used_price_min?: number | null;
  used_price_max?: number | null;
  range_official?: number | null;
  weight?: number | null;
}): string {
  const name = brandedModelTitle(
    {
      model_name: model.model_name ?? "",
      manufacturer: model.manufacturer,
    },
    "ko"
  );
  const parts: string[] = [`${name} 중고 시세·스펙·고질병 가이드.`];
  const min = formatKrw(model.used_price_min);
  const max = formatKrw(model.used_price_max);
  if (min && max) parts.push(`중고가 약 ${min}~${max}.`);
  if (model.range_official) parts.push(`공식 주행거리 ${model.range_official}km.`);
  if (model.weight) parts.push(`무게 ${model.weight}kg.`);
  if (model.one_line_summary) parts.push(String(model.one_line_summary));
  return parts.join(" ").slice(0, 160);
}

export type FaqItem = { question: string; answer: string };

function defectText(item: unknown): string | null {
  if (typeof item === "string") return item;
  if (item && typeof item === "object" && "issue" in item) {
    const issue = (item as { issue?: unknown }).issue;
    return typeof issue === "string" ? issue : null;
  }
  return null;
}

function checklistText(item: unknown): string | null {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  if (typeof row.title === "string" && typeof row.description === "string") {
    return `${row.title}: ${row.description}`;
  }
  if (typeof row.part === "string" && typeof row.check_action === "string") {
    return `${row.part}: ${row.check_action}`;
  }
  if (typeof row.issue === "string") return row.issue;
  return null;
}

/** GEO용 FAQ — 페이지에 노출하는 문구와 JSON-LD가 동일해야 함 */
export function buildModelFaqs(model: any): FaqItem[] {
  const faqs: FaqItem[] = [];
  const name = String(model.model_name ?? "이 모델");
  const min = formatKrw(model.used_price_min);
  const max = formatKrw(model.used_price_max);
  const orig = formatKrw(model.original_price);

  if (min && max) {
    faqs.push({
      question: `${name} 중고 적정가는 얼마인가요?`,
      answer: `${name}의 국내 중고 시세는 약 ${min}~${max} 구간으로 보고 있습니다.${orig ? ` 신품가는 약 ${orig}입니다.` : ""} 상태·배터리 잔량·사고 이력에 따라 편차가 있으니 직거래 전 전압과 소모품을 확인하세요.`,
    });
  }

  const defects = Array.isArray(model.chronic_defects) ? model.chronic_defects : [];
  const defectJoined = defects.map(defectText).filter(Boolean).slice(0, 5).join("; ");
  if (defectJoined) {
    faqs.push({
      question: `${name}의 고질병·주의사항은 무엇인가요?`,
      answer: defectJoined,
    });
  }

  const checklist = Array.isArray(model.used_checklist) ? model.used_checklist : [];
  const checkJoined = checklist.map(checklistText).filter(Boolean).slice(0, 4).join(" ");
  if (checkJoined) {
    faqs.push({
      question: `중고 ${name} 직거래 시 무엇을 확인해야 하나요?`,
      answer: checkJoined,
    });
  }

  const bits: string[] = [];
  if (model.range_official) bits.push(`공식 주행거리 ${model.range_official}km`);
  if (model.battery_wh) bits.push(`배터리 ${model.battery_wh}Wh`);
  if (model.nominal_voltage && model.battery_capacity) {
    bits.push(`${model.nominal_voltage}V ${model.battery_capacity}Ah`);
  }
  if (model.weight) bits.push(`무게 ${model.weight}kg`);
  if (model.max_speed) bits.push(`최고속도 ${model.max_speed}km/h`);
  if (bits.length) {
    faqs.push({
      question: `${name} 핵심 스펙은 어떻게 되나요?`,
      answer: `${name}의 핵심 스펙은 ${bits.join(", ")}입니다. 상세 페이지에서 중고가·고질병·체크리스트까지 함께 확인할 수 있습니다.`,
    });
  }

  return faqs.slice(0, 6);
}

/** BLUF: 첫 화면에 바로 인용 가능한 수치 요약 */
export function buildAnswerCapsule(model: any): string {
  const name = brandedModelTitle(
    {
      model_name: String(model.model_name ?? ""),
      manufacturer: model.manufacturer,
    },
    "ko"
  );
  const min = formatKrw(model.used_price_min);
  const max = formatKrw(model.used_price_max);
  const chunks: string[] = [`${name}은(는) 퍼모위키 기준`];
  if (min && max) chunks.push(`중고가 약 ${min}~${max}`);
  if (model.range_official) chunks.push(`공식 주행 ${model.range_official}km`);
  if (model.weight) chunks.push(`무게 ${model.weight}kg`);
  let text = `${chunks.join(", ")} 정보가 정리되어 있습니다.`;
  if (model.one_line_summary) text = `${text} ${model.one_line_summary}`;
  return text;
}

/** English SEO description — researched USD only; never KRW / never FX. */
export function buildModelDescriptionEn(model: {
  manufacturer?: string | null;
  model_name?: string | null;
  model_name_en?: string | null;
  slug?: string | null;
  one_line_summary?: string | null;
  one_line_summary_en?: string | null;
  used_price_min_usd?: number | null;
  used_price_max_usd?: number | null;
  range_official?: number | null;
  weight?: number | null;
}): string {
  const name = brandedModelTitle(
    {
      model_name: model.model_name ?? "",
      model_name_en: model.model_name_en,
      manufacturer: model.manufacturer,
      slug: model.slug,
    },
    "en"
  );
  const parts: string[] = [`${name} used price, specs, and known issues.`];
  const min = formatUsd(model.used_price_min_usd);
  const max = formatUsd(model.used_price_max_usd);
  if (min && max) parts.push(`Used fair price ~${min}–${max}.`);
  else parts.push("Price TBD.");
  if (model.range_official) parts.push(`Official range ${model.range_official}km.`);
  if (model.weight) parts.push(`Weight ${model.weight}kg.`);
  const summary =
    model.one_line_summary_en?.trim() || model.one_line_summary?.trim();
  if (summary) parts.push(summary);
  return parts.join(" ").slice(0, 160);
}

export function buildAnswerCapsuleEn(model: any, displayName: string): string {
  const name = brandedModelTitle(
    {
      model_name: displayName || String(model.model_name ?? ""),
      model_name_en: model.model_name_en ?? displayName,
      manufacturer: model.manufacturer,
      slug: model.slug,
    },
    "en"
  );
  const min = formatUsd(model.used_price_min_usd);
  const max = formatUsd(model.used_price_max_usd);
  const chunks: string[] = [`${name} on Pumo Wiki:`];
  if (min && max) chunks.push(`used fair price ~${min}–${max}`);
  else chunks.push("Price TBD");
  if (model.range_official) chunks.push(`official range ${model.range_official}km`);
  if (model.weight) chunks.push(`weight ${model.weight}kg`);
  let text = `${chunks.join(", ")}.`;
  const summary =
    (typeof model.one_line_summary_en === "string" &&
      model.one_line_summary_en.trim()) ||
    (typeof model.one_line_summary === "string" && model.one_line_summary.trim()) ||
    "";
  if (summary) text = `${text} ${summary}`;
  return text;
}

export function buildModelFaqsEn(model: any, displayName: string): FaqItem[] {
  const faqs: FaqItem[] = [];
  const name = displayName || "this model";
  const min = formatUsd(model.used_price_min_usd);
  const max = formatUsd(model.used_price_max_usd);
  const orig = formatUsd(model.original_price_usd);

  if (min && max) {
    faqs.push({
      question: `What is the used price range for ${name}?`,
      answer: `The researched used fair price for ${name} is about ${min}–${max}.${orig ? ` MSRP is about ${orig}.` : ""} Condition, battery health, and accident history affect price — check voltage and wear items before buying.`,
    });
  } else {
    faqs.push({
      question: `What is the used price range for ${name}?`,
      answer: `Price TBD for ${name} in USD. Condition, battery health, and accident history affect price — check voltage and wear items before buying.`,
    });
  }

  const defects = pickLocalizedArray(model.chronic_defects_en, model.chronic_defects);
  const defectJoined = defects.map(defectText).filter(Boolean).slice(0, 5).join("; ");
  if (defectJoined) {
    faqs.push({
      question: `What are known issues with ${name}?`,
      answer: defectJoined,
    });
  }

  const checklist = pickLocalizedArray(model.used_checklist_en, model.used_checklist);
  const checkJoined = checklist.map(checklistText).filter(Boolean).slice(0, 4).join(" ");
  if (checkJoined) {
    faqs.push({
      question: `What should I check when buying a used ${name}?`,
      answer: checkJoined,
    });
  }

  const bits: string[] = [];
  if (model.range_official) bits.push(`official range ${model.range_official}km`);
  if (model.battery_wh) bits.push(`battery ${model.battery_wh}Wh`);
  if (model.nominal_voltage && model.battery_capacity) {
    bits.push(`${model.nominal_voltage}V ${model.battery_capacity}Ah`);
  }
  if (model.weight) bits.push(`weight ${model.weight}kg`);
  if (model.max_speed) bits.push(`top speed ${model.max_speed}km/h`);
  if (bits.length) {
    faqs.push({
      question: `What are the key specs of ${name}?`,
      answer: `Key specs: ${bits.join(", ")}.`,
    });
  }

  return faqs.slice(0, 6);
}
