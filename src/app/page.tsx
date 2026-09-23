import { getMenus } from '~/lib/menus';
import { getPublicPosts } from '~/lib/posts';
import { PostHero } from '~/components/post/PostHero';
import { PostListItem } from '~/components/post/PostListItem';
import styles from './page.module.css';

export default async function HomePage() {
  const [posts, menus] = await Promise.all([getPublicPosts(), getMenus()]);
  const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));

  if (posts.length === 0) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>아직 공개된 글이 없습니다.</p>
      </div>
    );
  }

  const [latest, ...rest] = posts;

  return (
    <div className={styles.page}>
      <PostHero post={latest} menuName={latest.menu_id ? menuNameById.get(latest.menu_id) : undefined} />
      {rest.length > 0 && (
        <div className={styles.list}>
          {rest.map((post) => (
            <PostListItem key={post.id} post={post} menuName={post.menu_id ? menuNameById.get(post.menu_id) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
