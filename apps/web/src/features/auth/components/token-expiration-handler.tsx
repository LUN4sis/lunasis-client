'use client';

import { useTokenExpiration } from '../hooks/use-token-expiration';

// monitor token expiration and automatically logs out the user when the refresh token expires
export function TokenExpirationHandler() {
  useTokenExpiration();
  return null;
}
