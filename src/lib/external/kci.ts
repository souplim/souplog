import 'server-only';
import { unstable_cache } from 'next/cache';
import { parsePopularKeywordsHtml, type PopularKeywords } from '~/lib/kci-keywords';

const POPULAR_KEYWORDS_ENDPOINT = 'https://www.kci.go.kr/kciportal/topKeyword.kci';
const TIMEOUT_MS = 20_000;
/** KCI ranks a whole publication year at once, so a day-old copy is never meaningfully stale. */
const REVALIDATE_SECONDS = 86_400;
const CACHE_TAG = 'kci';

export interface PopularKeywordsSnapshot extends PopularKeywords {
  /** When this copy was taken from KCI (ISO string — the cache stores JSON). */
  fetchedAt: string;
}

/** 대분야별 인기 키워드 순위 from the portal's main page, every 대분야 at once. */
async function fetchPopularKeywords(): Promise<PopularKeywordsSnapshot> {
  let response: Response;
  try {
    // no-store here: caching happens one level up, after the body is checked.
    response = await fetch(POPULAR_KEYWORDS_ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch {
    throw new Error('KCI 서버에 연결하지 못했습니다.');
  }
  if (!response.ok) throw new Error(`인기 키워드를 불러오지 못했습니다 (${response.status}).`);
  return { ...parsePopularKeywordsHtml(await response.text()), fetchedAt: new Date().toISOString() };
}

// Wrapping the parsed result rather than relying on `fetch`'s cache means a
// throw (bad body, empty list) is never stored. See `kosis.ts`.
export const getPopularKeywords = unstable_cache(fetchPopularKeywords, ['kci-popular-keywords'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [CACHE_TAG],
});
