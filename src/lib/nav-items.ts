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
  /** The page's headline as the owner wrote it — empty means the default. See `resolvePageHeading`. */
  title: string;
  description: string;
}

/** The nav as it looked before it was editable — also the fallback when the table is empty or unreachable. */
export const DEFAULT_NAV_ITEMS: readonly NavItem[] = [
  { key: 'about', label: 'About', isVisible: true, title: '', description: '' },
  { key: 'posts', label: '게시글', isVisible: true, title: '', description: '' },
  { key: 'books', label: '책장', isVisible: true, title: '', description: '' },
  { key: 'stats', label: 'Dashboard', isVisible: true, title: '', description: '' },
];

/**
 * Pages with a headline and intro of their own under the label. About and the
 * feed have none — the label (or the hero) names them — so only these two
 * offer a title and description to edit.
 */
export const PAGE_HEADING_KEYS = ['books', 'stats'] as const satisfies readonly NavItemKey[];

export type PageHeadingKey = (typeof PAGE_HEADING_KEYS)[number];

export const MAX_PAGE_TITLE_LENGTH = 40;
export const MAX_PAGE_DESCRIPTION_LENGTH = 300;

export interface PageHeading {
  title: string;
  description: string;
}

export const DEFAULT_PAGE_HEADINGS: Readonly<Record<PageHeadingKey, PageHeading>> = {
  books: {
    title: '한 해의 책장',
    description: '읽고 싶은 책, 읽는 중인 책, 다 읽은 책을 한 해씩 꽂아 둡니다.',
  },
  stats: {
    title: '여성의 일과 삶',
    description:
      '경력단절부터 노후 빈곤까지, 국가승인통계로 여성의 일과 삶이 어떻게 달라져 왔는지 봅니다.\n' +
      'KOSIS 국가통계포털자료를 하루에 한 번 새로 받아옵니다.',
  },
};

export function hasPageHeading(key: NavItemKey): key is PageHeadingKey {
  return (PAGE_HEADING_KEYS as readonly string[]).includes(key);
}

/** The headline a page shows: what the owner wrote, or the default for whichever part is left blank. */
export function resolvePageHeading(navItems: readonly NavItem[], key: PageHeadingKey): PageHeading {
  const item = navItems.find((navItem) => navItem.key === key);
  const fallback = DEFAULT_PAGE_HEADINGS[key];
  return {
    title: item?.title || fallback.title,
    description: item?.description || fallback.description,
  };
}

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
  title: string;
  description: string;
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
      return [
        {
          key: row.key,
          label,
          isVisible: row.is_visible,
          title: row.title.trim(),
          description: row.description.trim(),
        },
      ];
    });

  const missing = DEFAULT_NAV_ITEMS.filter((item) => !seen.has(item.key));
  return [...stored, ...missing];
}
