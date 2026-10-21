import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Book } from '~/lib/supabase/types';
import { BookCover } from './BookCover';

interface BookShelfProps {
  books: Book[];
  /** An extra line under the author, e.g. how long a book has been open. */
  renderNote?: (book: Book) => ReactNode;
  isPriority?: boolean;
}

/**
 * Books standing face-out on a single shelf that scrolls sideways, so a busy
 * section never pushes the rest of the page down.
 */
export function BookShelf({ books, renderNote, isPriority = false }: BookShelfProps) {
  return (
    // Bleeds into the page gutter so covers slide out past the edge instead of stopping short of it.
    <ul className="shelf-row -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-3 pb-4 sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6">
      {books.map((book) => (
        <li key={book.id} className="w-[5.5rem] shrink-0 snap-start sm:w-28">
          <ShelfBook book={book} note={renderNote?.(book)} isPriority={isPriority} />
        </li>
      ))}
    </ul>
  );
}

interface ShelfBookProps {
  book: Book;
  note: ReactNode;
  isPriority: boolean;
}

function ShelfBook({ book, note, isPriority }: ShelfBookProps) {
  return (
    <Link href={`/books/${book.id}`} className="group block outline-none">
      <BookCover
        title={book.title}
        cover={book.cover}
        sizes="(min-width: 40rem) 112px, 88px"
        className="transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-focus-visible:-translate-y-2 group-focus-visible:ring-2 group-focus-visible:ring-ring"
        isPriority={isPriority}
      />
      <p className="mt-2 line-clamp-2 text-xs leading-[var(--leading-tight)] font-semibold break-keep transition-colors duration-[var(--duration-fast)] group-hover:text-accent-foreground">
        {book.title}
      </p>
      {book.author && <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">{book.author}</p>}
      {note && <p className="mt-0.5 text-[0.6875rem] tabular-nums text-muted-foreground">{note}</p>}
    </Link>
  );
}
