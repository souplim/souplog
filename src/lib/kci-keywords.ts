import { htmlToText } from '~/lib/html-text';

/**
 * KCI's 대분야별 인기 키워드 순위 — the HTML fragment (`topKeyword.kci`) the
 * portal's main page loads: one block per 대분야, each the top keywords on
 * papers its journals published in one year. Undocumented, so parsed
 * defensively; an empty result throws so it's never cached.
 */

export interface FieldKeywords {
  /** The 대분야 as KCI names it, e.g. `인문학`. */
  field: string;
  /** Most-used first. */
  keywords: string[];
}

export interface PopularKeywords {
  /** The publication year the ranking counts (`2025`); empty if KCI's heading changed. */
  year: string;
  fields: FieldKeywords[];
}

const KEYWORD_TREND_URL = 'https://www.kci.go.kr/kciportal/po/search/poLateRelaKwdList.kci';

/** KCI's 키워드별 연구동향 page searches whatever this param carries as soon as it loads. */
export function kciKeywordTrendUrl(keyword: string): string {
  return `${KEYWORD_TREND_URL}?${new URLSearchParams({ 'poLateRelaKwdBean.keyword': keyword })}`;
}

function toFieldKeywords(block: string): FieldKeywords[] {
  const field = htmlToText(/<dt[^>]*>([\s\S]*?)<\/dt>/i.exec(block)?.[1] ?? '');
  const keywords = [...block.matchAll(/<em class="oneline">([\s\S]*?)<\/em>/gi)]
    .map((match) => htmlToText(match[1] ?? ''))
    .filter(Boolean);
  return field && keywords.length > 0 ? [{ field, keywords }] : [];
}

export function parsePopularKeywordsHtml(html: string): PopularKeywords {
  const blocks = [...html.matchAll(/<dl[^>]*>([\s\S]*?)<\/dl>/gi)].map((match) => match[1] ?? '');
  const fields = blocks.flatMap(toFieldKeywords);
  if (fields.length === 0) throw new Error('KCI 인기 키워드가 비어 있습니다.');

  const year = /(\d{4})년에 발행한/.exec(html)?.[1] ?? '';
  return { year, fields };
}
