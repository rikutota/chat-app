'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

/**
 * ログイン後の画面で共通利用するヘッダー。
 *
 * チャット一覧、ユーザー一覧、プロフィール画面などで使い回す。
 * ログアウト処理もここに集約し、各画面で同じ処理を重複して書かないようにする。
 */
export function Header() {
  const router = useRouter();

  /**
   * ログアウト処理。
   *
   * Supabase Authのセッションを削除し、
   * ログアウト後はログイン画面へ戻す。
   */
  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('ログアウトに失敗しました。');
      return;
    }

    router.push('/login');
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/chats" className="text-lg font-bold text-gray-900">
          チャットWebアプリ
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/chats" className="text-gray-700 hover:text-gray-900">
            チャット
          </Link>

          <Link href="/users" className="text-gray-700 hover:text-gray-900">
            ユーザー
          </Link>

          <Link href="/profile" className="text-gray-700 hover:text-gray-900">
            プロフィール
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-700"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}