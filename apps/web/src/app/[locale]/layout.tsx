import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Providers } from '@web/components/layouts';
import { TokenExpirationHandler } from '@web/features/auth/components/token-expiration-handler';
import { LoadingFallback } from '@web/components/ui/loading-fallback';
import { routing } from '@web/i18n/routing';

import '../globals.scss';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={dmSans.variable} style={{ backgroundColor: '#f6f6f6' }}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {/* next-intl 권장 사항: NextIntlClientProvider 내부에 Suspense 경계 제공 */}
            {/* Recommended by next-intl: Provide Suspense boundary inside NextIntlClientProvider */}
            <Suspense fallback={<LoadingFallback />}>
              <TokenExpirationHandler />
              {children}
            </Suspense>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
