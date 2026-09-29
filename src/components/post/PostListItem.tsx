import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  return (
    <article className="group relative -mx-4 rounded-xl transition-colors duration-300 ease-out sm:-mx-5">
      <span
        aria-hidden="true"
        className="absolute inset-y-2 left-0 w-0.5 origin-top scale-y-0 rounded-full bg-accent-foreground transition-transform duration-300 ease-out group-hover:scale-y-100"
      />
      <div className="rounded-xl px-4 py-6 transition-[background-color,box-shadow,transform] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:bg-card group-hover:shadow-[var(--shadow-card)] group-active:translate-y-0 group-active:duration-100 sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <time className="font-mono tabular-nums" dateTime={post.published_at ?? undefined}>
            {post.published_at ? formatDate(post.published_at) : '미발행'}
          </time>
          {menuName && (
            <Badge className="border-transparent bg-accent text-accent-foreground">{menuName}</Badge>
          )}
          {isOwner && (
            <Badge variant={post.is_public ? 'secondary' : 'outline'}>
              {post.is_public ? '공개' : '비공개'}
            </Badge>
          )}
        </div>

        <h3 className="mt-2">
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-baseline gap-1.5 rounded-xs font-heading text-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,color] duration-300 ease-out group-hover:bg-[length:100%_1px] group-hover:text-accent-foreground">
              {post.title}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 -translate-x-1 text-accent-foreground opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
            />
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-muted-foreground">{post.excerpt}</p>
        )}

        {isOwner && (
          <div className="mt-3 flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/posts/${post.id}/edit`}>수정</Link>
            </Button>
            <DeletePostButton postId={post.id} />
          </div>
        )}
      </div>
    </article>
  );
}
