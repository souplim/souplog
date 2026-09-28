import { getMenus } from '~/lib/menus';
import { getPublicPosts } from '~/lib/posts';
import { PostHero } from '~/components/post/PostHero';
import { PostListItem } from '~/components/post/PostListItem';

export default async function HomePage() {
  const [posts, menus] = await Promise.all([getPublicPosts(), getMenus()]);
  const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] text-center sm:px-6">
        <p className="text-muted-foreground">아직 공개된 글이 없습니다.</p>
      </div>
    );
  }

  const [latest, ...rest] = posts;

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] sm:px-6">
      <PostHero post={latest} menuName={latest.menu_id ? menuNameById.get(latest.menu_id) : undefined} />
      {rest.length > 0 && (
        <div className="mt-[var(--space-xl)] divide-y divide-border">
          {rest.map((post) => (
            <PostListItem key={post.id} post={post} menuName={post.menu_id ? menuNameById.get(post.menu_id) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
