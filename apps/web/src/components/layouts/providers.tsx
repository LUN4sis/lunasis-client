'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from '@/components/ui/toast';
import { initMocks } from '@/mocks';

import { logger } from '@lunasis/shared/utils';

interface ProvidersProps {
  children: ReactNode;
}

function MSWProvider({ children }: ProvidersProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeMocks = async () => {
      await initMocks();
      logger.log('[MSWProvider] MSW initialized, ready to render');
      setIsReady(true);
    };

    initializeMocks();
  }, []);

  // wait for MSW to initialize
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
