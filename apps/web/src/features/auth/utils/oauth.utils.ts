/**
 * Generate random string for CSRF protection
 */
export const generateRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate OAuth state parameter and store it in sessionStorage
 */
export const generateOAuthState = (): string => {
  const state = generateRandomString();
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
  }
  return state;
};

/**
 * Verify OAuth state parameter
 */
export const verifyOAuthState = (returnedState: string | null): boolean => {
  if (typeof window === 'undefined' || !returnedState) {
    return false;
  }

  const storedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');

  return storedState === returnedState;
};

/**
 * Build Google OAuth authorization URL
 *
 * @param redirectUri - OAuth callback redirect URI
 * @param state - CSRF protection state parameter (optional, will be generated if not provided)
 * @returns Google OAuth authorization URL
 */
export const buildGoogleOAuthUrl = (redirectUri: string, state?: string): string => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      'Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.',
    );
  }

  if (!redirectUri) {
    throw new Error('Redirect URI is required for OAuth');
  }

  const oauthState = state || generateOAuthState();
  const scope = 'profile email';
  const responseType = 'code';
  const accessType = 'offline'; // Refresh Token 발급을 위해 필요

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    access_type: accessType,
    state: oauthState,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Get OAuth callback redirect URI
 */
export const getOAuthCallbackUrl = (locale?: string): string => {
  if (typeof window !== 'undefined' && locale) {
    sessionStorage.setItem('oauth_locale', locale);
  }

  const envRedirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
  if (envRedirectUri) {
    return envRedirectUri;
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/oauth/callback/google`;
  }

  return 'http://localhost:3000/oauth/callback/google';
};
