import 'server-only';
import { isAllowedCoverUrl } from '~/lib/book-search';

/** Matches the post-images bucket's file_size_limit. */
const MAX_COVER_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const IMAGE_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png', 'image/gif']);

/**
 * Downloads a cover picked from search results, as a File the regular image
 * upload accepts. The address came from the browser, so it is checked
 * against the trusted hosts again here, and redirects are refused — a
 * redirect could lead anywhere the host check didn't see.
 */
export async function downloadCover(url: string): Promise<File> {
  if (!isAllowedCoverUrl(url)) throw new Error('허용되지 않은 표지 주소입니다.');

  let response: Response;
  try {
    response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store' });
  } catch {
    throw new Error('표지를 내려받지 못했습니다.');
  }
  if (!response.ok) throw new Error(`표지를 내려받지 못했습니다 (${response.status}).`);

  const type = response.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
  if (!IMAGE_TYPES.has(type)) throw new Error('표지 이미지 형식을 알 수 없습니다.');

  const declaredSize = Number(response.headers.get('content-length'));
  if (declaredSize > MAX_COVER_BYTES) throw new Error('표지 이미지가 너무 큽니다.');

  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_COVER_BYTES) throw new Error('표지 이미지가 너무 큽니다.');

  return new File([bytes], 'cover', { type });
}
