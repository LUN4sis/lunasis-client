import { Playfair_Display } from 'next/font/google';

export const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
});
