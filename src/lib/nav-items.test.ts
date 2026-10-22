import { describe, expect, it } from 'vitest';
import { DEFAULT_NAV_ITEMS, isNavItemKey, resolveNavItems } from './nav-items';

describe('resolveNavItems', () => {
  it('falls back to the defaults when nothing is stored', () => {
    expect(resolveNavItems([])).toEqual(DEFAULT_NAV_ITEMS);
  });

  it('orders stored items by sort_order and keeps their labels and visibility', () => {
    const result = resolveNavItems([
      { key: 'books', label: '서재', sort_order: 0, is_visible: true },
      { key: 'about', label: '소개', sort_order: 2, is_visible: false },
      { key: 'posts', label: '글', sort_order: 1, is_visible: true },
    ]);

    expect(result).toEqual([
      { key: 'books', label: '서재', isVisible: true },
      { key: 'posts', label: '글', isVisible: true },
      { key: 'about', label: '소개', isVisible: false },
      { key: 'stats', label: 'Dashboard', isVisible: true },
    ]);
  });

  it('appends keys that have no stored row with their defaults', () => {
    const result = resolveNavItems([{ key: 'books', label: '서재', sort_order: 0, is_visible: true }]);

    expect(result.map((item) => item.key)).toEqual(['books', 'about', 'posts', 'stats']);
    expect(result[1]).toEqual({ key: 'about', label: 'About', isVisible: true });
  });

  it('drops unknown keys and duplicate rows', () => {
    const result = resolveNavItems([
      { key: 'guestbook', label: '방명록', sort_order: 0, is_visible: true },
      { key: 'about', label: '소개', sort_order: 1, is_visible: true },
      { key: 'about', label: '중복', sort_order: 2, is_visible: true },
    ]);

    expect(result.map((item) => item.key)).toEqual(['about', 'posts', 'books', 'stats']);
    expect(result[0].label).toBe('소개');
  });

  it('uses the default label when the stored one is blank', () => {
    const [about] = resolveNavItems([{ key: 'about', label: '  ', sort_order: 0, is_visible: true }]);
    expect(about.label).toBe('About');
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
