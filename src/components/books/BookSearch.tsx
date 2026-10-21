'use client';

import { useState, useTransition, type KeyboardEvent } from 'react';
import { BookImage, Search } from 'lucide-react';
import { searchBooksAction, type BookSearchState } from '~/lib/actions/books';
import type { BookSearchResult } from '~/lib/book-search';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

interface BookSearchProps {
  onPick: (result: BookSearchResult) => void;
  autoFocus?: boolean;
}

/**
 * Looks a book up on Kakao and hands the picked one to the form. Lives inside
 * the book form, so it can't be a <form> of its own — Enter is caught here
 * instead, which also keeps it from submitting the book form.
 */
export function BookSearch({ onPick, autoFocus = false }: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<BookSearchState | null>(null);
  const [pending, startTransition] = useTransition();

  function search() {
    startTransition(async () => setState(await searchBooksAction(query)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    search();
  }

  function pick(result: BookSearchResult) {
    onPick(result);
    setState(null);
  }

  return (
    <section aria-label="책 검색" className="rounded-md bg-muted/60 p-4 sm:p-5">
      <div className="flex gap-2">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="제목, 저자, ISBN으로 찾아 채우기"
          aria-label="검색어"
          maxLength={100}
          autoFocus={autoFocus}
          className="bg-background"
        />
        <Button type="button" variant="outline" onClick={search} disabled={pending} className="shrink-0 bg-background">
          <Search />
          {pending ? '찾는 중…' : '검색'}
        </Button>
      </div>

      {state && 'error' in state && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {state && 'results' in state && (
        <div className="mt-3" aria-live="polite">
          {state.results.length === 0 ? (
            <p className="text-sm text-muted-foreground">찾는 책이 없어요. 다른 검색어로 찾거나 직접 입력해도 돼요.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto rounded-sm bg-background ring-1 ring-border">
              {state.results.map((result, index) => (
                <li key={`${result.isbn ?? result.title}-${index}`}>
                  <SearchResultButton result={result} onPick={pick} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

interface SearchResultButtonProps {
  result: BookSearchResult;
  onPick: (result: BookSearchResult) => void;
}

function SearchResultButton({ result, onPick }: SearchResultButtonProps) {
  const meta = [result.author, result.publisher, result.year].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={() => onPick(result)}
      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left outline-none transition-colors duration-[var(--duration-fast)] hover:bg-accent focus-visible:bg-accent"
    >
      <span className="flex aspect-[2/3] w-9 shrink-0 items-center justify-center overflow-hidden rounded-xs bg-muted ring-1 ring-border">
        {result.thumbnailUrl ? (
          // A remote thumbnail shown only in this list — not worth routing through the image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.thumbnailUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <BookImage className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{result.title}</span>
        {meta && <span className="block truncate text-xs text-muted-foreground">{meta}</span>}
      </span>
    </button>
  );
}
