export const API_CONFIG = {
  timeout: 30000, // 30 seconds
} as const;

export const NOTIFICATION_CONFIG = {
  get vapidPublicKey() {
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    }
    return '';
  },
  defaultIcon: '/icons/icon-192x192.png',
  defaultTitle: 'Lunasis',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultPage: 0,
} as const;

export const isDevelopment = () => {
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'development';
  }
  return false;
};

export const isProduction = () => {
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'production';
  }
  return false;
};
