import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 서버 클라이언트 (실험용).
 * 환경변수가 없으면 null을 반환합니다 — 배포 환경에 키가 없어도
 * 빌드·페이지가 죽지 않도록 하기 위함입니다. 호출부에서 null을 처리하세요.
 */
export function createServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
