/**
 * Pure helpers behind the bookshelf: status transitions, reading dates, and
 * how the shelf groups finished books. No I/O here — every
 * date comes in as a `YYYY-MM-DD` string so the rules stay testable.
 */

export const BOOK_STATUSES = ['want', 'reading', 'done'] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  want: '읽고 싶은 책',
  reading: '읽는 중',
  done: '읽은 책',
};

/** The fields a status change touches. */
export interface BookProgress {
  status: BookStatus;
  started_at: string | null;
  finished_at: string | null;
}

/**
 * Drops whatever doesn't belong to the book's status — a wished book has no
 * reading record, a book still being read has no finish date — so a stale
 * value left in a hidden form field can't land in the database.
 */
export function sanitizeForStatus<T extends BookProgress>(book: T): T {
  switch (book.status) {
    case 'want':
      return { ...book, started_at: null, finished_at: null };
    case 'reading':
      return { ...book, finished_at: null };
    case 'done':
      return book;
  }
}

/**
 * The one-tap transitions on the book page: starting stamps today as the
 * start date (unless one is already set), finishing stamps the finish date.
 */
export function applyStatusChange<T extends BookProgress>(book: T, next: BookStatus, today: string): T {
  switch (next) {
    case 'want':
      return sanitizeForStatus({ ...book, status: next });
    case 'reading':
      return { ...book, status: next, started_at: book.started_at ?? today, finished_at: null };
    case 'done':
      return { ...book, status: next, finished_at: book.finished_at ?? today };
  }
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** "N일째" — the start day itself is day one. */
export function daysSince(startDate: string, today: string): number {
  const elapsed = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`);
  return Math.floor(elapsed / MS_PER_DAY) + 1;
}

export interface ShelfRow<T> {
  /** `null` collects finished books whose finish date was never recorded. */
  year: number | null;
  books: T[];
}

function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

/**
 * One shelf per year, newest year on top. Inside a shelf the most recently
 * finished book comes first, so it's the one in view before the row scrolls.
 */
export function groupFinishedByYear<T extends { finished_at: string | null }>(books: readonly T[]): ShelfRow<T>[] {
  const dated = books
    .filter((book): book is T & { finished_at: string } => book.finished_at !== null)
    .toSorted((a, b) => b.finished_at.localeCompare(a.finished_at));
  const undated = books.filter((book) => book.finished_at === null);

  const years = [...new Set(dated.map((book) => yearOf(book.finished_at)))].toSorted((a, b) => b - a);
  const rows: ShelfRow<T>[] = years.map((year) => ({
    year,
    books: dated.filter((book) => yearOf(book.finished_at) === year),
  }));

  return undated.length > 0 ? [...rows, { year: null, books: undated }] : rows;
}

/** Books finished in each month of `year`, January first. */
export function monthlyFinishedCounts(books: readonly { finished_at: string | null }[], year: number): number[] {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    return books.filter((book) => book.finished_at?.startsWith(prefix)).length;
  });
}

/** The fields that decide which year a book counts toward in the summary. */
export interface SummaryBook {
  status: BookStatus;
  started_at: string | null;
  finished_at: string | null;
  /** A UTC timestamp, unlike the `YYYY-MM-DD` reading dates. */
  created_at: string;
}

/**
 * The year a book counts toward in the shelf summary: a finished book by its
 * finish date, a book being read by when it was started, a wished book by
 * when it went on the shelf (in Seoul). A book missing its reading date falls
 * back to when it was added, so filtering by year never hides it entirely.
 */
export function summaryYearOf(book: SummaryBook): number {
  const addedYear = yearOf(todayInSeoul(new Date(book.created_at)));
  switch (book.status) {
    case 'done':
      return book.finished_at ? yearOf(book.finished_at) : addedYear;
    case 'reading':
      return book.started_at ? yearOf(book.started_at) : addedYear;
    case 'want':
      return addedYear;
  }
}

/**
 * Years the shelf summary can show: every year any book counts toward, plus
 * the current year even before its first book, oldest first.
 */
export function summaryYears(books: readonly SummaryBook[], currentYear: number): number[] {
  const bookYears = books.map(summaryYearOf);
  return [...new Set([currentYear, ...bookYears])].toSorted((a, b) => a - b);
}

/** How many books of each status count toward `year`. */
export function statusCountsInYear(books: readonly SummaryBook[], year: number): Record<BookStatus, number> {
  const inYear = books.filter((book) => summaryYearOf(book) === year);
  return {
    want: inYear.filter((book) => book.status === 'want').length,
    reading: inYear.filter((book) => book.status === 'reading').length,
    done: inYear.filter((book) => book.status === 'done').length,
  };
}

/** The `?year=` param when it names an offered year, else `fallback`. */
export function resolveSummaryYear(
  param: string | string[] | undefined,
  years: readonly number[],
  fallback: number,
): number {
  if (typeof param !== 'string') return fallback;
  const year = Number(param);
  return years.includes(year) ? year : fallback;
}

const seoulDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today's date in Seoul as `YYYY-MM-DD` — the server itself runs in UTC. */
export function todayInSeoul(now: Date = new Date()): string {
  return seoulDateFormatter.format(now);
}
