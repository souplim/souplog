import { getCurrentUser } from '~/lib/auth';
import { getMenus } from '~/lib/menus';
import { getPublicPosts } from '~/lib/posts';
import { PostListItem } from '~/components/post/PostListItem';

export default async function HomePage() {
  const user = await getCurrentUser();
  const isOwner = Boolean(user);
  const [posts, menus] = await Promise.all([getPublicPosts(undefined, { includeDrafts: isOwner }), getMenus()]);
  const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] text-center sm:px-6">
        <p className="text-muted-foreground">아직 공개된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] sm:px-6">
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostListItem
            key={post.id}
            post={post}
            menuName={post.menu_id ? menuNameById.get(post.menu_id) : undefined}
            isOwner={isOwner}
          />
        ))}
      </div>
    </div>
  );
}
