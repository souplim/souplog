'use client';

import { useActionState, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, X } from 'lucide-react';
import { deleteMenuAction, moveMenuAction, updateMenuAction } from '~/lib/actions/menus';
import type { Menu } from '~/lib/supabase/types';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

interface MenuRowProps {
  menu: Menu;
  isFirst: boolean;
  isLast: boolean;
}

export function MenuRow({ menu, isFirst, isLast }: MenuRowProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateMenuAction.bind(null, menu.id), undefined);

  return (
    <div className="flex items-center gap-3 p-3">
      <div className="flex flex-col gap-0.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isFirst}
          onClick={() => moveMenuAction(menu.id, 'up')}
          aria-label={`${menu.name} 위로 이동`}
        >
          <ChevronUp />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isLast}
          onClick={() => moveMenuAction(menu.id, 'down')}
          aria-label={`${menu.name} 아래로 이동`}
        >
          <ChevronDown />
        </Button>
      </div>

      {editing ? (
        <form
          action={async (formData) => {
            await formAction(formData);
            setEditing(false);
          }}
          className="flex flex-1 flex-wrap items-center gap-2"
        >
          <Input name="name" defaultValue={menu.name} required maxLength={50} className="w-40" />
          <Input name="slug" defaultValue={menu.slug} maxLength={50} className="w-40" />
          <Button type="submit" size="sm" disabled={pending}>
            저장
          </Button>
          {state?.error && <span className="text-sm text-destructive">{state.error}</span>}
        </form>
      ) : (
        <div className="flex-1">
          <span className="font-medium">{menu.name}</span>
          <span className="ml-2 text-sm text-muted-foreground">/{menu.slug}</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setEditing((value) => !value)}
          aria-label={editing ? '취소' : '수정'}
        >
          {editing ? <X /> : <Pencil />}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label="삭제"
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>&ldquo;{menu.name}&rdquo; 메뉴를 삭제할까요?</AlertDialogTitle>
              <AlertDialogDescription>이 메뉴의 글은 미분류로 남습니다.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <form action={deleteMenuAction.bind(null, menu.id)}>
                <AlertDialogAction type="submit" variant="destructive" className="w-full">
                  삭제
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
