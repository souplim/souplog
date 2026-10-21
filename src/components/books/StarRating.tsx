import { Star } from 'lucide-react';
import { cn } from 'cn';

const MAX_RATING = 5;

interface StarRatingProps {
  rating: number;
  className?: string;
}

/** Read-only stars; the form has its own input. */
export function StarRating({ rating, className }: StarRatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            'size-4',
            index < rating ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-border-strong)]',
          )}
        />
      ))}
    </span>
  );
}
