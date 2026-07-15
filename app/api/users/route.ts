import { NextResponse } from 'next/server';
import { getCurrentAppUser } from '@/lib/auth/getCurrentAppUser';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type UserListItem = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
};

/**
 * ユーザー一覧を取得するAPI。
 *
 * 1対1チャットでは「自分以外の誰と話すか」を選ぶ必要があるため、
 * ログイン中ユーザー以外の users を返す。
 */
export async function GET() {
  try {
    const currentUser = await getCurrentAppUser();
    const supabase = await createServerSupabaseClient();

    /**
     * 自分自身を一覧に出すと「自分とチャットを開始する」導線ができてしまう。
     * 1対1チャットでは相手ユーザーだけ選べればよいため、自分は除外する。
     */
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, email, created_at')
      .neq('id', currentUser.id)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('users list error:', error);
      throw new Error('FAILED_TO_FETCH_USERS');
    }

    return NextResponse.json({
      success: true,
      data: (data ?? []) as UserListItem[],
    });
  } catch (error) {
    console.error('/api/users error:', error);

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
          message: 'ユーザー一覧の取得に失敗しました。',
        },
      },
      { status: 500 },
    );
  }
}