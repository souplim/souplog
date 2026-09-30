import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import { getMenus } from '~/lib/menus';
import { getPostBySlug } from '~/lib/posts';
import { decodeSlugParam } from '~/lib/slugify';
import { CommentList } from '~/components/post/CommentList';
import { DeletePostButton } from '~/components/post/DeletePostButton';
import { PostContent } from '~/components/post/PostContent';
import { PostGallery } from '~/components/post/PostGallery';
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
  const post = await getPostBySlug(decodeSlugParam(slug));

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
      images: post.images.length > 0 ? post.images.map((image) => getPostImageUrl(image.path)) : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, user] = await Promise.all([getPostBySlug(decodeSlugParam(slug)), getCurrentUser()]);

  // RLS already hides other people's private posts (getPostBySlug returns
  // null for them); this is a second line of defense against a page reached
  // through a stale cached link.
  if (!post) notFound();

  const menus = post.menu_id ? await getMenus() : [];
  const menuName = post.menu_id ? menus.find((menu) => menu.id === post.menu_id)?.name : undefined;

  return (
    // 4rem/3.5rem subtract Header's h-16 and Footer's h-14 so short posts still fill the viewport without stretching <main> itself.
    <div className="mx-auto flex min-h-[calc(100dvh-4rem-3.5rem)] max-w-[var(--page-width)] flex-col px-4 py-[var(--space-xl)] sm:px-6">
      {/* w-full: mx-auto cancels the flex parent's stretch, so without it the
          header shrinks to fit the title and no longer lines up with the body. */}
      <header className="mx-auto mb-8 w-full max-w-[var(--content-width)]">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-accent-foreground">
          <span>{menuName ?? '글'}</span>
        </div>
        <h1 className="font-heading text-[clamp(2rem,1.5rem+2.5vw,3.5rem)] leading-tight">
          {post.title}
        </h1>

        {/* Naver-blog style byline: date and visibility under the title, owner actions flush right. */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs tracking-wide text-accent-foreground">
            {/* A draft has no published_at yet — fall back to when it was written. */}
            <span>{formatDate(post.published_at ?? post.created_at)}</span>
            {user && (
              <Badge variant={post.is_public ? 'secondary' : 'outline'}>
                {post.is_public ? '공개' : '비공개'}
              </Badge>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Pencil />
                  수정
                </Link>
              </Button>
              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>
      </header>

      {post.images.length > 0 && (
        <div className="mx-auto mb-8 w-full max-w-[var(--content-width)]">
          <PostGallery images={post.images} title={post.title} />
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
