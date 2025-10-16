import { logger } from '@/lib/utils/logger';

/**
 * Register service worker for PWA functionality
 * @returns Service worker registration or undefined if not supported
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    logger.log('[Service Worker] Registered successfully');

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            logger.log('[Service Worker] New version available');
            // TODO: Notify user about new version
          }
        });
      }
    });

    return registration;
  } catch (error) {
    logger.error('[Service Worker] Registration failed:', error);
    return undefined;
  }
}
