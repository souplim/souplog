import { describe, expect, it } from 'vitest';
import {
  applyStatusChange,
  daysSince,
  groupFinishedByYear,
  monthlyFinishedCounts,
  progressPercent,
  resolveSummaryYear,
  sanitizeForStatus,
  summaryYears,
  todayInSeoul,
  type BookProgress,
} from './book-shelf';

const TODAY = '2026-10-21';

const WANT: BookProgress = {
  status: 'want',
  total_pages: 300,
  current_page: 0,
  started_at: null,
  finished_at: null,
};

describe('applyStatusChange', () => {
  it('stamps today as the start date when a wished book is started', () => {
    expect(applyStatusChange(WANT, 'reading', TODAY)).toMatchObject({ status: 'reading', started_at: TODAY });
  });

  it('keeps an existing start date when the book was already started', () => {
    const reading = { ...WANT, status: 'reading' as const, started_at: '2026-10-01', current_page: 120 };
    expect(applyStatusChange(reading, 'done', TODAY)).toMatchObject({
      status: 'done',
      started_at: '2026-10-01',
      finished_at: TODAY,
    });
  });

  it('moves the bookmark to the last page when a book is finished', () => {
    const reading = { ...WANT, status: 'reading' as const, started_at: '2026-10-01', current_page: 120 };
    expect(applyStatusChange(reading, 'done', TODAY).current_page).toBe(300);
  });

  it('leaves the page count alone when finishing a book of unknown length', () => {
    const reading = { ...WANT, status: 'reading' as const, total_pages: null, current_page: 80 };
    expect(applyStatusChange(reading, 'done', TODAY).current_page).toBe(80);
  });

  it('clears the reading record when a book goes back to the wishlist', () => {
    const done = { ...WANT, status: 'done' as const, started_at: '2026-10-01', finished_at: TODAY, current_page: 300 };
    expect(applyStatusChange(done, 'want', TODAY)).toEqual(WANT);
  });

  it('does not modify the book it was given', () => {
    const book = { ...WANT };
    applyStatusChange(book, 'reading', TODAY);
    expect(book).toEqual(WANT);
  });
});

describe('sanitizeForStatus', () => {
  it('drops dates and the bookmark from a wished book', () => {
    const book = { ...WANT, started_at: '2026-10-01', finished_at: TODAY, current_page: 40 };
    expect(sanitizeForStatus(book)).toEqual(WANT);
  });

  it('drops the finish date from a book still being read', () => {
    const book = { ...WANT, status: 'reading' as const, started_at: '2026-10-01', finished_at: TODAY };
    expect(sanitizeForStatus(book).finished_at).toBeNull();
  });

  it('keeps a finished book as it is', () => {
    const book = { ...WANT, status: 'done' as const, started_at: '2026-10-01', finished_at: TODAY, current_page: 300 };
    expect(sanitizeForStatus(book)).toEqual(book);
  });
});

describe('progressPercent', () => {
  it('rounds to a whole percent', () => {
    expect(progressPercent(100, 300)).toBe(33);
  });

  it('is null when the page count is unknown', () => {
    expect(progressPercent(100, null)).toBeNull();
  });

  it('never goes past 100', () => {
    expect(progressPercent(320, 300)).toBe(100);
  });
});

describe('daysSince', () => {
  it('counts the start day itself as day one', () => {
    expect(daysSince(TODAY, TODAY)).toBe(1);
  });

  it('counts across a month boundary', () => {
    expect(daysSince('2026-09-30', '2026-10-02')).toBe(3);
  });
});

describe('groupFinishedByYear', () => {
  const book = (id: string, finished_at: string | null) => ({ id, finished_at });

  it('puts the newest year first and shelves each year newest to oldest', () => {
    const groups = groupFinishedByYear([
      book('a', '2025-03-01'),
      book('b', '2026-09-01'),
      book('c', '2026-01-15'),
    ]);

    expect(groups.map((group) => group.year)).toEqual([2026, 2025]);
    expect(groups[0]?.books.map((entry) => entry.id)).toEqual(['b', 'c']);
  });

  it('collects books without a finish date in a last, undated group', () => {
    const groups = groupFinishedByYear([book('a', null), book('b', '2026-09-01')]);
    expect(groups.map((group) => group.year)).toEqual([2026, null]);
  });

  it('returns no groups for an empty shelf', () => {
    expect(groupFinishedByYear([])).toEqual([]);
  });
});

describe('monthlyFinishedCounts', () => {
  it('counts finished books per month of the given year only', () => {
    const counts = monthlyFinishedCounts(
      [{ finished_at: '2026-01-03' }, { finished_at: '2026-01-30' }, { finished_at: '2026-12-01' }, { finished_at: '2025-01-01' }, { finished_at: null }],
      2026,
    );

    expect(counts).toHaveLength(12);
    expect(counts[0]).toBe(2);
    expect(counts[11]).toBe(1);
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(3);
  });
});

describe('summaryYears', () => {
  it('lists every year with a finished book plus the current one, newest first', () => {
    const years = summaryYears(
      [{ finished_at: '2024-05-01' }, { finished_at: '2022-01-09' }, { finished_at: '2024-11-30' }, { finished_at: null }],
      2026,
    );

    expect(years).toEqual([2026, 2024, 2022]);
  });

  it('offers only the current year when nothing has been finished', () => {
    expect(summaryYears([], 2026)).toEqual([2026]);
  });
});

describe('resolveSummaryYear', () => {
  const years = [2026, 2024];

  it('accepts a year that is on offer', () => {
    expect(resolveSummaryYear('2024', years, 2026)).toBe(2024);
  });

  it('falls back for a missing, malformed, or unoffered year', () => {
    expect(resolveSummaryYear(undefined, years, 2026)).toBe(2026);
    expect(resolveSummaryYear('abc', years, 2026)).toBe(2026);
    expect(resolveSummaryYear('2025', years, 2026)).toBe(2026);
    expect(resolveSummaryYear(['2024', '2026'], years, 2026)).toBe(2026);
  });
});

describe('todayInSeoul', () => {
  it('uses the Seoul calendar day, not UTC', () => {
    // 2026-10-21 16:00 UTC is already the 22nd in Seoul.
    expect(todayInSeoul(new Date('2026-10-21T16:00:00Z'))).toBe('2026-10-22');
  });
});
