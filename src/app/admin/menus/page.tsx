import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getMenus, getNavItems } from '~/lib/menus';
import { MenuManager } from '~/components/admin/MenuManager';
import { NavItemRow } from '~/components/admin/NavItemRow';

export const metadata: Metadata = { title: '메뉴 관리' };

export default async function AdminMenusPage() {
  const [navItems, menus] = await Promise.all([getNavItems(), getMenus()]);

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-lg)] sm:px-6">
      <h1 className="mb-[var(--space-lg)] font-heading text-3xl">메뉴 관리</h1>

      <div className="divide-y divide-border">
        <MenuSection
          id="nav-items-heading"
          title="상단 메뉴"
          description="헤더에 보이는 항목입니다. 연결된 페이지는 그대로 두고 이름·순서·표시 여부만 바꿉니다."
        >
          <div className="divide-y divide-border rounded-lg border border-border">
            {navItems.map((item, index) => (
              <NavItemRow key={item.key} item={item} isFirst={index === 0} isLast={index === navItems.length - 1} />
            ))}
          </div>
        </MenuSection>

        <MenuSection
          id="post-menus-heading"
          title="게시글 메뉴"
          description="게시글 드롭다운에 들어가는 글 분류입니다. 숨긴 메뉴도 글과 페이지는 그대로 남습니다."
        >
          <MenuManager menus={menus} />
        </MenuSection>
      </div>
    </div>
  );
}

interface MenuSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

// The two lists sit under one page title, so each gets its own heading and a
// rule between them — otherwise the second list reads as more rows of the first.
function MenuSection({ id, title, description, children }: MenuSectionProps) {
  return (
    <section aria-labelledby={id} className="py-[var(--space-lg)] first:pt-0 last:pb-0">
      <div className="mb-[var(--space-md)]">
        <h2 id={id} className="font-heading text-xl">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
