/**
 * Built per-request in `proxy.ts` with a fresh nonce, so inline scripts
 * (next-themes' anti-flash snippet) can run without a blanket 'unsafe-inline'.
 *
 * Dev builds add 'unsafe-eval': Next.js dev mode (Fast Refresh/Turbopack HMR)
 * and React's dev-mode callstack reconstruction rely on eval(). Production
 * never uses eval(), so the directive stays tight there.
 */
export function buildCsp(nonce: string): string {
  const scriptSrc =
    process.env.NODE_ENV === 'production'
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`;

  return [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline'`,
    // blob: covers the local previews the post form shows for photos that
    // haven't been uploaded yet.
    `img-src 'self' data: blob: https://*.supabase.co`,
    `font-src 'self'`,
    `connect-src 'self' https://*.supabase.co`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ');
}
