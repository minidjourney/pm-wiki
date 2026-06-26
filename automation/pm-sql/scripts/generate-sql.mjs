import fs from "node:fs/promises";
import path from "node:path";
import { closeDatabase, pool } from "./db.mjs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1";
const OUTPUT_DIR = process.env.OUTPUT_DIR || "../../sql";

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY이 없습니다. GitHub Secrets 또는 환경변수에 설정하세요.");
}

function seoulDateStamp(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}${value.month}${value.day}`;
}

function responseText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text)
    .join("\n")
    .trim();
}

function stripMarkdownFence(text) {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:sql|markdown)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

async function getExistingModels() {
  const tables = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('pm_models', 'pm_model_sources')
    order by table_name
  `);

  const found = new Set(tables.rows.map(({ table_name }) => table_name));
  for (const table of ["pm_models", "pm_model_sources"]) {
    if (!found.has(table)) {
      throw new Error(`필수 테이블을 찾지 못했습니다: ${table}`);
    }
  }

  const result = await pool.query(`
    select
      model_name,
      slug,
      manufacturer,
      sub_model,
      nominal_voltage,
      battery_capacity,
      release_year
    from public.pm_models
    order by manufacturer nulls last, model_name, slug
  `);

  return result.rows;
}

async function createResponse(prompt) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      reasoning: { effort: "high" },
      tools: [{ type: "web_search_preview" }],
      tool_choice: "required",
      input: prompt,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OpenAI API 오류 ${response.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

function buildPrompt(existingModels, dateStamp) {
  return `
당신은 대한민국 퍼스널 모빌리티(PM) 시장의 하드웨어 스펙, 중고 시세, 고질병, 실사용 평가를 검증하는 시니어 리서처이자 PostgreSQL SQL 작성자입니다.

목표: 아래 Supabase 기존 모델과 중복되지 않는 신규 PM 모델 정확히 15개를 조사해, Supabase SQL Editor에 바로 실행할 수 있는 PostgreSQL SQL 파일 내용을 작성하세요.

중요:
- 실제 DB에 쓰기 작업은 하지 않습니다. SQL 텍스트만 작성합니다.
- 기존 모델 목록은 실제 Supabase에서 조회한 결과입니다.
- 사용자에게 질문하지 말고 직접 선정합니다.
- 카테고리는 kickboard, ebike, unicycle, scooter를 균형 있게 선택합니다.
- original_price, used_price_min, used_price_max는 반드시 숫자로 채우고 NULL 금지입니다.
- 정확한 중고 자료가 없으면 합리적으로 추정하되 pm_model_sources에 verification_status='uncertain' 및 memo='운영 등록용 추정값이며, 국내 거래 완료 사례 또는 공식 수리비 확인 시 교체 필요'를 기록하세요.

기존 모델 목록 JSON:
${JSON.stringify(existingModels, null, 2)}

중복 방지:
1. model_name이 같은 경우 금지
2. slug가 같은 경우 금지
3. 제조사 + 모델명 + 전압 + 배터리 용량이 같은 경우 금지
4. 한글명/해외명만 다른 같은 모델 금지
5. 배터리 용량 표기만 반올림된 사실상 같은 모델 금지
6. 세대명, 연식, 전압, 배터리 용량 차이가 명확하지 않으면 금지

필수 입력값:
original_price, used_price_min, used_price_max, battery_replace_cost, pm_score, nominal_voltage, battery_capacity, battery_wh, range_official, max_speed, weight, tire_size, motor_power_rated, motor_power_peak, max_load, charge_time

출처 규칙:
- 각 모델은 최소 3개 이상의 독립 출처를 사용하세요.
- 제조사 공식 홈페이지 또는 공식 매뉴얼, 국내 공식 수입사 또는 공식 판매처, 대형 판매처, 실사용 리뷰, 커뮤니티, 중고거래 자료를 우선합니다.
- 출처별로 pm_model_sources row를 작성하세요.
- 추정값은 반드시 verification_status='uncertain'으로 기록하세요.

pm_models INSERT 컬럼 순서:
status, category, manufacturer, model_name, slug, original_price, battery_replace_cost, tire_size, suspension_type, battery_voltage, weight, chronic_defects, used_checklist, affiliate_links, is_discontinued, motor_power_peak, battery_capacity, range_official, max_speed, brake_type, pros, cons, dimensions, charger_spec, release_year, safety_rules, one_line_summary, sub_model, bluetooth_enabled, battery_check_method, compatible_accessories, used_price_min, used_price_max, image_url, pm_score, nominal_voltage, battery_wh, motor_power_rated, max_load, charge_time, app_integration_available

pm_model_sources INSERT 컬럼 순서:
pm_model_slug, source_type, source_name, source_url, verified_field, raw_value, normalized_value, evidence_summary, verification_status, source_priority, memo

ON CONFLICT:
- pm_models는 ON CONFLICT ("slug") DO UPDATE SET을 사용하세요.
- pm_model_sources는 ON CONFLICT ON CONSTRAINT "unique_pm_model_source_evidence" DO UPDATE SET을 사용하세요.

JSONB:
- chronic_defects, pros, cons는 문자열 배열 JSONB입니다.
- used_checklist는 title, description을 가진 객체 배열 JSONB입니다.
- affiliate_links와 compatible_accessories는 확실한 값이 없으면 '[]'::jsonb입니다.
- safety_rules 기본값은 '["안전모 착용 필수", "원동기 면허 이상 필요", "자전거도로 주행 원칙", "동승자 탑승 금지"]'::jsonb입니다.

출력 파일 날짜: ${dateStamp}

출력 형식:
마크다운 코드펜스 없이 파일 내용만 출력하세요.
반드시 아래 순서로 작성하세요.
1. 추가 모델 요약표
2. 검증 기준 요약
3. pm_models INSERT SQL
4. pm_model_sources INSERT SQL

자체 검수:
- 신규 모델이 정확히 15개인지 확인
- 기존 model_name, slug, 제조사+모델+전압+배터리 중복이 없는지 확인
- 필수 숫자 필드와 가격이 NULL이 아닌지 확인
- 모델별 출처 3개 이상인지 확인
- SQL 문법과 JSONB 문법을 확인
`.trim();
}

function validateGeneratedContent(content) {
  const requiredSnippets = [
    'INSERT INTO "public"."pm_models"',
    'INSERT INTO "public"."pm_model_sources"',
    'ON CONFLICT ("slug")',
    'ON CONFLICT ON CONSTRAINT "unique_pm_model_source_evidence"',
    "::jsonb",
  ];

  const missing = requiredSnippets.filter((snippet) => !content.includes(snippet));
  if (missing.length > 0) {
    throw new Error(`생성 SQL 검증 실패: 누락된 필수 문구 ${missing.join(", ")}`);
  }
}

async function main() {
  const dateStamp = process.env.RUN_DATE || seoulDateStamp();
  const outputPath = path.resolve(OUTPUT_DIR, `${dateStamp}.sql`);

  const existingModels = await getExistingModels();
  const prompt = buildPrompt(existingModels, dateStamp);
  const response = await createResponse(prompt);
  const content = stripMarkdownFence(responseText(response));

  if (!content) {
    throw new Error("OpenAI 응답에서 SQL 내용을 찾지 못했습니다.");
  }

  validateGeneratedContent(content);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${content.trim()}\n`, "utf8");

  console.log(`완료: ${outputPath} 파일을 생성했습니다.`);
  console.log(`기존 모델 조회 수: ${existingModels.length}`);
}

main()
  .catch((error) => {
    console.error(`실패: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase().catch(() => {});
  });

