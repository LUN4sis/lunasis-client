
import { v4 as uuidv4 } from 'uuid';

const ANONYMOUS_USER_KEY = 'lunasis_anonymous_user_id';
const ANONYMOUS_USER_EXPIRY_KEY = 'lunasis_anonymous_user_expiry';

// Default expiry time: 1 day (24 hours) in milliseconds
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Get or create anonymous user ID
 * Returns existing ID if valid, otherwise generates new one
 */
export function getAnonymousUserId(): string {
  if (typeof window === 'undefined') {
    return uuidv4();
  }

  const existingId = localStorage.getItem(ANONYMOUS_USER_KEY);
  const expiry = localStorage.getItem(ANONYMOUS_USER_EXPIRY_KEY);

  // Check if existing ID is still valid
  if (existingId && expiry) {
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() < expiryTime) {
      return existingId;
    }
  }

  // Generate new ID and store with expiry
  const newId = uuidv4();
  const newExpiry = Date.now() + DEFAULT_EXPIRY_MS;

  localStorage.setItem(ANONYMOUS_USER_KEY, newId);
  localStorage.setItem(ANONYMOUS_USER_EXPIRY_KEY, newExpiry.toString());

  return newId;
}

/**
 * Clear anonymous user data
 */
export function clearAnonymousUserId(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ANONYMOUS_USER_KEY);
  localStorage.removeItem(ANONYMOUS_USER_EXPIRY_KEY);
}

/**
 * Check if anonymous user ID exists and is valid
 */
export function hasValidAnonymousUserId(): boolean {
  if (typeof window === 'undefined') return false;

  const existingId = localStorage.getItem(ANONYMOUS_USER_KEY);
  const expiry = localStorage.getItem(ANONYMOUS_USER_EXPIRY_KEY);

  if (!existingId || !expiry) return false;

  const expiryTime = parseInt(expiry, 10);
  return Date.now() < expiryTime;
}

/**
 * Extend the expiry time of current anonymous user ID
 */
export function extendAnonymousUserExpiry(): void {
  if (typeof window === 'undefined') return;

  const existingId = localStorage.getItem(ANONYMOUS_USER_KEY);
  if (!existingId) return;

  const newExpiry = Date.now() + DEFAULT_EXPIRY_MS;
  localStorage.setItem(ANONYMOUS_USER_EXPIRY_KEY, newExpiry.toString());
}
