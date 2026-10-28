import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/url";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = SUPABASE_URL;
  const supabaseAnonKey = SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
