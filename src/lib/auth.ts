import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient } from '~/lib/supabase/server';

/**
 * Returns the signed-in owner, or `null` if no one is signed in. Cached per
 * request — Header, Footer, and a page body all ask independently.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
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
