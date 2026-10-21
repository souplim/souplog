/** Long enough for any real phrase; anything past it is noise, not intent. */
export const SEARCH_QUERY_MAX_LENGTH = 100;

/**
 * Turns the raw `?q=` param into the string the search actually runs on.
 * An empty result means "no search" — the page shows the prompt instead of
 * querying for every post.
 *
 * LIKE wildcards (`%`, `_`) are kept as typed: `search_posts` escapes them,
 * so a query for "100%" matches the literal text.
 */
export function normalizeSearchQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, SEARCH_QUERY_MAX_LENGTH);
}
