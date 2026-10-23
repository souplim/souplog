import 'server-only';
import { getPopularKeywords } from '~/lib/external/kci';
import type { FieldKeywords } from '~/lib/kci-keywords';

/** The 대분야 shown on /papers, in display order — KCI publishes eight. */
const SHOWN_FIELDS = ['인문학', '사회과학'] as const;

export type FieldKeywordsResult =
  { status: 'ok'; year: string; fields: FieldKeywords[]; fetchedAt: string } | { status: 'error'; message: string };

/**
 * This year's popular keywords for the fields this blog follows. Like the
 * paper lists, a KCI failure becomes an error state rather than a page error.
 */
export async function getFieldKeywords(): Promise<FieldKeywordsResult> {
  try {
    const { year, fields, fetchedAt } = await getPopularKeywords();
    const shown = SHOWN_FIELDS.flatMap((name) => fields.filter((entry) => entry.field === name));
    if (shown.length === 0) return { status: 'error', message: '인문학·사회과학 키워드를 찾지 못했습니다.' };
    return { status: 'ok', year, fields: shown, fetchedAt };
  } catch (error: unknown) {
    return { status: 'error', message: error instanceof Error ? error.message : '인기 키워드를 불러오지 못했습니다.' };
  }
}
