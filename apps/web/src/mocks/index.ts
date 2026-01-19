import { logger, transformError } from '@repo/shared/utils';

/**
 * MSW initialization function
 * - only works in browser environment
 * - enabled when NEXT_PUBLIC_ENABLE_MSW environment variable is set to 'true'
 * - can be controlled in both development and production environments
 */
export const initMocks = async (): Promise<void> => {
  // do not run in SSR environment
  if (typeof window === 'undefined') {
    logger.info('[MSW] Skipping MSW initialization in SSR environment');
    return;
  }

  // check environment variable to enable/disable MSW in all environments
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mswEnvValue = process.env.NEXT_PUBLIC_ENABLE_MSW;
  const mswEnabled = mswEnvValue === 'true';

  logger.info('[MSW] Environment check', {
    isDevelopment,
    mswEnvValue,
    mswEnabled,
    envType: typeof mswEnvValue,
  });

  if (!mswEnabled) {
    logger.info('[MSW] MSW is disabled (NEXT_PUBLIC_ENABLE_MSW is not "true")', {
      isDevelopment,
      mswEnvValue,
      mswEnabled,
      expected: 'true',
      actual: mswEnvValue,
    });
    return;
  }

  logger.info('[MSW] Initializing MSW...', { isDevelopment, mswEnabled });

  try {
    // dynamic import of MSW and handlers in browser environment only
    const [{ setupWorker }, { productsHandlers }] = await Promise.all([
      import('msw/browser'),
      import('./handlers/products.handlers'),
    ]);

    // combine all handlers
    const handlers = [...productsHandlers];

    const worker = setupWorker(...handlers);

    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      onUnhandledRequest: 'bypass', // ignore unknown requests
    });

    logger.info('[MSW] Mock Service Worker started successfully');
  } catch (error) {
    const appError = transformError(error);
    logger.error('[MSW] Mock Service Worker initialization failed:', appError.toJSON());
    throw error;
  }
};
