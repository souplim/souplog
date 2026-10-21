'use client';

import Form from 'next/form';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { normalizeSearchQuery, SEARCH_QUERY_MAX_LENGTH } from '~/lib/search';

/**
 * Sits above a post list and searches *that* list: it submits to the current
 * route (`action=""`), so the home feed searches every post and a menu page
 * searches within its menu, and the results replace the list underneath while
 * the field stays where it is.
 *
 * Reads the query from the URL rather than a prop so the route's
 * `loading.tsx` can render the same field — otherwise it would vanish for the
 * length of every search.
 */
export function SearchForm() {
  const pathname = usePathname();
  const router = useRouter();
  const query = normalizeSearchQuery(useSearchParams().get('q') ?? undefined);

  return (
    <Form
      action=""
      role="search"
      className="relative mb-8"
      onSubmit={(event) => {
        const value = new FormData(event.currentTarget).get('q');
        // An empty submit means "back to the full list", not `?q=`.
        if (typeof value !== 'string' || value.trim() === '') {
          event.preventDefault();
          router.push(pathname);
        }
      }}
    >
      <label htmlFor="search-query" className="sr-only">
        제목이나 본문으로 검색
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      {/* Keyed on the query so back/forward resets the field to the URL's
          value instead of keeping whatever was typed last. */}
      <input
        key={query}
        id="search-query"
        type="search"
        name="q"
        defaultValue={query}
        placeholder="제목이나 본문으로 검색"
        maxLength={SEARCH_QUERY_MAX_LENGTH}
        autoComplete="off"
        enterKeyHint="search"
        className="h-12 w-full min-w-0 rounded-lg border border-input bg-card pr-11 pl-10 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <Link
          href={pathname}
          aria-label="검색 지우기"
          className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-4" />
        </Link>
      ) : null}
    </Form>
  );
}
