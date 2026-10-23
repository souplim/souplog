import { type NextRequest } from 'next/server';
import { getAttachmentDisposition, resolveMediaFile } from '~/lib/media';
import { createClient } from '~/lib/supabase/server';

/**
 * Serves a stored image or attachment. The buckets are private: the file is
 * fetched with the viewer's own session, so storage RLS decides — a visitor
 * gets only files that public posts, public books, or the profile use, and
 * the owner gets everything. `next/image` fetches through here without
 * cookies, so its cache only ever holds what a visitor may see.
 *
 * Anything that isn't served — a bad path, a file RLS hides, a missing one —
 * is the same 404, so a private file's existence isn't revealed.
 */

/** Browser-only caching: a post made private shouldn't linger on a shared CDN. */
const CACHE_CONTROL = 'private, max-age=300';

/** Nothing served from here is a page; if a browser ever renders one, it can't run anything. */
const MEDIA_CSP = "default-src 'none'; sandbox";

function notFound(): Response {
  return new Response('파일을 찾을 수 없습니다.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: NextRequest, { params }: RouteContext<'/media/[bucket]/[file]'>) {
  const { bucket, file } = await params;
  const media = resolveMediaFile(bucket, file);
  if (!media) return notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(media.bucket).download(media.path);
  if (error || !data) return notFound();

  const headers = new Headers({
    'Content-Type': media.contentType,
    'Content-Length': String(data.size),
    'Cache-Control': CACHE_CONTROL,
    'Content-Security-Policy': MEDIA_CSP,
  });
  if (media.isAttachment) {
    headers.set(
      'Content-Disposition',
      getAttachmentDisposition(request.nextUrl.searchParams.get('download'), media.path),
    );
  }

  return new Response(data.stream(), { headers });
}
