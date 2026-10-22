import { sortByFinishedDate, todayInSeoul, type BookStatus } from '~/lib/book-shelf';

interface SummaryPost {
  created_at: string;
}

interface SummaryBook {
  status: BookStatus;
  finished_at: string | null;
}

export interface FeaturedBook<T> {
  book: T;
  /** `false` when nothing is being read and this is the last book finished. */
  isReading: boolean;
}

export interface AboutSummary<T> {
  postCount: number;
  finishedBookCount: number;
  /** Year of the oldest post in Seoul — `null` before the first one. */
  sinceYear: number | null;
  featuredBook: FeaturedBook<T> | null;
}

/** The numbers under the About hero and the book shown in its "읽는다" step. */
export function summarizeAbout<T extends SummaryBook>(
  posts: readonly SummaryPost[],
  books: readonly T[],
): AboutSummary<T> {
  const finished = sortByFinishedDate(books.filter((book) => book.status === 'done'));
  const reading = books.find((book) => book.status === 'reading');
  const oldest = posts.reduce<string | null>(
    (min, post) => (min === null || post.created_at < min ? post.created_at : min),
    null,
  );

  let featuredBook: FeaturedBook<T> | null = null;
  if (reading) featuredBook = { book: reading, isReading: true };
  else if (finished[0]) featuredBook = { book: finished[0], isReading: false };

  return {
    postCount: posts.length,
    finishedBookCount: finished.length,
    sinceYear: oldest === null ? null : Number(todayInSeoul(new Date(oldest)).slice(0, 4)),
    featuredBook,
  };
}
