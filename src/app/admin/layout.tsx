import Link from 'next/link';
import type { ReactNode } from 'react';
import { requireUser } from '~/lib/auth';
import styles from './layout.module.css';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className={styles.page}>
      <nav className={styles.nav} aria-label="관리자 내비게이션">
        <Link href="/admin">글 관리</Link>
        <Link href="/admin/posts/new">새 글 작성</Link>
        <Link href="/admin/menus">메뉴 관리</Link>
      </nav>
      {children}
    </div>
  );
}
