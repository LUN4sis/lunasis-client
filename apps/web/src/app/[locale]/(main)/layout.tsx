import { Suspense } from 'react';
import { BottomNavigation } from '@web/components/layouts/bottom-navigation';

export default function WithBottomNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="app-content">{children}</main>
      <Suspense fallback={null}>
        <BottomNavigation />
      </Suspense>
    </>
  );
}
