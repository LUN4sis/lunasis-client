import { NextRequest, NextResponse } from 'next/server';

/**
 * Apple OAuth Callback Route Handler
 *
 * Apple uses response_mode=form_post, so the callback comes as a POST request.
 * This handler extracts the authorization code and user info, then redirects
 * to the client page with the data in query params.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const code = formData.get('code') as string | null;
    const state = formData.get('state') as string | null;
    const userJson = formData.get('user') as string | null;
    const error = formData.get('error') as string | null;
    const errorDescription = formData.get('error_description') as string | null;

    // Build redirect URL with query params
    const redirectUrl = new URL('/oauth/callback/apple', request.url);

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

      // Parse user info if available (only provided on first login)
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
          // Ignore JSON parse errors for user data
        }
      }
    } else {
      redirectUrl.searchParams.set('error', 'no_code');
      redirectUrl.searchParams.set('error_description', 'No authorization code received');
    }

    return NextResponse.redirect(redirectUrl);
  } catch {
    // Redirect to callback page with error
    const errorUrl = new URL('/oauth/callback/apple', request.url);
    errorUrl.searchParams.set('error', 'server_error');
    errorUrl.searchParams.set('error_description', 'Failed to process Apple OAuth callback');
    return NextResponse.redirect(errorUrl);
  }
}

/**
 * Handle GET requests (for direct page access or refresh)
 */
export async function GET() {
  // GET requests are handled by page.tsx
  return new NextResponse(null, { status: 200 });
}
