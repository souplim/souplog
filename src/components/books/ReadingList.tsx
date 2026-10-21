import Link from 'next/link';
import { daysSince } from '~/lib/book-shelf';
import type { Book } from '~/lib/supabase/types';
import { BookCover } from './BookCover';

interface ReadingListProps {
  books: Book[];
  today: string;
}

/** Books in progress, each with how long it's been open — the shelf's "right now". */
export function ReadingList({ books, today }: ReadingListProps) {
  return (
    <ul className="grid gap-x-[var(--space-lg)] gap-y-[var(--space-md)] sm:grid-cols-2">
      {books.map((book) => (
        <li key={book.id}>
          <Link
            href={`/books/${book.id}`}
            className="group flex gap-4 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <BookCover
              title={book.title}
              cover={book.cover}
              sizes="80px"
              className="w-20 shrink-0 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:-translate-y-1"
              isPriority
            />
            <div className="flex min-w-0 flex-1 flex-col py-1">
              <p className="line-clamp-2 font-heading text-[length:var(--text-base)] leading-[var(--leading-tight)] font-semibold transition-colors duration-[var(--duration-fast)] group-hover:text-accent-foreground">
                {book.title}
              </p>
              {book.author && <p className="mt-1 truncate text-xs text-muted-foreground">{book.author}</p>}
              {book.started_at && (
                <p className="mt-auto pt-3 text-xs tabular-nums text-muted-foreground">
                  {daysSince(book.started_at, today)}일째
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
