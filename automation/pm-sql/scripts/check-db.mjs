import { closeDatabase, pool } from "./db.mjs";

try {
  const connection = await pool.query(`
    select current_database() as database_name, current_user as database_user, now() as checked_at
  `);

  const tables = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('pm_models', 'pm_model_sources')
    order by table_name
  `);

  const found = new Set(tables.rows.map(({ table_name }) => table_name));
  const missing = ["pm_models", "pm_model_sources"].filter((table) => !found.has(table));

  if (missing.length > 0) {
    throw new Error(`필수 테이블을 찾지 못했습니다: ${missing.join(", ")}`);
  }

  const counts = await pool.query(`
    select
      (select count(*)::integer from public.pm_models) as pm_models,
      (select count(*)::integer from public.pm_model_sources) as pm_model_sources
  `);

  console.log("완료: Supabase 연결과 필수 테이블을 확인했습니다.");
  console.log(JSON.stringify({ ...connection.rows[0], ...counts.rows[0] }, null, 2));
} catch (error) {
  console.error(`실패: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}

