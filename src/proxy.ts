import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { buildCsp } from '~/lib/csp';
import { rejectOversizedBody } from '~/lib/request-body-limit';
import { getSupabaseAnonKey, getSupabaseUrl } from '~/lib/supabase/env';

/**
 * Refreshes the Supabase session cookie on every request (Next.js 16 renamed
 * `middleware` to `proxy` — same execution model, see AGENTS.md), issues a
 * per-request CSP nonce, and holds signed-out requests to a small body size. This is an optimistic pass only: real authorization
 * happens per-request via RLS and `getCurrentUser()` in each Server
 * Component/Action, never here.
 */
const REJECTION_MESSAGES = {
  411: '요청 본문의 크기를 알 수 없습니다.',
  413: '요청 본문이 너무 큽니다.',
} as const;

const MEDIA_PATH_PREFIX = '/media/';

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

  // getClaims refreshes an expiring session like getUser does, but verifies
  // the JWT locally against the project's ES256 key instead of asking the
  // auth server — one less round trip on every request.
  const { data } = await supabase.auth.getClaims();

  const rejection = rejectOversizedBody(request, Boolean(data?.claims));
  if (rejection !== null) {
    return new NextResponse(REJECTION_MESSAGES[rejection], { status: rejection });
  }

  // /media sets its own, stricter policy for the files it serves.
  if (!request.nextUrl.pathname.startsWith(MEDIA_PATH_PREFIX)) {
    response.headers.set('Content-Security-Policy', buildCsp(nonce));
  }
  return response;
}

// No file-extension exclusions: a page path can end in `.png` too
// (`/posts/x.png`), and skipping it would skip the body limit for its actions.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
