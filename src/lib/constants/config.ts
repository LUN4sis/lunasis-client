/**
 * 애플리케이션 설정 상수
 */
export const APP_CONFIG = {
  name: 'LUNAsis',
  description:
    "LUNAsis PWA Your personal guide to women's health. Compare prices on feminine products, find trusted clinics, track your cycle, and get instant answers from our AI companion, Luna.",
  email: 'imjion.dev@gmail.com',
} as const;

/**
 * 알림 설정
 */
export const NOTIFICATION_CONFIG = {
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  defaultIcon: '/icons/icon-192x192.png',
} as const;
