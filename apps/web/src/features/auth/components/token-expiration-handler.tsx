'use client';

import { useTokenExpiration } from '@repo/shared/features/auth/hooks/use-token-expiration';
import { logoutSync } from '../hooks/use-auth';

// monitor token expiration and automatically logs out the user when the refresh token expires
export function TokenExpirationHandler() {
  useTokenExpiration(logoutSync);
  return null;
}
