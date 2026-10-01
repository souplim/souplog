import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import { getMenus } from '~/lib/menus';
import { getPublicPosts } from '~/lib/posts';
import { PostListItem } from '~/components/post/PostListItem';

interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const menus = await getMenus();
  return { title: menus.find((menu) => menu.slug === slug)?.name ?? '메뉴' };
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  // `getMenus` is the Header's request-cached call, so this resolves off work
  // that's already in flight; only the auth check is genuinely new here.
  const [menus, user] = await Promise.all([getMenus(), getCurrentUser()]);

  const menu = menus.find((item) => item.slug === slug);
  if (!menu) notFound();

  const isOwner = Boolean(user);
  const posts = await getPublicPosts({ menuId: menu.id, includeDrafts: isOwner });

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] sm:px-6">
      {posts.length === 0 ? (
        <p className="text-muted-foreground">이 메뉴에는 아직 공개된 글이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  );
}
