'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '~/lib/date';
import type { Menu, Post } from '~/lib/supabase/types';
import type { PostFormState } from '~/lib/actions/posts';
import { DeletePostButton } from '~/components/post/DeletePostButton';
import { MarkdownEditor } from './MarkdownEditor';
import { PostImageUploader } from './PostImageUploader';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Switch } from '~/components/ui/switch';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const NO_MENU_VALUE = 'none';

interface PostFormProps {
  menus: Menu[];
  post?: Post;
  action: (prevState: PostFormState | undefined, formData: FormData) => Promise<PostFormState>;
  submitLabel: string;
  cancelHref: string;
}

export function PostForm({ menus, post, action, submitLabel, cancelHref }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [menuId, setMenuId] = useState(post?.menu_id ?? NO_MENU_VALUE);
  const [isPublic, setIsPublic] = useState(post?.is_public ?? false);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-[var(--page-width)] flex-col">
      <input type="hidden" name="menuId" value={menuId === NO_MENU_VALUE ? '' : menuId} />
      <input type="hidden" name="isPublic" value={isPublic ? 'on' : ''} />
      <input type="hidden" name="slug" value="" />

      <header className="mx-auto mb-8 w-full max-w-[var(--content-width)]">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs tracking-wide text-accent-foreground">
          <div className="flex items-center gap-2">
            <Select value={menuId} onValueChange={setMenuId}>
              <SelectTrigger
                size="sm"
                className="h-auto gap-1 border-none bg-transparent p-0 text-xs font-medium uppercase tracking-wide text-accent-foreground shadow-none hover:bg-transparent focus-visible:ring-0"
              >
                <SelectValue placeholder="메뉴 없음" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_MENU_VALUE}>메뉴 없음</SelectItem>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {post?.published_at && <span>· {formatDate(post.published_at)}</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Switch id="isPublic-toggle" size="sm" checked={isPublic} onCheckedChange={setIsPublic} />
              <Label htmlFor="isPublic-toggle" className="text-xs text-accent-foreground">
                공개
              </Label>
            </div>
            {post && <DeletePostButton postId={post.id} />}
            <Link href={cancelHref} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              취소
            </Link>
          </div>
        </div>

        <Input
          name="title"
          defaultValue={post?.title}
          required
          maxLength={200}
          placeholder="제목을 입력하세요"
          className="h-auto w-full border-none bg-transparent p-0 font-heading text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] leading-tight shadow-none outline-none focus-visible:ring-0"
        />
      </header>

      <div className="mx-auto mb-8 w-full max-w-[var(--content-width)]">
        <PostImageUploader initialImages={post?.images ?? []} />
      </div>

      <div className="mx-auto w-full max-w-[var(--content-width)]">
        <div className="space-y-1.5">
          <Label htmlFor="excerpt" className="text-xs text-muted-foreground">
            요약 (목록과 공유 미리보기에 쓰입니다)
          </Label>
          <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} rows={2} maxLength={300} />
        </div>
      </div>

      <div className="mx-auto mt-6 w-full max-w-[var(--content-width)]">
        <MarkdownEditor name="content" defaultValue={post?.content ?? ''} />
      </div>

      <div className="mx-auto w-full max-w-[var(--content-width)]">
        {state?.error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex items-center justify-end gap-2 border-t border-border pt-6">
          <Button type="submit" disabled={pending}>
            {pending ? '저장 중…' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
