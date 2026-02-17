import '../globals.scss';

import { Providers, ViewportHeightSetter } from '@web/components/layouts';
import { DM_Sans } from 'next/font/google';
import type { Metadata } from 'next';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

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

// Starter Review Layout
// 스타터 리뷰 레이아웃
// This layout is used for the starter-review page
// 이 레이아웃은 starter-review 페이지에 사용됩니다
export default function StarterReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={dmSans.variable} style={{ backgroundColor: '#f6f6f6' }}>
        <ViewportHeightSetter />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
