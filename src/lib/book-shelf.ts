/**
 * Pure helpers behind the bookshelf: status transitions, reading progress,
 * and how the shelf groups and draws finished books. No I/O here — every
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
  total_pages: number | null;
  current_page: number;
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
      return { ...book, current_page: 0, started_at: null, finished_at: null };
    case 'reading':
      return { ...book, finished_at: null };
    case 'done':
      return book;
  }
}

/**
 * The one-tap transitions on the book page: starting stamps today as the
 * start date (unless one is already set), finishing stamps the finish date
 * and moves the bookmark to the last page.
 */
export function applyStatusChange<T extends BookProgress>(book: T, next: BookStatus, today: string): T {
  switch (next) {
    case 'want':
      return sanitizeForStatus({ ...book, status: next });
    case 'reading':
      return { ...book, status: next, started_at: book.started_at ?? today, finished_at: null };
    case 'done':
      return {
        ...book,
        status: next,
        finished_at: book.finished_at ?? today,
        current_page: book.total_pages ?? book.current_page,
      };
  }
}

/** Whole-number percent read, or `null` when the book's length is unknown. */
export function progressPercent(currentPage: number, totalPages: number | null): number | null {
  if (!totalPages) return null;
  return Math.min(100, Math.round((currentPage / totalPages) * 100));
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
 * One shelf per year, newest year on top. Inside a shelf the books stand in
 * the order they were finished, left to right, like books slotted in as
 * they're read.
 */
export function groupFinishedByYear<T extends { finished_at: string | null }>(books: readonly T[]): ShelfRow<T>[] {
  const dated = books
    .filter((book): book is T & { finished_at: string } => book.finished_at !== null)
    .toSorted((a, b) => a.finished_at.localeCompare(b.finished_at));
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

/** Page counts outside this range draw the same as its ends. */
const SPINE_MIN_PAGES = 120;
const SPINE_MAX_PAGES = 640;
/** Drawn for a book whose length was never entered. */
const SPINE_DEFAULT_PAGES = 320;

const SPINE_MIN_HEIGHT_REM = 8.5;
const SPINE_MAX_HEIGHT_REM = 12;
const SPINE_MIN_WIDTH_REM = 1.75;
const SPINE_MAX_WIDTH_REM = 3;

/** Number of `--spine-N` color pairs defined in tokens.css. */
export const SPINE_TONE_COUNT = 6;

export interface SpineStyle {
  heightRem: number;
  widthRem: number;
  /** 0-based index into the `--spine-N` tokens. */
  tone: number;
}

function lerp(from: number, to: number, ratio: number): number {
  return Math.round((from + (to - from) * ratio) * 100) / 100;
}

function hashTitle(title: string): number {
  let hash = 0;
  for (const char of title) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return hash;
}

/**
 * A finished book's spine on the shelf: longer books stand taller and
 * thicker, and the color comes from the title so a book keeps the same
 * spine every time the page renders. Passing the left neighbor's tone
 * shifts a clashing color one step, so two alike spines never touch.
 */
export function spineStyle(book: { title: string; total_pages: number | null }, previousTone?: number): SpineStyle {
  const pages = Math.min(SPINE_MAX_PAGES, Math.max(SPINE_MIN_PAGES, book.total_pages ?? SPINE_DEFAULT_PAGES));
  const ratio = (pages - SPINE_MIN_PAGES) / (SPINE_MAX_PAGES - SPINE_MIN_PAGES);
  const ownTone = hashTitle(book.title) % SPINE_TONE_COUNT;

  return {
    heightRem: lerp(SPINE_MIN_HEIGHT_REM, SPINE_MAX_HEIGHT_REM, ratio),
    widthRem: lerp(SPINE_MIN_WIDTH_REM, SPINE_MAX_WIDTH_REM, ratio),
    tone: ownTone === previousTone ? (ownTone + 1) % SPINE_TONE_COUNT : ownTone,
  };
}

/** Spine styles for one shelf row, left to right, each aware of its neighbor. */
export function shelfSpineStyles(books: readonly { title: string; total_pages: number | null }[]): SpineStyle[] {
  return books.reduce<SpineStyle[]>((styles, book) => [...styles, spineStyle(book, styles.at(-1)?.tone)], []);
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
