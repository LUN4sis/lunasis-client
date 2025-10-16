'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/features/auth';
import { ErrorCode, ERROR_MESSAGES } from '@/types/error';
import { ROUTES } from '@/lib/constants/routes';

import styles from './callback.module.scss';

const ERROR_REDIRECT_DELAY = 1500;

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { login, isError } = useLogin();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get('code');

    if (!code) {
      setError(ERROR_MESSAGES[ErrorCode.INVALID_CODE]);
      setTimeout(() => router.replace(ROUTES.ROOT), ERROR_REDIRECT_DELAY);
      return;
    }

    login(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isError) {
      setError(ERROR_MESSAGES[ErrorCode.EXCHANGE_FAILED]);
      setTimeout(() => router.replace(ROUTES.ROOT), ERROR_REDIRECT_DELAY);
    }
  }, [isError, router]);

  return (
    <main className={`${styles.container} ${error ? styles.error : ''}`}>
      {error ? (
        <>
          <h2 className={styles.title}>Login failed</h2>
          <p className={styles.message}>{error}</p>
          <p className={styles.redirectMessage}>Redirecting to home page...</p>
        </>
      ) : (
        <>
          <h2 className={styles.title}>Login processing...</h2>
          <p className={styles.message}>
            Please wait a moment.
            <span className={styles.loading} />
          </p>
        </>
      )}
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.container}>
          <h2 className={styles.title}>Loading...</h2>
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
