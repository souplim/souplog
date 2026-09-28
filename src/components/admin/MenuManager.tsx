'use client';

import { useActionState } from 'react';
import { createMenuAction } from '~/lib/actions/menus';
import type { Menu } from '~/lib/supabase/types';
import { MenuRow } from './MenuRow';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Alert, AlertDescription } from '~/components/ui/alert';

interface MenuManagerProps {
  menus: Menu[];
}

export function MenuManager({ menus }: MenuManagerProps) {
  const [state, formAction, pending] = useActionState(createMenuAction, undefined);

  return (
    <div className="space-y-6">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <Input name="name" placeholder="메뉴 이름" required maxLength={50} className="w-40" />
        <Input name="slug" placeholder="슬러그 (선택)" maxLength={50} className="w-40" />
        <Button type="submit" disabled={pending}>
          {pending ? '추가 중…' : '메뉴 추가'}
        </Button>
        {state?.error && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </form>

      <div className="divide-y divide-border rounded-lg border border-border">
        {menus.map((menu, index) => (
          <MenuRow key={menu.id} menu={menu} isFirst={index === 0} isLast={index === menus.length - 1} />
        ))}
      </div>
    </div>
  );
}
