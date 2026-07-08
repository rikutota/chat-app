import { NextResponse } from 'next/server';
import { getCurrentAppUser } from '@/lib/auth/getCurrentAppUser';

/**
 * ログイン中のアプリ内ユーザー情報を返すAPI
 * 
 * フロント側はこのAPIを呼ぶことで，
 * 「今ログインしている自分の情報」を取得できる．
 */
export async function GET(){
    try{
        const user = await getCurrentAppUser();

        return NextResponse.json({
            success: true,
            data: user,
        });
    }catch(error){
        if(error instanceof Error && error.message === 'UNAUTHORIZED'){
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'ログインが必要です',
                    },
                },
                {status: 401 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'ユーザー情報の取得に失敗しました．',
                },
            },
            {status: 500},
        );
    }
}