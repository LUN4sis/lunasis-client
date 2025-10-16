'use server';

import webpush from 'web-push';
import { logger } from '@/lib/utils/logger';

// Initialize VAPID details only if environment variables are set
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:imjion.dev@gmail.com', vapidPublicKey, vapidPrivateKey);
} else {
  logger.warn(
    '[Notifications] VAPID keys not configured. Push notifications will not work. ' +
      'Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local',
  );
}

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;

  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  return { success: true };
}

export async function sendNotification(message: string) {
  // Check if VAPID is configured
  if (!vapidPublicKey || !vapidPrivateKey) {
    logger.error('[Notifications] VAPID keys not configured');
    return {
      success: false,
      error: 'Push notifications are not configured on the server.',
    };
  }

  if (!subscription) {
    logger.error('[Notifications] No subscription available');
    return {
      success: false,
      error: 'No subscription available. Please subscribe to push notifications first.',
    };
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icons/icon-192x192.png',
      }),
    );
    return { success: true };
  } catch (error) {
    console.error('[Notifications] Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
