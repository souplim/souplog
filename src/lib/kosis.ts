import 'server-only';
import { unstable_cache } from 'next/cache';
import { parseKosisResponse, type KosisRow } from '~/lib/kosis-series';

const DATA_ENDPOINT = 'https://kosis.kr/openapi/Param/statisticsParameterData.do';
/** KOSIS is slow on cold tables; one probe took over a minute. */
const TIMEOUT_MS = 30_000;
/** The tables move yearly or monthly, so a day-old copy is never meaningfully stale. */
const REVALIDATE_SECONDS = 86_400;

const CACHE_TAG = 'kosis';

export interface KosisQuery {
  orgId: string;
  tblId: string;
  /** Item codes; several are sent joined with `+`. */
  itmIds: string[];
  /** Classification codes per level, `objL1` first. */
  classes: string[][];
  /** How many of the most recent periods to fetch. */
  recentPeriods: number;
}

function getApiKey(): string {
  const key = process.env.KOSIS_API_KEY;
  if (!key) throw new Error('환경변수 KOSIS_API_KEY가 비어 있습니다. .env.local을 확인하세요.');
  return key;
}

async function fetchKosisRows(query: KosisQuery): Promise<KosisRow[]> {
  const params = new URLSearchParams({
    method: 'getList',
    apiKey: getApiKey(),
    format: 'json',
    jsonVD: 'Y',
    orgId: query.orgId,
    tblId: query.tblId,
    itmId: query.itmIds.join('+'),
    prdSe: 'Y',
    newEstPrdCnt: String(query.recentPeriods),
  });
  query.classes.forEach((codes, index) => params.set(`objL${index + 1}`, codes.join('+')));

  let response: Response;
  try {
    // no-store here: caching happens one level up, after the body is checked.
    response = await fetch(`${DATA_ENDPOINT}?${params}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch {
    throw new Error('KOSIS 서버에 연결하지 못했습니다.');
  }

  if (!response.ok) throw new Error(`통계를 불러오지 못했습니다 (${response.status}).`);
  return parseKosisResponse(await response.json());
}

/**
 * Cached for a day across requests. `fetch`'s own cache would also keep a
 * 200-with-error body, which KOSIS sends on failure; wrapping the parsed result
 * instead means a throw is never stored.
 *
 * `unstable_cache` is the cache for projects without Cache Components, which
 * this app doesn't enable.
 */
export const getKosisRows = unstable_cache(fetchKosisRows, ['kosis-rows'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [CACHE_TAG],
});
