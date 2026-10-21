import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, Paperclip, Pencil } from 'lucide-react';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import type { PostSummary } from '~/lib/supabase/types';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { DeletePostButton } from './DeletePostButton';

/** Two columns from `sm` up, inside the 64rem page container. */
const COVER_SIZES = '(min-width: 40rem) 32rem, 100vw';

interface PostCardProps {
  post: PostSummary;
  menuName?: string;
  isOwner?: boolean;
  /** Set on the first row only — those covers are the page's likely LCP. */
  isPriority?: boolean;
}

/**
 * Every card has a cover box of the same ratio — the post's first photo, or a
 * tinted plane set with the title — so a row of cards lines up
 * whether or not each post has photos.
 */
export function PostCard({ post, menuName, isOwner = false, isPriority = false }: PostCardProps) {
  const href = `/posts/${post.slug}`;
  const hasFooter = isOwner || post.image_count > 0 || post.attachment_count > 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-[var(--duration-fast)] hover:border-border-strong has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring/50">
      <Link href={href} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true" />

      <PostCardCover post={post} isPriority={isPriority} />

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
          {menuName && <span className="font-semibold text-accent-foreground">{menuName}</span>}
          <time className="tabular-nums" dateTime={post.created_at}>
            {formatDate(post.created_at)}
          </time>
          {isOwner && (
            <Badge variant={post.is_public ? 'secondary' : 'outline'}>{post.is_public ? '공개' : '비공개'}</Badge>
          )}
        </div>

        <h3 className="mt-2">
          <Link
            href={href}
            className="relative z-10 line-clamp-2 rounded-xs font-heading text-lg outline-none transition-colors duration-[var(--duration-fast)] group-hover:text-accent-foreground"
          >
            {post.title}
          </Link>
        </h3>

        {post.preview && (
          <p className="mt-2 line-clamp-3 text-sm leading-[1.65] text-muted-foreground">{post.preview}</p>
        )}

        {hasFooter && (
          <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
            <PostCardCount icon={ImageIcon} count={post.image_count} label="사진" unit="장" />
            <PostCardCount icon={Paperclip} count={post.attachment_count} label="첨부 파일" unit="개" />

            {isOwner && (
              <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1">
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
        )}
      </div>
    </article>
  );
}

interface PostCardCoverProps {
  post: PostSummary;
  isPriority: boolean;
}

function PostCardCover({ post, isPriority }: PostCardCoverProps) {
  if (!post.coverImage) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center bg-accent p-6 select-none" aria-hidden="true">
        <p className="line-clamp-3 text-center font-heading text-2xl leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] break-keep text-accent-foreground/70">
          {post.title}
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
      <Image
        src={getPostImageUrl(post.coverImage.path)}
        // The title right below already names the post; the cover adds nothing for a screen reader.
        alt=""
        fill
        sizes={COVER_SIZES}
        className="object-cover transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        loading={isPriority ? 'eager' : 'lazy'}
        fetchPriority={isPriority ? 'high' : 'auto'}
      />
    </div>
  );
}

interface PostCardCountProps {
  icon: typeof ImageIcon;
  count: number;
  label: string;
  unit: string;
}

function PostCardCount({ icon: Icon, count, label, unit }: PostCardCountProps) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      {count}
      <span className="sr-only">{unit}</span>
    </span>
  );
}
