import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/url";
import { createClient as createPublicClient } from "@supabase/supabase-js";

export async function createClient() {
  // 공개 카탈로그·블로그 읽기 전용. 요청 쿠키를 읽으면 ISR이 꺼진다.
  return createPublicClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
