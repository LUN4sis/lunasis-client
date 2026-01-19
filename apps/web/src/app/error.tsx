'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { logger } from '@repo/shared/utils';
import { ROUTES } from '@web/lib/constants';

import styles from './error.module.scss';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Log detailed error information for debugging
    // 디버깅을 위한 상세 에러 정보 로깅
    const errorInfo = {
      message: error.message || '(empty message)',
      name: error.name,
      digest: error.digest,
      stack: error.stack,
      // Additional context for empty message errors
      // 빈 메시지 에러에 대한 추가 컨텍스트
      isEmpty: !error.message,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    logger.error('Page error occurred', errorInfo);

    // Log to console in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Boundary]', error);
    }

    setMounted(true);
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoHome = () => {
    window.location.href = ROUTES.ROOT;
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>
        <div className={styles.graphic} role="img" aria-label="Error occurred">
          <div className={styles.shakeWrapper}>
            {/* Planet */}
            <div className={styles.planet}>
              <div className={styles.pinkOverlay}></div>
              <div className={styles.yellowOverlay}></div>

              {/* Face */}
              <div className={styles.face}>
                {/* Eyes */}
                <div className={styles.eyes}>
                  <div className={styles.eyeX}>
                    <div className={styles.line1}></div>
                    <div className={styles.line2}></div>
                  </div>
                  <div className={styles.eyeX}>
                    <div className={styles.line1}></div>
                    <div className={styles.line2}></div>
                  </div>
                </div>
                {/* Mouth */}
                <svg
                  className={styles.mouth}
                  width="24"
                  height="6"
                  viewBox="0 0 24 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M2 3C5 0 9 6 12 3C15 0 19 6 22 3" />
                </svg>
              </div>

              <div className={styles.bandaid}>
                <div className={styles.bandaidInner}>
                  <div className={styles.bandaidDot}></div>
                </div>
              </div>
            </div>

            {/* Orbit */}
            <div className={styles.orbit} aria-hidden="true"></div>

            {/* Warning Icons */}
            <div className={styles.warning1} aria-hidden="true">
              !
            </div>
            <div className={styles.warning2} aria-hidden="true">
              ⚡
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className={styles.subtitle}>Oops!</h1>
        <h2 className={styles.title}>A temporary problem occurred.</h2>
        <p className={styles.description}>
          The server is a little dizzy.
          <br />
          Please try again later.
        </p>

        <div className={styles.actions}>
          <button onClick={handleReset} className={styles.primaryButton} aria-label="Refresh page">
            <div className={styles.iconWrapper} aria-hidden="true">
              <RotateCcw size={18} />
            </div>
            <span>Refresh page</span>
          </button>

          <button
            onClick={handleGoHome}
            className={styles.secondaryButton}
            aria-label="Go to home page"
          >
            <Home size={16} />
            <span>Go to home page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
