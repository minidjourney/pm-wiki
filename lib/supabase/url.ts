// pm-wiki DB 주소: 2026-10-29 Supabase 무료 프로젝트가 멈춘 뒤 K12 의 M8 서버(읽기 전용 공개 창구)로 옮겼다.
// 창구가 키를 자기 것으로 바꿔 쓰므로 공개 키는 무엇이 와도 된다 — Vercel 에 옛 값이 있으면 그대로 쓴다.
export const SUPABASE_URL = 'https://m8-server.taile0eb21.ts.net';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'pmwiki-public-read';
