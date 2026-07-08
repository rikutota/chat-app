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
 * 現在ログインしているユーザーを，アプリ内ユーザーとして取得する
 * 
 * Supabase Authは「本人確認」を担当し，
 * public.usersは「このチャットアプリ内で使うユーザー情報」を担当する
 * 
 * 初回ログイン時は public.users にまだ存在しないため，
 * Googleアカウントの情報をもとにアプリ内ユーザーを作成する
 */
export async function getCurrentAppUser(): Promise<AppUser> {
    const supabase = await createServerSupabaseClient();

    // Supabase Authから，現在ログインしている認証ユーザーを取得する
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user){
        throw new Error('UNAUTHORIZED');
    }

    // authユーザーIDに紐づくアプリ内ユーザーを探す．
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq(`auth_user_id`, user.id)
        .maybeSingle();

    if(selectError){
        throw new Error('FAILED_TO_FETCH_APP_USER');
    }

    if(existingUser){
        return existingUser;
    }

    // 初回ログイン時は，Googleアカウント情報をもとにアプリ内ユーザーを作成する
    const displayName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        'No Name';
    
    const avatarUrl = user.user_metadata?.avatar_url ?? null;

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

    if(insertError || !createdUser){
        throw new Error('FAILED_TO_CREATE_APP_USER');
    }

    return createdUser;
}