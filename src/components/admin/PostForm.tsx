'use client';

import { useActionState, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { ImagePlus, X } from 'lucide-react';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import type { Menu, Post } from '~/lib/supabase/types';
import type { PostFormState } from '~/lib/actions/posts';
import { DeletePostButton } from '~/components/post/DeletePostButton';
import { MarkdownEditor } from './MarkdownEditor';
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
  const [coverPreview, setCoverPreview] = useState<string | null>(
    post?.cover_image_path ? getPostImageUrl(post.cover_image_path) : null,
  );
  const [coverRemoved, setCoverRemoved] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
  }

  function handleCoverRemove() {
    setCoverPreview(null);
    setCoverRemoved(true);
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-[var(--page-width)] flex-col">
      <input type="hidden" name="menuId" value={menuId === NO_MENU_VALUE ? '' : menuId} />
      <input type="hidden" name="isPublic" value={isPublic ? 'on' : ''} />
      <input type="hidden" name="existingCoverImagePath" value={coverRemoved ? '' : (post?.cover_image_path ?? '')} />
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

      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-[var(--shadow-card)]">
        {coverPreview ? (
          <>
            {/* Newly picked files are blob: URLs the Next.js optimizer can't serve, so this preview bypasses it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={handleCoverRemove}
              className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-background"
              aria-label="표지 이미지 제거"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <label
            htmlFor="coverImage"
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <ImagePlus className="size-6" />
            <span className="text-sm">표지 이미지 추가</span>
          </label>
        )}
        <input
          ref={coverInputRef}
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="sr-only"
        />
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
