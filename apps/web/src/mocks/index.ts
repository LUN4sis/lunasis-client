import { productsHandlers } from './handlers/products.handlers';
import { logger } from '@lunasis/shared/utils';

// combine all handlers
const handlers = [...productsHandlers];

/**
 * MSW initialization function
 * - only works in browser environment
 * - automatically enabled in development environment
 */
export const initMocks = async (): Promise<void> => {
  // do not run in SSR environment
  if (typeof window === 'undefined') {
    logger.log('[MSW] Skipping MSW initialization in SSR environment');
    return;
  }

  // automatically enabled in development environment, check environment variable in production environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

  if (!isDevelopment && !mswEnabled) {
    logger.log('[MSW] MSW is disabled in production environment');
    return;
  }

  logger.log('[MSW] Initializing MSW...', { isDevelopment, mswEnabled });

  try {
    // dynamic import in browser environment
    const { setupWorker } = await import('msw/browser');
    const worker = setupWorker(...handlers);

    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      onUnhandledRequest: 'bypass', // ignore unknown requests
    });

    logger.log('[MSW] Mock Service Worker started successfully');
  } catch (error) {
    logger.error('[MSW] Mock Service Worker initialization failed:', error);
    throw error;
  }
};
