import { NextResponse } from 'next/server';
import { getCurrentAppUser } from '@/lib/auth/getCurrentAppUser';

/**
 * ログイン中のアプリ内ユーザー情報を返すAPI。
 *
 * 開発中は原因調査しやすいように、サーバー側のターミナルへ詳細エラーを出す。
 */
export async function GET() {
  try {
    const user = await getCurrentAppUser();

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('/api/me error:', error);

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'ログインが必要です。',
          },
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'ユーザー情報の取得に失敗しました。',
        },
      },
      { status: 500 },
    );
  }
}