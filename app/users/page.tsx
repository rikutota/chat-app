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

type CreateDirectRoomResponse =
  | {
      success: true;
      data: {
        roomId: string;
        created: boolean;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

/**
 * チャット相手一覧画面。
 *
 * 1対1チャットを開始する相手を選ぶための画面。
 */
export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [startingChatUserId, setStartingChatUserId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const result = (await response.json()) as ApiResponse;

        if (!result.success) {
          if (result.error.code === 'UNAUTHORIZED') {
            router.push('/login');
            return;
          }

          setErrorMessage(result.error.message);
          return;
        }

        setUsers(result.data);
      } catch {
        setErrorMessage('チャット相手一覧の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  /**
   * 選択した相手との1対1チャットルームを作成、または既存ルームを取得する。
   */
  async function handleStartChat(partnerUserId: string) {
    setErrorMessage('');
    setStartingChatUserId(partnerUserId);

    try {
      const response = await fetch('/api/chat-rooms/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerUserId,
        }),
      });

      const result = (await response.json()) as CreateDirectRoomResponse;

      if (!result.success) {
        if (result.error.code === 'UNAUTHORIZED') {
          router.push('/login');
          return;
        }

        setErrorMessage(result.error.message);
        return;
      }

      router.push(`/chats/${result.data.roomId}`);
    } catch {
      setErrorMessage('チャットルームの作成に失敗しました。');
    } finally {
      setStartingChatUserId(null);
    }
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              チャット相手
            </h1>

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
              まだチャットできる相手がいません。別のGoogleアカウントでログインすると、
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
                    onClick={() => handleStartChat(user.id)}
                    disabled={startingChatUserId === user.id}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {startingChatUserId === user.id
                      ? '作成中...'
                      : 'チャット開始'}
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