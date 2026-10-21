import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { ThemeProvider } from '~/components/theme/ThemeProvider';
import { Header } from '~/components/header/Header';
import { Footer } from '~/components/header/Footer';
// Pretendard split by unicode-range into ~90 small files: a page downloads only
// the subsets its own text uses, instead of preloading every Hangul glyph in
// two weights (~1.5MB) up front. One variable file covers both weights we use.
// Served from /_next/static/media, so `font-src 'self'` still holds.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
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
    <html lang="ko" suppressHydrationWarning>
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
