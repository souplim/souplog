'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import { cn } from '~/lib/utils';
import type { Menu, Post } from '~/lib/supabase/types';
import type { PostFormState } from '~/lib/actions/posts';
import { PostEditorPane } from './PostEditorPane';
import { PostPreviewPane } from './PostPreviewPane';
import { EDITOR_GUTTER_CLASS, NO_MENU_VALUE } from './postEditorStyles';
import { FormActions } from '~/components/form/FormActions';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Site header (4rem) + footer (3.5rem) — the editor fills whatever is left. */
const EDITOR_HEIGHT = 'md:h-[calc(100dvh-4rem-3.5rem)]';

type EditorTab = 'edit' | 'preview';

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
  const [title, setTitle] = useState(post?.title ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [activeTab, setActiveTab] = useState<EditorTab>('edit');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    // Dispatched from onSubmit rather than `action`: React resets a form after
    // every action, failed ones included, which empties the file inputs while
    // the uploaders still list the picked files — a retry then saves none of them.
    <form onSubmit={handleSubmit} className={cn('flex flex-col', EDITOR_HEIGHT)}>
      <input type="hidden" name="menuId" value={menuId === NO_MENU_VALUE ? '' : menuId} />
      <input type="hidden" name="isPublic" value={isPublic ? 'on' : ''} />
      <input type="hidden" name="slug" value="" />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as EditorTab)}
        className={cn('border-b border-border py-2 md:hidden', EDITOR_GUTTER_CLASS)}
      >
        <TabsList>
          <TabsTrigger value="edit">편집</TabsTrigger>
          <TabsTrigger value="preview">미리보기</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid min-h-0 flex-1 md:grid-cols-2">
        <PostEditorPane
          menus={menus}
          menuId={menuId}
          onMenuIdChange={setMenuId}
          isPublic={isPublic}
          onIsPublicChange={setIsPublic}
          title={title}
          onTitleChange={setTitle}
          content={content}
          onContentChange={setContent}
          defaultExcerpt={post?.excerpt}
          images={post?.images ?? []}
          attachments={post?.attachments ?? []}
          createdAt={post?.created_at}
          className={activeTab === 'edit' ? undefined : 'hidden md:flex'}
        />
        <PostPreviewPane content={content} className={activeTab === 'preview' ? undefined : 'hidden md:block'} />
      </div>

      <div className="shrink-0 border-t border-border bg-background/85 backdrop-blur">
        {state?.error && (
          <div className={cn('pt-3', EDITOR_GUTTER_CLASS)}>
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          </div>
        )}

        <FormActions
          cancelHref={cancelHref}
          pending={pending}
          submitLabel={submitLabel}
          className={cn('py-3', EDITOR_GUTTER_CLASS)}
        />
      </div>
    </form>
  );
}
