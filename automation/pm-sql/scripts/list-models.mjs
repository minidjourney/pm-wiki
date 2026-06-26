import { closeDatabase, pool } from "./db.mjs";

try {
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

  console.log(JSON.stringify(result.rows, null, 2));
  console.error(`완료: 기존 모델 ${result.rowCount}건을 조회했습니다.`);
} catch (error) {
  console.error(`실패: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}

