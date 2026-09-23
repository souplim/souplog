import type { Metadata } from 'next';
import { getMenus } from '~/lib/menus';
import { MenuManager } from '~/components/admin/MenuManager';
import styles from '../page.module.css';

export const metadata: Metadata = { title: '메뉴 관리' };

export default async function AdminMenusPage() {
  const menus = await getMenus();

  return (
    <div>
      <h1 className={styles.heading}>메뉴 관리</h1>
      <MenuManager menus={menus} />
    </div>
  );
}
