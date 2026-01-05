'use client';

import { ComponentType, Suspense, ReactNode } from 'react';

export function withSuspense<P extends object>(Component: ComponentType<P>, fallback?: ReactNode) {
  const WrappedComponent = (props: P) => {
    return (
      <Suspense fallback={fallback ?? <div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );
  };

  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
