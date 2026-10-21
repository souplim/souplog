import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient } from '~/lib/supabase/server';

/**
 * Returns the signed-in owner's JWT claims, or `null` if no one is signed in.
 * Cached per request — Header, Footer, and a page body all ask independently.
 *
 * `getClaims` verifies the token's signature locally (the project signs with
 * an asymmetric ES256 key), so unlike `getUser` it costs no auth-server round
 * trip. The trade-off: a session revoked elsewhere stays valid here until its
 * access token expires — Postgres still checks the same JWT through RLS.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims ?? null;
});

/**
 * Guards admin Server Components and Server Actions. Redirects to `/login`
 * rather than returning `null`, so every caller gets the same behavior
 * without remembering to check for it — see the admin layout and each
 * mutating Server Action in `~/lib/actions`.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
