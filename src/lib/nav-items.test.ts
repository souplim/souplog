import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NAV_ITEMS,
  DEFAULT_PAGE_HEADINGS,
  hasPageHeading,
  isNavItemKey,
  resolveNavItems,
  resolvePageHeading,
  type StoredNavItem,
} from './nav-items';

function row(overrides: Partial<StoredNavItem> & Pick<StoredNavItem, 'key' | 'label' | 'sort_order'>): StoredNavItem {
  return { is_visible: true, title: '', description: '', ...overrides };
}

describe('resolveNavItems', () => {
  it('falls back to the defaults when nothing is stored', () => {
    expect(resolveNavItems([])).toEqual(DEFAULT_NAV_ITEMS);
  });

  it('orders stored items by sort_order and keeps their labels and visibility', () => {
    const result = resolveNavItems([
      row({ key: 'books', label: '서재', sort_order: 0 }),
      row({ key: 'about', label: '소개', sort_order: 2, is_visible: false }),
      row({ key: 'posts', label: '글', sort_order: 1 }),
    ]);

    expect(result).toEqual([
      { key: 'books', label: '서재', isVisible: true, title: '', description: '' },
      { key: 'posts', label: '글', isVisible: true, title: '', description: '' },
      { key: 'about', label: '소개', isVisible: false, title: '', description: '' },
      { key: 'stats', label: 'Dashboard', isVisible: true, title: '', description: '' },
    ]);
  });

  it('appends keys that have no stored row with their defaults', () => {
    const result = resolveNavItems([row({ key: 'books', label: '서재', sort_order: 0 })]);

    expect(result.map((item) => item.key)).toEqual(['books', 'about', 'posts', 'stats']);
    expect(result[1]).toEqual({ key: 'about', label: 'About', isVisible: true, title: '', description: '' });
  });

  it('drops unknown keys and duplicate rows', () => {
    const result = resolveNavItems([
      row({ key: 'guestbook', label: '방명록', sort_order: 0 }),
      row({ key: 'about', label: '소개', sort_order: 1 }),
      row({ key: 'about', label: '중복', sort_order: 2 }),
    ]);

    expect(result.map((item) => item.key)).toEqual(['about', 'posts', 'books', 'stats']);
    expect(result[0].label).toBe('소개');
  });

  it('uses the default label when the stored one is blank', () => {
    const [about] = resolveNavItems([row({ key: 'about', label: '  ', sort_order: 0 })]);
    expect(about.label).toBe('About');
  });
});

describe('resolveNavItems page headings', () => {
  it('keeps the stored title and description, trimmed', () => {
    const [books] = resolveNavItems([
      row({ key: 'books', label: '책장', sort_order: 0, title: ' 올해의 책 ', description: ' 읽은 책 모음 ' }),
    ]);
    expect(books).toMatchObject({ title: '올해의 책', description: '읽은 책 모음' });
  });
});

describe('resolvePageHeading', () => {
  it('uses what the owner wrote', () => {
    const navItems = resolveNavItems([
      row({ key: 'stats', label: 'Dashboard', sort_order: 0, title: '숫자로 본 삶', description: '통계 모음' }),
    ]);
    expect(resolvePageHeading(navItems, 'stats')).toEqual({ title: '숫자로 본 삶', description: '통계 모음' });
  });

  it('falls back to the default for each part left blank', () => {
    const navItems = resolveNavItems([row({ key: 'books', label: '책장', sort_order: 0, title: '올해의 책' })]);
    expect(resolvePageHeading(navItems, 'books')).toEqual({
      title: '올해의 책',
      description: DEFAULT_PAGE_HEADINGS.books.description,
    });
  });

  it('falls back to the defaults when the nav could not be read', () => {
    expect(resolvePageHeading(DEFAULT_NAV_ITEMS, 'stats')).toEqual(DEFAULT_PAGE_HEADINGS.stats);
  });
});

describe('hasPageHeading', () => {
  it('is true only for pages with a headline of their own', () => {
    expect(hasPageHeading('books')).toBe(true);
    expect(hasPageHeading('stats')).toBe(true);
    expect(hasPageHeading('about')).toBe(false);
    expect(hasPageHeading('posts')).toBe(false);
  });
});

describe('isNavItemKey', () => {
  it('accepts only the fixed keys', () => {
    expect(isNavItemKey('about')).toBe(true);
    expect(isNavItemKey('posts')).toBe(true);
    expect(isNavItemKey('books')).toBe(true);
    expect(isNavItemKey('stats')).toBe(true);
    expect(isNavItemKey('admin')).toBe(false);
    expect(isNavItemKey(undefined)).toBe(false);
  });
});
