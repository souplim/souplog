import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { updatePostAction } from '~/lib/actions/posts';
import { getMenus } from '~/lib/menus';
import { getPostById } from '~/lib/posts';
import { PostForm } from '~/components/admin/PostForm';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: '글 수정' };

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post, menus] = await Promise.all([getPostById(id), getMenus()]);

  if (!post) notFound();

  return (
    <PostForm
      menus={menus}
      post={post}
      action={updatePostAction.bind(null, id)}
      submitLabel="저장"
      cancelHref={`/posts/${post.slug}`}
    />
  );
}
