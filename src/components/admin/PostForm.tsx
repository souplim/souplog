'use client';

import { useActionState } from 'react';
import { getPostImageUrl } from '~/lib/images';
import type { Menu, Post } from '~/lib/supabase/types';
import type { PostFormState } from '~/lib/actions/posts';
import { MarkdownEditor } from './MarkdownEditor';
import styles from './PostForm.module.css';

interface PostFormProps {
  menus: Menu[];
  post?: Post;
  action: (prevState: PostFormState | undefined, formData: FormData) => Promise<PostFormState>;
  submitLabel: string;
}

export function PostForm({ menus, post, action, submitLabel }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            제목
          </label>
          <input
            id="title"
            name="title"
            className={styles.input}
            defaultValue={post?.title}
            required
            maxLength={200}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">
            슬러그 (비우면 제목에서 자동 생성)
          </label>
          <input id="slug" name="slug" className={styles.input} defaultValue={post?.slug} maxLength={200} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="menuId">
          메뉴
        </label>
        <select id="menuId" name="menuId" className={styles.select} defaultValue={post?.menu_id ?? ''}>
          <option value="">없음</option>
          {menus.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="excerpt">
          요약 (목록과 공유 미리보기에 쓰입니다)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          className={styles.textarea}
          defaultValue={post?.excerpt}
          rows={2}
          maxLength={300}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="coverImage">
          표지 이미지
        </label>
        {post?.cover_image_path && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-only preview, no need for next/image here
          <img src={getPostImageUrl(post.cover_image_path)} alt="현재 표지" className={styles.coverPreview} />
        )}
        <input type="hidden" name="existingCoverImagePath" value={post?.cover_image_path ?? ''} />
        <input id="coverImage" name="coverImage" type="file" accept="image/*" />
      </div>

      <MarkdownEditor name="content" defaultValue={post?.content ?? ''} />

      <div className={styles.checkboxRow}>
        <input id="isPublic" name="isPublic" type="checkbox" defaultChecked={post?.is_public} />
        <label htmlFor="isPublic">공개</label>
      </div>

      {state?.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? '저장 중…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
