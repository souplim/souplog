import type { Metadata } from 'next';
import { getMenus } from '~/lib/menus';
import { MenuManager } from '~/components/admin/MenuManager';

export const metadata: Metadata = { title: '메뉴 관리' };

export default async function AdminMenusPage() {
  const menus = await getMenus();

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-lg)] sm:px-6">
      <h1 className="mb-6 font-heading text-3xl">메뉴 관리</h1>
      <MenuManager menus={menus} />
    </div>
  );
}
