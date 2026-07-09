/**
 * プロフィール画面
 * 
 * まずはログイン後の遷移先として仮表示する
 * 次の手順で /api/me を呼び出して，実際のユーザー情報を表示する
 */
export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>

                <p className="mt-4 text-gray-600">
                    ログイン後に表示されるプロフィールです
                </p>
            </div>
        </main>
    )
}