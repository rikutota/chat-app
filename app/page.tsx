import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function HomePage() {
  // Supabase Clientを作成できるか確認するための一時的な処理です。
  const supabase = createBrowserSupabaseClient();

  // 未使用変数エラーを避けるため、接続確認用にURLを取得します。
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  console.log('Supabase client:', supabase);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">チャットWebアプリ</h1>

      <p className="mt-4 text-gray-600">
        1対1でリアルタイムチャットできるWebアプリです。
      </p>

      <p className="mt-6 rounded bg-green-100 p-4 text-green-700">
        Supabase Clientの作成に成功しました。
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Supabase URL: {supabaseUrl ? '設定済み' : '未設定'}
      </p>
    </main>
  );
}