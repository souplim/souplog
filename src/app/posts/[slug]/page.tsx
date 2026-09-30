import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import { getMenus } from '~/lib/menus';
import { getPostBySlug } from '~/lib/posts';
import { CommentList } from '~/components/post/CommentList';
import { DeletePostButton } from '~/components/post/DeletePostButton';
import { PostContent } from '~/components/post/PostContent';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

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
    // 4rem/3.5rem subtract Header's h-16 and Footer's h-14 so short posts still fill the viewport without stretching <main> itself.
    <div className="mx-auto flex min-h-[calc(100dvh-4rem-3.5rem)] max-w-[var(--page-width)] flex-col px-4 py-[var(--space-xl)] sm:px-6">
      <header className="mx-auto mb-8 max-w-[var(--content-width)]">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs tracking-wide text-accent-foreground">
          <div className="flex items-center gap-2">
            <span className="uppercase">{menuName ?? '글'}</span>
            {post.published_at && <span>· {formatDate(post.published_at)}</span>}
          </div>

          {user && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" asChild>
                <Link href={`/admin/posts/${post.id}/edit`} aria-label="수정">
                  <Pencil />
                </Link>
              </Button>
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>
        <h1 className="font-heading text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] leading-tight">
          {post.title}
          {user && (
            <Badge variant={post.is_public ? 'secondary' : 'outline'} className="ml-3 align-middle">
              {post.is_public ? '공개' : '비공개'}
            </Badge>
          )}
        </h1>
      </header>

      {post.cover_image_path && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-xl shadow-[var(--shadow-card)]">
          <Image
            src={getPostImageUrl(post.cover_image_path)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-[var(--content-width)]">
        <PostContent content={post.content} />
      </div>

      {post.is_public && (
        <div className="mx-auto mt-auto w-full max-w-[var(--content-width)]">
          <CommentList postId={post.id} postSlug={post.slug} isOwner={Boolean(user)} />
        </div>
      )}
    </div>
  );
}
