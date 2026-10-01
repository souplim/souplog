'use client';

import { formatDate } from '~/lib/date';
import { cn } from '~/lib/utils';
import type { PostImage } from '~/lib/images';
import type { Menu } from '~/lib/supabase/types';
import { PostImageUploader } from './PostImageUploader';
import { EDITOR_PANE_PADDING, EDITOR_TITLE_CLASS, NO_MENU_VALUE } from './postEditorStyles';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Switch } from '~/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

interface PostEditorPaneProps {
  menus: Menu[];
  menuId: string;
  onMenuIdChange: (value: string) => void;
  isPublic: boolean;
  onIsPublicChange: (value: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  defaultExcerpt?: string;
  images: PostImage[];
  publishedAt?: string | null;
  className?: string;
}

/**
 * The writing surface: title, a bare content field, and the post's settings
 * tucked below the fold so the top of the pane is nothing but the text.
 */
export function PostEditorPane({
  menus,
  menuId,
  onMenuIdChange,
  isPublic,
  onIsPublicChange,
  title,
  onTitleChange,
  content,
  onContentChange,
  defaultExcerpt,
  images,
  publishedAt,
  className,
}: PostEditorPaneProps) {
  return (
    <section
      className={cn('flex min-h-0 flex-col overflow-y-auto', EDITOR_PANE_PADDING, className)}
    >
      <Input
        name="title"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        required
        maxLength={200}
        placeholder="제목을 입력하세요"
        className={cn(
          EDITOR_TITLE_CLASS,
          'h-auto w-full border-none bg-transparent p-0 shadow-none outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0 dark:bg-transparent',
        )}
      />

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <Select value={menuId} onValueChange={onMenuIdChange}>
          <SelectTrigger
            size="sm"
            className="h-auto gap-1 border-none bg-transparent p-0 text-xs font-semibold text-accent-foreground shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
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

        {publishedAt && <span>{formatDate(publishedAt)}</span>}

        <div className="ml-auto flex items-center gap-1.5">
          <Switch id="isPublic-toggle" size="sm" checked={isPublic} onCheckedChange={onIsPublicChange} />
          <Label htmlFor="isPublic-toggle" className="text-xs text-muted-foreground">
            공개
          </Label>
        </div>
      </div>

      <Textarea
        id="content"
        name="content"
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="당신의 이야기를 마크다운으로 적어보세요…"
        className="mt-6 min-h-[20rem] flex-1 resize-none border-none bg-transparent p-0 font-mono text-sm leading-[var(--leading-relaxed)] shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 md:text-sm dark:bg-transparent"
      />

      <div className="mt-10 space-y-5 border-t border-border/60 pt-6">
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">사진</span>
          <PostImageUploader initialImages={images} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="excerpt" className="text-xs font-medium text-muted-foreground">
            요약 (목록과 공유 미리보기에 쓰입니다)
          </Label>
          <Textarea id="excerpt" name="excerpt" defaultValue={defaultExcerpt} rows={2} maxLength={300} className="text-sm" />
        </div>
      </div>
    </section>
  );
}
