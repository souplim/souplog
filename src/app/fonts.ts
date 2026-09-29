import { Fraunces, Gowun_Batang } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * Self-hosted by Next.js at build time — no runtime request, so it works
 * under a strict CSP with no external font origin allowed.
 *
 * Gowun Batang over Noto Serif KR: Noto's CJK-unified strokes read as a
 * generic system serif at display sizes. Gowun Batang is a Korean-specific
 * literary serif with finer proportions, closer to the restrained-luxury
 * direction in tokens.css.
 *
 * Korean type foundries generally don't design a distinct Latin glyph set
 * for their Hangul fonts — they ship a generic fallback serif for a-z, so
 * English titles still looked like plain Times. `fraunces` is layered in
 * front of it in --font-display (tokens.css) purely for that per-character
 * fallback: browsers pull each glyph from the first font that has it, so
 * Latin renders from Fraunces and Hangul falls through to Gowun Batang.
 */
export const gowunBatang = Gowun_Batang({
  // Google's API doesn't expose a "korean" subset toggle for this font —
  // Hangul glyphs ship unconditionally. `subsets` here only adds Latin
  // punctuation/digit coverage so mixed Korean/English titles render evenly.
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-gowun-batang',
});

export const fraunces = Fraunces({
  // Static weights (not `variable`) pin WONK/SOFT/opsz at their defaults —
  // standard letterforms, not Fraunces' quirkier editorial variant.
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-fraunces',
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
