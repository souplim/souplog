import { describe, expect, it } from 'vitest';
import {
  applyStatusChange,
  daysSince,
  monthlyFinishedCounts,
  resolveSummaryYear,
  sanitizeForStatus,
  sortByFinishedDate,
  statusCountsInYear,
  summaryYearOf,
  summaryYears,
  todayInSeoul,
  type BookProgress,
  type SummaryBook,
} from './book-shelf';

const TODAY = '2026-10-21';

const WANT: BookProgress = {
  status: 'want',
  started_at: null,
  finished_at: null,
};

describe('applyStatusChange', () => {
  it('stamps today as the start date when a wished book is started', () => {
    expect(applyStatusChange(WANT, 'reading', TODAY)).toMatchObject({ status: 'reading', started_at: TODAY });
  });

  it('keeps an existing start date when the book was already started', () => {
    const reading = { ...WANT, status: 'reading' as const, started_at: '2026-10-01' };
    expect(applyStatusChange(reading, 'done', TODAY)).toMatchObject({
      status: 'done',
      started_at: '2026-10-01',
      finished_at: TODAY,
    });
  });

  it('clears the reading record when a book goes back to the wishlist', () => {
    const done = { ...WANT, status: 'done' as const, started_at: '2026-10-01', finished_at: TODAY };
    expect(applyStatusChange(done, 'want', TODAY)).toEqual(WANT);
  });

  it('does not modify the book it was given', () => {
    const book = { ...WANT };
    applyStatusChange(book, 'reading', TODAY);
    expect(book).toEqual(WANT);
  });
});

describe('sanitizeForStatus', () => {
  it('drops the reading dates from a wished book', () => {
    const book = { ...WANT, started_at: '2026-10-01', finished_at: TODAY };
    expect(sanitizeForStatus(book)).toEqual(WANT);
  });

  it('drops the finish date from a book still being read', () => {
    const book = { ...WANT, status: 'reading' as const, started_at: '2026-10-01', finished_at: TODAY };
    expect(sanitizeForStatus(book).finished_at).toBeNull();
  });

  it('keeps a finished book as it is', () => {
    const book = { ...WANT, status: 'done' as const, started_at: '2026-10-01', finished_at: TODAY };
    expect(sanitizeForStatus(book)).toEqual(book);
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

describe('sortByFinishedDate', () => {
  const book = (id: string, finished_at: string | null) => ({ id, finished_at });

  it('puts the most recently finished book first', () => {
    const sorted = sortByFinishedDate([book('a', '2026-01-15'), book('b', '2026-09-01'), book('c', '2026-03-01')]);
    expect(sorted.map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
  });

  it('puts books without a finish date last', () => {
    const sorted = sortByFinishedDate([book('a', null), book('b', '2026-09-01')]);
    expect(sorted.map((entry) => entry.id)).toEqual(['b', 'a']);
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

const dated = (overrides: Partial<SummaryBook> & Pick<SummaryBook, 'status'>): SummaryBook => ({
  started_at: null,
  finished_at: null,
  created_at: '2026-03-01T00:00:00+00:00',
  ...overrides,
});

describe('summaryYearOf', () => {
  it('counts a finished book in the year it was finished', () => {
    expect(summaryYearOf(dated({ status: 'done', started_at: '2025-12-01', finished_at: '2026-01-05' }))).toBe(2026);
  });

  it('counts a finished book with no finish date in the year it was added', () => {
    expect(summaryYearOf(dated({ status: 'done' }))).toBe(2026);
  });

  it('counts a book being read in the year it was started, else the year it was added', () => {
    expect(summaryYearOf(dated({ status: 'reading', started_at: '2027-01-21' }))).toBe(2027);
    expect(summaryYearOf(dated({ status: 'reading', created_at: '2025-06-01T00:00:00+00:00' }))).toBe(2025);
  });

  it('counts a wished book in the Seoul year it was added', () => {
    // 2025-12-31 16:00 UTC is already 2026-01-01 in Seoul.
    expect(summaryYearOf(dated({ status: 'want', created_at: '2025-12-31T16:00:00+00:00' }))).toBe(2026);
  });
});

describe('summaryYears', () => {
  it('lists every year any book counts toward plus the current one, oldest first', () => {
    const years = summaryYears(
      [
        dated({ status: 'done', finished_at: '2024-05-01' }),
        dated({ status: 'done', finished_at: '2024-11-30' }),
        dated({ status: 'reading', started_at: '2027-01-21' }),
        dated({ status: 'want', created_at: '2022-01-09T00:00:00+00:00' }),
      ],
      2026,
    );

    expect(years).toEqual([2022, 2024, 2026, 2027]);
  });

  it('offers only the current year when the shelf is empty', () => {
    expect(summaryYears([], 2026)).toEqual([2026]);
  });
});

describe('statusCountsInYear', () => {
  it('counts each status by the year it counts toward', () => {
    const counts = statusCountsInYear(
      [
        dated({ status: 'done', finished_at: '2026-02-01' }),
        dated({ status: 'done', finished_at: '2025-02-01' }),
        dated({ status: 'reading', started_at: '2026-10-21' }),
        dated({ status: 'reading', started_at: '2027-01-21' }),
        dated({ status: 'want' }),
      ],
      2026,
    );

    expect(counts).toEqual({ done: 1, reading: 1, want: 1 });
  });
});

describe('resolveSummaryYear', () => {
  const years = [2024, 2026];

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
