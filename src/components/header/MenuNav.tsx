'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import type { Menu } from '~/lib/supabase/types';

interface MenuNavProps {
  menus: Menu[];
}

interface NavItem {
  key: string;
  href: string;
  label: string;
}

// Fixed pages sit ahead of the owner-managed menus, so they can't be renamed
// or deleted from the menu admin.
const FIXED_NAV_ITEMS: readonly NavItem[] = [{ key: 'about', href: '/about', label: 'About' }];

export function MenuNav({ menus }: MenuNavProps) {
  const pathname = usePathname();
  const items: NavItem[] = [
    ...FIXED_NAV_ITEMS,
    ...menus.map((menu) => ({ key: menu.id, href: `/menu/${menu.slug}`, label: menu.name })),
  ];

  return (
    <nav aria-label="메인 내비게이션" className="min-w-0 flex-1">
      <ul className="no-scrollbar flex items-center gap-5 overflow-x-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.key} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center rounded-xs text-sm whitespace-nowrap text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
                  isActive && 'font-semibold text-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
