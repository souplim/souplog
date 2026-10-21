import { describe, expect, it } from 'vitest';
import {
  applyStatusChange,
  daysSince,
  groupFinishedByYear,
  monthlyFinishedCounts,
  progressPercent,
  sanitizeForStatus,
  shelfSpineStyles,
  spineStyle,
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

  it('puts the newest year first and shelves each year oldest to newest', () => {
    const groups = groupFinishedByYear([
      book('a', '2025-03-01'),
      book('b', '2026-09-01'),
      book('c', '2026-01-15'),
    ]);

    expect(groups.map((group) => group.year)).toEqual([2026, 2025]);
    expect(groups[0]?.books.map((entry) => entry.id)).toEqual(['c', 'b']);
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

describe('spineStyle', () => {
  it('gives a longer book a taller and thicker spine', () => {
    const thin = spineStyle({ title: '얇은 책', total_pages: 150 });
    const thick = spineStyle({ title: '두꺼운 책', total_pages: 600 });

    expect(thick.heightRem).toBeGreaterThan(thin.heightRem);
    expect(thick.widthRem).toBeGreaterThan(thin.widthRem);
  });

  it('keeps extreme page counts inside the shelf', () => {
    const tiny = spineStyle({ title: '팸플릿', total_pages: 10 });
    const huge = spineStyle({ title: '백과사전', total_pages: 5000 });

    expect(huge.heightRem).toBe(spineStyle({ title: '백과사전', total_pages: 640 }).heightRem);
    expect(tiny.heightRem).toBe(spineStyle({ title: '팸플릿', total_pages: 120 }).heightRem);
  });

  it('picks the same tone for the same title every time', () => {
    expect(spineStyle({ title: '데미안', total_pages: 200 }).tone).toBe(
      spineStyle({ title: '데미안', total_pages: 200 }).tone,
    );
  });

  it('never repeats the tone of the spine standing to its left', () => {
    const own = spineStyle({ title: '데미안', total_pages: 200 }).tone;
    expect(spineStyle({ title: '데미안', total_pages: 200 }, own).tone).not.toBe(own);
  });

  it('keeps neighbors on a shelf row apart even when their titles hash alike', () => {
    const tones = shelfSpineStyles([
      { title: '데미안', total_pages: 200 },
      { title: '데미안', total_pages: 200 },
      { title: '데미안', total_pages: 200 },
    ]).map((style) => style.tone);

    expect(tones[1]).not.toBe(tones[0]);
    expect(tones[2]).not.toBe(tones[1]);
  });

  it('gives a book of unknown length a middling spine', () => {
    const unknown = spineStyle({ title: '모름', total_pages: null });
    expect(unknown.heightRem).toBeGreaterThan(spineStyle({ title: '모름', total_pages: 120 }).heightRem);
    expect(unknown.heightRem).toBeLessThan(spineStyle({ title: '모름', total_pages: 640 }).heightRem);
  });
});

describe('todayInSeoul', () => {
  it('uses the Seoul calendar day, not UTC', () => {
    // 2026-10-21 16:00 UTC is already the 22nd in Seoul.
    expect(todayInSeoul(new Date('2026-10-21T16:00:00Z'))).toBe('2026-10-22');
  });
});
