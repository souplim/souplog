import Link from 'next/link';
import type { ReactNode } from 'react';
import { requireUser } from '~/lib/auth';
import { Button } from '~/components/ui/button';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <nav
        className="no-scrollbar mb-8 flex gap-1 overflow-x-auto border-b border-border pb-2"
        aria-label="관리자 내비게이션"
      >
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">글 관리</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/posts/new">새 글 작성</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/menus">메뉴 관리</Link>
        </Button>
      </nav>
      {children}
    </div>
  );
}
