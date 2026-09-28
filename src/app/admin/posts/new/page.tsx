import type { Metadata } from 'next';
import { createPostAction } from '~/lib/actions/posts';
import { getMenus } from '~/lib/menus';
import { PostForm } from '~/components/admin/PostForm';

export const metadata: Metadata = { title: '새 글 작성' };

export default async function NewPostPage() {
  const menus = await getMenus();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl">새 글 작성</h1>
      <PostForm menus={menus} action={createPostAction} submitLabel="작성" />
    </div>
  );
}
