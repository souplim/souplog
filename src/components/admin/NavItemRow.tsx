'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import { moveNavItemAction, setNavItemVisibilityAction, updateNavItemAction } from '~/lib/actions/menus';
import type { MenuFormState } from '~/lib/actions/menus';
import {
  DEFAULT_PAGE_HEADINGS,
  MAX_PAGE_DESCRIPTION_LENGTH,
  MAX_PAGE_TITLE_LENGTH,
  NAV_ITEM_DESTINATIONS,
  hasPageHeading,
  type NavItem,
  type PageHeadingKey,
} from '~/lib/nav-items';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { VisibilitySwitch } from './VisibilitySwitch';

interface NavItemRowProps {
  item: NavItem;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * One top-level header entry. Unlike a post menu it has no slug and can't be
 * deleted — its page is fixed — so hiding it is the switch on the right.
 * Pages with a headline of their own (the bookshelf, the dashboard) also
 * edit that headline and its intro here.
 */
export function NavItemRow({ item, isFirst, isLast }: NavItemRowProps) {
  const [editing, setEditing] = useState(false);
  // Closes only on success, so a rejected save keeps what the owner typed.
  const [state, formAction, pending] = useActionState(
    async (prevState: MenuFormState | undefined, formData: FormData) => {
      const result = await updateNavItemAction(item.key, prevState, formData);
      if (!result.error) setEditing(false);
      return result;
    },
    undefined,
  );
  const headingKey = hasPageHeading(item.key) ? item.key : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

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
        <form onSubmit={handleSubmit} className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              name="label"
              defaultValue={item.label}
              required
              maxLength={20}
              aria-label="메뉴 이름"
              className="w-40"
            />
            {!headingKey && (
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? '저장 중…' : '저장'}
              </Button>
            )}
          </div>
          {headingKey && <PageHeadingFields item={item} headingKey={headingKey} pending={pending} />}
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        </form>
      ) : (
        <div className="min-w-0 flex-1">
          <span className={item.isVisible ? 'font-medium' : 'font-medium text-muted-foreground line-through'}>
            {item.label}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">{NAV_ITEM_DESTINATIONS[item.key]}</span>
          {headingKey && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              제목 · {item.title || DEFAULT_PAGE_HEADINGS[headingKey].title}
            </p>
          )}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-3">
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
          aria-label={editing ? '취소' : `${item.label} 수정`}
        >
          {editing ? <X /> : <Pencil />}
        </Button>
      </div>
    </div>
  );
}

interface PageHeadingFieldsProps {
  item: NavItem;
  headingKey: PageHeadingKey;
  pending: boolean;
}

// The defaults show as placeholders: a field left blank falls back to them.
function PageHeadingFields({ item, headingKey, pending }: PageHeadingFieldsProps) {
  const fallback = DEFAULT_PAGE_HEADINGS[headingKey];
  const titleId = `nav-item-title-${item.key}`;
  const descriptionId = `nav-item-description-${item.key}`;

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={titleId}>페이지 제목</Label>
        <Input
          id={titleId}
          name="title"
          defaultValue={item.title}
          maxLength={MAX_PAGE_TITLE_LENGTH}
          placeholder={fallback.title}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={descriptionId}>페이지 설명</Label>
        <Textarea
          id={descriptionId}
          name="description"
          defaultValue={item.description}
          maxLength={MAX_PAGE_DESCRIPTION_LENGTH}
          placeholder={fallback.description}
          className="min-h-20"
        />
        <p className="text-xs text-muted-foreground">
          비워 두면 기본 문구를 보여요. 줄을 바꾸면 페이지에서도 줄이 바뀌어요.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </>
  );
}
