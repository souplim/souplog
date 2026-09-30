export interface AdminLink {
  href: string;
  label: string;
}

// Shared by the header's wide-screen button row and its narrow-screen dropdown
// so the two never drift apart.
export const ADMIN_LINKS: readonly AdminLink[] = [
  { href: '/admin/posts/new', label: '새 글 작성' },
  { href: '/admin/menus', label: '메뉴 관리' },
];
