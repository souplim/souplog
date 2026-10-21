import { describe, expect, it } from 'vitest';
import { bookSchema } from './validation';

/** What the book form posts, every field as the string a FormData entry carries. */
const FORM = {
  title: '  데미안 ',
  author: '헤르만 헤세',
  publisher: '',
  isbn: '',
  status: 'reading',
  totalPages: '248',
  currentPage: '120',
  startedAt: '2026-10-01',
  finishedAt: '',
  rating: '',
  note: '',
  isPublic: true,
};

function firstError(input: Record<string, unknown>): string | undefined {
  const result = bookSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('bookSchema', () => {
  it('turns the form strings into the stored shape', () => {
    expect(bookSchema.parse(FORM)).toEqual({
      title: '데미안',
      author: '헤르만 헤세',
      publisher: '',
      isbn: null,
      status: 'reading',
      total_pages: 248,
      current_page: 120,
      started_at: '2026-10-01',
      finished_at: null,
      rating: null,
      note: '',
      is_public: true,
    });
  });

  it('treats fields the form did not render as empty', () => {
    const parsed = bookSchema.parse({ title: '데미안', status: 'want', isPublic: true });
    expect(parsed).toMatchObject({ total_pages: null, current_page: 0, started_at: null, rating: null });
  });

  it('requires a title', () => {
    expect(firstError({ ...FORM, title: '  ' })).toBe('제목을 입력하세요.');
  });

  it('rejects a bookmark past the last page', () => {
    expect(firstError({ ...FORM, currentPage: '300' })).toBe('읽은 쪽수가 전체 쪽수보다 많습니다.');
  });

  it('rejects a finish date before the start date', () => {
    expect(firstError({ ...FORM, status: 'done', finishedAt: '2026-09-01' })).toBe(
      '다 읽은 날이 읽기 시작한 날보다 앞섭니다.',
    );
  });

  it('ignores a stale bookmark on a wished book instead of rejecting it', () => {
    const parsed = bookSchema.parse({ ...FORM, status: 'want', currentPage: '999' });
    expect(parsed).toMatchObject({ current_page: 0, started_at: null });
  });

  it('rejects a rating outside one to five', () => {
    expect(bookSchema.safeParse({ ...FORM, status: 'done', rating: '6' }).success).toBe(false);
  });
});
