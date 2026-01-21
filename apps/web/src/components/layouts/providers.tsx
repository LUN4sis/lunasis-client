'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { queryClient } from '@web/lib/query-client';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from '@web/components/ui/toast';
import { initMocks } from '@web/mocks';
import dynamic from 'next/dynamic';

import { logger } from '@repo/shared/utils';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () =>
          import('@tanstack/react-query-devtools').then((mod) => ({
            default: mod.ReactQueryDevtools,
          })),
        { ssr: false },
      )
    : () => null;

interface ProvidersProps {
  children: ReactNode;
}

function MSWProvider({ children }: ProvidersProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeMocks = async () => {
      await initMocks();
      const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';
      logger.info('[MSWProvider] Ready to render', { mswEnabled });
      setIsReady(true);
    };

    initializeMocks();
  }, []);

  return <>{isReady ? children : null}</>;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <QueryClientProvider client={queryClient}>
        <MSWProvider>
          <ToastContainer />
          {children}
          {/* <ReactQueryDevtools initialIsOpen={false} position="bottom" /> */}
        </MSWProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
