import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import type { Post } from '~/lib/supabase/types';
import styles from './PostHero.module.css';

interface PostHeroProps {
  post: Post;
  menuName?: string;
}

export function PostHero({ post, menuName }: PostHeroProps) {
  return (
    <article className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>
          {menuName ?? '최신 글'}
          {post.published_at && <span>· {formatDate(post.published_at)}</span>}
        </p>
        <h2>
          <Link href={`/posts/${post.slug}`} className={styles.title}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
      </div>
      {post.cover_image_path && (
        <div className={styles.imageWrap}>
          <Image
            src={getPostImageUrl(post.cover_image_path)}
            alt=""
            fill
            sizes="(max-width: 56rem) 100vw, 40vw"
            priority
          />
        </div>
      )}
    </article>
  );
}
