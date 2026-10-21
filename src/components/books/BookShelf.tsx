import Link from 'next/link';
import { groupFinishedByYear } from '~/lib/book-shelf';
import type { Book } from '~/lib/supabase/types';
import { BookCover } from './BookCover';

interface BookShelfProps {
  books: Book[];
}

/**
 * Finished books standing face-out, one shelf per year. Each shelf is a
 * single row that scrolls sideways, so a busy year never pushes the rest of
 * the page down — the page grows by one row per year, not per book.
 */
export function BookShelf({ books }: BookShelfProps) {
  const rows = groupFinishedByYear(books);

  return (
    <div className="space-y-[var(--space-lg)]">
      {rows.map((row) => {
        const headingId = `shelf-${row.year ?? 'undated'}`;
        return (
          <section key={headingId} aria-labelledby={headingId}>
            <h3 id={headingId} className="mb-1 flex items-baseline gap-2 text-sm font-semibold tabular-nums">
              {row.year ?? '날짜 미기록'}
              <span className="text-xs font-normal text-muted-foreground">{row.books.length}권</span>
            </h3>
            {/* Bleeds into the page gutter so covers slide out past the edge instead of stopping short of it. */}
            <ul className="shelf-row -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-3 pb-4 sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6">
              {row.books.map((book) => (
                <li key={book.id} className="shrink-0 snap-start">
                  <ShelfCover book={book} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

interface ShelfCoverProps {
  book: Book;
}

function ShelfCover({ book }: ShelfCoverProps) {
  const label = book.author ? `${book.title} · ${book.author}` : book.title;

  return (
    <Link href={`/books/${book.id}`} aria-label={label} title={label} className="group block outline-none">
      <BookCover
        title={book.title}
        cover={book.cover}
        sizes="(min-width: 40rem) 112px, 88px"
        className="w-[5.5rem] transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-focus-visible:-translate-y-2 group-focus-visible:ring-2 group-focus-visible:ring-ring sm:w-28"
      />
    </Link>
  );
}
