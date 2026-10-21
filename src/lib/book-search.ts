import { z } from 'zod';

/**
 * Shapes Kakao book-search results for the book form, and decides which
 * cover addresses the server may download. Pure — the HTTP call lives in
 * `kakao-books.ts`.
 */

/** The fields of one Kakao search document this app reads. Everything else is ignored. */
export const kakaoBookDocumentSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  publisher: z.string(),
  isbn: z.string(),
  datetime: z.string(),
  thumbnail: z.string(),
});

export type KakaoBookDocument = z.infer<typeof kakaoBookDocumentSchema>;

export interface BookSearchResult {
  title: string;
  author: string;
  publisher: string;
  isbn: string | null;
  year: string | null;
  /** Small image for the result list — served from the host the CSP allows. */
  thumbnailUrl: string | null;
  /** The best-quality image the server will download and store as the cover. */
  coverUrl: string | null;
}

/**
 * The only hosts the server will fetch a cover from. The address arrives
 * from the browser when the form is saved, so anything else is refused —
 * otherwise the save action could be pointed at internal addresses.
 */
const COVER_HOSTS = new Set(['search1.kakaocdn.net', 't1.daumcdn.net']);

/** Kakao's search thumbnails wrap the original image's address in this query parameter. */
const ORIGINAL_IMAGE_PARAM = 'fname';

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isAllowedCoverUrl(value: string): boolean {
  const url = parseUrl(value);
  return url !== null && url.protocol === 'https:' && COVER_HOSTS.has(url.hostname);
}

/** Kakao lists "ISBN10 ISBN13" separated by a space, either of which may be blank. */
export function pickIsbn13(value: string): string | null {
  const isbns = value.split(/\s+/).filter(Boolean);
  return isbns.find((isbn) => isbn.length === 13) ?? isbns[0] ?? null;
}

/**
 * The thumbnail is 120px wide — too soft for a cover page. When it wraps a
 * trusted original, use that instead (upgraded to https); otherwise keep the
 * thumbnail itself.
 */
export function resolveCoverSourceUrl(thumbnail: string): string | null {
  const url = parseUrl(thumbnail);
  if (!url) return null;

  const wrapped = url.searchParams.get(ORIGINAL_IMAGE_PARAM);
  const original = wrapped ? parseUrl(wrapped) : null;
  if (original && COVER_HOSTS.has(original.hostname)) {
    original.protocol = 'https:';
    return original.toString();
  }

  return isAllowedCoverUrl(thumbnail) ? thumbnail : null;
}

export function toBookSearchResult(document: KakaoBookDocument): BookSearchResult {
  const thumbnailUrl = isAllowedCoverUrl(document.thumbnail) ? document.thumbnail : null;

  return {
    title: document.title,
    author: document.authors.join(', '),
    publisher: document.publisher,
    isbn: pickIsbn13(document.isbn),
    year: document.datetime.slice(0, 4) || null,
    thumbnailUrl,
    coverUrl: thumbnailUrl ? resolveCoverSourceUrl(thumbnailUrl) : null,
  };
}
