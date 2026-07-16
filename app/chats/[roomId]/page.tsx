import { Header } from '@/components/layout/Header';

type ChatRoomPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

/**
 * チャットルーム詳細画面。
 *
 * 現時点ではメッセージ一覧や送信フォームはまだ作らず、
 * 「チャット開始後に正しいroomIdへ遷移できること」を確認するための仮画面。
 */
export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { roomId } = await params;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            チャットルーム
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            この画面にメッセージ一覧と送信フォームを追加していきます。
          </p>

          <div className="mt-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p>チャットルームID:</p>
            <p className="mt-1 break-all font-mono">{roomId}</p>
          </div>
        </div>
      </main>
    </>
  );
}