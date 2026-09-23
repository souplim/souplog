import { describe, expect, it } from 'vitest';
import { ensureUniqueSlug, slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and hyphenates an English title', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('keeps Hangul syllables as-is', () => {
    expect(slugify('오늘의 기록')).toBe('오늘의-기록');
  });

  it('strips punctuation and collapses repeated separators', () => {
    expect(slugify('Wait... what?!  Really!!')).toBe('wait-what-really');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  -edge case-  ')).toBe('edge-case');
  });

  it('falls back to a generated slug when nothing survives normalization', () => {
    expect(slugify('!!!')).toMatch(/^post-[a-z0-9]+$/);
  });
});

describe('ensureUniqueSlug', () => {
  it('returns the base slug when there is no collision', async () => {
    const result = await ensureUniqueSlug('hello-world', async () => false);
    expect(result).toBe('hello-world');
  });

  it('appends an incrementing suffix until a free slug is found', async () => {
    const taken = new Set(['hello-world', 'hello-world-2', 'hello-world-3']);
    const result = await ensureUniqueSlug('hello-world', async (candidate) => taken.has(candidate));
    expect(result).toBe('hello-world-4');
  });
});
