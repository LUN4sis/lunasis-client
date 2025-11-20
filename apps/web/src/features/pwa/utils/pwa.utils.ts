/**
 * PWA utility functions for device and environment detection
 */

/**
 * Check if the current device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if Push Manager is supported
 */
export function isPushManagerSupported(): boolean {
  return typeof window !== 'undefined' && 'PushManager' in window;
}

/**
 * Check if push notifications are supported on the current device
 * iOS only supports push in standalone mode
 */
export function isPushNotificationSupported(): boolean {
  const hasServiceWorker = isServiceWorkerSupported();
  const hasPushManager = isPushManagerSupported();

  if (!hasServiceWorker || !hasPushManager) {
    return false;
  }

  const iOS = isIOS();
  const standalone = isStandalone();

  // iOS only supports push in standalone mode
  if (iOS) {
    return standalone;
  }

  return true;
}

/**
 * Convert base64 VAPID key to Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
