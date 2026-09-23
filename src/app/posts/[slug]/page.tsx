import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import { getMenus } from '~/lib/menus';
import { getPostBySlug } from '~/lib/posts';
import { CommentList } from '~/components/post/CommentList';
import { PostContent } from '~/components/post/PostContent';
import styles from './page.module.css';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  // RLS already returns null for a private post unless the viewer is the
  // owner — if `post` comes back, whoever is asking is allowed to see it, so
  // there's no reason to also gate on `is_public` here (that would only
  // break the owner's own tab title while previewing an unpublished draft).
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: '글을 찾을 수 없습니다' };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_path ? [getPostImageUrl(post.cover_image_path)] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, user] = await Promise.all([getPostBySlug(slug), getCurrentUser()]);

  // RLS already hides other people's private posts (getPostBySlug returns
  // null for them); this is a second line of defense against a page reached
  // through a stale cached link.
  if (!post) notFound();

  const menus = post.menu_id ? await getMenus() : [];
  const menuName = post.menu_id ? menus.find((menu) => menu.id === post.menu_id)?.name : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          {menuName ?? '글'}
          {post.published_at && <> · {formatDate(post.published_at)}</>}
        </p>
        <h1 className={styles.title}>
          {post.title}
          {!post.is_public && <span className={styles.privateBadge}>비공개</span>}
        </h1>
      </header>

      {post.cover_image_path && (
        <div className={styles.cover}>
          <Image src={getPostImageUrl(post.cover_image_path)} alt="" fill sizes="100vw" priority />
        </div>
      )}

      <PostContent content={post.content} />

      {post.is_public && <CommentList postId={post.id} postSlug={post.slug} isOwner={Boolean(user)} />}
    </div>
  );
}
