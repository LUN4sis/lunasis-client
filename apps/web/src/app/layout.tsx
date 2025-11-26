import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Providers } from '@web/components/layouts';
import { TokenExpirationHandler } from '@web/features/auth/components/token-expiration-handler';

import './globals.scss';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'LUNAsis',
  description:
    "LUNAsis PWA Your personal guide to women's health. Compare prices on feminine products, find trusted clinics, track your cycle, and get instant answers from our AI companion, Luna.",
  keywords: [
    'Lunasis',
    'PWA',
    'Feminine Health',
    'AI Companion',
    'Cycle Tracking',
    'Price Comparison',
    'Clinic Finder',
    'Luna',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'LUNAsis',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.variable} style={{ backgroundColor: '#f6f6f6' }}>
        <Providers>
          <TokenExpirationHandler />
          {children}
        </Providers>
      </body>
    </html>
  );
}
