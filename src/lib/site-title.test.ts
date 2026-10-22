import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE_TITLE, resolveSiteTitle } from './site-title';

describe('resolveSiteTitle', () => {
  it('uses the stored title, trimmed', () => {
    expect(resolveSiteTitle('  수프로그  ')).toBe('수프로그');
  });

  it('falls back to the default when nothing is stored', () => {
    expect(resolveSiteTitle(null)).toBe(DEFAULT_SITE_TITLE);
    expect(resolveSiteTitle(undefined)).toBe(DEFAULT_SITE_TITLE);
  });

  it('falls back to the default when the stored title is blank', () => {
    expect(resolveSiteTitle('   ')).toBe(DEFAULT_SITE_TITLE);
  });
});
