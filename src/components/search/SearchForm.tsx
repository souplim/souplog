'use client';

import Form from 'next/form';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { normalizeSearchQuery, SEARCH_QUERY_MAX_LENGTH } from '~/lib/search';
import { SEARCH_FIELD_ACTION_CLASS, SearchField } from './SearchField';

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
      className="mb-8"
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
      {/* Keyed on the query so back/forward resets the field to the URL's
          value instead of keeping whatever was typed last. */}
      <SearchField
        key={query}
        id="search-query"
        name="q"
        defaultValue={query}
        placeholder="제목이나 본문으로 검색"
        maxLength={SEARCH_QUERY_MAX_LENGTH}
        trailing={
          query ? (
            <Link href={pathname} aria-label="검색 지우기" className={SEARCH_FIELD_ACTION_CLASS}>
              <X className="size-4" />
            </Link>
          ) : null
        }
      />
    </Form>
  );
}
