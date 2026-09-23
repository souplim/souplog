import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';
import type { Database } from './types';

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Must be created fresh per request — never module-scoped.
 *
 * Writing cookies from a Server Component render is not supported by
 * Next.js, so `setAll` is wrapped in try/catch: `proxy.ts` is the one place
 * that reliably refreshes the session cookie on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component render — proxy.ts refreshes instead.
        }
      },
    },
  });
}
