import { getCurrentUser } from '~/lib/auth';
import { getMenus } from '~/lib/menus';
import { getPublicPosts } from '~/lib/posts';
import { PostListItem } from '~/components/post/PostListItem';

export default async function HomePage() {
  // The post query depends on who's asking, so it can't start before the auth
  // check resolves — the menu list doesn't, so it rides along with it instead
  // of waiting its turn behind both.
  const [user, menus] = await Promise.all([getCurrentUser(), getMenus()]);
  const isOwner = Boolean(user);
  const posts = await getPublicPosts({ includeDrafts: isOwner });
  const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] text-center sm:px-6">
        <p className="text-muted-foreground">아직 공개된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-[var(--space-section)] sm:px-6">
      <h2 className="mb-2 text-xs font-normal tracking-normal text-muted-foreground">최근 글</h2>
      <div>
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
