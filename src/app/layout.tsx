import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Providers } from '@/components/layouts';
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
  themeColor: '#e9e9e9',
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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#e9e9e9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.variable} style={{ backgroundColor: '#e9e9e9' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
