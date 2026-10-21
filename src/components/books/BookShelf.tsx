import type { CSSProperties } from 'react';
import Link from 'next/link';
import { groupFinishedByYear, shelfSpineStyles, type SpineStyle } from '~/lib/book-shelf';
import type { Book } from '~/lib/supabase/types';

/**
 * Every slot on the shelf is this tall: the tallest spine, room for it to
 * lift on hover, and the plank under it. Wrapped rows stack exactly one slot
 * apart, so the repeating plank background lands under each row.
 */
const SHELF_ROW = '13.5rem';
const PLANK = '6px';

const SHELF_STYLE: CSSProperties = {
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 calc(${SHELF_ROW} - ${PLANK}), var(--shelf-plank) calc(${SHELF_ROW} - ${PLANK}) ${SHELF_ROW})`,
};

const SLOT_STYLE: CSSProperties = { height: SHELF_ROW, paddingBottom: PLANK };

interface BookShelfProps {
  books: Book[];
}

/** Finished books standing as spines, one shelf per year. */
export function BookShelf({ books }: BookShelfProps) {
  const rows = groupFinishedByYear(books);

  return (
    <div className="space-y-[var(--space-lg)]">
      {rows.map((row) => (
        <section key={row.year ?? 'undated'} aria-labelledby={`shelf-${row.year ?? 'undated'}`}>
          <h3
            id={`shelf-${row.year ?? 'undated'}`}
            className="mb-1 flex items-baseline gap-2 text-sm font-semibold tabular-nums"
          >
            {row.year ?? '날짜 미기록'}
            <span className="text-xs font-normal text-muted-foreground">{row.books.length}권</span>
          </h3>
          <ul className="flex flex-wrap gap-x-[3px]" style={SHELF_STYLE}>
            {shelfSpineStyles(row.books).map((spine, index) => {
              const book = row.books[index]!;
              return (
                <li key={book.id} className="flex items-end" style={SLOT_STYLE}>
                  <BookSpine book={book} spine={spine} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

interface BookSpineProps {
  book: Book;
  spine: SpineStyle;
}

function BookSpine({ book, spine }: BookSpineProps) {
  const { heightRem, widthRem, tone } = spine;
  const label = book.author ? `${book.title} · ${book.author}` : book.title;

  return (
    <Link
      href={`/books/${book.id}`}
      aria-label={label}
      title={label}
      className="flex justify-center overflow-hidden rounded-t-[3px] rounded-b-[1px] py-2.5 shadow-[inset_2px_0_0_oklch(100%_0_0/0.14),inset_-3px_0_0_oklch(0%_0_0/0.14)] ring-1 ring-black/5 outline-none transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        height: `${heightRem}rem`,
        width: `${widthRem}rem`,
        backgroundColor: `var(--spine-${tone})`,
        color: `var(--spine-${tone}-fg)`,
      }}
    >
      <span
        aria-hidden="true"
        className="max-h-full overflow-hidden text-xs leading-none font-semibold tracking-[0.02em] text-ellipsis whitespace-nowrap [writing-mode:vertical-rl]"
      >
        {book.title}
      </span>
    </Link>
  );
}
