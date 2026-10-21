import { describe, expect, it } from 'vitest';
import { normalizeSearchQuery, SEARCH_QUERY_MAX_LENGTH } from './search';

describe('normalizeSearchQuery', () => {
  it('trims and collapses inner whitespace', () => {
    expect(normalizeSearchQuery('  오늘의   기록 ')).toBe('오늘의 기록');
  });

  it('returns an empty string when the param is missing', () => {
    expect(normalizeSearchQuery(undefined)).toBe('');
  });

  it('returns an empty string for whitespace only', () => {
    expect(normalizeSearchQuery(' \t\n ')).toBe('');
  });

  it('uses the first value when the param is repeated', () => {
    expect(normalizeSearchQuery(['first', 'second'])).toBe('first');
  });

  it('cuts overly long queries to the max length', () => {
    const result = normalizeSearchQuery('가'.repeat(SEARCH_QUERY_MAX_LENGTH + 20));
    expect(result).toHaveLength(SEARCH_QUERY_MAX_LENGTH);
  });

  it('leaves LIKE wildcards alone — escaping is the database function’s job', () => {
    expect(normalizeSearchQuery('100%_done')).toBe('100%_done');
  });
});
