import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * サーバー側でSupabaseに接続するためのClientを作成する．
 * 
 * ブラウザ側と違い，API Routeではログイン状態をCookieから読む必要がある
 * そのため，@supabase/ssr の createServerClient を使う
 */
export async function createServerSupabaseClient(){
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (typeof supabaseUrl !== 'string'){
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
    }

    if (typeof supabaseAnonKey !== 'string'){
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll(){
                return cookieStore.getAll();
            },

            setAll(cookiesToSet){
                try{
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                }catch{
                    //Server Componentなど，Cookieを書き込めない場所で呼ばれた場合の保険
                    //今回は主にAPI Routeで使うため，基本的にはここには入りません
                }
            }
        }
    })
}