/**
 * The header's top-level entries. Each one points at a fixed page (or, for
 * `posts`, the category dropdown), so the set of keys is closed — the owner
 * can rename, reorder, and hide them, but never add or delete one.
 */
export const NAV_ITEM_KEYS = ['about', 'posts', 'books', 'stats'] as const;

export type NavItemKey = (typeof NAV_ITEM_KEYS)[number];

export interface NavItem {
  key: NavItemKey;
  label: string;
  isVisible: boolean;
}

/** The nav as it looked before it was editable — also the fallback when the table is empty or unreachable. */
export const DEFAULT_NAV_ITEMS: readonly NavItem[] = [
  { key: 'about', label: 'About', isVisible: true },
  { key: 'posts', label: '게시글', isVisible: true },
  { key: 'books', label: '책장', isVisible: true },
  { key: 'stats', label: 'Dashboard', isVisible: true },
];

/** Where each entry leads, shown next to it on the admin screen. */
export const NAV_ITEM_DESTINATIONS: Readonly<Record<NavItemKey, string>> = {
  about: '/about',
  posts: '게시글 메뉴 드롭다운',
  books: '/books',
  stats: '/stats',
};

export function isNavItemKey(value: unknown): value is NavItemKey {
  return typeof value === 'string' && (NAV_ITEM_KEYS as readonly string[]).includes(value);
}

export interface StoredNavItem {
  key: string;
  label: string;
  sort_order: number;
  is_visible: boolean;
}

/**
 * Turns stored rows into the full, ordered nav. Unknown keys are dropped and
 * any key without a row is appended with its default, so the nav always has
 * exactly one entry per key no matter what state the table is in.
 */
export function resolveNavItems(rows: readonly StoredNavItem[]): NavItem[] {
  const defaultsByKey = new Map(DEFAULT_NAV_ITEMS.map((item) => [item.key, item]));
  const seen = new Set<NavItemKey>();

  const stored = [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((row): NavItem[] => {
      if (!isNavItemKey(row.key) || seen.has(row.key)) return [];
      seen.add(row.key);
      const label = row.label.trim() || (defaultsByKey.get(row.key)?.label ?? row.key);
      return [{ key: row.key, label, isVisible: row.is_visible }];
    });

  const missing = DEFAULT_NAV_ITEMS.filter((item) => !seen.has(item.key));
  return [...stored, ...missing];
}
