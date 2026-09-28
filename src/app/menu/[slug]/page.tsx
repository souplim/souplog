import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMenuBySlug } from '~/lib/menus';
import { getPublicPosts } from '~/lib/posts';
import { PostListItem } from '~/components/post/PostListItem';

interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getMenuBySlug(slug);
  return { title: menu?.name ?? '메뉴' };
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  const menu = await getMenuBySlug(slug);
  if (!menu) notFound();

  const posts = await getPublicPosts(slug);

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] sm:px-6">
      <h1 className="font-heading text-3xl">{menu.name}</h1>
      {posts.length === 0 ? (
        <p className="mt-8 text-muted-foreground">이 메뉴에는 아직 공개된 글이 없습니다.</p>
      ) : (
        <div className="mt-8 divide-y divide-border">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
