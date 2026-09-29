import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { fraunces, gowunBatang, pretendard } from './fonts';
import { ThemeProvider } from '~/components/theme/ThemeProvider';
import { Header } from '~/components/header/Header';
import { Footer } from '~/components/header/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'souplog',
    template: '%s · souplog',
  },
  description: '개인 블로그 souplog.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html
      lang="ko"
      className={`${fraunces.variable} ${gowunBatang.variable} ${pretendard.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider nonce={nonce}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
