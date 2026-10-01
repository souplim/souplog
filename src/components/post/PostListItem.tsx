import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { formatDate } from '~/lib/date';
import type { Post } from '~/lib/supabase/types';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { DeletePostButton } from './DeletePostButton';

interface PostListItemProps {
  post: Post;
  menuName?: string;
  isOwner?: boolean;
}

export function PostListItem({ post, menuName, isOwner = false }: PostListItemProps) {
  // A draft has no `published_at` yet, so it falls back to when it was written
  // — the owner-only 공개/비공개 badge already says whether it's published, and
  // a row with no date at all just reads as broken.
  const date = post.published_at ?? post.created_at;

  return (
    <article className="group relative border-b border-border py-6">
      <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true" />

      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
            {menuName && <span className="font-semibold text-accent-foreground">{menuName}</span>}
            <time className="tabular-nums" dateTime={date}>
              {formatDate(date)}
            </time>
            {isOwner && (
              <Badge variant={post.is_public ? 'secondary' : 'outline'}>{post.is_public ? '공개' : '비공개'}</Badge>
            )}
          </div>

          <h3 className="mt-1.5">
            <Link
              href={`/posts/${post.slug}`}
              className="relative z-10 inline-block rounded-xs font-heading text-lg outline-none transition-colors duration-[var(--duration-fast)] group-hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {post.title}
            </Link>
          </h3>

          {post.excerpt && <p className="mt-1.5 line-clamp-2 text-sm leading-[1.65] text-muted-foreground">{post.excerpt}</p>}
        </div>

        {isOwner && (
          <div className="relative z-10 flex shrink-0 items-center gap-1">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/posts/${post.id}/edit`}>
                <Pencil />
                수정
              </Link>
            </Button>
            <DeletePostButton postId={post.id} />
          </div>
        )}
      </div>
    </article>
  );
}
