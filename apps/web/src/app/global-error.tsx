'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { logger } from '@repo/shared/utils';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    logger.error('Global error occurred', {
      message: error.message || '(empty message)',
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'sans-serif',
            gap: '1rem',
          }}
        >
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Oops!</h1>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'normal', margin: 0 }}>
            A critical error occurred.
          </h2>
          <p style={{ color: '#666', margin: 0 }}>Please refresh the page or go back to home.</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: '#7c3aed',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Refresh page
            </button>
            <Link
              href="/"
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd',
                background: '#fff',
                color: '#333',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Go to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
