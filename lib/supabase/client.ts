import { createBrowserClient } from '@supabase/ssr';

/**
 * ブラウザ側でSupabaseに接続するためのClientを作成する。
 *
 * Next.js App Router + Supabase Authでは、ログイン状態をCookieで扱う。
 * そのため、通常の createClient ではなく @supabase/ssr の createBrowserClient を使う。
 */
export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof supabaseUrl !== 'string') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  if (typeof supabaseAnonKey !== 'string') {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}