import type { ComponentProps } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '~/components/ui/button';

type IconSize = 'icon-xs' | 'icon-sm';

/**
 * Owner-only edit/delete controls share one look everywhere: borderless, icon-only,
 * muted until hovered. Delete turns red only on hover so it never shouts at rest.
 */
export function EditIconLink({ href, size = 'icon-sm' }: { href: string; size?: IconSize }) {
  return (
    <Button variant="ghost" size={size} asChild>
      <Link href={href} aria-label="수정" title="수정">
        <Pencil />
      </Link>
    </Button>
  );
}

interface DeleteIconButtonProps extends Omit<ComponentProps<typeof Button>, 'variant' | 'size' | 'children'> {
  size?: IconSize;
}

export function DeleteIconButton({
  size = 'icon-sm',
  className,
  'aria-label': ariaLabel = '삭제',
  ...props
}: DeleteIconButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn('hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15', className)}
      {...props}
    >
      <Trash2 />
    </Button>
  );
}
