import 'server-only';
import { z } from 'zod';
import { kakaoBookDocumentSchema, toBookSearchResult, type BookSearchResult } from '~/lib/book-search';

const SEARCH_ENDPOINT = 'https://dapi.kakao.com/v3/search/book';
const RESULT_SIZE = 10;
const TIMEOUT_MS = 5000;

const searchResponseSchema = z.object({
  documents: z.array(kakaoBookDocumentSchema),
});

function getApiKey(): string {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) throw new Error('환경변수 KAKAO_REST_API_KEY가 비어 있습니다. .env.local을 확인하세요.');
  return key;
}

/** Title, author, or ISBN — Kakao matches the query against all of them. */
export async function searchKakaoBooks(query: string): Promise<BookSearchResult[]> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({ query, size: String(RESULT_SIZE) });

  let response: Response;
  try {
    response = await fetch(`${SEARCH_ENDPOINT}?${params}`, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch {
    throw new Error('책 검색 서버에 연결하지 못했습니다.');
  }

  if (response.status === 401) throw new Error('카카오 REST API 키가 올바르지 않습니다.');
  if (!response.ok) throw new Error(`책을 검색하지 못했습니다 (${response.status}).`);

  const parsed = searchResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error('책 검색 결과를 읽지 못했습니다.');

  return parsed.data.documents.map(toBookSearchResult);
}
