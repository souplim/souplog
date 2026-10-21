import Link from 'next/link';
import type { Book } from '~/lib/supabase/types';
import { BookCover } from './BookCover';

interface WishlistProps {
  books: Book[];
}

/** Books waiting to be read, as a tight grid of covers — newest addition first. */
export function Wishlist({ books }: WishlistProps) {
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-6 md:grid-cols-8">
      {books.map((book) => (
        <li key={book.id}>
          <Link
            href={`/books/${book.id}`}
            className="group block rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <BookCover
              title={book.title}
              cover={book.cover}
              sizes="(min-width: 48rem) 112px, (min-width: 40rem) 16vw, 33vw"
              className="transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:-translate-y-1"
            />
            <p className="mt-2 line-clamp-2 text-xs leading-[var(--leading-tight)] font-semibold break-keep transition-colors duration-[var(--duration-fast)] group-hover:text-accent-foreground">
              {book.title}
            </p>
            {book.author && <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">{book.author}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
