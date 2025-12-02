'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@web/lib/query-client';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from '@web/components/ui/toast';
import { initMocks } from '@web/mocks';

import { logger } from '@repo/shared/utils';

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

  // wait for MSW initialization (or skip if disabled)
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MSWProvider>
        <ToastContainer />
        {children}
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      </MSWProvider>
    </QueryClientProvider>
  );
}
