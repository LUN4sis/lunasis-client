import { Providers } from '@web/components/layouts';

export const metadata = {
  title: 'LUNAsis - OAuth',
  description: 'OAuth callback handler',
};

export default function OAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
