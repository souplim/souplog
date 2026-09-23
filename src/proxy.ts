import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { buildCsp } from '~/lib/csp';
import { getSupabaseAnonKey, getSupabaseUrl } from '~/lib/supabase/env';

/**
 * Refreshes the Supabase session cookie on every request (Next.js 16 renamed
 * `middleware` to `proxy` — same execution model, see AGENTS.md) and issues a
 * per-request CSP nonce. This is an optimistic pass only: real authorization
 * happens per-request via RLS and `supabase.auth.getUser()` in each Server
 * Component/Action, never here.
 */
export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  const requestWithNonce = { headers: requestHeaders };

  let response = NextResponse.next({ request: requestWithNonce });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: requestWithNonce });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();

  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
