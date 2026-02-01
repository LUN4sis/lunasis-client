import { logger } from '@repo/shared/utils';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const code = formData.get('code') as string | null;
    const state = formData.get('state') as string | null;
    const userJson = formData.get('user') as string | null;
    const error = formData.get('error') as string | null;
    const errorDescription = formData.get('error_description') as string | null;

    const redirectUrl = new URL('/oauth/callback/apple/complete', request.url);

    if (error) {
      redirectUrl.searchParams.set('error', error);
      if (errorDescription) {
        redirectUrl.searchParams.set('error_description', errorDescription);
      }
    } else if (code) {
      redirectUrl.searchParams.set('code', code);

      if (state) {
        redirectUrl.searchParams.set('state', state);
      }

      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          const name = user.name
            ? `${user.name.firstName || ''} ${user.name.lastName || ''}`.trim()
            : '';
          if (name) {
            redirectUrl.searchParams.set('name', name);
          }
        } catch {
          logger.error('[Auth] Failed to parse user JSON', { userJson });
        }
      }
    } else {
      redirectUrl.searchParams.set('error', 'no_code');
      redirectUrl.searchParams.set('error_description', 'No authorization code received');
    }

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch {
    logger.error('[Auth] Failed to process Apple OAuth callback', { request });
    const errorUrl = new URL('/oauth/callback/apple/complete', request.url);
    errorUrl.searchParams.set('error', 'server_error');
    errorUrl.searchParams.set('error_description', 'Failed to process Apple OAuth callback');
    return NextResponse.redirect(errorUrl, { status: 303 });
  }
}
