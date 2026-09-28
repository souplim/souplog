'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import { getPostImageUrl } from '~/lib/images';
import type { Menu, Post } from '~/lib/supabase/types';
import type { PostFormState } from '~/lib/actions/posts';
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
}

export function PostForm({ menus, post, action, submitLabel }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [menuId, setMenuId] = useState(post?.menu_id ?? NO_MENU_VALUE);
  const [isPublic, setIsPublic] = useState(post?.is_public ?? false);

  return (
    <form action={formAction} className="max-w-4xl space-y-6">
      <input type="hidden" name="menuId" value={menuId === NO_MENU_VALUE ? '' : menuId} />
      <input type="hidden" name="isPublic" value={isPublic ? 'on' : ''} />

      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="title">제목</Label>
          <Input id="title" name="title" defaultValue={post?.title} required maxLength={200} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">슬러그 (비우면 제목에서 자동 생성)</Label>
          <Input id="slug" name="slug" defaultValue={post?.slug} maxLength={200} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="menu-trigger">메뉴</Label>
        <Select value={menuId} onValueChange={setMenuId}>
          <SelectTrigger id="menu-trigger" className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_MENU_VALUE}>없음</SelectItem>
            {menus.map((menu) => (
              <SelectItem key={menu.id} value={menu.id}>
                {menu.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">요약 (목록과 공유 미리보기에 쓰입니다)</Label>
        <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} rows={2} maxLength={300} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="coverImage">표지 이미지</Label>
        {post?.cover_image_path && (
          <div className="relative mb-2 aspect-video w-48 overflow-hidden rounded-lg ring-1 ring-foreground/10">
            <Image src={getPostImageUrl(post.cover_image_path)} alt="현재 표지" fill className="object-cover" />
          </div>
        )}
        <input type="hidden" name="existingCoverImagePath" value={post?.cover_image_path ?? ''} />
        <Input id="coverImage" name="coverImage" type="file" accept="image/*" className="h-auto py-1.5" />
      </div>

      <MarkdownEditor name="content" defaultValue={post?.content ?? ''} />

      <div className="flex items-center gap-2">
        <Switch id="isPublic-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="isPublic-toggle">공개</Label>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? '저장 중…' : submitLabel}
      </Button>
    </form>
  );
}
