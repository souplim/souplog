import { Noto_Serif_KR } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * Self-hosted by Next.js at build time — no runtime request, so it works
 * under a strict CSP with no external font origin allowed.
 */
export const notoSerifKr = Noto_Serif_KR({
  // Google's API doesn't expose a "korean" subset toggle for this font —
  // Hangul glyphs ship unconditionally. `subsets` here only adds Latin
  // punctuation/digit coverage so mixed Korean/English titles render evenly.
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

/**
 * Pretendard ships full-Hangul static weights (~750KB each, woff2). We only
 * load Regular + SemiBold — enough for body copy and UI emphasis — to keep
 * the font payload from growing with every additional weight.
 */
export const pretendard = localFont({
  src: [
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-pretendard',
});
