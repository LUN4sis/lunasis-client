import '../globals.scss';

import type { Metadata } from 'next';

import { Providers, ViewportHeightSetter } from '@web/components/layouts';
import { playfairDisplay } from '@web/styles/fonts';

export const metadata: Metadata = {
  title: 'LUNAsis - Starter Review',
  description: 'Starter package review',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f6f6f6',
};

// Starter Package Layout
// 스타터 패키지 레이아웃
// This layout is used for the starter-package page
// 이 레이아웃은 starter-package 페이지에 사용됩니다
export default function StarterPackageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={playfairDisplay.variable} style={{ backgroundColor: '#f6f6f6' }}>
        <ViewportHeightSetter />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
