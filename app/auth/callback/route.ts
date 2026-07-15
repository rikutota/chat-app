import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Google OAuthログイン後に戻ってくるCallback API。
 *
 * 正常時はURLにcodeが付いてくる。
 * 異常時はerrorやerror_descriptionが付いてくるため、
 * まずそれをログに出して原因を特定しやすくする。
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('OAuth callback error:', {
      error,
      errorCode,
      errorDescription,
    });

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorCode ?? error)}`,
        requestUrl.origin,
      ),
    );
  }

  if (!code) {
    console.error('OAuth callback code is missing.');

    return NextResponse.redirect(
      new URL('/login?error=missing_oauth_code', requestUrl.origin),
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Failed to exchange code for session:', exchangeError.message);

    return NextResponse.redirect(
      new URL('/login?error=exchange_failed', requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL('/profile', requestUrl.origin));
}