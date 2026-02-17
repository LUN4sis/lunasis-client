import { transformError } from '@repo/shared/utils';
import { http, passthrough } from 'msw';

/**
 * Community: GET /api/posts is mocked; other /api/posts*, /api/comments* passthrough to real server.
 * communityHandlers (GET /api/posts) must run before passthrough so the mock takes precedence.
 */
const communityPassthroughHandlers = [
  http.all('/api/posts*', () => passthrough()),
  http.all('/api/comments*', () => passthrough()),
];

/**
 * MSW initialization function
 * - only works in browser environment
 * - enabled when NEXT_PUBLIC_ENABLE_MSW environment variable is set to 'true'
 * - can be controlled in both development and production environments
 */
export const initMocks = async (): Promise<void> => {
  // do not run in SSR environment
  if (typeof window === 'undefined') {
    return;
  }

  // check environment variable to enable/disable MSW in all environments
  const mswEnvValue = process.env.NEXT_PUBLIC_ENABLE_MSW;
  const mswEnabled = mswEnvValue === 'true';

  if (!mswEnabled) {
    return;
  }

  try {
    // dynamic import of MSW and handlers in browser environment only
    const [
      { setupWorker },
      { rankingHandlers },
      { productsHandlers },
      { chatHandlers },
      { communityHandlers },
    ] = await Promise.all([
      import('msw/browser'),
      import('./handlers/ranking.handlers'),
      import('./handlers/products.handlers'),
      import('./handlers/chat.handlers'),
      import('./handlers/community.handlers'),
    ]);

    const handlers = [
      ...communityHandlers,
      ...communityPassthroughHandlers,
      ...rankingHandlers,
      ...productsHandlers,
      ...chatHandlers,
    ];

    const worker = setupWorker(...handlers);

    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      onUnhandledRequest: 'bypass', // ignore unknown requests
    });
  } catch (error) {
    transformError(error);
    throw error;
  }
};
