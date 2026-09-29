'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import { buttonVariants } from '~/components/ui/button';
import type { Menu } from '~/lib/supabase/types';

interface MenuNavProps {
  menus: Menu[];
}

export function MenuNav({ menus }: MenuNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="메인 내비게이션" className="min-w-0 flex-1">
      <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto">
        {menus.map((menu) => {
          const isActive = pathname === `/menu/${menu.slug}`;
          return (
            <li key={menu.id} className="shrink-0">
              <Link
                href={`/menu/${menu.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  isActive && 'bg-muted font-semibold text-foreground',
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
