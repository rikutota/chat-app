'use client';

import { useEffect, useState } from 'react';

type AppUser = {
  id: string;
  auth_user_id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

type ApiResponse =
  | {
      success: true;
      data: AppUser;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

/**
 * プロフィール画面。
 *
 * /api/me を呼び出して、現在ログインしているアプリ内ユーザー情報を表示する。
 * この画面が表示できれば、Googleログインと users テーブルの紐づけが確認できる。
 */
export default function ProfilePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch('/api/me');
        const result = (await response.json()) as ApiResponse;

        if (!result.success) {
          setErrorMessage(result.error.message);
          return;
        }

        setUser(result.data);
      } catch {
        setErrorMessage('ユーザー情報の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>

          <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>

        <div className="mt-8 flex items-center gap-4">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`${user.display_name}のアイコン`}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600">
              {user?.display_name.slice(0, 1)}
            </div>
          )}

          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user?.display_name}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {user?.email ?? 'メールアドレス未設定'}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p>アプリ内ユーザーID:</p>
          <p className="mt-1 break-all font-mono">{user?.id}</p>
        </div>
      </div>
    </main>
  );
}