'use client';

import { useActionState, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import { moveNavItemAction, renameNavItemAction, setNavItemVisibilityAction } from '~/lib/actions/menus';
import { NAV_ITEM_DESTINATIONS, type NavItem } from '~/lib/nav-items';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { VisibilitySwitch } from './VisibilitySwitch';

interface NavItemRowProps {
  item: NavItem;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * One top-level header entry. Unlike a post menu it has no slug and can't be
 * deleted — its page is fixed — so hiding it is the switch on the right.
 */
export function NavItemRow({ item, isFirst, isLast }: NavItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(renameNavItemAction.bind(null, item.key), undefined);

  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex flex-col gap-0.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isFirst}
          onClick={() => moveNavItemAction(item.key, 'up')}
          aria-label={`${item.label} 위로 이동`}
        >
          <ChevronUp />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isLast}
          onClick={() => moveNavItemAction(item.key, 'down')}
          aria-label={`${item.label} 아래로 이동`}
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
          <Input name="label" defaultValue={item.label} required maxLength={20} className="w-40" />
          <Button type="submit" size="sm" disabled={pending}>
            저장
          </Button>
          {state?.error && <span className="text-sm text-destructive">{state.error}</span>}
        </form>
      ) : (
        <div className="flex-1">
          <span className={item.isVisible ? 'font-medium' : 'font-medium text-muted-foreground line-through'}>
            {item.label}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">{NAV_ITEM_DESTINATIONS[item.key]}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <VisibilitySwitch
          id={`nav-item-visible-${item.key}`}
          checked={item.isVisible}
          onChange={(isVisible) => setNavItemVisibilityAction(item.key, isVisible)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setEditing((value) => !value)}
          aria-label={editing ? '취소' : `${item.label} 이름 수정`}
        >
          {editing ? <X /> : <Pencil />}
        </Button>
      </div>
    </div>
  );
}
