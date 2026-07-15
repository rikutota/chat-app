import { createServerSupabaseClient } from '@/lib/supabase/server';

export type AppUser = {
  id: string;
  auth_user_id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * 現在ログインしているユーザーを、アプリ内ユーザーとして取得する。
 *
 * Supabase Authは本人確認を担当し、
 * public.users はチャットアプリ内で使うプロフィール情報を担当する。
 */
export async function getCurrentAppUser(): Promise<AppUser> {
  const supabase = await createServerSupabaseClient();

  // Cookieからログイン中のSupabase Authユーザーを取得する。
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('auth.getUser error:', authError);
    throw new Error('UNAUTHORIZED');
  }

  // Authユーザーに対応するアプリ内ユーザーを探す。
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (selectError) {
    console.error('users select error:', selectError);
    throw new Error('FAILED_TO_FETCH_APP_USER');
  }

  if (existingUser) {
    return existingUser;
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    'No Name';

  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  // 初回ログイン時は、Auth情報をもとにアプリ内ユーザーを作成する。
  const { data: createdUser, error: insertError } = await supabase
    .from('users')
    .insert({
      auth_user_id: user.id,
      display_name: displayName,
      avatar_url: avatarUrl,
      email: user.email ?? null,
    })
    .select('*')
    .single();

  if (insertError || !createdUser) {
    console.error('users insert error:', insertError);
    throw new Error('FAILED_TO_CREATE_APP_USER');
  }

  return createdUser;
}