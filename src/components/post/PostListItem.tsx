import Link from 'next/link';
import { formatDate } from '~/lib/date';
import type { Post } from '~/lib/supabase/types';
import styles from './PostListItem.module.css';

interface PostListItemProps {
  post: Post;
  menuName?: string;
}

export function PostListItem({ post, menuName }: PostListItemProps) {
  return (
    <article className={styles.item}>
      <time className={styles.date} dateTime={post.published_at ?? undefined}>
        {post.published_at ? formatDate(post.published_at) : '미발행'}
      </time>
      <div>
        <h3>
          <Link href={`/posts/${post.slug}`} className={styles.title}>
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
        {menuName && <span className={styles.tag}>{menuName}</span>}
      </div>
    </article>
  );
}
