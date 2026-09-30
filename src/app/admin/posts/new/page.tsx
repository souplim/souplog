import type { Metadata } from 'next';
import { createPostAction } from '~/lib/actions/posts';
import { getMenus } from '~/lib/menus';
import { PostForm } from '~/components/admin/PostForm';

export const metadata: Metadata = { title: '새 글 작성' };

export default async function NewPostPage() {
  const menus = await getMenus();

  return <PostForm menus={menus} action={createPostAction} submitLabel="작성" cancelHref="/" />;
}
