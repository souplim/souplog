import { NextResponse, type NextRequest } from 'next/server';
import { checkCronRequest } from '~/lib/cron-auth';

/**
 * Supabase's free tier pauses a project after 7 days without a request.
 * `vercel.json`'s cron hits this route once a day so a quiet blog never goes
 * cold — see lba's `api/ping.ts` for the pattern this is adapted from.
 */

const PING_PATH = '/rest/v1/menus?select=id&limit=1';
const TIMEOUT_MS = 10_000;

export async function GET(request: NextRequest) {
  const check = checkCronRequest(
    process.env.CRON_SECRET,
    request.headers.get('authorization'),
    process.env.NODE_ENV === 'production',
  );
  // Shows up as a failed run in Vercel's cron log, so a missing secret gets noticed.
  if (check === 'misconfigured') {
    return NextResponse.json({ error: 'CRON_SECRET이 설정되지 않았습니다.' }, { status: 500 });
  }
  if (check === 'unauthorized') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json({ error: 'supabase env missing' }, { status: 500 });
  }

  try {
    const result = await fetch(`${url}${PING_PATH}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'supabase unreachable', status: result.status }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'supabase request failed' }, { status: 502 });
  }
}
