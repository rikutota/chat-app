'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';

type UserListItem = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
};

type ApiResponse =
  | {
      success: true;
      data: UserListItem[];
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

/**
 * ユーザー一覧画面。
 *
 * 1対1チャットを開始する相手を選ぶための画面。
 * ここではまだチャットルーム作成は行わず、ユーザー一覧表示までを確認する。
 */
export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const result = (await response.json()) as ApiResponse;

        if (!result.success) {
          /**
           * 未ログインの場合は、ユーザー一覧を見せずにログイン画面へ戻す。
           * ユーザー一覧はチャット開始の入口なので、認証済みユーザーだけに見せる。
           */
          if (result.error.code === 'UNAUTHORIZED') {
            router.push('/login');
            return;
          }

          setErrorMessage(result.error.message);
          return;
        }

        setUsers(result.data);
      } catch {
        setErrorMessage('ユーザー一覧の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  if (isLoading) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-gray-50 p-8">
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </main>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-gray-50 p-8">
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
            <h1 className="text-2xl font-bold text-gray-900">ユーザー一覧</h1>

            <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-gray-900">チャット相手</h1>

          <p className="mt-3 text-sm text-gray-600">
            チャットを開始する相手を選択します。
          </p>

          {users.length === 0 ? (
            <div className="mt-8 rounded-lg bg-gray-50 p-6 text-sm text-gray-600">
              まだ他のユーザーがいません。別のGoogleアカウントでログインすると、
              ここに表示されます。
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-gray-200">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={`${user.display_name}のアイコン`}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-600">
                        {user.display_name.slice(0, 1)}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-gray-900">
                        {user.display_name}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {user.email ?? 'メールアドレス未設定'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                  >
                    チャット開始
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}