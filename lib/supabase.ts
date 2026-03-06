import { createClient } from '@supabase/supabase-js';

// 클라이언트 사이드에서만 호출하세요
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

let _client: ReturnType<typeof getSupabaseClient> | null = null;

export function supabaseClient() {
  if (!_client) _client = getSupabaseClient();
  return _client;
}
