'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

/**
 * ログイン画面
 * 
 * ユーザーがGoogleアカウントでログインを開始する入口
 * 実際の本人確認はGoogleが行い，ログイン状態の管理はSupabase Authが行う
 */
export default function LoginPage() {
    async function handleGoogleLogin(){
        const supabase = createBrowserSupabaseClient();

        /**
         * Google Oauthログインを開始する
         * 
         * redirectToには，ログイン成功後に戻ってくるURLを指定する
         * ここではログイン後にプロフィール画面へ移動させる
         */
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            alert('Googleログインの開始に失敗しました．');
            console.error(error);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-bold text-gray-900">
                    チャットWebアプリ
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                    Googleアカウントでログインして，1対1チャットを始めます．
                </p>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700"
                    >
                    Googleでログイン
                </button>
            </div>
        </main>
    );
}