export interface AdminLink {
  href: string;
  label: string;
}

// The owner-only entries in the header's profile dropdown.
export const ADMIN_LINKS: readonly AdminLink[] = [
  { href: '/admin/posts/new', label: '새 글 작성' },
  { href: '/admin/books/new', label: '책 추가' },
  { href: '/admin/menus', label: '메뉴 관리' },
  { href: '/admin/about', label: 'About 수정' },
];
