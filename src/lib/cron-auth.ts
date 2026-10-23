export type CronCheck = 'ok' | 'unauthorized' | 'misconfigured';

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when that env var is
 * set. In production a missing secret is an error, not an open door — the
 * route would otherwise answer anyone who finds it.
 */
export function checkCronRequest(
  secret: string | undefined,
  authorization: string | null,
  isProduction: boolean,
): CronCheck {
  if (!secret) return isProduction ? 'misconfigured' : 'ok';
  return authorization === `Bearer ${secret}` ? 'ok' : 'unauthorized';
}
