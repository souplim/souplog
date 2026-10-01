'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import type { Menu } from '~/lib/supabase/types';

interface MenuNavProps {
  menus: Menu[];
}

export function MenuNav({ menus }: MenuNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="메인 내비게이션" className="min-w-0 flex-1">
      <ul className="no-scrollbar flex items-center gap-5 overflow-x-auto">
        {menus.map((menu) => {
          const isActive = pathname === `/menu/${menu.slug}`;
          return (
            <li key={menu.id} className="shrink-0">
              <Link
                href={`/menu/${menu.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center rounded-xs text-sm whitespace-nowrap text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
                  isActive && 'font-semibold text-foreground',
                )}
              >
                {menu.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
